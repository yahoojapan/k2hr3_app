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
 * AUTHOR:   Hirotaka Wakabayashi
 * CREATE:   Tue Aug 07 2019
 * REVISION:
 *
 */

//------------------------------------------------------------------------
// Usage
//------------------------------------------------------------------------
// To enable this OpenId Connect(OIDC), make the following settings in the
// K2HR3 APP configuration file(ex, production.json/local.json/etc).
//
// To enable this OIDC, register this module as an 'extrouter'.
// Then set the keys and values shown in the example below:
//
//	'extrouter': {
//		'oidc': {													<---- default name
//			'name':						'oidc',
//			'path':						'/oidc',
//			'config': {
//				'displayName':			'Default OpenID Connect'
//				'debug':				true,
//				'logoutUrl':			'<URL for logout processing>/oidc/logout',
//				'mainUrl':				'<URL of K2HR3 APP top>',
//				'oidcDiscoveryUrl':		'<OpenId Connect Issuer URL>',
//				'params': {
//					'client_secret':	'<OpenId Connect Client Secret>',
//					'client_id':		'<OpenId Connect Client id>',
//					'redirectUrl':		'<URL for receiving redirect from oidc process>/oidc/login/cb',
//					'usernamekey':		'<username key name in oidc token>',
//					'cookiename':		'<cookie name for saving oidc token>',
//					'cookieexpire':		'<expire time for oidc token cookie>'
//				},
//				'scope':				'<scope>'
//			}
//		},
//		'oidc@other': {
//			'name':						'oidc',
//			'path':						'/oidc@other',
//			'config': {
//				'displayName':			'OpenID Connect to Other'
//				'debug':				true,
//				'logoutUrl':			'<URL for logout processing>/oidc@other/logout',
//				'mainUrl':				'<URL of K2HR3 APP top>',
//				'oidcDiscoveryUrl':		'<OpenId Connect Issuer URL>',
//				'params': {
//					'client_secret':	'<OpenId Connect Client Secret>',
//					'client_id':		'<OpenId Connect Client id>',
//					'redirectUrl':		'<URL for receiving redirect from oidc process>/oidc@other/login/cb',
//					'usernamekey':		'<username key name in oidc token>',
//					'cookiename':		'<cookie name for saving oidc token>',
//					'cookieexpire':		'<expire time for oidc token cookie>'
//				},
//				'scope':				'<scope>'
//			}
//		},
//		...
//		...
//	},
//
// [NOTE]
// The 'oidc' object is required and used as the default OIDC authorization.
// If you have "other" objects, you can use them for its OIDC authentication
// logic.
// The 'name' field must be 'oidc' to recognize it as 'oidc'. The 'redirectUrl'
// and 'logoutUrl' should be '<extrouter name>/login/cb' and '<extrouter name>/logout'
// (<extrouter name> is such as 'oidc' or 'oidc@other').
// The 'URL PATH' must always match one of 'extrouter name'.
//
// Each OIDC setting item has the following format:
//
//	'<oidc name>': {
//		'name':						'oidc',
//		'path':						'/<oidc name>',
//		'config': {
//			'displayName':			'<display name for K2HR3 APP Menu>'
//			'debug':				<true or false>,
//			'logoutUrl':			'<K2HR3 APP Server Host name and port>/<oidc name>/logout',
//			'mainUrl':				'<K2HR3 APP Server Host name and port>',
//			'oidcDiscoveryUrl':		'<OpenId Connect Issuer URL>',
//			'params': {
//				'client_secret':	'<OpenId Connect Client Secret>',
//				'client_id':		'<OpenId Connect Client id>',
//				'redirectUrl':		'<K2HR3 APP Server Host name and port>/<oidc name>/login/cb',
//				'usernamekey':		'<username key name in oidc token>',
//				'cookiename':		'<cookie name for saving oidc token>',
//				'cookieexpire':		'<expire time for oidc token cookie>'
//			},
//			'scope':				'<scope>'
//		}
//	},
//
// A description of each item is shown below:
//
//	[oidc name]
//		A unique name for each OIDC. (Do not include space characters
//		whenever possible)
//		Note that other values should also match this name string in places.
//
//	[name]
//		For this OIDC authentication, specify 'oidc'.
//
//	[path]
//		This path will be the entry point on server for OIDC authentication.
//		Be sure to specify '/<oidc name>'.
//		For example, if 'oidc name' is 'oidc', it should be set '/oidc'.
//
//	[config]
//		An object of configuration for this <oidc name> module.
//
//	[displayName]
//		If there are multiple OIDC authentication settings, they should
//		be distinguished in the 'Sign in' menu of the K2HR3 APP.
//		Then the 'Sign in' menu will have a submenu and this 'displayName'
//		will be the submenu name.
//		This item can be omitted, and if omitted, '<oidc name>' will be used.
//		If there is only one OIDC authentication setting, then even if this
//		value is set, it will not be used for display.
//
//	[debug]
//		Set true to display the contents of communication with the OpenId
//		Connect server.
//
//	[logoutUrl]
//		Specifies the entry point for logout processing.
//		Please specify K2HR3 APP server name including schema, path
//		including port number.
//		The path must always include '<oidc name>/logout'.
//		For example, 'https://k2hr3-app:3000/<oidc name>/logout'.
//
//	[mainUrl]
//		Specify the URL of the K2HR3 APP top page.
//		For example, 'https://k2hr3-app:3000/'.
//
//	[oidcDiscoveryUrl]
//		Specify the Issuer URL for OpenId Connect.
//
//	[params]
//		An object of some parameters for this module.
//
//	[client_secret]
//		Specify the client Secret for OpenId Connect.
//
//	[client_id]
//		Specify the Client Id for OpenId Connect.
//
//	[redirectUrl]
//		Specifies the entry point for login callback processing.
//		Please specify K2HR3 APP server name including schema, path
//		including port number.
//		The path must always include '<oidc name>'.
//		For example, 'https://k2hr3-app:3000/<oidc name>/login/cb'.
//
//	[usernamekey]
//		If there is a key indicating the user name in the Payload of the
//		Token returned by OpenId Connect, specify that key name.
//		If there is no key, it can be omitted(not specified).
//		If omitted, the value of the 'sub' key in Payload will be used as
//		the user name.
//
//	[cookiename]
//		Specifies the cookie name for temporarily storing the token
//		returned by OpenId Connect. This authentication process using
//		OpenId Connect uses a cookie to take over the token to the
//		redirect destination.
//		Please specify the name of this cookie. If omitted, 'id_token'
//		will be used.
//
//	[cookieexpire]
//		Specify the cookie validity time in seconds on this page.
//		If omitted, set to 60 seconds.
//
//	[scope]
//		Specify 'openid profile email' value for this key.
//
//------------------------------------------------------------------------

import express		from 'express';
import passport		from 'passport';
import session		from 'express-session';
import * as oidc	from 'openid-client';
import { Strategy }	from 'passport-strategy';
import { base64url, createRemoteJWKSet, jwtVerify, JWTVerifyOptions }	from 'jose';
import { valTypeAllObject, isSafeObject, isSafeFunction, isSafeHaskey, compareCaseString, isSafeArray, isSafeBoolean, isSafeEntity, isSafeJSON, isSafeString, isSafeNumber, isOIDCExtRouterConfig, isStringArray, OIDCExtRouterConfig }	from './lib/libr3util';

//--------------------------------------------------------------
// Interface for internal
//--------------------------------------------------------------
interface OIDCAuthenticateOptions
{
	scope?:	string[];
}

//--------------------------------------------------------------
// Configration for OIDC
//--------------------------------------------------------------
let	oidcConfig: Record<string, OIDCExtRouterConfig>	= {};
export let oidcConfigCookieName: string				= 'oidc_config_name';

//--------------------------------------------------------------
// Router
//--------------------------------------------------------------
export const router = express.Router();

//
// Setup session
//
// https://github.com/expressjs/session#sessionoptions
//
router.use(session({
	secret:				'k2hr3-oidc-session',
	resave:				false,
	saveUninitialized:	false,
	cookie: {
		httpOnly:		true,
		maxAge:			12 * 60 * 60 * 1000,			// 12H
	}
}));

//
// Setup middleware(passport)
//
router.use(passport.initialize());
router.use(passport.session());

//--------------------------------------------------------------
// Utility
//--------------------------------------------------------------
const rawGetExtRouterName = (req: express.Request): string =>
{
	if(!isSafeEntity(req) || !isSafeString(req.baseUrl)){
		console.error('Request base URL is somthing wrong, but returns default extrouter name(oidc).');
		return 'oidc';				// default
	}

	const	urlparts = decodeURI(req.baseUrl).split('/');
	if(!isSafeArray(urlparts)){
		console.error('Request base URL is somthing wrong, but returns default extrouter name(oidc).');
		return 'oidc';				// default
	}

	//
	// Try to find '.../<extrouter name>/login/...' or '.../<extrouter name>/logout/...'
	//
	let	extRounterName: string | null = null;
	for(let cnt = 0; cnt < urlparts.length; ++cnt){
		if(!isSafeString(urlparts[cnt])){
			continue;
		}
		if(compareCaseString(urlparts[cnt], 'login') || compareCaseString(urlparts[cnt], 'logout')){
			break;
		}
		extRounterName = urlparts[cnt];
	}
	if(!isSafeString(extRounterName)){
		console.error('Failed to extract extRouter name from base URL(' + req.baseUrl + '), so returns default extrouter name(oidc).');
		return 'oidc';				// default
	}
	return extRounterName;
};

//
// Passport v6 Custom Strategy
//
class OIDCV6Strategy extends Strategy
{
	private	configInfo:	OIDCExtRouterConfig;
	public	name:		string;

	constructor(configInfo: OIDCExtRouterConfig)
	{
		super();
		this.name		= 'oidc';
		this.configInfo	= configInfo;
	}

	async authenticate(req: express.Request, options: OIDCAuthenticateOptions)
	{
		try{
			const discoveryUrl = new URL(this.configInfo.oidcDiscoveryUrl);

			// custom hook for debugging(Alternative to custom.setHttpOptionsDefaults in v5)
			let customFetch: oidc.CustomFetch | undefined = undefined;
			if(isSafeHaskey(this.configInfo, 'debug') && isSafeBoolean(this.configInfo.debug) && this.configInfo.debug){

				customFetch = async(url: string, options: oidc.CustomFetchOptions) => {
					const method = isSafeString(options.method) ? options.method : 'GET';

					console.log('[OIDC debug] Request URL : %s %s', method.toUpperCase(), url);
					console.log('[OIDC debug] Request HEADERS : %o', options.headers);

					if(isSafeString(options.body)){
						console.log('[OIDC debug] Request BODY : %s', options.body);
					}

					// convert CustomFetchOptions to RequestInit(as same as "options as RequestInit")
					const fetchInit: RequestInit = {
						method:		options.method,
						headers:	options.headers,
						redirect:	options.redirect,
						signal:		options.signal,
						body:		(options.body instanceof Uint8Array) ? new Uint8Array(options.body) : options.body
					};
					const response = await fetch(url, fetchInit);
					const clonedRes = response.clone();

					console.log('[OIDC debug] Response URL : %s %s', method.toUpperCase(), url);
					console.log('[OIDC debug] Response STATUS : %i', clonedRes.status);
					console.log('[OIDC debug] Response HEADERS : %o', Object.fromEntries(clonedRes.headers.entries()));

					try{
						const bodyText = await clonedRes.text();
						console.log('[OIDC debug] Response BODY : %s', bodyText);
					}catch(_){
						// Ignore error if response body is not readable or empty
					}
					return response;
				};
			}

			// Discovery (clockTolerance is set via ClientMetadata)
			const	clientMetadata: Partial<oidc.ClientMetadata> = {
				client_secret:			this.configInfo.params.client_secret,
				[oidc.clockTolerance]:	5
			};
			const	config			= await oidc.discovery(discoveryUrl, this.configInfo.params.client_id, clientMetadata, undefined, (customFetch ? { [oidc.customFetch]: customFetch } : undefined));
			const	redirect_uri	= this.configInfo.params.redirectUrl;

			// Processing for callback (if authorization code exists)
			if(isSafeObject(req?.query) && isSafeEntity(req.query?.code)){
				const currentUrl	= new URL(req.protocol + '://' + req.get('host') + (isSafeString(req?.originalUrl) ? req.originalUrl : ''));
				const tokenSet		= await oidc.authorizationCodeGrant(config, currentUrl);

				if(!isSafeEntity(tokenSet?.id_token)){
					return this.error(new Error('ID Token not found in token set.'));
				}
				return this.success(tokenSet.id_token);
			}

			// Redirection process on initial access
			const scope				= isSafeArray(options?.scope) ? options.scope.join(' ') : 'openid';
			const authorizationUrl	= oidc.buildAuthorizationUrl(config, {
				redirect_uri,
				scope
			});

			if(isSafeString(authorizationUrl?.href)){
				this.redirect(authorizationUrl.href);
			}else{
				this.error(new Error('Failed to calculate a valid authorization URL.'));
			}

		}catch(error: unknown){
			console.error('Authenticate discovery Error by ' + ((isSafeObject(error) && isSafeString(error.message)) ? error.message : 'unknown'));
			this.error(error instanceof Error ? error : new Error(String(error)));
		}
	}
}

//--------------------------------------------------------------
// Mountpath		: /<config path>/login
//--------------------------------------------------------------
//
// URL: /<config path>/login
//

//
// Login async function
//
const oidcLogin = async(Request: express.Request, Response?: express.Response, Next?: express.NextFunction): Promise<void> =>
{
	const	extRouterName = rawGetExtRouterName(Request);

	if(!isSafeEntity(oidcConfig[extRouterName]) || !isOIDCExtRouterConfig(oidcConfig[extRouterName])){
		const error = new Error('Please check your configuarion(json) because it is invalid.');
		console.error(error.message);
		throw error;
	}
	const _oidcConfigInfo = oidcConfig[extRouterName];

	//
	// Create openid client / Try to login / Create a client handler / Calls passport middleware
	//
	if(isSafeHaskey(_oidcConfigInfo, 'debug') && isSafeBoolean(_oidcConfigInfo.debug) && _oidcConfigInfo.debug){
		console.log('[OIDC debug] Discovering issuer for %s', _oidcConfigInfo.oidcDiscoveryUrl);
	}

	passport.use(
		'oidc',
		new OIDCV6Strategy(_oidcConfigInfo)
	);
};

//
// Login by calling passport.authenticate
//
const authenticate = async(Request: express.Request, Response: express.Response, Next: express.NextFunction): Promise<string> =>
{
	const	extRouterName = rawGetExtRouterName(Request);

	if(!isSafeEntity(oidcConfig[extRouterName]) || !isOIDCExtRouterConfig(oidcConfig[extRouterName])){
		const error = new Error('Please check your configuarion(json) because it is invalid.');
		console.error(error.message);
		throw error;
	}
	const _oidcConfigInfo = oidcConfig[extRouterName];

	//
	// Login by invoking passport middleware to get an token
	//
	await oidcLogin(Request, Response, Next);

	//
	// Create and return Promise object
	//
	let _scope: string[] = [];
	if(isSafeString(_oidcConfigInfo.scope)){
		_scope = [ ...(_oidcConfigInfo.scope) ];
	}else if(isStringArray(_oidcConfigInfo.scope)){
		_scope = _oidcConfigInfo.scope;
	}

	return new Promise<string>((resolve, reject) => {
		passport.authenticate(
			'oidc',
			{
				scope:	_scope
			},
			(error: Error | null, token: string) => {
				if(error){
					reject(error);
					return;
				}
				resolve(token);
			}
		)(Request, Response, Next);

	}).catch((error) => {
		console.error('Authenticate passport.authenticate Error by ' + error.message);
		Response.redirect('/');
		throw error;
	});
};

//
// GET '/<config path>/login'	: OpenID Connect Provider's endpoint
//
router.get('/login', authenticate);

//--------------------------------------------------------------
// Mountpath		: /<config path>/login/cb
//--------------------------------------------------------------
//
// Utility function for OIDC authentication
//
const oidcAuthenticate = async(Request: express.Request, Response: express.Response, Next: express.NextFunction): Promise<string> =>
{
	const	token = await authenticate(Request, Response, Next).catch((error) => {
		console.error(error.message);
		throw error;
	});
	return token;
};

//
// Utility function for token
//
const oidcVerifyToken = async(token: string, extRouterName: string): Promise<void> =>
{
	if(!isSafeString(extRouterName) || !isSafeEntity(oidcConfig[extRouterName]) || !isOIDCExtRouterConfig(oidcConfig[extRouterName])){
		const error = new Error('Please check your configuarion(json) because it is invalid.');
		console.error(error.message);
		throw error;
	}
	const	_oidcConfigInfo	= oidcConfig[extRouterName];
	const	_issure			= _oidcConfigInfo.oidcDiscoveryUrl;

	const	jwtParam: JWTVerifyOptions = {
		issuer:		_issure,
		audience:	_oidcConfigInfo.params.client_id
	};
	const	strurl	= _issure + '/keys';
	const	JWKS	= createRemoteJWKSet(new URL(strurl));

	await jwtVerify(token, JWKS, jwtParam).catch((error) => {
		console.error(error.message);
		throw error;
	});
};

//
// Authentication
//
const sessionize = async(Request: express.Request, Response: express.Response, Next: express.NextFunction): Promise<string> =>
{
	const	extRouterName = rawGetExtRouterName(Request);

	if(!isSafeEntity(oidcConfig[extRouterName]) || !isOIDCExtRouterConfig(oidcConfig[extRouterName])){
		const error = 'Please check your configuarion(json) because it is invalid.';
		console.error('Failed to sessionize init, ' + error);
		Response.status(500);											// 500: Internal Server Error
		return;
	}
	const	_oidcConfigInfo	= oidcConfig[extRouterName];

	//
	// Get oidc token in request
	//
	await oidcAuthenticate(Request, Response, Next).then(async(oidc_token_raw: string): Promise<void> =>
	{
		//
		// get payload in oidc token
		//
		const	oidc_token	= oidc_token_raw;
		const	parts		= oidc_token.split('.', 2);
		if(2 > parts.length){
			const	error = 'Failed to parse payload from oidc token.';
			console.error(error);
			Response.status(401);										// 401: Unauthorized
			return;
		}

		const	raw_payload	= new TextDecoder().decode(base64url.decode(parts[1]));
		if(!isSafeJSON(raw_payload)){
			const	error = 'Failed to decode json payload from oidc token.';
			console.error(error);
			Response.status(401);										// 401: Unauthorized
			return;
		}
		const	payload = JSON.parse(raw_payload);

		//
		// put debug message
		//
		if(isSafeHaskey(_oidcConfigInfo, 'debug') && isSafeBoolean(_oidcConfigInfo.debug) && _oidcConfigInfo.debug){
			console.log('[OIDC debug] payload = ' + JSON.stringify(payload));
		}

		//
		// check user name key
		//
		if(isSafeHaskey(_oidcConfigInfo.params, 'usernamekey') && isSafeString(_oidcConfigInfo.params.usernamekey)){
			const	_username = _oidcConfigInfo.params.usernamekey;
			let		found_key = false;
			Object.keys(payload).forEach((onekey: unknown) => {
				if(isSafeString(onekey) && onekey == _username){
					found_key = true;
				}
			});
			if(!found_key || !isSafeObject(payload) || !isSafeHaskey(payload, _username) || !isSafeString(payload[_username])){
				const	error = 'Not find or empty user name in oidc token.';
				console.error(error);
				Response.status(401);									// 401: Unauthorized
				return;
			}
		}

		//
		// Verify token
		//
		await oidcVerifyToken(oidc_token, extRouterName).then((): void =>
		{
			//
			// oidc token verified
			//

			// token cookie
			const	_cookiename	= (isSafeHaskey(_oidcConfigInfo.params, 'cookiename') && isSafeString(_oidcConfigInfo.params.cookiename)) ? _oidcConfigInfo.params.cookiename : '';
			const	_cookieexp	= (isSafeHaskey(_oidcConfigInfo.params, 'cookieexpire') && isSafeNumber(_oidcConfigInfo.params.cookieexpire)) ? _oidcConfigInfo.params.cookieexpire : 1;
			Response.cookie(_cookiename, {
				httpOnly:	true,
				secure:		Request.protocol === 'https',
				maxAge:		_cookieexp * 1000,					// set expire
			});

			// oidc name cookie
			Response.cookie(oidcConfigCookieName, extRouterName, {
				httpOnly:	true,
				secure:		Request.protocol === 'https',
				maxAge:		_cookieexp * 1000,					// set expire
			});

			// Complete session destruction and redirection
			if(Request.session && isSafeFunction(Request.session.destroy)){
				// Redirect after the session destruction is complete
				Request.session.destroy((err) => {
					if(null !== err){
						console.error('Failed to destroy session: ', JSON.stringify(err));
					}
					Response.redirect('/');
				});
			}else{
				// Fallback in case the session does not exist or there is no destroy function
				Request.session = null;
				Response.redirect('/');
			}
		}).catch((err: unknown) => {
			console.error('Failed to verify oidc token by error: ' + JSON.stringify(err));
			Response.status(401);										// 401: Unauthorized
			return;
		});

	}).catch((err) => {
		const	error = 'Failed to get oidc token in request: ' + JSON.stringify(err);
		console.error(error);
		Response.status(401);											// 401: Unauthorized
		return;
	});
};

//
// GET '/<config path>/login/cb'	: Login callback url
//
// URL Arguments
//		extrouter					: <extrouter name>
//
router.get('/login/cb', sessionize);

//--------------------------------------------------------------
// Mountpath		: /<config path>/logout
//--------------------------------------------------------------
//
// GET '/<config path>/logout'	: logout for OIDC
//
// URL Arguments
//		extrouter				: <extrouter name>
//
router.get('/logout', (Request: express.Request, Response: express.Response, Next: express.NextFunction): void =>
{
	const	extRouterName = rawGetExtRouterName(Request);

	if(!isSafeEntity(oidcConfig[extRouterName]) || !isOIDCExtRouterConfig(oidcConfig[extRouterName])){
		const	error: string = 'Please check your configuarion(json) because it is invalid.';
		console.error('Failed logout processing, ' + error);
		Response.status(500);									// 500: Internal Server Error
		Response.send(error);
		return;
	}
	const	_oidcConfigInfo	= oidcConfig[extRouterName];

	//
	// Cleanup : clear the cookie if exist
	//
	const	_cookiename	= (isSafeHaskey(_oidcConfigInfo.params, 'cookiename') && isSafeString(_oidcConfigInfo.params.cookiename)) ? _oidcConfigInfo.params.cookiename : '';
	const	_mainurl	= _oidcConfigInfo.mainUrl;

	Response.clearCookie(_cookiename);							// cookie name(id_token as deafult)
	Response.clearCookie(oidcConfigCookieName);					// cookie name(oidc config name)

	Response.redirect(_mainurl);

	return;
});

//--------------------------------------------------------------
// setConfig
//--------------------------------------------------------------
//
// setConfig is called in app.js to set configurations that are
// defined in configuration file(json)
//
export const setConfig = (config: valTypeAllObject, extRouterName: string): boolean =>
{
	if(!isSafeString(extRouterName)){
		console.error('Please check your configuarion(json) because it does not have ' + JSON.stringify(extRouterName) + ' entity or it is empty.');
		return false;
	}
	if(isSafeEntity(oidcConfig[extRouterName])){
		console.error('Please check your configuarion(json) because it has multi ' + JSON.stringify(extRouterName) + ' entities.');
		return false;
	}

	// check required member in config
	if(!isOIDCExtRouterConfig(config)){
		console.error('Please check your configuarion(json) because it is invalid : config = ' + JSON.stringify(config));
		return false;
	}

	// Set
	oidcConfig[extRouterName] = config;

	if(!isSafeHaskey(oidcConfig[extRouterName].params, 'usernamekey') || !isSafeString(oidcConfig[extRouterName].params.usernamekey)){
		console.warn('The key name in configuration(usernamekey) is empty, then it check will no longer be performed.');
	}
	if(!isSafeHaskey(oidcConfig[extRouterName].params, 'cookiename') || !isSafeString(oidcConfig[extRouterName].params.cookiename)){
		console.warn('The cookie name in configuration(cookiename) is empty, so id_token is used as default.');
		oidcConfig[extRouterName].params.cookiename = 'id_token';
	}
	if(!isSafeHaskey(oidcConfig[extRouterName].params, 'cookieexpire') || !isSafeNumber(oidcConfig[extRouterName].params.cookieexpire)){
		console.warn('The cookie expire(sec) in configuration(cookieexpire) is empty, so id_token is used as default.');
		oidcConfig[extRouterName].params.cookieexpire = 60;			// 60 sec as default
	}
	return true;
};

//--------------------------------------------------------------
// getConfig
//--------------------------------------------------------------
//
// getConfig returns configurations that are defined in
// configuration file(json)
//
export const getConfig = (): Record<string, OIDCExtRouterConfig> | null =>
{
	if(!isSafeEntity(oidcConfig)){
		console.error('Please check your configuarion(json) because it is invalid.');
		return null;
	}
	return oidcConfig;
};

/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * End:
 * vim600: noexpandtab sw=4 ts=4 fdm=marker
 * vim<600: noexpandtab sw=4 ts=4
 */
