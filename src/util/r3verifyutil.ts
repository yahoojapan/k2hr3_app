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

import { serviceResTypeUrl, serviceResTypeObject, serviceResTypeUnknown, ServiceResType, CheckServiceResult, isServiceResourceObjectArray, ServiceResourceObject, ResourceType, resourceTypeObject, resourceTypeString, valTypeAll, valTypeAllObject }	from '../util/r3types';
import { r3IsString, r3IsBoolean, r3IsNumber, r3IsObject, r3IsArray, r3IsFunction, r3IsEmptyString, r3IsEmptyEntity, r3IsSafeUrl, r3IsJSON, r3ConvertFromJSON, r3DeepClone }	from '../util/r3util';

//
// [NOTE]
// Allowed static resource data is following:
//
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
//

//
// Utility : Normalize service resource value to static resource string
//
export const normalizeServiceReourceOneStaticObject = (serviceResObj: unknown, count: number): ServiceResourceObject | null =>
{
	if(!r3IsNumber(count)){
		count = 0;
	}

	let oneValue: ServiceResourceObject;
	if(r3IsEmptyEntity(serviceResObj) || r3IsFunction(serviceResObj)){
		// no value
		return null;

	}else if(r3IsString(serviceResObj)){
		oneValue = {
			name:	 'undefined_' + String(count),
			type:	 resourceTypeString,
			data:	 serviceResObj
		};

	}else if(r3IsBoolean(serviceResObj)){
		oneValue = {
			name:	'undefined_' + String(count),
			type:	resourceTypeString,
			data:	(serviceResObj ? 'true' : 'false')
		};

	}else if(r3IsArray(serviceResObj)){
		oneValue = {
			name:	'undefined_' + String(count),
			type:	resourceTypeString,
			data:	JSON.stringify(serviceResObj)
		};

	}else if(r3IsObject(serviceResObj)){
		let	_name: string;
		if(r3IsEmptyEntity(serviceResObj.name)){
			_name = 'undefined_' + String(count);
		}else if(r3IsString(serviceResObj.name)){
			_name = serviceResObj.name;
		}else{
			_name = JSON.stringify(serviceResObj.name);
		}

		let	_type: ResourceType;
		if(r3IsObject(serviceResObj.type)){
			_type = resourceTypeObject;
		}else{
			_type = resourceTypeString;
		}

		let	_data: string | valTypeAllObject | null;
		if(r3IsEmptyEntity(serviceResObj.data)){
			_data = null;
		}else if(r3IsString(serviceResObj.data)){
			_data = serviceResObj.data;
		}else{
			_data = JSON.stringify(serviceResObj.data);
		}

		let	_expire: number | null | undefined = undefined;
		if(r3IsNumber(serviceResObj.expire)){
			_expire = serviceResObj.expire;
		}

		let	_key: valTypeAllObject | undefined;
		if(r3IsObject(serviceResObj.keys) || r3IsString(serviceResObj.keys)){
			let	_keystmp: valTypeAll;
			if(r3IsJSON(serviceResObj.keys)){
				_keystmp = r3ConvertFromJSON(serviceResObj.keys);
			}else{
				_keystmp = serviceResObj.keys;
			}
			if(r3IsObject(_keystmp) && !r3IsEmptyEntity(_keystmp)){
				_key = r3DeepClone(_keystmp);
			}else{
				// keys is not object
			}
		}

		oneValue = {
			name:	_name,
			expire:	_expire,
			type:	_type,
			data:	_data,
			keys:	_key
		};
	}else{
		// unknown object type
		return null;
	}
	return oneValue;
};

export const normalizeServiceReourceStaticObject = (serviceResource: unknown): ServiceResourceObject[] =>
{
	const normValue: ServiceResourceObject[] = [];

	let	resource = serviceResource;
	if(r3IsString(resource) && r3IsJSON(resource)){
		// value is JSON string(this process does not occur)
		resource = r3ConvertFromJSON(resource);
	}

	let	count    = 0;
	let	oneValue: ServiceResourceObject | null;
	if(!r3IsArray(resource)){
		// value should be an array, but try to convert it.
		oneValue = normalizeServiceReourceOneStaticObject(resource, count);
		if(null != oneValue){
			normValue.push(oneValue);
		}
	}else{
		const arr = resource;
		for(let cnt = 0; cnt < arr.length; ++cnt){
			oneValue = normalizeServiceReourceOneStaticObject(arr[cnt], count);
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
export const checkServiceResourceValue = (serviceResource: valTypeAll): CheckServiceResult =>
{
	const result: CheckServiceResult = {
		error:	null,
		type:	serviceResTypeUnknown
	};

	if(r3IsArray(serviceResource)){
		// an array for static resources object
		if(!isServiceResourceObjectArray(serviceResource)){
			result.error = 'eNewWrongVerifyObject';
		}else{
			result.type	 = serviceResTypeObject;
		}

	}else if(r3IsString(serviceResource) && r3IsEmptyString(serviceResource)){
		// value must be not empty string
		result.error = 'eNewEmptyVerify';

	}else if(r3IsString(serviceResource) && r3IsJSON(serviceResource)){
		// value is JSON string(this process does not occur)
		const serviceResObjArr = r3ConvertFromJSON(serviceResource);
		if(!isServiceResourceObjectArray(serviceResObjArr)){
			result.error = 'eNewWrongVerifyObject';
		}else{
			result.type	 = serviceResTypeObject;
		}

	}else if(r3IsString(serviceResource) && r3IsSafeUrl(serviceResource)){
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
export const isErrorServiceResourceValue = (serviceResource: valTypeAll): boolean =>
{
	const result = checkServiceResourceValue(serviceResource);
	return (null != result.error);
};

//
// Utility : Get verify url or static string type
//
export const getServiceResourceType = (serviceResource: valTypeAll): ServiceResType =>
{
	const result = checkServiceResourceValue(serviceResource);
	return result.type;
};

//
// Utility : check verify url type
//
export const isServiceResourceVerifyUrl = (serviceResource: valTypeAll): boolean =>
{
	const result = checkServiceResourceValue(serviceResource);
	return (result.type == serviceResTypeUrl);
};

//
// Utility : check static resource string type
//
export const isServiceResourceStaticString = (serviceResource: valTypeAll): boolean =>
{
	const result = checkServiceResourceValue(serviceResource);
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
