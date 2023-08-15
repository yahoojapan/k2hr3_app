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
var	oidcConfig			= {};
var	oidcConfigCookieName= 'oidc_config_name';

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
function rawGetExtRouterName(req)
{
	if(!r3util.isSafeEntity(req) || !r3util.isSafeString(req.baseUrl)){
		console.error('Request base URL is somthing wrong, but returns default extrouter name(oidc).');
		return 'oidc';				// default
	}

	var	urlparts = decodeURI(req.baseUrl).split('/');
	if(!r3util.isArray(urlparts)){
		console.error('Request base URL is somthing wrong, but returns default extrouter name(oidc).');
		return 'oidc';				// default
	}

	//
	// Try to find '.../<extrouter name>/login/...' or '.../<extrouter name>/logout/...'
	//
	var	extRounterName = null;
	for(var cnt = 0; cnt < urlparts.length; ++cnt){
		if(!r3util.isSafeString(urlparts[cnt])){
			continue;
		}
		if(r3util.compareCaseString(urlparts[cnt], 'login') || r3util.compareCaseString(urlparts[cnt], 'logout')){
			break;
		}
		extRounterName = urlparts[cnt];
	}
	if(!r3util.isSafeString(extRounterName)){
		console.error('Failed to extract extRouter name from base URL(' + req.baseUrl + '), so returns default extrouter name(oidc).');
		return 'oidc';				// default
	}
	return extRounterName;
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
async function oidcLogin(Request)
{
	var	extRouterName = rawGetExtRouterName(Request);

	if(!r3util.isSafeEntity(oidcConfig[extRouterName])){
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
	var oidcDiscovery = Issuer.discover(oidcConfig[extRouterName].oidcDiscoveryUrl);

	//
	// Try to login
	//
	await oidcDiscovery.then(function(oidcIssuer){
		//
		// put debug message
		//
		if(r3util.isSafeBoolean(oidcConfig[extRouterName].debug) && oidcConfig[extRouterName].debug){
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
			client_id:		oidcConfig[extRouterName].params.client_id,
			client_secret:	oidcConfig[extRouterName].params.client_secret,
			redirect_uris:	[ oidcConfig[extRouterName].params.redirectUrl ]
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
	var	extRouterName = rawGetExtRouterName(Request);

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
				scope:	oidcConfig[extRouterName].scope
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
async function oidcVerifyToken(token, extRouterName)
{
	var	jwtParam	= {
		issuer:		oidcConfig[extRouterName].oidcDiscoveryUrl,
		audience:	oidcConfig[extRouterName].params.client_id
	};
	var	strurl		= oidcConfig[extRouterName].oidcDiscoveryUrl + '/keys';
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
	var	extRouterName = rawGetExtRouterName(Request);

	if(!r3util.isSafeEntity(oidcConfig) || !r3util.isSafeEntity(oidcConfig[extRouterName])){
		var error = 'Please check your configuarion(json) because it is invalid.';
		console.error('Failed to sessionize init, ' + error);
		Response.status(500);											// 500: Internal Server Error
		return;
	}

	//
	// Get oidc token in request
	//
	await oidcAuthenticate(Request, Response, Next).then(async function(oidc_token)
	{
		//
		// get payload in oidc token
		//
		var	parts = oidc_token.split('.', 2);
		if(2 > parts.length){
			var error = 'Failed to parse payload from oidc token.';
			console.error(error);
			Response.status(401);										// 401: Unauthorized
			return;
		}
		var raw_payload	= new TextDecoder().decode(decode(parts[1]));
		if(!r3util.isSafeJSON(raw_payload)){
			error = 'Failed to decode json payload from oidc token.';
			console.error(error);
			Response.status(401);										// 401: Unauthorized
			return;
		}
		var	payload = JSON.parse(raw_payload);

		//
		// put debug message
		//
		if(r3util.isSafeBoolean(oidcConfig[extRouterName].debug) && oidcConfig[extRouterName].debug){
			console.log('[OIDC debug] payload = ' + JSON.stringify(payload));
		}

		//
		// check user name key
		//
		if(r3util.isSafeString(oidcConfig[extRouterName].params.usernamekey)){
			var	found_key = false;
			Object.keys(payload).forEach(function(onekey){
				if(onekey == oidcConfig[extRouterName].params.usernamekey){
					found_key = true;
				}
			});
			if(!found_key || !r3util.isSafeString(payload[oidcConfig[extRouterName].params.usernamekey])){
				error = 'Not find or empty user name in oidc token.';
				console.error(error);
				Response.status(401);									// 401: Unauthorized
				return;
			}
		}

		//
		// Verify token
		//
		await oidcVerifyToken(oidc_token, extRouterName).then(function()
		{
			//
			// oidc token verified
			//

			// sessionize
			Response.session = null;									// session removed

			// token cookie
			Response.cookie(oidcConfig[extRouterName].params.cookiename, oidc_token, {
				httpOnly:	true,
				secure:		Request.protocol === 'https',
				maxAge:		oidcConfig[extRouterName].params.cookieexpire * 1000,	// set expire
			});

			// oidc name cookie
			Response.cookie(oidcConfigCookieName, extRouterName, {
				httpOnly:	true,
				secure:		Request.protocol === 'https',
				maxAge:		oidcConfig[extRouterName].params.cookieexpire * 1000,	// set expire
			});

			Response.redirect('/');

		}).catch(function(err){
			console.error('Failed to verify oidc token by ' + err.message);
			Response.status(401);										// 401: Unauthorized
			return;
		});

	}).catch(function(err){
		error = 'Failed to get oidc token in request.' + err.message;
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
router.get('/logout', function(Request, Response, Next)			// eslint-disable-line no-unused-vars
{
	var	extRouterName = rawGetExtRouterName(Request);

	if(!r3util.isSafeEntity(oidcConfig[extRouterName])){
		var error = 'Please check your configuarion(json) because it is invalid.';
		console.error('Failed logout processing, ' + error);
		Response.status(500);									// 500: Internal Server Error
		Response.send(error);
		return;
	}

	//
	// Cleanup : clear the cookie if exist
	//
	Response.clearCookie(oidcConfig[extRouterName].params.cookiename);	// cookie name(id_token as deafult)
	Response.clearCookie(oidcConfigCookieName);							// cookie name(oidc config name)

	Response.redirect(oidcConfig[extRouterName].mainUrl);

	return;
});

//--------------------------------------------------------------
// setConfig
//--------------------------------------------------------------
//
// setConfig is called in app.js to set configurations that are
// defined in configuration file(json)
//
var setConfig = function(config, extRouterName)
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
	if(!r3util.isSafeString(extRouterName)){
		console.error('Please check your configuarion(json) because it does not have ' + JSON.stringify(extRouterName) + ' entity or it is empty.');
		return false;
	}
	if(r3util.isSafeEntity(oidcConfig[extRouterName])){
		console.error('Please check your configuarion(json) because it has multi ' + JSON.stringify(extRouterName) + ' entities.');
		return false;
	}

	oidcConfig[extRouterName] = config;

	if(!r3util.isSafeEntity(oidcConfig[extRouterName].params.usernamekey)){
		console.warn('The key name in configuration(usernamekey) is empty, then it check will no longer be performed.');
	}
	if(!r3util.isSafeEntity(oidcConfig[extRouterName].params.cookiename)){
		console.warn('The cookie name in configuration(cookiename) is empty, so id_token is used as default.');
		oidcConfig[extRouterName].params.cookiename = 'id_token';
	}
	if(!r3util.isSafeEntity(oidcConfig[extRouterName].params.cookieexpire) || 'number' != typeof oidcConfig[extRouterName].params.cookieexpire){
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
	router:					router,
	setConfig:				setConfig,
	getConfig:				getConfig,
	oidcConfigCookieName:	oidcConfigCookieName
};

/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * End:
 * vim600: noexpandtab sw=4 ts=4 fdm=marker
 * vim<600: noexpandtab sw=4 ts=4
 */
