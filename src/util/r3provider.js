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
 * CREATE:   Tue Sep 5 2017
 * REVISION:
 *
 */

import R3Context			from '../util/r3context';
import { r3GetTextRes }		from '../util/r3define';
import { resourceType, roleType, policyType, serviceType }	from '../util/r3types';
import { checkServiceResourceValue }						from '../util/r3verifyutil';
import { r3ObjMerge, parseCombineHostObject, r3IsEmptyEntity, r3IsEmptyEntityObject, r3IsEmptyStringObject, r3IsSafeTypedEntity, r3IsEmptyString, r3CompareCaseString } from '../util/r3util';

//
// K2HR3 Data Provider Class
//
export default class R3Provider
{
	constructor(cbProgressControl, signin, username, unscopedtoken)
	{
		this.tokenHeaderType = {
			noUserToken:		-1,
			unscopedUserToken:	-2
		};
		this.r3Context			= new R3Context(signin, username, unscopedtoken);

		// caches
		//
		// [TODO]
		// Need to implement timeout
		//
		this.scopedUserToken	= {};							// Scoped User Tokens - Key is Tenant name
		this.tenantList			= [];							// Tenant name list(element is object = {name: "tenant name", display: "display name"})
		this.cbProgressControl	= cbProgressControl;			// Callback function for progress(allow null)

		// text resource
		this.r3TextRes			= r3GetTextRes(this.r3Context.getSafeLang());
	}

	getR3Context()
	{
		return this.r3Context;
	}

	getR3TextRes()
	{
		return this.r3TextRes;
	}

	startProgress()
	{
		if(null !== this.cbProgressControl){
			this.cbProgressControl(true);
		}
	}

	stopProgress()
	{
		if(null !== this.cbProgressControl){
			this.cbProgressControl(false);
		}
	}

	//--------------------------------------------------
	// FETCH
	//--------------------------------------------------
	// raw methods
	//
	_fetch(path, method, headers, tokenType, body, isCvtBodyJSON, callback)
	{
		if(!r3IsSafeTypedEntity(callback, 'function')){
			console.error('callback parameter is wrong.');
			return;
		}
		let	_callback	= callback;
		let	_path		= r3IsEmptyString(path) ? '/' : encodeURI(path).replace(/#/g, '%23');// force replace '#'
		let	_url		= this.r3Context.getApiUrlBase() + _path;
		let	_method		= r3IsEmptyString(method) ? 'GET' : method;							// default is GET

		let	_length		= 0;
		let	_strBody;
		if(!r3IsEmptyEntity(body)){
			if(!r3IsSafeTypedEntity(isCvtBodyJSON, 'boolean') || !isCvtBodyJSON){
				_strBody = body;
			}else{
				_strBody = JSON.stringify(body);
			}
			_length = _strBody.length;
		}

		/* eslint-disable indent, no-mixed-spaces-and-tabs */
		let	_headers	= r3IsEmptyEntity(headers) ? {} : headers;
		_headers		= r3ObjMerge(_headers,
		{
			'Content-Type':		'application/json',
			'Content-Length':	_length,
		});
		this.r3Context.getDbgHeader(_headers);												// Add debug header if development environment
		/* eslint-enable indent, no-mixed-spaces-and-tabs */

		// get token
		this.getUserTokenByType(tokenType, (error, token) =>
		{
			if(null !== error){
				console.error(error.message);
				_callback(error, null);
				return;
			}
			if(r3IsSafeTypedEntity(token, 'string')){
				_headers['x-auth-token'] = 'U=' + token;
			}

			let	_fetchOpt	= {
				mode:				'cors',
				method:				_method,
				headers: 			_headers
			};
			if(undefined !== _strBody && null !== _strBody){
				_fetchOpt.body = _strBody;
			}

			this.startProgress();															// start progressing

			// Send request
			fetch(_url, _fetchOpt).then(response => {
				if(!response.ok){
					let	dbgresheader= this.r3Context.getSafeDbgResHeaderName();
					let	errorinfo	= '';
					if('' !== dbgresheader && response.headers.has(dbgresheader)){
						errorinfo = response.headers.get(dbgresheader);
						if(null === errorinfo){
							errorinfo = '';
						}
					}
					let	_errobj		= new Error('REQUEST = ' + decodeURI(_path) + ', STATUS = ' + response.statusText + '(' + String(response.status) + '), ERROR HEADER = ' + errorinfo);
					_errobj.status	= response.status;

					// [NOTE]
					// Do not call stopProgress() here, it is called after throwing exception.
					//
					throw _errobj;
				}
				if(204 === response.status){
					// 204 does not have response body, thus make resobj here.
					return { result: true, message: null };
				}
				return response.json();

			}).then(resobj => {
				this.stopProgress();														// stop progressing

				if(r3IsEmptyEntity(resobj) || (r3IsSafeTypedEntity(resobj.result, 'boolean') && true !== resobj.result)){
					throw new Error('REQUEST = ' + decodeURI(_path) + ', ERROR = Response is sonmething wrong or false: ' + JSON.stringify(resobj));
				}
				_callback(null, resobj);
				return;

			}).catch(error => {
				this.stopProgress();														// stop progressing

				if(r3IsEmptyEntity(error)){
					error			= new Error('K2HR3 API ERROR => Unknown reason.');
					error.status	= 500;
				}else{
					error.message	= 'K2HR3 API ERROR => ' + error.message;
					if(undefined === error.status || null === error.status){
						error.status= 500;
					}
				}
				console.error(error.message);
				_callback(error, null);
				return;
			});
		});
	}

	//
	// GET raw method
	//
	_get(path, urlargs, headers, tokenType, callback)
	{
		if(!r3IsEmptyString(path) && !r3IsEmptyString(urlargs)){
			path += '?' + urlargs;
		}
		return this._fetch(path, 'GET', headers, tokenType, null, false, callback);
	}

	//
	// HEAD raw method
	//
	_head(path, urlargs, headers, tokenType, callback)
	{
		if(!r3IsEmptyString(path) && !r3IsEmptyString(urlargs)){
			path += '?' + urlargs;
		}
		return this._fetch(path, 'HEAD', headers, tokenType, null, false, callback);
	}

	//
	// PUT raw method
	//
	_put(path, urlargs, headers, tokenType, callback)
	{
		if(!r3IsEmptyString(path) && !r3IsEmptyString(urlargs)){
			path += '?' + urlargs;
		}
		return this._fetch(path, 'PUT', headers, tokenType, null, false, callback);
	}

	//
	// POST raw method
	//
	_post(path, headers, tokenType, body, isCvtBodyJSON, callback)
	{
		return this._fetch(path, 'POST', headers, tokenType, body, isCvtBodyJSON, callback);
	}

	//
	// DELETE raw method
	//
	_delete(path, urlargs, headers, tokenType, callback)
	{
		if(!r3IsEmptyString(path) && !r3IsEmptyString(urlargs)){
			path += '?' + urlargs;
		}
		return this._fetch(path, 'DELETE', headers, tokenType, null, false, callback);
	}

	//--------------------------------------------------
	// TOKEN
	//--------------------------------------------------
	//
	// raw get Unscoped User token
	//
	getUnscopedUserToken(username, passphrase, callback)
	{
		if(!r3IsSafeTypedEntity(callback, 'function')){
			console.error('callback parameter is wrong.');
			return;
		}
		let	error;
		if(r3IsEmptyString(username, true)){
			error = new Error('username parameter is empty');
			console.error(error.message);
			callback(error, null);
			return;
		}
		let	_callback	= callback;
		let	_username	= username;
		let	_passphrase	= r3IsEmptyString(passphrase, true) ? null : passphrase.trim();		// allow empty passphrase
		let _body		= {
			'auth': {
				'tenantName': '',
				'passwordCredentials': {
					'username':	_username,
					'password':	_passphrase
				}
			}
		};

		this.startProgress();																// start progressing

		this._post('/v1/user/tokens', null, this.tokenHeaderType.noUserToken, _body, true, (error, resobj) =>
		{
			this.stopProgress();															// stop progressing

			if(null !== error){
				console.error(error.message);
				_callback(error, null);
				return;
			}
			if(!resobj.result){
				let	error = new Error('No result object.');
				console.error(error.message);
				_callback(error, null);
				return;
			}
			if(true !== resobj.result || false !== resobj.scoped){
				error = new Error('Response data is sonmething wrong: ' + JSON.stringify(resobj));
				console.error(error.message);
				_callback(error, null);
				return;
			}
			_callback(null, resobj.token);
		});
	}

	//
	// raw get Scoped User token
	//
	getScopedUserToken(tenantname, callback)
	{
		if(!r3IsSafeTypedEntity(callback, 'function')){
			console.error('callback parameter is wrong.');
			return;
		}
		let	error;
		if(r3IsEmptyString(tenantname)){
			error = new Error('tenantname parameter is wrong.');
			console.error(error.message);
			callback(error, null);
			return;
		}

		if(!r3IsEmptyStringObject(this.scopedUserToken, tenantname)){
			callback(null, this.scopedUserToken[tenantname]);
			return;
		}
		let	_callback	= callback;
		let	_tenantname	= tenantname;
		let _body		= {
			'auth': {
				'tenantName': _tenantname
			}
		};

		this.startProgress();																// start progressing

		this._post('/v1/user/tokens', null, this.tokenHeaderType.unscopedUserToken, _body, true, (error, resobj) =>
		{
			this.stopProgress();															// stop progressing

			if(null !== error){
				console.error(error.message);
				_callback(error, null);
				return;
			}
			if(!resobj.result){
				let	error = new Error('No result object.');
				console.error(error.message);
				_callback(error, null);
				return;
			}
			if(true !== resobj.result || true !== resobj.scoped){
				error = new Error('Response data is sonmething wrong: ' + JSON.stringify(resobj));
				console.error(error.message);
				_callback(error, null);
				return;
			}
			this.scopedUserToken[_tenantname] = resobj.token;
			_callback(null, resobj.token);
		});
	}

	//
	// raw get Token( No token / Scoped / Unscoped ) method
	//
	// tokenType is number or string as tenant name.
	// If it is number, it means no token(tokenHeaderType.noUserToken) or
	// unscoped token(tokenHeaderType.unscopedUserToken).
	// If string, it means tenant name. then this method sets scoped token
	// to headers object.
	//
	// [NOTE]
	// If there is no scoped token, this method calls API for getting scoped
	// token for tenant.
	//
	getUserTokenByType(tokenType, callback)
	{
		if(!r3IsSafeTypedEntity(callback, 'function')){
			console.error('callback parameter is wrong.');
			return;
		}

		let	error;
		if(r3IsEmptyEntity(tokenType)){
			error = new Error('tokenType parameter is wrong.');
			console.error(error.message);
			callback(error, null);

		}else{
			if(!isNaN(tokenType) && this.tokenHeaderType.noUserToken === tokenType){
				// no token
				callback(null, null);

			}else if(!isNaN(tokenType) && this.tokenHeaderType.unscopedUserToken === tokenType){
				// unscoped token
				callback(null, this.r3Context.getSafeUnscopedToken());

			}else if(!isNaN(tokenType) || !r3IsEmptyString(tokenType)){
				if(!isNaN(tokenType)){
					// force string
					tokenType = String(tokenType);
				}
				let	_callback = callback;

				this.startProgress();														// start progressing

				// scoped token
				this.getScopedUserToken(tokenType, (error, token) =>
				{
					this.stopProgress();													// stop progressing

					if(null !== error){
						console.error(error.message);
						_callback(error, null);
						return;
					}
					_callback(null, token);
				});
			}else{
				error = new Error('tokenType is not number nor string.');
				console.error(error.message);
				callback(error, null);
			}
		}
	}

	//--------------------------------------------------
	// Tenant List
	//--------------------------------------------------
	//
	// Get tenant list
	//
	getTenantList(callback)
	{
		if(!r3IsSafeTypedEntity(callback, 'function')){
			console.error('callback parameter is wrong.');
			return;
		}
		let	_callback	= callback;

		if(0 < this.tenantList.length){
			// using cache
			_callback(null, this.tenantList);
			return;
		}

		if(!this.r3Context.isLogin()){
			console.info('Not logged in yet.');
			// return empty cache
			_callback(null, this.tenantList);
			return;
		}

		this.startProgress();																// start progressing

		this._get('/v1/user/tokens', null, null, this.tokenHeaderType.unscopedUserToken, (error, resobj) =>
		{
			this.stopProgress();															// stop progressing

			if(null !== error){
				if(undefined !== error.status && 404 == error.status){
					console.error('Could not get tenat list with response status is 404, thus return empty tenant list : ' + error.message);
					this.tenantList = [];
					_callback(null, this.tenantList);
				}else{
					console.error(error.message);
					_callback(error, null);
				}
				return;
			}
			if(true !== resobj.result || false !== resobj.scoped || this.r3Context.getSafeUserName() !== resobj.user){
				error = new Error('Response data is sonmething wrong: ' + JSON.stringify(resobj));
				console.error(error.message);
				_callback(error, null);
				return;
			}
			if(!r3IsSafeTypedEntity(resobj.tenants, 'array')){
				this.tenantList = [];
			}else{
				this.tenantList = resobj.tenants;
				this.tenantList.sort( (tenant1, tenant2) =>
				{
					if(!r3IsEmptyString(tenant1.display) && !r3IsEmptyString(tenant2.display)){
						return 0;
					}
					if(tenant1.display < tenant2.display){
						return -1;
					}else if(tenant1.display > tenant2.display){
						return 1;
					}
					return 0;
				});
			}
			_callback(null, this.tenantList);
		});
	}

	//--------------------------------------------------
	// TREE LIST( Role / Resource / Policy Tree List )
	//--------------------------------------------------
	//
	// Common raw method : Get tree in tenant
	//
	rawGetTreeList(tenant, service, type, path, expand, callback)
	{
		if(!r3IsSafeTypedEntity(callback, 'function')){
			console.error('callback parameter is wrong.');
			return;
		}
		let	error;
		if(	r3IsEmptyStringObject(tenant, 'name') ||
			(resourceType !== type && roleType !== type && policyType !== type && serviceType !== type) )
		{
			error = new Error('type(' + JSON.stringify(type) + ') or tenant(' + JSON.stringify(tenant) + ') parameters are wrong.');
			console.error(error.message);
			callback(error, null);
			return;
		}
		if(r3IsEmptyString(service)){
			service		= null;
		}

		let	_callback	= callback;
		let	_tenant		= tenant.name;
		let	_path		= path;
		let	_url		= '/v1/list/';
		if(null !== service){
			_url		+= service + '/';
		}
		_url			+= type;
		if(!r3IsEmptyString(path)){
			_url		+= '/' + path;
		}
		let	_urlargs	= undefined;
		if(r3IsSafeTypedEntity(expand, 'boolean')){
			_urlargs	= 'expand=' + (expand ? 'true' : 'false');
		}

		this.startProgress();																// start progressing

		this._get(_url, _urlargs, null, _tenant, (error, resobj) =>
		{
			this.stopProgress();															// stop progressing

			if(null !== error){
				console.error(error.message);
				_callback(error, null);
				return;
			}
			if(true !== resobj.result){
				error = new Error(resobj.message);
				console.error(error.message);
				_callback(error, null);
				return;
			}
			if(!r3IsSafeTypedEntity(resobj.children, 'array')){
				_callback(null, this.rawCvtTreeListForContainer([], _path));
			}else{
				_callback(null, this.rawCvtTreeListForContainer(resobj.children, _path));
			}
		});
	}

	//
	// Common raw method : convert tree list for container's data
	//
	rawCvtTreeListForContainer(treeList, parentPath)
	{
		if(!r3IsSafeTypedEntity(treeList, 'array')){
			treeList = [];
		}
		let	separator = '';
		if(r3IsEmptyString(parentPath)){
			parentPath = '';
		}else{
			separator = '/';
		}
		for(let cnt = 0; cnt < treeList.length; ++cnt){
			treeList[cnt].path = parentPath + separator + treeList[cnt].name;

			// reentrant
			if(!r3IsSafeTypedEntity(treeList[cnt].children, 'array')){
				treeList[cnt].children = [];
			}
			treeList[cnt].children = this.rawCvtTreeListForContainer(treeList[cnt].children, treeList[cnt].path);
		}
		return treeList;
	}

	//
	// Get tree in tenant
	//
	getRoleTreeList(tenant, service, path, expand, callback)
	{
		this.rawGetTreeList(tenant, service, roleType, path, expand, callback);
	}

	getResourceTreeList(tenant, service, path, expand, callback)
	{
		this.rawGetTreeList(tenant, service, resourceType, path, expand, callback);
	}

	getPolicyTreeList(tenant, service, path, expand, callback)
	{
		this.rawGetTreeList(tenant, service, policyType, path, expand, callback);
	}

	getServiceTreeList(tenant, expand, callback)
	{
		var	_tenant		= tenant;
		var	_expand		= expand;
		var	_callback	= callback;

		this.startProgress();																// start progressing

		//
		// Get service list for tenant
		//
		this.rawGetTreeList(_tenant, null, serviceType, null, false, (error, serviceChildren) =>
		{
			if(null !== error){
				console.error('Could not get SERVICE Tree list by ' + error.message);

				this.stopProgress();														// stop progressing
				_callback(error, null);
				return;
			}
			if(!r3IsSafeTypedEntity(serviceChildren, 'array')){
				console.info('SERVICE Tree list is something wrong.');

				this.stopProgress();														// stop progressing
				_callback(null, []);
				return;
			}


			//
			// Check each service for distributed
			//
			if(0 < serviceChildren.length){
				var	_tenant2		= _tenant;
				var	_expand2		= _expand;
				var	_callback2		= _callback;
				var	_serviceChildren= serviceChildren;

				for(var cnt = 0; cnt < _serviceChildren.length; ++cnt){
					((pos) =>
					{
						if(r3IsEmptyStringObject(_serviceChildren[pos], 'name')){
							return;
						}
						var	_pos				= pos;
						var	_callback3			= _callback2;
						var	_serviceChildren2	= _serviceChildren;

						this.rawGetTreeListInServiceTenant(_tenant2, _serviceChildren[pos].name, _expand2, (children, disributed) =>
						{
							_serviceChildren2[_pos].children	= children;
							_serviceChildren2[_pos].distributed	= disributed;

							if((_pos + 1) == _serviceChildren2.length){
								this.stopProgress();										// stop progressing
								_callback3(null, _serviceChildren2);
							}
						});
					})(cnt);
				}
			}else{
				this.stopProgress();														// stop progressing
				_callback(null, serviceChildren);
			}
		});
	}

	rawGetTreeListInServiceTenant(tenant, servicename, expand, callback)
	{
		var	_tenant		= tenant;
		var	_servicename= servicename;
		var	_expand		= expand;
		var	_children	= [];
		var	_callback	= callback;
		var	_distributed= false;

		if(r3IsEmptyEntity(_tenant) || r3IsEmptyString(_servicename)){
			_callback(_children, _distributed);
			return;
		}

		this.startProgress();																// start progressing

		//
		// Check role under service+tenant(If it is distributed, the service+tenant is existed)
		//
		this.getRoleTreeList(_tenant, _servicename, null, _expand, (error, roleChildren) =>
		{
			if(null !== error){
				console.info('Could not get ROLE Tree list in SERVICE+TENANT by ' + error.message);
			}

			//
			// Set distributed flag for service
			//
			if(null !== error || !r3IsSafeTypedEntity(roleChildren, 'array') || 0 === roleChildren.length){
				_distributed = false;
			}else{
				// Role under service+tenant is existed(distributed).
				_distributed = true;
			}
			if(!_expand || !_distributed){
				// Not expand or not distributed
				this.stopProgress();														// stop progressing
				_callback(_children, _distributed);
				return;
			}

			_children = this.getEmptyTreeList(false);

			//
			// Set role under service+tenant
			//
			this.rawSetTreeListChildren(_children, roleType, roleChildren);

			//
			// Get resource under service+tenant
			//
			this.getResourceTreeList(_tenant, _servicename, null, _expand, (error, resourceChildren) =>
			{
				if(null !== error || r3IsEmptyEntity(resourceChildren)){
					console.info('Could not get RESOURCE Tree list in SERVICE+TENANT by ' + (null !== error ? error.message : ''));
				}else{
					this.rawSetTreeListChildren(_children, resourceType, resourceChildren);
				}

				//
				// Get policy under service+tenant
				//
				this.getPolicyTreeList(_tenant, _servicename, null, _expand, (error, policyChildren) =>
				{
					if(null !== error || r3IsEmptyEntity(policyChildren)){
						console.info('Could not get POLICY Tree list in SERVICE+TENANT by ' + (null !== error ? error.message : ''));
					}else{
						this.rawSetTreeListChildren(_children, policyType, policyChildren);
					}
					this.stopProgress();														// stop progressing

					_callback(_children, _distributed);
				});
			});
		});
	}

	//
	// Get All Tree List for tenant
	//
	// array:	[
	//				{
	//					name:		"SERVICE"
	//					path:		"service:",
	//					children: [
	//						{
	//							name:		"path",
	//							path:		"full path",
	//							owner:		true,
	//							distributed:true/false,					=> the flag for this service is distributed under service+tenant
	//							children:	[							=> If service is distributed, this array has ROLE/RESOURCE/POLICY data for service+tenant
	//								{
	//									name:	"ROLE",
	//									...
	//								},
	//								{
	//									name:	"RESOURCE",
	//									...
	//								},
	//								{
	//									name:	"POLICY",
	//									...
	//								}
	//							]
	//						},
	//						...
	//					]
	//				},
	//				{
	//					name:		"ROLE"
	//					path:		"role:",
	//					children: [
	//						{
	//							name:		"path",
	//							path:		"full path",
	//							children: [
	//										...
	//							]
	//						},
	//						...
	//					]
	//				},
	//				{
	//					name:		"RESOURCE"
	//					path:		"resource:",
	//					children: [
	//						...
	//					]
	//				},
	//				{
	//					name:		"POLICY"
	//					path:		"policy:",
	//					children: [
	//						...
	//					]
	//				},
	//			]
	//
	// [NOTE]
	// This method always does not return error.
	//
	getAllTreeList(tenant, callback)
	{
		let	_tenant		= tenant;
		let	_callback	= callback;
		let	_all		= this.getEmptyTreeList(true);

		if(r3IsEmptyStringObject(tenant, 'name')){
			_callback(null, _all);
			return;
		}

		this.startProgress();																// start progressing

		this.getServiceTreeList(_tenant, true, (error, serviceChildren) =>
		{
			if(null !== error){
				console.error('Could not get SERVICE Tree list by ' + error.message);
			}else{
				this.rawSetTreeListChildren(_all, serviceType, serviceChildren);
			}

			this.getRoleTreeList(_tenant, null, null, true, (error, roleChildren) =>
			{
				if(null !== error){
					console.error('Could not get ROLE Tree list by ' + error.message);
				}else{
					this.rawSetTreeListChildren(_all, roleType, roleChildren);
				}

				this.getResourceTreeList(_tenant, null, null, true, (error, resourceChildren) =>
				{
					if(null !== error){
						console.error('Could not get RESOURCE Tree list by ' + error.message);
					}else{
						this.rawSetTreeListChildren(_all, resourceType, resourceChildren);
					}

					this.getPolicyTreeList(_tenant, null, null, true, (error, policyChildren) =>
					{
						if(null !== error){
							console.error('Could not get POLICY Tree list by ' + error.message);
						}else{
							this.rawSetTreeListChildren(_all, policyType, policyChildren);
						}
						this.stopProgress();												// stop progressing

						_callback(null, _all);
					});
				});
			});
		});
	}

	rawSetTreeListChildren(allTreeList, path, children)
	{
		if(!r3IsSafeTypedEntity(allTreeList, 'array')){
			return false;
		}
		for(let cnt = 0; cnt < allTreeList.length; ++cnt){
			if(allTreeList[cnt].path === path){
				allTreeList[cnt].children = children;
				return true;
			}
		}
		return false;
	}

	getEmptyTreeList(is_service)
	{
		let	treelist = [];

		if(r3IsSafeTypedEntity(is_service, 'boolean') && is_service){
			treelist.push({
				name:		serviceType.toUpperCase(),
				path:		serviceType,
				children:	[]
			});
		}

		treelist.push({
			name:		roleType.toUpperCase(),
			path:		roleType,
			children:	[]
		});

		treelist.push({
			name:		resourceType.toUpperCase(),
			path:		resourceType,
			children:	[]
		});

		treelist.push({
			name:		policyType.toUpperCase(),
			path:		policyType,
			children:	[]
		});
		return treelist;
	}

	//
	// Select pattern(see: r3container.jsx)
	//
	// [type]				[service]		[path]		[selected item]
	// ROLE/POLICY/RESOURCE	empty			empty/path	ROLE/POLICY/RESOURCE top or path under it
	// ROLE/POLICY/RESOURCE	service name	empty		"SERVICE > service name > ROLE/POLICY/RESOURCE"
	// ROLE/POLICY/RESOURCE	service name	path		"SERVICE > service name > ROLE/POLICY/RESOURCE > path"
	// SERVICE				empty			empty		SERVICE top
	// SERVICE				service name	empty		"SERVICE > service name"
	//
	selectTreeList(treeList, service, type, path)
	{
		if(!r3IsSafeTypedEntity(treeList, 'array') || 0 === treeList.length){
			return false;
		}
		if(r3IsEmptyString(type, true)){
			return false;
		}

		let	cnt;
		let	cnt2;
		if(r3CompareCaseString(serviceType, type)){
			//
			// This case is under SERVICE
			//
			if(!r3IsEmptyString(path, true)){
				console.error('Wrong parameter: type is SERVICE but specified path(' + path + ')');
				return false;
			}

			// search 'SERVICE' top
			for(cnt = 0; cnt < treeList.length; ++cnt){
				if(r3IsEmptyStringObject(treeList[cnt], 'path') || !r3CompareCaseString(serviceType, treeList[cnt].path)){
					continue;									// not target tree
				}
				// found 'path' == 'service'

				// case : select "SERVICE" top
				if(r3IsEmptyString(service, true)){
					treeList[cnt].selected	= true;
					return true;								// finish
				}

				// search 'service name' top in children
				if(!r3IsSafeTypedEntity(treeList[cnt].children, 'array') || 0 === treeList[cnt].children.length){
					continue;									// SERVICE does not have children
				}
				for(cnt2 = 0; cnt2 < treeList[cnt].children.length; ++cnt2){
					if(!r3IsEmptyStringObject(treeList[cnt].children[cnt2], 'path') && r3CompareCaseString(service, treeList[cnt].children[cnt2].path)){
						// found 'path' == 'service name'
						treeList[cnt].children[cnt2].selected	= true;
						return true;							// finish
					}
				}
			}

		}else if(r3CompareCaseString(roleType, type) || r3CompareCaseString(policyType, type) || r3CompareCaseString(resourceType, type)){
			//
			// Case : selected item under ROLE/POLICY/RESOURCE
			//
			let	fullPath = type;								// target path is 'ROLE or POLICY or RESOURCE' or 'ROLE or POLICY or RESOURCE'/path...
			if(!r3IsEmptyString(path, true)){
				fullPath += '/' + path.trim();
			}

			if(!r3IsEmptyString(service, true)){
				//
				// The case is under SERVICE
				//
				// search 'SERVICE' top
				for(cnt = 0; cnt < treeList.length; ++cnt){
					if(r3IsEmptyStringObject(treeList[cnt], 'path') || !r3CompareCaseString(serviceType, treeList[cnt].path)){
						continue;								// not target tree
					}
					// found 'path' == 'service'

					// search 'service name' top in children
					if(!r3IsSafeTypedEntity(treeList[cnt].children, 'array') || 0 === treeList[cnt].children.length){
						continue;								// SERVICE does not have children
					}
					for(cnt2 = 0; cnt2 < treeList[cnt].children.length; ++cnt2){
						if(!r3IsEmptyStringObject(treeList[cnt].children[cnt2], 'path') && r3CompareCaseString(service, treeList[cnt].children[cnt2].path)){
							// found 'path' == 'service name'
							return this.selectSubTreeList(treeList[cnt].children[cnt2].children, fullPath);
						}
					}
				}
			}else{
				//
				// The case is not under SERVICE
				//
				return this.selectSubTreeList(treeList, fullPath);
			}
		}else{
			console.error('Wrong parameter: unknown type(' + JSON.stringify(type) + ')');
		}
		return false;											// not found
	}

	selectSubTreeList(subTreeList, path)
	{
		if(!r3IsSafeTypedEntity(subTreeList, 'array') || 0 === subTreeList.length){
			return false;
		}
		if(r3IsEmptyString(path, true)){
			return false;
		}

		let	pos			= path.indexOf('/');
		let	curPath		= path;
		let	childPath	= null;
		if(0 === pos){
			return false;
		}else if(0 < pos){
			curPath		= path.substr(0, pos);
			childPath	= path.substr(pos + 1);
		}

		// search current path top
		for(let cnt = 0; cnt < subTreeList.length; ++cnt){
			if(!r3IsEmptyStringObject(subTreeList[cnt], 'name') && r3CompareCaseString(curPath, subTreeList[cnt].name)){
				// found 'name' == current path
				if(r3IsEmptyString(childPath, true)){
					subTreeList[cnt].selected	= true;
					return true;									// finish
				}

				// search child path under current path in children
				if(!r3IsSafeTypedEntity(subTreeList[cnt].children, 'array') || 0 === subTreeList[cnt].children.length){
					continue;										// current path does not have children
				}
				// reentrant
				return this.selectSubTreeList(subTreeList[cnt].children, childPath);
			}
		}
		return false;
	}

	//
	// Check service owner
	//
	checkServiceOwnerInTreeList(treeList, service)
	{
		if(!r3IsSafeTypedEntity(treeList, 'array') || 0 === treeList.length || r3IsEmptyString(service, true)){
			return false;
		}
		let	_service = service.trim();

		// search 'SERVICE' top
		for(let cnt = 0; cnt < treeList.length; ++cnt){
			if(r3IsEmptyStringObject(treeList[cnt], 'path') || !r3CompareCaseString(serviceType, treeList[cnt].path)){
				continue;									// not target tree
			}
			// search 'service name' top in children
			if(!r3IsSafeTypedEntity(treeList[cnt].children, 'array') || 0 === treeList[cnt].children.length){
				continue;									// SERVICE does not have children
			}
			for(let cnt2 = 0; cnt2 < treeList[cnt].children.length; ++cnt2){
				if(!r3IsEmptyStringObject(treeList[cnt].children[cnt2], 'path') && r3CompareCaseString(_service, treeList[cnt].children[cnt2].path)){
					// found 'path' == 'service name'
					if(r3IsSafeTypedEntity(treeList[cnt].children[cnt2].owner, 'boolean') && true === treeList[cnt].children[cnt2].owner){
						// service owner is tenant
						return true;
					}
				}
			}
		}
		return false;
	}

	//
	// Check service tenant type
	//
	checkServiceTenantInTreeList(treeList, service)
	{
		if(!r3IsSafeTypedEntity(treeList, 'array') || 0 === treeList.length || r3IsEmptyString(service, true)){
			return false;
		}
		let	_service = service.trim();

		// search 'SERVICE' top
		for(let cnt = 0; cnt < treeList.length; ++cnt){
			if(r3IsEmptyStringObject(treeList[cnt], 'path') || !r3CompareCaseString(serviceType, treeList[cnt].path)){
				continue;									// not target tree
			}
			// search 'service name' top in children
			if(!r3IsSafeTypedEntity(treeList[cnt].children, 'array') || 0 === treeList[cnt].children.length){
				continue;									// SERVICE does not have children
			}
			for(let cnt2 = 0; cnt2 < treeList[cnt].children.length; ++cnt2){
				if(!r3IsEmptyStringObject(treeList[cnt].children[cnt2], 'path') && r3CompareCaseString(_service, treeList[cnt].children[cnt2].path)){
					// found 'path' == 'service name'
					if(r3IsSafeTypedEntity(treeList[cnt].children[cnt2].children, 'array') && 0 < treeList[cnt].children[cnt2].children.length){
						// service has children, thus service is mapped service tenant.
						return true;
					}
				}
			}
		}
		return false;
	}

	//--------------------------------------------------
	// Get Detail information for path
	//--------------------------------------------------
	getPathDetailInfo(tenant, service, isServiceOwner, hasServiceTenant, type, path)
	{
		let	_tenant				= null;
		let	_service			= null;
		let	_serviceOwner		= false;
		let	_hasServiceTenant	= false;
		let	_type				= null;
		let	_name				= null;
		let	_fullpath			= null;
		let	_currentpath		= null;
		let	_hasParent			= false;
		let	_canCreatePath		= false;
		let	_canCreateService	= false;

		if(!r3IsEmptyStringObject(tenant, 'name')){
			_tenant		= tenant;

			if(serviceType === type || !r3IsEmptyString(service)){
				// [SELECTED TENANT] > SERVICE
				_type	= type;

				// under service
				if(r3IsEmptyString(service)){
					// [SELECTED TENANT] > SERVICE
					_fullpath			= 'yrn:yahoo::::service';
					_canCreateService	= true;

				}else if(resourceType === type || roleType === type || policyType === type){
					// [SELECTED TENANT] > SERVICE > service > ROLE/POLICY/RESOURCE
					_service			= service;
					_serviceOwner		= isServiceOwner;
					_fullpath			= 'yrn:yahoo:' + _service + '::' + _tenant.name + ':' + _type;
					_currentpath		= '';

					if(!r3IsEmptyString(path)){
						// [SELECTED TENANT] > SERVICE > service > ROLE/POLICY/RESOURCE > path
						let	splitedPath	= path.split('/');
						if(1 < splitedPath.length){
							_hasParent	= true;
						}
						_name			= splitedPath[splitedPath.length - 1];
						_fullpath		+= ':' + path;
						_currentpath	= path;
					}

				}else{
					// [SELECTED TENANT] > SERVICE > service
					_service			= service;
					_serviceOwner		= isServiceOwner;
					_hasServiceTenant	= hasServiceTenant;
					_fullpath			= 'yrn:yahoo::::service:' + _service;
				}

			}else if(resourceType === type || roleType === type || policyType === type){
				// [SELECTED TENANT] > ROLE/POLICY/RESOURCE
				_type			= type;
				_fullpath		= 'yrn:yahoo:::' + _tenant.name + ':' + _type;
				_currentpath	= '';

				if(r3IsEmptyString(path)){
					// [SELECTED TENANT] > ROLE/POLICY/RESOURCE
					_canCreatePath = true;
				}else{
					// [SELECTED TENANT] > ROLE/POLICY/RESOURCE > path
					let	splitedPath = path.split('/');
					if(1 < splitedPath.length){
						_hasParent	= true;
					}
					_name			= splitedPath[splitedPath.length - 1];
					_fullpath		+= ':';
					_fullpath		+= path;
					_currentpath	= path;

					if(resourceType === type || roleType === type){
						_canCreatePath = true;
					}
				}
			}else{
				// [SELECTED TENANT]
				_fullpath		= 'yrn:yahoo:';
				_fullpath		= 'yrn:yahoo:::' + _tenant.name;
				_currentpath	= '';
			}
		}
		return {
			tenant:				_tenant,
			service:			_service,
			serviceOwner:		_serviceOwner,
			hasServiceTenant:	_hasServiceTenant,
			type:				_type,
			name:				_name,
			fullpath:			_fullpath,
			currentpath:		_currentpath,
			hasParent:			_hasParent,
			canCreatePath:		_canCreatePath,
			canCreateService:	_canCreateService
		};
	}

	//--------------------------------------------------
	// Common
	//--------------------------------------------------
	createEmptyData(tenant, type, path, callback)
	{
		if(roleType === type){
			this.createEmptyRoleData(tenant, path, callback);
		}else if(policyType === type){
			this.createEmptyPolicyData(tenant, path, callback);
		}else if(resourceType === type){
			this.createEmptyResourceData(tenant, path, callback);
		}else{
			let	error = new Error('create empty data for unknown type(' + JSON.stringify(type) + ')');
			console.error(error.message);
			callback(error);
		}
	}

	removeData(tenant, type, path, callback)
	{
		if(roleType === type){
			this.removeRoleData(tenant, path, callback);
		}else if(policyType === type){
			this.removePolicyData(tenant, path, callback);
		}else if(resourceType === type){
			this.removeResourceData(tenant, path, callback);
		}else{
			let	error = new Error('remove data for unknown type(' + JSON.stringify(type) + ')');
			console.error(error.message);
			callback(error);
		}
	}

	updateData(tenant, type, path, data, callback)
	{
		if(roleType === type){
			this.updateRoleData(tenant, path, data, true, callback);

		}else if(policyType === type){
			this.updatePolicyData(tenant, path, data, callback);

		}else if(resourceType === type){
			this.updateResourceData(tenant, path, data, callback);

		}else{
			let	error = new Error('update data for unknown type(' + JSON.stringify(type) + ')');
			console.error(error.message);
			callback(error);
		}
	}

	//--------------------------------------------------
	// Service
	//--------------------------------------------------
	//
	// Get Service data
	//
	// tenant		: tenant name
	// servicename	: service name
	//
	getServiceData(tenant, servicename, callback)
	{
		if(!r3IsSafeTypedEntity(callback, 'function')){
			console.error('callback parameter is wrong.');
			return;
		}
		let	_callback	= callback;
		let	_error;
		if(r3IsEmptyStringObject(tenant, 'name') || r3IsEmptyString(servicename, true)){
			_error = new Error('tenant(' + JSON.stringify(tenant) + ') or service(' + JSON.stringify(servicename) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}
		let	_tenant		= tenant.name;
		let	_service	= servicename.trim();
		let	_url		= '/v1/service/' + _service;

		this.startProgress();																// start progressing

		this._get(_url, null, null, _tenant, (error, resobj) =>
		{
			this.stopProgress();															// stop progressing

			if(null !== error){
				console.error(error.message);
				_callback(error, null);
				return;
			}
			if(true !== resobj.result){
				error = new Error(resobj.message);
				console.error(error.message);
				_callback(error, null);
				return;
			}

			if(r3IsEmptyEntity(resobj.service)){
				_callback(null, null);
			}else{
				_callback(null, resobj.service);
			}
		});
	}

	//
	// Update Service data
	//
	// tenant		: tenant name
	// servicename	: service name
	// tenants		: adding tenant name(s), this value means following:
	//					undefined		do not set any new tenants
	//					null			do not set any new tenants(but if clear_tenant is true, remove all tenants without owner)
	//					string			set one new tenant(if clear_tenant is true, remove existing tenants without owner)
	//					array			set some new tenant(if clear_tenant is true, remove existing tenants without owner)
	// clear_tenant	: value is true, it means remove tenants without "tenants"
	// verify		: verify url/object, if undefined/null, verify is not update.
	//
	updateServiceData(tenant, servicename, tenants, clear_tenant, verify, callback)
	{
		if(!r3IsSafeTypedEntity(callback, 'function')){
			console.error('callback parameter is wrong.');
			return;
		}
		let	_error;
		let	_callback	= callback;

		if(r3IsEmptyStringObject(tenant, 'name') || r3IsEmptyString(servicename, true)){
			_error = new Error('tenant(' + JSON.stringify(tenant) + ') or service(' + JSON.stringify(servicename) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}
		let	_service	= servicename.trim();
		let	_tenants	= null;
		let	_is_clear	= false;
		let	_verify		= null;

		if(undefined !== tenants){
			if(r3IsSafeTypedEntity(clear_tenant, 'boolean') && true === clear_tenant){
				_is_clear = true;
			}
			if(r3IsSafeTypedEntity(tenants, 'array') && 0 < tenants.length){
				_tenants = tenants;
			}else if(!r3IsEmptyString(tenants)){
				_tenants = [tenants];
			}
		}
		if(!r3IsEmptyEntity(verify)){
			_verify = verify;
		}
		if(null === _tenants && false === _is_clear && null === _verify){
			_error = new Error('Nothing to update for service');
			console.error(_error.message);
			_callback(_error);
			return;
		}

		let	_tenant		= tenant.name;
		let	_url		= '/v1/service/' + _service;
		let	_urlargs	= undefined;
		if(r3IsSafeTypedEntity(_tenants, 'array') && 0 < _tenants.length){
			_urlargs	= 'tenant=' + JSON.stringify(_tenants);
		}
		if(_is_clear){
			if(undefined !== _urlargs){
				_urlargs += '&';
			}else{
				_urlargs = '';
			}
			_urlargs	+= 'clear_tenant=true';
		}
		if(null !== _verify){
			if(undefined !== _urlargs){
				_urlargs += '&';
			}else{
				_urlargs = '';
			}
			_urlargs	+= 'verify=' + JSON.stringify(_verify);
		}

		this.startProgress();																// start progressing

		this._put(_url, _urlargs, null, _tenant, (error, resobj) =>
		{
			this.stopProgress();															// stop progressing

			if(null !== error){
				console.error(error.message);
				_callback(error);
				return;
			}
			if(true !== resobj.result){
				error = new Error(resobj.message);
				console.error(error.message);
				_callback(error);
				return;
			}
			_callback(null);
		});
	}

	//
	// Create Initialized Service
	//
	// tenant		: tenant name
	// servicename	: service name
	// verify		: verify url or static resource data object
	//
	createInitializedService(tenant, servicename, verify, callback)
	{
		if(!r3IsSafeTypedEntity(callback, 'function')){
			console.error('callback parameter is wrong.');
			return;
		}
		let	_callback	= callback;
		let	_error;
		if(r3IsEmptyStringObject(tenant, 'name') || r3IsEmptyString(servicename, true) || r3IsEmptyEntity(verify) || (r3IsSafeTypedEntity(verify, 'string') && r3IsEmptyString(verify, true)) ){
			_error = new Error('tenant(' + JSON.stringify(tenant) + ') or service(' + JSON.stringify(servicename) + ') or verify(' + JSON.stringify(verify) + ') parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}
		let	_tenant		= tenant.name;
		let	_service	= servicename.trim();
		let	_verify		= verify.trim();
		let	_url		= '/v1/service';
		let	_urlargs	= 'name=' + _service + '&verify=' + JSON.stringify(_verify);

		this.startProgress();																// start progressing

		this._put(_url, _urlargs, null, _tenant, (error, resobj) =>
		{
			this.stopProgress();															// stop progressing

			if(null !== error){
				console.error(error.message);
				_callback(error);
				return;
			}
			if(true !== resobj.result){
				error = new Error(resobj.message);
				console.error(error.message);
				_callback(error);
				return;
			}
			_callback(null);
		});
	}

	//
	// Remove Service or Service tenant
	//
	// tenant		: tenant name
	// servicename	: service name
	//
	removeService(tenant, servicename, isServiceTenant, callback)
	{
		if(!r3IsSafeTypedEntity(callback, 'function')){
			console.error('callback parameter is wrong.');
			return;
		}
		let	_callback	= callback;
		let	_error;

		if(r3IsEmptyStringObject(tenant, 'name') || r3IsEmptyString(servicename, true)){
			_error = new Error('tenant(' + JSON.stringify(tenant) + ') or service(' + JSON.stringify(servicename) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}
		let	_tenant		= tenant.name;
		let	_service	= servicename.trim();
		let	_url		= '/v1/service/' + _service;
		let	_urlargs	= undefined;
		if(r3IsSafeTypedEntity(isServiceTenant, 'boolean') && true === isServiceTenant){
			_urlargs	= 'tenant=' + tenant.name;
		}

		this.startProgress();																// start progressing

		this._delete(_url, _urlargs, null, _tenant, (error, resobj) =>
		{
			this.stopProgress();															// stop progressing

			if(null !== error){
				console.error(error.message);
				_callback(error);
				return;
			}
			if(true !== resobj.result){
				error = new Error(resobj.message);
				console.error(error.message);
				_callback(error);
				return;
			}
			_callback(null);
		});
	}

	//
	// Utility: Get error string which is result of verifying service resource
	//
	getErrorServiceResourceVerify(serviceResource)
	{
		let	checkResult	= checkServiceResourceValue(serviceResource);
		let	result		= null;
		if(null != checkResult.error){
			if(r3IsEmptyStringObject(this.r3TextRes, checkResult.error)){
				result = this.r3TextRes.eUnknownErrorKey;
			}else{
				result = this.r3TextRes[checkResult.error];
			}
		}
		return result;
	}

	//--------------------------------------------------
	// ACR(Create SERVICE/TENANT)
	//--------------------------------------------------
	//
	// Create SERVICE/TENANT
	//
	// tenant		: tenant object
	// servicename	: service name
	// role			: default link alias role name(allowed empty)
	//
	createServiceTenant(tenant, servicename, role, callback)
	{
		if(!r3IsSafeTypedEntity(callback, 'function')){
			console.error('callback parameter is wrong.');
			return;
		}
		let	_role		= role;
		let	_callback	= callback;
		let	_error;
		if(r3IsEmptyStringObject(tenant, 'name') || r3IsEmptyString(servicename, true)){
			_error = new Error('tenant(' + JSON.stringify(tenant) + ') or service(' + JSON.stringify(servicename) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}
		let	_tenant		= tenant;
		let	_service	= servicename.trim();
		let	_url		= '/v1/acr/' + _service;

		this.startProgress();																// start progressing

		this._put(_url, null, null, _tenant.name, (error, resobj) =>
		{
			if(null !== error){
				console.error(error.message);

				this.stopProgress();														// stop progressing
				_callback(error);
				return;
			}
			if(true !== resobj.result){
				error = new Error(resobj.message);
				console.error(error.message);

				this.stopProgress();														// stop progressing
				_callback(error);
				return;
			}

			// check role name
			if(r3IsEmptyString(_role, true)){
				this.stopProgress();														// stop progressing
				_callback(null);
				return;
			}

			// set role alias
			this.setServiceTenantRoleAlias(_tenant, _service, _role.trim(), _callback);

			this.stopProgress();															// stop progressing
		});
	}

	//
	// Set SERVICE/TENANT's role into ROLE alias
	//
	// tenant		: tenant object
	// servicename	: service name
	// role			: role name
	//
	setServiceTenantRoleAlias(tenant, servicename, role, callback)
	{
		if(!r3IsSafeTypedEntity(callback, 'function')){
			console.error('callback parameter is wrong.');
			return;
		}
		let	_callback	= callback;
		let	_error;
		if(r3IsEmptyStringObject(tenant, 'name') || r3IsEmptyString(servicename, true) || r3IsEmptyString(role, true)){
			_error = new Error('tenant(' + JSON.stringify(tenant) + ') or service(' + JSON.stringify(servicename) + ') or role(' + JSON.stringify(role) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}

		//
		// get role data
		//
		let	_tenant		= tenant;
		let	_service	= servicename.trim();
		let	_role		= role.trim();

		this.startProgress();																// start progressing

		this.getRoleData(_tenant, null, _role, false, (error, roledata) =>
		{
			if(null !== error){
				console.error(error.message);

				this.stopProgress();														// stop progressing
				_callback(error);
				return;
			}
			if(null === roledata){
				error = new Error('Could not get role data for tenant(' + _tenant.name + '), path(' + _role + ')');
				console.error(error.message);

				this.stopProgress();														// stop progressing
				_callback(error);
				return;
			}

			//
			// SERVICE+TENANT ROLE path
			// ( yrn:yahoo:<service name>::<tenant name>:role:acr-role )
			//
			let	_service_tenant_role = 'yrn:yahoo:' + _service + '::' + _tenant.name + ':role:acr-role';

			// add alias to service
			for(let cnt = 0; cnt < roledata.aliases.length; ++cnt){
				if(r3CompareCaseString(roledata.aliases[cnt], _service_tenant_role)){
					// already has role in alias
					this.stopProgress();													// stop progressing
					_callback(null);
					return;
				}
			}
			roledata.aliases.push(_service_tenant_role);

			//
			// update role for alias
			//
			this.updateRoleData(_tenant, _role, roledata, false, (error) =>
			{
				this.stopProgress();														// stop progressing

				if(null !== error){
					console.error(error.message);
				}
				_callback(error);
			});
		});
	}

	//--------------------------------------------------
	// Role
	//--------------------------------------------------
	//
	// Get Role data
	//
	getRoleData(tenant, service, path, expand, callback)
	{
		if(!r3IsSafeTypedEntity(callback, 'function')){
			console.error('callback parameter is wrong.');
			return;
		}
		let	_callback	= callback;
		let	_error;
		if(r3IsEmptyStringObject(tenant, 'name') || r3IsEmptyString(path, true)){
			_error = new Error('tenant(' + JSON.stringify(tenant) + ') or path(' + JSON.stringify(path) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error, null);
			return;
		}

		let	_tenant		= tenant.name;
		let	_path		= path;
		let	_url		= '/v1/role/';
		if(r3IsEmptyString(service, true)){
			_url		+= _path;
		}else{
			// path under service, then full yrn path
			_url		+= 'yrn:yahoo:' + service + '::' + tenant.name + ':role:' + _path;
		}
		let	_urlargs	= undefined;
		if(r3IsSafeTypedEntity(expand, 'boolean')){
			_urlargs	= 'expand=' + (expand ? 'true' : 'false');
		}

		this.startProgress();																// start progressing

		this._get(_url, _urlargs, null, _tenant, (error, resobj) =>
		{
			this.stopProgress();															// stop progressing

			if(null !== error){
				console.error(error.message);
				_callback(error, null);
				return;
			}
			if(true !== resobj.result){
				error = new Error(resobj.message);
				console.error(error.message);
				_callback(error, null);
				return;
			}
			if(r3IsEmptyEntity(resobj.role)){
				_callback(null, null);
			}else{
				_callback(null, resobj.role);
			}
		});
	}

	//
	// Update Role data
	//
	updateRoleData(tenant, path, data, isOWHosts, callback)
	{
		if(!r3IsSafeTypedEntity(callback, 'function')){
			console.error('callback parameter is wrong.');
			return;
		}

		let	_callback	= callback;
		let	_role		= r3IsEmptyEntity(data) ? null : data;
		let	_isow		= r3IsSafeTypedEntity(isOWHosts, 'boolean') ? isOWHosts : false;
		let	_error;
		if(r3IsEmptyStringObject(tenant, 'name') || r3IsEmptyString(path, true)){
			_error = new Error('tenant(' + JSON.stringify(tenant) + ') or path(' + JSON.stringify(path) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}

		let	_tenant		= tenant.name;
		let	_path		= path.trim();
		let	_url		= '/v1/role';
		let	_urlargs	= 'name=' + _path;

		if(!r3IsEmptyEntityObject(_role, 'policies') && r3IsSafeTypedEntity(_role.policies, 'array')){
			_urlargs += '&policies=' + JSON.stringify(_role.policies);
		}
		if(!r3IsEmptyEntityObject(_role, 'aliases') && r3IsSafeTypedEntity(_role.aliases, 'array')){
			_urlargs += '&alias=' + JSON.stringify(_role.aliases);
		}

		this.startProgress();																// start progressing

		this._put(_url, _urlargs, null, _tenant, (error, resobj) =>
		{
			if(null !== error){
				console.error(error.message);

				this.stopProgress();														// stop progressing
				_callback(error);
				return;
			}
			if(true !== resobj.result){
				error = new Error(resobj.message);
				console.error(error.message);

				this.stopProgress();														// stop progressing
				_callback(error);
				return;
			}

			// check hosts.{hostnames, ips}
			let	hosts = [];
			if(!r3IsEmptyEntityObject(_role, 'hosts') && !r3IsEmptyEntityObject(_role.hosts, 'hostnames') && r3IsSafeTypedEntity(_role.hosts.hostnames, 'array')){
				hosts = hosts.concat(_role.hosts.hostnames);
			}
			if(!r3IsEmptyEntityObject(_role, 'hosts') && !r3IsEmptyEntityObject(_role.hosts, 'ips') && r3IsSafeTypedEntity(_role.hosts.ips, 'array')){
				hosts = hosts.concat(_role.hosts.ips);
			}
			if(0 === hosts.length && !_isow){
				// finish
				this.stopProgress();														// stop progressing
				_callback(null);
				return;
			}

			// build post hosts arguments
			_url		= '/v1/role/' + _path;
			let	_body	= {
				host:			[],
				clear_hostname:	_isow,
				clear_ips:		_isow
			};
			for(let cnt = 0; cnt < hosts.length; ++cnt){
				let	tmpCombine	= parseCombineHostObject(hosts[cnt]);
				let	onehost		= {
					host:		tmpCombine.hostname,
					port:		parseInt(tmpCombine.port),
					cuk:		tmpCombine.cuk,
					extra:		tmpCombine.extra,
					tag:		tmpCombine.tag
				};
				if(!r3IsEmptyString(tmpCombine.inboundip)){
					onehost.inboundip	= tmpCombine.inboundip;
				}
				if(!r3IsEmptyString(tmpCombine.outboundip)){
					onehost.outboundip	= tmpCombine.outboundip;
				}
				_body.host.push(onehost);
			}

			// update hosts
			this._post(_url, null, _tenant, _body, true, (error, resobj) =>
			{
				this.stopProgress();														// stop progressing

				if(null !== error){
					console.error(error.message);
					_callback(error);
					return;
				}
				if(true !== resobj.result){
					error = new Error(resobj.message);
					console.error(error.message);
					_callback(error);
					return;
				}
				_callback(null);
			});
		});
	}

	//
	// Create Empty Role data
	//
	createEmptyRoleData(tenant, path, callback)
	{
		return this.updateRoleData(tenant, path, null, true, callback);
	}

	//
	// Remove Role data
	//
	removeRoleData(tenant, path, callback)
	{
		if(!r3IsSafeTypedEntity(callback, 'function')){
			console.error('callback parameter is wrong.');
			return;
		}

		let	_callback	= callback;
		let	_error;
		if(r3IsEmptyStringObject(tenant, 'name') || r3IsEmptyString(path, true)){
			_error = new Error('tenant(' + JSON.stringify(tenant) + ') or path(' + JSON.stringify(path) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}

		let	_tenant		= tenant.name;
		let	_path		= path.trim();
		let	_url		= '/v1/role/' + _path;

		this.startProgress();																// start progressing

		this._delete(_url, null, null, _tenant, (error, resobj) =>
		{
			this.stopProgress();															// stop progressing

			if(null !== error){
				console.error(error.message);
				_callback(error);
				return;
			}
			if(true !== resobj.result){
				error = new Error(resobj.message);
				console.error(error.message);
				_callback(error);
				return;
			}
			_callback(null);
		});
	}

	//--------------------------------------------------
	// Policy
	//--------------------------------------------------
	//
	// Get Policy data
	//
	getPolicyData(tenant, service, path, callback)
	{
		if(!r3IsSafeTypedEntity(callback, 'function')){
			console.error('callback parameter is wrong.');
			return;
		}
		let	_callback	= callback;
		let	_error;
		if(r3IsEmptyStringObject(tenant, 'name') || r3IsEmptyString(path, true)){
			_error = new Error('tenant(' + JSON.stringify(tenant) + ') or path(' + JSON.stringify(path) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error, null);
			return;
		}

		let	_tenant		= tenant.name;
		let	_path		= path;
		let	_url		= '/v1/policy/';
		if(r3IsEmptyString(service, true)){
			_url		+= _path;
		}else{
			// path under service, then full yrn path
			//
			// [TODO]
			// This API gets service name by urlarg instead of yrn full path.
			// (If you set yrn full path for service name, but API does not use it!)
			// The API should use/check full yrn path.
			//
			_url		+= 'yrn:yahoo:' + service + '::' + tenant.name + ':policy:' + _path;
		}

		this.startProgress();																// start progressing

		this._get(_url, null, null, _tenant, (error, resobj) =>
		{
			this.stopProgress();															// stop progressing

			if(null !== error){
				console.error(error.message);
				_callback(error, null);
				return;
			}
			if(true !== resobj.result){
				error = new Error(resobj.message);
				console.error(error.message);
				_callback(error, null);
				return;
			}
			if(r3IsEmptyEntity(resobj.policy)){
				_callback(null, null);
			}else{
				_callback(null, resobj.policy);
			}
		});
	}

	//
	// Update Policy data
	//
	updatePolicyData(tenant, path, data, callback)
	{
		if(!r3IsSafeTypedEntity(callback, 'function')){
			console.error('callback parameter is wrong.');
			return;
		}

		let	_callback	= callback;
		let	_policy		= r3IsEmptyEntity(data) ? null : data;
		let	_error;
		if(r3IsEmptyStringObject(tenant, 'name') || r3IsEmptyString(path, true)){
			_error = new Error('tenant(' + JSON.stringify(tenant) + ') or path(' + JSON.stringify(path) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}

		let	_tenant		= tenant.name;
		let	_path		= path.trim();
		let	_url		= '/v1/policy';
		let	_urlargs	= 'name=' + _path;
		if(!r3IsEmptyStringObject(_policy, 'effect')){
			_urlargs	+= '&effect=' + _policy.effect;
		}
		if(!r3IsEmptyEntityObject(_policy, 'action') && r3IsSafeTypedEntity(_policy.action, 'array')){
			_urlargs	+= '&action=' + JSON.stringify(_policy.action);
		}
		if(!r3IsEmptyEntityObject(_policy, 'resource') && r3IsSafeTypedEntity(_policy.resource, 'array')){
			_urlargs	+= '&resource=' + JSON.stringify(_policy.resource);
		}
		if(!r3IsEmptyEntityObject(_policy, 'alias') && r3IsSafeTypedEntity(_policy.alias, 'array')){
			_urlargs	+= '&alias=' + JSON.stringify(_policy.alias);
		}

		this.startProgress();																// start progressing

		this._put(_url, _urlargs, null, _tenant, (error, resobj) =>
		{
			this.stopProgress();															// stop progressing

			if(null !== error){
				console.error(error.message);
				_callback(error);
				return;
			}
			if(true !== resobj.result){
				error = new Error(resobj.message);
				console.error(error.message);
				_callback(error);
				return;
			}
			_callback(null);
		});
	}

	//
	// Create Empty Policy data
	//
	createEmptyPolicyData(tenant, path, callback)
	{
		// default	action is read('yrn:yahoo::::action:read');
		//			effect is allow
		return this.updatePolicyData(tenant, path, { action: [ 'yrn:yahoo::::action:read' ], effect: 'allow' }, callback);
	}

	//
	// Remove Policy data
	//
	removePolicyData(tenant, path, callback)
	{
		if(!r3IsSafeTypedEntity(callback, 'function')){
			console.error('callback parameter is wrong.');
			return;
		}

		let	_callback	= callback;
		let	_error;
		if(r3IsEmptyStringObject(tenant, 'name') || r3IsEmptyString(path, true)){
			_error = new Error('tenant(' + JSON.stringify(tenant) + ') or path(' + JSON.stringify(path) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}

		let	_tenant		= tenant.name;
		let	_path		= path.trim();
		let	_url		= '/v1/policy/' + _path;

		this.startProgress();																// start progressing

		this._delete(_url, null, null, _tenant, (error, resobj) =>
		{
			this.stopProgress();															// stop progressing

			if(null !== error){
				console.error(error.message);
				_callback(error);
				return;
			}
			if(true !== resobj.result){
				error = new Error(resobj.message);
				console.error(error.message);
				_callback(error);
				return;
			}
			_callback(null);
		});
	}

	//--------------------------------------------------
	// Resource
	//--------------------------------------------------
	//
	// Get Resource data
	//
	getResourceData(tenant, service, path, expand, callback)
	{
		if(!r3IsSafeTypedEntity(callback, 'function')){
			console.error('callback parameter is wrong.');
			return;
		}
		let	_callback	= callback;
		let	_error;
		if(r3IsEmptyStringObject(tenant, 'name') || r3IsEmptyString(path, true)){
			_error = new Error('tenant(' + JSON.stringify(tenant) + ') or path(' + JSON.stringify(path) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error, null);
			return;
		}

		let	_tenant		= tenant.name;
		let	_path		= path;
		let	_url		= '/v1/resource/';
		if(r3IsEmptyString(service, true)){
			_url		+= _path;
		}else{
			// path under service, then full yrn path
			//
			// [TODO]
			// This API gets service name by urlarg instead of yrn full path.
			// (If you set yrn full path for service name, but API does not use it!)
			// The API should use/check full yrn path.
			//
			_url		+= 'yrn:yahoo:' + service + '::' + tenant.name + ':resource:' + _path;
		}
		let	_urlargs	= undefined;
		if(r3IsSafeTypedEntity(expand, 'boolean')){
			_urlargs	= 'expand=' + (expand ? 'true' : 'false');
		}

		this.startProgress();																// start progressing

		this._get(_url, _urlargs, null, _tenant, (error, resobj) =>
		{
			this.stopProgress();															// stop progressing

			if(null !== error){
				console.error(error.message);
				_callback(error, null);
				return;
			}
			if(true !== resobj.result){
				error = new Error(resobj.message);
				console.error(error.message);
				_callback(error, null);
				return;
			}
			if(r3IsEmptyEntity(resobj.resource)){
				_callback(null, null);
			}else{
				_callback(null, resobj.resource);
			}
		});
	}

	//
	// Update Resource data
	//
	updateResourceData(tenant, path, data, callback)
	{
		if(!r3IsSafeTypedEntity(callback, 'function')){
			console.error('callback parameter is wrong.');
			return;
		}

		let	_callback	= callback;
		let	_resource	= r3IsEmptyEntity(data) ? null : data;
		let	_error;
		if(r3IsEmptyStringObject(tenant, 'name') || r3IsEmptyString(path, true)){
			_error = new Error('tenant(' + JSON.stringify(tenant) + ') or path(' + JSON.stringify(path) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}

		let	_tenant		= tenant.name;
		let	_path		= path.trim();
		let	_url		= '/v1/resource';
		let	_urlargs	= 'name=' + _path;

		if(!r3IsEmptyStringObject(_resource, 'string')){
			_urlargs	+= '&type=string';
			_urlargs	+= '&data=' + JSON.stringify(_resource.string);
		}else if(!r3IsEmptyEntityObject(_resource, 'object')){
			_urlargs	+= '&type=object';
			_urlargs	+= '&data=' + JSON.stringify(_resource.object);
		}else{
			_urlargs	+= '&type=string';
			_urlargs	+= '&data=';
		}
		if(!r3IsEmptyEntityObject(_resource, 'keys') && !r3IsEmptyEntity(_resource.keys)){
			_urlargs	+= '&keys=' + JSON.stringify(_resource.keys);
		}
		if(!r3IsEmptyEntityObject(_resource, 'aliases') && r3IsSafeTypedEntity(_resource.aliases, 'array')){
			_urlargs	+= '&alias=' + JSON.stringify(_resource.aliases);
		}

		this.startProgress();																// start progressing

		this._put(_url, _urlargs, null, _tenant, (error, resobj) =>
		{
			this.stopProgress();															// stop progressing

			if(null !== error){
				console.error(error.message);
				_callback(error);
				return;
			}
			if(true !== resobj.result){
				error = new Error(resobj.message);
				console.error(error.message);
				_callback(error);
				return;
			}
			_callback(null);
		});
	}

	//
	// Create Empty Resource data
	//
	createEmptyResourceData(tenant, path, callback)
	{
		return this.updateResourceData(tenant, path, null, callback);
	}

	//
	// Remove Resource data
	//
	removeResourceData(tenant, path, callback)
	{
		if(!r3IsSafeTypedEntity(callback, 'function')){
			console.error('callback parameter is wrong.');
			return;
		}

		let	_callback	= callback;
		let	_error;
		if(r3IsEmptyStringObject(tenant, 'name') || r3IsEmptyString(path, true)){
			_error = new Error('tenant(' + JSON.stringify(tenant) + ') or path(' + JSON.stringify(path) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}

		let	_tenant		= tenant.name;
		let	_path		= path.trim();
		let	_url		= '/v1/resource/' + _path;

		this.startProgress();																// start progressing

		// remove all, not specify type parameter
		this._delete(_url, null, null, _tenant, (error, resobj) =>
		{
			this.stopProgress();															// stop progressing

			if(null !== error){
				console.error(error.message);
				_callback(error);
				return;
			}
			if(true !== resobj.result){
				error = new Error(resobj.message);
				console.error(error.message);
				_callback(error);
				return;
			}
			_callback(null);
		});
	}

	//--------------------------------------------------
	// Token
	//--------------------------------------------------
	//
	// Get New Role Token
	//
	getNewRoleToken(tenant, role, expire, callback)
	{
		if(!r3IsSafeTypedEntity(callback, 'function')){
			console.error('callback parameter is wrong.');
			return;
		}
		let	_callback	= callback;
		let	_error;
		if(r3IsEmptyStringObject(tenant, 'name') || r3IsEmptyString(role, true) || (r3IsSafeTypedEntity(expire, 'number') && expire < 0)){
			_error = new Error('tenant(' + JSON.stringify(tenant) + ') or role path(' + JSON.stringify(role) + ') or expire(' + JSON.stringify(expire) + ') parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}
		if(!r3IsSafeTypedEntity(expire, 'number')){
			expire		= null;
		}
		let	_tenant		= tenant.name;
		let	_role		= role;
		let	_url		= '/v1/role/token/' + _role;
		let	_urlargs	= undefined;
		if(r3IsSafeTypedEntity(expire, 'number')){
			_urlargs	= 'expire=' + String(expire);
		}

		this.startProgress();																// start progressing

		this._get(_url, _urlargs, null, _tenant, (error, resobj) =>
		{
			this.stopProgress();															// stop progressing

			if(null !== error){
				console.error(error.message);
				_callback(error, null);
				return;
			}
			if(true !== resobj.result){
				error = new Error(resobj.message);
				console.error(error.message);
				_callback(error, null);
				return;
			}
			if(r3IsEmptyString(resobj.token)){
				error = new Error('Could not get role token.');
				console.error(error.message);
				_callback(error, null);
				return;
			}
			if(r3IsEmptyString(resobj.registerpath)){
				error = new Error('Could not get register path.');
				console.error(error.message);
				_callback(error, null);
				return;
			}

			_callback(null, {
				roleToken:			resobj.token,
				registerPath:		resobj.registerpath
			});
		});
	}

	//
	// Get Role Token List
	//
	getRoleTokenList(tenant, role, expand, callback)
	{
		if(!r3IsSafeTypedEntity(callback, 'function')){
			console.error('callback parameter is wrong.');
			return;
		}
		let	_callback	= callback;
		let	_error;
		if(r3IsEmptyStringObject(tenant, 'name') || r3IsEmptyString(role, true)){
			_error = new Error('tenant(' + JSON.stringify(tenant) + ') or role path(' + JSON.stringify(role) + ') parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}
		if(!r3IsSafeTypedEntity(expand, 'boolean')){
			expand		= true;
		}
		let	_tenant		= tenant.name;
		let	_role		= role;
		let	_url		= '/v1/role/token/list/' + _role;
		let	_urlargs	= 'expand=' + (expand ? 'true' : 'false');

		this.startProgress();																// start progressing

		this._get(_url, _urlargs, null, _tenant, (error, resobj) =>
		{
			this.stopProgress();															// stop progressing

			if(null !== error){
				console.error(error.message);
				_callback(error, null);
				return;
			}
			if(true !== resobj.result){
				error = new Error(resobj.message);
				console.error(error.message);
				_callback(error, null);
				return;
			}
			if(r3IsEmptyEntity(resobj.tokens)){
				error = new Error('Could not get role token list.');
				console.error(error.message);
				_callback(error, null);
				return;
			}

			// convert object to object array
			let	tokenArray = [];
			Object.keys(resobj.tokens).forEach(function(oneToken){
				resobj.tokens[oneToken].token = oneToken;		// add element { ..., token: 'role token string' }
				tokenArray.push(resobj.tokens[oneToken]);
			});

			_callback(null, tokenArray);
		});
	}

	//
	// Remove Role Token
	//
	deleteRoleToken(tenant, roletoken, callback)
	{
		if(!r3IsSafeTypedEntity(callback, 'function')){
			console.error('callback parameter is wrong.');
			return;
		}
		let	_callback	= callback;
		let	_error;
		if(r3IsEmptyStringObject(tenant, 'name') || r3IsEmptyString(roletoken, true)){
			_error = new Error('tenant(' + JSON.stringify(tenant) + ') or role token(' + JSON.stringify(roletoken) + ') parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}
		let	_tenant		= tenant.name;
		let	_roletoken	= roletoken;
		let	_url		= '/v1/role/token/' + _roletoken;

		this.startProgress();																// start progressing

		this._delete(_url, null, null, _tenant, (error, resobj) =>
		{
			this.stopProgress();															// stop progressing

			if(null !== error){
				console.error(error.message);
				_callback(error);
				return;
			}
			if(true !== resobj.result){
				error = new Error(resobj.message);
				console.error(error.message);
				_callback(error);
				return;
			}

			_callback(null);
		});
	}


	//
	// Get User Data Script
	//
	getUserDataScript(registerpath)
	{
		if(r3IsEmptyString(registerpath, true)){
			console.error('registerpath(' + JSON.stringify(registerpath) + ') parameter is wrong.');
			return null;
		}

		// get user token script by expanding template
		let	userDataScript = this.r3Context.getExpandUserData(registerpath);
		if(r3IsEmptyString(userDataScript, true)){
			console.error('Failed to generate user data script from template.');
			return null;
		}

		return userDataScript;
	}

	//
	// Get Secret Yaml
	//
	getSecretYaml(roletoken)
	{
		if(r3IsEmptyString(roletoken, true)){
			console.error('role token(' + JSON.stringify(roletoken) + ') parameter is wrong.');
			return null;
		}

		// get secret yaml by expanding template
		let	secretYaml = this.r3Context.getExpandSecretYaml(roletoken);
		if(r3IsEmptyString(secretYaml, true)){
			console.error('Failed to generate secret yaml from template.');
			return null;
		}

		return secretYaml;
	}

	//
	// Get Secret Yaml
	//
	getSidecarYaml(roleyrn)
	{
		if(r3IsEmptyString(roleyrn, true)){
			console.error('role full yrn path(' + JSON.stringify(roleyrn) + ') parameter is wrong.');
			return null;
		}

		// get sidecar yaml by expanding template
		let	sidecarYaml = this.r3Context.getExpandSidecarYaml(roleyrn);
		if(r3IsEmptyString(sidecarYaml, true)){
			console.error('Failed to generate sidecar yaml from template.');
			return null;
		}
		return sidecarYaml;
	}

	//
	// Get Custom Registration Codes
	//
	getCRCObject(roleToken, roleyrn, registerpath)
	{
		if(r3IsEmptyString(roleToken, true) || r3IsEmptyString(roleyrn, true) || r3IsEmptyString(registerpath, true)){
			console.error('role token(not printed) or full yrn path(' + JSON.stringify(roleyrn) + ') or registerpath(not printed) parameters are wrong.');
			return null;
		}

		// get sidecar yaml by expanding template
		let	crcObject = this.r3Context.getExpandCRCObject(roleToken, roleyrn, registerpath);
		if(!r3IsSafeTypedEntity(crcObject, 'object') || r3IsSafeTypedEntity(crcObject, 'array')){
			console.error('Failed to generate CRC object from template.');
			return null;
		}
		return crcObject;
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
