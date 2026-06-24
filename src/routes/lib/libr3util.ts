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
 * CREATE:   Wed Sep 6 2017
 * REVISION:
 *
 */

import fs		from 'fs';
import express	from 'express';

//-----------------------------------------------------------------------------
// [NOTE]
// Some type(but name is different) and type-checking functions are reused from
// src/util/r3types.ts and r3util.ts.
// These are client-side application code, and this file is the server-side
// program, so they are duplicated to keep the source code separate.
// Please exercise caution when making modifications or changes.
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
// Types / Interfaces
//-----------------------------------------------------------------------------
//
// Basic types to replace "any"
//
// For example, these are using from JSON parser(and Avoiding self-referencing type aliases)
//
export interface valTypeAllObject extends Record<string, valTypeAll> {}
export type valTypeAllArray	= valTypeAll[];
export type valTypeAll		= null | boolean | number | string | valTypeAllArray | valTypeAllObject;

//
// String Object
//
// [NOTE] same type is defined in src/util/r3types.ts
//
export type StringValObj	= Record<string, string>;

//
// Custom Registration Code(CRC) object
//
// [NOTE] same type is defined in src/util/r3types.ts
//
export type CRCObject 		= Record<string, StringValObj>;

// SignIn types
export const r3SigninUnscopedToken	= 'unsopedtoken';
export const r3SigninCredential		= 'credential';

//
// Sign In/Out URLs
//
export type SignMinUrlEntry	= {
	url:		string;
	display?:	string;
};

export type SignUrlEntry	= Required<SignMinUrlEntry>;

export type SignMinUrls		= Record<string, SignMinUrlEntry>;

export type SignUrls		= Record<string, SignUrlEntry>;

//
// Varidation module
//
export interface ValidatorModule {
	getUserName:	(req: express.Request) => string | null;
	getSignInUri:	(req: express.Request) => SignMinUrls | SignMinUrlEntry | string | null;
	getSignOutUri:	(req: express.Request) => SignMinUrls | SignMinUrlEntry | string | null;
	getSignInType:	() => string;
	getConfigName?:	(req: express.Request) => string | null;
	getOtherToken?:	(req: express.Request) => string | null;
}

//
// Menu on Application
//
export type AppMenuItem = {
	name:	string;
	url:	string;
};

//
// Extra Router Information
//
export type ExtRouterSetConfig	= (config: valTypeAllObject, routerName: string) => boolean;

export type ExtRouterInfo		= {
	name:				string;					// Specify JS file name(except js extension) for defining Router. The "/router" directory is current.
	path:				string;					// Specify the router entry path(ex. "/myenter").
	config:				valTypeAllObject;		// Specify the configuration required for the extended router. (Value, array, object)
	setConfig?:			ExtRouterSetConfig;		// Specify the function to configure the extended router.
};

//
// OIDC Extra Router information
//
export type OIDCConfigParams	= {
	client_secret:		string;					// OpenId Connect Client Secret
	client_id:			string;					// OpenId Connect Client id
	redirectUrl:		string;					// Redirect URL (ex, <K2HR3 APP Server Host name and port>/<oidc name>/login/cb )
	usernamekey?:		string;					// Username key name in oidc token
	cookiename?:		string;					// Cookie name for saving oidc token
	cookieexpire?:		number;					// Expire time for oidc token cookie
};

export type OIDCExtRouterConfig	= {
	displayName?:		string;					// Display name for K2HR3 APP Menu
	debug?:				boolean;				// Debugging OpenID Connect Communication(default: false)
	logoutUrl:			string;					// Logout URL (ex. <K2HR3 APP Server Host name and port>/<oidc name>/logout )
	mainUrl:			string;					// K2HR3 APP Server Host name and port (ex. https://k2hr3-app:3000/ )
	oidcDiscoveryUrl:	string;					// OpenId Connect Issuer URL
	scope:				string | string[];		// Specify 'openid profile email' value
	params:				OIDCConfigParams;		// OIDC parameters
};

// OIDCRouterInfo is a specialized form of ExtRouterInfo
export type OIDCRouterInfo		= Omit<ExtRouterInfo, 'config'> & {
	config:				OIDCExtRouterConfig;
};

export type ExtRouterInfos = Record<string, ExtRouterInfo | OIDCRouterInfo>;

//-----------------------------------------------------------------------------
// Functions
//-----------------------------------------------------------------------------
const rawIsSafeEntity = (obj: unknown): boolean =>
{
	return (undefined !== obj && null !== obj);
};

const rawIsSafeObject = (obj: unknown): obj is valTypeAllObject =>
{
	if(!rawIsSafeEntity(obj) || rawIsSafeArray(obj)){
		return false;
	}
	return obj instanceof Object;
};

const rawIsSafeString = (str: unknown): str is string =>
{
	if(!rawIsSafeEntity(str) || 'string' !== typeof str || '' === str){
		return false;
	}
	return true;
};

const rawComapreCaseString = (str1: string, str2: string): boolean =>
{
	if(	!rawIsSafeString(str1)						||
		!rawIsSafeString(str2)						||
		str1.toLowerCase() !== str2.toLowerCase()	)
	{
		return false;
	}
	return true;
};

const rawIsSafeBoolean = (obj: unknown): obj is boolean =>
{
	if(!rawIsSafeEntity(obj) || 'boolean' !== typeof obj){
		return false;
	}
	return true;
};

export const rawIsSafeNumber = (num: unknown): num is number =>
{
	if(!rawIsSafeEntity(num) || 'number' !== typeof num){
		return false;
	}
	return true;
};

const rawGetSafeString = (str: unknown): string =>
{
	if(rawIsSafeString(str)){
		return str;
	}
	return '';
};

const rawIsSafeJSON = (str: string): boolean =>
{
	if(!rawIsSafeString(str)){
		return false;
	}
	try{
		let tmpstr = JSON.parse(str);
	}catch(exception){
		return false;
	}
	return true;
};

const rawIsSafeArray = (arr: unknown): arr is unknown[] =>
{
	return Array.isArray(arr);
};

const rawIsEmptyArray = (arr: unknown): boolean =>
{
	if(!rawIsSafeArray(arr) || 0 === arr.length){
		return true;
	}
	return false;
};

const rawHasKey = (obj: valTypeAllObject, key: string): boolean =>
{
	return key in obj;
};

const rawIsSafeHaskey = (obj: unknown, key: string): obj is valTypeAllObject =>
{
	if(!rawIsSafeObject(obj) || !rawIsSafeString(key)){
		return false;
	}
	return rawHasKey(obj, key);
};

const rawIsSafeFunction = (func: unknown): func is Function =>
{
	if(undefined === func || null === func){
		return false;
	}
	return 'function' === typeof func;
};

const rawGetSafeArray = (arr: unknown): unknown[] =>
{
	if(!rawIsSafeArray(arr)){
		return new Array(0);
	}
	return arr;
};

const rawFindStringInArray = (arr: unknown[], str: string): boolean =>
{
	if(!rawIsSafeArray(arr) || !rawIsSafeString(str)){
		return false;
	}
	for(let cnt = 0; cnt < arr.length; ++cnt){
		if(str === arr[cnt]){
			return true;
		}
	}
	return false;
};

const rawAddStringToArray = (arr: unknown[], str: string): unknown[] =>
{
	let safeArr = rawGetSafeArray(arr);
	safeArr.push(rawGetSafeString(str));
	return safeArr;
};

const rawTryAddStringToArray = (arr: unknown[], str: string): boolean =>
{
	if(!rawIsSafeArray(arr) || !rawIsSafeString(str)){
		return false;
	}
	if(rawFindStringInArray(arr, str)){
		return false;
	}
	rawAddStringToArray(arr, str);
	return true;
};

const rawRemoveStringFromArray = (arr: unknown[], str: string): boolean =>
{
	if(!rawIsSafeArray(arr) || !rawIsSafeString(str)){
		return false;
	}
	for(let cnt = 0; cnt < arr.length; ++cnt){
		if(str === arr[cnt]){
			arr.splice(cnt, 1);
			return true;
		}
	}
	return false;
};

const rawCompareArray = (arr1: unknown[], arr2: unknown[], strict: boolean): boolean =>
{
	if(!rawIsSafeArray(arr1) || !rawIsSafeArray(arr2) || arr1.length !== arr2.length){
		return false;
	}
	if(!rawIsSafeEntity(strict) || 'boolean' !== typeof strict || false === strict){
		let	is_found: boolean;
		for(let cnt1 = 0; cnt1 < arr1.length; ++cnt1){
			is_found = false;
			for(let cnt2 = 0; cnt2 < arr2.length; ++cnt2){
				if(arr1[cnt1] === arr2[cnt2]){
					is_found = true;
					break;
				}
			}
			if(!is_found){
				return false;
			}
		}
	}else{
		if(JSON.stringify(arr1) !== JSON.stringify(arr2)){
			return false;
		}
	}
	return true;
};

const rawMergeArray = (arr1: unknown[], arr2: unknown[]): unknown[] =>
{
	if(!rawIsSafeArray(arr1) && !rawIsSafeArray(arr2)){
		return [];
	}
	if(!rawIsSafeArray(arr2)){
		return arr1;
	}
	if(!rawIsSafeArray(arr1)){
		return arr2;
	}
	for(let cnt2 = 0; cnt2 < arr2.length; ++cnt2){
		let is_found = false;
		for(let cnt1 = 0; cnt1 < arr1.length; ++cnt1){
			if(arr1[cnt1] === arr2[cnt2]){
				is_found = true;
				break;
			}
		}
		if(!is_found){
			arr1.push(arr2[cnt2]);
		}
	}
	return arr1;
};

const rawMergeObjects = (obj1: valTypeAllObject, obj2: valTypeAllObject): valTypeAllObject =>
{
	if(!rawIsSafeEntity(obj1)){
		obj1 = {};
	}
	if(!rawIsSafeEntity(obj2)){
		obj2 = {};
	}
	let	resobj: valTypeAllObject = {};
	for(let key1 in obj1){
		resobj[key1] = obj1[key1];
	}
	for(let key2 in obj2){
		resobj[key2] = obj2[key2];
	}
	return resobj;
};

const rawCheckDir = (path: string): boolean =>
{
	if(!rawIsSafeString(path)){
		return false;
	}
	return fs.existsSync(path);
};

const rawCheckMakeDir = (path: string): boolean =>
{
	if(rawCheckDir(path)){
		return true;
	}
	if(!rawIsSafeString(path)){
		return false;
	}
	try{
		fs.mkdirSync(path);
	}catch(err){
		return false;
	}
	return true;
};

const rawIsStringValObj = (val: unknown): val is StringValObj =>		// see. r3IsStringValObj function
{
	if(!rawIsSafeEntity(val)){
		return false;
	}
	return Object.values(val).every((val: unknown) => rawIsSafeString(val));
};

const rawIsStringArray = (arr: unknown): arr is string[] =>
{
	if(!rawIsSafeArray(arr)){
		return false;
	}
	return arr.every((item: unknown) => isSafeString(item));
};

const rawIsCRCObject = (val: unknown): val is CRCObject =>				// see. isCRCObject function
{
	if(!rawIsSafeEntity(val)){
		return false;
	}
	return Object.values(val).every(outerVal => rawIsStringValObj(outerVal));
};

const rawIsSignMinUrlEntry = (val: unknown): val is SignMinUrlEntry =>
{
	if(!rawIsSafeObject(val)){
		return false;
	}
	if(	rawIsSafeString(val?.url)										&&
		(undefined === val?.display || rawIsSafeString(val?.display))	)
	{
		return true;
	}
	return false;
};

const rawIsSignUrlEntry = (val: unknown): val is SignUrlEntry =>
{
	if(!rawIsSafeObject(val)){
		return false;
	}
	if(	rawIsSafeString(val?.display)	&&
		rawIsSignMinUrlEntry(val)		)
	{
		return true;
	}
	return false;
};

const rawIsSignMinUrls = (val: unknown): val is SignMinUrls =>
{
	if(!rawIsSafeObject(val)){
		return false;
	}
	return Object.values(val).every((item: unknown) => rawIsSignMinUrlEntry(item));
};

const rawIsSignUrls = (val: unknown): val is SignUrls =>
{
	if(!rawIsSafeObject(val)){
		return false;
	}
	return Object.values(val).every((item: unknown) => rawIsSignUrlEntry(item));
};

const rawIsValidatorModule = (module: unknown): module is ValidatorModule =>
{
	if(!module || !rawIsSafeObject(module)){
		return false;
	}

	const requiredFunctions: (keyof ValidatorModule)[] = [
		'getUserName',
		'getSignInUri',
		'getSignOutUri',
		'getSignInType'
	];
	const optionalFunctions: (keyof ValidatorModule)[] = [
		'getConfigName',
		'getOtherToken'
	];

	// check functions
	const	resultRequiredFunctions		= requiredFunctions.every((funcName) => rawIsSafeFunction(module[funcName]));
	const	resultAllOptionalFunctions	= optionalFunctions.every((funcName) => (!rawIsSafeEntity(module[funcName]) || rawIsSafeFunction(module[funcName])));

	return (resultRequiredFunctions && resultAllOptionalFunctions);
};

const rawIsAppMenuItemArray = (obj: unknown): obj is AppMenuItem[] =>
{
	if(!rawIsSafeArray(obj)){
		return false;
	}
	return obj.every((item) => {
		return rawIsSafeObject(item) && rawIsSafeString(item.name) && rawIsSafeString(item.url);
	});
};

export const rawIsExtRouterSetConfig = (val: unknown): val is ExtRouterSetConfig =>
{
	if(!rawIsSafeFunction(val)){
		return false;
	}
	// check arguments count for function
	if(val.length < 2){
		return false;
	}
	return true;
};

const rawIsExtRouterInfo = (obj: unknown): obj is ExtRouterInfo =>
{
	if(!rawIsSafeObject(obj)){
		return false;
	}
	if(	rawIsSafeString(obj?.name)		&&
		rawIsSafeString(obj?.path)		&&
		rawIsSafeObject(obj?.config)	)
	{
		return true;
	}
	return false;
};

const rawIsOIDCConfigParams = (obj: unknown): obj is OIDCConfigParams =>
{
	if(!rawIsSafeObject(obj)){
		return false;
	}
	if(	rawIsSafeString(obj?.client_secret)	&& '' !== obj.client_secret				&&
		rawIsSafeString(obj?.client_id)		&& '' !== obj.client_id					&&
		rawIsSafeString(obj?.redirectUrl)	&& '' !== obj.redirectUrl				&&
		(undefined === obj?.usernamekey		|| rawIsSafeString(obj?.usernamekey))	&&
		(undefined === obj?.cookiename		|| rawIsSafeString(obj?.cookiename))	&&
		(undefined === obj?.cookieexpire	|| rawIsSafeNumber(obj?.cookieexpire))	)
	{
		return true;
	}
	return false;
};

const rawIsOIDCExtRouterConfig = (obj: unknown): obj is OIDCExtRouterConfig =>
{
	if(!rawIsSafeObject(obj)){
		return false;
	}
	if(	(undefined === obj?.displayName			|| rawIsSafeString(obj?.displayName))	&&
		(undefined === obj?.debug				|| rawIsSafeBoolean(obj?.debug))		&&
		rawIsSafeString(obj?.logoutUrl)			&& '' !== obj.logoutUrl					&&
		rawIsSafeString(obj?.mainUrl)			&& '' !== obj.mainUrl					&&
		rawIsSafeString(obj?.oidcDiscoveryUrl)	&& '' !== obj.oidcDiscoveryUrl			&&
		(rawIsSafeString(obj?.scope)			|| rawIsStringArray(obj?.scope))		&&
		rawIsOIDCConfigParams(obj?.params)												)
	{
		return true;
	}
	return false;
};

const rawIsOIDCRouterInfo = (obj: unknown): obj is OIDCRouterInfo =>
{
	if(!rawIsSafeObject(obj)){
		return false;
	}
	if(	rawIsExtRouterInfo(obj)					&&
		rawIsOIDCExtRouterConfig(obj?.config)	)
	{
		return true;
	}
	return false;
};

const rawIsExtRouterInfos = (obj: unknown): obj is ExtRouterInfos =>
{
	if(!rawIsSafeObject(obj)){
		return false;
	}
	return Object.values(obj).every((item: unknown) => { return (rawIsExtRouterInfo(item) || rawIsOIDCRouterInfo(item)); });
};

//---------------------------------------------------------
// Exports
//---------------------------------------------------------
export const isSafeEntity = (obj: unknown): boolean =>
{
	return rawIsSafeEntity(obj);
};

export const isSafeString = (str: unknown): str is string =>
{
	return rawIsSafeString(str);
};

export const isSafeObject = (obj: unknown): obj is valTypeAllObject =>
{
	return rawIsSafeObject(obj);
};

export const compareCaseString = (str1: string, str2: string): boolean =>
{
	return rawComapreCaseString(str1, str2);
};

export const isSafeBoolean = (obj: unknown): obj is boolean =>
{
	return rawIsSafeBoolean(obj);
};

export const isSafeNumber = (num: unknown): num is number =>
{
	return rawIsSafeNumber(num);
};

export const getSafeString = (str: unknown): string =>
{
	return rawGetSafeString(str);
};

export const isSafeJSON = (str: string): boolean =>
{
	return rawIsSafeJSON(str);
};

export const isSafeArray = (arr: unknown): arr is unknown[] =>
{
	return rawIsSafeArray(arr);
};

export const isEmptyArray = (arr: unknown): boolean =>
{
	return rawIsEmptyArray(arr);
};

export const hasKey = (obj: valTypeAllObject, key: string): boolean =>
{
	return key in obj;
};

export const isSafeHaskey = (obj: unknown, key: string): obj is valTypeAllObject =>
{
	if(!rawIsSafeObject(obj) || !rawIsSafeString(key)){
		return false;
	}
	return rawHasKey(obj, key);
};

export const isSafeFunction = (func: unknown): func is Function =>
{
	return rawIsSafeFunction(func);
};

export const getSafeArray = (arr: unknown): unknown[] =>
{
	return rawGetSafeArray(arr);
};

export const findStringInArray = (arr: unknown[], str: string): boolean =>
{
	return rawFindStringInArray(arr, str);
};

export const addStringToArray = (arr: unknown[], str: string): unknown[] =>
{
	return rawAddStringToArray(arr, str);
};

export const tryAddStringToArray = (arr: unknown[], str: string): boolean =>
{
	return rawTryAddStringToArray(arr, str);
};

export const removeStringFromArray = (arr: unknown[], str: string): boolean =>
{
	return rawRemoveStringFromArray(arr, str);
};

export const compareArray = (arr1: unknown[], arr2: unknown[], strict: boolean): boolean =>
{
	return rawCompareArray(arr1, arr2, strict);
};

export const mergeArray = (arr1: unknown[], arr2: unknown[]): unknown[] =>
{
	return rawMergeArray(arr1, arr2);
};

export const mergeObjects = (obj1: valTypeAllObject, obj2: valTypeAllObject): valTypeAllObject =>
{
	return rawMergeObjects(obj1, obj2);
};

export const checkDir = (path: string): boolean =>
{
	return rawCheckDir(path);
};

export const checkMakeDir = (path: string): boolean =>
{
	return rawCheckMakeDir(path);
};

export const isStringValObj = (val: unknown): val is StringValObj =>
{
	return rawIsStringValObj(val);
};

export const isStringArray = (arr: unknown): arr is string[] =>
{
	return rawIsStringArray(arr);
};

export const isCRCObject = (val: unknown): val is CRCObject =>
{
	return rawIsCRCObject(val);
};

export const isSignMinUrlEntry = (val: unknown): val is SignMinUrlEntry =>
{
	return rawIsSignMinUrlEntry(val);
};

export const isSignUrlEntry = (val: unknown): val is SignUrlEntry =>
{
	return rawIsSignUrlEntry(val);
};

export const isSignMinUrls = (val: unknown): val is SignMinUrls =>
{
	return rawIsSignMinUrls(val);
};

export const isSignUrls = (val: unknown): val is SignUrls =>
{
	return rawIsSignUrls(val);
};

export const isValidatorModule = (module: unknown): module is ValidatorModule =>
{
	return rawIsValidatorModule(module);
};

export const isAppMenuItemArray = (obj: unknown): obj is AppMenuItem[] =>
{
	return rawIsAppMenuItemArray(obj);
};

export const isExtRouterSetConfig = (val: unknown): val is ExtRouterSetConfig =>
{
	return rawIsExtRouterSetConfig(val);
};

export const isExtRouterInfo = (obj: unknown): obj is ExtRouterInfo =>
{
	return rawIsExtRouterInfo(obj);
};

export const isOIDCConfigParams = (obj: unknown): obj is OIDCConfigParams =>
{
	return rawIsOIDCConfigParams(obj);
};

export const isOIDCExtRouterConfig = (obj: unknown): obj is OIDCExtRouterConfig =>
{
	return rawIsOIDCExtRouterConfig(obj);
};

export const isOIDCRouterInfo = (obj: unknown): obj is OIDCRouterInfo =>
{
	return rawIsOIDCRouterInfo(obj);
};

export const isExtRouterInfos = (obj: unknown): obj is ExtRouterInfos =>
{
	return rawIsExtRouterInfos(obj);
};

export const deepClone = <T>(src: T): T =>								// see. r3DeepClone function
{
	if(undefined === src){
		return undefined as T;

	}else if(null === src){
		return null as T;

	}else if(rawIsSafeBoolean(src) || 'number' === typeof src || rawIsSafeString(src)){
		return src;

	}else if('function' === typeof src){
		return src;

	}else if(rawIsSafeArray(src)){
		const arr = src.map(item => deepClone(item));
		return arr as T;

	}else if('object' == typeof src){
		const obj: valTypeAllObject = {};
		Object.entries(src).forEach(([key, value]) => {
			obj[key] = deepClone(value);
		});
		return obj as T;
	}
	return src;
};

/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * End:
 * vim600: noexpandtab sw=4 ts=4 fdm=marker
 * vim<600: noexpandtab sw=4 ts=4
 */
