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
 * CREATE:   Tue Nov 21 2017
 * REVISION:
 *
 */

import React						from 'react';

import TextField					from '@mui/material/TextField';
import Typography					from '@mui/material/Typography';
import IconButton					from '@mui/material/IconButton';
import Box							from '@mui/material/Box';
import FormControlLabel				from '@mui/material/FormControlLabel';
import RadioGroup					from '@mui/material/RadioGroup';
import Radio						from '@mui/material/Radio';
import Table						from '@mui/material/Table';
import TableBody					from '@mui/material/TableBody';
import TableCell					from '@mui/material/TableCell';
import TableHead					from '@mui/material/TableHead';
import TablePagination				from '@mui/material/TablePagination';
import TableRow						from '@mui/material/TableRow';
import Tooltip						from '@mui/material/Tooltip';
import DeleteIcon					from '@mui/icons-material/ClearRounded';
import AddIcon						from '@mui/icons-material/AddRounded';
import EditIcon						from '@mui/icons-material/Edit';

import type { R3Theme }				from './r3theme';
import { r3ServiceStyle }			from './r3styles';
import R3FormButtons				from './r3formbuttons';					// Buttons
import R3Message					from '../util/r3message';
import R3Provider					from '../util/r3provider';
import R3CreateServiceDialog		from './r3createservicedialog';
import R3PopupMsgDialog				from './r3popupmsgdialog';

import { regYrnTenantPathPrefix, regYrnAnyTenantPath }	from '../util/r3define';
import { getServiceResourceType, normalizeServiceReourceStaticObject }	from '../util/r3verifyutil';
import { StaticResourceObject, errorType, actionTypeValue, actionTypeDelete, actionTypeAdd, serviceResTypeUrl, serviceResTypeObject, serviceResTypeUnknown, ServiceData, ServiceResType, isServiceResType, isServiceResourceObjectArray, isStaticResourceObject }	from '../util/r3types';
import { r3IsNumber, r3IsBoolean, r3DeepClone, r3DeepCompare, r3CompareCaseString, r3IsEmptyEntityObject, r3IsEmptyString, r3IsEmptyEntity, r3IsJSON, r3ConvertFromJSON, r3IsArray, r3IsString } from '../util/r3util';

//
// Interfaces
//
type R3ServiceTooltips = {
	deleteTenantTooltip?:				number;
	addTenantTooltip?:					boolean;
	addResStaticObjTooltip?:			boolean;
	nameResStaticObjTooltip?:			number;
	jsonResStaticObjTooltip?:			number;
	delResStaticObjTooltip?:			number;
	editResStaticObjTooltip?:			number;
};

type R3ServiceRequiredProps = {
	theme:								R3Theme;
	r3provider:							R3Provider;
	tenant:								string;
	service:							ServiceData;
	dispUnique:							string | number;
	onSave:								(service: ServiceData) => void;
	onUpdate:							(changed: boolean) => void;
};

type R3ServiceOptionProps = {
	isReadMode?:						boolean;
	tableRawCount?:						number;
};

type R3ServiceProps = R3ServiceRequiredProps & R3ServiceOptionProps;

type R3ServiceResourceBase = {
	serviceResType:						ServiceResType;
	serviceResVerifyUrl:				string;
	serviceResStaticObject:				StaticResourceObject[];
	serviceResUnknown:					string;
}

type R3ServiceState = R3ServiceResourceBase & {
	dispUnique:							string | number;
	service:							ServiceData;
	serviceResStaticObjPageNum:			number;
	addTenant:							string;
	changed:							boolean;
	staticResourceDialog:				boolean;
	staticResourceObjectPos:			number;
	staticResourceObject:				StaticResourceObject[];
	confirmMessageObject:				R3Message | null;
	messageDialogObject:				R3Message | null;
	tooltips:							R3ServiceTooltips;
}

type R3ServiceStyleType = ReturnType<typeof r3ServiceStyle>;

//
// Local variables
//
const tooltipValues = {
	deleteTenantTooltip:			'deleteTenantTooltip',
	addTenantTooltip:				'addTenantTooltip',
	addResStaticObjTooltip:			'addResStaticObjTooltip',
	nameResStaticObjTooltip:		'nameResStaticObjTooltip',
	jsonResStaticObjTooltip:		'jsonResStaticObjTooltip',
	delResStaticObjTooltip:			'delResStaticObjTooltip',
	editResStaticObjTooltip:		'editResStaticObjTooltip'
};

const serviceComponentValues = {
	serviceResourceTypeName:		'serviceResourceType',
	verifyUrlResourceName:			'serviceVerifyUrlResource',
	resStaticObjTextFieldName:		'resStaticObjTextField',
	resUnknownTextFieldName:		'resUnknownTextField',
	tenantTextFieldNamePrefix:		'tenantValue_',
	tenantNewTextFieldName:			'tenantNew'
};

//
// Service Contents Class
//
export default class R3Service extends React.Component<R3ServiceProps, R3ServiceState>
{
	sxClasses: R3ServiceStyleType;

	static defaultProps: R3ServiceOptionProps = {
		isReadMode:		false,
		tableRawCount:	5
	};

	static orgServiceResource: R3ServiceResourceBase = {
		serviceResType:				serviceResTypeUnknown,
		serviceResVerifyUrl:		'',
		serviceResStaticObject:		[],
		serviceResUnknown:			'',
	};

	state = R3Service.createState(this.props.service, this.props.dispUnique);

	constructor(props: R3ServiceProps)
	{
		super(props);

		// Binding(do not define handlers as arrow functions for performance)
		this.handleSave							= this.handleSave.bind(this);
		this.handleCancel						= this.handleCancel.bind(this);
		this.handleConfirmDialogClose			= this.handleConfirmDialogClose.bind(this);
		this.handleMessageDialogClose			= this.handleMessageDialogClose.bind(this);

		this.handleVerifyChange					= this.handleVerifyChange.bind(this);
		this.handleTenantsChange				= this.handleTenantsChange.bind(this);
		this.handleAddTenantsChange				= this.handleAddTenantsChange.bind(this);

		this.handleResourceTypeChange			= this.handleResourceTypeChange.bind(this);
		this.handleResStaticObjPageChange		= this.handleResStaticObjPageChange.bind(this);
		this.handleNewStaticResourceObj			= this.handleNewStaticResourceObj.bind(this);
		this.handleDelStaticResourceObj			= this.handleDelStaticResourceObj.bind(this);
		this.handleEditStaticResourceObj		= this.handleEditStaticResourceObj.bind(this);
		this.handleCloseStaticResourceDialog	= this.handleCloseStaticResourceDialog.bind(this);
		this.handleCheckStaticResourceName		= this.handleCheckStaticResourceName.bind(this);

		// styles
		this.sxClasses							= r3ServiceStyle(props.theme);
	}

	componentDidMount()
	{
		// update State
		this.setState(R3Service.createState(this.props.service, this.props.dispUnique));
	}

	// [NOTE]
	// Use getDerivedStateFromProps by deprecating componentWillReceiveProps in React 17.x.
	// The only purpose is to set the state data from props when the dialog changes from hidden to visible.
	//
	static getDerivedStateFromProps(nextProps: R3ServiceProps, prevState: R3ServiceState): R3ServiceState | null
	{
		if(nextProps.dispUnique !== prevState.dispUnique){
			// Switching content
			return R3Service.createState(nextProps.service, nextProps.dispUnique);
		}
		return null;	// Return null to indicate no change to state.
	}

	static createState(service: ServiceData, dispUnique: string | number): R3ServiceState
	{
		// keep original analyzed verify data
		R3Service.orgServiceResource.serviceResType				= getServiceResourceType(service.verify);
		R3Service.orgServiceResource.serviceResVerifyUrl		= '';
		R3Service.orgServiceResource.serviceResStaticObject		= [];
		R3Service.orgServiceResource.serviceResUnknown			= '';

		if(R3Service.orgServiceResource.serviceResType == serviceResTypeUrl && r3IsString(service.verify)){
			R3Service.orgServiceResource.serviceResVerifyUrl	= service.verify;
		}else if(R3Service.orgServiceResource.serviceResType == serviceResTypeObject){
			R3Service.orgServiceResource.serviceResStaticObject	= normalizeServiceReourceStaticObject(service.verify);
		}else{	// serviceResTypeUnknown
			R3Service.orgServiceResource.serviceResUnknown		= JSON.stringify(service.verify);
		}

		// new state
		let	newState: R3ServiceState = {
			dispUnique:						dispUnique,
			service:						r3DeepClone(service),
			serviceResType:					R3Service.orgServiceResource.serviceResType,
			serviceResVerifyUrl:			R3Service.orgServiceResource.serviceResVerifyUrl,
			serviceResStaticObject:			R3Service.orgServiceResource.serviceResStaticObject,
			serviceResUnknown:				R3Service.orgServiceResource.serviceResUnknown,
			serviceResStaticObjPageNum:		0,
			addTenant:						'',
			changed:						false,
			staticResourceDialog:			false,
			staticResourceObjectPos:		-1,
			staticResourceObject:			[],
			confirmMessageObject:			null,
			messageDialogObject:			null,

			tooltips: {
				deleteTenantTooltip:		-1,				// position
				addTenantTooltip:			false,
				addResStaticObjTooltip:		false,
				nameResStaticObjTooltip:	-1,
				jsonResStaticObjTooltip:	-1,
				delResStaticObjTooltip:		-1,
				editResStaticObjTooltip:	-1
			}
		};

		return newState;
	}

	//
	// Check all state
	//
	isChangedState(newResType: string, newVerify: string | StaticResourceObject[], newTenants: string[]): boolean
	{
		let	is_changed	= false;

		if(!isServiceResType(newResType)){
			return is_changed;
		}

		// check verify
		if(newResType != R3Service.orgServiceResource.serviceResType){
			is_changed	= true;
		}else{
			if(newResType == serviceResTypeUrl && (!r3IsString(newVerify) || newVerify != R3Service.orgServiceResource.serviceResVerifyUrl)){
				is_changed = true;

			}else if(newResType == serviceResTypeObject){
				if(!r3DeepCompare(newVerify, R3Service.orgServiceResource.serviceResStaticObject)){
					is_changed = true;
				}
			}else if(newResType == serviceResTypeUnknown && newVerify != R3Service.orgServiceResource.serviceResUnknown){
				is_changed = true;
			}
		}

		// check tenants
		if(r3IsArray(newTenants)){
			if(r3IsEmptyEntity(this.props.service) || !r3IsArray(this.props.service.tenant)){
				is_changed = true;
			}else{
				if(!r3DeepCompare(this.props.service.tenant, newTenants)){
					is_changed = true;
				}
			}
		}
		return is_changed;
	}

	//
	// Handle Form Button : Save
	//
	handleSave(event: React.MouseEvent<HTMLElement>)
	{
		if(!this.state.changed){
			// no change, nothing to do
			return;
		}

		//
		// Make new service
		//
		let	newService = r3DeepClone(this.state.service);

		//
		// Check and Set service resource value to service
		//
		let	errorMessage: string | null;
		if(this.state.serviceResType == serviceResTypeUrl){
			newService.verify	= this.state.serviceResVerifyUrl;
			errorMessage		= this.props.r3provider.getErrorServiceResourceVerify(this.state.serviceResVerifyUrl);
		}else if(this.state.serviceResType == serviceResTypeObject){
			newService.verify	= r3DeepClone(this.state.serviceResStaticObject);
			errorMessage		= this.props.r3provider.getErrorServiceResourceVerify(this.state.serviceResStaticObject);
		}else{	// serviceResTypeUnknown
			// block to set unknown type after changing resource
			errorMessage = this.props.r3provider.getR3TextRes().eNewWrongVerifyObject;
		}
		if(null != errorMessage){
			this.setState({
				messageDialogObject:	new R3Message(errorMessage, errorType)
			});
			return;
		}

		//
		// Tenant
		//
		if(!r3IsArray(newService.tenant)){
			newService.tenant = [];
		}
		// check empty and yrn path by regex
		let	regTenantPath = new RegExp(regYrnAnyTenantPath);
		let	cnt: number;
		let	cnt2: number;
		for(cnt = 0; cnt < newService.tenant.length; ++cnt){
			newService.tenant[cnt] = newService.tenant[cnt].trim();
			if('*' !== newService.tenant[cnt] && null === newService.tenant[cnt].match(regTenantPath)){
				this.setState({
					messageDialogObject:	new R3Message(this.props.r3provider.getR3TextRes().eNotYRNTenant, errorType)
				});
				return;
			}
		}
		// check same value
		for(cnt = 0; cnt < newService.tenant.length; ++cnt){
			for(cnt2 = (cnt + 1); cnt2 < newService.tenant.length; ++cnt2){
				if(newService.tenant[cnt] === newService.tenant[cnt2]){
					let	tenantYrn = regYrnTenantPathPrefix + this.props.tenant;
					this.setState({
						messageDialogObject:	new R3Message((tenantYrn === newService.tenant[cnt] ? this.props.r3provider.getR3TextRes().eTenantOwnerArray : this.props.r3provider.getR3TextRes().eTenantArray), errorType)
					});
					return;
				}
			}
		}

		//
		// Check changed
		//
		if(!this.isChangedState(this.state.serviceResType, newService.verify, newService.tenant)){
			this.setState({
				messageDialogObject:	new R3Message(this.props.r3provider.getR3TextRes().eNoChange, errorType)
			});
			return;
		}

		this.props.onSave(newService);
	}

	//
	// Handle Form Button : Cancel
	//
	handleCancel(event: React.MouseEvent<HTMLElement>)
	{
		if(this.state.changed){
			this.setState({
				confirmMessageObject:	new R3Message(this.props.r3provider.getR3TextRes().cUpdatingCancel)
			});
		}
	}

	//
	// Handle Confirm Dialog : Close( OK / Cancel )
	//
	handleConfirmDialogClose(event: {}, reason: string, result: boolean)
	{
		if(result){
			// case for 'cancel updating' to do
			this.props.onUpdate(false);

			// rewind State
			this.setState(R3Service.createState(this.props.service, this.props.dispUnique));
		}else{
			// case for 'cancel updating' to cancel
			this.setState({
				confirmMessageObject:	null
			});
		}
	}

	//
	// Handle Message Dialog : Close
	//
	handleMessageDialogClose(event: {}, reason: string, result: boolean)
	{
		this.setState({
			messageDialogObject:	null
		});
	}

	//
	// Handle Verify Value : Change
	//
	handleVerifyChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)
	{
		let	newValue: string | null = r3IsEmptyEntityObject(event.target, 'value') ? null : event.target.value;

		if(!r3IsString(newValue)){
			console.warn('Changed verify new value is wrong.');
			return;
		}
		if(newValue === this.state.serviceResVerifyUrl){
			// nothing to update
			return;
		}

		// set parent changed state
		let	changed			= this.isChangedState(this.state.serviceResType, newValue, this.state.service.tenant);
		this.props.onUpdate(changed);

		// update state
		this.setState({
			serviceResVerifyUrl:	newValue,
			changed:				changed
		});
	}

	//
	// Handle Tenants : Change
	//
	handleTenantsChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | React.MouseEvent<HTMLElement>, type: string, pos: number)
	{
		let	changedValue: string | null	= null;
		if(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement){
			changedValue = r3IsEmptyEntityObject(event.target, 'value') ? null : event.target.value;
		}
		let	newTenants: string[]		= [];
		if(r3IsArray(this.state.service.tenant)){
			newTenants		= r3DeepClone(this.state.service.tenant);
		}

		let	isClearNewValue	= false;
		if(actionTypeValue === type){
			if(r3IsEmptyEntity(pos) || isNaN(pos) || pos < 0 || newTenants.length <= pos){
				console.warn('unknown position(' + JSON.stringify(pos) + ') for tenants.');
				return;
			}
			newTenants[pos] = changedValue.trim();

		}else if(actionTypeDelete === type){
			if(r3IsEmptyEntity(pos) || isNaN(pos) || pos < 0 || newTenants.length <= pos){
				console.warn('unknown position(' + JSON.stringify(pos) + ') for tenants.');
				return;
			}
			newTenants.splice(pos, 1);

		}else if(actionTypeAdd === type){
			if(r3IsEmptyString(this.state.addTenant, true)){
				this.setState({
					messageDialogObject:	new R3Message(this.props.r3provider.getR3TextRes().eNewTenant, errorType)
				});
				return;
			}
			newTenants.push(this.state.addTenant.trim());
			isClearNewValue = true;

		}else{
			console.warn('unknown action(' + JSON.stringify(type) + ') for tenants.');
			return;
		}

		// make new resource object
		let	newService		= r3DeepClone(this.state.service);
		newService.tenant	= newTenants;

		// set parent changed state
		let	nowVerify: string | StaticResourceObject[];
		if(this.state.serviceResType == serviceResTypeUrl){
			nowVerify	= this.state.serviceResVerifyUrl;
		}else if(this.state.serviceResType == serviceResTypeObject){
			nowVerify	= this.state.serviceResStaticObject;
		}else{	// serviceResTypeUnknown
			nowVerify	= this.state.serviceResUnknown;
		}
		let	changed		= this.isChangedState(this.state.serviceResType, nowVerify, newTenants);
		this.props.onUpdate(changed);

		// update state
		this.setState({
			service:	newService,
			changed:	changed,
			addTenant:	(isClearNewValue ? '' : this.state.addTenant)
		});
	}

	//
	// Handle Add New Tenant : Change
	//
	handleAddTenantsChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)
	{
		// update state
		this.setState({
			addTenant:		event.target.value
		});
	}

	handTooltipChange = (event: React.MouseEvent<HTMLElement>, type: string, extData: number | boolean) =>
	{
		if(tooltipValues.deleteTenantTooltip === type && r3IsNumber(extData)){
			this.setState({
				tooltips: {
					deleteTenantTooltip:		extData
				}
			});
		}else if(tooltipValues.addTenantTooltip === type && r3IsBoolean(extData)){
			this.setState({
				tooltips: {
					addTenantTooltip:			extData
				}
			});
		}else if(tooltipValues.nameResStaticObjTooltip === type && r3IsNumber(extData)){
			this.setState({
				tooltips: {
					nameResStaticObjTooltip:	extData
				}
			});
		}else if(tooltipValues.jsonResStaticObjTooltip === type && r3IsNumber(extData)){
			this.setState({
				tooltips: {
					jsonResStaticObjTooltip:	extData
				}
			});
		}else if(tooltipValues.addResStaticObjTooltip === type && r3IsBoolean(extData)){
			this.setState({
				tooltips: {
					addResStaticObjTooltip:		extData
				}
			});
		}else if(tooltipValues.delResStaticObjTooltip === type && r3IsNumber(extData)){
			this.setState({
				tooltips: {
					delResStaticObjTooltip:		extData
				}
			});
		}else if(tooltipValues.editResStaticObjTooltip === type && r3IsNumber(extData)){
			this.setState({
				tooltips: {
					editResStaticObjTooltip:	extData
				}
			});
		}
	};

	getTenantsContents(items: string[])
	{
		const { theme, r3provider } = this.props;

		if(!r3IsArray(items)){
			return;
		}

		let	tenantYrn = regYrnTenantPathPrefix + this.props.tenant;

		return items.map( (item: string, pos: number) =>
		{
			if(r3CompareCaseString(tenantYrn, item)){
				// item is owner tenant, this value could not change.
				return;
			}

			let	deleteButton = (
				<Tooltip
					title={ r3provider.getR3TextRes().tResServiceTenantDelTT }
					open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsNumber(this.state.tooltips.deleteTenantTooltip) || (this.state.tooltips.deleteTenantTooltip != pos)) ? false : true) }
				>
					<IconButton
						onClick={ (event) => this.handleTenantsChange(event, actionTypeDelete, pos) }
						onMouseEnter={ (event) => this.handTooltipChange(event, tooltipValues.deleteTenantTooltip, pos) }
						onMouseLeave={ (event) => this.handTooltipChange(event, tooltipValues.deleteTenantTooltip, -1) }
						{ ...theme.r3Service.deleteTenantButton }
						sx={ this.sxClasses.deleteTenantButton }
						size="large"
					>
						<DeleteIcon />
					</IconButton>
				</Tooltip>
			);

			return (
				<Box
					key={ pos }
					sx={ this.sxClasses.enclosureElement }
				>
					<TextField
						name={ serviceComponentValues.tenantTextFieldNamePrefix + String(pos) }
						value={ item }
						placeholder={ r3provider.getR3TextRes().tResServiceTenantHint }
						onChange={ (event) => this.handleTenantsChange(event, actionTypeValue, pos) }
						slotProps ={{ input: { sx: this.sxClasses.inputTextField } }}
						{ ...theme.r3Service.tenantTextField }
						sx={ this.sxClasses.tenantTextField }
					/>
					{ deleteButton }
				</Box>
			);
		});
	}

	getAddTenantsContents()
	{
		const { theme, r3provider } = this.props;

		return (
			<Box
				sx={ this.sxClasses.enclosureElement }
			>
				<TextField
					name={ serviceComponentValues.tenantNewTextFieldName }
					value={ this.state.addTenant }
					placeholder={ r3provider.getR3TextRes().tResServiceTenantHint }
					onChange={ (event) => this.handleAddTenantsChange(event) }
					slotProps ={{ input: { sx: this.sxClasses.inputTextField } }}
					{ ...theme.r3Service.tenantTextField }
					sx={ this.sxClasses.tenantTextField }
				/>

				<Tooltip
					title={ r3provider.getR3TextRes().tResServiceTenantAddTT }
					open={ (r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsBoolean(this.state.tooltips.addTenantTooltip)) ? false : this.state.tooltips.addTenantTooltip === true }
				>
					<IconButton
						onClick={ (event) => this.handleTenantsChange(event, actionTypeAdd, 0) }
						onMouseEnter={ (event) => this.handTooltipChange(event, tooltipValues.addTenantTooltip, true) }
						onMouseLeave={ (event) => this.handTooltipChange(event, tooltipValues.addTenantTooltip, false) }
						{ ...theme.r3Service.addTenantButton }
						sx={ this.sxClasses.addTenantButton }
						size="large"
					>
						<AddIcon />
					</IconButton>
				</Tooltip>
			</Box>
		);
	}

	//
	// Handle Service resource type : Change
	//
	handleResourceTypeChange(event: React.ChangeEvent<HTMLInputElement>, type: string | null = null)
	{
		if(!isServiceResType(type)){
			console.warn('changed value type(' + JSON.stringify(type) + ') is not ResourceType.');
			return;
		}
		if(this.state.serviceResType === type){
			console.warn('changed value type(' + JSON.stringify(type) + ') is something wrong.');
			return;
		}
		let	newResType	= type;
		let	newVerify: string | StaticResourceObject[];
		if(newResType == serviceResTypeUrl){
			newVerify	= this.state.serviceResVerifyUrl;
		}else if(newResType == serviceResTypeObject){
			newVerify	= this.state.serviceResStaticObject;
		}else{	// serviceResTypeUnknown
			newVerify	= this.state.serviceResUnknown;
		}

		// set parent changed state
		let	changed		= this.isChangedState(newResType, newVerify, this.state.service.tenant);
		this.props.onUpdate(changed);

		// update state
		this.setState({
			serviceResType:	newResType,
			changed:		changed
		});
	}

	//
	// Handle Add new static resource
	//
	handleNewStaticResourceObj(event: React.MouseEvent<HTMLElement>)
	{
		// update state
		this.setState({
			staticResourceDialog:		true,
			staticResourceObjectPos:	-1,
			staticResourceObject:		[]
		});
	}

	//
	// Handle Delete static resource
	//
	handleDelStaticResourceObj(event: React.MouseEvent<HTMLElement>, pos: number)
	{
		if(!r3IsArray(this.state.serviceResStaticObject)){
			return;
		}
		if(this.state.serviceResStaticObject.length <= pos){
			return;
		}

		// remove resouce
		let newStaticRes = this.state.serviceResStaticObject.filter((item: StaticResourceObject, itemPos: number) => itemPos !== pos);

		// set parent changed state
		let	changed			= this.isChangedState(this.state.serviceResType, newStaticRes, this.state.service.tenant);
		this.props.onUpdate(changed);

		// update state
		this.setState({
			serviceResStaticObject:	newStaticRes,
			changed:				changed
		});
	}

	//
	// Handle Edit static resource
	//
	handleEditStaticResourceObj(event: React.MouseEvent<HTMLElement>, pos: number)
	{
		if(!r3IsArray(this.state.serviceResStaticObject)){
			return;
		}
		if(this.state.serviceResStaticObject.length <= pos){
			return;
		}

		let oneStaticRes = r3DeepClone(this.state.serviceResStaticObject[pos]);

		// add data type
		if(r3IsEmptyString(oneStaticRes.data)){
			// data is empty(string or not) -> type: string
			oneStaticRes.type				= 'string';
			oneStaticRes.editingObjectData	= '';
			oneStaticRes.editingStringData	= '';
		}else if(r3IsString(oneStaticRes.data) && r3IsJSON(oneStaticRes.data)){
			let	tempobj = r3ConvertFromJSON(oneStaticRes.data);
			if(r3IsString(tempobj)){
				// data is JSON formatted, but it is string -> type: string
				oneStaticRes.type				= 'string';
				oneStaticRes.editingObjectData	= '';
				oneStaticRes.editingStringData	= tempobj;
			}else if(r3IsNumber(tempobj)){
				// data is JSON formatted, but it is number -> type: string
				oneStaticRes.type				= 'string';
				oneStaticRes.editingObjectData	= '';
				oneStaticRes.editingStringData	= String(tempobj);
			}else{
				// data is JSON formatted -> type: object
				oneStaticRes.type				= 'object';
				oneStaticRes.editingObjectData	= oneStaticRes.data;
				oneStaticRes.editingStringData	= '';
			}
		}else if(r3IsString(oneStaticRes.data)){
			// data is string -> type: string
			oneStaticRes.type				= 'string';
			oneStaticRes.editingObjectData	= '';
			oneStaticRes.editingStringData	= oneStaticRes.data;
		}else{
			// data is other -> type: string
			oneStaticRes.type				= 'string';
			oneStaticRes.editingObjectData	= '';
			oneStaticRes.editingStringData	= JSON.stringify(oneStaticRes.data);
		}

		// update state
		this.setState({
			staticResourceDialog:		true,
			staticResourceObjectPos:	pos,
			staticResourceObject:		[ oneStaticRes ]
		});
	}

	//
	// Handle Close static resource dialog
	//
	handleCloseStaticResourceDialog(event: {}, reason: string | null, isAgree: boolean, newServiceName: string | null, newServiceResType: ServiceResType | null, newVerify: string | null, newStaticRes: StaticResourceObject[] | null)
	{
		if(r3IsString(newServiceName) || isServiceResType(newServiceResType) || r3IsString(newVerify)){
			console.warn('Unnecessary parameters(newServiceName=' + JSON.stringify(newServiceName) + ', newServiceResType=' + JSON.stringify(newServiceResType) + ', newVerify=' + JSON.stringify(newVerify) + ') were specified, but they will be ignored.');
		}
		if(!isAgree){
			this.setState({
				staticResourceDialog:		false,
				staticResourceObjectPos:	-1,
				staticResourceObject:		[]
			});
			return;
		}
		if(!r3IsArray(newStaticRes) || 1 !== newStaticRes.length || !newStaticRes.every((item: unknown) => isStaticResourceObject(item))){
			// [NOTE]
			// If newStaticRes is null, isAgree is false, and therefore this logic is basically not come.
			//
			console.warn('newStaticRes parameter(' + JSON.stringify(newStaticRes) + ') is wrong.');
			this.setState({
				staticResourceDialog:		false,
				staticResourceObjectPos:	-1,
				staticResourceObject:		[]
			});
			return;
		}

		// add/edit new static resource
		let mergedStaticRes = r3DeepClone(this.state.serviceResStaticObject);
		if(0 <= this.state.staticResourceObjectPos && this.state.staticResourceObjectPos < mergedStaticRes.length){
			mergedStaticRes[this.state.staticResourceObjectPos] = newStaticRes[0];
		}else{
			mergedStaticRes.push(newStaticRes[0]);
		}

		// set parent changed state
		let	changed			= this.isChangedState(this.state.serviceResType, mergedStaticRes, this.state.service.tenant);
		this.props.onUpdate(changed);

		// update state
		this.setState({
			serviceResStaticObject:		mergedStaticRes,
			changed:					changed,

			staticResourceDialog:		false,
			staticResourceObjectPos:	-1,
			staticResourceObject:		[]
		});
	}

	//
	// Handle Check conflict static resource name
	//
	handleCheckStaticResourceName(staticResName: string): boolean
	{
		for(let cnt = 0; cnt < this.state.serviceResStaticObject.length; ++cnt){
			if(cnt == this.state.staticResourceObjectPos){
				continue;
			}
			if(this.state.serviceResStaticObject[cnt].name == staticResName){
				return false;
			}
		}
		return true;
	}

	//
	// Handle Static resource object page : Change
	//
	handleResStaticObjPageChange(event: React.MouseEvent<HTMLButtonElement> | null, page: number = 0)
	{
		this.setState({
			serviceResStaticObjPageNum:	page
		});
	}

	//
	// Render: Resource - Verify URL
	//
	renderServiceResourceVerifyUrl()
	{
		const { theme, r3provider } = this.props;

		return (
			<TextField
				name={ serviceComponentValues.verifyUrlResourceName }
				value={ this.state.serviceResVerifyUrl }
				placeholder={ r3provider.getR3TextRes().tResServiceUrlResHint }
				onChange={ (event) => this.handleVerifyChange(event) }
				slotProps ={{ input: { sx: this.sxClasses.inputTextField } }}
				{ ...theme.r3Service.resourceTextField }
				sx={ this.sxClasses.resourceTextField }
			/>
		);
	}

	//
	// Render: Resource - Static resource object
	//
	getResStaticObjTableHead()
	{
		const { theme, r3provider } = this.props;

		return (
			<TableHead
				sx={ this.sxClasses.tableHead }
			>
				<TableRow>
					<TableCell
						sx={ this.sxClasses.tableCell }
					>
						<Typography
							{ ...theme.r3Service.textTableHead }
							sx={ this.sxClasses.textTableHead }
						>
							{ r3provider.getR3TextRes().tResServiceNameTableHead }
						</Typography>
					</TableCell>
					<TableCell
						sx={ this.sxClasses.tableCell }
					>
						<Typography
							{ ...theme.r3Service.textTableHead }
							sx={ this.sxClasses.textTableHead }
						>
							{ r3provider.getR3TextRes().tResServiceJsonTableHead }
						</Typography>
					</TableCell>
					<TableCell
						sx={ this.sxClasses.tableCell }
					>
						<Tooltip
							title={ r3provider.getR3TextRes().tResServiceAddStaticResTT }
							open={ (r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsBoolean(this.state.tooltips.addResStaticObjTooltip)) ? false : this.state.tooltips.addResStaticObjTooltip === true }
						>
							<IconButton
								onClick={ this.handleNewStaticResourceObj }
								onMouseEnter={ (event) => this.handTooltipChange(event, tooltipValues.addResStaticObjTooltip, true) }
								onMouseLeave={ (event) => this.handTooltipChange(event, tooltipValues.addResStaticObjTooltip, false) }
								{ ...theme.r3Service.addResStaticObjButton }
								sx={ this.sxClasses.addResStaticObjButton }
								size="large"
							>
								<AddIcon />
							</IconButton>
						</Tooltip>
					</TableCell>
				</TableRow>
			</TableHead>
		);
	}

	getResStaticObjTableBody()
	{
		const { theme, r3provider } = this.props;

		if(!r3IsArray(this.state.serviceResStaticObject)){
			return;
		}
		let	resources = this.state.serviceResStaticObject;

		return (
			<TableBody>
				{resources.map((item: StaticResourceObject, pos: number) => {
					if(pos < (this.state.serviceResStaticObjPageNum * this.props.tableRawCount) || ((this.state.serviceResStaticObjPageNum + 1) * this.props.tableRawCount) <= pos){
						return;
					}

					let	orgName		= item.name;
					let	stripName	= orgName;
					if(13 < stripName.length){
						stripName = stripName.slice(0, 10) + '...';
					}
					let	orgJson		= JSON.stringify(item);
					let	stripJson	= orgJson;
					if(53 < stripJson.length){
						stripJson = stripJson.slice(0, 50) + '...';
					}

					return (
						<TableRow
							hover={ false }
							key={ pos }
							selected={ false }
						>
							<TableCell
								sx={ this.sxClasses.tableCell }
							>
								<Tooltip
									title={ orgName }
									open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsNumber(this.state.tooltips.nameResStaticObjTooltip) || (this.state.tooltips.nameResStaticObjTooltip != pos)) ? false : true) }
								>
									<Typography
										onMouseEnter={ (event: React.MouseEvent<HTMLElement>) => this.handTooltipChange(event, tooltipValues.nameResStaticObjTooltip, pos) }
										onMouseLeave={ (event: React.MouseEvent<HTMLElement>) => this.handTooltipChange(event, tooltipValues.nameResStaticObjTooltip, -1) }
										{ ...theme.r3Service.textTableContent }
										sx={ this.sxClasses.textTableContent }
									>
										{ stripName }
									</Typography>
								</Tooltip>
							</TableCell>

							<TableCell
								sx={ this.sxClasses.tableCell }
							>
								<Tooltip
									title={ orgJson }
									open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsNumber(this.state.tooltips.jsonResStaticObjTooltip) || (this.state.tooltips.jsonResStaticObjTooltip != pos)) ? false : true) }
								>
									<Typography
										onMouseEnter={ (event: React.MouseEvent<HTMLElement>) => this.handTooltipChange(event, tooltipValues.jsonResStaticObjTooltip, pos) }
										onMouseLeave={ (event: React.MouseEvent<HTMLElement>) => this.handTooltipChange(event, tooltipValues.jsonResStaticObjTooltip, -1) }
										{ ...theme.r3Service.textTableContent }
										sx={ this.sxClasses.textTableContent }
									>
										{ stripJson }
									</Typography>
								</Tooltip>
							</TableCell>
							<TableCell
								sx={ this.sxClasses.tableCell }
							>
								<Tooltip
									title={ r3provider.getR3TextRes().tResServiceDelStaticResTT }
									open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsNumber(this.state.tooltips.delResStaticObjTooltip) || (this.state.tooltips.delResStaticObjTooltip != pos)) ? false : true) }
								>
									<IconButton
										onClick={ (event) => this.handleDelStaticResourceObj(event, pos) }
										onMouseEnter={ (event) => this.handTooltipChange(event, tooltipValues.delResStaticObjTooltip, pos) }
										onMouseLeave={ (event) => this.handTooltipChange(event, tooltipValues.delResStaticObjTooltip, -1) }
										{ ...theme.r3Service.delResStaticObjButton }
										sx={ this.sxClasses.delResStaticObjButton }
										size="large"
									>
										<DeleteIcon />
									</IconButton>
								</Tooltip>
								<Tooltip
									title={ r3provider.getR3TextRes().tResServiceEditStaticResTT }
									open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsNumber(this.state.tooltips.editResStaticObjTooltip) || (this.state.tooltips.editResStaticObjTooltip != pos)) ? false : true) }
								>
									<IconButton
										onClick={ (event) => this.handleEditStaticResourceObj(event, pos) }
										onMouseEnter={ (event) => this.handTooltipChange(event, tooltipValues.editResStaticObjTooltip, pos) }
										onMouseLeave={ (event) => this.handTooltipChange(event, tooltipValues.editResStaticObjTooltip, -1) }
										{ ...theme.r3Service.editResStaticObjButton }
										sx={ this.sxClasses.editResStaticObjButton }
										size="large"
									>
										<EditIcon />
									</IconButton>
								</Tooltip>
							</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		);
	}

	renderServiceResourceStaticObj()
	{
		const { theme, r3provider } = this.props;

		if(!r3IsArray(this.state.serviceResStaticObject)){
			return;
		}

		let	tablehead = this.getResStaticObjTableHead();
		let	tablebody = this.getResStaticObjTableBody();
		let	textValue = JSON.stringify(this.state.serviceResStaticObject);

		return (
			<Box
				sx={ this.sxClasses.tableBox }
			>
				<Table
					{ ...theme.r3Service.table }
					sx={ this.sxClasses.table }
				>
					{ tablehead }
					{ tablebody }
				</Table>
				<TablePagination
					component={ 'div' }
					count={ this.state.serviceResStaticObject.length }
					rowsPerPage={ this.props.tableRawCount }
					page={ this.state.serviceResStaticObjPageNum }
					rowsPerPageOptions={ [] }
					onPageChange={ (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => this.handleResStaticObjPageChange(event, page) }
				/>
				<TextField
					name={ serviceComponentValues.resStaticObjTextFieldName }
					value={ textValue }
					disabled={ true }
					placeholder={ r3provider.getR3TextRes().tResServiceStaticObjHint }
					slotProps ={{ input: { sx: this.sxClasses.inputTextField } }}
					{ ...theme.r3Service.resourceTextField }
					sx={ this.sxClasses.staticResourceTextField }
				/>
			</Box>
		);
	}

	//
	// Render: Resource - Unknown
	//
	renderServiceResourceUnknown()
	{
		const { theme, r3provider } = this.props;

		return (
			<React.Fragment>
				<Typography
					{ ...theme.r3Service.unknownMessage }
					sx={ this.sxClasses.unknownMessage }
				>
					{ r3provider.getR3TextRes().tResServiceUnknownType }
				</Typography>
				<TextField
					name={ serviceComponentValues.resUnknownTextFieldName }
					value={ this.state.serviceResUnknown }
					disabled={ true }
					slotProps ={{ input: { sx: this.sxClasses.inputTextField } }}
					{ ...theme.r3Service.resourceTextField }
					sx={ this.sxClasses.resourceTextField }
				/>
			</React.Fragment>
		);
	}

	//
	// Render: Resource all
	//
	renderServiceResourceGroup()
	{
		const { theme, r3provider } = this.props;

		let	leftTypeSelectLabel = (
			<Typography
				{ ...theme.r3Resource.valueFormControlLabel }
			>
				{ r3provider.getR3TextRes().tResServiceResTypeUrl }
			</Typography>
		);
		let	rightTypeSelectLabel = (
			<Typography
				{ ...theme.r3Resource.valueFormControlLabel }
			>
				{ r3provider.getR3TextRes().tResServiceResTypeStatic }
			</Typography>
		);

		let	radioValue: string;
		let	serviceResource: React.ReactNode;
		if(serviceResTypeUrl == this.state.serviceResType){
			radioValue		= serviceResTypeUrl;
			serviceResource	= this.renderServiceResourceVerifyUrl();
		}else if(serviceResTypeObject == this.state.serviceResType){
			radioValue		= serviceResTypeObject;
			serviceResource	= this.renderServiceResourceStaticObj();
		}else{	// unknown
			radioValue		= serviceResTypeUnknown;
			serviceResource	= this.renderServiceResourceUnknown();
		}

		return (
			<React.Fragment>
				<RadioGroup
					name={ serviceComponentValues.serviceResourceTypeName }
					value={ radioValue }
					onChange={ (event, value) => this.handleResourceTypeChange(event, value) }
					{ ...theme.r3Service.valueRadioGroup }
					sx={ this.sxClasses.valueRadioGroup }
				>
					<FormControlLabel
						value={ serviceResTypeUrl }
						label={ leftTypeSelectLabel }
						disabled={ false }
						control={ <Radio /> }
						{ ...theme.r3Service.valueLeftFormControlLabel }
						sx={ this.sxClasses.valueLeftFormControlLabel }
					/>
					<FormControlLabel
						value={ serviceResTypeObject }
						label={ rightTypeSelectLabel }
						disabled={ false }
						control={ <Radio /> }
						{ ...theme.r3Service.valueRightFormControlLabel }
						sx={ this.sxClasses.valueRightFormControlLabel }
					/>
				</RadioGroup>
				{ serviceResource }
			</React.Fragment>
		);
	}

	//
	// Render: main
	//
	render()
	{
		console.log('CALL: service::render()');

		const { theme, r3provider } = this.props;

		let	serviceResourceGroup = this.renderServiceResourceGroup();

		return (
			<Box
				sx={ this.sxClasses.root }
			>
				<Typography
					{ ...theme.r3Service.subTitle }
					sx={ this.sxClasses.subTitleTop }
				>
					{ r3provider.getR3TextRes().tResServiceUrlResSubTitle }
				</Typography>
				{ serviceResourceGroup }

				<Typography
					{ ...theme.r3Service.subTitle }
					sx={ this.sxClasses.subTitle }
				>
					{ r3provider.getR3TextRes().tResServiceTenantsSubTitle }
				</Typography>
				{ this.getTenantsContents(this.state.service.tenant) }
				{ this.getAddTenantsContents() }

				<R3FormButtons
					theme={ theme }
					r3provider={ this.props.r3provider }
					status={ this.state.changed }
					onSave={ (event: React.MouseEvent<HTMLElement>) => this.handleSave(event) }
					onCancel={ (event: React.MouseEvent<HTMLElement>) => this.handleCancel(event) }
				/>

				<R3CreateServiceDialog
					theme={ theme }
					r3provider={ this.props.r3provider }
					open={ this.state.staticResourceDialog }
					createMode={ false }
					newStaticRes={ this.state.staticResourceObject }
					onCheckConflictName={ this.handleCheckStaticResourceName }
					onClose={ this.handleCloseStaticResourceDialog }
				/>
				<R3PopupMsgDialog
					theme={ theme }
					r3provider={ this.props.r3provider }
					title={ this.props.r3provider.getR3TextRes().cUpdatingTitle }
					r3Message={ this.state.confirmMessageObject }
					twoButton={ true }
					onClose={ this.handleConfirmDialogClose }
				/>
				<R3PopupMsgDialog
					theme={ theme }
					r3provider={ this.props.r3provider }
					r3Message={ this.state.messageDialogObject }
					onClose={ this.handleMessageDialogClose }
				/>
			</Box>
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
