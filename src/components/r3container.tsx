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
 * CREATE:   Tue Aug 15 2017
 * REVISION:
 *
 */

import React						from 'react';
import Paper						from '@mui/material/Paper';							// For contents wrap
import Box							from '@mui/material/Box';

// Styles
import { r3ContainerStyle }			from './r3styles';									// But nothing for r3Container now.
import type { R3Theme }				from './r3theme';

// Parts
import R3AppBar						from './r3appbar';									// AppBar
import R3MainTree					from './r3maintree';								// Main TreeView
import R3Toolbar					from './r3toolbar';									// Toolbar
import R3MsgBox						from './r3msgbox';									// Message Box
import R3AboutDialog				from './r3aboutdialog';								// About Dialog
import R3AccountDialog				from './r3accountdialog';							// Account Dialog
import R3SigninDialog				from './r3signincreddialog';						// SignIn by Credential Dialog
import R3Progress					from './r3progress';								// Progress

// For contents
import R3Resource					from './r3resource';
import R3Role						from './r3role';
import R3Policy						from './r3policy';
import R3Service					from './r3service';

// Utilities
import R3Message					from '../util/r3message';
import R3Provider					from '../util/r3provider';

import { localTenantPrefix }		from '../util/r3define';
import { clientTypes }				from '../util/r3device';
import { r3LicensesJsonString }		from '../util/r3licenses';
import { r3VersionString }			from '../util/r3version';
import { r3DeepCompare, r3IsEmptyStringObject, r3CompareString, r3CompareCaseString, r3IsString, r3IsEmptyString, r3IsEmptyEntity, r3IsEmptyEntityObject, r3DeepClone, r3IsArray, r3IsBoolean, r3IsFunction } from '../util/r3util';
import { resourceType, roleType, policyType, serviceType, errorType, infoType, signinUnscopedToken, signinCredential, MessageType, ItemType, isItemType, DataCallback, PolicyData, ResourceData, RoleData, ServiceData, TenantData, isPolicyData, isResourceData, isRoleData, isServiceData, isTenantData, TreeListItem, PathDetailInfo, getLicenseEntryObject, actionValueRead, effectValueAllow, isSignUrlEntry, isTreeListItemArray } from '../util/r3types';

//
// Props type
//
type R3ContainerRequiredProps = {
	theme:				R3Theme;
};

type R3ContainerOptionProps = {
	title?:				string;
};

type R3ContainerProps = R3ContainerRequiredProps & R3ContainerOptionProps;

type R3ContainerSelected = {
	tenant?:			TenantData | null;
	type?:				ItemType | null;
	service?:			string | null;
	path?:				string | null;
};

type R3ContainerState = {
	selected?:			R3ContainerSelected;
	tenants?:			TenantData[];
	mainTree?:			TreeListItem[];
	mainTreeEndock?:	boolean;
	mainTreeDocked?:	boolean;
	mainTreeOpen?:		boolean;
	service?:			ServiceData;
	role?:				RoleData;
	policy?:			PolicyData;
	resource?:			ResourceData;
	toolbarData?:		PathDetailInfo;
	message?:			R3Message;
	aboutDialogOpen?:	boolean;
	licensePackage?:	string | null;
	licenseType?:		string | null;
	licenseText?:		string | null;
	r3VersionText?:		string | null;
	accountDialogOpen?:	boolean;
	username?:			string | null;
	unscopedtoken?:		string | null;
	useLocalTenant?:	boolean;
	signinDialogOpen?:	boolean;
};

type R3ContainerStateAll = Required<R3ContainerState>;

type R3ContainerStyleType = ReturnType<typeof r3ContainerStyle>;

//
// Default(initial) values
//
const initialServiceData: ServiceData = {
	verify:			null,
	tenant:			[]
};

const initialRoleData: RoleData = {
	policies:		[]
};

const initialPolicyData: PolicyData = {
	name:			'',
	effect:			effectValueAllow,
	action:			[actionValueRead],
	resource:		[],
	alias:			[]
};

const initialResourceData: ResourceData = {
};

//
// Container Class
//
export default class R3Container extends React.Component<R3ContainerProps, R3ContainerState>
{
	// styles
	sxClasses: R3ContainerStyleType;

	static defaultProps: R3ContainerOptionProps = {
		title:	'K2HR3'
	};

	// [NOTE] Argument "signin" must not be specified here.
	//
	// When "mode=development", R3Container is initialized twice because
	// "<React.StrictMode>" is specified. (It is initialized once when
	// "mode=production".)
	// If you are using an R3Provider for the demo page, if the "signin"
	// argument is "undefined", singn in information and other initialization
	// will be performed. (The demo page will be displayed as logged in.)
	// Please note that specifying the "signin" argument will not initialize
	// the system, making it unstable.
	//
	r3provider: R3Provider		= new R3Provider(this.cbProgressControl);

	// State for not render
	contentUpdating				= false;
	progressDisplayFunc: ((isDisplay: boolean) => void) | null	= null;		// Callback from R3Progress for registering its method function.

	// Licenses
	licensesObj 				= getLicenseEntryObject(r3LicensesJsonString);

	// for dispatching contents
	static dispUnique			= 0;

	// State
	//
	// [NOTE] type/service in selected
	//
	// If selected.type is ROLE or POLICY or RESOURCE and selected.service
	// is empty, it means that "ROLE/POLICY/RESOURCE" top or the pass under
	// those is selected.
	// If selected.type is SERVICE, it means SERVICE top or "service name"
	// under SERVICE top is selected.
	// On this case, selected.service is set empty or "service name".
	// If selected.service is empty, it means that SERVICE top is selected.
	// If selected.service is not empty, "service name" under SERVICE top is
	// selected.
	// If selected.service is not empty and selected.type is ROLE or POLICY
	// or RESOURCE, it means that ROLE/POLICY/RESOURCE under "service name"
	// (under SERVICE) is selected.
	// At this case, when selected.path is not empty,
	// "SERVICE > service name > ROLE/POLICY/RESOURCE > path" is selected.
	//
	// <<DETAIL EXAMPLE>>
	// [type]				[service]		[path]		[selected item]
	// ROLE/POLICY/RESOURCE	empty			empty/path	ROLE/POLICY/RESOURCE top or path under it
	// SERVICE				empty			empty		SERVICE top
	// SERVICE				service name	empty		"SERVICE > service name"
	// ROLE/POLICY/RESOURCE	service name	empty		"SERVICE > service name > ROLE/POLICY/RESOURCE"
	// ROLE/POLICY/RESOURCE	service name	path		"SERVICE > service name > ROLE/POLICY/RESOURCE > path"
	//
	state: R3ContainerStateAll = {
		selected: {
			tenant:				null,
			type:				null,
			service:			null,
			path:				null
		},
		tenants:				[],
		mainTree:				this.r3provider.getEmptyTreeList(true),
		mainTreeEndock:			!clientTypes.isMobile,
		mainTreeDocked:			(clientTypes.isMobile || clientTypes.isTablet ? false : true),
		mainTreeOpen:			false,
		service:				r3DeepClone(initialServiceData),
		role:					r3DeepClone(initialRoleData),
		policy:					r3DeepClone(initialPolicyData),
		resource:				r3DeepClone(initialResourceData),
		toolbarData:			this.r3provider.getPathDetailInfo(null, null, false, false, null, null),
		message:				new R3Message(this.r3provider.getR3TextRes().iNotSelectTenant),
		aboutDialogOpen:		false,
		licensePackage:			null,
		licenseType:			null,
		licenseText:			null,
		r3VersionText:			null,
		accountDialogOpen:		false,
		username:				this.r3provider.getR3Context().getSafeUserName(),
		unscopedtoken:			this.r3provider.getR3Context().getSafeUnscopedToken(),
		useLocalTenant:			this.r3provider.getR3Context().useLocalTenant(),
		signinDialogOpen:		false
	};

	constructor(props: R3ContainerProps)
	{
		super(props);

		// Binding(do not define handlers as arrow functions for performance)
		this.handleIsContentUpdating		= this.handleIsContentUpdating.bind(this);

		this.handleTenantChange				= this.handleTenantChange.bind(this);
		this.handleLocalTenantCreate		= this.handleLocalTenantCreate.bind(this);
		this.handleLocalTenantChange		= this.handleLocalTenantChange.bind(this);
		this.handleLocalTenantDelete		= this.handleLocalTenantDelete.bind(this);
		this.handleTypeChange				= this.handleTypeChange.bind(this);
		this.handleListItemChange			= this.handleListItemChange.bind(this);
		this.handleNameItemInServiceChange	= this.handleNameItemInServiceChange.bind(this);
		this.handleTypeInServiceChange		= this.handleTypeInServiceChange.bind(this);
		this.handleListItemInServiceChange	= this.handleListItemInServiceChange.bind(this);

		this.handleTreeDetach				= this.handleTreeDetach.bind(this);
		this.handleTreeOpen					= this.handleTreeOpen.bind(this);
		this.handleTreePopupClose			= this.handleTreePopupClose.bind(this);
		this.handleTreeDocking				= this.handleTreeDocking.bind(this);

		this.handleMoveToUpPath				= this.handleMoveToUpPath.bind(this);
		this.handleCreatePath				= this.handleCreatePath.bind(this);
		this.handleCheckConflictPath		= this.handleCheckConflictPath.bind(this);
		this.handleCheckConflictServiceName	= this.handleCheckConflictServiceName.bind(this);
		this.handleDeletePath				= this.handleDeletePath.bind(this);
		this.handleCreateService			= this.handleCreateService.bind(this);
		this.handleCreateServiceTenant		= this.handleCreateServiceTenant.bind(this);
		this.handleDeleteService			= this.handleDeleteService.bind(this);

		this.handleContentUpdating			= this.handleContentUpdating.bind(this);
		this.handleSave						= this.handleSave.bind(this);
		this.handleServiceSave				= this.handleServiceSave.bind(this);

		this.handleSign						= this.handleSign.bind(this);
		this.handleAbout					= this.handleAbout.bind(this);
		this.handAboutDialogClose			= this.handAboutDialogClose.bind(this);
		this.handleAccount					= this.handleAccount.bind(this);
		this.handAccountDialogClose			= this.handAccountDialogClose.bind(this);
		this.handSignInDialogClose			= this.handSignInDialogClose.bind(this);
		this.cbProgressControl				= this.cbProgressControl.bind(this);		// For progress callback from provider
		this.cbRefRegister					= this.cbRefRegister.bind(this);			// For registering callback from progress

		// styles
		this.sxClasses						= r3ContainerStyle(props.theme);
	}

	componentDidMount()
	{
		// Initialize tenant
		this.r3provider.getTenantList(false, this.state.useLocalTenant, (error: Error | null, resobj: TenantData[] | null) => this.cbTenantList(error, resobj));
	}

	//
	// Re-Initialize by sign in/out
	//
	componentReinitialize(isSignIn: boolean, username?: string, unscopedtoken?: string)
	{
		// Re-Initialize provider object
		this.r3provider = new R3Provider(this.cbProgressControl, isSignIn, username, unscopedtoken);

		// Re-Initialize & Update state
		let initStats: R3ContainerStateAll = {
			selected: {
				tenant:				null,
				type:				null,
				service:			null,
				path:				null
			},
			tenants:				[],
			mainTree:				this.r3provider.getEmptyTreeList(true),
			mainTreeEndock:			!clientTypes.isMobile,
			mainTreeDocked:			(clientTypes.isMobile || clientTypes.isTablet ? false : true),
			mainTreeOpen:			false,
			service:				r3DeepClone(initialServiceData),
			role:					r3DeepClone(initialRoleData),
			policy:					r3DeepClone(initialPolicyData),
			resource:				r3DeepClone(initialResourceData),
			toolbarData:			this.r3provider.getPathDetailInfo(null, null, false, false, null, null),
			message:				new R3Message(this.r3provider.getR3TextRes().iNotSelectTenant),
			aboutDialogOpen:		false,
			licensePackage:			null,
			licenseType:			null,
			licenseText:			null,
			r3VersionText:			null,
			accountDialogOpen:		false,
			username:				this.r3provider.getR3Context().getSafeUserName(),
			unscopedtoken:			this.r3provider.getR3Context().getSafeUnscopedToken(),
			useLocalTenant:			this.r3provider.getR3Context().useLocalTenant(),
			signinDialogOpen:		false
		};
		this.updateState(initStats);

		if(isSignIn){
			// Re-Initialize tenant list
			this.r3provider.getTenantList(true, this.state.useLocalTenant, (error: Error | null, resobj: TenantData[] | null) => this.cbTenantList(error, resobj));

			// All parts updates
			this.updateStateAllParts(this.state.selected.tenant, this.state.selected.service, this.state.selected.type, this.state.selected.path, false, (isSignIn ? (this.r3provider.getR3TextRes().iSignined + this.r3provider.getR3TextRes().iNotSignin) : (this.r3provider.getR3TextRes().iSignouted + this.r3provider.getR3TextRes().iNotSignin)));
		}
	}

	//
	// Utility for updating State
	//
	updateState(newState: R3ContainerState | null, message: string | null = null, type: MessageType = infoType)
	{
		if(r3IsEmptyEntity(newState)){
			newState = {};
		}
		if(!this.r3provider.getR3Context().isLogin()){
			let	r3providerMsg = this.r3provider.getR3Context().getErrorMsg();
			if(!r3IsEmptyString(r3providerMsg)){
				newState.message = new R3Message(r3providerMsg, errorType);
			}else{
				newState.message = new R3Message(this.r3provider.getR3TextRes().iNotSignin);
			}
		}else if(r3IsEmptyString(message)){
			if(undefined === newState.selected){
				if(undefined === this.state.selected || r3IsEmptyStringObject(this.state.selected.tenant, 'name')){
					newState.message = new R3Message(this.r3provider.getR3TextRes().iNotSelectTenant);
				}else if(null === this.state.selected.type || null === this.state.selected.path){
					newState.message = new R3Message(this.r3provider.getR3TextRes().iNotSelectPath);
				}else{
					newState.message = new R3Message();
				}
			}else if(null === newState.selected.tenant){
				newState.message = new R3Message(this.r3provider.getR3TextRes().iNotSelectTenant);
			}else if(null === newState.selected.type || null === newState.selected.path){
				newState.message = new R3Message(this.r3provider.getR3TextRes().iNotSelectPath);
			}else{
				newState.message = new R3Message();
			}
		}else{
			newState.message = new R3Message(message, type);
		}
		this.setState(newState);
	}

	//
	// Callback for provider
	//
	cbTenantList(error: Error | null, tenants: TenantData[] | null)
	{
		if(null !== error){
			this.updateState(null, this.r3provider.getR3TextRes().eCommunication + error.message, errorType);
		}else{
			this.updateState({
				tenants:	tenants
			}, ((!r3IsArray(tenants) || 0 === tenants.length) ? this.r3provider.getR3TextRes().iNotHaveAnyTenant : null));
		}
	}

	//
	// Update MainTree List
	//
	updateMainTreeList(selectedTenant: TenantData | null, selectedService: string | null, selectedType: ItemType | null, selectedPath: string | null, callback: (error: Error | null, resobj: TreeListItem[] | null) => void)
	{
		console.info('CALL : updateMainTreeList');

		let	_callback	= callback;
		let	_tenant		= selectedTenant;
		let	_service	= selectedService;
		let	_type		= selectedType;
		let	_path		= selectedPath;

		this.cbProgressControl(true);										// collectively display progress

		this.r3provider.getAllTreeList(_tenant, (error: Error | null, resobj: TreeListItem[] | null) =>
		{
			// always error is null
			if(null !== error){
				this.cbProgressControl(false);								// collectively undisplay progress
				_callback(error, null);
				return;
			}

			// set seleted flag
			this.r3provider.selectTreeList(resobj, _service, _type, _path);

			this.cbProgressControl(false);									// collectively undisplay progress
			_callback(null, resobj);
		});
	}

	//
	// Update Service Data
	//
	updateServiceData(selectedTenant: TenantData | null, selectedService: string | null, treeList: TreeListItem[], callback: DataCallback<ServiceData>)
	{
		console.info('CALL : updateServiceData');

		let	_callback	= callback;
		let	_tenant		= selectedTenant;
		let	_service	= selectedService;

		if(	!isTenantData(_tenant)					||
			r3IsEmptyString(_tenant.name, true)		||
			!r3IsString(_service)					||
			r3IsEmptyString(_service)				)
		{
			// update state
			_callback(null, initialServiceData);
			return;
		}

		this.cbProgressControl(true);										// collectively display progress

		// check owner
		if(!this.r3provider.checkServiceOwnerInTreeList(treeList, _service)){
			this.cbProgressControl(false);									// collectively undisplay progress

			// tenant is not service owner, then service data is empty
			_callback(null, initialServiceData);
			return;
		}

		this.r3provider.getServiceData(_tenant, _service, (error: Error | null, resobj: ServiceData | null) =>
		{
			this.cbProgressControl(false);									// collectively undisplay progress

			if(null !== error){
				console.info(error.message);
				_callback(error, null);
				return;
			}
			if(!isServiceData(resobj)){
				const err = new Error('Could not get role data for tenant(' + _tenant + '), service(' + _service + ')');
				console.info(err.message);
				_callback(err, null);
				return;
			}
			_callback(null, resobj);
		});
	}

	//
	// Update Role Data
	//
	updateRoleData(selectedTenant: TenantData | null, selectedService: string | null, selectedType: ItemType | null, selectedPath: string | null, callback: DataCallback<RoleData>)
	{
		console.info('CALL : updateRoleData');

		let	_callback	= callback;
		let	_tenant		= selectedTenant;
		let	_service	= selectedService;
		let	_type		= selectedType;
		let	_path		= selectedPath;

		if(	!isTenantData(_tenant)					||
			r3IsEmptyString(_tenant.name, true)		||
			!isItemType(_type)						||
			!r3CompareString(_type, roleType)		||
			!r3IsString(_path)						||
			r3IsEmptyString(_path)					)
		{
			// update state
			_callback(null, initialRoleData);
			return;
		}

		this.r3provider.getRoleData(_tenant, _service, _path, false, (error: Error | null, resobj: RoleData | null) =>
		{
			if(null !== error){
				console.info(error.message);
				_callback(error, null);
				return;
			}
			if(!isRoleData(resobj)){
				const err = new Error('Could not get role data for tenant(' + _tenant + '), path(' + _path + ')');
				console.info(err.message);
				_callback(err, null);
				return;
			}
			_callback(null, resobj);
		});
	}

	//
	// Update Policy Data
	//
	updatePolicyData(selectedTenant: TenantData | null, selectedService: string | null, selectedType: ItemType | null, selectedPath: string | null, callback: DataCallback<PolicyData>)
	{
		console.info('CALL : updatePolicyData');
		let	_callback	= callback;
		let	_tenant		= selectedTenant;
		let	_service	= selectedService;
		let	_type		= selectedType;
		let	_path		= selectedPath;

		if(	!isTenantData(_tenant)					||
			r3IsEmptyString(_tenant.name, true)		||
			!isItemType(_type)						||
			!r3CompareString(_type, policyType)		||
			!r3IsString(_path)						||
			r3IsEmptyString(_path)					)
		{
			// update state
			_callback(null, initialPolicyData);
			return;
		}

		this.r3provider.getPolicyData(_tenant, _service, _path, (error: Error | null, resobj: PolicyData | null) =>
		{
			if(null !== error){
				console.info(error.message);
				_callback(error, null);
				return;
			}
			if(!isPolicyData(resobj)){
				const err = new Error('Could not get policy data for tenant(' + _tenant + '), path(' + _path + ')');
				console.info(err.message);
				_callback(err, null);
				return;
			}
			_callback(null, resobj);
		});
	}

	//
	// Update Resource Data
	//
	updateResourceData(selectedTenant: TenantData | null, selectedService: string | null, selectedType: ItemType | null, selectedPath: string | null, callback: DataCallback<ResourceData>)
	{
		console.info('CALL : updateResourceData');

		let	_callback	= callback;
		let	_tenant		= selectedTenant;
		let	_service	= selectedService;
		let	_type		= selectedType;
		let	_path		= selectedPath;

		if(	!isTenantData(_tenant)					||
			r3IsEmptyString(_tenant.name, true)		||
			!isItemType(_type)						||
			!r3CompareString(_type, resourceType)	||
			!r3IsString(_path)						||
			r3IsEmptyString(_path)					)
		{
			// update state
			_callback(null, initialResourceData);
			return;
		}

		this.r3provider.getResourceData(_tenant, _service, _path, false, (error: Error | null, resobj: ResourceData | null) =>
		{
			if(null !== error){
				console.info(error.message);
				_callback(error, null);
				return;
			}
			if(!isResourceData(resobj)){
				const err = new Error('Could not get resource data for tenant(' + _tenant + '), path(' + _path + ')');
				console.info(err.message);
				_callback(err, null);
				return;
			}
			_callback(null, resobj);
		});
	}

	updateStateAllParts(tenant: TenantData | null, service: string | null, type: ItemType | null, path: string | null, openMainTree: boolean, message: string | null = null, msgType: MessageType = infoType)
	{
		// new state data
		let	newState: R3ContainerState = {
			selected: {
				tenant:			tenant,
				service:		service,
				type:			type,
				path:			path
			},
			mainTreeOpen:		(this.state.mainTreeDocked ? false : openMainTree),
		};
		let	_tenant		= tenant;
		let	_service	= service;
		let	_type		= type;
		let	_path		= path;
		let	_message	= message;
		let	_msgType	= msgType;

		this.cbProgressControl(true);										// collectively display progress

		this.updateMainTreeList(_tenant, _service, _type, _path, (error: Error | null, mainTree: TreeListItem[] | null) =>
		{
			if(null !== error){
				this.cbProgressControl(false);								// collectively undisplay progress
				console.info(error.message);
				return;
			}
			if(!isTreeListItemArray(mainTree)){
				this.cbProgressControl(false);								// collectively undisplay progress
				console.info('Could not get Tree list');
				return;
			}

			newState.mainTree		= mainTree;
			newState.toolbarData	= this.r3provider.getPathDetailInfo(_tenant, _service, this.r3provider.checkServiceOwnerInTreeList(newState.mainTree, _service), this.r3provider.checkServiceTenantInTreeList(newState.mainTree, _service), _type, _path);

			this.updateServiceData(_tenant, _service, mainTree, (error: Error | null, serviceData: ServiceData | null) =>
			{
				if(null !== error){
					this.cbProgressControl(false);							// collectively undisplay progress
					console.info(error.message);
					this.updateState(null, error.message, errorType);
					return;
				}
				if(!isServiceData(serviceData)){
					this.cbProgressControl(false);							// collectively undisplay progress
					console.info('Could not update servide data.');
					return;
				}
				newState.service = serviceData;

				this.updateRoleData(_tenant, _service, _type, _path, (error: Error | null, role: RoleData | null) =>
				{
					if(null !== error){
						this.cbProgressControl(false);						// collectively undisplay progress
						console.info(error.message);
						this.updateState(null, error.message, errorType);
						return;
					}
					if(!isRoleData(role)){
						this.cbProgressControl(false);							// collectively undisplay progress
						console.info('Could not update role data.');
						return;
					}
					newState.role = role;

					this.updatePolicyData(_tenant, _service, _type, _path, (error: Error | null, policy: PolicyData | null) =>
					{
						if(null !== error){
							this.cbProgressControl(false);					// collectively undisplay progress
							console.info(error.message);
							this.updateState(null, error.message, errorType);
							return;
						}
						if(!isPolicyData(policy)){
							this.cbProgressControl(false);					// collectively undisplay progress
							console.info('Could not update policy data.');
							return;
						}
						newState.policy = policy;

						this.updateResourceData(_tenant, _service, _type, _path, (error: Error | null, resource: ResourceData | null) =>
						{
							this.cbProgressControl(false);					// collectively undisplay progress

							if(null !== error){
								console.info(error.message);
								this.updateState(null, error.message, errorType);
								return;
							}
							if(!isResourceData(resource)){
								this.cbProgressControl(false);					// collectively undisplay progress
								console.info('Could not update resource data.');
								return;
							}
							newState.resource = resource;

							// update all
							this.updateState(newState, _message, _msgType);
						});
					});
				});
			});
		});
	}

	//
	// Handle Check updating
	//
	handleIsContentUpdating()
	{
		return this.contentUpdating;
	}

	//
	// Handle Tenant in MainTree Change
	//
	handleTenantChange(tenant: TenantData | null)
	{
		let	type	= (r3DeepCompare(tenant, this.state.selected.tenant) ? this.state.selected.type		: null);
		let	service	= (r3DeepCompare(tenant, this.state.selected.tenant) ? this.state.selected.service	: null);
		let	path	= (r3DeepCompare(tenant, this.state.selected.tenant) ? this.state.selected.path		: null);

		this.updateStateAllParts(tenant, service, type, path, false, this.r3provider.getR3TextRes().iSucceedChangeTenant);
	}

	//
	// Update Tenant List Callback for provider
	//
	// [NOTE]
	// This CallBack is for creating/updating a Local Tenant.
	//
	cbUpdateChangeTenant(error: Error | null, tenants: TenantData[] | null, tenantname: string | null)
	{
		if(null !== error){
			this.updateState(null, this.r3provider.getR3TextRes().eCommunication + error.message, errorType);
		}else if(tenants !== null){
			// update tenant list
			this.updateState({
				tenants:	r3DeepClone(tenants)
			}, ((!r3IsArray(tenants) || 0 === tenants.length) ? this.r3provider.getR3TextRes().iNotHaveAnyTenant : null));

			// change selected tenant
			let	_selectedTenant: TenantData | null = null;
			if(!r3IsEmptyString(tenantname)){
				let	_tenantName: string;
				if(0 === tenantname.indexOf(localTenantPrefix)){
					_tenantName = tenantname;
				}else{
					_tenantName = localTenantPrefix + tenantname;
				}
				tenants.map( (item: TenantData) => {
					if(!r3IsEmptyString(item.name) && item.name == _tenantName){
						// found
						_selectedTenant = r3DeepClone(item);
					}
				});
			}
			this.updateStateAllParts(_selectedTenant, null, null, null, false, this.r3provider.getR3TextRes().iSucceedChangeTenant);
		}
	}

	//
	// Handle Create Local Tenant in MainTree
	//
	//	name			: Local Tenant name(prefix with local@) to create
	//	display			: Display name allowed empty
	//	description		: Description name allowed empty
	//	users			: User name list included self name
	//
	handleLocalTenantCreate(name: string, display: string, description: string, users: string[])
	{
		console.info('CALL : handleLocalTenantCreate');

		let	_name		= name;
		let	_display	= display;
		let	_description= description;
		let	_users		= r3DeepClone(users);

		this.cbProgressControl(true);										// collectively display progress

		this.r3provider.createLocalTenant(_name, _display, _description, _users, (error: Error | null) =>
		{
			if(null !== error){
				this.cbProgressControl(false);								// collectively undisplay progress
				this.updateState(null, this.r3provider.getR3TextRes().eLocalTenantCreate + error.message, errorType);
				return;
			}

			//
			// update tenant list and change to new local tenant
			//
			this.r3provider.getTenantList(true, this.state.useLocalTenant, (error: Error | null, resobj: TenantData[] | null) => this.cbUpdateChangeTenant(error, resobj, _name));

			this.cbProgressControl(false);									// collectively undisplay progress
		});
	}

	//
	// Handle Change Local Tenant in MainTree
	//
	//	name			: Local Tenant name(prefix with local@) to change
	//	id				: Local Tenant ID
	//	display			: Display name allowed empty
	//	description		: Description name allowed empty
	//	users			: User name list
	//
	handleLocalTenantChange(name: string, id: string, display: string, description: string, users: string[])
	{
		console.info('CALL : handleLocalTenantChange');

		let	_name		= name;
		let	_id			= id;
		let	_display	= display;
		let	_description= description;
		let	_users		= r3DeepClone(users);

		this.cbProgressControl(true);										// collectively display progress

		this.r3provider.updateLocalTenant(_name, _id, _display, _description, _users, (error: Error | null) =>
		{
			if(null !== error){
				this.cbProgressControl(false);								// collectively undisplay progress
				this.updateState(null, this.r3provider.getR3TextRes().eLocalTenantUpdate + error.message, errorType);
				return;
			}

			//
			// update tenant list and change to new local tenant
			//
			this.r3provider.getTenantList(true, this.state.useLocalTenant, (error: Error | null, resobj: TenantData[] | null) => this.cbUpdateChangeTenant(error, resobj, _name));

			this.cbProgressControl(false);									// collectively undisplay progress
		});
	}

	//
	// Handle Delete Local Tenant in MainTree
	//
	//	name			: Local Tenant name(prefix with local@) to delete
	//	id				: Local Tenant id
	//
	handleLocalTenantDelete(name: string, id: string)
	{
		console.info('CALL : handleLocalTenantDelete');

		let	_name		= name;
		let	_id			= id;

		this.cbProgressControl(true);										// collectively display progress

		this.r3provider.deleteLocalTenant(_name, _id, (error: Error | null) =>
		{
			if(null !== error){
				this.cbProgressControl(false);								// collectively undisplay progress
				this.updateState(null, this.r3provider.getR3TextRes().eLocalTenantDelete + error.message, errorType);
				return;
			}

			//
			// update tenant list and change to new local tenant
			//
			this.r3provider.getTenantList(true, this.state.useLocalTenant, (error: Error | null, resobj: TenantData[] | null) => this.cbUpdateChangeTenant(error, resobj, null));

			this.cbProgressControl(false);									// collectively undisplay progress
		});
	}

	//
	// Handle Top level type in MainTree Change
	//
	handleTypeChange(newType: string)
	{
		let	type: ItemType | null	= r3IsEmptyStringObject(this.state.selected.tenant, 'name') ? null : isItemType(newType) ? newType : null;

		this.updateStateAllParts(this.state.selected.tenant, null, type, null, true, (null === type ? this.r3provider.getR3TextRes().iNotSelectTenant : this.r3provider.getR3TextRes().iSucceedChangeType));
	}

	//
	// Handle ROLE/POLICY/RESOURCE(not under SERVICE) Item Change
	//
	handleListItemChange(type: string, path: string)
	{
		// this handler is called when "tenant > ROLE/POLICY/RESOURCE/ > item" is selected.
		// it means service name is empty(not selected).
		//
		if(!isItemType(type)){
			return;
		}
		this.updateStateAllParts(this.state.selected.tenant, null, type, path, false, this.r3provider.getR3TextRes().iSucceedChangePath);
	}

	// Handle Service name under "SERVICE" Change
	handleNameItemInServiceChange(servicename: string)
	{
		//
		// Type is serviceType("service")
		//
		let	message = this.r3provider.checkServiceOwnerInTreeList(this.state.mainTree, servicename) ? this.r3provider.getR3TextRes().iSucceedChangeServiceOwner : this.r3provider.getR3TextRes().iSucceedChangeServiceName;

		this.updateStateAllParts(this.state.selected.tenant, servicename, serviceType, null, true, message);
	}

	// Handle Type(ROLE/POLICY/RESOURCE) under "SERVICE > Service name" Change
	handleTypeInServiceChange(servicename: string, type_in_service: string)
	{
		if(!isItemType(type_in_service)){
			return;
		}
		this.updateStateAllParts(this.state.selected.tenant, servicename, type_in_service, null, true, this.r3provider.getR3TextRes().iSucceedChangeServiceType);
	}

	// Handle Item under "SERVICE > Service name > Type(ROLE/POLICY/RESOURCE)" Change
	handleListItemInServiceChange(servicename: string, type_in_service: string, path: string)
	{
		if(!isItemType(type_in_service)){
			return;
		}
		this.updateStateAllParts(this.state.selected.tenant, servicename, type_in_service, path, false, this.r3provider.getR3TextRes().iSucceedChangeServicePath);
	}

	//
	// Handle MainTree open
	//
	handleTreeOpen()
	{
		this.updateState({
			mainTreeDocked:		false,
			mainTreeOpen:		true
		});
	}

	//
	// Handle MainTree popup close
	//
	handleTreePopupClose()
	{
		this.updateState({
			mainTreeOpen:		false
		});
	}

	//
	// Handle MainTree docking status
	//
	handleTreeDetach()
	{
		this.handleTreeDocking(false);
	}

	//
	// Handle MainTree docking status
	//
	handleTreeDocking(isDocking: boolean)
	{
		this.updateState({
			mainTreeDocked:		isDocking,
			mainTreeOpen:		false
		});
	}

	//
	// Handle Move path
	//
	handleMoveToUpPath()
	{
		//
		// Check for not move up type
		//
		// no tenant												||
		// unknown type												||
		// SERVICE top(type & empty service)						||
		// ROLE/POLICY/RESOURCE top(type & empty service or path)	||
		//
		if(	r3IsEmptyStringObject(this.state.selected.tenant, 'name') ||
			(!r3CompareCaseString(serviceType, this.state.selected.type) && !r3CompareCaseString(roleType, this.state.selected.type) && !r3CompareCaseString(policyType, this.state.selected.type) && !r3CompareCaseString(resourceType, this.state.selected.type)) ||
			(r3CompareCaseString(serviceType, this.state.selected.type) && r3IsEmptyString(this.state.selected.service)) ||
			((r3CompareCaseString(roleType, this.state.selected.type) || r3CompareCaseString(policyType, this.state.selected.type) || r3CompareCaseString(resourceType, this.state.selected.type)) && (r3IsEmptyString(this.state.selected.service) && r3IsEmptyString(this.state.selected.path))) )
		{
			console.error('Current path is not existed.');
			return;
		}

		// make new type/service/path
		let	_newType:			ItemType;
		let	_newServiceName:	string | null;
		let	_newPath:			string | null;
		let	_message:			string;
		let	separatorPos:		number;
		if(r3CompareCaseString(serviceType, this.state.selected.type) && !r3IsEmptyString(this.state.selected.service)){
			// now "SERVICE > service name", move to SERVICE top
			_newType		= serviceType;
			_newServiceName	= null;
			_newPath		= null;
			_message		= this.r3provider.getR3TextRes().iSucceedMoveService;

		}else if((r3CompareCaseString(roleType, this.state.selected.type) || r3CompareCaseString(policyType, this.state.selected.type) || r3CompareCaseString(resourceType, this.state.selected.type)) && !r3IsEmptyString(this.state.selected.service)){
			// now "SERVICE > service name > ROLE/POLICY/RESOURCE..."
			if(r3IsEmptyString(this.state.selected.path)){
				// now "SERVICE > service name > ROLE/POLICY/RESOURCE", move to "SERVICE > service name"
				_newType		= serviceType;
				_newServiceName	= this.state.selected.service;
				_newPath		= null;
				_message		= this.r3provider.getR3TextRes().iSucceedMoveServiceName;

			}else{
				// now "SERVICE > service name > ROLE/POLICY/RESOURCE > path"
				separatorPos = this.state.selected.path.lastIndexOf('/');
				if(-1 === separatorPos){
					// now "SERVICE > service name > ROLE/POLICY/RESOURCE > path", move to "SERVICE > service name > ROLE/POLICY/RESOURCE"
					_newType		= this.state.selected.type;
					_newServiceName	= this.state.selected.service;
					_newPath		= null;
					_message		= this.r3provider.getR3TextRes().iSucceedMoveType;

				}else{
					// now "SERVICE > service name > ROLE/POLICY/RESOURCE > path/path...", move to upper path
					_newType		= this.state.selected.type;
					_newServiceName	= this.state.selected.service;
					_newPath		= this.state.selected.path.substring(0, separatorPos);
					_message		= this.r3provider.getR3TextRes().iSucceedChangePath;
				}
			}
		}else{
			// now "ROLE/POLICY/RESOURCE > path"
			separatorPos = this.state.selected.path.lastIndexOf('/');
			if(-1 === separatorPos){
				// now "ROLE/POLICY/RESOURCE > path", move to "ROLE/POLICY/RESOURCE"
				_newType		= this.state.selected.type;
				_newServiceName	= null;
				_newPath		= null;
				_message		= this.r3provider.getR3TextRes().iSucceedMoveType;

			}else{
				// now "ROLE/POLICY/RESOURCE > path/path...", move to move to upper path
				_newType		= this.state.selected.type;
				_newServiceName	= null;
				_newPath		= this.state.selected.path.substring(0, separatorPos);
				_message		= this.r3provider.getR3TextRes().iSucceedChangePath;
			}
		}

		// update all
		this.updateStateAllParts(this.state.selected.tenant, _newServiceName, _newType, _newPath, false, _message);
	}

	//
	// Handle Create Path
	//
	handleCreatePath(newPath: string, newAllPath: string)
	{
		console.info('CALL CREATE PATH : ' + newPath + '(' + newAllPath + ')');

		let	_path = newAllPath.trim();

		this.r3provider.createEmptyData(this.state.selected.tenant, this.state.selected.type, _path, (error: Error | null) =>
		{
			if(null !== error){
				this.updateState(null, this.r3provider.getR3TextRes().eCommunication + error.message, errorType);
				return;
			}

			// update all
			this.updateStateAllParts(this.state.selected.tenant, null, this.state.selected.type, _path, false, this.r3provider.getR3TextRes().iSucceedCreatePath);
		});
	}

	//
	// Handle Check Confrict Path
	//
	handleCheckConflictPath(newCreatePath: string)
	{
		if(r3IsEmptyString(this.state.selected.type) || r3CompareCaseString(serviceType, this.state.selected.type) || !r3IsEmptyString(this.state.selected.service)){
			//
			// if type is ignore(not select any or not service type or under service), this function returns true.
			// it means do not create new path.
			//
			return true;
		}

		for(let cnt = 0; cnt < this.state.mainTree.length; ++cnt){
			if(this.state.selected.type === this.state.mainTree[cnt].path){
				return this.findCheckConflictPath(this.state.mainTree[cnt].children, newCreatePath, true);
			}
		}
		return false;
	}

	//
	// Handle Check Confrict Service Name
	//
	handleCheckConflictServiceName(newServiceName: string)
	{
		if(!r3CompareCaseString(serviceType, this.state.selected.type) || !r3IsEmptyString(this.state.selected.service)){
			//
			// if type is ignore(not select service), this function returns true.
			// it means do not create new service name.
			//
			return true;
		}
		for(let cnt = 0; cnt < this.state.mainTree.length; ++cnt){
			if(r3CompareCaseString(serviceType, this.state.mainTree[cnt].path)){
				return this.findCheckConflictPath(this.state.mainTree[cnt].children, newServiceName, false);
			}
		}
		return false;
	}

	//
	// Utility : find same path under items
	//
	findCheckConflictPath(items: TreeListItem[] | undefined, itemPath: string, isCheckNest: boolean = false)
	{
		if(!r3IsArray(items) || r3IsEmptyString(itemPath)){
			return false;
		}
		for(let cnt = 0; cnt < items.length; ++cnt){
			if(itemPath === items[cnt].path){
				return true;
			}
			if(isCheckNest && this.findCheckConflictPath(items[cnt].children, itemPath)){
				return true;
			}
		}
		return false;
	}

	//
	// Handle Delete path
	//
	handleDeletePath()
	{
		console.info('CALL DELETE PATH');

		if(r3IsEmptyEntity(this.state.selected.path)){
			return;
		}
		this.r3provider.removeData(this.state.selected.tenant, this.state.selected.type, this.state.selected.path, (error: Error | null) =>
		{
			if(null !== error){
				this.updateState(null, this.r3provider.getR3TextRes().eCommunication + error.message, errorType);
				return;
			}

			// update all
			this.updateStateAllParts(this.state.selected.tenant, this.state.selected.service, this.state.selected.type, null, false, this.r3provider.getR3TextRes().iSucceedDeletePath);
		});
	}

	handleDeleteService(isServiceOwner: boolean, isServiceTenant: boolean)
	{
		console.info('CALL DELETE SERVICE');

		if(	r3IsEmptyString(this.state.selected.service)||
			!r3IsBoolean(isServiceTenant)				||
			!r3IsBoolean(isServiceOwner)				)
		{
			return;
		}
		let	_isServiceOwner	= isServiceOwner;
		let	_isServiceTenant= isServiceTenant;

		this.r3provider.removeService(this.state.selected.tenant, this.state.selected.service, isServiceTenant, (error: Error | null) =>
		{
			if(null !== error){
				this.updateState(null, this.r3provider.getR3TextRes().eCommunication + error.message, errorType);
				return;
			}

			let	_servicename:	string | null;
			let	_type:			ItemType;
			if(!_isServiceTenant){
				// Case : remove service
				_servicename		= null;
				_type				= serviceType;
			}else{
				// Case : remove service tenant
				if(_isServiceOwner){
					_servicename	= this.state.selected.service;
					_type			= serviceType;
				}else{
					_servicename	= null;
					_type			= serviceType;
				}
			}

			// update all
			this.updateStateAllParts(this.state.selected.tenant, _servicename, _type, null, false, (_isServiceTenant ? this.r3provider.getR3TextRes().iSucceedDeleteServiceTenant : this.r3provider.getR3TextRes().iSucceedDeleteService));
		});
	}

	//
	// Handle Updating flag
	//
	handleContentUpdating(isUpdating: boolean)
	{
		if(r3IsBoolean(isUpdating)){
			this.contentUpdating = isUpdating;
		}
	}

	//
	// Handle Save
	//
	handleSave(data: RoleData | PolicyData | ResourceData)
	{
		console.info('CALL SAVE DATA : ' + JSON.stringify(data));

		this.r3provider.updateData(this.state.selected.tenant, this.state.selected.type, this.state.selected.path, data, (error: Error | null) =>
		{
			// set off updating flag
			//
			// [NOTE]
			// We need to chane status of updating because it can not be rolled back when this function is called.
			//
			this.handleContentUpdating(false);

			if(null !== error){
				this.updateState(null, this.r3provider.getR3TextRes().eCommunication + error.message, errorType);
				return;
			}

			// update all
			this.updateStateAllParts(this.state.selected.tenant, this.state.selected.service, this.state.selected.type, this.state.selected.path, false, this.r3provider.getR3TextRes().iSucceedUpdate);
		});
	}

	//
	// Handle Save for Service
	//
	handleServiceSave(data: ServiceData)
	{
		console.info('CALL SERVICE SAVE DATA : ' + JSON.stringify(data));

		this.r3provider.updateServiceData(this.state.selected.tenant, this.state.selected.service, data.tenant, true, data.verify, (error: Error | null) =>
		{
			// set off updating flag
			//
			// [NOTE]
			// We need to chane status of updating because it can not be rolled back when this function is called.
			//
			this.handleContentUpdating(false);

			if(null !== error){
				this.updateState(null, this.r3provider.getR3TextRes().eCommunication + error.message, errorType);
				return;
			}

			// update all
			this.updateStateAllParts(this.state.selected.tenant, this.state.selected.service, this.state.selected.type, this.state.selected.path, false, this.r3provider.getR3TextRes().iSucceedUpdate);
		});
	}

	//
	// Handle Create for Service
	//
	handleCreateService(newServiceName: string, newVerify: string)
	{
		console.info('CALL CREATE SERVICE : Service Name=' + JSON.stringify(newServiceName) + ', Verify=' + JSON.stringify(newVerify));

		let	_newServiceName = newServiceName;
		let	_newVerify		= newVerify;

		this.r3provider.createInitializedService(this.state.selected.tenant, _newServiceName, _newVerify, (error: Error | null) =>
		{
			if(null !== error){
				this.updateState(null, this.r3provider.getR3TextRes().eCommunication + error.message, errorType);
				return;
			}

			// update all
			this.updateStateAllParts(this.state.selected.tenant, _newServiceName, serviceType, null, false, this.r3provider.getR3TextRes().iSucceedCreateService);
		});
	}

	//
	// Handle Create for Service Tenant
	//
	handleCreateServiceTenant(aliasRole: string | null)
	{
		console.info('CALL CREATE SERVICE/TENANT');

		let	_aliasRole = aliasRole;
		this.r3provider.createServiceTenant(this.state.selected.tenant, this.state.selected.service, _aliasRole, (error: Error | null) =>
		{
			if(null !== error){
				this.updateState(null, this.r3provider.getR3TextRes().eCommunication + error.message, errorType);
				return;
			}

			// update all
			this.updateStateAllParts(this.state.selected.tenant, this.state.selected.service, serviceType, null, false, this.r3provider.getR3TextRes().iSucceedCreateServiceTenant);
		});
	}

	//
	// Handle Singin/Signout
	//
	handleSign(configName?: string)
	{
		let	type = this.r3provider.getR3Context().getSignInType();

		if(signinUnscopedToken == type){
			//
			// Unscoped Token Login Type
			//
			let	signurl: string = '';

			if(this.r3provider.getR3Context().isLogin()){
				//
				// Currently signed in -> Get the signout URL
				//
				let	_configName: string | undefined	= configName;
				if(!r3IsEmptyString(_configName)){
					console.info('Signout does not require config name, but ' + _configName + ' is specified, it is ignored.');
				}

				// try to get by config name
				_configName		= this.r3provider.getR3Context().getSafeConfigName();
				let	signoutobj	= this.r3provider.getR3Context().getSafeSignOutUrl(_configName);

				if(!isSignUrlEntry(signoutobj)){
					// try to get default
					signoutobj	= this.r3provider.getR3Context().getSafeSignOutUrl();
				}
				if(isSignUrlEntry(signoutobj)){
					if(r3IsString(signoutobj.url) && !r3IsEmptyString(signoutobj.url)){
						signurl = signoutobj.url;
					}
				}
			}else{
				//
				// Currently signed out -> Get the signin URL
				//
				let	signinobj = this.r3provider.getR3Context().getSafeSignInUrl(configName);		// config name is allowed undefined/null
				if(!isSignUrlEntry(signinobj)){
					// try to get default
					signinobj	= this.r3provider.getR3Context().getSafeSignInUrl();
				}
				if(isSignUrlEntry(signinobj)){
					if(r3IsString(signinobj.url) && !r3IsEmptyString(signinobj.url)){
						signurl = signinobj.url;
					}
				}
			}
			if(!r3IsEmptyString(signurl)){
				window.location.href = signurl;
			}else{
				console.info('Signin URL does not find.');
			}

		}else if(signinCredential == type){
			//
			// Credential Login Type
			//
			if(this.r3provider.getR3Context().isLogin()){
				// reload application for sign out
				this.componentReinitialize(false);
			}else{
				// popup direct signin dialog
				this.updateState({
					signinDialogOpen:	true
				});
			}

		}else{	//signinUnknownType
			this.updateState(null, this.r3provider.getR3TextRes().eUnknownSignInType, errorType);
		}
	}

	//
	// Handle Open About Dialog
	//
	handleAbout(package_name: string | null)
	{
		if(!r3IsEmptyString(package_name) && !r3IsEmptyEntityObject(this.licensesObj, package_name)){
			// Licenses
			this.updateState({
				aboutDialogOpen:	true,
				licensePackage:		package_name,
				licenseType:		this.licensesObj[package_name].licenseType,
				licenseText:		this.licensesObj[package_name].licenseText,
				r3VersionText:		null,
				mainTreeOpen:		false
			});
		}else{
			// About K2HR3
			this.updateState({
				aboutDialogOpen:	true,
				licensePackage:		null,
				licenseType:		null,
				licenseText:		null,
				r3VersionText:		r3VersionString,
				mainTreeOpen:		false
			});
		}
	}

	//
	// Handle Close About Dialog
	//
	handAboutDialogClose(_event: {}, _reason: string | null)
	{
		this.updateState({
			aboutDialogOpen:	false,
			licensePackage:		null,
			licenseType:		null,
			licenseText:		null,
			r3VersionText:		null
		});
	}

	//
	// Handle Open Account Dialog
	//
	handleAccount()
	{
		this.updateState({
			accountDialogOpen:	true
		});
	}

	//
	// Handle Close Account Dialog
	//
	handAccountDialogClose(_event: {}, _reason: string | null)
	{
		this.updateState({
			accountDialogOpen:	false
		});
	}

	//
	// Handle Close Direct SignIn Dialog
	//
	handSignInDialogClose(_event: {}, _reason: string | null, doSignIn: boolean, username: string | null, passphrase: string | null)
	{
		if(doSignIn){
			// [NOTE]
			// username is not empty when this handler is called with signin type.
			//
			if(null === username){
				return;
			}
			let	_username = username.trim();

			// Try to sign in
			this.r3provider.getUnscopedUserToken(_username, passphrase, (error: Error | null, token: string | null) =>
			{
				if(null !== error){
					this.updateState(null, this.r3provider.getR3TextRes().eCommunication + error.message, errorType);
					return;
				}
				this.componentReinitialize(true, _username, (r3IsString(token) ? token: ''));
			});
		}

		this.updateState({
			signinDialogOpen:	false
		});
	}

	//
	// Callback from R3Provider for Progress
	//
	cbProgressControl(isDisplay: boolean)
	{
		if(this.progressDisplayFunc){
			this.progressDisplayFunc(isDisplay);
		}
	}

	//
	// Callback from R3Progress for register object reference
	//
	cbRefRegister(func: (isDisplay: boolean) => void)
	{
		if(!r3IsFunction(func)){
			console.error('call cbRefRegister with invalid function parameter.');
			return;
		}
		this.progressDisplayFunc = func;
	}

	//
	// Renders : Contents
	//
	getContent()
	{
		// always increments(32bit cycling)
		if(R3Container.dispUnique < 0xffffffff){
			++R3Container.dispUnique;
		}else{
			R3Container.dispUnique = 0;
		}

		if(r3CompareCaseString(resourceType, this.state.selected.type)){
			if(!r3IsEmptyEntity(this.state.selected.path)){
				return (
					<Paper
						sx={ this.sxClasses.paper }
					>
						<R3Resource
							theme={ this.props.theme }
							r3provider={ this.r3provider }
							resource={ this.state.resource }
							dispUnique={ R3Container.dispUnique }
							onSave={ this.handleSave }
							onUpdate={ this.handleContentUpdating }
							isReadMode={ !r3IsEmptyString(this.state.selected.service) }
						/>
					</Paper>
				);
			}
		}else if(r3CompareCaseString(roleType, this.state.selected.type)){
			if(!r3IsEmptyEntity(this.state.selected.path)){
				return (
					<Paper
						sx={ this.sxClasses.paper }
					>
						<R3Role
							theme={ this.props.theme }
							r3provider={ this.r3provider }
							role={ this.state.role }
							dispUnique={ R3Container.dispUnique }
							onSave={ this.handleSave }
							onUpdate={ this.handleContentUpdating }
							isReadMode={ !r3IsEmptyString(this.state.selected.service) }
						/>
					</Paper>
				);
			}
		}else if(r3CompareCaseString(policyType, this.state.selected.type)){
			if(!r3IsEmptyEntity(this.state.selected.path)){
				return (
					<Paper
						sx={ this.sxClasses.paper }
					>
						<R3Policy
							theme={ this.props.theme }
							r3provider={ this.r3provider }
							policy={ this.state.policy }
							dispUnique={ R3Container.dispUnique }
							onSave={ this.handleSave }
							onUpdate={ this.handleContentUpdating }
							isReadMode={ !r3IsEmptyString(this.state.selected.service) }
						/>
					</Paper>
				);
			}
		}else if(r3CompareCaseString(serviceType, this.state.selected.type)){
			// content is displaied at only service owner
			if(this.r3provider.checkServiceOwnerInTreeList(this.state.mainTree, this.state.selected.service)){
				return (
					<Paper
						sx={ this.sxClasses.paper }
					>
						<R3Service
							theme={ this.props.theme }
							r3provider={ this.r3provider }
							tenant={ this.state.selected.tenant.name }
							service={ this.state.service }
							dispUnique={ R3Container.dispUnique }
							onSave={ this.handleServiceSave }
							onUpdate={ this.handleContentUpdating }
						/>
					</Paper>
				);
			}
		}else{
			// Not selected
			return;
		}
	}

	//
	// Renders
	//
	render()
	{
		let	signinDialogMsg	= (r3CompareCaseString('http', this.r3provider.getR3Context().getSafeApiScheme()) ? this.r3provider.getR3TextRes().wDeprecateAuth : '');

		return (
			<React.Fragment>
				<R3AppBar
					theme={ this.props.theme }
					r3provider={ this.r3provider }
					title={ this.props.title }
					enDock={ this.state.mainTreeEndock }
					isDocking={ this.state.mainTreeDocked }
					licensesObj={ this.licensesObj }
					onTreeDetach={ this.handleTreeDetach }
					onOpenTree={ this.handleTreeOpen }
					onCheckUpdating={ this.handleIsContentUpdating }
					onAbout={ this.handleAbout }
					onSign={ this.handleSign }
					onAccount={ this.handleAccount }
				/>
				<Box>
					<R3MainTree
						theme={ this.props.theme }
						r3provider={ this.r3provider }
						title={ this.props.title }
						enDock={ this.state.mainTreeEndock }
						isDocking={ this.state.mainTreeDocked }
						licensesObj={ this.licensesObj }
						open={ this.state.mainTreeOpen }
						editableLocalTenant={ this.state.useLocalTenant }
						userName={ this.state.username }
						tenants={ this.state.tenants }
						treeList={ this.state.mainTree }
						selectedTenant={ this.state.selected.tenant }
						selectedType={ this.state.selected.type }
						selectedService={ this.state.selected.service }
						selectedPath={ this.state.selected.path }
						onTenantChange={ this.handleTenantChange }
						onLocalTenantCreate={ this.handleLocalTenantCreate }
						onLocalTenantChange={ this.handleLocalTenantChange }
						onLocalTenantDelete={ this.handleLocalTenantDelete }
						onTypeItemChange={ this.handleTypeChange }
						onListItemChange={ this.handleListItemChange }
						onNameItemInServiceChange={ this.handleNameItemInServiceChange }
						onTypeInServiceChange={ this.handleTypeInServiceChange }
						onListItemInServiceChange={ this.handleListItemInServiceChange }
						onPopupClose={ this.handleTreePopupClose }
						onTreeDocking={ this.handleTreeDocking }
						onCheckUpdating={ this.handleIsContentUpdating }
						onAbout={ this.handleAbout }
					/>
					<Box>
						<R3Toolbar
							theme={ this.props.theme }
							r3provider={ this.r3provider }
							enDock={ this.state.mainTreeEndock }
							toolbarData={ this.state.toolbarData }
							onArrawUpward={ this.handleMoveToUpPath }
							onCreatePath={ this.handleCreatePath }
							onCheckPath={ this.handleCheckConflictPath }
							onDeletePath={ this.handleDeletePath }
							onCreateService={ this.handleCreateService }
							onCreateServiceTenant={ this.handleCreateServiceTenant }
							onCheckServiceName={ this.handleCheckConflictServiceName }
							onDeleteService={ this.handleDeleteService }
							onCheckUpdating={ this.handleIsContentUpdating }
						/>
						<R3MsgBox
							theme={ this.props.theme }
							message={ this.state.message }
						/>
						{ this.getContent() }
					</Box>
				</Box>
				<R3AboutDialog
					theme={ this.props.theme }
					r3provider={ this.r3provider }
					open={ this.state.aboutDialogOpen }
					onClose={ this.handAboutDialogClose }
					licensePackage={ this.state.licensePackage }
					licenseType={ this.state.licenseType }
					licenseText={ this.state.licenseText }
					r3VersionText={ this.state.r3VersionText }
				/>
				<R3AccountDialog
					theme={ this.props.theme }
					r3provider={ this.r3provider }
					open={ this.state.accountDialogOpen }
					onClose={ this.handAccountDialogClose }
					username={ this.state.username }
					unscopedtoken={ this.state.unscopedtoken }
				/>
				<R3SigninDialog
					theme={ this.props.theme }
					r3provider={ this.r3provider }
					open={ this.state.signinDialogOpen }
					name={ null }
					passphrase={ null }
					message={ signinDialogMsg }
					onClose={ this.handSignInDialogClose }
				/>
				<R3Progress
					theme={ this.props.theme }
					cbRefRegister={ this.cbRefRegister }
				/>
			</React.Fragment>
		);
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
