/*
 *
 * K2HR3 Web Application
 *
 * Copyright 2017 Yahoo! Japan Corporation.
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
	var config = oidc.getConfig();
	if( !r3util.isSafeEntity(config)					||
		!r3util.isSafeEntity(config.params)				||
		!r3util.isSafeEntity(config.params.cookiename)	)
	{
		console.error('Not find cookie name in configuration.');
		return null;
	}

	if(	!r3util.isSafeEntity(req)			||
		!r3util.isSafeEntity(req.cookies) 	||
		!r3util.isSafeEntity(req.cookies[config.params.cookiename]))
	{
		return null;
	}

	return req.cookies[config.params.cookiename];
};

//
// rawGetOidcUsername
//
var rawGetOidcUsername = function(req)
{
	var config = oidc.getConfig();
	if( !r3util.isSafeEntity(config)					||
		!r3util.isSafeEntity(config.params)				||
		!r3util.isSafeEntity(config.params.cookiename)	||
		!r3util.isSafeEntity(config.params.usernamekey)	)
	{
		console.error('Not find cookie/user name key in configuration.');
		return null;
	}

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
	if(!r3util.isSafeEntity(payload) || !r3util.isSafeEntity(payload[config.params.usernamekey])){
		console.error('payload does not have user name key(' + config.params.usernamekey + ')');
		return null;
	}
	return payload[config.params.usernamekey];
};

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
	if( r3util.isSafeEntity(config)						&&
		r3util.isSafeEntity(config.params)				&&
		r3util.isSafeEntity(config.params.redirectUrl)	)
	{
		return config.params.redirectUrl;
	}
	console.error('no valid SignInUrl');
	return null;
};

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
	if(	r3util.isSafeEntity(config)				&&
		r3util.isSafeEntity(config.logoutUrl)	)
	{
		return config.logoutUrl;
	}
	console.error('no valid SignOutUrl');
	return null;
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

exports.getSginInUri = function(req)
{
	return rawGetSignInUrl(req);
}; 

exports.getSginOutUri = function(req)
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
