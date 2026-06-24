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

import express			from 'express';
import { base64url }	from 'jose';
import { oidcConfigCookieName, getConfig }	from '../oidc';
import { isOIDCExtRouterConfig, isSafeEntity, isSafeHaskey, isSafeJSON, isSafeObject, isSafeString, OIDCExtRouterConfig, SignMinUrlEntry, SignMinUrls, SignUrlEntry, SignUrls }	from './libr3util';

//
// rawGetOidcConfigName
//
const rawGetOidcConfigName = (req: express.Request): string | null =>
{
	if(	!isSafeString(oidcConfigCookieName) 			||
		!isSafeEntity(req)								||
		!isSafeEntity(req.cookies) 						||
		!isSafeString(req.cookies[oidcConfigCookieName]))
	{
		return null;
	}
	return req.cookies[oidcConfigCookieName];
};

//
// rawGetOtherToken
//
const rawGetOtherToken = (req: express.Request): string | null =>
{
	let	configName											= rawGetOidcConfigName(req);
	let config: Record<string, OIDCExtRouterConfig> | null	= getConfig();

	if( !isSafeString(configName)								||
		!isSafeObject(config)									||
		!isSafeHaskey(config, configName)						||
		!isOIDCExtRouterConfig(config[configName])				||
		!isSafeHaskey(config[configName].params, 'cookiename')	||
		!isSafeString(config[configName].params.cookiename)		)
	{
		console.error('Not find cookie name in configuration.');
		return null;
	}
	const	cookieName = config[configName].params.cookiename;

	if(	!isSafeEntity(req)						||
		!isSafeObject(req.cookies) 				||
		!isSafeHaskey(req.cookies, cookieName)	||
		!isSafeString(req.cookies[cookieName])	)
	{
		return null;
	}
	return req.cookies[cookieName];
};

//
// rawGetOidcUsername
//
const rawGetOidcUsername = (req: express.Request): string | null =>
{
	let	configName											= rawGetOidcConfigName(req);
	let config: Record<string, OIDCExtRouterConfig> | null	= getConfig();

	if( !isSafeString(configName)								||
		!isSafeObject(config)									||
		!isSafeHaskey(config, configName)						||
		!isOIDCExtRouterConfig(config[configName])				||
		!isSafeHaskey(config[configName].params, 'usernamekey')	||
		!isSafeString(config[configName].params.usernamekey)		)
	{
		console.error('Not find user name key in configuration.');
		return null;
	}
	const	userNameKey = config[configName].params.usernamekey;

	const	oidc_token	= rawGetOtherToken(req);
	if(!isSafeString(oidc_token)){
		console.error('Not find ' + config[configName].params.cookiename + ' key in cookie.');
		return null;
	}

	const	parts		= oidc_token.split('.', 2);
	if(2 > parts.length){
		console.error('Failed to parse payload from oidc token.');
		return null;
	}

	const raw_payload	= new TextDecoder().decode(base64url.decode(parts[1]));
	if(!isSafeJSON(raw_payload)){
		console.error('Failed to decode json payload from oidc token.');
		return null;
	}

	const	payload		= JSON.parse(raw_payload);
	if(!isSafeEntity(payload) || !isSafeHaskey(payload, userNameKey) || !isSafeString(payload[userNameKey])){
		console.error('payload does not have user name key(' + userNameKey + ')');
		return null;
	}
	return payload[userNameKey];
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
const rawGetSignInUrl = (req: express.Request): SignMinUrls | SignMinUrlEntry | string | null =>
{
	if(	!isSafeEntity(req)				||
		!isSafeEntity(req.headers)		||
		!isSafeString(req.headers.host)	||
		!isSafeString(req.protocol)		)
	{
		return null;
	}
	const	config: Record<string, OIDCExtRouterConfig> | null = getConfig();

	if(!isSafeObject(config)){
		console.error('no valid SignInUrl');
		return null;
	}

	let	allSignUrls: SignUrls	= {};
	let	isSet: boolean			= false;

	Object.keys(config).forEach((oidcName) =>
	{
		if(isOIDCExtRouterConfig(config[oidcName])){
			let	oneOidc: SignUrlEntry = {
				url:		'',
				display:	''
			};
			oneOidc.url	= config[oidcName].params.redirectUrl;

			if(isSafeString(config[oidcName].displayName)){
				oneOidc.display	= config[oidcName].displayName;
			}else{
				oneOidc.display	= oidcName;
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
const rawGetSignOutUrl = (req: express.Request): SignMinUrls | SignMinUrlEntry | string | null =>
{
	if(	!isSafeEntity(req)				||
		!isSafeEntity(req.headers)		||
		!isSafeString(req.headers.host)	||
		!isSafeString(req.protocol)		)
	{
		return null;
	}
	const	config: Record<string, OIDCExtRouterConfig> | null = getConfig();

	if(!isSafeObject(config)){
		console.error('no valid SignOutUrl');
		return null;
	}

	let	allSignUrls: SignMinUrls	= {};
	let	isSet: boolean				= false;

	Object.keys(config).forEach((oidcName) =>
	{
		if(isOIDCExtRouterConfig(config[oidcName])){
			let	oneOidc: SignMinUrlEntry = {
				url:	'',
			};
			oneOidc.url				= config[oidcName].logoutUrl;
			allSignUrls[oidcName]	= oneOidc;
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
export const getOtherToken = (req: express.Request): string | null =>
{
	return rawGetOtherToken(req);
};

export const getUserName = (req: express.Request): string | null =>
{
	return rawGetOidcUsername(req);
};

export const getConfigName = (req: express.Request): string | null =>
{
	return rawGetOidcConfigName(req);
};

export const getSignInUri = (req: express.Request): SignMinUrls | SignMinUrlEntry | string | null =>
{
	return rawGetSignInUrl(req);
};

export const getSignOutUri = (req: express.Request): SignMinUrls | SignMinUrlEntry | string | null =>
{
	return rawGetSignOutUrl(req);
};

export const getSignInType = (): string =>
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
