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
 * CREATE:   Fri Oct 6 2017
 * REVISION:
 *
 */

'use strict';

//---------------------------------------------------------
// Exports
//---------------------------------------------------------
//
// Direct SignIn to keystone
//
exports.getUserName = function(req)			// eslint-disable-line no-unused-vars
{
	return null;
};

exports.getSginInUri = function(req)		// eslint-disable-line no-unused-vars
{
	return null;
};

exports.getSginOutUri = function(req)		// eslint-disable-line no-unused-vars
{
	return null;
};

exports.getSignInType = function()
{
	return 'credential';
};

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
