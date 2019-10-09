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
 * AUTHOR:   Takeshi Nakatani
 * CREATE:   Thu Aug 31 2017
 * REVISION:
 *
 */

// for types
export const resourceType			= 'resource';
export const roleType				= 'role';
export const policyType				= 'policy';
export const serviceType			= 'service';

// for types of messages
export const errorType				= 'error';
export const warningType			= 'warning';
export const infoType				= 'information';

// for resource view
export const resourceTypeString		= 'string';
export const resourceTypeObject		= 'object';

// for resource view
export const serviceResTypeUrl		= 'verifyUrl';
export const serviceResTypeObject	= 'staticResourceObject';
export const serviceResTypeUnknown	= 'unknown';

// for action
export const actionTypeName			= 'name';
export const actionTypeValue		= 'value';
export const actionTypeNewKey		= 'newkey';
export const actionTypeNewValue		= 'newvalue';
export const actionTypeDelete		= 'delete';
export const actionTypeAdd			= 'add';
export const actionTypeUp			= 'up';
export const actionTypeDown			= 'down';
export const actionTypeHostName		= 'hostname';
export const actionTypeHostAuxiliary= 'auxiliary';

export const signinUnknownType		= 'unknown';
export const signinUnscopedToken	= 'unsopedtoken';
export const signinCredential		= 'credential';

// [TODO]
// Now we do not have template engine for this, thus we replace following static string.
//
export const kwApiHostForUD			= /{{= %K2HR3_API_HOST_URI% }}/g;
export const kwIncludePathForUD		= /{{= %K2HR3_USERDATA_INCLUDE_PATH% }}/g;
export const kwRoleTokenForSecret	= /{{= %K2HR3_ROLETOKEN_IN_SECRET% }}/g;
export const kwRoleTokenForRoleYrn	= /{{= %K2HR3_ROLEYRN_IN_SIDECAR% }}/g;

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
