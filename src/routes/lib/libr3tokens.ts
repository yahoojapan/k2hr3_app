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
 * CREATE:   Wed Sep 6 2017
 * REVISION:
 *
 */

import fs			from 'fs';
import http			from 'http';
import https		from 'https';
import { Request }	from 'express';
import R3AppConfig	from './libr3appconfig';
import { getSafeString, isSafeBoolean, isSafeEntity, isSafeFunction, isSafeHaskey, isSafeObject, isSafeString, isValidatorModule, SignMinUrlEntry, SignMinUrls, StringValObj }	from './libr3util';

//
// Types
//
type resGetUserToken = {
	result:		boolean;
	message:	string | null;
	token?:		string;
	scoped?:	boolean;
	username?:	string;
};

//
// Type checker
//
const isResGetUserToken = (obj: unknown): obj is resGetUserToken =>
{
	if(!isSafeObject(obj)){
		return false;
	}
	if(	isSafeBoolean(obj?.result)										&&
		(null === obj?.message			|| isSafeString(obj?.message))	&&
		(undefined === obj?.token		|| isSafeString(obj?.token))	&&
		(undefined === obj?.scoped		|| isSafeBoolean(obj?.scoped))	&&
		(undefined === obj?.username	|| isSafeString(obj?.username))	)
	{
		return true;
	}
	return false;
};

//---------------------------------------------------------
// User Token Class
//---------------------------------------------------------
export default class R3UserToken
{
	private appConfig:	R3AppConfig;
	private username:	string | null									= null;
	private sinintype:	string | null									= null;
	private signinUrl:	SignMinUrls | SignMinUrlEntry | string | null	= null;
	private signoutUrl:	SignMinUrls | SignMinUrlEntry | string | null	= null;
	private otherToken:	string | null									= null;
	private configName:	string | null									= null;

	//
	// Constructor
	//
	constructor(req: Request)
	{
		this.appConfig	= new R3AppConfig();

		const validator	= this.appConfig.getUserValidatorObj();
		if(isValidatorModule(validator)){
			this.username	= validator.getUserName(req);
			if (null === this.username) {
				console.error('could not get user name, it is not login status.');
			}

			this.sinintype	= validator.getSignInType();
			this.signinUrl	= validator.getSignInUri(req);
			this.signoutUrl	= validator.getSignOutUri(req);

			if(isSafeFunction(validator.getOtherToken)){
				this.otherToken = validator.getOtherToken(req);
			}
			if(isSafeFunction(validator.getConfigName)){
				this.configName = validator.getConfigName(req);
			}

		}else{
			console.error('validator object is something wrong.');
		}
	};

	//
	// Methods
	//
	public getUserName = (): string | null =>
	{
		return this.username;
	};

	public rawExtractUserToken = (req: Request): string | null =>
	{
		if(	!isSafeEntity(req)							||
			!isSafeEntity(req.headers)					||
			!isSafeHaskey(req.headers, 'x-auth-token')	||
			!isSafeString(req.headers['x-auth-token'])	)
		{
			return null;
		}

		let	token: string = req.headers['x-auth-token'];
		if(-1 !== token.indexOf('R=')){
			console.warn('The request object does not have user token header but has role token.');
			return null;
		}
		if(-1 !== token.indexOf('U=')){
			token = token.substring(2);
			if(!isSafeString(token)){
				console.warn('The request object has empty user token.');
				return null;
			}
		}
		return token;
	};

	public rawGetUserToken = (callback: (err: Error | null, token: string | null) => void, username: string | null, token: string | null, tenant?: string): void =>
	{
		let	secure								= false;
		let	httpobj: typeof http | typeof https	= null;		// default HTTP
		let agent: https.Agent | null			= null;

		if('https' === this.appConfig.getApiScheme()?.toLowerCase()){
			// Case HTTPS
			secure	= true;
			httpobj	= https;

			const agentOptions = {
				host:				this.appConfig.getApiHost(),
				port:				this.appConfig.getApiPort(),
				path:				'/',
				rejectUnauthorized:	this.appConfig.getRejectUnauthorized()
			};
			agent		= new httpobj.Agent(agentOptions);
		}

		const _callback	= callback;
		const isscoped	= isSafeString(tenant) && isSafeString(token);

		// arguments for the request to API server
		const urlarg	=  isSafeString(username) ? ('?username=' + username + (isscoped ? ('&tenantname=' + tenant) : '')) : '';

		const headers: StringValObj = {
			'Content-Type':		'application/json',
			'Content-Length':	String(0)
		};
		if(isscoped){
			headers['x-auth-token'] = 'U=' + (isSafeString(token) ? token : '');
		}else if(isSafeString(token)){
			// token is other token
			headers['x-auth-token'] = token;
		}

		const options: http.RequestOptions & { ca?: string[] } = {
			'host':		this.appConfig.getApiHost(),
			'port':		this.appConfig.getApiPort(),
			'method':	'PUT',
			'headers':	headers,
			'path':		('/v1/user/tokens' + encodeURI(urlarg))
		};
		if(secure && agent){
			options.agent = agent;

			// Set CA cert file
			const ca = this.appConfig.getCA();
			if(isSafeString(ca)){
				options.ca = [ fs.readFileSync(ca, {encoding: 'utf-8'}) ];
			}
		}

		console.info('api host = ' + this.appConfig.getApiHost());
		console.info('api port = ' + String(this.appConfig.getApiPort()));
		console.info('method   = PUT');
		console.info('headers  = ' + JSON.stringify(headers));
		console.info('path     = /v1/user/tokens' + encodeURI(urlarg));

		// send request
		const request	= httpobj.request(options, (response) => {
			response.setEncoding('utf8');
			let	resBody = '';

			response.on('data', (chunk) => {
				console.info('RESPONSE CHUNK = ' + chunk);
				resBody += chunk;
			});

			response.on('end', () => {
				console.info('RESPONSE CODE   = ' + response.statusCode);
				console.info('RESPONSE HEADER = ' + JSON.stringify(response.headers));
				console.info('RESPONSE BODY   = ' + getSafeString(resBody));

				let errobj: Error | null			= null;
				let	cvtBody: resGetUserToken | null	= JSON.parse(getSafeString(resBody));
				let	_token: string | null			= null;

				if(300 <= response.statusCode){
					errobj = new Error('RESPONSE CODE = ' + response.statusCode);
				}else if(	!isSafeEntity(cvtBody)			||
							!isSafeBoolean(cvtBody.result)	||
							!isSafeEntity(cvtBody.message)	||
							!isSafeBoolean(cvtBody.scoped)	||
							!isSafeEntity(cvtBody.token)		)
				{
					errobj = new Error('Response body is something wrong.');

				}else if(!isResGetUserToken(cvtBody)){
					errobj = new Error('Could not get user token, the response is something wrong');
				}else if(!cvtBody.result){
					errobj = new Error('Could not get user token by ' + isSafeString(cvtBody.message));
				}else if(!isSafeBoolean(cvtBody?.scoped)){
					errobj = new Error('Could not get user token scope, the response is something wrong');
				}else if(isscoped !== cvtBody.scoped){
					errobj = new Error('Could not get ' + (isscoped ? 'scoped' : 'unscoped') + ' user token.');
				}else if(!isSafeString(cvtBody?.token)){
					errobj = new Error('Got token is not strong type.');
				}else{
					_token = cvtBody?.token;
				}

				if(null !== errobj){
					console.error(errobj.message);
					_callback(errobj, null);
					return;
				}
				_callback(null, _token);
			});
		});

		request.on('error', (error: Error) =>
		{
			// [NOTE]
			// If fatal error is occurred, the error message must be started with 'K2HR3 API SERVER ERROR'.
			// This value is checked in caller function.
			//
			console.error('ERROR RESPONSE = ' + (isSafeString(error.message) ? error.message : 'unknown'));
			_callback(new Error('K2HR3 API SERVER ERROR : ' + (isSafeString(error.message) ? error.message : 'unknown')), null);
		});

		request.end();
	};

	public hasTokenHeader = (req: Request): boolean =>
	{
		return (null !== this.rawExtractUserToken(req));
	};

	public getConfigName = (): string | null =>
	{
		return this.configName;
	};

	public getUnscopedUserToken = (callback: (err: Error | null, token: string | null) => void): void =>
	{
		if(!isSafeString(this.username)){
			const	errobj = new Error('User name is not specified(not found authentication cookie)');
			console.error(errobj.message);
			callback(errobj, null);
			return;
		}
		return this.rawGetUserToken(callback, null, this.otherToken);
	};

	public getScopedUserToken = (req: Request, tenant: string, callback: (err: Error | null, token: string | null) => void): void =>
	{
		if(!isSafeString(this.username)){
			const	errobj = new Error('Not find user name.');
			console.error(errobj.message);
			callback(errobj, null);
			return;
		}

		const	token = this.rawExtractUserToken(req);
		if(!isSafeString(token)){
			const	errobj = new Error('The request does not safe unscoped user token.');
			console.error(errobj.message);
			callback(errobj, null);
			return;
		}
		return this.rawGetUserToken(callback, this.username, token, tenant);
	};

	public getSignInType = (): string | null =>
	{
		return this.sinintype;
	};

	public getSignInUrl = (): SignMinUrls | SignMinUrlEntry | string | null =>
	{
		return this.signinUrl;
	};

	public getSignOutUrl = (): SignMinUrls | SignMinUrlEntry | string | null =>
	{
		return this.signoutUrl;
	};
}

/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * End:
 * vim600: noexpandtab sw=4 ts=4 fdm=marker
 * vim<600: noexpandtab sw=4 ts=4
 */
