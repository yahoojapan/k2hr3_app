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
 * CREATE:   Tue Aug 15 2017
 * REVISION:
 *
 */

import express		from 'express';
import R3UserToken	from './lib/libr3tokens';
import R3AppConfig	from './lib/libr3appconfig';

let	router		= express.Router();

//
// Mountpath				: '/' or '/index.html'
//
// GET '/'					: get main page
//
router.get('/', (req: express.Request, res: express.Response, next: express.NextFunction) =>
{
	let	_req	= req;
	let	_res	= res;
	let	_next	= next;

	let	_appConf= new R3AppConfig();

	//
	// Get unscoped token & user name
	//
	let	tokensObj = new R3UserToken(req);
	tokensObj.getUnscopedUserToken((error: Error | null, token: string | null) =>
	{
		let	errormsg	= '';

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
		let	dateobj			= new Date();
		let	copyyear		= dateobj.getFullYear();
		let	username		= tokensObj.getUserName();
		let	apischeme		= _appConf.getApiScheme();
		let	apihost			= _appConf.getApiHost();
		let	apiport			= _appConf.getApiPort();
		let	appmenu			= _appConf.getAppMenu();					// this is object(array)
		let	userdata		= _appConf.getUserData();					// this is string for User Date Script
		let	secretyaml		= _appConf.getSecretYaml();					// this is string for Secret Yaml
		let	sidecaryaml		= _appConf.getSidecarYaml();				// this is string for Sidecar Yaml
		let	crcobj			= _appConf.getCRCObject();					// Custom Registration Codes(CRC) object
		let	signintype		= tokensObj.getSignInType();
		let	signinurl		= tokensObj.getSignInUrl();
		let	signouturl		= tokensObj.getSignOutUrl();
		let	configname		= tokensObj.getConfigName();				// If using ExtRouter(ex. OIDC) and has a token, the config name that created the token is set.
		let	uselocaltenant	= _appConf.useLocalTenant();
		let	lang			= _appConf.getLang();
		let	dbgheader		= '';
		let	dbgvalue		= '';
		let	dbgresheader	= '';
		if('development' === req.app.get('env')){
			dbgheader		= 'x-k2hr3-debug';
			dbgvalue		= 'debug';
			dbgresheader	= 'x-k2hr3-error';
		}

		_res.render(
			'index',
			{
				title:			'K2HR3',
				apischeme:		apischeme,
				apihost:		apihost,
				apiport:		String(apiport),
				appmenu:		escape(JSON.stringify(appmenu)),
				userdata:		escape(JSON.stringify(userdata)),
				secretyaml:		escape(JSON.stringify(secretyaml)),
				sidecaryaml:	escape(JSON.stringify(sidecaryaml)),
				crcobj:			escape(JSON.stringify(crcobj)),
				username:		username,
				unscopedtoken:	token,
				signintype:		signintype,
				signinurl:		escape(JSON.stringify(signinurl)),
				signouturl:		escape(JSON.stringify(signouturl)),
				configname:		escape(JSON.stringify(configname)),
				uselocaltenant:	uselocaltenant,
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

export default router;

/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * End:
 * vim600: noexpandtab sw=4 ts=4 fdm=marker
 * vim<600: noexpandtab sw=4 ts=4
 */
