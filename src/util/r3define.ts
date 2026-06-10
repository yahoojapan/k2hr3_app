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
 * CREATE:   Fri Sep 1 2017
 * REVISION:
 *
 */

import { r3CompareCaseString } from '../util/r3util';

export const r3GetTextRes = (lang) =>
{
	// [NOTE][FIXME]
	// import could not be used in scope area. And require with dynamic file path
	// causes following warning by webpack.
	// 'Critical dependency: the request of a dependency is an expression'
	// Thus this function uses require with static file path. :-(
	//
	let	r3TextRes;
	if(r3CompareCaseString(lang, 'ja')){
		r3TextRes = require('./r3textres_ja').r3TextRes;
	}else{
		r3TextRes = require('./r3textres_en').r3TextRes;
	}
	return r3TextRes;
};

//
// Effect in Policy Resources
//
export const policyEffects	= [
	{
		name:					'ALLOW',
		value:					'allow'
	},
	{
		name:					'DENY',
		value:					'deny'
	}
];

//
// Action in Policy Resources
//
export const policyActions	= [
	{
		name:					'READ',
		value:					'yrn:yahoo::::action:read'
	},
	{
		name:					'WRITE',
		value:					'yrn:yahoo::::action:write'
	}
];

//
// Regex String Resources
//
export const regYrnTenantPathPrefix	= 'yrn:yahoo:::';
export const regYrnAnyTenantPath	= '^yrn:yahoo:::(.*)';
export const regYrnAnyRolePath		= '^yrn:yahoo:(.*)::(.*):role:(.*)';
export const regYrnAnyPolicyPath	= '^yrn:yahoo:(.*)::(.*):policy:(.*)';
export const regYrnAnyResourcePath	= '^yrn:yahoo:(.*)::(.*):resource:(.*)';
export const regTenantUserName		= '^[a-zA-Z0-9!-/:-@[-`{-~]*$';

//
// Const strings
//
export const localTenantPrefix		= 'local@';

/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * End:
 * vim600: noexpandtab sw=4 ts=4 fdm=marker
 * vim<600: noexpandtab sw=4 ts=4
 */
