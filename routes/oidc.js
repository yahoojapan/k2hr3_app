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
// Then set the keys and values shown in the example below.
// 
//	'extrouter': {
//		'oidc': {
//			'name':						'oidc',
//			'path':						'/oidc',
//			'config': {
//				'debug':				true,
//				'logoutUrl':			'<URL for logout processing>',
//				'mainUrl':				'<URL of K2HR3 APP top>',
//				'oidcDiscoveryUrl':		'<OpenId Connect Issuer URL>',
//				'params': {
//					'client_secret':	'<OpenId Connect Client Secret>',
//					'client_id':		'<OpenId Connect Client id>',
//					'redirectUrl':		'<URL for receiving redirect from oidc process>',
//					'usernamekey':		'<username key name in oidc token>',
//					'cookiename':		'<cookie name for saving oidc token>',
//					'cookieexpire':		'<expire time for oidc token cookie>'
//				},
//				'scope':				'<scope>'
//			}
//		}
//	},
//
// This 'oidc' object should contain the following keys(objects). The
// contents of each setting are explained.
//
//	[name]
//		Set 'oidc' as the value.
//	[path]
//		Specifies the filename path(relative to the '/route' directory)
//		without the suffix of this module. If the file name has not been
//		changed, it will be '/oidc'.
//	[config]
//		An object of configuration for this module.
//	[debug]
//		Set true to display the contents of communication with the OpenId
//		Connect server.
//	[logoutUrl]
//		Specify the entry point for logout processing.
//		For example, if the URL of K2HR3 APP is 'https://k2hr3-app/', set
//		'https://k2hr3-app/oidc/logout'.(The URL path is arbitrary.)
//	[mainUrl]
//		Specify the URL of the K2HR3 APP top page.
//		For example, 'https://k2hr3-app/'.
//	[oidcDiscoveryUrl]
//		Specify the Issuer URL for OpenId Connect.
//	[params]
//		An object of some parameters for this module.
//	[client_secret]
//		Specify the client Secret for OpenId Connect.
//	[client_id]
//		Specify the Client Id for OpenId Connect.
//	[redirectUrl]
//		Specify the URL on the K2HR3 APP called from OpenId Connect.
//		For example, if the URL of K2HR3 APP is 'https://k2hr3-app/', set
//		'https://k2hr3-app/oidc/login/cb'.(The URL path is arbitrary.)
//	[usernamekey]
//		If there is a key indicating the user name in the Payload of the
//		Token returned by OpenId Connect, specify that key name.
//		If there is no key, it can be omitted(not specified).
//		If omitted, the value of the 'sub' key in Payload will be used as
//		the user name.
//	[cookiename]
//		Specifies the cookie name for temporarily storing the token
//		returned by OpenId Connect. This authentication process using
//		OpenId Connect uses a cookie to take over the token to the
//		redirect destination.
//		Please specify the name of this cookie. If omitted, 'id_token'
//		will be used.
//	[cookieexpire]
//		Specify the cookie validity time in seconds on this page.
//		If omitted, set to 60 seconds.
//	[scope]
//		Specify 'openid profile email' value for this key.
//
//------------------------------------------------------------------------

'use strict';

var	r3util			= require('./lib/libr3util');
var	express			= require('express');
var	router			= express.Router();
var	passport		= require('passport');
var	session			= require('express-session');

var	{ custom, Issuer, Strategy }= require('openid-client');
var	{ decode }					= require('jose').base64url;
var	{ createRemoteJWKSet }		= require('jose');
var	{ jwtVerify }				= require('jose');

//
// Configration for OIDC
//
var	oidcConfig = null;

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
// Mountpath		: /<config path>/login
//--------------------------------------------------------------
//
// URL: /<config path>/login
//

//
// Login async function
//
async function oidcLogin()
{
	if(!r3util.isSafeEntity(oidcConfig)){
		var error = new Error('Please check your configuarion(json) because it is invalid.');
		console.error(error.message);
		throw error;
	}

	//
	// Create openid client
	//
	// Issuer.discovery returns Promise
	// https://github.com/panva/node-openid-client/blob/main/lib/issuer.js#L210
	//
	var oidcDiscovery = Issuer.discover(oidcConfig.oidcDiscoveryUrl);

	//
	// Try to login
	//
	await oidcDiscovery.then(function(oidcIssuer){
		//
		// put debug message
		//
		if(r3util.isSafeBoolean(oidcConfig.debug) && oidcConfig.debug){
			// debug message
			console.log('[OIDC debug] Discovered issuer %s %O', oidcIssuer.issuer, oidcIssuer.metadata);

			// hook for debugging
			custom.setHttpOptionsDefaults({
				hooks: {
					beforeRequest: [
						function(options){
							console.log('[OIDC debug] Request URL : %s %s', options.method.toUpperCase(), options.url.href);
							console.log('[OIDC debug] Request HEADERS : %o', options.headers);
							if(options.body){
								console.log('[OIDC debug] Request BODY : %s', options.body);
							}
						}
					],
					afterResponse: [
						function(response){
							console.log('[OIDC debug] Response URL : %s %s', response.request.options.method.toUpperCase(), response.request.options.url.href);
							console.log('[OIDC debug] Response STATUS : %i', response.statusCode);
							console.log('[OIDC debug] Response HEADERS : %o', response.headers);
							if (response.body) {
								console.log('[OIDC debug] Response BODY : %s', response.body);
							}
							return response;
						}
					]
				}
			});
		}

		//
		// Create a client handler
		//
		var clientParams = {
			client_id:		oidcConfig.params.client_id,
			client_secret:	oidcConfig.params.client_secret,
			redirect_uris:	[ oidcConfig.params.redirectUrl ]
		};
		var client = new oidcIssuer.Client(clientParams);
		client[custom.clock_tolerance] = 5;							// to allow a second 5 skew

		//
		// Calls passport middleware
		//
		passport.use(
			'oidc', 
			new Strategy(
				{ client },
				function(tokenset, done){
					return done(null, tokenset.id_token);
				}
			)
		);
	}).catch(function(error){
		console.error('Authenticate discovery Error by ' + error.message);
		throw error;
	});
}

//
// Login by calling passport.authenticate
//
var authenticate = async function(Request, Response, Next)
{
	//
	// Login by invoking passport middleware to get an token
	//
	await oidcLogin(Request, Response, Next);

	//
	// Create and return Promise object
	//
	return new Promise(function(resolve, reject){
		passport.authenticate(
			'oidc',
			{
				scope:	oidcConfig.scope
			},
			function(error, token){
				if(error){
					reject(error);
				}
				resolve(token);
			})(Request, Response, Next);

	}).catch(function (error){
		console.error('Authenticate passport.authenticate Error by ' + error.message);
		Response.redirect('/');
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
async function oidcAuthenticate(Request, Response, Next)
{
	var	token = await authenticate(Request, Response, Next).catch(function(error){
		console.error(error.message);
		throw error;
	});
	return token;
}

//
// Utility function for token
//
async function oidcVerifyToken(token)
{
	var	jwtParam	= {
		issuer:		oidcConfig.oidcDiscoveryUrl,
		audience:	oidcConfig.params.client_id
	};
	var	strurl		= oidcConfig.oidcDiscoveryUrl + '/keys';
	var	JWKS		= createRemoteJWKSet(new URL(strurl));

	await jwtVerify(token, JWKS, jwtParam).catch(function(error){
		console.error(error.message);
		throw error;
	});
}

//
// Authentication
//
var sessionize = async function(Request, Response, Next)
{
	if(!r3util.isSafeEntity(oidcConfig)){
		var error = 'Please check your configuarion(json) because it is invalid.';
		console.error('Failed to sessionize init, ' + error);
		Response.status(500);									// 500: Internal Server Error
		Response.send(error);
		return;
	}

	//
	// Get oidc token in request
	//
	await oidcAuthenticate(Request, Response, Next).then(async function(oidc_token){
		//
		// get payload in oidc token
		//
		var	parts = oidc_token.split('.', 2);
		if(2 > parts.length){
			var error = 'Failed to parse payload from oidc token.';
			console.error(error);
			Response.status(401);									// 401: Unauthorized
			Response.send(error);
			return;
		}
		var raw_payload	= new TextDecoder().decode(decode(parts[1]));
		if(!r3util.isSafeJSON(raw_payload)){
			error = 'Failed to decode json payload from oidc token.';
			console.error(error);
			Response.status(401);									// 401: Unauthorized
			Response.send(error);
			return;
		}
		var	payload = JSON.parse(raw_payload);

		//
		// put debug message
		//
		if(r3util.isSafeBoolean(oidcConfig.debug) && oidcConfig.debug){
			console.log('[OIDC debug] payload = ' + JSON.stringify(payload));
		}

		//
		// check user name key
		//
		if(r3util.isSafeString(oidcConfig.params.usernamekey)){
			var	found_key = false;
			Object.keys(payload).forEach(function(onekey){
				if(onekey == oidcConfig.params.usernamekey){
					found_key = true;
				}
			});
			if(!found_key || !r3util.isSafeString(payload[oidcConfig.params.usernamekey])){
				error = 'Not find or empty user name in oidc token.';
				console.error(error);
				Response.status(401);									// 401: Unauthorized
				Response.send(error);
				return;
			}
		}

		//
		// Verify token
		//
		await oidcVerifyToken(oidc_token).then(function(){
			//
			// oidc token verified
			//

			// sessionize
			Response.session = null;								// session removed
			Response.cookie(oidcConfig.params.cookiename, oidc_token, {
				httpOnly:	true,
				secure:		Request.protocol === 'https',
				maxAge:		oidcConfig.params.cookieexpire * 1000,	// set expire
			});
			Response.redirect('/');

		}).catch(function(err){
			console.error('Failed to verify oidc token by ' + err.message);
			Response.status(401);									// 401: Unauthorized
			Response.send(error);
		});

	}).catch(function(err){
		error = 'Failed to get oidc token in request.' + err.message;
		console.error(error);
		Response.status(401);										// 401: Unauthorized
		Response.send(error);
		return;
	});
};

//
// GET '/<config path>/login/cb'	: Login callback url
//
router.get('/login/cb', sessionize);

//--------------------------------------------------------------
// Mountpath		: /<config path>/logout
//--------------------------------------------------------------
//
// GET '/<config path>/logout'	: logout for OIDC
//
router.get('/logout', function(Request, Response, Next)			// eslint-disable-line no-unused-vars
{
	if(!r3util.isSafeEntity(oidcConfig)){
		var error = 'Please check your configuarion(json) because it is invalid.';
		console.error('Failed logout processing, ' + error);
		Response.status(500);									// 500: Internal Server Error
		Response.send(error);
		return;
	}

	//
	// Cleanup : clear the cookie if exist
	//
	Response.clearCookie(oidcConfig.params.cookiename);			// cookie name(id_token as deafult)

	Response.redirect(oidcConfig.mainUrl);

	return;
});

//--------------------------------------------------------------
// setConfig
//--------------------------------------------------------------
//
// setConfig is called in app.js to set configurations that are
// defined in configuration file(json)
//
var setConfig = function(config)
{
	// check required member in config
	if(	!r3util.isSafeEntity(config)						||
		!r3util.isSafeEntity(config.oidcDiscoveryUrl)		||
		!r3util.isSafeEntity(config.logoutUrl)				||
		!r3util.isSafeEntity(config.mainUrl)				||
		!r3util.isSafeEntity(config.params)					||
		!r3util.isSafeEntity(config.params.client_secret)	||
		!r3util.isSafeEntity(config.params.client_id)		||
		!r3util.isSafeEntity(config.params.redirectUrl)		)
	{
		console.error('Please check your configuarion(json) because it is invalid : config = ' + JSON.stringify(config));
		return false;
	}
	oidcConfig = config;

	if(!r3util.isSafeEntity(oidcConfig.params.usernamekey)){
		console.warn('The key name in configuration(usernamekey) is empty, then it check will no longer be performed.');
	}
	if(!r3util.isSafeEntity(oidcConfig.params.cookiename)){
		console.warn('The cookie name in configuration(cookiename) is empty, so id_token is used as default.');
		oidcConfig.params.cookiename = 'id_token';
	}
	if(!r3util.isSafeEntity(oidcConfig.params.cookieexpire) || 'number' != typeof oidcConfig.params.cookieexpire){
		console.warn('The cookie expire(sec) in configuration(cookieexpire) is empty, so id_token is used as default.');
		oidcConfig.params.cookieexpire = 60;			// 60 sec as default
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
var getConfig = function()
{
	if(!r3util.isSafeEntity(oidcConfig)){
		console.error('Please check your configuarion(json) because it is invalid.');
		return null;
	}
	return oidcConfig;
};

//---------------------------------------------------------
// Exports
//---------------------------------------------------------
module.exports = {
	router:		router,
	setConfig:	setConfig,
	getConfig:	getConfig
};

/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * End:
 * vim600: noexpandtab sw=4 ts=4 fdm=marker
 * vim<600: noexpandtab sw=4 ts=4
 */
