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
 * CREATE:   Thu Sep 7 2017
 * REVISION:
 *
 */

import { kwApiHostForUD, kwIncludePathForUD, kwRoleTokenForSecret, kwRoleTokenForRoleYrn, signinUnknownType, signinUnscopedToken, signinCredential }	from '../util/r3types';
import { r3ConvertFromJSON, r3UnescapeHTML, r3CompareCaseString, r3IsEmptyString, r3IsEmptyEntity, r3IsSafeTypedEntity }	from '../util/r3util';

//
// Load Global object for K2HR3 Context
//
const r3GlobalObject = (function()
{
	//
	// K2HR3 global variables from k2hr3global which is the only global variable.
	//
	let	r3globaltmp	= k2hr3global;										// eslint-disable-line no-undef

	// global app menu
	let	_appmenu = null;
	if(!r3IsEmptyEntity(r3globaltmp.r3appmenu)){
		let	_decodemenu	= unescape(r3globaltmp.r3appmenu);				// decode
		let	_objmenu	= r3ConvertFromJSON(_decodemenu);				// parse
		if(r3IsSafeTypedEntity(_objmenu, 'array') && 0 < _objmenu.length){
			_appmenu = _objmenu;
		}else{
			console.info('There is no application global menu.');
		}
	}else{
		console.info('There is no application global menu.');
	}

	// user script
	let	_userdata = null;
	if(!r3IsEmptyEntity(r3globaltmp.r3userdata)){
		let	_decodeuserdata	= unescape(r3globaltmp.r3userdata);			// decode
		let	_templuserdata	= r3ConvertFromJSON(_decodeuserdata);		// parse
		if(r3IsSafeTypedEntity(_templuserdata, 'string')){
			_userdata = _templuserdata;
		}else{
			console.info('There is no user script template.');
		}
	}else{
		console.info('There is no user script template.');
	}

	// secret yaml
	let	_secretyaml = null;
	if(!r3IsEmptyEntity(r3globaltmp.r3secretyaml)){
		let	_decodesecretyaml	= unescape(r3globaltmp.r3secretyaml);	// decode
		let	_templsecretyaml	= r3ConvertFromJSON(_decodesecretyaml);	// parse
		if(r3IsSafeTypedEntity(_templsecretyaml, 'string')){
			_secretyaml = _templsecretyaml;
		}else{
			console.info('There is no secret yaml template.');
		}
	}else{
		console.info('There is no secret yaml template.');
	}

	// sidecar yaml
	let	_sidecaryaml = null;
	if(!r3IsEmptyEntity(r3globaltmp.r3sidecaryaml)){
		let	_decodesidecaryaml	= unescape(r3globaltmp.r3sidecaryaml);	// decode
		let	_templsidecaryaml	= r3ConvertFromJSON(_decodesidecaryaml);// parse
		if(r3IsSafeTypedEntity(_templsidecaryaml, 'string')){
			_sidecaryaml = _templsidecaryaml;
		}else{
			console.info('There is no sidecar yaml template.');
		}
	}else{
		console.info('There is no sidecar yaml template.');
	}

	// default object values
	let	r3globalobj	= {
		apischeme:		(r3IsEmptyString(r3globaltmp.r3apischeme)	? '' : r3globaltmp.r3apischeme),
		apihost:		(r3IsEmptyString(r3globaltmp.r3apihost)		? '' : r3globaltmp.r3apihost),
		apiport:		((r3IsEmptyEntity(r3globaltmp.r3apiport) || isNaN(r3globaltmp.r3apiport)) ? 0 : r3globaltmp.r3apiport),
		appmenu:		_appmenu,
		userdata:		_userdata,
		secretyaml:		_secretyaml,
		sidecaryaml:	_sidecaryaml,
		login:			false,
		username:		'',
		unscopedtoken:	'',
		signintype:		(r3CompareCaseString(r3globaltmp.signintype, signinUnscopedToken) ? signinUnscopedToken : r3CompareCaseString(r3globaltmp.signintype, signinCredential) ? signinCredential : signinUnknownType),
		signinurl:		(r3IsEmptyString(r3globaltmp.signinurl)		? null	: r3globaltmp.signinurl),
		signouturl:		(r3IsEmptyString(r3globaltmp.signouturl)	? null	: r3globaltmp.signouturl),
		lang:			(r3IsEmptyString(r3globaltmp.lang)			? 'en'	: r3globaltmp.lang),
		dbgheader:		(r3IsEmptyString(r3globaltmp.dbgheader)		? ''	: r3globaltmp.dbgheader),
		dbgvalue:		(r3IsEmptyString(r3globaltmp.dbgvalue)		? ''	: r3globaltmp.dbgvalue),
		dbgresheader:	(r3IsEmptyString(r3globaltmp.dbgresheader)	? ''	: r3globaltmp.dbgresheader),
		errormsg:		(r3IsEmptyString(r3globaltmp.errormsg)		? null	: r3globaltmp.errormsg)
	};

	if(	!r3IsEmptyEntity(r3globaltmp)				&&
		!r3IsEmptyString(r3globaltmp.username)		&&
		!r3IsEmptyString(r3globaltmp.unscopedtoken)	)
	{
		r3globalobj.login			= true;
		r3globalobj.username		= r3globaltmp.username;
		r3globalobj.unscopedtoken	= r3globaltmp.unscopedtoken;
	}
	return r3globalobj;
}());

//
// K2HR3 Context Class
//
export default class R3Context
{
	// [NOTE]
	// If signin parameter is undefined(null), it is just after loading(initializing) application.
	// When user is signin/out, this parameter is not undefined(null).
	//
	constructor(signin, username, unscopedtoken)
	{
		this.apischeme					= r3GlobalObject.apischeme;		// k2hr3 api scheme
		this.apihost					= r3GlobalObject.apihost;		// k2hr3 api hostname
		this.apiport					= r3GlobalObject.apiport;		// k2hr3 api port
		this.appmenu					= r3GlobalObject.appmenu;		// k2hr3 app menu array
		this.userdata					= r3GlobalObject.userdata;		// k2hr3 user data script template
		this.secretyaml					= r3GlobalObject.secretyaml;	// k2hr3 secret yaml template
		this.sidecaryaml				= r3GlobalObject.sidecaryaml;	// k2hr3 sidecar yaml template
		this.signintype					= r3GlobalObject.signintype;	// SignIn Type
		this.signinurl					= r3GlobalObject.signinurl;		// SignIn URL
		this.signouturl					= r3GlobalObject.signouturl;	// SignOut URL
		this.lang						= r3GlobalObject.lang;			// Text resource language
		this.dbgHeaderName				= r3GlobalObject.dbgheader;		// Debug header name(= 'x-k2hr3-debug')
		this.dbgHeaderValue				= r3GlobalObject.dbgvalue;		// Debug header value
		this.dbgResHeaderName			= r3GlobalObject.dbgresheader;	// Debug response header name(= 'x-k2hr3-error')
		this.errormsg					= r3GlobalObject.errormsg;		// Error message

		// User name and Unscoped User Token
		if(	r3IsSafeTypedEntity(signin, 'boolean')	&&
			!r3IsEmptyString(username)				&&
			!r3IsEmptyString(unscopedtoken)			)
		{
			this.login					= true;							// Signed in
			this.user					= username;						// Using parameter
			this.unscopedUserToken		= unscopedtoken;				// 
		}else{
			if(r3IsSafeTypedEntity(signin, 'boolean')){
				this.login				= false;						// Signed out
				this.user				= '';							// 
				this.unscopedUserToken	= '';							// 
			}else{
				this.login				= r3GlobalObject.login;			// login / logout
				this.user				= r3GlobalObject.username;		// Using configuration
				this.unscopedUserToken	= r3GlobalObject.unscopedtoken;	// 
			}
		}
	}

	getApiScheme()
	{
		return this.apischeme;
	}

	getSafeApiScheme()
	{
		return (r3IsEmptyString(this.apischeme) ? 'http' : this.apischeme);
	}

	getApiHost()
	{
		return this.apihost;
	}

	getSafeApiHost()
	{
		return (r3IsEmptyString(this.apihost) ? 'localhost' : this.apihost);
	}

	getApiPort()
	{
		return this.apiport;
	}

	getSafeApiPort()
	{
		return ((r3IsEmptyEntity(this.apiport) || isNaN(this.apiport)) ? 80 : this.apiport);
	}

	getAppMenu()
	{
		return this.appmenu;
	}

	getSafeAppMenu()
	{
		return (r3IsEmptyEntity(this.appmenu) ? null : this.appmenu);
	}

	getUserData()
	{
		return this.userdata;
	}

	getSecretYaml()
	{
		return this.secretyaml;
	}

	getSidecarYaml()
	{
		return this.sidecaryaml;
	}

	getExpandUserData(registerpath)
	{
		if(r3IsEmptyString(this.userdata)){
			console.info('There is no user script template.');
			return '';
		}
		if(r3IsEmptyString(registerpath)){
			console.error('Register path is empty.');
			return '';
		}

		// replace keyword in template
		let	expanded= this.userdata.replace(kwIncludePathForUD, registerpath);
		expanded	= expanded.replace(kwApiHostForUD, this.getApiUrlBase());

		return expanded;
	}

	getExpandSecretYaml(roleToken)
	{
		if(r3IsEmptyString(this.secretyaml)){
			console.info('There is no secret yaml template.');
			return '';
		}
		if(r3IsEmptyString(roleToken)){
			console.error('role token is empty.');
			return '';
		}

		let	roleToken64;
		try{
			// encode base64
			var	buff64	= new Buffer(roleToken, 'ascii');
			roleToken64	= buff64.toString('base64');
			if(r3IsEmptyString(roleToken64)){
				console.error('failed to encoding by base64.');
				return '';
			}
		}catch(exception){
			console.error('failed to encoding by base64.');
			return '';
		}

		// replace keyword in template
		let	expanded = this.secretyaml.replace(kwRoleTokenForSecret, roleToken64);

		return expanded;
	}

	getExpandSidecarYaml(roleyrn)
	{
		if(r3IsEmptyString(this.sidecaryaml)){
			console.info('There is no sidecar yaml template.');
			return '';
		}
		if(r3IsEmptyString(roleyrn)){
			console.error('role full yrn path is empty.');
			return '';
		}

		// replace keyword in template
		let	expanded = this.sidecaryaml.replace(kwRoleTokenForRoleYrn, roleyrn);

		return expanded;
	}

	getApiUrlBase()
	{
		return (this.getSafeApiScheme() + '://' + this.getSafeApiHost() + ':' + String(this.getSafeApiPort()));
	}

	isLogin()
	{
		return this.login;
	}

	getUserName()
	{
		return this.user;
	}

	getSafeUserName()
	{
		return (r3IsEmptyString(this.user) ? '' : this.user);
	}

	getUnscopedToken()
	{
		return this.unscopedUserToken;
	}

	getSafeUnscopedToken()
	{
		return (r3IsEmptyString(this.unscopedUserToken) ? '' : this.unscopedUserToken);
	}

	getSignInType()
	{
		return this.signintype;
	}

	getSafeSignInUrl()
	{
		return (r3IsEmptyString(this.signinurl) ? '' : r3UnescapeHTML(this.signinurl));
	}

	getSafeSignOutUrl()
	{
		return (r3IsEmptyString(this.signouturl) ? '' : r3UnescapeHTML(this.signouturl));
	}

	getSafeLang()
	{
		return (r3IsEmptyString(this.lang) ? '' : r3UnescapeHTML(this.lang));
	}

	isDbgHeader()
	{
		if(r3IsEmptyString(this.dbgHeaderName) || r3IsEmptyString(this.dbgHeaderValue)){
			return false;
		}
		return true;
	}

	getDbgHeader(headers)
	{
		if(r3IsEmptyEntity(headers)){
			return false;
		}
		if(!this.isDbgHeader()){
			return true;
		}
		headers[this.getSafeDbgHeaderName()] = this.getSafeDbgHeaderValue();

		return true;
	}

	getDbgHeaderName()
	{
		return this.dbgHeaderName;
	}

	getSafeDbgHeaderName()
	{
		return (this.isDbgHeader() ? this.dbgHeaderName : '');
	}

	getDbgHeaderValue()
	{
		return this.dbgHeaderValue;
	}

	getSafeDbgHeaderValue()
	{
		return (this.isDbgHeader() ? this.dbgHeaderValue : '');
	}

	getDbgResHeaderName()
	{
		return this.dbgResHeaderName;
	}

	getSafeDbgResHeaderName()
	{
		return (this.isDbgHeader() ? this.dbgResHeaderName : '');
	}

	getErrorMsg()
	{
		return this.errormsg;
	}
}

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
