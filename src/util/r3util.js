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
 * CREATE:   Fri Aug 25 2017
 * REVISION:
 *
 */

//
// utility function for compare string
//
export const r3CompareString = (str1, str2) =>
{
	if(	undefined === str1 || null === str1 || 'string' !== typeof str1 ||
		undefined === str2 || null === str2 || 'string' !== typeof str2 ||
		str1 !== str2 )
	{
		return false;
	}
	return true;
};

export const r3CompareCaseString = (str1, str2) =>
{
	if(	undefined === str1 || null === str1 || 'string' !== typeof str1 ||
		undefined === str2 || null === str2 || 'string' !== typeof str2 ||
		str1.toLowerCase() !== str2.toLowerCase() )
	{
		return false;
	}
	return true;
};

export const r3IsEmptyEntity = (obj) =>
{
	if(undefined === obj || null === obj || ('object' !== typeof obj && 'boolean' !== typeof obj && 'string' !== typeof obj && 'function' !== typeof obj && isNaN(obj))){
		return true;
	}
	return false;
};

export const r3IsSafeTypedEntity = (obj, type) =>
{
	if(r3IsEmptyEntity(obj) || r3IsEmptyString(type, true)){
		return false;
	}
	if('array' === type.toLowerCase()){
		if(!(obj instanceof Array)){
			return false;
		}
	}else{
		if(type.toLowerCase() !== typeof obj){
			return false;
		}
	}
	return true;
};

export const r3IsEmptyString = (str, istrimed) =>
{
	if(undefined === str || null === str || 'string' !== typeof str || '' === str){
		return true;
	}
	if(undefined !== istrimed && null !== istrimed && 'boolean' === typeof istrimed && istrimed && '' === str.trim()){
		return true;
	}
	return false;
};

//
// utility function for name in object
//
export const r3IsEmptyEntityObject = (obj, name) =>
{
	if(	undefined === obj || null === obj || !(obj instanceof Object)					||
		undefined === name || null === name || 'string' !== typeof name || '' === name	||
		undefined === obj[name] || null === obj[name]									)
	{
		return true;
	}
	return false;
};

//
// utility function for string in object
//
export const r3IsEmptyStringObject = (obj, name) =>
{
	if(	undefined === obj || null === obj || !(obj instanceof Object)										||
		undefined === name || null === name || 'string' !== typeof name || '' === name						||
		undefined === obj[name] || null === obj[name] || 'string' !== typeof obj[name] || '' === obj[name]	)
	{
		return true;
	}
	return false;
};

//
// utility function for merging
//
export const r3ObjMerge = (baseObj, ...addObjs) =>
{
	let	newObj = {};
	if(undefined !== baseObj && null !== baseObj){
		newObj = Object.assign(newObj, baseObj);
	}
	for(let cnt = 0; cnt < addObjs.length; ++cnt){
		newObj = Object.assign(newObj, addObjs[cnt]);
	}
	return newObj;
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
export const r3DeepClone = (src) =>
{
	if(undefined === src){
		return undefined;

	}else if(null === src){
		return null;

	}else if('boolean' === typeof src){
		return src;

	}else if('number' === typeof src){
		return src;

	}else if('string' === typeof src){
		return src;

	}else if('function' === typeof src){
		console.warn('r3DeepClone : could not clone funtion, thus return reference.');
		return src;

	}else if('object' === typeof src){
		if(src instanceof Array){
			let	arr = [];
			for(let cnt = 0; cnt < src.length; ++cnt){
				arr.push(r3DeepClone(src[cnt]));
			}
			return arr;

		}else if(src instanceof Object){
			let	obj		= {};
			let	names	= Object.keys(src);
			for(let cnt = 0; cnt < names.length; ++cnt){
				obj[names[cnt]] = r3DeepClone(src[names[cnt]]);
			}
			return obj;

		}else{
			console.warn('r3DeepClone : unknown instance base in object type, thus could not clone and return reference.');
			return src;
		}
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
export const r3DeepCompare = (obj1, obj2) =>
{
	let	tmpObj1 = obj1;
	let	tmpObj2 = obj2;
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

	}else if('object' === typeof tmpObj1){
		if(tmpObj1 instanceof Array){
			if('object' === typeof tmpObj2 && tmpObj2 instanceof Array){
				if(tmpObj1.length !== tmpObj2.length){
					return false;
				}
				let	arrCheck = {};
				for(let cnt1 = 0; cnt1 < tmpObj1.length; ++cnt1){
					let	found = false;
					for(let cnt2 = 0; cnt2 < tmpObj2.length; ++cnt2){
						if(undefined === arrCheck[cnt2]){
							if(r3DeepCompare(tmpObj1[cnt1], tmpObj2[cnt2])){
								arrCheck[cnt2]	= true;
								found			= true;
								break;
							}
						}
					}
					if(!found){
						return false;
					}
				}
				return true;
			}else{
				return false;
			}

		}else if(tmpObj1 instanceof Object){
			if('object' === typeof tmpObj2 && tmpObj2 instanceof Object){
				let	namesObj1 = Object.keys(tmpObj1);
				let	namesObj2 = Object.keys(tmpObj2);
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
				return false;
			}
		}else{
			return false;
		}
	}
	console.warn('r3DeepCompare : unknown type, thus could not compare.');
	return (typeof tmpObj1 === typeof tmpObj2 && r3GetJSON(tmpObj1) === r3GetJSON(tmpObj2));
};

export const r3IsJSON = (str) =>
{
	if('string' !== typeof str){
		return false;
	}
	try{
		var tmpstr = JSON.parse(str);					// eslint-disable-line no-unused-vars
	}catch(exception){
		return false;
	}
	return true;
};

export const r3ConvertFromJSON = (obj) =>
{
	if('string' !== typeof obj){
		return null;
	}
	try{
		return JSON.parse(obj);							// eslint-disable-line no-unused-vars
	}catch(exception){
		return null;
	}
};

export const r3GetJSON = (obj) =>
{
	if('string' === typeof obj){
		if(!r3IsJSON(obj)){
			return obj;
		}
		// to object
		obj = r3ConvertFromJSON(obj);
	}
	return JSON.stringify(obj);
};

export const r3RenameObjectKey = (obj, oldKey, newKey) =>
{
	let	inputObj;
	let	isCvt;
	if(r3IsJSON(obj)){
		inputObj	= r3ConvertFromJSON(obj);
		isCvt		= true;
	}else{
		inputObj	= obj;
		isCvt		= false;
	}
	if('object' !== typeof inputObj || !(inputObj instanceof Object)){
		return obj;
	}

	let	outputObj	= {};
	let	keyNames	= Object.keys(inputObj);
	for(let cnt = 0; cnt < keyNames.length; ++cnt){
		if(oldKey === keyNames[cnt]){
			outputObj[newKey]		= inputObj[keyNames[cnt]];
		}else{
			outputObj[keyNames[cnt]]= inputObj[keyNames[cnt]];
		}
	}
	if(isCvt){
		outputObj = JSON.stringify(outputObj);
	}
	return outputObj;
};

export const r3ArrayHasValue = (arr, value) =>
{
	if(undefined === arr || null === arr || !(arr instanceof Array) || undefined === value){
		return false;
	}
	for(let cnt = 0; cnt < arr.length; ++cnt){
		if(r3DeepCompare(arr[cnt], value)){
			return true;
		}
	}
	return false;
};

export const r3ArrayRemoveValue = (arr, value) =>
{
	if(undefined === arr || null === arr || !(arr instanceof Array) || undefined === value){
		return false;
	}
	for(let cnt = 0; cnt < arr.length; ){
		if(r3DeepCompare(arr[cnt], value)){
			delete arr.splice(cnt, 1);
		}else{
			++cnt;
		}
	}
	return false;
};

export const r3ArrayAddValue = (arr, value) =>
{
	if(undefined === arr || null === arr || !(arr instanceof Array) || undefined === value){
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
export const parseCombineHostObject = (combineHostObject) =>
{
	let	result	= {
		hostname:	'',
		port:		0,
		cuk:		null,
		extra:		null														// this value is reserved now.
	};

	if(r3IsEmptyString(combineHostObject, true)){
		return result;
	}
	let	hostname= '';
	let	port	= 0;
	let	cuk		= null;
	let	extra	= null;

	// 1) hostname
	var	sepPos					= combineHostObject.indexOf(' ');				// separator is ' '
	if(-1 === sepPos){
		hostname				= combineHostObject;
	}else{
		if(0 === sepPos){
			hostname			= '';											// wrong host name
			combineHostObject	= combineHostObject.substr(sepPos + 1);
		}else{
			hostname			= combineHostObject.substr(0, sepPos);
			combineHostObject	= combineHostObject.substr(sepPos + 1);
		}

		// 2) port
		sepPos					= combineHostObject.indexOf(' ');				// separator is ' '
		if(-1 === sepPos){
			if(!r3IsEmptyEntity(combineHostObject)){
				if('string' === typeof combineHostObject && !isNaN(combineHostObject.trim())){
					port		= parseInt(combineHostObject.trim());
				}else if('number' === typeof combineHostObject){
					port		= combineHostObject;
				}
			}
		}else if(0 === sepPos){
			port				= 0;
			combineHostObject	= combineHostObject.substr(sepPos + 1);
		}else{
			let	tmpstr			= combineHostObject.substr(0, sepPos);
			if(!r3IsEmptyEntity(tmpstr)){
				if('string' === typeof tmpstr && !isNaN(tmpstr.trim())){
					port		= parseInt(tmpstr.trim());
				}else if('number' === typeof tmpstr){
					port		= tmpstr;
				}
			}
			combineHostObject	= combineHostObject.substr(sepPos + 1);
		}

		// 3) cuk
		// 4) extra
		sepPos			= combineHostObject.indexOf(' ');						// separator is ' '
		if(-1 === sepPos){
			cuk			= combineHostObject;
		}else{
			if(0 === sepPos){
				cuk		= null;
				extra	= combineHostObject.substr(sepPos + 1);
			}else{
				cuk		= combineHostObject.substr(0, sepPos);
				extra	= combineHostObject.substr(sepPos + 1);
			}
		}
	}
	if(!getCombineHostObject(hostname, port, cuk, extra)){
		// something error in values
		return result;
	}
	result.hostname	= hostname;
	result.port		= port;
	result.cuk		= cuk;
	result.extra	= extra;

	return result;
};

//
// utility methods for hostname + port + cuk
//
// [NOTE]
// extra is reserved.
//
export const getCombineHostObject = (hostname, port, cuk, extra) =>										// eslint-disable-line no-unused-vars
{
	let	result = '';
	if(	r3IsEmptyString(hostname, true)																	&&
		(undefined !== port && null !== port && ('string' === typeof port || 'number' === typeof port))	)
	{
		return result;
	}

	if(!r3IsEmptyString(hostname, true)){
		result += hostname.trim();
	}

	if(undefined !== port && null !== port && ('string' === typeof port || 'number' === typeof port)){
		if('string' === typeof port){
			if(!isNaN(port.trim())){
				port = parseInt(port.trim());
			}else if('*' === port.trim()){
				port = 0;
			}else{
				// wrong string...
				port = 0;
			}
		}
	}else{
		port = 0;
	}
	result += ' ' + String(port);

	if(r3IsEmptyString(cuk, true)){
		cuk = '';
	}else{
		cuk = cuk.trim();
	}
	result += ' ' + cuk;

	if(!r3IsEmptyString(extra)){
		result += ' ' + extra;
	}

	return result;
};

//
// utility methods for parser
//
export const parseKVString = (basestr, key) =>
{
	let	result = {reststr: null, value: null};
	if(r3IsEmptyString(basestr)){
		return result;
	}
	if(r3IsEmptyString(key)){
		result.reststr	= basestr;
		result.value	= null;
		return result;
	}

	let	sepCommaArray	= basestr.split(/,/);
	let	valueStr		= null;
	let	restStr			= null;
	for(let cnt = 0; cnt < sepCommaArray.length; ++cnt){
		if(null === valueStr){
			let	commaStr	= sepCommaArray[cnt].trim();
			let	pos			= commaStr.indexOf(key);
			if(0 !== pos){
				// not found 'key'
				if(null !== restStr){
					restStr	+= ',';
				}else{
					restStr	+= '';
				}
				restStr		+= sepCommaArray[cnt];
				continue;
			}
			let	afterStr	= commaStr.substr(pos + key.length).trim();
			pos				= afterStr.indexOf('=');
			if(0 !== pos){
				// not found 'key='
				if(null !== restStr){
					restStr	+= ',';
				}else{
					restStr	+= '';
				}
				restStr		+= sepCommaArray[cnt];
				continue;
			}
			afterStr		= afterStr.substr(pos + 1).trim();
			pos				= afterStr.indexOf(',');
			if(-1 === pos){
				// not found ','(next value)
				valueStr	= afterStr;
				afterStr	= null;
			}else if(0 === pos){
				valueStr	= '';
				afterStr	= afterStr.substr(pos + 1);
			}else{
				// found ','(next value)
				valueStr	= afterStr.substr(0, pos).trim();
				afterStr	= afterStr.substr(pos + 1).trim();
			}

			// merge rest string
			if(null === restStr){
				restStr	= '';
			}else{
				restStr	+= ',';
			}
			restStr		+= afterStr;

		}else{
			// already found key and set value
			if(null !== restStr){
				restStr	+= ',';
			}else{
				restStr	+= '';
			}
			restStr		+= sepCommaArray[cnt];
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

export const r3IsSafeUrl = (strurl) =>
{
	if(r3IsEmptyString(strurl)){
		return false;
	}
	if(null === strurl.match(reg_url)){
		return false;
	}
	return true;
};

export const r3ParseUrl = (strurl) =>
{
	if(r3IsEmptyString(strurl)){
		return null;
	}
	let	matches = strurl.match(reg_url);
	if(null === matches || !(matches instanceof Array) || matches < 7){
		return null;
	}
	let	resobj		= {};
	resobj.https	= r3CompareCaseString(matches[1], 'https');
	resobj.host		= matches[2];
	resobj.path		= matches[5];
	if((undefined === matches[3] || null === matches[3] || 'string' !== typeof matches[3]) && !isNaN(matches[3].substr(1))){
		resobj.port	= parseInt(matches[3].substr(1));
	}else{
		resobj.port	= resobj.https ? 443 : 80;
	}
	return resobj;
};

//
// unescapeHTML
//
export const r3UnescapeHTML = (str) =>
{
	return str.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
};

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
