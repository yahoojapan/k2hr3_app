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
 * CREATE:   Thu Sep 7 2017
 * REVISION:
 *
 */

import { kwApiHostForUD, kwIncludePathForUD, kwRoleTokenForSecret, kwRawRoleToken, kwRoleTokenForRoleYrn, signinUnknownType, SigninType, isSigninType, CRCObject, isCRCObject, StringValObj, isSignMinUrlEntry, isSignMinUrls, isSignUrlEntry, isSignUrls, SignUrlEntry, SignUrls }	from '../util/r3types';
import { r3IsObject, r3IsString, r3IsBoolean, r3IsNumber, r3IsArray, r3ConvertFromJSON, r3UnescapeHTML, r3IsEmptyString, r3IsEmptyEntity, r3IsEmptyEntityObject, r3GetDecNumber, r3DeepClone }	from '../util/r3util';

//
// Types
//
// [NOTE]
// K2hr3Global needs to be referenced from the test's setupGlobals.ts file,
// so we export it.
//
export type K2hr3Global = {
	r3apischeme?:		string;
	r3apihost?:			string;
	r3apiport?:			number | string;
	r3appmenu?:			string;
	r3userdata?:		string;
	r3secretyaml?:		string;
	r3sidecaryaml?:		string;
	r3crcobj?:			string;
	signintype?:		string;
	signinurl?:			string;
	signouturl?:		string;
	configname?:		string;
	uselocaltenant?:	boolean;
	lang?:				string;
	dbgheader?:			string;
	dbgvalue?:			string;
	dbgresheader?:		string;
	errormsg?:			string;
	username?:			string;
	unscopedtoken?:		string;
};

type AppMenuItem = {
	name:				string;
	url:				string;
};

type R3GlobalObj = {
	apischeme:			string;
	apihost:			string;
	apiport:			number;
	appmenu:			AppMenuItem[] | null;
	userdata:			string | null;
	secretyaml:			string | null;
	sidecaryaml:		string | null;
	crcobj:				CRCObject;
	login:				boolean;
	username:			string;
	unscopedtoken:		string;
	signintype:			SigninType;
	signinurl:			SignUrls;
	signouturl:			SignUrls;
	configname:			string | null;
	uselocaltenant:		boolean;
	lang:				string;
	dbgheader:			string;
	dbgvalue:			string;
	dbgresheader:		string;
	errormsg:			string | null;
};

//
// Type checker
//
const isAppMenuItemArray = (obj: unknown): obj is AppMenuItem[] => {
	if(!r3IsArray(obj)){
		return false;
	}
	return obj.every((item) => {
		return r3IsObject(item) && r3IsString(item.name) && r3IsString(item.url);
	});
};

//
// Declare
//
declare const k2hr3global: K2hr3Global;

//
// Load Global object for K2HR3 Context
//
const r3GlobalObject: R3GlobalObj = (() =>
{
	//
	// K2HR3 global variables from k2hr3global which is the only global variable.
	//
	const r3globaltmp: K2hr3Global = k2hr3global;

	// global app menu
	let	_appmenu: AppMenuItem[] | null = null;
	if(!r3IsEmptyEntity(r3globaltmp) && r3IsString(r3globaltmp.r3appmenu)){
		const _decodemenu	= unescape(r3globaltmp.r3appmenu);
		const _objmenu		= r3ConvertFromJSON(_decodemenu);
		if(isAppMenuItemArray(_objmenu) && 0 < _objmenu.length){
			_appmenu = _objmenu;
		}else{
			console.info('There is no application global menu.');
		}
	}else{
		console.info('There is no application global menu.');
	}

	// user script
	let	_userdata: string | null = null;
	if(!r3IsEmptyEntity(r3globaltmp) && r3IsString(r3globaltmp.r3userdata)){
		const _decodeuserdata	= unescape(r3globaltmp.r3userdata);
		const _templuserdata	= r3ConvertFromJSON(_decodeuserdata);
		if(r3IsString(_templuserdata) && !r3IsEmptyString(_templuserdata)){
			_userdata = _templuserdata;
		}else{
			console.info('There is no user script template.');
		}
	}else{
		console.info('There is no user script template.');
	}

	// secret yaml
	let	_secretyaml: string | null = null;
	if(!r3IsEmptyEntity(r3globaltmp) && r3IsString(r3globaltmp.r3secretyaml)){
		const _decodesecretyaml	= unescape(r3globaltmp.r3secretyaml);
		const _templsecretyaml	= r3ConvertFromJSON(_decodesecretyaml);
		if(r3IsString(_templsecretyaml) && !r3IsEmptyString(_templsecretyaml)){
			_secretyaml = _templsecretyaml;
		}else{
			console.info('There is no secret yaml template.');
		}
	}else{
		console.info('There is no secret yaml template.');
	}

	// sidecar yaml
	let	_sidecaryaml: string | null = null;
	if(!r3IsEmptyEntity(r3globaltmp) && r3IsString(r3globaltmp.r3sidecaryaml)){
		const _decodesidecaryaml	= unescape(r3globaltmp.r3sidecaryaml);
		const _templsidecaryaml		= r3ConvertFromJSON(_decodesidecaryaml);
		if(r3IsString(_templsidecaryaml) && !r3IsEmptyString(_templsidecaryaml)){
			_sidecaryaml = _templsidecaryaml;
		}else{
			console.info('There is no sidecar yaml template.');
		}
	}else{
		console.info('There is no sidecar yaml template.');
	}

	// custom registration codes
	let _crcobj: CRCObject = {};
	if(!r3IsEmptyEntity(r3globaltmp) && r3IsString(r3globaltmp.r3crcobj)){
		const _decodecrcobj	= unescape(r3globaltmp.r3crcobj);
		const _objcrcobj	= r3ConvertFromJSON(_decodecrcobj);
		if(isCRCObject(_objcrcobj)){
			_crcobj = r3DeepClone(_objcrcobj);
		}else{
			console.info('Something wrong in crcobj.');
		}
	}else{
		console.info('There is no crcobj.');
	}

	// signinurl
	let	_signinurl: SignUrls = {};
	if(!r3IsEmptyEntity(r3globaltmp) && r3IsString(r3globaltmp.signinurl)){
		const _signinurljson	= unescape(r3globaltmp.signinurl);
		const _signinurlobj		= r3ConvertFromJSON(_signinurljson);
		if(null === _signinurlobj){
			if(r3IsString(_signinurljson)){							// Case: string(not json)
				_signinurl	= {
					'signin_default': {
						url:		_signinurljson,
						display:	'Sign in'
					}
				};
			}else if(null === _signinurljson){						// Case: null(not json)
				console.info('signinurl is null, so not set signinurl object.');
			}else{													// Case: unknown
				console.info('signinurl is unknown format.');
			}
		}else{
			if(isSignUrls(_signinurlobj)){							// Case: SignUrls Object(json)
				_signinurl = r3DeepClone(_signinurlobj);
			}else if(isSignMinUrls(_signinurlobj)){					// Case: SignMinUrls Object(json)
				_signinurl = Object.fromEntries(
					Object.entries(_signinurlobj).map(([key, entry]) => {
						const oneEntry: SignUrlEntry = {
							url:		entry.url,
							display:	((r3IsString(entry?.display) && r3IsEmptyString(entry.display)) ? entry.display : 'Sign in')
						};
						return [key, oneEntry];
					})
				);
			}else if(isSignUrlEntry(_signinurlobj)){				// Case: one SignUrlEntry Object(json)
				const	_onesignin = r3DeepClone(_signinurlobj);
				_signinurl	= {
					'signin_default':	_onesignin
				};
			}else if(isSignMinUrlEntry(_signinurlobj)){				// Case: one SignMinUrlEntry Object(json)
				const	_onesignin: SignUrlEntry = {
					url:		_signinurlobj.url,
					display:	((r3IsString(_signinurlobj?.display) && r3IsEmptyString(_signinurlobj.display)) ? _signinurlobj.display : 'Sign in')
				};
				_signinurl = {
					'signin_default':	_onesignin
				};
			}else if(r3IsString(_signinurlobj)){					// Case: string(not json)
				_signinurl	= {
					'signin_default': {
						url:		_signinurlobj,
						display:	'Sign in'
					}
				};
			}else if(null === _signinurlobj){						// Case: null(json)
				console.info('signinurl is null, so not set signinurl object.');
			}else{													// Case: unknown
				console.info('signinurl object is unknown format.');
			}
		}
	}else{
		console.info('There is no signinurl object.');
	}

	// signouturl
	let	_signouturl: SignUrls = {};
	if(!r3IsEmptyEntity(r3globaltmp) && r3IsString(r3globaltmp.signouturl)){
		const _signouturljson	= unescape(r3globaltmp.signouturl);
		const _signouturlobj	= r3ConvertFromJSON(_signouturljson);
		if(null === _signouturlobj){
			if(r3IsString(_signouturljson)){						// Case: string(not json)
				_signouturl	= {
					'signout_default': {
						url:		_signouturljson,
						display:	'Sign out'
					}
				};
			}else if(null === _signouturljson){						// Case: null(not json)
				console.info('signouturl is null, so not set signouturl object.');
			}else{													// Case: unknown
				console.info('signouturl is unknown format.');
			}
		}else{
			if(isSignUrls(_signouturlobj)){							// Case: SignUrls Object(json)
				_signouturl = r3DeepClone(_signouturlobj);
			}else if(isSignMinUrls(_signouturlobj)){				// Case: SignMinUrls Object(json)
				_signouturl = Object.fromEntries(
					Object.entries(_signouturlobj).map(([key, entry]) => {
						const oneEntry: SignUrlEntry = {
							url:		entry.url,
							display:	((r3IsString(entry?.display) && r3IsEmptyString(entry.display)) ? entry.display : 'Sign out')
						};
						return [key, oneEntry];
					})
				);
			}else if(isSignUrlEntry(_signouturlobj)){				// Case: one SignUrlEntry Object(json)
				const	_onesignout = r3DeepClone(_signouturlobj);
				_signouturl	= {
					'signout_default':	_onesignout
				};
			}else if(isSignMinUrlEntry(_signouturlobj)){			// Case: one SignMinUrlEntry Object(json)
				const	_onesignout: SignUrlEntry = {
					url:		_signouturlobj.url,
					display:	((r3IsString(_signouturlobj?.display) && r3IsEmptyString(_signouturlobj.display)) ? _signouturlobj.display : 'Sign out')
				};
				_signouturl	= {
					'signout_default':	_onesignout
				};
			}else if(r3IsString(_signouturlobj)){					// Case: string(not json)
				_signouturl	= {
					'signout_default': {
						url:		_signouturlobj,
						display:	'Sign out'
					}
				};
			}else if(null === _signouturlobj){						// Case: null(json)
				console.info('signouturl is null, so not set signouturl object.');
			}else{													// Case: unknown
				console.info('signouturl object is unknown format.');
			}
		}
	}else{
		console.info('There is no signouturl object.');
	}

	// configname
	let	_configname: string | null = null;
	if(!r3IsEmptyEntity(r3globaltmp) && r3IsString(r3globaltmp.configname)){
		const _confignamejson	= unescape(r3globaltmp.configname);
		const _confignamestr	= r3ConvertFromJSON(_confignamejson);
		if(r3IsString(_confignamestr) && !r3IsEmptyString(_confignamestr)){
			_configname = _confignamestr;
		}else{
			console.info('configname is not safe string.');
		}
	}else{
		console.info('There is no configname string.');
	}

	// default object values
	const r3globalobj: R3GlobalObj = {
		apischeme:		((r3IsEmptyEntity(r3globaltmp) || !r3IsString(r3globaltmp.r3apischeme)	|| r3IsEmptyString(r3globaltmp.r3apischeme))	? '' : r3globaltmp.r3apischeme),
		apihost:		((r3IsEmptyEntity(r3globaltmp) || !r3IsString(r3globaltmp.r3apihost)	|| r3IsEmptyString(r3globaltmp.r3apihost))		? '' : r3globaltmp.r3apihost),
		apiport:		(r3IsEmptyEntity(r3globaltmp) ? 0 : r3GetDecNumber(r3globaltmp.r3apiport)),
		appmenu:		_appmenu,
		userdata:		_userdata,
		secretyaml:		_secretyaml,
		sidecaryaml:	_sidecaryaml,
		crcobj:			_crcobj,
		login:			false,
		username:		'',
		unscopedtoken:	'',
		signintype:		(r3IsEmptyEntity(r3globaltmp) ? signinUnknownType : isSigninType(r3globaltmp.signintype) ? r3globaltmp.signintype : signinUnknownType),
		signinurl:		_signinurl,
		signouturl:		_signouturl,
		configname:		_configname,
		uselocaltenant:	((r3IsEmptyEntity(r3globaltmp) || !r3IsBoolean(r3globaltmp.uselocaltenant))												? true	: r3globaltmp.uselocaltenant),
		lang:			((r3IsEmptyEntity(r3globaltmp) || !r3IsString(r3globaltmp.lang) 		|| r3IsEmptyString(r3globaltmp.lang))			? 'en'	: r3globaltmp.lang),
		dbgheader:		((r3IsEmptyEntity(r3globaltmp) || !r3IsString(r3globaltmp.dbgheader)	|| r3IsEmptyString(r3globaltmp.dbgheader))		? ''	: r3globaltmp.dbgheader),
		dbgvalue:		((r3IsEmptyEntity(r3globaltmp) || !r3IsString(r3globaltmp.dbgvalue)		|| r3IsEmptyString(r3globaltmp.dbgvalue))		? ''	: r3globaltmp.dbgvalue),
		dbgresheader:	((r3IsEmptyEntity(r3globaltmp) || !r3IsString(r3globaltmp.dbgresheader)	|| r3IsEmptyString(r3globaltmp.dbgresheader))	? ''	: r3globaltmp.dbgresheader),
		errormsg:		((r3IsEmptyEntity(r3globaltmp) || !r3IsString(r3globaltmp.errormsg)		|| r3IsEmptyString(r3globaltmp.errormsg))		? null	: r3globaltmp.errormsg)
	};

	if(	!r3IsEmptyEntity(r3globaltmp)				&&
		r3IsString(r3globaltmp.username)			&&
		!r3IsEmptyString(r3globaltmp.username)		&&
		r3IsString(r3globaltmp.unscopedtoken)		&&
		!r3IsEmptyString(r3globaltmp.unscopedtoken)	)
	{
		r3globalobj.login			= true;
		r3globalobj.username		= r3globaltmp.username;
		r3globalobj.unscopedtoken	= r3globaltmp.unscopedtoken;
	}

	return r3globalobj;
})();

//
// K2HR3 Context Class
//
export default class R3Context
{
	apischeme:			string;
	apihost:			string;
	apiport:			number;
	appmenu:			AppMenuItem[] | null;
	userdata:			string | null;
	secretyaml:			string | null;
	sidecaryaml:		string | null;
	crcobj:				CRCObject;
	signintype:			SigninType;
	signinurl:			SignUrls;
	signouturl:			SignUrls;
	configname:			string | null;
	uselocaltenant:		boolean;
	lang:				string;
	dbgHeaderName:		string;
	dbgHeaderValue:		string;
	dbgResHeaderName:	string;
	errormsg:			string | null;
	login:				boolean;
	user:				string;
	unscopedUserToken:	string;

	// [NOTE]
	// If signin parameter is undefined(null), it is just after loading(initializing) application.
	// When user is signin/out, this parameter is not undefined(null).
	//
	constructor(signin?: boolean, username?: string, unscopedtoken?: string)
	{
		this.apischeme			= r3GlobalObject.apischeme;		// k2hr3 api scheme
		this.apihost			= r3GlobalObject.apihost;		// k2hr3 api hostname
		this.apiport			= r3GlobalObject.apiport;		// k2hr3 api port
		this.appmenu			= r3GlobalObject.appmenu;		// k2hr3 app menu array
		this.userdata			= r3GlobalObject.userdata;		// k2hr3 user data script template
		this.secretyaml			= r3GlobalObject.secretyaml;	// k2hr3 secret yaml template
		this.sidecaryaml		= r3GlobalObject.sidecaryaml;	// k2hr3 sidecar yaml template
		this.crcobj				= r3GlobalObject.crcobj;		// k2hr3 Custom Registration Code(CRC) object
		this.signintype			= r3GlobalObject.signintype;	// SignIn Type
		this.signinurl			= r3GlobalObject.signinurl;		// SignIn URL
		this.signouturl			= r3GlobalObject.signouturl;	// SignOut URL
		this.configname			= r3GlobalObject.configname;	// Config Name(If using ExtRouter(ex. OIDC) and has a token, the config name that created the token is set.)
		this.uselocaltenant		= r3GlobalObject.uselocaltenant;// Use Local Tenant
		this.lang				= r3GlobalObject.lang;			// Text resource language
		this.dbgHeaderName		= r3GlobalObject.dbgheader;		// Debug header name(= 'x-k2hr3-debug')
		this.dbgHeaderValue		= r3GlobalObject.dbgvalue;		// Debug header value
		this.dbgResHeaderName	= r3GlobalObject.dbgresheader;	// Debug response header name(= 'x-k2hr3-error')
		this.errormsg			= r3GlobalObject.errormsg;		// Error message

		// User name and Unscoped User Token
		if(	r3IsBoolean(signin)				&&
			r3IsString(username)			&&
			!r3IsEmptyString(username)		&&
			r3IsString(unscopedtoken)		&&
			!r3IsEmptyString(unscopedtoken)	)
		{
			this.login					= true;							// Signed in
			this.user					= username;						// Using parameter
			this.unscopedUserToken		= unscopedtoken;				//
		}else{
			if(r3IsBoolean(signin)){
				this.login				= false;						// Signed out
				this.user				= '';							//
				this.unscopedUserToken	= '';							//
			}else{
				this.login				= r3GlobalObject.login;			// Singed in/out
				this.user				= r3GlobalObject.username;		// Using configuration
				this.unscopedUserToken	= r3GlobalObject.unscopedtoken;	//
			}
		}
	}

	getApiScheme():	string
	{
		return this.apischeme;
	}

	getSafeApiScheme():	string
	{
		return (r3IsEmptyString(this.apischeme) ? 'http' : this.apischeme);
	}

	getApiHost(): string
	{
		return this.apihost;
	}

	getSafeApiHost(): string
	{
		return (r3IsEmptyString(this.apihost) ? 'localhost' : this.apihost);
	}

	getApiPort(): number
	{
		return this.apiport;
	}

	getSafeApiPort(): number
	{
		return ((!r3IsNumber(this.apiport) || isNaN(this.apiport)) ? 80 : this.apiport);
	}

	getAppMenu(): AppMenuItem[] | null
	{
		return this.appmenu;
	}

	getSafeAppMenu(): AppMenuItem[] | null
	{
		return (!isAppMenuItemArray(this.appmenu) ? null : this.appmenu);
	}

	getUserData(): string | null
	{
		return this.userdata;
	}

	getSecretYaml(): string | null
	{
		return this.secretyaml;
	}

	getSidecarYaml(): string | null
	{
		return this.sidecaryaml;
	}

	getCRCObject(): CRCObject
	{
		return this.crcobj;
	}

	getExpandUserData(registerpath: string): string
	{
		if(!r3IsString(this.userdata) || r3IsEmptyString(this.userdata)){
			console.info('There is no user script template.');
			return '';
		}
		if(r3IsEmptyString(registerpath)){
			console.error('Register path is empty.');
			return '';
		}

		// replace keyword in template
		let	expanded	= this.userdata.replace(kwIncludePathForUD, registerpath);
		expanded		= expanded.replace(kwApiHostForUD, this.getApiUrlBase());

		return expanded;
	}

	getExpandSecretYaml(roleToken: string, isBase64?: boolean): string
	{
		if(!r3IsString(this.secretyaml) || r3IsEmptyString(this.secretyaml)){
			console.info('There is no secret yaml template.');
			return '';
		}
		if(r3IsEmptyString(roleToken)){
			console.error('role token is empty.');
			return '';
		}

		let	decodeRoleToken: string;
		if(!r3IsBoolean(isBase64) || false === isBase64){
			decodeRoleToken = roleToken;
		}else{
			// decode base64
			try{
				const	buff64	= Buffer.from(roleToken, 'ascii');
				decodeRoleToken	= buff64.toString('base64');
				if(r3IsEmptyString(decodeRoleToken)){
					console.error('failed to decoding by base64.');
					return '';
				}
			}catch(exception){
				console.error('failed to decoding by base64.');
				return '';
			}
		}

		// replace keyword in template
		const expanded = this.secretyaml.replace(kwRoleTokenForSecret, decodeRoleToken);

		return expanded;
	}

	getExpandSidecarYaml(roleyrn: string): string
	{
		if(!r3IsString(this.sidecaryaml) || r3IsEmptyString(this.sidecaryaml)){
			console.info('There is no sidecar yaml template.');
			return '';
		}
		if(r3IsEmptyString(roleyrn)){
			console.error('role full yrn path is empty.');
			return '';
		}

		// replace keyword in template
		const expanded = this.sidecaryaml.replace(kwRoleTokenForRoleYrn, roleyrn);

		return expanded;
	}

	getExpandCRCObject(roleToken: string, roleyrn: string, registerpath: string): CRCObject
	{
		const expandedall: CRCObject = {};

		if(!isCRCObject(this.crcobj)){
			console.info('There is no safe crcobj');
			return expandedall;
		}

		const	apiHost		= this.getApiUrlBase();
		const	_localcrc	= this.crcobj;

		Object.keys(_localcrc).forEach((key) => {
			const	_subobj	= _localcrc[key];

			if(r3IsObject(_subobj)){
				const	_expanded_subobj: StringValObj = {};

				Object.keys(_subobj).forEach((subkey) => {
					if(r3IsString(_subobj[subkey]) && !r3IsEmptyString(_subobj[subkey])){
						// API host
						let	expanded = _subobj[subkey].replace(kwApiHostForUD, apiHost);

						// Role token
						if(!r3IsEmptyString(roleToken)){
							expanded = expanded.replace(kwRawRoleToken, roleToken);

							try{
								// encode base64
								const	buff64		= Buffer.from(roleToken, 'ascii');
								const	roleToken64	= buff64.toString('base64');
								if(!r3IsEmptyString(roleToken64)){
									expanded = expanded.replace(kwRoleTokenForSecret, roleToken64);
								}else{
									console.error('failed to encoding by base64.');
								}
							}catch(exception){
								console.error('failed to encoding by base64.');
							}
						}

						// Role YRN path
						if(!r3IsEmptyString(roleyrn)){
							expanded = expanded.replace(kwRoleTokenForRoleYrn, roleyrn);
						}

						// RegisterPath
						if(!r3IsEmptyString(registerpath)){
							expanded = expanded.replace(kwIncludePathForUD, registerpath);
						}

						// set
						_expanded_subobj[subkey] = expanded;

					}else{
						console.info('sub object(' + key + ') key(' + subkey + ') in crcobj is not safe string, skip it.');

						// set empty
						_expanded_subobj[subkey] = '';
					}
				});

				if(0 < Object.keys(_expanded_subobj).length){
					expandedall[key] = r3DeepClone(_expanded_subobj);
				}
			}else{
				console.info('sub object(' + key + ') in crcobj is not safe object, skip it.');
				expandedall[key] = {};
			}
		});

		return expandedall;
	}

	getApiUrlBase(): string
	{
		return (this.getSafeApiScheme() + '://' + this.getSafeApiHost() + ':' + String(this.getSafeApiPort()));
	}

	isLogin(): boolean
	{
		return this.login;
	}

	getUserName(): string
	{
		return this.user;
	}

	getSafeUserName(): string
	{
		return (r3IsEmptyString(this.user) ? '' : this.user);
	}

	getUnscopedToken(): string
	{
		return this.unscopedUserToken;
	}

	getSafeUnscopedToken(): string
	{
		return (r3IsEmptyString(this.unscopedUserToken) ? '' : this.unscopedUserToken);
	}

	getSignInType(): SigninType
	{
		return this.signintype;
	}

	// [NOTE]
	// If configName is specified and found, the target value is returned.
	// If configName is not specified, try to find "siginin_default" or return the only object if it exists.
	// If not found or no SignInURL exists, an empty object is returned.
	//
	getSafeSignInUrl(configName?: string): SignUrlEntry
	{
		if(!r3IsString(configName) || r3IsEmptyString(configName)){
			//
			// check default object
			//
			if(0 == Object.keys(this.signinurl).length){
				return { url: '', display: '' };
			}
			if(r3IsEmptyEntityObject(this.signinurl, 'signin_default')){
				return r3DeepClone(this.signinurl['signin_default']);
			}else{
				// return first object
				return r3DeepClone(Object.values(this.signinurl)[0]);
			}
		}else{
			//
			// Return one object
			//
			if(r3IsEmptyEntityObject(this.signinurl, configName)){
				return { url: '', display: '' };
			}else{
				return r3DeepClone(this.signinurl[configName]);
			}
		}
	}

	getAllSignInUrl(configName?: string): SignUrls
	{
		return r3DeepClone(this.signinurl);
	}

	// [NOTE]
	// If configName is specified and found, the target value is returned.
	// If configName is not specified, try to find "siginout_default" or return the only object if it exists.
	// If not found or no SignOutURL exists, an empty object is returned.
	//
	getSafeSignOutUrl(configName?: string): SignUrlEntry
	{
		if(!r3IsString(configName) || r3IsEmptyString(configName)){
			//
			// check default object
			//
			if(0 == Object.keys(this.signouturl).length){
				return { url: '', display: '' };
			}
			if(r3IsEmptyEntityObject(this.signouturl, 'signout_default')){
				return r3DeepClone(this.signouturl['signout_default']);
			}else{
				// return first object
				return r3DeepClone(Object.values(this.signouturl)[0]);
			}
		}else{
			//
			// Return one object
			//
			if(r3IsEmptyEntityObject(this.signouturl, configName)){
				return { url: '', display: '' };
			}else{
				return r3DeepClone(this.signouturl[configName]);
			}
		}
	}

	getAllSignOutrl(configName?: string): SignUrls
	{
		return r3DeepClone(this.signouturl);
	}

	getSafeConfigName(): string
	{
		return ((!r3IsString(this.configname) || r3IsEmptyString(this.configname)) ? '' : r3UnescapeHTML(this.configname));
	}

	getSafeConfigCount(isSignin: boolean): number
	{
		if(isSignin){
			return Object.keys(this.signinurl).length;
		}else{
			return Object.keys(this.signouturl).length;
		}
	}

	useLocalTenant(): boolean
	{
		return this.uselocaltenant;
	}

	getSafeLang(): string
	{
		return (r3IsEmptyString(this.lang) ? '' : r3UnescapeHTML(this.lang));
	}

	isDbgHeader(): boolean
	{
		if(r3IsEmptyString(this.dbgHeaderName) || r3IsEmptyString(this.dbgHeaderValue)){
			return false;
		}
		return true;
	}

	getDbgHeader(headers: StringValObj): boolean
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

	getDbgHeaderName(): string
	{
		return this.dbgHeaderName;
	}

	getSafeDbgHeaderName(): string
	{
		return (this.isDbgHeader() ? this.dbgHeaderName : '');
	}

	getDbgHeaderValue(): string
	{
		return this.dbgHeaderValue;
	}

	getSafeDbgHeaderValue(): string
	{
		return (this.isDbgHeader() ? this.dbgHeaderValue : '');
	}

	getDbgResHeaderName(): string
	{
		return this.dbgResHeaderName;
	}

	getSafeDbgResHeaderName(): string
	{
		return (this.isDbgHeader() ? this.dbgResHeaderName : '');
	}

	getErrorMsg(): string | null
	{
		return this.errormsg;
	}
}

/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * End:
 * vim600: noexpandtab sw=4 ts=4 fdm=marker
 * vim<600: noexpandtab sw=4 ts=4
 */
