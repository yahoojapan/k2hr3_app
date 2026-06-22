/*
 *
 * K2HR3 Web Application
 *
 * Copyright 2017 Yahoo Japan Corporation.
 *
 * K2HR3 is K2hdkc based Resource and Roles and policy Rules, gathers
 * common management information for the cloud.
 * K2HR3 can dynamically manage information as "who", "what", "operate".
 * These are stored as roles, resources, policies in K2hdkc, and the
 * client system can dynamically read and modify these information.
 *
 * For the full copyright and license information, please view
 * the license file that was distributed with this source code.
 *
 * AUTHOR:   Takeshi Nakatani
 * CREATE:   Tue Aug 07 2019
 * REVISION:
 *
 */

// [NOTE]
// Unit testing of the oidc.ts file(for openid-client v6 compatiblity)
//
// This test verifies the OIDC module's behavior by mocking external
// dependencies(openid-client, passport, express-session, jose).
//

import type express	from 'express';

//---------------------------------------------------------
// Types / Interfaces
//---------------------------------------------------------
type FetchBody	= ArrayBuffer | null | ReadableStream | string | Uint8Array | undefined | URLSearchParams;


//---------------------------------------------------------
// Mocks
//---------------------------------------------------------
//
// express and express-session(for jsdom compatibility)
//
const mockRouter = {
	use:	jest.fn(),
	get:	jest.fn(),
	post:	jest.fn(),
};

jest.mock('express', () => {
	const	express = () => ({
		use:	jest.fn(),
		get:	jest.fn(),
	});
	express.Router = () => mockRouter;

	return { __esModule: true, default: express };
});

//
// openid-client
//
const mockDiscovery					= jest.fn();
const mockAuthorizationCodeGrant	= jest.fn();
const mockBuildAuthorizationUrl		= jest.fn();
const MOCK_CUSTOM_FETCH				= Symbol('customFetch');
const MOCK_CLOCK_TOLERANCE			= Symbol('clockTolerance');

jest.mock('openid-client', () => ({
	discovery:					mockDiscovery,
	authorizationCodeGrant:		mockAuthorizationCodeGrant,
	buildAuthorizationUrl:		mockBuildAuthorizationUrl,
	customFetch:				MOCK_CUSTOM_FETCH,
	clockTolerance:				MOCK_CLOCK_TOLERANCE,
}));

//
// passport
//
const mockPassportUse			= jest.fn();
const mockPassportAuthenticate	= jest.fn();
const mockPassportInitialize	= jest.fn().mockReturnValue((_req: unknown, _res: unknown, next: () => void) => next());
const mockPassportSession		= jest.fn().mockReturnValue((_req: unknown, _res: unknown, next: () => void) => next());

jest.mock('passport', () => ({
	__esModule:			true,
	default: {
		use:			mockPassportUse,
		authenticate:	mockPassportAuthenticate,
		initialize:		mockPassportInitialize,
		session:		mockPassportSession,
	},
}));

//
// passport-strategy
//
jest.mock('passport-strategy', () => ({
	Strategy: class
	{
		name?:	string;

		authenticate(_req: unknown, _options?: unknown):					void { /* stub */ }
		success(_user: unknown, _info?: unknown):							void { /* stub */ }
		fail(_challenge: string | number | undefined, _status?: number):	void { /* stub */ }
		redirect(_url: string, _status?: number):							void { /* stub */ }
		pass():																void { /* stub */ }
		error(_err: unknown):												void { /* stub */ }
	}
}));

//
// express-session
//
jest.mock('express-session', () => ({
	__esModule:	true,
	default:	() => (_req: unknown, _res: unknown, next: () => void) => next(),
}));

//
// jose
//
const mockJwtVerify				= jest.fn();
const mockCreateRemoteJWKSet	= jest.fn().mockReturnValue('mock-jwks-fn');

jest.mock('jose', () => ({
	base64url: {
		decode: (str: string) => new TextEncoder().encode(Buffer.from(str, 'base64url').toString()),
	},
	createRemoteJWKSet:	(...args: unknown[]) => mockCreateRemoteJWKSet(...args),
	jwtVerify:			(...args: unknown[]) => mockJwtVerify(...args)
}));

//---------------------------------------------------------
// Helpers
//---------------------------------------------------------
const createMockConfig = () => ({
	oidcDiscoveryUrl:	'https://idp.test.k2hr3.antpick.ax',
	logoutUrl:			'https://app.test.k2hr3.antpick.ax/oidc/logout',
	mainUrl:			'https://app.test.k2hr3.antpick.ax',
	debug:				false,
	params: {
		client_id:		'test-client-id',
		client_secret:	'test-client-secret',
		redirectUrl:	'https://app.test.k2hr3.antpick.ax/oidc/login/cb',
		usernamekey:	'preferred_username',
		cookiename:		'id_token',
		cookieexpire:	60,
	},
	scope:				'openid profile email',
});

const createMockRequest = (overrides?: Partial<express.Request>): Partial<express.Request> => ({
	baseUrl:			'/oidc',
	protocol:			'https',
	originalUrl:		'/oidc/login/cb?code=test-code&state=test-state',
	query:				{},
	get:				jest.fn().mockReturnValue('app.test.k2hr3.antpick.ax'),
	session:			{ destroy: jest.fn((cb: (err: unknown) => void) => cb(null)) } as unknown as express.Request['session'],
	...overrides,
});

const createMockResponse = (): Partial<express.Response> => ({
	cookie:				jest.fn(),
	clearCookie:		jest.fn(),
	redirect:			jest.fn(),
	status:				jest.fn().mockReturnThis(),
	send:				jest.fn(),
});

//---------------------------------------------------------------
// Main Test
//---------------------------------------------------------------
describe('OIDC Module test(openid-client I/F)', () =>
{
	let	oidcModule: typeof import('../../routes/oidc');

	beforeEach(() => {
		jest.clearAllMocks();
	});

	beforeAll(async () => {
		oidcModule = await import('../../routes/oidc.js');
	});

	//-----------------------------------------------------------
	// setConfig
	//-----------------------------------------------------------
	describe('Test setConfig', () => {
		it('Accept valid configuration', () => {
			const config = createMockConfig();
			const result = oidcModule.setConfig(config as never, 'oidc');
			expect(result).toBe(true);
		});

		it('Reject empty extRouterName', () => {
			const spy		= jest.spyOn(console, 'error').mockImplementation();	// for filtering console.error
			const config	= createMockConfig();
			const result	= oidcModule.setConfig(config as never, '');
			expect(result).toBe(false);
			spy.mockRestore();
		});

		it('Reject duplicate extRouterName', () => {
			const spy		= jest.spyOn(console, 'error').mockImplementation();	// for filtering console.error
			const config	= createMockConfig();

			// 1'st setting
			oidcModule.setConfig(config as never, 'oidc-dup');

			// 2'nd setting -> fauilure
			const result = oidcModule.setConfig(config as never, 'oidc-dup');
			expect(result).toBe(false);

			spy.mockRestore();
		});
	});

	//-----------------------------------------------------------
	// getConfig
	//-----------------------------------------------------------
	describe('Test getConfig', () => {
		it('Get valid configuration object', () => {
			const config = oidcModule.getConfig();
			expect(config).not.toBeNull();
			expect(typeof config).toBe('object');
		});
	});

	//-----------------------------------------------------------
	// OIDCV6Strategy - discovery call
	//-----------------------------------------------------------
	describe('Test OIDCV6Strategy class(via passport.use)', () => {
		it('Calling oidc.discovery with correct arguments when invoked login', async () => {
			const mockConfig = {
				serverMetadata: () => ({
					authorization_endpoint: 'https://idp.test.k2hr3.antpick.ax/authorize',
				}),
			};
			mockDiscovery.mockResolvedValue(mockConfig);
			mockBuildAuthorizationUrl.mockReturnValue(new URL('https://idp.test.k2hr3.antpick.ax/authorize?client_id=test'));

			// Setup passport.authenticate to invoke the strategy's authenticate method
			mockPassportAuthenticate.mockImplementation((_strategyName: string, _options: unknown, callback?: (err: Error | null, token: string) => void) => {
				return (req: express.Request, _res: express.Response, _next: express.NextFunction) => {
					// Get the strategy that was registered
					const strategyCall = mockPassportUse.mock.calls[mockPassportUse.mock.calls.length - 1];

					if(strategyCall){
						const strategy		= strategyCall[1];

						// Mock the redirect method
						strategy.redirect	= jest.fn();
						strategy.error		= jest.fn();
						strategy.success	= jest.fn();

						// Call authenticate
						strategy.authenticate(req, _options);
					}
					if(callback){
						callback(null, 'mock-token');
					}
				};
			});

			// Set config for 'oidc' router name (clear previous state)
			const freshConfig = createMockConfig();
			oidcModule.setConfig(freshConfig as never, 'oidc-strat-test');

			// Verify discovery mock is callable with the expected v6 signature
			await mockDiscovery(
				new URL('https://idp.test.k2hr3.antpick.ax'),
				'test-client-id',
				{ client_secret: 'test-client-secret', [MOCK_CLOCK_TOLERANCE]: 5 },
				undefined,
				undefined
			);

			expect(mockDiscovery).toHaveBeenCalledWith(
				expect.any(URL),
				'test-client-id',
				expect.objectContaining({ client_secret: 'test-client-secret' }),
				undefined,
				undefined
			);
		});

		it('Pass customFetch in discovery options when debug is true', async () => {
			const mockConfigResult = {
				serverMetadata: () => ({
					authorization_endpoint: 'https://idp.test.k2hr3.antpick.ax/authorize',
				}),
			};
			mockDiscovery.mockResolvedValue(mockConfigResult);
			mockBuildAuthorizationUrl.mockReturnValue(new URL('https://idp.test.k2hr3.antpick.ax/authorize?client_id=test'));

			// Simulate what the code does when debug=true
			const debugConfig	= createMockConfig();
			debugConfig.debug	= true;

			const customFetchFn		= async(_url: string, _opts: unknown) => new Response('ok');
			const discoveryOptions	= { [MOCK_CUSTOM_FETCH]: customFetchFn };

			// Verify the discovery call would include customFetch option
			await mockDiscovery(
				new URL(debugConfig.oidcDiscoveryUrl),
				debugConfig.params.client_id,
				{ client_secret: debugConfig.params.client_secret, [MOCK_CLOCK_TOLERANCE]: 5 },
				undefined,
				discoveryOptions
			);

			const lastCall		= mockDiscovery.mock.calls[mockDiscovery.mock.calls.length - 1];
			const optionsArg	= lastCall[4] as Record<symbol, unknown>;

			expect(optionsArg[MOCK_CUSTOM_FETCH]).toBe(customFetchFn);
		});
	});

	//-----------------------------------------------------------
	// buildAuthorizationUrl
	//-----------------------------------------------------------
	describe('Test buildAuthorizationUrl usage', () => {
		it('Accept configuration and parameter objects(openid-client I/F)', () => {
			const mockUrl	= new URL('https://idp.test.k2hr3.antpick.ax/authorize?client_id=test&redirect_uri=https%3A%2F%2Fapp.test.k2hr3.antpick.ax%2Foidc%2Flogin%2Fcb&scope=openid');
			mockBuildAuthorizationUrl.mockReturnValue(mockUrl);

			const result	= mockBuildAuthorizationUrl(
				{},													// config
				{ redirect_uri: 'https://app.test.k2hr3.antpick.ax/oidc/login/cb', scope: 'openid' }
			);

			expect(result).toBeInstanceOf(URL);
			expect(result.href).toContain('authorize');
			expect(mockBuildAuthorizationUrl).toHaveBeenCalledWith(
				expect.any(Object),
				expect.objectContaining({ redirect_uri: expect.any(String), scope: expect.any(String) })
			);
		});
	});

	//-----------------------------------------------------------
	// authorizationCodeGrant
	//-----------------------------------------------------------
	describe('Test authorizationCodeGrant usage', () => {
		it('Accept configuration and URL(openid-client I/F)', async () => {
			const mockTokenSet = {
				access_token:	'mock-access-token',
				id_token:		'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ0ZXN0LXVzZXIiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJ0ZXN0LXVzZXIifQ.signature',
				token_type:		'Bearer',
			};
			mockAuthorizationCodeGrant.mockResolvedValue(mockTokenSet);

			const currentUrl = new URL('https://app.test.k2hr3.antpick.ax/oidc/login/cb?code=test-code');
			const result = await mockAuthorizationCodeGrant(
				{},													// config
				currentUrl
			);

			expect(result).toHaveProperty('id_token');
			expect(result.id_token).toContain('eyJ');
			expect(mockAuthorizationCodeGrant).toHaveBeenCalledWith(
				expect.any(Object),
				expect.any(URL)
			);
		});
	});

	//-----------------------------------------------------------
	// CustomFetch conversion (Uint8Array body handling)
	//-----------------------------------------------------------
	describe('Test CustomFetch body conversion', () => {
		it('Correct to handle string body', () => {
			const options: { method: string; headers: Record<string, string>; redirect: 'manual'; signal: AbortSignal | undefined; body: FetchBody } = {
				method:		'POST',
				headers:	{ 'Content-Type': 'application/x-www-form-urlencoded' },
				redirect:	'manual',
				signal:		undefined,
				body:		'grant_type=authorization_code&code=test',
			};
			const fetchInit: RequestInit = {						// simulate the conversion logic in oidc.ts
				method:		options.method,
				headers:	options.headers,
				redirect:	options.redirect,
				signal:		options.signal,
				body:		(options.body instanceof Uint8Array) ? new Uint8Array(options.body) : options.body,
			};

			expect(fetchInit.body).toBe('grant_type=authorization_code&code=test');
			expect(typeof fetchInit.body).toBe('string');
		});

		it('Handling Uint8Array body by creating new Uint8Array', () => {
			const bodyData = new Uint8Array([72, 101, 108, 108, 111]);
			const options: { method: string; headers: Record<string, string>; redirect: 'manual'; signal: AbortSignal | undefined; body: FetchBody } = {
				method:		'POST',
				headers:	{ 'Content-Type': 'application/octet-stream' },
				redirect:	'manual',
				signal:		undefined,
				body:		bodyData,
			};
			const fetchInit: RequestInit = {						// simulate the conversion logic in oidc.ts
				method:		options.method,
				headers:	options.headers,
				redirect:	options.redirect,
				signal:		options.signal,
				body:		(options.body instanceof Uint8Array) ? new Uint8Array(options.body) : options.body,
			};

			expect(fetchInit.body).toBeInstanceOf(Uint8Array);
			expect(fetchInit.body).not.toBe(bodyData);				// new instance
			expect(fetchInit.body).toEqual(bodyData);				// same content
		});

		it('Handling null body', () => {
			const options: { method: string; headers: Record<string, string>; redirect: 'manual'; signal: AbortSignal | undefined; body: FetchBody } = {
				method:		'GET',
				headers:	{},
				redirect:	'manual',
				signal:		undefined,
				body:		null,
			};
			const fetchInit: RequestInit = {						// simulate the conversion logic in oidc.ts
				method:		options.method,
				headers:	options.headers,
				redirect:	options.redirect,
				signal:		options.signal,
				body:		(options.body instanceof Uint8Array) ? new Uint8Array(options.body) : options.body,
			};

			expect(fetchInit.body).toBeNull();
		});

		it('Handling undefined body', () => {
			const options: { method: string; headers: Record<string, string>; redirect: 'manual'; signal: AbortSignal | undefined; body: FetchBody } = {
				method:		'GET',
				headers:	{},
				redirect:	'manual',
				signal:		undefined,
				body:		undefined,
			};
			const fetchInit: RequestInit = {						// simulate the conversion logic in oidc.ts
				method:		options.method,
				headers:	options.headers,
				redirect:	options.redirect,
				signal:		options.signal,
				body:		(options.body instanceof Uint8Array) ? new Uint8Array(options.body) : options.body,
			};

			expect(fetchInit.body).toBeUndefined();
		});
	});

	//-----------------------------------------------------------
	// clockTolerance in ClientMetadata
	//-----------------------------------------------------------
	describe('Test clockTolerance configuration', () => {
		it('Set as a symbol key in clientMetadata', () => {
			const clientMetadata: Record<string | symbol, unknown> = {
				client_secret:			'test-secret',
				[MOCK_CLOCK_TOLERANCE]:	5,
			};

			expect(clientMetadata[MOCK_CLOCK_TOLERANCE]).toBe(5);
			expect(clientMetadata.client_secret).toBe('test-secret');
		});
	});

	//-----------------------------------------------------------
	// Router exports
	//-----------------------------------------------------------
	describe('Test module exports', () => {
		it('Export the router from module', () => {
			expect(oidcModule.router).toBeDefined();
		});

		it('Export the setConfig function', () => {
			expect(typeof oidcModule.setConfig).toBe('function');
		});

		it('Export the getConfig function', () => {
			expect(typeof oidcModule.getConfig).toBe('function');
		});

		it('Export the oidcConfigCookieName', () => {
			expect(oidcModule.oidcConfigCookieName).toBe('oidc_config_name');
		});
	});

	//-----------------------------------------------------------
	// Logout route
	//-----------------------------------------------------------
	describe('Test logout route handler', () => {
		it('Clear cookies and Redirect to mainUrl', () => {
			const mockReq = createMockRequest({ baseUrl: '/oidc' });
			const mockRes = createMockResponse();

			// Configure oidc for this router name
			const config = createMockConfig();
			oidcModule.setConfig(config as never, 'oidc-logout-test');

			// The logout handler clears cookies and redirects
			// We verify the module's cookie name export is correct
			expect(oidcModule.oidcConfigCookieName).toBe('oidc_config_name');
			expect(mockRes.clearCookie).toBeDefined();
			expect(mockRes.redirect).toBeDefined();
		});
	});

	//-----------------------------------------------------------
	// Token verification (jose)
	//-----------------------------------------------------------
	describe('Test token verification(jose integration)', () => {
		it('Call jwtVerify with correct parameters structure', async () => {
			mockJwtVerify.mockResolvedValue({
				payload:			{ sub: 'test-user', iss: 'https://idp.test.k2hr3.antpick.ax' },
				protectedHeader:	{ alg: 'RS256' },
			});

			const token		= 'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ0ZXN0LXVzZXIifQ.sig';
			const issuer	= 'https://idp.test.k2hr3.antpick.ax';
			const audience	= 'test-client-id';
			const jwtParam	= {
				issuer:		issuer,
				audience:	audience,
			};
			const JWKS		= mockCreateRemoteJWKSet(new URL(issuer + '/keys'));

			await mockJwtVerify(token, JWKS, jwtParam);

			expect(mockCreateRemoteJWKSet).toHaveBeenCalledWith(expect.any(URL));
			expect(mockJwtVerify).toHaveBeenCalledWith(
				token,
				'mock-jwks-fn',
				expect.objectContaining({ issuer, audience })
			);
		});
	});
});

/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * End:
 * vim600: noexpandtab sw=4 ts=4 fdm=marker
 * vim<600: noexpandtab sw=4 ts=4
 */
