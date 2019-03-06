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

import { kwApiHostForUD, kwIncludePathForUD, signinUnknownType, signinUnscopedToken, signinCredential }	from '../util/r3types';
import { r3ConvertFromJSON, r3UnescapeHTML, r3CompareCaseString }										from '../util/r3util';

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
	if(undefined !== r3globaltmp.r3appmenu && null !== r3globaltmp.r3appmenu && 'string' === typeof r3globaltmp.r3appmenu && '' !== r3globaltmp.r3appmenu){
		let	_decodemenu	= unescape(r3globaltmp.r3appmenu);				// decode
		let	_objmenu	= r3ConvertFromJSON(_decodemenu);				// parse
		if(undefined !== _objmenu && null !== _objmenu && _objmenu instanceof Array && 0 < _objmenu.length){
			_appmenu = _objmenu;
		}else{
			console.info('There is no application global menu.');
		}
	}else{
		console.info('There is no application global menu.');
	}

	// user script
	let	_userdata = null;
	if(undefined !== r3globaltmp.r3userdata && null !== r3globaltmp.r3userdata && 'string' === typeof r3globaltmp.r3userdata && '' !== r3globaltmp.r3userdata){
		let	_decodeuserdata	= unescape(r3globaltmp.r3userdata);			// decode
		let	_templuserdata	= r3ConvertFromJSON(_decodeuserdata);		// parse
		if(undefined !== _templuserdata && null !== _templuserdata && 'string' === typeof _templuserdata){
			_userdata = _templuserdata;
		}else{
			console.info('There is no user script template.');
		}
	}else{
		console.info('There is no user script template.');
	}

	// default object values
	let	r3globalobj	= {
		apischeme:		(undefined === r3globaltmp.r3apischeme ?	''	: r3globaltmp.r3apischeme),
		apihost:		(undefined === r3globaltmp.r3apihost ?		''	: r3globaltmp.r3apihost),
		apiport:		(undefined === r3globaltmp.r3apiport ?		0	: r3globaltmp.r3apiport),
		appmenu:		_appmenu,
		userdata:		_userdata,
		login:			false,
		username:		'',
		unscopedtoken:	'',
		signintype:		(r3CompareCaseString(r3globaltmp.signintype, signinUnscopedToken) ? signinUnscopedToken : r3CompareCaseString(r3globaltmp.signintype, signinCredential) ? signinCredential : signinUnknownType),
		signinurl:		((undefined !== r3globaltmp.signinurl && null !== r3globaltmp.signinurl && 'string' == typeof r3globaltmp.signinurl && '' !== r3globaltmp.signinurl) ? r3globaltmp.signinurl : null),
		signouturl:		((undefined !== r3globaltmp.signouturl && null !== r3globaltmp.signouturl && 'string' == typeof r3globaltmp.signouturl && '' !== r3globaltmp.signouturl) ? r3globaltmp.signouturl : null),
		lang:			((undefined !== r3globaltmp.lang && null !== r3globaltmp.lang && 'string' == typeof r3globaltmp.lang && '' !== r3globaltmp.lang) ? r3globaltmp.lang : 'en'),
		dbgheader:		(undefined === r3globaltmp.dbgheader ?		''	: r3globaltmp.dbgheader),
		dbgvalue:		(undefined === r3globaltmp.dbgvalue ?		''	: r3globaltmp.dbgvalue),
		dbgresheader:	(undefined === r3globaltmp.dbgresheader ?	''	: r3globaltmp.dbgresheader),
		errormsg:		((undefined !== r3globaltmp.errormsg && null !== r3globaltmp.errormsg && 'string' == typeof r3globaltmp.errormsg && '' !== r3globaltmp.errormsg) ? r3globaltmp.errormsg : null)
	};

	if(	undefined !== r3globaltmp				&& null !== r3globaltmp																											&&
		undefined !== r3globaltmp.username		&& null !== r3globaltmp.username		&& 'string' === typeof r3globaltmp.username			&& '' !== r3globaltmp.username		&&
		undefined !== r3globaltmp.unscopedtoken	&& null !== r3globaltmp.unscopedtoken	&& 'string' === typeof r3globaltmp.unscopedtoken	&& '' !== r3globaltmp.unscopedtoken	)
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
		this.userdata					= r3GlobalObject.userdata;		// k2hr3 user script template
		this.signintype					= r3GlobalObject.signintype;	// SignIn Type
		this.signinurl					= r3GlobalObject.signinurl;		// SignIn URL
		this.signouturl					= r3GlobalObject.signouturl;	// SignOut URL
		this.lang						= r3GlobalObject.lang;			// Text resource language
		this.dbgHeaderName				= r3GlobalObject.dbgheader;		// Debug header name(= 'x-k2hr3-debug')
		this.dbgHeaderValue				= r3GlobalObject.dbgvalue;		// Debug header value
		this.dbgResHeaderName			= r3GlobalObject.dbgresheader;	// Debug response header name(= 'x-k2hr3-error')
		this.errormsg					= r3GlobalObject.errormsg;		// Error message

		// User name and Unscoped User Token
		if(	undefined !== signin		&& null !== signin			&& 'boolean' === typeof signin			&& signin				&&
			undefined !== username		&& null !== username		&& 'string' === typeof username			&& '' !== username		&&
			undefined !== unscopedtoken	&& null !== unscopedtoken	&& 'string' === typeof unscopedtoken	&& '' !== unscopedtoken	)
		{
			this.login					= true;							// Signed in
			this.user					= username;						// Using parameter
			this.unscopedUserToken		= unscopedtoken;				// 
		}else{
			if(undefined !== signin && null !== signin && 'boolean' === typeof signin){
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
		return ((undefined === this.apischeme || null === this.apischeme) ? 'http' : this.apischeme);
	}

	getApiHost()
	{
		return this.apihost;
	}

	getSafeApiHost()
	{
		return ((undefined === this.apihost || null === this.apihost) ? 'localhost' : this.apihost);
	}

	getApiPort()
	{
		return this.apiport;
	}

	getSafeApiPort()
	{
		return ((undefined === this.apiport || isNaN(this.apiport)) ? 80 : this.apiport);
	}

	getAppMenu()
	{
		return this.appmenu;
	}

	getSafeAppMenu()
	{
		return ((undefined === this.appmenu || null === this.appmenu) ? null : this.appmenu);
	}

	getUserData()
	{
		return this.userdata;
	}

	getExpandUserData(registerpath)
	{
		if(undefined === this.userdata || null === this.userdata || 'string' !== typeof this.userdata || '' === this.userdata){
			console.info('There is no user script template.');
			return '';
		}
		if(undefined === registerpath || null === registerpath || 'string' !== typeof registerpath || '' === registerpath){
			console.error('Register path is empty.');
			return '';
		}

		// replace keyword in template
		let	expanded= this.userdata.replace(kwIncludePathForUD, registerpath);
		expanded	= expanded.replace(kwApiHostForUD, this.getApiUrlBase());

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
		return ((undefined === this.user || null === this.user) ? '' : this.user);
	}

	getUnscopedToken()
	{
		return this.unscopedUserToken;
	}

	getSafeUnscopedToken()
	{
		return ((undefined === this.unscopedUserToken || null === this.unscopedUserToken) ? '' : this.unscopedUserToken);
	}

	getSignInType()
	{
		return this.signintype;
	}

	getSafeSignInUrl()
	{
		return ((undefined === this.signinurl || null === this.signinurl) ? '' : r3UnescapeHTML(this.signinurl));
	}

	getSafeSignOutUrl()
	{
		return ((undefined === this.signouturl || null === this.signouturl) ? '' : r3UnescapeHTML(this.signouturl));
	}

	getSafeLang()
	{
		return ((undefined === this.lang || null === this.lang) ? '' : r3UnescapeHTML(this.lang));
	}

	isDbgHeader()
	{
		if(undefined === this.dbgHeaderName || null === this.dbgHeaderName || '' === this.dbgHeaderName || undefined === this.dbgHeaderValue || null === this.dbgHeaderValue || '' === this.dbgHeaderValue){
			return false;
		}
		return true;
	}

	getDbgHeader(headers)
	{
		if(undefined === headers || null === headers){
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
