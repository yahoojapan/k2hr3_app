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
 * CREATE:   Tue May 14 2019
 * REVISION:
 *
 */

import crypto			from 'crypto';

import R3Context		from '../util/r3context';
import { r3GetTextRes }	from '../util/r3define';
import { resourceType, roleType, policyType, serviceType }	from '../util/r3types';
import { checkServiceResourceValue }						from '../util/r3verifyutil';
import { r3IsEmptyEntity, r3IsEmptyEntityObject, r3IsEmptyStringObject, r3IsSafeTypedEntity, r3IsEmptyString, r3CompareCaseString, r3DeepClone } from '../util/r3util';

//
// Internal demo data
//
const DemoInitialInternalData = {
	// Tenant = No service
	'foo-tenant': [
		{
			name:		'SERVICE',
			path:		'service',
			children:	[]
		},
		{
			name:		'ROLE',
			path:		'role',
			children: [
				{
					name:		'foo-tenant-role',
					path:		'foo-tenant-role',
					children: [
						{
							name:		'foo-tenant-role-child',
							path:		'foo-tenant-role/foo-tenant-role-child',
							children:	[],
							// role data
							hosts: {
								hostnames: [
									'child.foo.k2hr3.antpick.ax * '
								],
								ips: [
									'127.0.0.2 * '
								]
							},
							policies:	[],
							aliases:	[]
						}
					],
					// role data
					hosts: {
						hostnames: [
							'foo.k2hr3.antpick.ax * '
						],
						ips: [
							'127.0.0.1 * '
						]
					},
					policies: [
						'yrn:yahoo:::foo-tenant:policy:foo-tenant-policy'
					],
					aliases: [
						'yrn:yahoo:::foo-tenant:role:foo-tenant-role/foo-tenant-role-child'
					]
				}
			]
		},
		{
			name:		'RESOURCE',
			path:		'resource',
			children: [
				{
					name:		'foo-tenant-resource',
					path:		'foo-tenant-resource',
					children: [
						{
							name:		'foo-tenant-resource-child',
							path:		'foo-tenant-resource/foo-tenant-resource-child',
							children:	[],
							// resource data
							string:		null,
							object: {
								'foo-tenant-resource-child-object':		'foo-tenant-resource-child-object-value'
							},
							keys: {
								'foo-tenant-resource-child-keys-key':	'foo-tenant-resource-child-keys-value',
								'foo-tenant-resource-child-keys-arr': [
									'foo-tenant-resource-child-keys-arr1',
									'foo-tenant-resource-child-keys-arr2'
								],
								'foo-tenant-resource-child-keys-obj': {
									'foo-tenant-resource-child-keys-obj-key1':	'foo-tenant-resource-child-keys-obj-val1',
									'foo-tenant-resource-child-keys-obj-key2':	'foo-tenant-resource-child-keys-obj-val2'
								},
							},
							expire:		null,
							aliases:	[]
						}
					],
					// resource data
					string:		'foo-tenant-resource-string',
					object:		null,
					keys: {
						'foo-tenant-resource-keys-key':	'foo-tenant-resource-keys-value',
						'foo-tenant-resource-keys-arr': [
							'foo-tenant-resource-keys-arr1',
							'foo-tenant-resource-keys-arr2'
						],
						'foo-tenant-resource-keys-obj': {
							'foo-tenant-resource-keys-obj-key1':	'foo-tenant-resource-keys-obj-val1',
							'foo-tenant-resource-keys-obj-key2':	'foo-tenant-resource-keys-obj-val2'
						},
					},
					expire:		null,
					aliases:	[
						'yrn:yahoo:::foo-tenant:resource:foo-tenant-resource/foo-tenant-resource-child'
					]
				}
			]
		},
		{
			name:		'POLICY',
			path:		'policy',
			children: [
				{
					name:		'foo-tenant-policy',
					path:		'foo-tenant-policy',
					children:	[],
					// policy data
					effect:		'allow',
					action: [
						'yrn:yahoo::::action:read',
						'yrn:yahoo::::action:write'
					],
					condition:	[],
					resource: [
						'yrn:yahoo:::foo-tenant:resource:foo-tenant-resource'
					],
					alias:		[]
				}
			]
		},
	],

	// Tenant = Service owner
	'service-owner': [
		{
			name:		'SERVICE',
			path:		'service',
			children: [
				{
					name:			'demo-service',
					path:			'demo-service',
					owner:			true,
					distributed:	false,
					children:		[],

					// service owner's data
					tenant: [
						'yrn:yahoo:::service-user'
					],
					verify:			'https://localhost/v1/debug/verify'
				}
			]
		},
		{
			name:		'ROLE',
			path:		'role',
			children:	[]
		},
		{
			name:		'RESOURCE',
			path:		'resource',
			children:	[]
		},
		{
			name:		'POLICY',
			path:		'policy',
			children:	[]
		},
	],

	// Tenant = Service user
	'service-user': [
		{
			name:		'SERVICE',
			path:		'service',
			children: [
				{
					name:			'demo-service',
					path:			'demo-service',
					owner:			false,
					distributed:	true,
					children: [
						{
							name:	'ROLE',
							path:	'role',
							children: [
								{
									name:		'acr-role',
									path:		'acr-role',
									children:	[],
									// role data in service
									hosts: {
										hostnames:	[],
										ips:		[]
									},
									policies: [
										'yrn:yahoo:demo-service::service-user:policy:acr-policy'
									],
									aliases:		[]
								}
							]
						},
						{
							name:	'RESOURCE',
							path:	'resource',
							children: [
								{
									name:		'demo-service-resource',
									path:		'demo-service-resource',
									children:	[],
									// resource data in service
									string:		'demo service data',
									object:		null,
									keys: {
										'demo-service-resource-key':	'demo-service-resource-value'
									},
									expire:		null,
									aliases:	[]
								}
							]
						},
						{
							name:	'POLICY',
							path:	'policy',
							children: [
								{
									name:		'acr-policy',
									path:		'acr-policy',
									children:	[],
									// policy data in service
									effect:		'allow',
									action: [
										'yrn:yahoo::::action:read'
									],
									condition:	[],
									resource: [
										'yrn:yahoo:demo-service::service-user:resource:demo-service-resource'
									],
									alias:		[]
								}
							]
						}
					]
				}
			]
		},
		{
			name:		'ROLE',
			path:		'role',
			children: [
				{
					name:		'service-user-role',
					path:		'service-user-role',
					children:	[],
					// empty role data
					hosts: {
						hostnames:	[],
						ips:		[]
					},
					policies:		[],
					aliases:		[]
				}
			]
		},
		{
			name:		'RESOURCE',
			path:		'resource',
			children: [
				{
					name:		'service-user-resource',
					path:		'service-user-resource',
					children:	[],
					// empty resource data
					string:		'',
					object:		null,
					keys:		{},
					expire:		null,
					aliases:	[]
				}
			]
		},
		{
			name:		'POLICY',
			path:		'policy',
			children: [
				{
					name:		'service-user-policy',
					path:		'service-user-policy',
					children:	[],
					// policy data in service
					effect:		'allow',
					action: [
						'yrn:yahoo::::action:read'
					],
					condition:	[],
					resource:	[],
					alias:		[]
				}
			]
		},
	]
};

const DemoInitialRoleTokens = {
	// Tenant = No service
	'foo-tenant': [
		{
			path:		'foo-tenant-role',
			roletokens:	{
				'demo-role-token-for-foo-tenant': {
					date:			'2019-09-01T00:00:00.000Z',
					expire:			'2029-09-01T00:00:00.000Z',
					user:			'demo',
					hostname:		null,
					ip:				null,
					port:			0,
					cuk:			null,
					registerpath:	'for-demo-register-dummy-path-for-openstack'
				}
			}
		},
		{
			path:		'foo-tenant-role/foo-tenant-role-child',
			roletokens:	{
				'demo-role-token-for-foo-tenant-role/foo-tenant-role-child': {
					date:			'2019-09-01T00:00:00.000Z',
					expire:			'2029-09-01T00:00:00.000Z',
					user:			'demo',
					hostname:		null,
					ip:				null,
					port:			0,
					cuk:			null,
					registerpath:	'for-demo-register-dummy-path-for-openstack'
				}
			}
		}
	],

	// Tenant = Service owner
	'service-owner': [
	],

	// Tenant = Service user
	'service-user': [
		{
			path:		'service-user-role',
			roletokens:	{
				'demo-role-token-for-service-user-role': {
					date:			'2019-09-01T00:00:00.000Z',
					expire:			'2029-09-01T00:00:00.000Z',
					user:			'demo',
					hostname:		null,
					ip:				null,
					port:			0,
					cuk:			null,
					registerpath:	'for-demo-register-dummy-path-for-openstack'
				}
			}
		}
	]
};

//
// Singin status for startup
//
let	isStartup = true;

//
// K2HR3 Data Provider Class
//
export default class R3Provider
{
	constructor(cbProgressControl, signin, username, unscopedtoken)
	{
		this.demoDummyDatas = {
			username:			'demo',
			unscopedtoken:		'demo-unscoped-token',
			roleToken:			'demo-role-token',
			registerpath:		'demo-path'
		};

		if(isStartup){
			signin			= true;
			username		= this.demoDummyDatas.username;
			unscopedtoken	= this.demoDummyDatas.unscopedtoken;
			isStartup		= false;
		}

		this.r3Context			= new R3Context(signin, username, unscopedtoken);

		// caches
		this.tenantList			= [];							// Tenant name list(element is object = {name: "tenant name", display: "display name"})
		this.cbProgressControl	= cbProgressControl;			// Callback function for progress(allow null)

		// text resource
		this.r3TextRes			= r3GetTextRes(this.r3Context.getSafeLang());

		// initialize demo data
		this.demoData			= r3DeepClone(DemoInitialInternalData);
		this.roleTokens			= r3DeepClone(DemoInitialRoleTokens);
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
	// TOKEN
	//--------------------------------------------------
	//
	// raw get Unscoped User token
	//
	getUnscopedUserToken(username, passphrase, callback)							// eslint-disable-line no-unused-vars
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

		if(_username !== this.demoDummyDatas.username){
			error = new Error('The signin username for the demonstration is \'' + this.demoDummyDatas.username + '\', and do not need a passphrase.');
			console.error(error.message);
			callback(error, null);
			return;
		}
		_callback(null, this.demoDummyDatas.unscopedtoken);
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

		this.tenantList = [];
		Object.keys(this.demoData).forEach((key) => {
			let	tmp = {
				name:		key,
				display:	key
			};
			this.tenantList.push(tmp);
		});
		this.stopProgress();																// stop progressing

		callback(null, this.tenantList);
	}

	//--------------------------------------------------
	// TREE LIST( Role / Resource / Policy Tree List )
	//--------------------------------------------------
	//
	// Common raw method : Get tree in tenant
	//
	rawGetChildTreeList(childArray, path, expand, callback)
	{
		if(!r3IsSafeTypedEntity(callback, 'function')){
			console.error('callback parameter is wrong.');
			return;
		}
		let	paths		= r3IsEmptyString(path) ? [] : path.split('/');
		let	_callback	= callback;
		let	_expand		= expand;
		if(0 === paths.length){
			let	_childArray = r3DeepClone(childArray);
			_childArray.forEach((child) => {
				if(!r3IsEmptyEntityObject(child, 'tenant')){
					delete child.tenant;
				}
				if(!r3IsEmptyEntityObject(child, 'verify')){
					delete child.verify;
				}
				if(!r3IsEmptyEntityObject(child, 'hosts')){
					delete child.hosts;
				}
				if(!r3IsEmptyEntityObject(child, 'policies')){
					delete child.policies;
				}
				if(!r3IsEmptyEntityObject(child, 'aliases')){
					delete child.aliases;
				}
				if(!r3IsEmptyEntityObject(child, 'effect')){
					delete child.effect;
				}
				if(!r3IsEmptyEntityObject(child, 'action')){
					delete child.action;
				}
				if(!r3IsEmptyEntityObject(child, 'condition')){
					delete child.condition;
				}
				if(!r3IsEmptyEntityObject(child, 'resource')){
					delete child.resource;
				}
				if(!r3IsEmptyEntityObject(child, 'string')){
					delete child.string;
				}
				if(!r3IsEmptyEntityObject(child, 'object')){
					delete child.object;
				}
				if(!r3IsEmptyEntityObject(child, 'keys')){
					delete child.keys;
				}
				if(!r3IsEmptyEntityObject(child, 'expire')){
					delete child.expire;
				}
				if(!expand){
					child.children = [];
				}else{
					this.rawGetChildTreeList(child.children, '', _expand, (error, children) => {
						child.children = children;
					});
				}
			});
			_callback(null, _childArray);
		}else{
			let	found = false;
			childArray.forEach((child) => {
				if(child.name === paths[0]){
					found = true;
					paths.shift();
					this.rawGetChildTreeList(child.children, paths.join('/'), _expand, _callback);
				}
			});
			if(!found){
				_callback(null, []);
			}
		}
	}

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

		// check tenant name in demo data
		if(r3IsEmptyEntityObject(this.demoData, tenant.name)){
			error = new Error('Not found tenant: ' + tenant.display + '(' + tenant.name + ')');
			console.error(error.message);
			callback(error, null);
			return;
		}

		let demoTenantData	= this.demoData[tenant.name];
		let	_service		= service;
		let	_type			= type;
		let	_path			= path;
		let	_expand			= expand;
		let	_callback		= callback;
		let	_found			= false;
		if(null !== _service){
			demoTenantData.forEach((element) => {
				if(element.path === serviceType){
					element.children.forEach((serviceChild) => {
						if(serviceChild.name === _service){
							serviceChild.children.forEach((serviceElement) => {
								if(serviceElement.path === _type){
									_found = true;
									this.rawGetChildTreeList(serviceElement.children, _path, _expand, _callback);
								}
							});
						}
					});
				}
			});
		}else{
			demoTenantData.forEach((element) => {
				if(element.path === _type){
					_found = true;
					this.rawGetChildTreeList(element.children, _path, _expand, _callback);
				}
			});
		}
		if(!_found){
			_callback(null, []);
		}
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

							if((_pos + 1) === _serviceChildren2.length){
								this.stopProgress();										// stop progressing
								_callback3(null, _serviceChildren2);
							}
						});
					})(cnt);
				}
				this.stopProgress();														// stop progressing
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
				// found 'path' === 'service'

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
						// found 'path' === 'service name'
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
					// found 'path' === 'service'

					// search 'service name' top in children
					if(!r3IsSafeTypedEntity(treeList[cnt].children, 'array') || 0 === treeList[cnt].children.length){
						continue;								// SERVICE does not have children
					}
					for(cnt2 = 0; cnt2 < treeList[cnt].children.length; ++cnt2){
						if(!r3IsEmptyStringObject(treeList[cnt].children[cnt2], 'path') && r3CompareCaseString(service, treeList[cnt].children[cnt2].path)){
							// found 'path' === 'service name'
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
				// found 'name' === current path
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
					// found 'path' === 'service name'
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
					// found 'path' === 'service name'
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
		let	_error		= null;
		if(r3IsEmptyStringObject(tenant, 'name') || r3IsEmptyString(servicename, true) || r3IsEmptyEntityObject(this.demoData, tenant.name)){
			_error = new Error('tenant(' + JSON.stringify(tenant) + ') or service(' + JSON.stringify(servicename) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}

		let demoTenantData	= this.demoData[tenant.name];
		let	_servicename	= servicename;
		let	result			= null;
		demoTenantData.forEach((element) => {
			if(element.path === serviceType){
				element.children.forEach((serviceChild) => {
					if(serviceChild.name === _servicename){
						let	tenants = [];
						let	verify	= null;
						if(!r3IsEmptyEntityObject(serviceChild, 'tenant')){
							tenants = r3DeepClone(serviceChild.tenant);
						}
						if(!r3IsEmptyEntityObject(serviceChild, 'verify')){
							verify = r3DeepClone(serviceChild.verify);
						}
						result = {
							name:		_servicename,
							owner:		tenant.name,
							tenant:		tenants,
							verify:		verify
						};
					}
				});
			}
		});
		callback(null, result);
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
		let	_callback	= callback;
		let	_error		= null;
		if(r3IsEmptyStringObject(tenant, 'name') || r3IsEmptyString(servicename, true) || r3IsEmptyEntityObject(this.demoData, tenant.name)){
			_error = new Error('tenant(' + JSON.stringify(tenant) + ') or service(' + JSON.stringify(servicename) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}
		let demoTenantData	= this.demoData[tenant.name];
		let	_service		= servicename.trim();
		let	_tenants		= null;
		let	_is_clear		= false;
		let	_verify			= null;

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

		this.startProgress();																// start progressing

		let	isUpdated	= false;
		let	oldTenants	= [];
		demoTenantData.forEach((element) => {
			if(element.path === serviceType){
				element.children.forEach((serviceChild) => {
					if(serviceChild.name === _service){
						// Found same service -> update it
						oldTenants				= r3DeepClone(serviceChild.tenant);
						if(_is_clear){
							serviceChild.tenant = [];
						}
						if(null !== _tenants){
							serviceChild.tenant = serviceChild.tenant.concat(_tenants);
						}
						if(null !== _verify){
							serviceChild.verify = _verify;
						}
						isUpdated = true;
					}
				});
			}
		});

		if(!isUpdated){
			// Add new service
			let newservice = {
				name:			_service,
				path:			_service,
				owner:			true,
				distributed:	false,
				children:		[],
				tenant:			(null === _tenants ? [] : r3DeepClone(tenants)),
				verify:			_verify
			};
			demoTenantData.forEach((element) => {
				if(element.path === serviceType){
					element.children.push(newservice);
				}
			});
		}

		if(!r3IsSafeTypedEntity(_tenants, 'array')){
			_tenants = [];
		}

		let	needRemoveTenants	= oldTenants.filter(oldTenant => _tenants.indexOf(oldTenant) === -1);
		let	needAddTenants		= _tenants.filter(newTenant => oldTenants.indexOf(newTenant) === -1);
		let	regpath				= /^yrn:yahoo:::(.*)$/;

		// remove service from tenant that has been incorporated
		needRemoveTenants.forEach((tenantname) => {
			let	matches = tenantname.match(regpath);
			if(null != matches && 2 == matches.length){
				let	_tenant = matches[1];
				if(!r3IsEmptyEntityObject(this.demoData, _tenant)){
					this.demoData[_tenant].forEach((element) => {
						if(element.path === serviceType){
							let	removePos = -1;
							element.children.forEach((serviceChild, pos) => {
								if(serviceChild.name === _service && !serviceChild.owner){
									// Found service -> remove it
									removePos = pos;
								}
							});
							if(-1 !== removePos){
								element.children.splice(removePos, 1);
							}
						}
					});
				}
			}
		});

		// Add a service to the tenant that started cooperation
		needAddTenants.forEach((tenantname) => {
			let	matches = tenantname.match(regpath);
			if(null != matches && 2 == matches.length){
				let	_tenant = matches[1];
				if(!r3IsEmptyEntityObject(this.demoData, _tenant)){
					this.demoData[_tenant].forEach((element) => {
						if(element.path === serviceType){
							let	found = false;
							element.children.forEach((serviceChild, pos) => {				// eslint-disable-line no-unused-vars
								if(serviceChild.name === _service){
									// Found service -> nothing to do
									found = true;
								}
							});
							if(!found){
								let newService = {
									name:			_service,
									path:			_service,
									owner:			false,
									distributed:	false,
									children:		[]
								};
								element.children.push(newService);
							}
						}
					});
				}
			}
		});

		this.stopProgress();																// stop progressing
		_callback(null);
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
		let	_error		= null;
		if(r3IsEmptyStringObject(tenant, 'name') || r3IsEmptyString(servicename, true) || r3IsEmptyEntity(verify) || (r3IsSafeTypedEntity(verify, 'string') && r3IsEmptyString(verify, true)) ){
			_error = new Error('tenant(' + JSON.stringify(tenant) + ') or service(' + JSON.stringify(servicename) + ') or verify(' + JSON.stringify(verify) + ') parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}

		let	_service	= servicename.trim();
		let	_verify		= verify.trim();
		Object.keys(this.demoData).forEach((key) => {
			this.demoData[key].forEach((element) => {
				if(element.path === serviceType){
					element.children.forEach((serviceChild) => {
						if(serviceChild.name === _service){
							// Found same service name
							_error = new Error('tenant(' + JSON.stringify(key) + ') has already same name service(' + JSON.stringify(_service) + ').');
							console.error(_error.message);
						}
					});
				}
			});
		});
		if(null !== _error){
			_callback(_error);
			return;
		}

		this.updateServiceData(tenant, _service, null, true, _verify, _callback);
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
		let	_error		= null;
		if(r3IsEmptyStringObject(tenant, 'name') || r3IsEmptyString(servicename, true) || r3IsEmptyEntityObject(this.demoData, tenant.name)){
			_error = new Error('tenant(' + JSON.stringify(tenant) + ') or service(' + JSON.stringify(servicename) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}
		this.startProgress();																// start progressing

		let demoTenantData	= this.demoData[tenant.name];
		let	_service		= servicename.trim();

		demoTenantData.forEach((element) => {
			if(element.path === serviceType){
				let	removePos = -1;
				element.children.forEach((serviceChild, pos) => {
					if(serviceChild.name === _service){
						// Found -> remove it
						removePos = pos;
					}
				});
				if(-1 !== removePos){
					if(isServiceTenant){
						// initialize for service tenant
						element.children[removePos].distributed	= false;
						element.children[removePos].children	= [];
					}else{
						// remove all service tenant
						this.removeAllServiceTenant(_service);
						element.children.splice(removePos, 1);
					}
				}
			}
		});
		this.stopProgress();																// stop progressing
		_callback(null);
	}

	removeAllServiceTenant(servicename)
	{
		if(r3IsEmptyString(servicename, true)){
			console.error('service name' + JSON.stringify(servicename) + ' parameter is wrong.');
			return false;
		}
		this.startProgress();																// start progressing

		let	_service		= servicename.trim();
		Object.keys(this.demoData).forEach((key) => {
			this.demoData[key].forEach((element) => {
				if(element.path === serviceType){
					let	removePos = -1;
					element.children.forEach((serviceChild, pos) => {
						if(serviceChild.name === _service && !serviceChild.owner){
							// Found -> remove it
							removePos = pos;
						}
					});
					if(-1 !== removePos){
						element.children.splice(removePos, 1);
					}
				}
			});
		});
		this.stopProgress();																// stop progressing
		return true;
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
		let	_callback	= callback;
		let	_error		= null;
		if(r3IsEmptyStringObject(tenant, 'name') || r3IsEmptyString(servicename, true) || r3IsEmptyEntityObject(this.demoData, tenant.name)){
			_error = new Error('tenant(' + JSON.stringify(tenant) + ') or service(' + JSON.stringify(servicename) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}
		let demoTenantData	= this.demoData[tenant.name];
		let	_service		= servicename.trim();
		let	_role			= role.trim();

		// check service tenant
		demoTenantData.forEach((element) => {
			if(element.path === serviceType){
				element.children.forEach((serviceChild, pos) => {							// eslint-disable-line no-unused-vars
					if(serviceChild.name === _service){
						// Found service
						if(0 !== serviceChild.children.length){
							// Already cooperate service
							_error = new Error('Already tenant(' + JSON.stringify(tenant) + ') has cooperated service(' + JSON.stringify(_service) + ').');
							console.error(_error.message);
						}else{
							// initializing
							serviceChild.distributed	= false;
							serviceChild.children		= [];
						}
					}
				});
			}
		});
		if(null !== _error){
			_callback(_error);
			return;
		}

		this.startProgress();																// start progressing

		// Add service with all new data
		let serviceTenantChildren = [
			{
				name:	'ROLE',
				path:	'role',
				children: [
					{
						name:		'acr-role',
						path:		'acr-role',
						children:	[],
						hosts: {
							hostnames:	[],
							ips:		[]
						},
						policies: [
							'yrn:yahoo:' + _service + '::' + tenant.name + ':policy:acr-policy'
						],
						aliases:		[]
					}
				]
			},
			{
				name:	'RESOURCE',
				path:	'resource',
				children: [
					{
						name:		_service + '-resource',
						path:		_service + '-resource',
						children:	[],
						string:		'Accurate data can not be set because of the demonstration application.',
						object:		null,
						keys:		{},
						expire:		null,
						aliases:	[]
					}
				]
			},
			{
				name:	'POLICY',
				path:	'policy',
				children: [
					{
						name:		'acr-policy',
						path:		'acr-policy',
						children:	[],
						effect:		'allow',
						action: [
							'yrn:yahoo::::action:read'
						],
						condition:	[],
						resource: [
							'yrn:yahoo:' + _service + '::' + tenant.name + ':resource:' + _service + '-resource'
						],
						alias:		[]
					}
				]
			}
		];

		demoTenantData.forEach((element) => {
			if(element.path === serviceType){
				let	found = false;
				element.children.forEach((serviceChild, pos) => {						// eslint-disable-line no-unused-vars
					if(serviceChild.name === _service){
						found = true;
						serviceChild.distributed	= true;
						serviceChild.children		= serviceTenantChildren;
					}
				});
				if(!found){
					element.children.push({
						name:			_service,
						path:			_service,
						owner:			false,
						distributed:	true,
						children:		serviceTenantChildren
					});
				}
			}
		});
		this.stopProgress();															// stop progressing

		if(!r3IsEmptyString(role, true)){
			this.setServiceTenantRoleAlias(tenant, _service, _role.trim(), _callback);
		}else{
			_callback(null);
		}
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
		let	_error		= null;
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
	rawGetRoleDataClone(roleArray, path, isRemove)
	{
		if(r3IsEmptyString(path)){
			return null;
		}
		let	paths = path.split('/');
		if(0 === paths.length){
			return null;
		}
		if(!r3IsSafeTypedEntity(isRemove, 'boolean')){
			isRemove = false;
		}

		let	_role		= null;
		let	removePos	= -1;
		roleArray.forEach((role, pos) => {
			if(role.name === paths[0]){
				// Found role
				if(1 === paths.length){
					_role = r3DeepClone(role);
					if(isRemove){
						removePos = pos;
					}
				}else{
					paths.shift();
					_role = this.rawGetRoleDataClone(role.children, paths.join('/'), isRemove);
				}
			}
		});
		if(-1 !== removePos){
			roleArray.splice(removePos, 1);
		}
		return _role;
	}

	rawSetRoleData(roleArray, path, data)
	{
		if(r3IsEmptyString(path)){
			return false;
		}
		let	paths = path.split('/');
		if(0 === paths.length){
			return false;
		}
		let	result	= true;
		if(1 < paths.length){
			roleArray.forEach((role) => {
				if(role.name === paths[0]){
					// Found role
					paths.shift();
					result = this.rawSetRoleData(role.children, paths.join('/'), data);
				}
			});
		}else{
			roleArray.push(data);
		}
		return result;
	}

	getRoleData(tenant, service, path, expand, callback)
	{
		if(!r3IsSafeTypedEntity(callback, 'function')){
			console.error('callback parameter is wrong.');
			return;
		}
		let	_callback	= callback;
		let	_error		= null;
		if(r3IsEmptyStringObject(tenant, 'name') || r3IsEmptyString(path, true) || r3IsEmptyEntityObject(this.demoData, tenant.name)){
			_error = new Error('tenant(' + JSON.stringify(tenant) + ') or path(' + JSON.stringify(path) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error, null);
			return;
		}

		this.startProgress();																// start progressing

		let demoTenantData	= this.demoData[tenant.name];
		let	_service		= service;
		let	_path			= path.trim();
		let	_expand			= expand;
		let	_role			= null;

		// search role
		if(!r3IsEmptyString(_service)){
			demoTenantData.forEach((element) => {
				if(element.path === serviceType){
					element.children.forEach((serviceChild) => {
						if(serviceChild.name === _service){
							// Found service
							serviceChild.children.forEach((serviceElement) => {
								if(serviceElement.path === roleType){
									_role = this.rawGetRoleDataClone(serviceElement.children, _path, false);
								}
							});
						}
					});
				}
			});
		}else{
			demoTenantData.forEach((element) => {
				if(element.path === roleType){
					_role = this.rawGetRoleDataClone(element.children, _path, false);
				}
			});
		}
		if(null === _role){
			this.stopProgress();															// stop progressing
			_error = new Error('not found role(' + JSON.stringify(_path) + ') in tenant(' + JSON.stringify(tenant) + ').');
			console.error(_error.message);
			_callback(_error, null);
			return;
		}

		delete _role.name;
		delete _role.path;
		if(!_expand){					// [NOTE] always _expand is false.
			delete _role.children;
		}
		this.stopProgress();																// stop progressing
		_callback(null, _role);
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
		let	_isow		= r3IsSafeTypedEntity(isOWHosts, 'boolean') ? isOWHosts : false;
		let	_error		= null;
		if(r3IsEmptyStringObject(tenant, 'name') || r3IsEmptyString(path, true) || r3IsEmptyEntityObject(this.demoData, tenant.name)){
			_error = new Error('tenant(' + JSON.stringify(tenant) + ') or path(' + JSON.stringify(path) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}

		this.startProgress();																// start progressing

		// get base role
		let demoTenantData	= this.demoData[tenant.name];
		let	_path			= path.trim();
		let	_role			= null;
		demoTenantData.forEach((element) => {
			if(element.path === roleType){
				_role = this.rawGetRoleDataClone(element.children, _path, true);
			}
		});
		if(null === _role){
			// not found role
			let	_names = _path.split('/');
			// make empty role
			_role = {
				name:			_names[_names.length - 1],
				path:			_path,
				children:		[],
				hosts: {
					hostnames:	[],
					ips:		[]
				},
				policies:		[],
				aliases:		[]
			};
		}

		// make new role
		if(null !== data){
			if(!r3IsEmptyEntityObject(data, 'policies')){
				_role.policies	= r3DeepClone(data.policies);
			}
			if(!r3IsEmptyEntityObject(data, 'aliases')){
				_role.aliases	= r3DeepClone(data.aliases);
			}
			if(_isow){
				if(!r3IsEmptyEntityObject(data, 'hosts')){
					if(!r3IsEmptyEntityObject(data.hosts, 'hostnames')){
						_role.hosts.hostnames	= r3DeepClone(data.hosts.hostnames);
					}
					if(!r3IsEmptyEntityObject(data.hosts, 'ips')){
						_role.hosts.ips			= r3DeepClone(data.hosts.ips);
					}
				}
			}else{
				if(!r3IsEmptyEntityObject(data, 'hosts')){
					if(!r3IsEmptyEntityObject(data.hosts, 'hostnames')){
						let _hostnames			= data.hosts.hostnames.concat(data.hosts.hostnames);
						data.hosts.hostnames	= Array.from(new Set(_hostnames));
					}
					if(!r3IsEmptyEntityObject(data.hosts, 'ips')){
						let _ips				= data.hosts.ips.concat(data.hosts.ips);
						data.hosts.ips			= Array.from(new Set(_ips));
					}
				}
			}
		}

		// set role
		demoTenantData.forEach((element) => {
			if(element.path === roleType){
				if(!this.rawSetRoleData(element.children, _path, _role)){
					_error = new Error('could not set role(' + JSON.stringify(_path) + ').');
					console.error(_error.message);
				}
			}
		});
		this.stopProgress();																// stop progressing
		_callback(_error);
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
		let	_error		= null;
		if(r3IsEmptyStringObject(tenant, 'name') || r3IsEmptyString(path, true) || r3IsEmptyEntityObject(this.demoData, tenant.name)){
			_error = new Error('tenant(' + JSON.stringify(tenant) + ') or path(' + JSON.stringify(path) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}
		this.startProgress();																// start progressing

		let demoTenantData	= this.demoData[tenant.name];
		let	_path			= path.trim();
		demoTenantData.forEach((element) => {
			if(element.path === roleType){
				this.rawGetRoleDataClone(element.children, _path, true);
			}
		});
		this.stopProgress();																// stop progressing
		_callback(null);
	}

	//--------------------------------------------------
	// Policy
	//--------------------------------------------------
	//
	// Get Policy data
	//
	rawGetPolicyDataClone(policyArray, path, isRemove)
	{
		if(r3IsEmptyString(path)){
			return null;
		}
		if(!r3IsSafeTypedEntity(isRemove, 'boolean')){
			isRemove = false;
		}

		let	_policy		= null;
		let	removePos	= -1;
		policyArray.forEach((policy, pos) => {
			if(policy.name === path){
				// Found policy
				_policy = r3DeepClone(policy);
				if(isRemove){
					removePos = pos;
				}
			}
		});
		if(-1 !== removePos){
			policyArray.splice(removePos, 1);
		}
		return _policy;
	}

	rawSetPolicyData(policyArray, path, data)
	{
		if(r3IsEmptyString(path)){
			return false;
		}
		let	removePos = -1;
		policyArray.forEach((policy, pos) => {
			if(policy.name === path){
				removePos = pos;
			}
		});
		if(-1 !== removePos){
			policyArray.splice(removePos, 1);
		}
		policyArray.push(data);

		return true;
	}

	getPolicyData(tenant, service, path, callback)
	{
		if(!r3IsSafeTypedEntity(callback, 'function')){
			console.error('callback parameter is wrong.');
			return;
		}
		let	_callback	= callback;
		let	_error		= null;
		if(r3IsEmptyStringObject(tenant, 'name') || r3IsEmptyString(path, true) || r3IsEmptyEntityObject(this.demoData, tenant.name)){
			_error = new Error('tenant(' + JSON.stringify(tenant) + ') or path(' + JSON.stringify(path) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error, null);
			return;
		}
		this.startProgress();																// start progressing

		let demoTenantData	= this.demoData[tenant.name];
		let	_service		= service;
		let	_path			= path.trim();
		let	_policy			= null;

		// search policy
		if(!r3IsEmptyString(_service)){
			demoTenantData.forEach((element) => {
				if(element.path === serviceType){
					element.children.forEach((serviceChild) => {
						if(serviceChild.name === _service){
							// Found service
							serviceChild.children.forEach((serviceElement) => {
								if(serviceElement.path === policyType){
									_policy = this.rawGetPolicyDataClone(serviceElement.children, _path, false);
								}
							});
						}
					});
				}
			});
		}else{
			demoTenantData.forEach((element) => {
				if(element.path === policyType){
					_policy = this.rawGetPolicyDataClone(element.children, _path, false);
				}
			});
		}
		if(null === _policy){
			this.stopProgress();															// stop progressing
			_error = new Error('not found policy(' + JSON.stringify(_path) + ') in tenant(' + JSON.stringify(tenant) + ').');
			console.error(_error.message);
			_callback(_error, null);
			return;
		}
		delete _policy.name;
		delete _policy.path;
		delete _policy.children;
		this.stopProgress();																// stop progressing
		_callback(null, _policy);
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
		let	_error		= null;
		if(r3IsEmptyStringObject(tenant, 'name') || r3IsEmptyString(path, true) || r3IsEmptyEntityObject(this.demoData, tenant.name)){
			_error = new Error('tenant(' + JSON.stringify(tenant) + ') or path(' + JSON.stringify(path) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}
		this.startProgress();																// start progressing

		// get base policy
		let demoTenantData	= this.demoData[tenant.name];
		let	_path			= path.trim();
		let	_policy			= null;
		demoTenantData.forEach((element) => {
			if(element.path === policyType){
				_policy = this.rawGetPolicyDataClone(element.children, _path, true);
			}
		});
		if(null === _policy){
			// make empty policy
			_policy = {
				name:			_path,
				path:			_path,
				children:		[],
				effect:			'allow',
				action: [
					'yrn:yahoo::::action:read',
					'yrn:yahoo::::action:write'
				],
				condition:		[],
				resource:		[],
				alias:			[]
			};
		}

		// make new policy
		if(null !== data){
			if(!r3IsEmptyEntityObject(data, 'effect')){
				_policy.effect		= r3DeepClone(data.effect);
			}
			if(!r3IsEmptyEntityObject(data, 'action')){
				_policy.action		= r3DeepClone(data.action);
			}
			if(!r3IsEmptyEntityObject(data, 'condition')){
				_policy.condition	= r3DeepClone(data.condition);
			}
			if(!r3IsEmptyEntityObject(data, 'resource')){
				_policy.resource	= r3DeepClone(data.resource);
			}
			if(!r3IsEmptyEntityObject(data, 'alias')){
				_policy.alias		= r3DeepClone(data.alias);
			}
		}

		// set policy
		demoTenantData.forEach((element) => {
			if(element.path === policyType){
				if(!this.rawSetPolicyData(element.children, _path, _policy)){
					_error = new Error('could not set policy(' + JSON.stringify(_path) + ').');
					console.error(_error.message);
				}
			}
		});
		this.stopProgress();																// stop progressing
		_callback(_error);
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
		let	_error		= null;
		if(r3IsEmptyStringObject(tenant, 'name') || r3IsEmptyString(path, true) || r3IsEmptyEntityObject(this.demoData, tenant.name)){
			_error = new Error('tenant(' + JSON.stringify(tenant) + ') or path(' + JSON.stringify(path) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}
		this.startProgress();																// start progressing

		let demoTenantData	= this.demoData[tenant.name];
		let	_path			= path.trim();
		demoTenantData.forEach((element) => {
			if(element.path === policyType){
				this.rawGetPolicyDataClone(element.children, _path, true);
			}
		});
		this.stopProgress();																// stop progressing
		_callback(null);
	}

	//--------------------------------------------------
	// Resource
	//--------------------------------------------------
	//
	// Get Resource data
	//
	rawGetResourceDataClone(resourceArray, path, isRemove)
	{
		if(r3IsEmptyString(path)){
			return null;
		}
		let	paths = path.split('/');
		if(0 === paths.length){
			return null;
		}
		if(!r3IsSafeTypedEntity(isRemove, 'boolean')){
			isRemove = false;
		}

		let	_resource	= null;
		let	removePos	= -1;
		resourceArray.forEach((resource, pos) => {
			if(resource.name === paths[0]){
				// Found resource
				if(1 === paths.length){
					_resource = r3DeepClone(resource);
					if(isRemove){
						removePos = pos;
					}
				}else{
					paths.shift();
					_resource = this.rawGetResourceDataClone(resource.children, paths.join('/'), isRemove);
				}
			}
		});
		if(-1 !== removePos){
			resourceArray.splice(removePos, 1);
		}
		return _resource;
	}

	rawSetResourceData(resourceArray, path, data)
	{
		if(r3IsEmptyString(path)){
			return false;
		}
		let	paths = path.split('/');
		if(0 === paths.length){
			return false;
		}
		let	result	= true;
		if(1 < paths.length){
			resourceArray.forEach((resource) => {
				if(resource.name === paths[0]){
					// Found resource
					paths.shift();
					result = this.rawSetResourceData(resource.children, paths.join('/'), data);
				}
			});
		}else{
			resourceArray.push(data);
		}
		return result;
	}

	getResourceData(tenant, service, path, expand, callback)
	{
		if(!r3IsSafeTypedEntity(callback, 'function')){
			console.error('callback parameter is wrong.');
			return;
		}
		let	_callback	= callback;
		let	_error		= null;
		if(r3IsEmptyStringObject(tenant, 'name') || r3IsEmptyString(path, true) || r3IsEmptyEntityObject(this.demoData, tenant.name)){
			_error = new Error('tenant(' + JSON.stringify(tenant) + ') or path(' + JSON.stringify(path) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error, null);
			return;
		}

		this.startProgress();																// start progressing

		let demoTenantData	= this.demoData[tenant.name];
		let	_service		= service;
		let	_path			= path.trim();
		let	_expand			= expand;
		let	_resource		= null;

		// search resource
		if(!r3IsEmptyString(_service)){
			demoTenantData.forEach((element) => {
				if(element.path === serviceType){
					element.children.forEach((serviceChild) => {
						if(serviceChild.name === _service){
							// Found service
							serviceChild.children.forEach((serviceElement) => {
								if(serviceElement.path === resourceType){
									_resource = this.rawGetResourceDataClone(serviceElement.children, _path, false);
								}
							});
						}
					});
				}
			});
		}else{
			demoTenantData.forEach((element) => {
				if(element.path === resourceType){
					_resource = this.rawGetResourceDataClone(element.children, _path, false);
				}
			});
		}
		if(null === _resource){
			this.stopProgress();															// stop progressing
			_error = new Error('not found resource(' + JSON.stringify(_path) + ') in tenant(' + JSON.stringify(tenant) + ').');
			console.error(_error.message);
			_callback(_error, null);
			return;
		}

		delete _resource.name;
		delete _resource.path;
		if(!_expand){					// [NOTE] always _expand is false.
			delete _resource.children;
		}
		this.stopProgress();																// stop progressing
		_callback(null, _resource);
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
		let	_error		= null;
		if(r3IsEmptyStringObject(tenant, 'name') || r3IsEmptyString(path, true) || r3IsEmptyEntityObject(this.demoData, tenant.name)){
			_error = new Error('tenant(' + JSON.stringify(tenant) + ') or path(' + JSON.stringify(path) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}

		this.startProgress();																// start progressing

		// get base resource
		let demoTenantData	= this.demoData[tenant.name];
		let	_path			= path.trim();
		let	_resource		= null;
		demoTenantData.forEach((element) => {
			if(element.path === resourceType){
				_resource = this.rawGetResourceDataClone(element.children, _path, true);
			}
		});

		if(null === _resource){
			// not found resource
			let	_names = _path.split('/');
			// make empty resource
			_resource = {
				name:		_names[_names.length - 1],
				path:		_path,
				children:	[],
				string:		'',
				object:		null,
				keys:		{},
				expire:		null,
				aliases:	[]
			};
		}
		// make new resource
		if(null !== data){
			if(!r3IsEmptyEntityObject(data, 'string')){
				_resource.string	= r3DeepClone(data.string);
			}
			if(!r3IsEmptyEntityObject(data, 'object')){
				_resource.object	= r3DeepClone(data.object);
			}
			if(!r3IsEmptyEntityObject(data, 'keys')){
				_resource.keys		= r3DeepClone(data.keys);
			}
			if(!r3IsEmptyEntityObject(data, 'expire')){
				_resource.expire	= r3DeepClone(data.expire);
			}
			if(!r3IsEmptyEntityObject(data, 'aliases')){
				_resource.aliases	= r3DeepClone(data.aliases);
			}
		}

		// set resource
		demoTenantData.forEach((element) => {
			if(element.path === resourceType){
				if(!this.rawSetResourceData(element.children, _path, _resource)){
					_error = new Error('could not set resource(' + JSON.stringify(_path) + ').');
					console.error(_error.message);
				}
			}
		});
		this.stopProgress();																// stop progressing
		_callback(_error);
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
		let	_error		= null;
		if(r3IsEmptyStringObject(tenant, 'name') || r3IsEmptyString(path, true) || r3IsEmptyEntityObject(this.demoData, tenant.name)){
			_error = new Error('tenant(' + JSON.stringify(tenant) + ') or path(' + JSON.stringify(path) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}

		this.startProgress();																// start progressing

		let demoTenantData	= this.demoData[tenant.name];
		let	_path			= path.trim();
		demoTenantData.forEach((element) => {
			if(element.path === resourceType){
				this.rawGetResourceDataClone(element.children, _path, true);
			}
		});
		this.stopProgress();																// stop progressing
		_callback(null);
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

		this.startProgress();																// start progressing

		let	_tenant		= tenant.name;
		let	_role		= role;
		let	_expire;
		if(!r3IsSafeTypedEntity(expire, 'number')){
			_expire		= 24 * 60 * 60 * 1000;												// default 24H(ms)
		}else{
			_expire		= 10 * 365 * 24 * 60 * 60 * 1000;									// no expire(10 years)
		}

		// make new role token
		let binRoleToken	= crypto.randomBytes(16);
		let	strRoleToken	= binRoleToken.toString('hex');
		let	nowMilliTime	= Math.floor(new Date());
		let	valueRoleToken	= {
			date:			(new Date(nowMilliTime)).toISOString(),
			expire:			(new Date(nowMilliTime + _expire)).toISOString(),
			user:			'demo',
			hostname:		null,
			ip:				null,
			port:			0,
			cuk:			null,
			registerpath:	'for-demo-' + binRoleToken.toString('hex')
		};

		// search target role
		let	_target_role = null;
		for(let cnt = 0; cnt < this.roleTokens[_tenant].length; ++cnt){
			if(_role == this.roleTokens[_tenant][cnt].path){
				_target_role = this.roleTokens[_tenant][cnt];
				break;
			}
		}
		if(null == _target_role){
			// need to add new role
			_target_role = {
				path:		_role,
				roletokens:	{}
			};
			this.roleTokens[_tenant].push(_target_role);
		}

		// add new role token
		_target_role.roletokens[strRoleToken] = valueRoleToken;

		this.stopProgress();																// stop progressing

		_callback(null, {
			roleToken:		strRoleToken,
			registerPath:	valueRoleToken.registerpath
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

		this.startProgress();																// start progressing

		if(!r3IsSafeTypedEntity(expand, 'boolean')){										// do not care for this value(always expanding)
			expand		= true;
		}
		let	_tenant		= tenant.name;
		let	_role		= role;

		// search target role
		let	_target_role = null;
		for(let cnt = 0; cnt < this.roleTokens[_tenant].length; ++cnt){
			if(_role == this.roleTokens[_tenant][cnt].path){
				_target_role = this.roleTokens[_tenant][cnt];
				break;
			}
		}
		if(null == _target_role){
			// need to add new role
			_target_role = {
				path:		_role,
				roletokens:	{}
			};
			this.roleTokens[_tenant].push(_target_role);
		}

		// convert object to object array
		let	tokenArray = [];
		Object.keys(_target_role.roletokens).forEach(function(oneToken){
			let	tokendata = r3DeepClone(_target_role.roletokens[oneToken]);
			tokendata.token = oneToken;														// add element { ..., token: 'role token string' }
			tokenArray.push(tokendata);
		});

		this.stopProgress();																// stop progressing

		_callback(null, tokenArray);
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

		this.startProgress();																// start progressing

		let	_tenant		= tenant.name;
		let	_roletoken	= roletoken;

		// search target role token and remove it
		for(let cnt = 0; cnt < this.roleTokens[_tenant].length; ++cnt){
			let	_found = false;
			Object.keys(this.roleTokens[_tenant][cnt].roletokens).forEach(function(oneToken){
				if(oneToken == _roletoken){
					_found = true;
				}
			});
			if(_found){
				delete this.roleTokens[_tenant][cnt].roletokens[_roletoken];
				break;
			}
		}

		this.stopProgress();																// stop progressing

		_callback(null);
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
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
