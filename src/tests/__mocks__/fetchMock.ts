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
 * CREATE:   Thu Feb 15 2018
 * REVISION:
 *
 */

import { r3ParseUrl, r3ArrayHasValue, r3CompareString, r3IsEmptyString, r3IsEmptyEntity } from '../../src/util/r3util';

//
// Return promise object for error
//
const fetchError = (message) =>
{
	return new Promise((resolve, reject) =>
	{
		reject(new Error('Error occurred in fetch mock function : ' + message));
	});
};

//
// Return promise object for success
//
const fetchSuccess = (object) =>
{
	return new Promise((resolve, reject) =>						// eslint-disable-line no-unused-vars
	{
		resolve({
			ok:			true,
			status:		200,
			json:		() => { return object; }
		});
	});
};

//
// mock for fetch function
//
global.fetch = jest.fn().mockImplementation((url, option) =>	// eslint-disable-line no-undef
{
	//
	// Check option
	//
	if(r3IsEmptyEntity(option)){
		return fetchError('option is wrong object or empty');
	}
	if(r3IsEmptyString(option.method)){
		return fetchError('option.method is empty');
	}
	if(r3IsEmptyEntity(option.headers)){
		return fetchError('option is wrong object or empty');
	}

	//
	// Check and parse url
	//
	let	path		= '/';
	let	parsedUrl	= r3ParseUrl(url);
	if(!r3ArrayHasValue(parsedUrl, 'path')){
		path		= parsedUrl.path;
	}

	if(r3CompareString(path, '/v1/user/tokens')){
		//
		// User Token
		//
		//console.info('DEBUG Request => url: ' + JSON.stringify(url) + ', parsedUrl: ' + JSON.stringify(parsedUrl) + ', path: ' + JSON.stringify(path) + ', option: ' + JSON.stringify(option));

		if(r3IsEmptyString(option.headers['x-auth-token'])){
			return fetchError('Not found x-auth-token in option.headers');
		}else if(r3CompareString(option.headers['x-auth-token'], 'U=UnscopedUserToken_ForTestByJEST')){	// unscoped token, see package.json
			return fetchSuccess({
				result:		true,
				message:	'succeed',
				scoped:		false,
				user:		'test',
				tenants:	[
					{name: '10000', id: '1000-000', display: 'GROUP0:TENANT0', description: 'GROUP0:DESC TENANT0'},
					{name: '20000', id: '2000-000', display: 'GROUP1:TENANT1', description: 'GROUP0:DESC TENANT1'},
					{name: 'local@3000', id: '3000-000', display: 'GROUP1:LOCAL1', description: 'GROUP0:DESC LOCAL1'}
				]
			});
		}else{
			return fetchError('Unknown Token(' + option.headers['x-auth-token'] + ')');
		}

	}else if(r3CompareString(path, '/v1/tenant?expand=true')){
		//
		// Get Tenant List
		//
		return fetchSuccess({
			result:		true,
			message:	null,
			tenants:	[
				{name: '10000', id: '1000-000', display: 'GROUP0:TENANT0', description: 'GROUP0:DESC TENANT0', users: [ 'test' ]},
				{name: '20000', id: '2000-000', display: 'GROUP1:TENANT1', description: 'GROUP0:DESC TENANT1', users: [ 'test' ]},
				{name: 'local@3000', id: '3000-000', display: 'GROUP1:LOCAL1', description: 'GROUP0:DESC LOCAL1', users: [ 'test' ]}
			]
		});
	}else{
		console.info('UNKOWN Request => url: ' + JSON.stringify(url) + ', parsedUrl: ' + JSON.stringify(parsedUrl) + ', path : ' + JSON.stringify(path) + ', option: ' + JSON.stringify(option));
		return fetchError('Unknown path(' + path + ')');
	}
});

/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * End:
 * vim600: noexpandtab sw=4 ts=4 fdm=marker
 * vim<600: noexpandtab sw=4 ts=4
 */
