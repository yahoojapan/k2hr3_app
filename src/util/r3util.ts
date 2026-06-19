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
 * CREATE:   Fri Aug 25 2017
 * REVISION:
 *
 */

import type { valTypeAll, valTypeAllObject, StringValObj, RoleHostInfo, ParseKVResult, ParseUrlResult, DiffRoundResult } from '../util/r3types';

//
// Typechecker
//
export const r3IsString = (str: unknown): str is string =>
{
	if(undefined === str || null === str){
		return false;
	}
	return 'string' === typeof str;
};

export const r3IsBoolean = (bool: unknown): bool is boolean =>
{
	if(undefined === bool || null === bool){
		return false;
	}
	return 'boolean' === typeof bool;
};

export const r3IsNumber = (num: unknown): num is number =>
{
	if(undefined === num || null === num){
		return false;
	}
	return 'number' === typeof num;
};

export const r3IsObject = (obj: unknown): obj is valTypeAllObject =>
{
	if(undefined === obj || null === obj || Array.isArray(obj)){
		return false;
	}
	return obj instanceof Object;
};

export const r3IsStringValObject = (val: unknown): val is StringValObj =>
{
	if(!r3IsObject(val)){
		return false;
	}
	return Object.values(val).every(val => r3IsString(val));
};

export const r3IsArray = (arr: unknown): arr is unknown[] =>
{
	if(undefined === arr || null === arr){
		return false;
	}
	return Array.isArray(arr);
};

export const r3IsStringArray = (val: unknown): val is string[] =>
{
	if(!r3IsArray(val)){
		return false;
	}
	return val.every((item: unknown) => r3IsString(item));
};

export const r3IsFunction = (func: unknown): func is Function =>
{
	if(undefined === func || null === func){
		return false;
	}
	return 'function' === typeof func;
};

//
// utility function for compare string
//
export const r3CompareString = (str1: unknown, str2: unknown): boolean =>
{
	if(!r3IsString(str1) || !r3IsString(str2) || str1 !== str2){
		return false;
	}
	return true;
};

export const r3CompareCaseString = (str1: unknown, str2: unknown): boolean =>
{
	if(!r3IsString(str1) || !r3IsString(str2) || str1.toLowerCase() !== str2.toLowerCase()){
		return false;
	}
	return true;
};

export const r3IsEmptyEntity = (obj: unknown): boolean =>
{
	if(undefined === obj || null === obj || (!r3IsObject(obj) && !r3IsBoolean(obj) && !r3IsString(obj) && !r3IsNumber(obj) && !r3IsArray(obj))){
		return true;
	}
	return false;
};

export const r3IsEmptyString = (str: unknown, istrimed?: boolean): boolean =>
{
	if(!r3IsString(str)){
		return true;
	}
	if('' === str){
		return true;
	}
	if(r3IsBoolean(istrimed) && istrimed && '' === str.trim()){
		return true;
	}
	return false;
};

//
// utility function for name in object
//
export const r3HasKey = <T extends object>(obj: T, key: string): key is Extract<keyof T, string> =>
{
	return key in obj;
};

export const r3IsEmptyEntityObject = (obj: unknown, name: string): boolean =>
{
	if(!r3IsObject(obj) || !r3IsString(name) || r3IsEmptyString(name, true)){
		return true;
	}
	if(!r3HasKey(obj, name) || undefined === obj[name] || null === obj[name]){
		return true;
	}
	return false;
};

//
// utility function for get string with default
//
export const r3GetSafeString = (str: unknown, defaultstr: string | null = null): string =>
{
	if(r3IsString(str) && !r3IsEmptyString(str, true)){
		return str;
	}
	if(r3IsString(defaultstr)){
		return defaultstr;
	}
	return '';
};

//
// utility function for string in object
//
export const r3IsEmptyStringObject = (obj: unknown, name: string): boolean =>
{
	if(!r3IsObject(obj) || !r3IsString(name) || r3IsEmptyString(name, true) || r3IsEmptyEntityObject(obj, name) || !r3IsString(obj[name]) || r3IsEmptyString(obj[name], true)){
		return true;
	}
	return false;
};

//
// utility convert to number
//
export const r3GetDecNumber = (num: unknown): number =>
{
	if(r3IsNumber(num)){
		return num;
	}
	if(r3IsString(num) && !r3IsEmptyString(num) && !Number.isNaN(Number(num))){
		return parseInt(num, 10);
	}
	return 0;
};

//
// utility function for merging
//
export const r3ObjMerge = (baseObj: unknown, ...addObjs: unknown[]): valTypeAllObject =>
{
	let newObj: valTypeAllObject = {};
	if(r3IsObject(baseObj)){
		newObj = Object.assign(newObj, baseObj);
	}
	addObjs.forEach(obj => {
		if(r3IsObject(obj)){
			newObj = Object.assign(newObj, obj);
		}
	});
	return newObj;
};

export const r3StringValObjMerge = (baseObj: unknown, addObj: unknown): StringValObj =>
{
	const baseSafe	= r3IsStringValObject(baseObj) ? baseObj : {};
	const addSafe	= r3IsStringValObject(addObj) ? addObj : {};
	return { ...baseSafe, ...addSafe };
};

//
// function r3DeepClone
//
// This function is for deep clone source object.
// Be careful for this function can not clone function(and class) and
// unknown type source object.
// This function can clone only undefined, null, boolean, string,
// number, basically object, array.
//
export const r3DeepClone = <T>(src: T): T =>
{
	if(undefined === src){
		return undefined as T;

	}else if(null === src){
		return null as T;

	}else if(r3IsBoolean(src) || r3IsNumber(src) || r3IsString(src)){
		return src;

	}else if(r3IsFunction(src)){
		console.warn('r3DeepClone : could not clone funtion, thus return reference.');
		return src;

	}else if(r3IsArray(src)){
		const arr = src.map(item => r3DeepClone(item));
		return arr as T;

	}else if(r3IsObject(src)){
		const obj: valTypeAllObject = {};
		Object.entries(src).forEach(([key, value]) => {
			obj[key] = r3DeepClone(value);
		});
		return obj as T;
	}
	console.warn('r3DeepClone : unknown type, thus could not clone and return reference.');

	return src;
};

//
// function r3DeepCompare
//
// This function is for deep compare two objects.
// Be careful for this function can not compare function(and class) and
// unknown type source object.
// This function can compare only undefined, null, boolean, string,
// number, basically object, array.
//
export const r3DeepCompare = (obj1: unknown, obj2: unknown): boolean =>
{
	let	tmpObj1: unknown = obj1;
	let	tmpObj2: unknown = obj2;
	if(r3IsJSON(tmpObj1)){
		tmpObj1 = r3ConvertFromJSON(tmpObj1);
	}
	if(r3IsJSON(tmpObj2)){
		tmpObj2 = r3ConvertFromJSON(tmpObj2);
	}

	if(undefined === tmpObj1 || null === tmpObj1){
		return (undefined === tmpObj2 || null === tmpObj2);

	}else if('boolean' === typeof tmpObj1){
		return ('boolean' === typeof tmpObj2 && tmpObj1 === tmpObj2);

	}else if('number' === typeof tmpObj1){
		return ('number' === typeof tmpObj2 && tmpObj1 === tmpObj2);

	}else if('string' === typeof tmpObj1){
		if('string' === typeof tmpObj2 && tmpObj1 === tmpObj2){
			return true;
		}
		return false;

	}else if('function' === typeof tmpObj1){
		console.warn('r3DeepCompare : could not compare funtion.');
		return ('function' === typeof tmpObj2 && r3GetJSON(tmpObj1) === r3GetJSON(tmpObj2));

	}else if(r3IsArray(tmpObj1)){
		if(!r3IsArray(tmpObj2) || tmpObj1.length !== tmpObj2.length){
			return false;
		}
		const arrCheck: Record<number, boolean> = {};
		for(let cnt1 = 0; cnt1 < tmpObj1.length; ++cnt1){
			let	found = false;
			for(let cnt2 = 0; cnt2 < tmpObj2.length; ++cnt2){
				if(undefined === arrCheck[cnt2] && r3DeepCompare(tmpObj1[cnt1], tmpObj2[cnt2])){
					arrCheck[cnt2]	= true;
					found			= true;
					break;
				}
			}
			if(!found){
				return false;
			}
		}
		return true;

	}else if(r3IsObject(tmpObj1)){
		if(!r3IsObject(tmpObj2)){
			return false;
		}
		const namesObj1 = Object.keys(tmpObj1);
		const namesObj2 = Object.keys(tmpObj2);

		if(namesObj1.length !== namesObj2.length){
			return false;
		}

		for(let cnt1 = 0; cnt1 < namesObj1.length; ++cnt1){
			let	found = false;
			for(let cnt2 = 0; cnt2 < namesObj2.length; ++cnt2){
				if(r3DeepCompare(namesObj1[cnt1], namesObj2[cnt2]) && r3DeepCompare(tmpObj1[namesObj1[cnt1]], tmpObj2[namesObj2[cnt2]])){
					found = true;
					break;
				}
			}
			if(!found){
				return false;
			}
		}
		return true;
	}else{
		console.warn('r3DeepCompare : unknown type, thus could not compare.');
		return (typeof tmpObj1 === typeof tmpObj2 && r3GetJSON(tmpObj1) === r3GetJSON(tmpObj2));
	}
};

export const r3IsJSON = (str: unknown): boolean =>
{
	if(!r3IsString(str)){
		return false;
	}
	try{
		JSON.parse(str);
	}catch(exception){
		return false;
	}
	return true;
};

export const r3ConvertFromJSON = (obj: unknown): valTypeAll =>
{
	if(!r3IsString(obj)){
		return null;
	}
	try{
		return JSON.parse(obj);
	}catch(exception){
		return null;
	}
};

export const r3GetJSON = (obj: unknown): string =>
{
	if(r3IsString(obj)){
		if(r3IsJSON(obj)){
			return obj;
		}
		// obj is string but not JSON string, so try to parse it(if faulure, obj is set null)
		obj = r3ConvertFromJSON(obj);
	}
	return JSON.stringify(obj);
};

export const r3RenameObjectKey = (obj: valTypeAll, oldKey: string, newKey: string): valTypeAll =>
{
	let	inputObj:	valTypeAll;
	let	isCvt:		boolean;
	if(r3IsJSON(obj)){
		inputObj	= r3ConvertFromJSON(obj);
		isCvt		= true;
	}else{
		inputObj	= obj;
		isCvt		= false;
	}
	if(!r3IsObject(inputObj)){
		return obj;
	}

	const outputObj: valTypeAllObject	= {};
	const keyNames						= Object.keys(inputObj);
	for(let cnt = 0; cnt < keyNames.length; ++cnt){
		if(oldKey === keyNames[cnt]){
			outputObj[newKey]		= inputObj[keyNames[cnt]];
		}else{
			outputObj[keyNames[cnt]]= inputObj[keyNames[cnt]];
		}
	}
	if(isCvt){
		return JSON.stringify(outputObj);
	}
	return outputObj;
};

export const r3ArrayHasValue = (arr: unknown, value: unknown): boolean =>
{
	if(!r3IsArray(arr)){
		return false;
	}
	// [NOTE]
	// don't use forEach because we want to return immediately after detection.
	for(let cnt = 0; cnt < arr.length; ++cnt){
		if(r3DeepCompare(arr[cnt], value)){
			return true;
		}
	}
	return false;
};

export const r3ArrayRemoveValue = (arr: unknown, value: unknown): boolean =>
{
	if(!r3IsArray(arr)){
		return false;
	}
	for(let cnt = 0; cnt < arr.length; ){
		if(r3DeepCompare(arr[cnt], value)){
			arr.splice(cnt, 1);
		}else{
			++cnt;
		}
	}
	return false;
};

export const r3ArrayAddValue = (arr: unknown, value: unknown): boolean =>
{
	if(!r3IsArray(arr)){
		return false;
	}
	for(let cnt = 0; cnt < arr.length; ++cnt){
		if(r3DeepCompare(arr[cnt], value)){
			return true;
		}
	}
	arr.push(value);
	return true;
};

//
// utility methods for hostname + port + cuk
//
export const parseCombineHostObject = (combineHostObject: string): RoleHostInfo =>
{
	let	result: RoleHostInfo = {
		host:	'',
		port:	0,
		cuk:	null,
		extra:	null,
		tag:	null
	};

	if(r3IsEmptyString(combineHostObject, true)){
		return result;
	}
	let	hostname: string			= '';
	let	port: number				= 0;
	let	cuk: string | null			= null;
	let	extra: string | null		= null;
	let	tag: string | null			= null;
	let	inboundip: string | null	= null;
	let	outboundip: string | null	= null;

	// 1) hostname
	let	sepPos					= combineHostObject.indexOf(' ');				// separator is ' '
	if(-1 === sepPos){
		hostname				= combineHostObject;
		combineHostObject		= '';
	}else{
		if(0 === sepPos){
			hostname			= '';											// wrong host name
			combineHostObject	= combineHostObject.substring(sepPos + 1);
		}else{
			hostname			= combineHostObject.substring(0, sepPos);
			combineHostObject	= combineHostObject.substring(sepPos + 1);
		}

		// 2) port
		sepPos					= combineHostObject.indexOf(' ');				// separator is ' '
		if(-1 === sepPos){
			if(!r3IsEmptyEntity(combineHostObject)){
				if(!isNaN(Number(combineHostObject.trim()))){
					port		= parseInt(combineHostObject.trim());
				}
			}
		}else if(0 === sepPos){
			port				= 0;
			combineHostObject	= combineHostObject.substring(sepPos + 1);
		}else{
			const tmpstr		= combineHostObject.substring(0, sepPos);
			if(!r3IsEmptyEntity(tmpstr)){
				if(!isNaN(Number(tmpstr.trim()))){
					port		= parseInt(tmpstr.trim());
				}
			}
			combineHostObject	= combineHostObject.substring(sepPos + 1);
		}

		// 3) cuk
		sepPos						= combineHostObject.indexOf(' ');			// separator is ' '
		if(-1 === sepPos){
			cuk						= combineHostObject;
			combineHostObject		= '';
		}else{
			if(0 === sepPos){
				cuk					= null;
				combineHostObject	= combineHostObject.substring(sepPos + 1);
			}else{
				cuk					= combineHostObject.substring(0, sepPos);
				combineHostObject	= combineHostObject.substring(sepPos + 1);
			}
		}

		// 4) extra
		if(!r3IsEmptyString(combineHostObject)){
			sepPos						= combineHostObject.indexOf(' ');		// separator is ' '
			if(-1 === sepPos){
				extra					= combineHostObject;
				combineHostObject		= '';
			}else{
				if(0 === sepPos){
					extra				= null;
					combineHostObject	= combineHostObject.substring(sepPos + 1);
				}else{
					extra				= combineHostObject.substring(0, sepPos);
					combineHostObject	= combineHostObject.substring(sepPos + 1);
				}
			}
		}

		// 5) tag
		if(!r3IsEmptyString(combineHostObject)){
			sepPos						= combineHostObject.indexOf(' ');		// separator is ' '
			if(-1 === sepPos){
				tag						= combineHostObject;
				combineHostObject		= '';
			}else{
				if(0 === sepPos){
					tag					= null;
					combineHostObject	= combineHostObject.substring(sepPos + 1);
				}else{
					tag					= combineHostObject.substring(0, sepPos);
					combineHostObject	= combineHostObject.substring(sepPos + 1);
				}
			}
		}

		// 6) inboundip
		if(!r3IsEmptyString(combineHostObject)){
			sepPos						= combineHostObject.indexOf(' ');		// separator is ' '
			if(-1 === sepPos){
				inboundip				= combineHostObject;
				combineHostObject		= '';
			}else{
				if(0 === sepPos){
					inboundip			= null;
					combineHostObject	= combineHostObject.substring(sepPos + 1);
				}else{
					inboundip			= combineHostObject.substring(0, sepPos);
					combineHostObject	= combineHostObject.substring(sepPos + 1);
				}
			}
		}

		// 7) outboundip
		if(!r3IsEmptyString(combineHostObject)){
			sepPos						= combineHostObject.indexOf(' ');		// separator is ' '
			if(-1 === sepPos){
				outboundip				= combineHostObject;
				combineHostObject		= '';
			}else{
				if(0 === sepPos){
					outboundip			= null;
					combineHostObject	= combineHostObject.substring(sepPos + 1);
				}else{
					outboundip			= combineHostObject.substring(0, sepPos);
					combineHostObject	= combineHostObject.substring(sepPos + 1);
				}
			}
		}
	}

	if(r3IsEmptyString(getCombineHostObject(hostname, port, cuk, extra, tag, inboundip, outboundip))){
		// something error in values
		return result;
	}
	result.host			= hostname;
	result.port			= port;
	result.cuk			= cuk;
	result.extra		= extra;
	result.tag			= tag;
	result.inboundip	= inboundip;
	result.outboundip	= outboundip;

	return result;
};

//
// utility methods for hostname + port + cuk
//
export const getCombineHostObject = (hostname: string, port: string | number | null, cuk: string | null, extra: string | null, tag: string | null, inboundip: string | null, outboundip: string | null): string =>
{
	let	result = '';
	if(r3IsEmptyString(hostname, true) && (r3IsString(port) || r3IsNumber(port))){
		return result;
	}
	if(!r3IsEmptyString(hostname, true)){
		result += hostname.trim();
	}

	let	numPort: number;
	if(r3IsString(port)){
		if(!isNaN(Number(port.trim()))){
			numPort = parseInt(port.trim());
		}else if('*' === port.trim()){
			numPort = 0;
		}else{
			numPort = 0;					// wrong string...
		}
	}else if(r3IsNumber(port)){
		numPort = port;
	}else{
		numPort = 0;
	}
	result += ' ' + String(numPort);

	let	cukStr: string;
	if(!r3IsString(cuk) || r3IsEmptyString(cuk, true)){
		cukStr = '';
	}else{
		cukStr = cuk.trim();
	}
	result += ' ' + cukStr;

	if(r3IsString(extra) && !r3IsEmptyString(extra)){
		result += ' ' + extra;
	}else if(!r3IsEmptyString(tag)){
		result += ' ';
	}

	if(r3IsString(tag) && !r3IsEmptyString(tag)){
		result += ' ' + tag;
	}else{
		result += ' ';
	}

	if(r3IsString(inboundip) && !r3IsEmptyString(inboundip)){
		result += ' ' + inboundip;
	}else{
		result += ' ';
	}

	if(r3IsString(outboundip) && !r3IsEmptyString(outboundip)){
		result += ' ' + outboundip;
	}else{
		result += ' ';
	}
	result = result.trimEnd();

	return result;
};

//
// utility methods for parser
//
export const parseKVString = (basestr: string, key: string): ParseKVResult =>
{
	let	result: ParseKVResult = {reststr: null, value: null};
	if(r3IsEmptyString(basestr)){
		return result;
	}
	if(r3IsEmptyString(key)){
		result.reststr	= basestr;
		result.value	= null;
		return result;
	}

	const	sepCommaArray			= basestr.split(/,/);
	let		valueStr: string | null	= null;
	let		restStr: string | null	= null;
	for(let cnt = 0; cnt < sepCommaArray.length; ++cnt){
		if(null === valueStr){
			const	commaStr	= sepCommaArray[cnt].trim();
			let		pos			= commaStr.indexOf(key);
			if(0 !== pos){
				// not found 'key'
				if(null !== restStr){
					restStr	+= ',';
				}else{
					restStr	= '';
				}
				restStr		+= sepCommaArray[cnt];
				continue;
			}
			let	afterStr: string | null	= commaStr.substring(pos + key.length).trim();
			pos							= afterStr.indexOf('=');
			if(0 !== pos){
				// not found 'key='
				if(null !== restStr){
					restStr	+= ',';
				}else{
					restStr	= '';
				}
				restStr		+= sepCommaArray[cnt];
				continue;
			}
			afterStr		= afterStr.substring(pos + 1).trim();
			pos				= afterStr.indexOf(',');
			if(-1 === pos){
				// not found ','(next value)
				valueStr	= afterStr;
				afterStr	= null;
			}else if(0 === pos){
				valueStr	= '';
				afterStr	= afterStr.substring(pos + 1);
			}else{
				// found ','(next value)
				valueStr	= afterStr.substring(0, pos).trim();
				afterStr	= afterStr.substring(pos + 1).trim();
			}

			// merge rest string
			if(null === restStr){
				restStr		= '';
			}else{
				restStr		+= ',';
			}
			restStr			+= afterStr;

		}else{
			// already found key and set value
			if(null !== restStr){
				restStr		+= ',';
			}else{
				restStr		= '';
			}
			restStr			+= sepCommaArray[cnt];
		}
	}

	if(null === valueStr){
		result.reststr	= basestr;
		result.value	= null;
	}else{
		result.reststr	= restStr;
		result.value	= valueStr;
	}
	return result;
};

//
// Check URL
//
const reg_url = /^(https?):\/\/([a-z|A-Z|0-9|$|%|&|(|)|-|=|~|^|||@|+|.|_]+)((:[1-9]\d*)?)((\/.*)*)$/;

export const r3IsSafeUrl = (strurl: unknown): boolean =>
{
	if(!r3IsString(strurl) || r3IsEmptyString(strurl)){
		return false;
	}
	if(null === strurl.match(reg_url)){
		return false;
	}
	return true;
};

export const r3ParseUrl = (strurl: string): ParseUrlResult | null =>
{
	if(r3IsEmptyString(strurl)){
		return null;
	}
	const	matches = strurl.match(reg_url);
	if(null === matches || matches.length < 7){
		return null;
	}
	const resobj: ParseUrlResult = {
		https:	r3CompareCaseString(matches[1], 'https'),
		host:	matches[2],
		path:	matches[5],
		port:	0
	};
	if(r3IsString(matches[3]) && !isNaN(parseInt(matches[3].substring(1)))){
		resobj.port	= parseInt(matches[3].substring(1));
	}else{
		resobj.port	= resobj.https ? 443 : 80;
	}
	return resobj;
};

//
// unescapeHTML
//
export const r3UnescapeHTML = (str: string): string =>
{
	return str.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
};

//
// Date/Time Utility
//
// Convert UTC ISO 8601 String to Locale String
//
export const convertISOStringToLocaleString = (strIso: string): string | null =>
{
	if(r3IsEmptyString(strIso, true)){
		return null;
	}
	const	dateObj	= new Date(strIso);
	const	dateStr	= dateObj.toLocaleDateString();
	const	timeStr	= dateObj.toLocaleTimeString();
	if((-1 == dateStr.indexOf('/') && -1 == dateStr.indexOf('-')) || -1 == timeStr.indexOf(':')){
		return null;
	}
	return (dateStr + ' ' + timeStr);
};

export const getDiffTimeFromISOString = (strIso1: string, strIso2: string): number =>
{
	if(r3IsEmptyString(strIso1, true) || r3IsEmptyString(strIso2, true)){
		return 0;
	}
	const	dateObj1	= new Date(strIso1);
	const	dateObj2	= new Date(strIso2);
	const	diffNum		= dateObj1.getTime() - dateObj2.getTime();
	if(isNaN(diffNum)){
		return 0;
	}
	return Math.floor(Math.abs(diffNum) / 1000);
};

export const diffRoundType = {
	days:		'days',
	hours:		'hours',
	minutes:	'minutes',
	seconds:	'seconds'
} as const;

export const getDiffRoundStringFromISOString = (strIso1: string, strIso2: string): DiffRoundResult =>
{
	let		diffAll	= getDiffTimeFromISOString(strIso1, strIso2);
	const	diffSec	= diffAll % 60;
	diffAll			= Math.floor(diffAll / 60);
	const	diffMin	= diffAll % 60;
	diffAll			= Math.floor(diffAll / 60);
	const	diffHour= diffAll % 24;
	const	diffDay	= Math.floor(diffAll / 24);

	let		result: DiffRoundResult;
	if(0 < diffDay){
		result	= {
			type:	diffRoundType.days,
			value:	diffDay
		};
	}else if(0 < diffHour){
		result	= {
			type:	diffRoundType.hours,
			value:	diffHour
		};
	}else if(0 < diffMin){
		result	= {
			type:	diffRoundType.minutes,
			value:	diffMin
		};
	}else{
		result	= {
			type:	diffRoundType.seconds,
			value:	diffSec
		};
	}
	return result;
};

/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * End:
 * vim600: noexpandtab sw=4 ts=4 fdm=marker
 * vim<600: noexpandtab sw=4 ts=4
 */
