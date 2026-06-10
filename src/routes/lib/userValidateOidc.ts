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

'use strict';

var r3util		= require('./libr3util');
var	oidc		= require('../oidc');
var { decode }	= require('jose').base64url;

//
// rawGetOtherToken
//
var rawGetOtherToken = function(req)
{
	var	configName	= rawGetOidcConfigName(req);
	var config		= oidc.getConfig();

	if( !r3util.isSafeString(configName)							||
		!r3util.isSafeEntity(config)								||
		!r3util.isSafeEntity(config[configName])					||
		!r3util.isSafeEntity(config[configName].params)				||
		!r3util.isSafeEntity(config[configName].params.cookiename)	)
	{
		console.error('Not find cookie name in configuration.');
		return null;
	}
	var	cookieName = config[configName].params.cookiename;

	if(	!r3util.isSafeEntity(req)						||
		!r3util.isSafeEntity(req.cookies) 				||
		!r3util.isSafeEntity(req.cookies[cookieName])	)
	{
		return null;
	}
	return req.cookies[cookieName];
};

//
// rawGetOidcUsername
//
var rawGetOidcUsername = function(req)
{
	var	configName	= rawGetOidcConfigName(req);
	var config		= oidc.getConfig();
	if( !r3util.isSafeString(configName)							||
		!r3util.isSafeEntity(config)								||
		!r3util.isSafeEntity(config[configName])					||
		!r3util.isSafeEntity(config[configName].params)				||
		!r3util.isSafeEntity(config[configName].params.usernamekey)	)
	{
		console.error('Not find user name key in configuration.');
		return null;
	}
	var	userNameKey = config[configName].params.usernamekey;

	var oidc_token	= rawGetOtherToken(req);
	if(!r3util.isSafeString(oidc_token)){
		console.error('Not find ' + config.params.cookiename + ' key in cookie.');
		return null;
	}

	var	parts		= oidc_token.split('.', 2);
	if(2 > parts.length){
		console.error('Failed to parse payload from oidc token.');
		return null;
	}

	var raw_payload	= new TextDecoder().decode(decode(parts[1]));
	if(!r3util.isSafeJSON(raw_payload)){
		console.error('Failed to decode json payload from oidc token.');
		return null;
	}

	var	payload		= JSON.parse(raw_payload);
	if(!r3util.isSafeEntity(payload) || !r3util.isSafeEntity(payload[userNameKey])){
		console.error('payload does not have user name key(' + userNameKey + ')');
		return null;
	}
	return payload[userNameKey];
};

//
// rawGetOidcConfigName
//
var rawGetOidcConfigName = function(req)
{
	if(	!r3util.isSafeEntity(req)									||
		!r3util.isSafeEntity(req.cookies) 							||
		!r3util.isSafeEntity(req.cookies[oidc.oidcConfigCookieName]))
	{
		return null;
	}
	return req.cookies[oidc.oidcConfigCookieName];
};

//
// Return object or null:
//	{
//		'<oidc name>': {
//			'display':	'<display name>',
//			'url':		'<signin URL>'
//		},
//		...
//		...
//	}
//
var rawGetSignInUrl = function(req)
{
	if(	!r3util.isSafeEntity(req)				||
		!r3util.isSafeEntity(req.headers)		||
		!r3util.isSafeString(req.headers.host)	||
		!r3util.isSafeString(req.protocol)		)
	{
		return null;
	}

	var config = oidc.getConfig();

	if(!r3util.isSafeEntity(config)){
		console.error('no valid SignInUrl');
		return null;
	}

	var	allSignUrls	= {};
	var	isSet		= false;

	Object.keys(config).forEach(function(oidcName)
	{
		if(r3util.isSafeEntity(config[oidcName].params) && r3util.isSafeEntity(config[oidcName].params.redirectUrl)){
			var	oneOidc = {};
			oneOidc.url = config[oidcName].params.redirectUrl;

			if(r3util.isSafeString(config[oidcName].displayName)){
				oneOidc.display = config[oidcName].displayName;
			}else{
				oneOidc.display = oidcName;
			}
			allSignUrls[oidcName]	= oneOidc;
			isSet					= true;
		}else{
			console.error('no valid SignInUrl for ' + oidcName + ' in config, so skip this');
		}
	});

	if(!isSet){
		console.error('no valid SignInUrl');
		return null;
	}

	return allSignUrls;
};

//
// Return object or null:
//	{
//		'<oidc name>': '<signout URL>',
//		...
//		...
//	}
//
var rawGetSignOutUrl = function(req)
{
	if(	!r3util.isSafeEntity(req)				||
		!r3util.isSafeEntity(req.headers)		||
		!r3util.isSafeString(req.headers.host)	||
		!r3util.isSafeString(req.protocol)		)
	{
		return null;
	}

	var config = oidc.getConfig();

	if(!r3util.isSafeEntity(config)){
		console.error('no valid SignOutUrl');
		return null;
	}

	var	allSignUrls	= {};
	var	isSet		= false;

	Object.keys(config).forEach(function(oidcName)
	{
		if(r3util.isSafeString(config[oidcName].logoutUrl)){
			allSignUrls[oidcName]	= config[oidcName].logoutUrl;
			isSet					= true;
		}else{
			console.error('no valid SignOutUrl for ' + oidcName + ' in config, so skip this');
		}
	});

	if(!isSet){
		console.error('no valid SignInUrl');
		return null;
	}
	return allSignUrls;
};

//---------------------------------------------------------
// Exports
//---------------------------------------------------------
exports.getOtherToken = function(req)
{
	return rawGetOtherToken(req);
};

exports.getUserName = function(req)
{
	return rawGetOidcUsername(req);
};

exports.getConfigName = function(req)
{
	return rawGetOidcConfigName(req);
};

exports.getSignInUri = function(req)
{
	return rawGetSignInUrl(req);
}; 

exports.getSignOutUri = function(req)
{
	return rawGetSignOutUrl(req);
};

exports.getSignInType = function()
{
	return 'unsopedtoken';
};

/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * End:
 * vim600: noexpandtab sw=4 ts=4 fdm=marker
 * vim<600: noexpandtab sw=4 ts=4
 */
