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

'use strict';

var	fs	= require('fs');

function rawIsSafeEntity(obj)
{
	return (undefined !== obj && null !== obj);
}

function rawIsSafeString(str)
{
	if(!rawIsSafeEntity(str) || 'string' !== typeof str || '' === str){
		return false;
	}
	return true;
}

function rawComapreCaseString(str1, str2)
{
	if(	!rawIsSafeString(str1)						||
		!rawIsSafeString(str2)						||
		str1.toLowerCase() !== str2.toLowerCase()	)
	{
		return false;
	}
	return true;
}

function rawIsSafeBoolean(obj)
{
	if(!rawIsSafeEntity(obj) || 'boolean' !== typeof obj){
		return false;
	}
	return true;
}

function rawGetSafeString(str)
{
	if(rawIsSafeString(str)){
		return str;
	}
	return '';
}

function rawIsSafeJSON(str)
{
	if(!rawIsSafeString(str)){
		return false;
	}
	try{
		var tmpstr = JSON.parse(str);					// eslint-disable-line no-unused-vars
	}catch(exception){									// eslint-disable-line no-unused-vars
		return false;
	}
	return true;
}

function rawIsArray(arr)
{
	if(arr instanceof Array){
		return true;
	}
	return false;
}

function rawIsEmptyArray(arr)
{
	if(!rawIsArray(arr) || 0 === arr.length){
		return true;
	}
	return false;
}

function rawGetSafeArray(arr)
{
	if(!rawIsArray(arr)){
		return new Array(0);
	}
	return arr;
}

function rawFindStringInArray(arr, str)
{
	if(!rawIsArray(arr) || !rawIsSafeString(str)){
		return false;
	}
	for(var cnt = 0; cnt < arr.length; ++cnt){
		if(str === arr[cnt]){
			return true;
		}
	}
	return false;
}

function rawAddStringToArray(arr, str)
{
	arr = rawGetSafeArray(arr);
	arr.push(rawGetSafeString(str));
	return arr;
}

function rawTryAddStringToArray(arr, str)
{
	if(!rawIsArray(arr) || !rawIsSafeString(str)){
		return false;
	}
	if(rawFindStringInArray(arr, str)){
		return false;
	}
	rawAddStringToArray(arr, str);
	return true;
}

function rawRemoveStringFromArray(arr, str)
{
	if(!rawIsArray(arr) || !rawIsSafeString(str)){
		return false;
	}
	for(var cnt = 0; cnt < arr.length; ++cnt){
		if(str === arr[cnt]){
			arr.splice(cnt, 1);
			return true;
		}
	}
	return false;
}

function rawCompareArray(arr1, arr2, strict)
{
	if(!rawIsArray(arr1) || !rawIsArray(arr2) || arr1.length !== arr2.length){
		return false;
	}
	if(!rawIsSafeEntity(strict) || 'boolean' !== typeof strict || false === strict){
		var	is_found;
		for(var cnt1 = 0; cnt1 < arr1.length; ++cnt1){
			is_found = false;
			for(var cnt2 = 0; cnt2 < arr2.length; ++cnt2){
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
}

function rawMergeArray(arr1, arr2)
{
	if(!rawIsArray(arr1) && !rawIsArray(arr2)){
		return [];
	}
	if(!rawIsArray(arr2)){
		return arr1;
	}
	if(!rawIsArray(arr1)){
		return arr2;
	}
	for(var cnt2 = 0; cnt2 < arr2.length; ++cnt2){
		var is_found = false;
		for(var cnt1 = 0; cnt1 < arr1.length; ++cnt1){
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
}

function rawMergeObjects(obj1, obj2)
{
	if(!rawIsSafeEntity(obj1)){
		obj1 = {};
	}
	if(!rawIsSafeEntity(obj2)){
		obj2 = {};
	}
	var	resobj = {};
	for(var key1 in obj1){
		resobj[key1] = obj1[key1];
	}
	for(var key2 in obj2){
		resobj[key2] = obj2[key2];
	}
	return resobj;
}

function rawCheckDir(path)
{
	if(!rawIsSafeString(path)){
		return false;
	}
	return fs.existsSync(path);
}

function rawCheckMakeDir(path)
{
	if(rawCheckDir(path)){
		return true;
	}
	if(!rawIsSafeString(path)){
		return false;
	}
	try{
		fs.mkdirSync(path);
	}catch(err){					// eslint-disable-line no-unused-vars
		return false;
	}
	return true;
}

//---------------------------------------------------------
// Exports
//---------------------------------------------------------
exports.isSafeEntity = function(obj)
{
	return rawIsSafeEntity(obj);
};

exports.isSafeString = function(str)
{
	return rawIsSafeString(str);
};

exports.compareCaseString = function(str1, str2)
{
	return rawComapreCaseString(str1, str2);
};

exports.isSafeBoolean = function(obj)
{
	return rawIsSafeBoolean(obj);
};

exports.getSafeString = function(str)
{
	return rawGetSafeString(str);
};

exports.isSafeJSON = function(str)
{
	return rawIsSafeJSON(str);
};

exports.isArray = function(arr)
{
	return rawIsArray(arr);
};

exports.isEmptyArray = function(arr)
{
	return rawIsEmptyArray(arr);
};

exports.getSafeArray = function(arr)
{
	return rawGetSafeArray(arr);
};

exports.findStringInArray = function(arr, str)
{
	return rawFindStringInArray(arr, str);
};

exports.addStringToArray = function(arr, str)
{
	return rawAddStringToArray(arr, str);
};

exports.tryAddStringToArray = function(arr, str)
{
	return rawTryAddStringToArray(arr, str);
};

exports.removeStringFromArray = function(arr, str)
{
	return rawRemoveStringFromArray(arr, str);
};

exports.compareArray = function(arr1, arr2, strict)
{
	return rawCompareArray(arr1, arr2, strict);
};

exports.mergeArray = function(arr1, arr2)
{
	return rawMergeArray(arr1, arr2);
};

exports.mergeObjects = function(obj1, obj2)
{
	return rawMergeObjects(obj1, obj2);
};

exports.checkDir = function(path)
{
	return rawCheckDir(path);
};

exports.checkMakeDir = function(path)
{
	return rawCheckMakeDir(path);
};

/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * End:
 * vim600: noexpandtab sw=4 ts=4 fdm=marker
 * vim<600: noexpandtab sw=4 ts=4
 */
