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
 * CREATE:   Tue Aug 15 2017
 * REVISION:
 *
 */

'use strict';

var	express		= require('express');
var	router		= express.Router();

var	libTokens	= require('./lib/libr3tokens').r3UserToken;
var	appConfig	= require('./lib/libr3appconfig').r3AppConfig;

//
// Mountpath				: '/' or '/index.html'
//
// GET '/'					: get main page
//
router.get('/', function(req, res, next)							// eslint-disable-line no-unused-vars
{
	var	_req	= req;												// eslint-disable-line no-unused-vars
	var	_res	= res;
	var	_next	= next;												// eslint-disable-line no-unused-vars

	var	_appConf= new appConfig();

	//
	// Get unscoped token & user name
	//
	var	tokensObj	= new libTokens(req);
	tokensObj.getUnscopedUserToken(function(error, token)
	{
		var	errormsg	= '';

		if(null !== error){
			// [NOTE]
			// Only set error message when error.message starts with 'ERROR RESPONSE'.
			//
			errormsg = (undefined !== error.message && null !== error.message && 'string' == typeof error.message && -1 !== error.message.indexOf('K2HR3 API SERVER ERROR')) ? error.message : '';
			console.error(errormsg);

			// [NOTE]
			// Do not respond error here, this case is almost not sign in(or credential mode).
			//
			//error.status(400);										// 400: Bad Request
			//_next(error);
			//return;
		}
		var	dateobj		= new Date();
		var	copyyear	= dateobj.getFullYear();
		var	username	= tokensObj.getUserName();
		var	apischeme	= _appConf.getApiScheme();
		var	apihost		= _appConf.getApiHost();
		var	apiport		= _appConf.getApiPort();
		var	appmenu		= _appConf.getAppMenu();					// this is object(array)
		var	userdata	= _appConf.getUserData();					// this is string for script file
		var	signintype	= tokensObj.getSignInType();
		var	signinurl	= tokensObj.getSignInUrl();
		var	signouturl	= tokensObj.getSignOutUrl();
		var	lang		= _appConf.getLang();
		var	dbgheader	= '';
		var	dbgvalue	= '';
		var	dbgresheader= '';
		if('development' === req.app.get('env')){
			dbgheader	= 'x-k2hr3-debug';
			dbgvalue	= 'debug';
			dbgresheader= 'x-k2hr3-error';
		}
		_res.render(
			'index',
			{
				title:			'K2HR3',
				apischeme:		apischeme,
				apihost:		apihost,
				apiport:		apiport,
				appmenu:		escape(JSON.stringify(appmenu)),
				userdata:		escape(JSON.stringify(userdata)),
				username:		username,
				unscopedtoken:	token,
				signintype:		signintype,
				signinurl:		signinurl,
				signouturl:		signouturl,
				lang:			lang,
				dbgheader:		dbgheader,
				dbgvalue:		dbgvalue,
				dbgresheader:	dbgresheader,
				errormsg:		errormsg,
				copyyear:		copyyear
			}
		);
	});
});

module.exports = router;

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
