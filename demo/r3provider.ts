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
 * CREATE:   Tue May 14 2019
 * REVISION:
 *
 */

import crypto								from 'crypto';
import path									from 'path';
import R3Context							from '../util/r3context';
import { r3GetTextRes, localTenantPrefix }	from '../util/r3define';
import { checkServiceResourceValue }		from '../util/r3verifyutil';
import { resourceType, roleType, policyType, serviceType, ItemType, isItemType, ErrorCallback, DataCallback, FetchError, PathDetailInfo, PolicyActionType, PolicyData, PolicyEffectType, ProgressCallback, ResourceData, RoleData, RoleHostList, RoleTokenPrimitiveInfo, RoleTokenListResponseInfo, RoleTokenInfo, ServiceData, StaticResourceObject, ServiceResourceObject, isServiceResourceObjectArray, StringValObj, TenantData, TokenCallback, TreeListItem, actionValueRead, actionValueWrite, effectValueAllow, CRCObject, isCRCObject, isPolicyActionType, isPolicyActionTypeArray, isPolicyData, isPolicyEffectType, isResourceData, isRoleData, isRoleHostList, isTenantData, isTreeListItem, isRoleTokenListResponseInfo, valTypeAllObject }	from '../util/r3types';
import { r3IsString, r3IsFunction, r3IsObject, r3IsArray, r3IsBoolean, r3IsNumber, r3IsEmptyEntityObject, r3IsEmptyStringObject, r3IsEmptyString, r3CompareCaseString, r3DeepClone, r3GetSafeString, r3IsStringArray } from '../util/r3util';

//
// Demo data types
//
type DemoTreeNode = valTypeAllObject & {
	name:			string;
	path:			string;
	children:		DemoTreeNode[];
};

type DemoRoleTokenListInfo = Required<RoleTokenListResponseInfo>;

type DemoRoleTokenEntry = {
	path:			string;
	roletokens:		Record<string, DemoRoleTokenListInfo | {}>;
};

type DemoRoleTokenList = Record<string, DemoRoleTokenEntry[]>;

//
// Internal demo data
//
const DemoInitialInternalData: Record<string, DemoTreeNode[]> = {
	// Tenant = No service
	'foo-tenant': [
		{
			name:		'SERVICE',
			path:		serviceType,
			children:	[]
		},
		{
			name:		'ROLE',
			path:		roleType,
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
			path:		resourceType,
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
			path:		policyType,
			children: [
				{
					name:		'foo-tenant-policy',
					path:		'foo-tenant-policy',
					children:	[],
					// policy data
					effect:		effectValueAllow,
					action: [
						actionValueRead,
						actionValueWrite
					],
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
			path:		serviceType,
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
			path:		roleType,
			children:	[]
		},
		{
			name:		'RESOURCE',
			path:		resourceType,
			children:	[]
		},
		{
			name:		'POLICY',
			path:		policyType,
			children:	[]
		},
	],

	// Tenant = Service user
	'service-user': [
		{
			name:		'SERVICE',
			path:		serviceType,
			children: [
				{
					name:			'demo-service',
					path:			'demo-service',
					owner:			false,
					distributed:	true,
					children: [
						{
							name:	'ROLE',
							path:	roleType,
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
							path:	resourceType,
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
							path:	policyType,
							children: [
								{
									name:		'acr-policy',
									path:		'acr-policy',
									children:	[],
									// policy data in service
									effect:		effectValueAllow,
									action: [
										actionValueRead
									],
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
			path:		roleType,
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
			path:		resourceType,
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
			path:		policyType,
			children: [
				{
					name:		'service-user-policy',
					path:		'service-user-policy',
					children:	[],
					// policy data in service
					effect:		effectValueAllow,
					action: [
						actionValueRead
					],
					resource:	[],
					alias:		[]
				}
			]
		}
	],
	// Local Tenant
	'local@tenant': [
		{
			name:		'SERVICE',
			path:		serviceType,
			children:	[]
		},
		{
			name:		'ROLE',
			path:		roleType,
			children:	[]
		},
		{
			name:		'RESOURCE',
			path:		resourceType,
			children:	[]
		},
		{
			name:		'POLICY',
			path:		policyType,
			children:	[]
		},
	]
};

//
// New local tenant initial data
//
const DemoInitialLocalTenantData: DemoTreeNode[] = [
	{
		name:		'SERVICE',
		path:		serviceType,
		children:	[]
	},
	{
		name:		'ROLE',
		path:		roleType,
		children:	[]
	},
	{
		name:		'RESOURCE',
		path:		resourceType,
		children:	[]
	},
	{
		name:		'POLICY',
		path:		policyType,
		children:	[]
	}
];

//
// Internal demo tenant data
//
const DemoInitialTenantData: TenantData[] = [
	{
		// Tenant = No service
		'name':			'foo-tenant',
		'id':			'foo-tenant-id',
		'display':		'foo-tenant',
		'description':	'foo-tenant tenant for demo'
	},
	{
		// Tenant = Service owner
		'name':			'service-owner',
		'id':			'service-owner-id',
		'display':		'service-owner',
		'description':	'service-owner tenant for demo'
	},
	{
		// Tenant = Service user
		'name':			'service-user',
		'id':			'service-user-id',
		'display':		'service-user',
		'description':	'service-user tenant for demo'
	},
	{
		// Local Tenant
		'name':			'local@tenant',
		'id':			'local@tenant-id',
		'display':		'local@tenant',
		'description':	'local@tenant tenant for demo',
		'users':		[ 'demo' ]
	}
];

const DemoInitialRoleTokens: DemoRoleTokenList = {
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
	demoDummyDatas:		StringValObj;
	demoData:			Record<string, DemoTreeNode[]>;
	r3Context:			R3Context;
	tenantList:			TenantData[];
	cbProgressControl:	((show: boolean) => void) | null;
	r3TextRes:			StringValObj;
	roleTokens:			Record<string, DemoRoleTokenEntry[]>;

	constructor(cbProgressControl: ProgressCallback | null, signin?: boolean, username?: string, unscopedtoken?: string)
	{
		this.demoDummyDatas = {
			username:			'demo',
			unscopedtoken:		'demo-unscoped-token',
			roleToken:			'demo-role-token',
			registerpath:		'demo-path'
		};

		if(!r3IsBoolean(signin)){
			// Initialize only when signin is undefined.
			signin			= true;
			username		= this.demoDummyDatas.username;
			unscopedtoken	= this.demoDummyDatas.unscopedtoken;
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

	getR3Context(): R3Context
	{
		return this.r3Context;
	}

	getR3TextRes(): StringValObj
	{
		return this.r3TextRes;
	}

	startProgress(): void
	{
		if(null !== this.cbProgressControl){
			this.cbProgressControl(true);
		}
	}

	stopProgress(): void
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
	getUnscopedUserToken(username: string, passphrase: string | null, callback: TokenCallback): void
	{
		if(!r3IsFunction(callback)){
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
	getTenantList(force: boolean, useLocalTenant: boolean, callback: DataCallback<TenantData[]>): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}
		let	_callback	= callback;

		if(!this.r3Context.isLogin()){
			console.info('Not logged in yet.');
			// return empty cache
			_callback(null, []);
			return;
		}

		this.startProgress();																// start progressing

		if(0 === this.tenantList.length){
			// first time to initializing
			this.tenantList = r3DeepClone(DemoInitialTenantData);
		}

		this.stopProgress();																// stop progressing

		_callback(null, this.tenantList);
	}

	//--------------------------------------------------
	// Local Tenant
	//--------------------------------------------------
	//
	// Create Local Tenant
	//
	// name			: local tenant name
	// display		: display name for new local tenant(allowed null/emptyv1/tenant)
	// description	: description for new local tenant(allowed null/emptyv1/tenant)
	// users		: initial user name array for new local tenant
	//
	createLocalTenant(name: string, display: string | null, description: string | null, users: string[], callback: ErrorCallback): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}

		let	_callback	= callback;
		let	_error;
		if(r3IsEmptyString(name, true) || !r3IsArray(users) || 0 === users.length){
			_error = new Error('name(' + JSON.stringify(name) + ') or display(' + JSON.stringify(display) + ') or description(' + JSON.stringify(description) + ') or users(' + JSON.stringify(users) + ') parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}

		let	_name		= name.trim();
		if(0 !== _name.indexOf(localTenantPrefix)){
			_name = localTenantPrefix + _name;
		}

		this.startProgress();																// start progressing

		//
		// Check same tenant name
		//
		let	_found = false;
		this.tenantList.map( (item) => {
			if(!r3IsEmptyString(item.name) && item.name == _name){
				// found
				_found = true;
			}
		});
		if(_found){
			this.stopProgress();															// stop progressing
			_error = new Error('tenant name(' + _name + ') already eixsts.');
			console.error(_error.message);
			_callback(_error);
			return;
		}

		//
		// Add local tenant
		//
		let	_display	= (r3IsEmptyString(display, true)		? _name						: r3IsEmptyString(display.trim(), true)		? _name						: display.trim());
		let	_description= (r3IsEmptyString(description, true)	? ('Local Tenant ' + _name)	: r3IsEmptyString(description.trim(), true)	? ('Local Tenant ' + _name)	: description.trim());
		let	_users		= r3DeepClone(users);

		this.tenantList.push({
			'name':			_name,
			'id':			(_name + '_id'),
			'display':		_display,
			'description':	_description,
			'users':		_users
		});
		this.demoData[_name] = r3DeepClone(DemoInitialLocalTenantData);

		this.stopProgress();																// stop progressing

		_callback(null);
	}

	//
	// Update Local Tenant
	//
	// name			: local tenant name
	// id			: local tenant id
	// display		: display name for local tenant(allowed null/emptyv1/tenant)
	// description	: description for local tenant(allowed null/emptyv1/tenant)
	// users		: user name array for local tenant
	//
	updateLocalTenant(name: string, id: string, display: string | null, description: string | null, users: string[], callback: ErrorCallback): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}

		let	_callback	= callback;
		let	_error;
		if(r3IsEmptyString(name, true) || r3IsEmptyString(id, true) || !r3IsArray(users) || 0 === users.length){
			_error = new Error('name(' + JSON.stringify(name) + ') or id(' + JSON.stringify(id) + ') or display(' + JSON.stringify(display) + ') or description(' + JSON.stringify(description) + ') or users(' + JSON.stringify(users) + ') parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}

		let	_name		= name.trim();
		if(0 !== _name.indexOf(localTenantPrefix)){
			_name = localTenantPrefix + _name;
		}

		this.startProgress();																// start progressing

		//
		// Check same tenant name and set values
		//
		let	_pos = -1;
		this.tenantList.map( (item, pos) => {
			if(!r3IsEmptyString(item.name) && item.name == _name){
				// found
				_pos = pos;
			}
		});
		if(-1 == _pos){
			this.stopProgress();															// stop progressing

			_error = new Error('tenant name(' + _name + ') not found.');
			console.error(_error.message);
			_callback(_error);
			return;
		}

		//
		// Update local tenant
		//
		this.tenantList[_pos].display		= (r3IsEmptyString(display, true)		? _name						: r3IsEmptyString(display.trim(), true)		? _name						: display.trim());
		this.tenantList[_pos].description	= (r3IsEmptyString(description, true)	? ('Local Tenant ' + _name)	: r3IsEmptyString(description.trim(), true)	? ('Local Tenant ' + _name)	: description.trim());
		this.tenantList[_pos].users			= r3DeepClone(users);

		this.stopProgress();																// stop progressing

		_callback(null);
	}

	//
	// Delete Local Tenant
	//
	// name			: local tenant name
	// id			: local tenant id
	//
	deleteLocalTenant(name: string, id: string, callback: ErrorCallback): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}

		let	_callback	= callback;
		let	_error;
		if(r3IsEmptyString(name, true) || r3IsEmptyString(id, true)){
			_error = new Error('name(' + JSON.stringify(name) + ') or id(' + JSON.stringify(id) + ') parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}

		let	_name		= name.trim();
		if(0 !== _name.indexOf(localTenantPrefix)){
			_name = localTenantPrefix + _name;
		}

		this.startProgress();																// start progressing

		//
		// Check same tenant name
		//
		let	_pos = -1;
		this.tenantList.map( (item, pos) => {
			if(!r3IsEmptyString(item.name) && item.name == _name){
				// found
				_pos = pos;
			}
		});
		if(-1 == _pos){
			this.stopProgress();															// stop progressing
			_error = new Error('tenant name(' + _name + ') not found.');
			console.error(_error.message);
			_callback(_error);
			return;
		}

		//
		// Delete local tenant
		//
		this.tenantList.splice(_pos, 1);

		if(!r3IsEmptyEntityObject(this.demoData, _name)){
			delete this.demoData[_name];
		}

		this.stopProgress();																// stop progressing

		_callback(null);
	}

	//--------------------------------------------------
	// TREE LIST( Role / Resource / Policy Tree List )
	//--------------------------------------------------
	//
	// Common raw method : Get tree in tenant
	//
	rawGetChildTreeList(childArray: DemoTreeNode[], path: string | null, expand: boolean, callback: DataCallback<DemoTreeNode[]>): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}
		let	paths: string[]	= r3IsEmptyString(path) ? [] : path.split('/');
		let	_callback		= callback;
		let	_expand			= expand;
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

	rawGetTreeList(tenant: TenantData, service: string | null, type: ItemType, path: string | null, expand: boolean | null, callback: DataCallback<TreeListItem[]>): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}
		if(!isTenantData(tenant) || r3IsEmptyString(tenant.name)){
			const	error = new Error('type(' + JSON.stringify(type) + ') or tenant(' + JSON.stringify(tenant) + ') parameters are wrong.');
			console.error(error.message);
			callback(error, null);
			return;
		}
		if(!isItemType(type)){
			const	error = new Error('type(' + JSON.stringify(type) + ') or tenant(' + JSON.stringify(tenant) + ') parameters are wrong.');
			console.error(error.message);
			callback(error, null);
			return;
		}

		// check tenant name in demo data
		if(r3IsEmptyEntityObject(this.demoData, tenant.name)){
			const	error = new Error('Not found tenant: ' + tenant.display + '(' + tenant.name + ')');
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
			demoTenantData.forEach((element: DemoTreeNode) => {
				if(element.path === serviceType){
					element.children.forEach((serviceChild: DemoTreeNode) => {
						if(serviceChild.name === _service){
							serviceChild.children.forEach((serviceElement: DemoTreeNode) => {
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
	getRoleTreeList(tenant: TenantData, service: string | null, path: string | null, expand: boolean | null, callback: DataCallback<TreeListItem[]>): void
	{
		this.rawGetTreeList(tenant, service, roleType, path, expand, callback);
	}

	getResourceTreeList(tenant: TenantData, service: string | null, path: string | null, expand: boolean | null, callback: DataCallback<TreeListItem[]>): void
	{
		this.rawGetTreeList(tenant, service, resourceType, path, expand, callback);
	}

	getPolicyTreeList(tenant: TenantData, service: string | null, path: string | null, expand: boolean | null, callback: DataCallback<TreeListItem[]>): void
	{
		this.rawGetTreeList(tenant, service, policyType, path, expand, callback);
	}

	getServiceTreeList(tenant: TenantData, expand: boolean, callback: DataCallback<TreeListItem[]>): void
	{
		const _tenant	= tenant;
		const _expand	= expand;
		const _callback	= callback;

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
			if(!r3IsArray(serviceChildren) || !serviceChildren.every((item: unknown) => isTreeListItem(item))){
				console.info('SERVICE Tree list is something wrong.');

				this.stopProgress();														// stop progressing
				_callback(null, []);
				return;
			}

			//
			// Check each service for distributed
			//
			if(0 < serviceChildren.length){
				const _serviceChildren= serviceChildren;
				for(let cnt = 0; cnt < _serviceChildren.length; ++cnt){
					((pos: number) =>
					{
						if(r3IsEmptyStringObject(_serviceChildren[pos], 'name')){
							return;
						}
						this.rawGetTreeListInServiceTenant(_tenant, _serviceChildren[pos].name, _expand, (children, distributed) =>
						{
							_serviceChildren[pos].children		= children;
							_serviceChildren[pos].distributed	= distributed;

							if((pos + 1) === _serviceChildren.length){
								this.stopProgress();										// stop progressing
								_callback(null, _serviceChildren);
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

	rawGetTreeListInServiceTenant(tenant: TenantData, servicename: string, expand: boolean, callback: (children: TreeListItem[], distributed: boolean) => void): void
	{
		const	_tenant						= tenant;
		const	_servicename				= servicename;
		const	_expand						= expand;
		const	_callback					= callback;
		let		_children: TreeListItem[]	= [];
		let		_distributed				= false;

		if(!isTenantData(_tenant) || r3IsEmptyString(_tenant.name) || r3IsEmptyString(_servicename)){
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
			if(null !== error || !r3IsArray(roleChildren) || 0 === roleChildren.length){
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
				if(null !== error || !r3IsArray(resourceChildren) || 0 === resourceChildren.length){
					console.info('Could not get RESOURCE Tree list in SERVICE+TENANT by ' + r3GetSafeString(error?.message));
				}else{
					this.rawSetTreeListChildren(_children, resourceType, resourceChildren);
				}

				//
				// Get policy under service+tenant
				//
				this.getPolicyTreeList(_tenant, _servicename, null, _expand, (error, policyChildren) =>
				{
					if(null !== error || !r3IsArray(policyChildren) || 0 === policyChildren.length){
						console.info('Could not get POLICY Tree list in SERVICE+TENANT by ' + r3GetSafeString(error?.message));
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
	getAllTreeList(tenant: TenantData, callback: DataCallback<TreeListItem[]>): void
	{
		const _tenant	= tenant;
		const _callback	= callback;
		const _all		= this.getEmptyTreeList(true);

		if(!isTenantData(tenant) || r3IsEmptyString(tenant.name)){
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

	rawSetTreeListChildren(allTreeList: TreeListItem[], path: string, children: TreeListItem[]): boolean
	{
		if(!r3IsArray(allTreeList)){
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

	getEmptyTreeList(is_service: boolean): TreeListItem[]
	{
		const treeList: TreeListItem[] = [];

		if(r3IsBoolean(is_service) && is_service){
			treeList.push({
				name:		serviceType.toUpperCase(),
				path:		serviceType,
				children:	[]
			});
		}

		treeList.push({
			name:		roleType.toUpperCase(),
			path:		roleType,
			children:	[]
		});

		treeList.push({
			name:		resourceType.toUpperCase(),
			path:		resourceType,
			children:	[]
		});

		treeList.push({
			name:		policyType.toUpperCase(),
			path:		policyType,
			children:	[]
		});
		return treeList;
	}

	//
	// Select pattern(see: r3container.jsx)
	//
	selectTreeList(treeList: TreeListItem[], service: string | null, type: ItemType, path: string | null): boolean
	{
		if(!r3IsArray(treeList) || 0 === treeList.length){
			return false;
		}
		if(!isItemType(type)){
			return false;
		}

		if(r3CompareCaseString(serviceType, type)){
			//
			// This case is under SERVICE
			//
			if(r3IsString(path) && !r3IsEmptyString(path, true)){
				console.error('Wrong parameter: type is SERVICE but specified path(' + path + ')');
				return false;
			}

			// search 'SERVICE' top
			for(let cnt = 0; cnt < treeList.length; ++cnt){
				if(!isTreeListItem(treeList[cnt]) || r3IsEmptyString(treeList[cnt].path) || !r3CompareCaseString(serviceType, treeList[cnt].path)){
					continue;									// not target tree
				}
				// found 'path' == 'service'

				// case : select "SERVICE" top
				if(!r3IsString(service) || r3IsEmptyString(service, true)){
					treeList[cnt].selected = true;
					return true;								// finish
				}

				// search 'service name' top in children
				if(!r3IsArray(treeList[cnt].children) || 0 === treeList[cnt].children.length){
					continue;									// SERVICE does not have children
				}
				for(let cnt2 = 0; cnt2 < treeList[cnt].children.length; ++cnt2){
					if(isTreeListItem(treeList[cnt].children[cnt2]) && !r3IsEmptyString(treeList[cnt].children[cnt2].path) && r3CompareCaseString(service, treeList[cnt].children[cnt2].path)){
						// found 'path' == 'service name'
						treeList[cnt].children[cnt2].selected = true;
						return true;							// finish
					}
				}
			}

		}else if(r3CompareCaseString(roleType, type) || r3CompareCaseString(policyType, type) || r3CompareCaseString(resourceType, type)){
			//
			// Case : selected item under ROLE/POLICY/RESOURCE
			//
			let	fullPath: string = type;						// target path is 'ROLE or POLICY or RESOURCE' or 'ROLE or POLICY or RESOURCE'/path...
			if(r3IsString(path) && !r3IsEmptyString(path, true)){
				fullPath += '/' + path.trim();
			}

			if(r3IsString(service) && !r3IsEmptyString(service, true)){
				//
				// The case is under SERVICE
				//
				// search 'SERVICE' top
				for(let cnt = 0; cnt < treeList.length; ++cnt){
					if(!isTreeListItem(treeList[cnt]) || r3IsEmptyString(treeList[cnt].path) || !r3CompareCaseString(serviceType, treeList[cnt].path)){
						continue;								// not target tree
					}
					// found 'path' == 'service'

					// search 'service name' top in children
					if(!r3IsArray(treeList[cnt].children) || 0 === treeList[cnt].children.length){
						continue;								// SERVICE does not have children
					}
					for(let cnt2 = 0; cnt2 < treeList[cnt].children.length; ++cnt2){
						if(isTreeListItem(treeList[cnt].children[cnt2]) && r3IsEmptyString(treeList[cnt].children[cnt2].path) && r3CompareCaseString(service, treeList[cnt].children[cnt2].path)){
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

	selectSubTreeList(subTreeList: TreeListItem[], path: string): boolean
	{
		if(!r3IsArray(subTreeList) || 0 === subTreeList.length){
			return false;
		}
		if(r3IsEmptyString(path, true)){
			return false;
		}

		const pos						= path.indexOf('/');
		let	curPath						= path;
		let	childPath: string | null	= null;
		if(0 === pos){
			return false;
		}else if(0 < pos){
			curPath		= path.substring(0, pos);
			childPath	= path.substring(pos + 1);
		}

		// search current path top
		for(let cnt = 0; cnt < subTreeList.length; ++cnt){
			if(isTreeListItem(subTreeList[cnt]) && !r3IsEmptyString(subTreeList[cnt].name) && r3CompareCaseString(curPath, subTreeList[cnt].name)){
				// found 'name' == current path
				if(!r3IsString(childPath) || r3IsEmptyString(childPath, true)){
					subTreeList[cnt].selected = true;
					return true;									// finish
				}

				// search child path under current path in children
				if(!r3IsArray(subTreeList[cnt].children) || 0 === subTreeList[cnt].children.length){
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
	checkServiceOwnerInTreeList(treeList: TreeListItem[], service: string): boolean
	{
		if(!r3IsArray(treeList) || 0 === treeList.length || r3IsEmptyString(service, true)){
			return false;
		}
		const _service = service.trim();

		// search 'SERVICE' top
		for(let cnt = 0; cnt < treeList.length; ++cnt){
			if(!isTreeListItem(treeList[cnt]) || r3IsEmptyString(treeList[cnt].path) || !r3CompareCaseString(serviceType, treeList[cnt].path)){
				continue;									// not target tree
			}
			// search 'service name' top in children
			if(!r3IsArray(treeList[cnt].children) || 0 === treeList[cnt].children.length){
				continue;									// SERVICE does not have children
			}
			for(let cnt2 = 0; cnt2 < treeList[cnt].children.length; ++cnt2){
				if(isTreeListItem(treeList[cnt].children[cnt2]) && !r3IsEmptyString(treeList[cnt].children[cnt2].path) && r3CompareCaseString(_service, treeList[cnt].children[cnt2].path)){
					// found 'path' == 'service name'
					if(r3IsBoolean(treeList[cnt].children[cnt2].owner) && true === treeList[cnt].children[cnt2].owner){
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
	checkServiceTenantInTreeList(treeList: TreeListItem[], service: string): boolean
	{
		if(!r3IsArray(treeList) || 0 === treeList.length || r3IsEmptyString(service, true)){
			return false;
		}
		const _service = service.trim();

		// search 'SERVICE' top
		for(let cnt = 0; cnt < treeList.length; ++cnt){
			if(!isTreeListItem(treeList[cnt]) || r3IsEmptyString(treeList[cnt].path) || !r3CompareCaseString(serviceType, treeList[cnt].path)){
				continue;									// not target tree
			}
			// search 'service name' top in children
			if(!r3IsArray(treeList[cnt].children) || 0 === treeList[cnt].children.length){
				continue;									// SERVICE does not have children
			}
			for(let cnt2 = 0; cnt2 < treeList[cnt].children.length; ++cnt2){
				if(isTreeListItem(treeList[cnt].children[cnt2]) && !r3IsEmptyString(treeList[cnt].children[cnt2].path) && r3CompareCaseString(_service, treeList[cnt].children[cnt2].path)){
					// found 'path' == 'service name'
					if(r3IsArray(treeList[cnt].children[cnt2].children) && 0 < treeList[cnt].children[cnt2].children.length){
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
	getPathDetailInfo(tenant: TenantData | null, service: string | null, isServiceOwner: boolean, hasServiceTenant: boolean, type: ItemType | null, path: string | null): PathDetailInfo
	{
		let	_tenant: TenantData | null	= null;
		let	_service: string | null			= null;
		let	_serviceOwner					= false;
		let	_hasServiceTenant				= false;
		let	_type: ItemType | null			= null;
		let	_name: string | null			= null;
		let	_fullpath: string | null		= null;
		let	_currentpath: string | null		= null;
		let	_hasParent						= false;
		let	_canCreatePath					= false;
		let	_canCreateService				= false;

		if(isTenantData(tenant) && !r3IsEmptyString(tenant.name)){
			_tenant = tenant;

			if((isItemType(type) && serviceType === type) || (r3IsString(service) && !r3IsEmptyString(service))){
				// [SELECTED TENANT] > SERVICE
				_type = type;

				// under service
				if(!r3IsString(service) || r3IsEmptyString(service)){
					// [SELECTED TENANT] > SERVICE
					_fullpath			= 'yrn:yahoo::::service';
					_canCreateService	= true;

				}else if(isItemType(type) && (resourceType === type || roleType === type || policyType === type)){
					// [SELECTED TENANT] > SERVICE > service > ROLE/POLICY/RESOURCE
					_service			= service;
					_serviceOwner		= isServiceOwner;
					_fullpath			= 'yrn:yahoo:' + _service + '::' + _tenant.name + ':' + _type;
					_currentpath		= '';

					if(r3IsString(path) && !r3IsEmptyString(path)){
						// [SELECTED TENANT] > SERVICE > service > ROLE/POLICY/RESOURCE > path
						const splitedPath = path.split('/');
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

			}else if(isItemType(type) && (resourceType === type || roleType === type || policyType === type)){
				// [SELECTED TENANT] > ROLE/POLICY/RESOURCE
				_type			= type;
				_fullpath		= 'yrn:yahoo:::' + _tenant.name + ':' + _type;
				_currentpath	= '';

				if(!r3IsString(path) || r3IsEmptyString(path)){
					// [SELECTED TENANT] > ROLE/POLICY/RESOURCE
					_canCreatePath = true;
				}else{
					// [SELECTED TENANT] > ROLE/POLICY/RESOURCE > path
					const splitedPath	= path.split('/');
					if(1 < splitedPath.length){
						_hasParent	= true;
					}
					_name			= splitedPath[splitedPath.length - 1];
					_fullpath		+= ':' + path;
					_currentpath	= path;

					if(resourceType === type || roleType === type){
						_canCreatePath = true;
					}
				}
			}else{
				// [SELECTED TENANT]
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
	createEmptyData(tenant: TenantData, type: ItemType, path: string, callback: ErrorCallback): void
	{
		if(!isItemType(type)){
			const error = new Error('create empty data for unknown type(' + JSON.stringify(type) + ')');
			console.error(error.message);
			callback(error);
		}else if(roleType === type){
			this.createEmptyRoleData(tenant, path, callback);
		}else if(policyType === type){
			this.createEmptyPolicyData(tenant, path, callback);
		}else if(resourceType === type){
			this.createEmptyResourceData(tenant, path, callback);
		}else{
			const error = new Error('create empty data for unknown type(' + JSON.stringify(type) + ')');
			console.error(error.message);
			callback(error);
		}
	}

	removeData(tenant: TenantData, type: ItemType, path: string, callback: ErrorCallback): void
	{
		if(!isItemType(type)){
			const error = new Error('remove data for unknown type(' + JSON.stringify(type) + ')');
			console.error(error.message);
			callback(error);
		}else if(roleType === type){
			this.removeRoleData(tenant, path, callback);
		}else if(policyType === type){
			this.removePolicyData(tenant, path, callback);
		}else if(resourceType === type){
			this.removeResourceData(tenant, path, callback);
		}else{
			const error = new Error('remove data for unknown type(' + JSON.stringify(type) + ')');
			console.error(error.message);
			callback(error);
		}
	}

	updateData(tenant: TenantData, type: ItemType, path: string, data: RoleData | PolicyData | ResourceData, callback: ErrorCallback): void
	{
		if(!isItemType(type)){
			const error = new Error('update data for unknown type(' + JSON.stringify(type) + ')');
			console.error(error.message);
			callback(error);

		}else if(roleType === type && isRoleData(data)){
			this.updateRoleData(tenant, path, data, true, callback);

		}else if(policyType === type && isPolicyData(data)){
			this.updatePolicyData(tenant, path, data, callback);

		}else if(resourceType === type && isResourceData(data)){
			this.updateResourceData(tenant, path, data, callback);

		}else{
			const error = new Error('update data for unknown type(' + JSON.stringify(type) + ')');
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
	getServiceData(tenant: TenantData, servicename: string, callback: DataCallback<ServiceData>): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}
		const _callback	= callback;
		if(!isTenantData(tenant) || !r3IsString(servicename) || r3IsEmptyString(servicename, true)){
			const _error = new Error('tenant(' + JSON.stringify(tenant) + ') or service(' + JSON.stringify(servicename) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error, null);
			return;
		}

		let demoTenantData				= this.demoData[tenant.name];
		let	_servicename				= servicename;
		let	result: ServiceData | null	= null;
		demoTenantData.forEach((element: DemoTreeNode) => {
			if(element.path === serviceType){
				element.children.forEach((serviceChild: DemoTreeNode) => {
					if(serviceChild.name === _servicename){
						let	tenants: string[]								= [];
						let	verify: string | ServiceResourceObject[] | null	= null;
						if(r3IsStringArray(serviceChild?.tenant)){
							tenants = r3DeepClone(serviceChild.tenant);
						}
						if(r3IsString(serviceChild?.verify)){
							verify = serviceChild.verify;
						}else if(isServiceResourceObjectArray(serviceChild?.verify)){
							verify = serviceChild.verify;
						}
						result = {
							tenant:		tenants,
							verify:		verify
						};
					}
				});
			}
		});
		if(null === result){
			const _error = new Error('tenant(' + JSON.stringify(tenant) + ') and service(' + JSON.stringify(servicename) + ') does not have service data.');
			console.error(_error.message);
			_callback(_error, null);
			return;
		}
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
	updateServiceData(tenant: TenantData, servicename: string, tenants: string[] | string | null | undefined, clear_tenant: boolean, verify: string | ServiceResourceObject[] | null, callback: ErrorCallback): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}
		const _callback = callback;

		if(!isTenantData(tenant) || r3IsEmptyString(tenant.name, true) || !r3IsString(servicename) || r3IsEmptyString(servicename, true)){
			const _error = new Error('tenant(' + JSON.stringify(tenant) + ') or service(' + JSON.stringify(servicename) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}
		let 	demoTenantData				= this.demoData[tenant.name];
		const	_service					= servicename.trim();
		let		_tenants: string[] | null	= null;
		let		_is_clear					= false;
		let		_verify: string | null		= null;

		if(undefined !== tenants){
			if(r3IsBoolean(clear_tenant) && true === clear_tenant){
				_is_clear = true;
			}
			if(r3IsStringArray(tenants) && 0 < tenants.length){
				_tenants = tenants;
			}else if(r3IsString(tenants) && !r3IsEmptyString(tenants)){
				_tenants = [tenants];
			}
		}
		if(r3IsString(verify)){
			_verify = verify;
		}else if(isServiceResourceObjectArray(verify)){
			_verify = JSON.stringify(verify);
		}
		if(null === _tenants && false === _is_clear && null === _verify){
			const _error = new Error('Nothing to update for service');
			console.error(_error.message);
			_callback(_error);
			return;
		}

		this.startProgress();																// start progressing

		let	isUpdated				= false;
		let	oldTenants: string[]	= [];
		demoTenantData.forEach((element: DemoTreeNode) => {
			if(element.path === serviceType){
				element.children.forEach((serviceChild: DemoTreeNode) => {
					if(serviceChild.name === _service){
						// Found same service -> update it
						if(r3IsStringArray(serviceChild?.tenant)){
							oldTenants			= r3DeepClone(serviceChild.tenant);
						}
						if(_is_clear){
							serviceChild.tenant = [];
						}
						if(null !== _tenants && r3IsStringArray(serviceChild?.tenant)){
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
			let newservice: DemoTreeNode = {
				name:			_service,
				path:			_service,
				children:		[],
				owner:			true,
				distributed:	false,
				tenant:			(null === _tenants ? [] : r3DeepClone(tenants)),
				verify:			_verify
			};
			demoTenantData.forEach((element) => {
				if(element.path === serviceType){
					element.children.push(newservice);
				}
			});
		}

		if(!r3IsArray(_tenants)){
			_tenants = [];
		}

		let	needRemoveTenants	= oldTenants.filter(oldTenant => _tenants.indexOf(oldTenant) === -1);
		let	needAddTenants		= _tenants.filter(newTenant => oldTenants.indexOf(newTenant) === -1);
		let	regpath				= /^yrn:yahoo:::(.*)$/;

		// remove service from tenant that has been incorporated
		needRemoveTenants.forEach((tenantname) => {
			let	matches = tenantname.match(regpath);
			if(r3IsArray(matches) && 2 == matches.length){
				let	_tenant = matches[1];
				if(!r3IsEmptyEntityObject(this.demoData, _tenant)){
					this.demoData[_tenant].forEach((element) => {
						if(element.path === serviceType){
							let	removePos = -1;
							element.children.forEach((serviceChild: DemoTreeNode, pos: number) => {
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
			if(r3IsArray(matches) && 2 == matches.length){
				let	_tenant = matches[1];
				if(!r3IsEmptyEntityObject(this.demoData, _tenant)){
					this.demoData[_tenant].forEach((element: DemoTreeNode) => {
						if(element.path === serviceType){
							let	found = false;
							element.children.forEach((serviceChild: DemoTreeNode) => {
								if(serviceChild.name === _service){
									// Found service -> nothing to do
									found = true;
								}
							});
							if(!found){
								let newService: DemoTreeNode = {
									name:			_service,
									path:			_service,
									children:		[],
									owner:			false,
									distributed:	false
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
	createInitializedService(tenant: TenantData, servicename: string, verify: string, callback: ErrorCallback): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}
		const _callback = callback;
		if(!isTenantData(tenant) || r3IsEmptyString(tenant.name, true) || !r3IsString(servicename) || r3IsEmptyString(servicename, true) || !r3IsString(verify) || r3IsEmptyString(verify)){
			const _error = new Error('tenant(' + JSON.stringify(tenant) + ') or service(' + JSON.stringify(servicename) + ') or verify(' + JSON.stringify(verify) + ') parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}

		let	_service				= servicename.trim();
		let	_verify					= verify.trim();
		let	_errmsg: string | null	= null;
		Object.keys(this.demoData).forEach((key) => {
			this.demoData[key].forEach((element: DemoTreeNode) => {
				if(element.path === serviceType){
					element.children.forEach((serviceChild: DemoTreeNode) => {
						if(serviceChild.name === _service){
							// Found same service name
							_errmsg = 'tenant(' + JSON.stringify(key) + ') has already same name service(' + JSON.stringify(_service) + ').';
						}
					});
				}
			});
		});
		if(r3IsString(_errmsg)){
			const _error = new Error(_errmsg);
			console.error(_error.message);
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
	removeService(tenant: TenantData, servicename: string, isServiceTenant: boolean, callback: ErrorCallback): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}
		const _callback = callback;

		if(!isTenantData(tenant) || r3IsEmptyString(tenant.name, true) || !r3IsString(servicename) || r3IsEmptyString(servicename, true) || r3IsEmptyEntityObject(this.demoData, tenant.name)){
			const _error = new Error('tenant(' + JSON.stringify(tenant) + ') or service(' + JSON.stringify(servicename) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}
		this.startProgress();																// start progressing

		let demoTenantData	= this.demoData[tenant.name];
		let	_service		= servicename.trim();

		demoTenantData.forEach((element: DemoTreeNode) => {
			if(element.path === serviceType){
				let	removePos = -1;
				element.children.forEach((serviceChild: DemoTreeNode, pos: number) => {
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

	removeAllServiceTenant(servicename: string): boolean
	{
		if(!r3IsString(servicename) || r3IsEmptyString(servicename, true)){
			console.error('service name' + JSON.stringify(servicename) + ' parameter is wrong.');
			return false;
		}
		this.startProgress();																// start progressing

		let	_service		= servicename.trim();
		Object.keys(this.demoData).forEach((key) => {
			this.demoData[key].forEach((element: DemoTreeNode) => {
				if(element.path === serviceType){
					let	removePos = -1;
					element.children.forEach((serviceChild: DemoTreeNode, pos: number) => {
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
	getErrorServiceResourceVerify(serviceResource: StaticResourceObject[] | string): string | null
	{
		const	checkResult				= checkServiceResourceValue(serviceResource);
		let		result: string | null	= null;
		if(r3IsString(checkResult.error)){
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
	createServiceTenant(tenant: TenantData, servicename: string, role: string | null, callback: ErrorCallback): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}
		const _callback	= callback;
		if(!isTenantData(tenant) || r3IsEmptyString(tenant.name, true) || !r3IsString(servicename) || r3IsEmptyString(servicename, true) || r3IsEmptyEntityObject(this.demoData, tenant.name)){
			const _error = new Error('tenant(' + JSON.stringify(tenant) + ') or service(' + JSON.stringify(servicename) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}
		let demoTenantData			= this.demoData[tenant.name];
		let	_service				= servicename.trim();
		let	_role: string			= r3IsString(role) ? role.trim() : '';

		// check service tenant
		demoTenantData.forEach((element: DemoTreeNode) => {
			if(element.path === serviceType){
				element.children.forEach((serviceChild: DemoTreeNode, pos: number) => {
					if(serviceChild.name === _service){
						// Found service
						if(0 !== serviceChild.children.length){
							// Already cooperate service
							console.info('Already tenant(' + JSON.stringify(tenant) + ') has cooperated service(' + JSON.stringify(_service) + '), so overwrite those because of the demonstration application.');
							serviceChild.distributed	= false;
							serviceChild.children		= [];
						}else{
							// initializing
							serviceChild.distributed	= false;
							serviceChild.children		= [];
						}
					}
				});
			}
		});

		this.startProgress();																// start progressing

		// Add service with all new data
		let serviceTenantChildren: DemoTreeNode[] = [
			{
				name:	'ROLE',
				path:	roleType,
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
				path:	resourceType,
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
				path:	policyType,
				children: [
					{
						name:		'acr-policy',
						path:		'acr-policy',
						children:	[],
						effect:		effectValueAllow,
						action: [
							actionValueRead
						],
						resource: [
							'yrn:yahoo:' + _service + '::' + tenant.name + ':resource:' + _service + '-resource'
						],
						alias:		[]
					}
				]
			}
		];

		demoTenantData.forEach((element: DemoTreeNode) => {
			if(element.path === serviceType){
				let	found = false;
				element.children.forEach((serviceChild: DemoTreeNode, pos: number) => {
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

		if(!r3IsEmptyString(_role, true)){
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
	setServiceTenantRoleAlias(tenant: TenantData, servicename: string, role: string, callback: ErrorCallback): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}
		const _callback = callback;
		if(!isTenantData(tenant) || r3IsEmptyString(tenant.name) || r3IsEmptyString(servicename, true) || r3IsEmptyString(role, true)){
			const _error = new Error('tenant(' + JSON.stringify(tenant) + ') or service(' + JSON.stringify(servicename) + ') or role(' + JSON.stringify(role) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}

		//
		// get role data
		//
		const _tenant	= tenant;
		const _service	= servicename.trim();
		const _role		= role.trim();

		this.startProgress();																// start progressing

		this.getRoleData(_tenant, null, _role, false, (error: FetchError | null, roledata: valTypeAllObject) =>
		{
			if(null !== error){
				console.error(error.message);
				this.stopProgress();														// stop progressing
				_callback(error);
				return;
			}
			if(!isRoleData(roledata)){
				const err = new Error('Could not get role data for tenant(' + _tenant.name + '), path(' + _role + ')');
				console.error(err.message);
				this.stopProgress();														// stop progressing
				_callback(err);
				return;
			}

			//
			// SERVICE+TENANT ROLE path
			// ( yrn:yahoo:<service name>::<tenant name>:role:acr-role )
			//
			const _service_tenant_role = 'yrn:yahoo:' + _service + '::' + _tenant.name + ':role:acr-role';

			// add alias to service
			const aliases: string[] = [];
			if(r3IsStringArray(roledata.aliases)){
				for(let cnt = 0; cnt < roledata.aliases.length; ++cnt){
					if(r3CompareCaseString(roledata.aliases[cnt], _service_tenant_role)){
						// already has role in alias
						this.stopProgress();													// stop progressing
						_callback(null);
						return;
					}
				}
			}
			roledata.aliases.push(_service_tenant_role);

			//
			// update role for alias
			//
			this.updateRoleData(_tenant, _role, roledata, false, (error: FetchError | null) =>
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
	cvtDemoTreeNodeToRoleData(roleDemo: DemoTreeNode): RoleData | null
	{
		if(!r3IsObject(roleDemo)){
			return null;
		}

		let	_policies: string[]			= [];
		let	_aliases: string[] | null	= null;
		let	_hosts: RoleHostList | null	= null;

		if(!r3IsEmptyEntityObject(roleDemo, 'policies') && r3IsStringArray(roleDemo.policies)){
			_policies = r3DeepClone(roleDemo.policies);
		}
		if(!r3IsEmptyEntityObject(roleDemo, 'aliases') && r3IsStringArray(roleDemo.aliases)){
			_aliases = r3DeepClone(roleDemo.aliases);
		}
		if(!r3IsEmptyEntityObject(roleDemo, 'hosts') && isRoleHostList(roleDemo.hosts)){
			_hosts = r3DeepClone(roleDemo.hosts);
		}

		let	_role: RoleData = {
			policies:	_policies
		};
		if(null !== _aliases){
			_role.aliases = r3DeepClone(_aliases);
		}
		if(null !== _hosts){
			_role.hosts = r3DeepClone(_hosts);
		}
		return _role;
	}

	rawGetRoleDataClone(roleArray: DemoTreeNode[], path: string, isRemove: boolean): DemoTreeNode | null
	{
		if(!r3IsString(path) || r3IsEmptyString(path)){
			return null;
		}
		let	paths = path.split('/');
		if(0 === paths.length){
			return null;
		}
		if(!r3IsBoolean(isRemove)){
			isRemove = false;
		}

		let	_role: DemoTreeNode | null	= null;
		let	removePos					= -1;
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

	rawSetRoleData(roleArray: DemoTreeNode[], path: string, data: DemoTreeNode): boolean
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

	getRoleData(tenant: TenantData, service: string | null, path: string, expand: boolean, callback: DataCallback<RoleData>): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}
		const _callback = callback;
		if(!isTenantData(tenant) || r3IsEmptyString(tenant.name, true) || !r3IsString(path) || r3IsEmptyString(path, true) || r3IsEmptyEntityObject(this.demoData, tenant.name)){
			const _error = new Error('tenant(' + JSON.stringify(tenant) + ') or path(' + JSON.stringify(path) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error, null);
			return;
		}

		this.startProgress();																// start progressing

		let demoTenantData					= this.demoData[tenant.name];
		let	_service						= service;
		let	_path							= path.trim();
		let	_expand							= expand;										// Not use this value in this demo data.
		let	_roleDemo: DemoTreeNode | null	= null;

		// search role
		if(r3IsString(_service) && !r3IsEmptyString(_service)){
			demoTenantData.forEach((element: DemoTreeNode) => {
				if(element.path === serviceType){
					element.children.forEach((serviceChild: DemoTreeNode) => {
						if(serviceChild.name === _service){
							// Found service
							serviceChild.children.forEach((serviceElement: DemoTreeNode) => {
								if(serviceElement.path === roleType){
									_roleDemo = this.rawGetRoleDataClone(serviceElement.children, _path, false);
								}
							});
						}
					});
				}
			});
		}else{
			demoTenantData.forEach((element) => {
				if(element.path === roleType){
					_roleDemo = this.rawGetRoleDataClone(element.children, _path, false);
				}
			});
		}
		if(null === _roleDemo){
			this.stopProgress();															// stop progressing
			const _error = new Error('not found role(' + JSON.stringify(_path) + ') in tenant(' + JSON.stringify(tenant) + ').');
			console.error(_error.message);
			_callback(_error, null);
			return;
		}

		// convert
		let	_role: RoleData | null = this.cvtDemoTreeNodeToRoleData(_roleDemo);
		if(!isRoleData(_role)){
			this.stopProgress();															// stop progressing
			const _error = new Error('not found role(' + JSON.stringify(_path) + ') in tenant(' + JSON.stringify(tenant) + ').');
			console.error(_error.message);
			_callback(_error, null);
			return;
		}

		this.stopProgress();																// stop progressing
		_callback(null, _role);
	}

	//
	// Update Role data
	//
	updateRoleData(tenant: TenantData, path: string, data: RoleData, isOWHosts: boolean, callback: ErrorCallback): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}
		const _callback	= callback;
		const _isow		= r3IsBoolean(isOWHosts) ? isOWHosts : false;
		if(!isTenantData(tenant) || r3IsEmptyString(tenant.name) || r3IsEmptyString(path, true) || r3IsEmptyEntityObject(this.demoData, tenant.name)){
			const _error = new Error('tenant(' + JSON.stringify(tenant) + ') or path(' + JSON.stringify(path) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}

		this.startProgress();																// start progressing

		// get base role
		let demoTenantData: DemoTreeNode[]	= this.demoData[tenant.name];
		let	_path							= path.trim();
		let	_role: DemoTreeNode | null		= null;

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
		if(isRoleData(data)){
			if(r3IsStringArray(data.policies)){
				_role.policies	= r3DeepClone(data.policies);
			}
			if(r3IsStringArray(data.aliases)){
				_role.aliases	= r3DeepClone(data.aliases);
			}
			if(_isow){
				if(isRoleHostList(data.hosts)){
					if(r3IsObject(_role?.hosts) && r3IsStringArray(_role.hosts.hostnames) && r3IsStringArray(data.hosts.hostnames) && 0 < data.hosts.hostnames.length){
						_role.hosts.hostnames	= r3DeepClone(data.hosts.hostnames);
					}
					if(r3IsObject(_role?.hosts) && r3IsStringArray(_role.hosts.ips) && r3IsStringArray(data.hosts.ips) && 0 < data.hosts.ips.length){
						_role.hosts.ips			= r3DeepClone(data.hosts.ips);
					}
				}
			}else{
				if(isRoleHostList(data.hosts)){
					if(r3IsStringArray(data.hosts.hostnames) && 0 < data.hosts.hostnames.length){
						let _hostnames			= data.hosts.hostnames.concat(data.hosts.hostnames);
						data.hosts.hostnames	= Array.from(new Set(_hostnames));			// Remove duplicate values
					}
					if(r3IsStringArray(data.hosts.ips) && 0 < data.hosts.ips.length){
						let _ips				= data.hosts.ips.concat(data.hosts.ips);
						data.hosts.ips			= Array.from(new Set(_ips));				// Remove duplicate values
					}
				}
			}
		}

		// set role
		let	_error2: Error | null = null;
		demoTenantData.forEach((element) => {
			if(element.path === roleType){
				if(!this.rawSetRoleData(element.children, _path, _role)){
					_error2 = new Error('could not set role(' + JSON.stringify(_path) + ').');
					console.error(_error2.message);
				}
			}
		});
		this.stopProgress();																// stop progressing
		_callback(_error2);
	}

	//
	// Create Empty Role data
	//
	createEmptyRoleData(tenant: TenantData, path: string, callback: ErrorCallback): void
	{
		return this.updateRoleData(tenant, path, null, true, callback);
	}

	//
	// Remove Role data
	//
	removeRoleData(tenant: TenantData, path: string, callback: ErrorCallback): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}
		const _callback = callback;
		if(!isTenantData(tenant) || r3IsEmptyString(tenant.name, true) || !r3IsString(path) || r3IsEmptyString(path, true) || r3IsEmptyEntityObject(this.demoData, tenant.name)){
			const _error = new Error('tenant(' + JSON.stringify(tenant) + ') or path(' + JSON.stringify(path) + ')  parameters are wrong.');
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
	cvtDemoTreeNodeToPolicyData(policyDemo: DemoTreeNode): PolicyData | null
	{
		if(!r3IsObject(policyDemo)){
			return null;
		}

		let	_name:		string				= '';
		let	_effect:	PolicyEffectType	= effectValueAllow;
		let	_action:	PolicyActionType[]	= [];
		let	_resource:	string[]			= [];
		let	_alias:		string[]			= [];

		if(!r3IsEmptyEntityObject(policyDemo, 'name') && r3IsString(policyDemo.name) && !r3IsEmptyString(policyDemo.name)){
			_name = policyDemo.name;
		}else{
			return null;
		}
		if(!r3IsEmptyEntityObject(policyDemo, 'effect') && r3IsString(policyDemo.effect) && isPolicyEffectType(policyDemo.effect)){
			_effect = policyDemo.effect;
		}else{
			return null;
		}
		if(r3IsArray(policyDemo?.action) && policyDemo.action.every((item: unknown) => isPolicyActionType(item))){
			_action = r3DeepClone(policyDemo.action);
		}else{
			return null;
		}
		if(!r3IsEmptyEntityObject(policyDemo, 'resource') && r3IsStringArray(policyDemo.resource)){
			_resource = r3DeepClone(policyDemo.resource);
		}
		if(!r3IsEmptyEntityObject(policyDemo, 'alias') && r3IsStringArray(policyDemo.alias)){
			_alias = r3DeepClone(policyDemo.alias);
		}

		let	_policy: PolicyData = {
			name:		_name,
			effect:		_effect,
			action:		_action,
			resource:	_resource,
			alias:		_alias
		};
		return _policy;
	}

	rawGetPolicyDataClone(policyArray: DemoTreeNode[], path: string, isRemove: boolean): DemoTreeNode | null
	{
		if(!r3IsString(path) || r3IsEmptyString(path)){
			return null;
		}
		if(!r3IsBoolean(isRemove)){
			isRemove = false;
		}

		let	_policy: DemoTreeNode | null	= null;
		let	removePos						= -1;
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

	rawSetPolicyData(policyArray: DemoTreeNode[], path: string, data: DemoTreeNode): boolean
	{
		if(!r3IsString(path) || r3IsEmptyString(path)){
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

	getPolicyData(tenant: TenantData, service: string | null, path: string, callback: DataCallback<PolicyData>): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}
		const _callback = callback;
		if(!isTenantData(tenant) || r3IsEmptyString(tenant.name, true) || !r3IsString(path) || r3IsEmptyString(path, true) || r3IsEmptyEntityObject(this.demoData, tenant.name)){
			const _error = new Error('tenant(' + JSON.stringify(tenant) + ') or path(' + JSON.stringify(path) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error, null);
			return;
		}

		this.startProgress();																// start progressing

		let demoTenantData						= this.demoData[tenant.name];
		let	_service							= service;
		let	_path								= path.trim();
		let	_policyDemo: DemoTreeNode | null	= null;

		// search policy
		if(r3IsString(_service) && !r3IsEmptyString(_service)){
			demoTenantData.forEach((element: DemoTreeNode) => {
				if(element.path === serviceType){
					element.children.forEach((serviceChild: DemoTreeNode) => {
						if(serviceChild.name === _service){
							// Found service
							serviceChild.children.forEach((serviceElement: DemoTreeNode) => {
								if(serviceElement.path === policyType){
									_policyDemo = this.rawGetPolicyDataClone(serviceElement.children, _path, false);
								}
							});
						}
					});
				}
			});
		}else{
			demoTenantData.forEach((element) => {
				if(element.path === policyType){
					_policyDemo = this.rawGetPolicyDataClone(element.children, _path, false);
				}
			});
		}
		if(null === _policyDemo){
			const _error = new Error('not found policy(' + JSON.stringify(_path) + ') in tenant(' + JSON.stringify(tenant) + ').');
			console.error(_error.message);
			this.stopProgress();															// stop progressing
			_callback(_error, null);
			return;
		}

		// convert
		let	_policy: PolicyData | null = this.cvtDemoTreeNodeToPolicyData(_policyDemo);
		if(!isPolicyData(_policy)){
			const _error = new Error('not found role(' + JSON.stringify(_path) + ') in tenant(' + JSON.stringify(tenant) + ').');
			console.error(_error.message);
			this.stopProgress();															// stop progressing
			_callback(_error, null);
			return;
		}

		this.stopProgress();																// stop progressing
		_callback(null, _policy);
	}

	//
	// Update Policy data
	//
	updatePolicyData(tenant: TenantData, path: string, data: PolicyData, callback: ErrorCallback): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}
		const _callback	= callback;
		if(!isTenantData(tenant) || r3IsEmptyString(tenant.name, true) || !r3IsString(path) || r3IsEmptyString(path, true) || r3IsEmptyEntityObject(this.demoData, tenant.name)){
			const _error = new Error('tenant(' + JSON.stringify(tenant) + ') or path(' + JSON.stringify(path) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}

		this.startProgress();																// start progressing

		// get base policy
		let demoTenantData					= this.demoData[tenant.name];
		let	_path							= path.trim();
		let	_policy: DemoTreeNode | null	= null;

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
				effect:			effectValueAllow,
				action: [
					actionValueRead,
					actionValueWrite
				],
				resource:		[],
				alias:			[]
			};
		}

		// make new policy
		if(isPolicyData(data)){
			if(isPolicyEffectType(data.effect)){
				_policy.effect		= r3DeepClone(data.effect);
			}
			if(isPolicyActionTypeArray(data.action)){
				_policy.action		= r3DeepClone(data.action);
			}
			if(r3IsStringArray(data.resource)){
				_policy.resource	= r3DeepClone(data.resource);
			}
			if(r3IsStringArray(data.alias)){
				_policy.alias		= r3DeepClone(data.alias);
			}
		}

		// set policy
		let	_error2: Error | null = null;
		demoTenantData.forEach((element) => {
			if(element.path === policyType){
				if(!this.rawSetPolicyData(element.children, _path, _policy)){
					_error2 = new Error('could not set policy(' + JSON.stringify(_path) + ').');
					console.error(_error2.message);
				}
			}
		});
		this.stopProgress();																// stop progressing
		_callback(_error2);
	}

	//
	// Create Empty Policy data
	//
	createEmptyPolicyData(tenant: TenantData, path: string, callback: ErrorCallback): void
	{
		// default	action is read('yrn:yahoo::::action:read');
		//			effect is allow
		//
		// [NOTE]
		// The name member in PolicyData is not used, but the path parameter is used instead of it.
		//
		return this.updatePolicyData(tenant, path, { name: '', action: [actionValueRead], effect: effectValueAllow, resource: [], alias: [] }, callback);
	}

	//
	// Remove Policy data
	//
	removePolicyData(tenant: TenantData, path: string, callback: ErrorCallback): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}

		const _callback	= callback;
		if(!isTenantData(tenant) || r3IsEmptyString(tenant.name, true) || !r3IsString(path) || r3IsEmptyString(path, true) || r3IsEmptyEntityObject(this.demoData, tenant.name)){
			const _error = new Error('tenant(' + JSON.stringify(tenant) + ') or path(' + JSON.stringify(path) + ')  parameters are wrong.');
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
	cvtDemoTreeNodeToResourceData(resourceDemo: DemoTreeNode): ResourceData | null
	{
		if(!r3IsObject(resourceDemo)){
			return null;
		}

		let	_valString: string | null			= null;
		let	_valObject: valTypeAllObject | null	= null;
		let	_valKeys: valTypeAllObject | null	= null;
		let	_valExpire: number | null			= null;
		let	_valAliases: string[] | null		= null;

		if(!r3IsEmptyEntityObject(resourceDemo, 'string') && r3IsString(resourceDemo.string)){
			_valString = resourceDemo.string;
		}
		if(!r3IsEmptyEntityObject(resourceDemo, 'object') && r3IsObject(resourceDemo.object)){
			_valObject = r3DeepClone(resourceDemo.object);
		}
		if(!r3IsEmptyEntityObject(resourceDemo, 'keys') && r3IsObject(resourceDemo.keys)){
			_valKeys = r3DeepClone(resourceDemo.keys);
		}
		if(!r3IsEmptyEntityObject(resourceDemo, 'expire') && r3IsNumber(resourceDemo.expire)){
			_valExpire = resourceDemo.expire;
		}
		if(!r3IsEmptyEntityObject(resourceDemo, 'aliases') && r3IsStringArray(resourceDemo.aliases)){
			_valAliases = r3DeepClone(resourceDemo.aliases);
		}

		let	_resource: ResourceData = {};
		if(null !== _valString){
			_resource.string	= _valString;
		}
		if(null !== _valObject){
			_resource.object	= r3DeepClone(_valObject);
		}
		if(null !== _valKeys){
			_resource.keys		= r3DeepClone(_valKeys);
		}
		if(null !== _valExpire){
			_resource.expire	= _valExpire;
		}
		if(null !== _valAliases){
			_resource.aliases	= r3DeepClone(_valAliases);
		}
		return _resource;
	}

	rawGetResourceDataClone(resourceArray: DemoTreeNode[], path: string, isRemove: boolean): DemoTreeNode | null
	{
		if(!r3IsString(path) || r3IsEmptyString(path)){
			return null;
		}
		let	paths = path.split('/');
		if(0 === paths.length){
			return null;
		}
		if(!r3IsBoolean(isRemove)){
			isRemove = false;
		}

		let	_resource: DemoTreeNode | null	= null;
		let	removePos						= -1;
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

	rawSetResourceData(resourceArray: DemoTreeNode[], path: string, data: DemoTreeNode): boolean
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

	getResourceData(tenant: TenantData, service: string | null, path: string, expand: boolean, callback: DataCallback<ResourceData>): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}
		const _callback	= callback;
		if(!isTenantData(tenant) || r3IsEmptyString(tenant.name, true) || !r3IsString(path) || r3IsEmptyString(path, true) || r3IsEmptyEntityObject(this.demoData, tenant.name)){
			const _error = new Error('tenant(' + JSON.stringify(tenant) + ') or path(' + JSON.stringify(path) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error, null);
			return;
		}

		this.startProgress();																// start progressing

		let demoTenantData						= this.demoData[tenant.name];
		let	_service							= service;
		let	_path								= path.trim();
		let	_expand								= expand;
		let	_resourceDemo: DemoTreeNode | null	= null;

		// search resource
		if(r3IsString(_service) && !r3IsEmptyString(_service)){
			demoTenantData.forEach((element: DemoTreeNode) => {
				if(element.path === serviceType){
					element.children.forEach((serviceChild: DemoTreeNode) => {
						if(serviceChild.name === _service){
							// Found service
							serviceChild.children.forEach((serviceElement: DemoTreeNode) => {
								if(serviceElement.path === resourceType){
									_resourceDemo = this.rawGetResourceDataClone(serviceElement.children, _path, false);
								}
							});
						}
					});
				}
			});
		}else{
			demoTenantData.forEach((element) => {
				if(element.path === resourceType){
					_resourceDemo = this.rawGetResourceDataClone(element.children, _path, false);
				}
			});
		}
		if(null === _resourceDemo){
			const _error = new Error('not found resource(' + JSON.stringify(_path) + ') in tenant(' + JSON.stringify(tenant) + ').');
			console.error(_error.message);
			this.stopProgress();															// stop progressing
			_callback(_error, null);
			return;
		}

		let	_resource: ResourceData | null = this.cvtDemoTreeNodeToResourceData(_resourceDemo);
		if(!isResourceData(_resource)){
			const _error = new Error('not found resource(' + JSON.stringify(_path) + ') in tenant(' + JSON.stringify(tenant) + ').');
			console.error(_error.message);
			this.stopProgress();															// stop progressing
			_callback(_error, null);
			return;
		}

		this.stopProgress();																// stop progressing
		_callback(null, _resource);
	}

	//
	// Update Resource data
	//
	updateResourceData(tenant: TenantData, path: string, data: ResourceData, callback: ErrorCallback): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}
		const _callback	= callback;
		if(!isTenantData(tenant) || r3IsEmptyString(tenant.name, true) || !r3IsString(path) || r3IsEmptyString(path, true) || r3IsEmptyEntityObject(this.demoData, tenant.name)){
			const _error = new Error('tenant(' + JSON.stringify(tenant) + ') or path(' + JSON.stringify(path) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}

		this.startProgress();																// start progressing

		// get base resource
		let demoTenantData					= this.demoData[tenant.name];
		let	_path							= path.trim();
		let	_resource: DemoTreeNode | null	= null;

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
		if(isResourceData(data)){
			if(null === data.string || r3IsString(data.string)){
				_resource.string	= data.string;
			}
			if(null === data.object || r3IsObject(data.object)){
				_resource.object	= r3DeepClone(data.object);
			}
			if(r3IsObject(data.keys)){
				_resource.keys		= r3DeepClone(data.keys);
			}
			if(r3IsNumber(data.expire)){
				_resource.expire	= data.expire;
			}
			if(r3IsStringArray(data.aliases)){
				_resource.aliases	= r3DeepClone(data.aliases);
			}
		}

		// set resource
		let	_error2: Error | null = null;
		demoTenantData.forEach((element) => {
			if(element.path === resourceType){
				if(!this.rawSetResourceData(element.children, _path, _resource)){
					_error2 = new Error('could not set resource(' + JSON.stringify(_path) + ').');
					console.error(_error2.message);
				}
			}
		});
		this.stopProgress();																// stop progressing
		_callback(_error2);
	}

	//
	// Create Empty Resource data
	//
	createEmptyResourceData(tenant: TenantData, path: string, callback: ErrorCallback): void
	{
		return this.updateResourceData(tenant, path, null, callback);
	}

	//
	// Remove Resource data
	//
	removeResourceData(tenant: TenantData, path: string, callback: ErrorCallback): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}
		const _callback	= callback;
		if(!isTenantData(tenant) || r3IsEmptyString(tenant.name, true) || !r3IsString(path) || r3IsEmptyString(path, true) || r3IsEmptyEntityObject(this.demoData, tenant.name)){
			const _error = new Error('tenant(' + JSON.stringify(tenant) + ') or path(' + JSON.stringify(path) + ')  parameters are wrong.');
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
	getNewRoleToken(tenant: TenantData, role: string, expire: number | null, callback: DataCallback<RoleTokenPrimitiveInfo>): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}
		const _callback	= callback;
		if(!isTenantData(tenant) || r3IsEmptyString(tenant.name, true) || r3IsEmptyString(role, true) || (null !== expire && !r3IsNumber(expire)) || (r3IsNumber(expire) && expire < 0)){
			const _error = new Error('tenant(' + JSON.stringify(tenant) + ') or role path(' + JSON.stringify(role) + ') or expire(' + JSON.stringify(expire) + ') parameters are wrong.');
			console.error(_error.message);
			_callback(_error, null);
			return;
		}

		this.startProgress();																// start progressing

		let	_tenant		= tenant.name;
		let	_role		= role;
		let	_expire: number;
		if(!r3IsNumber(expire)){
			_expire		= 24 * 60 * 60 * 1000;												// default 24H(ms)
		}else{
			_expire		= 10 * 365 * 24 * 60 * 60 * 1000;									// no expire(10 years)
		}

		// make new role token
		let	strRoleToken						= (Date.now().toString(16) + Math.random().toString(16).slice(2)).padEnd(32, '0').slice(0, 32);		// simple for demo
		let	nowMilliTime						= Date.now();
		let	valueRoleToken: DemoRoleTokenListInfo = {
			date:			(new Date(nowMilliTime)).toISOString(),
			expire:			(new Date(nowMilliTime + _expire)).toISOString(),
			user:			'demo',
			hostname:		null,
			ip:				null,
			port:			0,
			cuk:			null,
			registerpath:	'for-demo-' + strRoleToken
		};

		// search target role
		let	_target_role: DemoRoleTokenEntry | null = null;
		for(let cnt = 0; cnt < this.roleTokens[_tenant].length; ++cnt){
			if(_role == this.roleTokens[_tenant][cnt].path){
				_target_role = this.roleTokens[_tenant][cnt];
				break;
			}
		}
		if(null === _target_role){
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
	getRoleTokenList(tenant: TenantData, role: string, callback: DataCallback<RoleTokenInfo[]>): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}
		const _callback	= callback;
		if(!isTenantData(tenant) || r3IsEmptyString(tenant.name, true) || r3IsEmptyString(role, true)){
			const _error = new Error('tenant(' + JSON.stringify(tenant) + ') or role path(' + JSON.stringify(role) + ') parameters are wrong.');
			console.error(_error.message);
			_callback(_error, null);
			return;
		}

		this.startProgress();																// start progressing

		let	_tenant	= tenant.name;
		let	_role	= role;

		// search target role
		let	_target_role: DemoRoleTokenEntry | null = null;
		for(let cnt = 0; cnt < this.roleTokens[_tenant].length; ++cnt){
			if(_role === this.roleTokens[_tenant][cnt].path){
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
		const tokenArray: RoleTokenInfo[] = [];
		Object.keys(_target_role.roletokens).forEach((oneToken) => {
			const	oneValue = _target_role.roletokens[oneToken];
			if(isRoleTokenListResponseInfo(oneValue)){
				const	item: RoleTokenInfo = {
					token:			oneToken,													// add element { ..., token: 'role token string' }
					date:			oneValue.date,
					expire:			oneValue.expire,
					user:			oneValue.user,
					hostname:		oneValue.hostname,
					ip:				oneValue.ip,
					port:			oneValue.port,
					cuk:			oneValue.cuk,
					registerpath:	(r3IsString(oneValue?.registerpath) ? oneValue.registerpath : '')
				};
				tokenArray.push(item);
			}
		});
		this.stopProgress();																// stop progressing

		_callback(null, tokenArray);
	}

	//
	// Remove Role Token
	//
	deleteRoleToken(tenant: TenantData, roletoken: string, callback: ErrorCallback): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}
		const _callback = callback;
		if(!isTenantData(tenant) || r3IsEmptyString(tenant.name, true) || r3IsEmptyString(roletoken, true)){
			const _error = new Error('tenant(' + JSON.stringify(tenant) + ') or role token(not printed) parameters are wrong.');
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
	getUserDataScript(registerpath: string): string | null
	{
		if(r3IsEmptyString(registerpath, true)){
			console.error('registerpath(not printed) parameter is wrong.');
			return null;
		}

		// get user token script by expanding template
		const userDataScript = this.r3Context.getExpandUserData(registerpath);
		if(r3IsEmptyString(userDataScript, true)){
			console.error('Failed to generate user data script from template.');
			return null;
		}

		return userDataScript;
	}

	//
	// Get Secret Yaml
	//
	getSecretYaml(roletoken: string): string | null
	{
		if(r3IsEmptyString(roletoken, true)){
			console.error('role token(not printed) parameter is wrong.');
			return null;
		}

		// get secret yaml by expanding template
		const secretYaml = this.r3Context.getExpandSecretYaml(roletoken, false);
		if(r3IsEmptyString(secretYaml, true)){
			console.error('Failed to generate secret yaml from template.');
			return null;
		}
		return secretYaml;
	}

	//
	// Get Secret Yaml
	//
	getSidecarYaml(roleyrn: string): string | null
	{
		if(r3IsEmptyString(roleyrn, true)){
			console.error('role full yrn path(' + JSON.stringify(roleyrn) + ') parameter is wrong.');
			return null;
		}

		// get sidecar yaml by expanding template
		const sidecarYaml = this.r3Context.getExpandSidecarYaml(roleyrn);
		if(r3IsEmptyString(sidecarYaml, true)){
			console.error('Failed to generate sidecar yaml from template.');
			return null;
		}
		return sidecarYaml;
	}

	//
	// Get Custom Registration Codes
	//
	getCRCObject(roleToken: string, roleyrn: string, registerpath: string): CRCObject | null
	{
		if(r3IsEmptyString(roleToken, true) || r3IsEmptyString(roleyrn, true) || r3IsEmptyString(registerpath, true)){
			console.error('role token(not printed) or full yrn path(' + JSON.stringify(roleyrn) + ') or registerpath(not printed) parameters are wrong.');
			return null;
		}

		// get sidecar yaml by expanding template
		const crcObject = this.r3Context.getExpandCRCObject(roleToken, roleyrn, registerpath);
		if(!isCRCObject(crcObject)){
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
