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
 * CREATE:   Fri Oct 4 2019
 * REVISION:
 *
 */

import { serviceResTypeUrl, serviceResTypeObject, serviceResTypeUnknown }	from '../util/r3types';
import { r3IsEmptyEntity, r3IsEmptyString, r3CompareCaseString, r3IsSafeTypedEntity, r3IsJSON, r3ConvertFromJSON, r3IsSafeUrl, r3DeepClone }	from '../util/r3util';

//
// Utility : Check service resource for static resource string
//
// allowed static resource data is following:
//	verify	= [					:	An array with at least one element object
//		{
//			name				:	resource name which is key name(path) for resource
//			expire				:	undefined/null or integer
//			type				:	resource data type(string or object), if date is null or '', this value must be string.
//			data				:	resource data which must be string or object or null/undefined.
//			keys = {			:	resource has keys(associative array), or null/undefined.
//				'foo':	bar,	:	any value is allowed
//				...				:
//			}					:
//		},
//		...
//	]
export const checkServiceReourceStaticString = (serviceResObjArr) =>
{
	if(!r3IsSafeTypedEntity(serviceResObjArr, 'array') || 0 === serviceResObjArr.length){
		return false;
	}

	for(let cnt = 0; cnt < serviceResObjArr.length; ++cnt){
		if(r3IsEmptyString(serviceResObjArr[cnt].name)){
			// name key must be existed.
			return false;
		}
		if(!r3CompareCaseString('string', serviceResObjArr[cnt].type) && !r3CompareCaseString('object', serviceResObjArr[cnt].type)){
			// type must be string or object
			return false;
		}
	}
	return true;
};

//
// Utility : Normalize service resource value to static resource string
//
export const normalizeServiceReourceOneStaticObject = (serviceResObj, count) =>
{
	if(!r3IsSafeTypedEntity(count, 'number')){
		count = 0;
	}

	let	oneValue = {};
	if(r3IsEmptyEntity(serviceResObj) || r3IsSafeTypedEntity(serviceResObj, 'function')){
		// no value
		return null;

	}else if(r3IsSafeTypedEntity(serviceResObj, 'string')){
		oneValue.name = 'undefined_' + String(count);
		oneValue.type = 'string';
		oneValue.date = serviceResObj;

	}else if(r3IsSafeTypedEntity(serviceResObj, 'boolean')){
		oneValue.name = 'undefined_' + String(count);
		oneValue.type = 'string';
		oneValue.data = (serviceResObj ? 'true' : 'false');

	}else if(r3IsSafeTypedEntity(serviceResObj, 'array')){
		oneValue.name = 'undefined_' + String(count);
		oneValue.type = 'string';
		oneValue.data = JSON.stringify(serviceResObj);

	}else{
		// object...
		if(r3IsEmptyEntity(serviceResObj.name)){
			oneValue.name = 'undefined_' + String(count);
		}else if(r3IsSafeTypedEntity(serviceResObj.name, 'string')){
			oneValue.name = serviceResObj.name;
		}else{
			oneValue.name = JSON.stringify(serviceResObj.name);
		}

		if(r3IsSafeTypedEntity(serviceResObj.type, 'object')){
			oneValue.type = 'object';
		}else{
			oneValue.type = 'string';
		}

		if(r3IsEmptyEntity(serviceResObj.data)){
			oneValue.data = null;
		}else if(r3IsSafeTypedEntity(serviceResObj.data, 'string')){
			oneValue.data = serviceResObj.data;
		}else{
			oneValue.data = JSON.stringify(serviceResObj.data);
		}

		if(r3IsSafeTypedEntity(serviceResObj.expire, 'number')){
			oneValue.expire = serviceResObj.expire;
		}

		if(!r3IsSafeTypedEntity(serviceResObj.keys, 'function')){
			let	keys = serviceResObj.keys;
			if(r3IsJSON(keys)){
				keys = r3ConvertFromJSON(keys);
			}
			if(	!r3IsEmptyEntity(keys)					&&
				!r3IsSafeTypedEntity(keys, 'function')	&&
				!r3IsSafeTypedEntity(keys, 'string')	&&
				!r3IsSafeTypedEntity(keys, 'boolean')	&&
				!r3IsSafeTypedEntity(keys, 'array')		)
			{
				oneValue.keys = r3DeepClone(keys);
			}else{
				// keys is not object
			}
		}
	}
	return oneValue;
};

export const normalizeServiceReourceStaticObject = (serviceResource) =>
{
	let	normValue = [];

	if(r3IsJSON(serviceResource)){
		// value is JSON string(this process does not occur)
		serviceResource = r3ConvertFromJSON(serviceResource);
	}

	let	count    = 0;
	let	oneValue;
	if(!r3IsSafeTypedEntity(serviceResource, 'array')){
		// value should be an array, but try to convert it.
		oneValue = normalizeServiceReourceOneStaticObject(serviceResource, count);
		if(null != oneValue){
			normValue.push(oneValue);
		}
	}else{
		for(let cnt = 0; cnt < serviceResource.length; ++cnt){
			oneValue = normalizeServiceReourceOneStaticObject(serviceResource[cnt], count);
			if(null != oneValue){
				normValue.push(oneValue);
				++count;
			}
		}
	}
	return normValue;
};

//
// Utility : Check service resource value(verify url or static resource string or unknown)
//
// result {
//		type:	<serviceResType**** symbol in r3types.js>
//		error:	<string is r3TextRes object key name. if not error, this value is null>
// }
//
export const checkServiceResourceValue = (serviceResource) =>
{
	let	result = {
		type:	serviceResTypeUnknown,
		error:	null
	};

	if(r3IsSafeTypedEntity(serviceResource, 'array')){
		// an array for static resources object
		if(!checkServiceReourceStaticString(serviceResource)){
			result.error = 'eNewWrongVerifyObject';
		}else{
			result.type	 = serviceResTypeObject;
		}

	}else if(r3IsEmptyString(serviceResource)){
		// value must be not empty string
		result.error = 'eNewEmptyVerify';

	}else if(r3IsJSON(serviceResource)){
		// value is JSON string(this process does not occur)
		let	serviceResObjArr = r3ConvertFromJSON(serviceResource);
		if(!checkServiceReourceStaticString(serviceResObjArr)){
			result.error = 'eNewWrongVerifyObject';
		}else{
			result.type	 = serviceResTypeObject;
		}

	}else if(r3IsSafeUrl(serviceResource)){
		// value is verify URL
		result.type	 = serviceResTypeUrl;

	}else{
		// value is Unknown
		result.error = 'eNewWrongVerifyUrl';
	}
	return result;
};

//
// Utility : Check error in service resource value
//
export const isErrorServiceResourceValue = (serviceResource) =>
{
	let	result = checkServiceResourceValue(serviceResource);
	return (null != result.error);
};

//
// Utility : Get verify url or static string type
//
export const getServiceResourceType = (serviceResource) =>
{
	let	result = checkServiceResourceValue(serviceResource);
	return result.type;
};

//
// Utility : check verify url type
//
export const isServiceResourceVerifyUrl = (serviceResource) =>
{
	let	result = checkServiceResourceValue(serviceResource);
	return (result.type == serviceResTypeUrl);
};

//
// Utility : check static resource string type
//
export const isServiceResourceStaticString = (serviceResource) =>
{
	let	result = checkServiceResourceValue(serviceResource);
	return (result.type == serviceResTypeObject);
};

/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * End:
 * vim600: noexpandtab sw=4 ts=4 fdm=marker
 * vim<600: noexpandtab sw=4 ts=4
 */
