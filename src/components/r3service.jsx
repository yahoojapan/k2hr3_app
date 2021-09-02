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
 * CREATE:   Tue Nov 21 2017
 * REVISION:
 *
 */

import React						from 'react';
import ReactDOM						from 'react-dom';						// eslint-disable-line no-unused-vars
import PropTypes					from 'prop-types';

import { withTheme, withStyles }	from '@material-ui/core/styles';		// decorator
import TextField					from '@material-ui/core/TextField';
import Typography					from '@material-ui/core/Typography';
import IconButton					from '@material-ui/core/IconButton';
import Box							from '@material-ui/core/Box';
import FormControlLabel				from '@material-ui/core/FormControlLabel';
import RadioGroup					from '@material-ui/core/RadioGroup';
import Radio						from '@material-ui/core/Radio';
import Table						from '@material-ui/core/Table';
import TableBody					from '@material-ui/core/TableBody';
import TableCell					from '@material-ui/core/TableCell';
import TableHead					from '@material-ui/core/TableHead';
import TablePagination				from '@material-ui/core/TablePagination';
import TableRow						from '@material-ui/core/TableRow';
import Tooltip						from '@material-ui/core/Tooltip';
import DeleteIcon					from '@material-ui/icons/ClearRounded';
import AddIcon						from '@material-ui/icons/AddRounded';
import EditIcon						from '@material-ui/icons/Edit';

import { r3Service }				from './r3styles';
import R3FormButtons				from './r3formbuttons';					// Buttons
import R3Message					from '../util/r3message';
import R3CreateServiceDialog		from './r3createservicedialog';
import R3PopupMsgDialog				from './r3popupmsgdialog';

import { regYrnTenantPathPrefix, regYrnAnyTenantPath }	from '../util/r3define';
import { getServiceResourceType, normalizeServiceReourceStaticObject }	from '../util/r3verifyutil';
import { errorType, actionTypeValue, actionTypeDelete, actionTypeAdd, serviceResTypeUrl, serviceResTypeObject, serviceResTypeUnknown }	from '../util/r3types';
import { r3DeepClone, r3DeepCompare, r3CompareCaseString, r3IsEmptyEntityObject, r3IsEmptyString, r3IsEmptyEntity, r3IsSafeTypedEntity, r3IsJSON, r3ConvertFromJSON } from '../util/r3util';

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
@withTheme
@withStyles(r3Service)
export default class R3Service extends React.Component
{
	static contextTypes = {
		r3Context:		PropTypes.object.isRequired
	};

	static propTypes = {
		r3provider:		PropTypes.object.isRequired,
		tenant:			PropTypes.string.isRequired,
		service:		PropTypes.object.isRequired,
		dispUnique:		PropTypes.number.isRequired,
		tableRawCount:	PropTypes.number,
		onSave:			PropTypes.func.isRequired,
		onUpdate:		PropTypes.func.isRequired
	};

	static defaultProps = {
		tableRawCount:	5
	};

	static orgServiceResource = {
		serviceResType:				null,
		serviceResVerifyUrl:		null,
		serviceResStaticObject:		null,
		serviceResUnknown:			null,
	};

	state = R3Service.createState(this.props.service, this.props.dispUnique);

	constructor(props)
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
	static getDerivedStateFromProps(nextProps, prevState)
	{
		if(nextProps.dispUnique !== prevState.dispUnique){
			// Switching content
			return R3Service.createState(nextProps.service, nextProps.dispUnique);
		}
		return null;	// Return null to indicate no change to state.
	}

	static createState(service, dispUnique)
	{
		// keep original analyzed verify data
		R3Service.orgServiceResource.serviceResType				= getServiceResourceType(service.verify);
		R3Service.orgServiceResource.serviceResVerifyUrl		= '';
		R3Service.orgServiceResource.serviceResStaticObject		= [];
		R3Service.orgServiceResource.serviceResUnknown			= '';

		if(R3Service.orgServiceResource.serviceResType == serviceResTypeUrl){
			R3Service.orgServiceResource.serviceResVerifyUrl	= service.verify;
		}else if(R3Service.orgServiceResource.serviceResType == serviceResTypeObject){
			R3Service.orgServiceResource.serviceResStaticObject	= normalizeServiceReourceStaticObject(service.verify);
		}else{	// serviceResTypeUnknown
			R3Service.orgServiceResource.serviceResUnknown		= JSON.stringify(service.verify);
		}

		// new state
		return {
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
	}

	//
	// Check all state
	//
	isChangedState(newResType, newVerify, newTenants)
	{
		let	is_changed	= false;

		// check verify
		if(newResType != R3Service.orgServiceResource.serviceResType){
			is_changed	= true;
		}else{
			if(newResType == serviceResTypeUrl && newVerify != R3Service.orgServiceResource.serviceResVerifyUrl){
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
		if(r3IsSafeTypedEntity(newTenants, 'array')){
			if(r3IsEmptyEntity(this.props.service) || !r3IsSafeTypedEntity(this.props.service.tenant, 'array')){
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
	handleSave(event)														// eslint-disable-line no-unused-vars
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
		let	errorMessage;
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
		if(!r3IsSafeTypedEntity(newService.tenant, 'array')){
			newService.tenant = [];
		}
		// check empty and yrn path by regex
		let	regTenantPath = new RegExp(regYrnAnyTenantPath);
		let	cnt;
		let	cnt2;
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
	handleCancel(event)														// eslint-disable-line no-unused-vars
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
	handleConfirmDialogClose(event, reason, result)							// eslint-disable-line no-unused-vars
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
	handleMessageDialogClose(event, reason, result)							// eslint-disable-line no-unused-vars
	{
		this.setState({
			messageDialogObject:	null
		});
	}

	//
	// Handle Verify Value : Change
	//
	handleVerifyChange(event)
	{
		let	newValue = r3IsEmptyEntityObject(event.target, 'value') ? null : event.target.value;

		if(!r3IsSafeTypedEntity(newValue, 'string')){
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
	handleTenantsChange(event, type, pos)
	{
		let	changedValue	= r3IsEmptyEntityObject(event.target, 'value') ? null : event.target.value;
		let	newTenants		= [];
		if(r3IsSafeTypedEntity(this.state.service.tenant, 'array')){
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
		let	nowVerify;
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
	handleAddTenantsChange(event)
	{
		// update state
		this.setState({
			addTenant:		event.target.value
		});
	}

	handTooltipChange = (event, type, extData) =>							// eslint-disable-line no-unused-vars
	{
		if(tooltipValues.deleteTenantTooltip === type){
			this.setState({
				tooltips: {
					deleteTenantTooltip:		extData
				}
			});
		}else if(tooltipValues.addTenantTooltip === type){
			this.setState({
				tooltips: {
					addTenantTooltip:			extData
				}
			});
		}else if(tooltipValues.nameResStaticObjTooltip === type){
			this.setState({
				tooltips: {
					nameResStaticObjTooltip:	extData
				}
			});
		}else if(tooltipValues.jsonResStaticObjTooltip === type){
			this.setState({
				tooltips: {
					jsonResStaticObjTooltip:	extData
				}
			});
		}else if(tooltipValues.addResStaticObjTooltip === type){
			this.setState({
				tooltips: {
					addResStaticObjTooltip:		extData
				}
			});
		}else if(tooltipValues.delResStaticObjTooltip === type){
			this.setState({
				tooltips: {
					delResStaticObjTooltip:		extData
				}
			});
		}else if(tooltipValues.editResStaticObjTooltip === type){
			this.setState({
				tooltips: {
					editResStaticObjTooltip:	extData
				}
			});
		}
	}

	getTenantsContents(items)
	{
		const { theme, classes, r3provider } = this.props;

		if(!r3IsSafeTypedEntity(items, 'array')){
			return;
		}

		let	tenantYrn = regYrnTenantPathPrefix + this.props.tenant;

		return (
			items.map( (item, pos) =>
			{
				if(r3CompareCaseString(tenantYrn, item)){
					// item is owner tenant, this value could not change.
					return;
				}

				let	deleteButton = (
					<Tooltip
						title={ r3provider.getR3TextRes().tResServiceTenantDelTT }
						open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.deleteTenantTooltip, 'number') || (this.state.tooltips.deleteTenantTooltip != pos)) ? false : true) }
					>
						<IconButton
							onClick={ (event) => this.handleTenantsChange(event, actionTypeDelete, pos) }
							onMouseEnter={ (event) => this.handTooltipChange(event, tooltipValues.deleteTenantTooltip, pos) }
							onMouseLeave={ (event) => this.handTooltipChange(event, tooltipValues.deleteTenantTooltip, -1) }
							{ ...theme.r3Service.deleteTenantButton }
							className={ classes.deleteTenantButton }
						>
							<DeleteIcon />
						</IconButton>
					</Tooltip>
				);

				return (
					<div
						key={ pos }
						className={ classes.enclosureElement }
					>
						<TextField
							name={ serviceComponentValues.tenantTextFieldNamePrefix + String(pos) }
							value={ item }
							placeholder={ r3provider.getR3TextRes().tResServiceTenantHint }
							onChange={ (event) => this.handleTenantsChange(event, actionTypeValue, pos) }
							InputProps={{ className: classes.inputTextField }}
							{ ...theme.r3Service.tenantTextField }
							className={ classes.tenantTextField }
						/>
						{ deleteButton }
					</div>
				);
			})
		);
	}

	getAddTenantsContents()
	{
		const { theme, classes, r3provider } = this.props;

		return (
			<div
				className={ classes.enclosureElement }
			>
				<TextField
					name={ serviceComponentValues.tenantNewTextFieldName }
					value={ this.state.addTenant }
					placeholder={ r3provider.getR3TextRes().tResServiceTenantHint }
					onChange={ (event) => this.handleAddTenantsChange(event) }
					InputProps={{ className: classes.inputTextField }}
					{ ...theme.r3Service.tenantTextField }
					className={ classes.tenantTextField }
				/>

				<Tooltip
					title={ r3provider.getR3TextRes().tResServiceTenantAddTT }
					open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.addTenantTooltip, 'boolean')) ? false : this.state.tooltips.addTenantTooltip) }
				>
					<IconButton
						onClick={ (event) => this.handleTenantsChange(event, actionTypeAdd, 0) }
						onMouseEnter={ (event) => this.handTooltipChange(event, tooltipValues.addTenantTooltip, true) }
						onMouseLeave={ (event) => this.handTooltipChange(event, tooltipValues.addTenantTooltip, false) }
						{ ...theme.r3Service.addTenantButton }
						className={ classes.addTenantButton }
					>
						<AddIcon />
					</IconButton>
				</Tooltip>
			</div>
		);
	}

	//
	// Handle Service resource type : Change
	//
	handleResourceTypeChange(event, type)									// eslint-disable-line no-unused-vars
	{
		if(this.state.serviceResType === type){
			console.warn('changed value type(' + JSON.stringify(type) + ') is something wrong.');
			return;
		}
		let	newResType	= type;
		let	newVerify;
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
	handleNewStaticResourceObj(event)										// eslint-disable-line no-unused-vars
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
	handleDelStaticResourceObj(event, pos)									// eslint-disable-line no-unused-vars
	{
		if(!r3IsSafeTypedEntity(this.state.serviceResStaticObject, 'array')){
			return;
		}
		if(this.state.serviceResStaticObject.length <= pos){
			return;
		}

		// remove resouce
		let newStaticRes = this.state.serviceResStaticObject.filter( (item, itemPos) => itemPos !== pos);

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
	handleEditStaticResourceObj(event, pos)									// eslint-disable-line no-unused-vars
	{
		if(!r3IsSafeTypedEntity(this.state.serviceResStaticObject, 'array')){
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
		}else if(r3IsJSON(oneStaticRes.data)){
			let	tempobj = r3ConvertFromJSON(oneStaticRes.data);
			if(r3IsSafeTypedEntity(tempobj, 'string')){
				// data is JSON formatted, but it is string -> type: string
				oneStaticRes.type				= 'string';
				oneStaticRes.editingObjectData	= '';
				oneStaticRes.editingStringData	= tempobj;
			}else if(r3IsSafeTypedEntity(tempobj, 'number')){
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
		}else if(r3IsSafeTypedEntity(oneStaticRes.data, 'string')){
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
	handleCloseStaticResourceDialog(event, reason, isAgree, newOneStaticRes)	// eslint-disable-line no-unused-vars
	{
		if(!isAgree){
			this.setState({
				staticResourceDialog:		false,
				staticResourceObjectPos:	-1,
				staticResourceObject:		[]
			});
			return;
		}

		// add/edit new static resource
		let newStaticRes = r3DeepClone(this.state.serviceResStaticObject);
		if(0 <= this.state.staticResourceObjectPos && this.state.staticResourceObjectPos < newStaticRes.length){
			newStaticRes[this.state.staticResourceObjectPos] = newOneStaticRes;
		}else{
			newStaticRes.push(newOneStaticRes);
		}

		// set parent changed state
		let	changed			= this.isChangedState(this.state.serviceResType, newStaticRes, this.state.service.tenant);
		this.props.onUpdate(changed);

		// update state
		this.setState({
			serviceResStaticObject:		newStaticRes,
			changed:					changed,

			staticResourceDialog:		false,
			staticResourceObjectPos:	-1,
			staticResourceObject:		[]
		});
	}

	//
	// Handle Check conflict static resource name
	//
	handleCheckStaticResourceName(staticResName)
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
	handleResStaticObjPageChange(event, page)								// eslint-disable-line no-unused-vars
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
		const { theme, classes, r3provider } = this.props;

		return (
			<TextField
				name={ serviceComponentValues.verifyUrlResourceName }
				value={ this.state.serviceResVerifyUrl }
				placeholder={ r3provider.getR3TextRes().tResServiceUrlResHint }
				onChange={ (event) => this.handleVerifyChange(event) }
				InputProps={{ className: classes.inputTextField }}
				{ ...theme.r3Service.resourceTextField }
				className={ classes.resourceTextField }
			/>
		);
	}

	//
	// Render: Resource - Static resource object
	//
	getResStaticObjTableHead()
	{
		const { theme, classes, r3provider } = this.props;

		return (
			<TableHead
				className={ classes.tableHead }
			>
				<TableRow>
					<TableCell
						className={ classes.tableCell }
					>
						<Typography
							{ ...theme.r3Service.textTableHead }
							className={ classes.textTableHead }
						>
							{ r3provider.getR3TextRes().tResServiceNameTableHead }
						</Typography>
					</TableCell>
					<TableCell
						className={ classes.tableCell }
					>
						<Typography
							{ ...theme.r3Service.textTableHead }
							className={ classes.textTableHead }
						>
							{ r3provider.getR3TextRes().tResServiceJsonTableHead }
						</Typography>
					</TableCell>
					<TableCell
						className={ classes.tableCell }
					>
						<Tooltip
							title={ r3provider.getR3TextRes().tResServiceAddStaticResTT }
							open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.addResStaticObjTooltip, 'boolean')) ? false : this.state.tooltips.addResStaticObjTooltip) }
						>
							<IconButton
								onClick={ this.handleNewStaticResourceObj }
								onMouseEnter={ (event) => this.handTooltipChange(event, tooltipValues.addResStaticObjTooltip, true) }
								onMouseLeave={ (event) => this.handTooltipChange(event, tooltipValues.addResStaticObjTooltip, false) }
								{ ...theme.r3Service.addResStaticObjButton }
								className={ classes.addResStaticObjButton }
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
		const { theme, classes, r3provider } = this.props;

		if(!r3IsSafeTypedEntity(this.state.serviceResStaticObject, 'array')){
			return;
		}
		let	resources = this.state.serviceResStaticObject;

		return (
			<TableBody>
				{resources.map( (item, pos) => {
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
								className={ classes.tableCell }
							>
								<Tooltip
									title={ orgName }
									open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.nameResStaticObjTooltip, 'number') || (this.state.tooltips.nameResStaticObjTooltip != pos)) ? false : true) }
								>
									<Typography
										onMouseEnter={ (event) => this.handTooltipChange(event, tooltipValues.nameResStaticObjTooltip, pos) }
										onMouseLeave={ (event) => this.handTooltipChange(event, tooltipValues.nameResStaticObjTooltip, -1) }
										{ ...theme.r3Service.textTableContent }
										className={ classes.textTableContent }
									>
										{ stripName }
									</Typography>
								</Tooltip>
							</TableCell>

							<TableCell
								className={ classes.tableCell }
							>
								<Tooltip
									title={ orgJson }
									open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.jsonResStaticObjTooltip, 'number') || (this.state.tooltips.jsonResStaticObjTooltip != pos)) ? false : true) }
								>
									<Typography
										onMouseEnter={ (event) => this.handTooltipChange(event, tooltipValues.jsonResStaticObjTooltip, pos) }
										onMouseLeave={ (event) => this.handTooltipChange(event, tooltipValues.jsonResStaticObjTooltip, -1) }
										{ ...theme.r3Service.textTableContent }
										className={ classes.textTableContent }
									>
										{ stripJson }
									</Typography>
								</Tooltip>
							</TableCell>
							<TableCell
								className={ classes.tableCell }
							>
								<Tooltip
									title={ r3provider.getR3TextRes().tResServiceDelStaticResTT }
									open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.delResStaticObjTooltip, 'number') || (this.state.tooltips.delResStaticObjTooltip != pos)) ? false : true) }
								>
									<IconButton
										onClick={ (event) => this.handleDelStaticResourceObj(event, pos) }
										onMouseEnter={ (event) => this.handTooltipChange(event, tooltipValues.delResStaticObjTooltip, pos) }
										onMouseLeave={ (event) => this.handTooltipChange(event, tooltipValues.delResStaticObjTooltip, -1) }
										{ ...theme.r3Service.delResStaticObjButton }
										className={ classes.delResStaticObjButton }
									>
										<DeleteIcon />
									</IconButton>
								</Tooltip>
								<Tooltip
									title={ r3provider.getR3TextRes().tResServiceEditStaticResTT }
									open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.editResStaticObjTooltip, 'number') || (this.state.tooltips.editResStaticObjTooltip != pos)) ? false : true) }
								>
									<IconButton
										onClick={ (event) => this.handleEditStaticResourceObj(event, pos) }
										onMouseEnter={ (event) => this.handTooltipChange(event, tooltipValues.editResStaticObjTooltip, pos) }
										onMouseLeave={ (event) => this.handTooltipChange(event, tooltipValues.editResStaticObjTooltip, -1) }
										{ ...theme.r3Service.editResStaticObjButton }
										className={ classes.editResStaticObjButton }
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
		const { theme, classes, r3provider } = this.props;

		if(!r3IsSafeTypedEntity(this.state.serviceResStaticObject, 'array')){
			return;
		}

		let	tablehead = this.getResStaticObjTableHead();
		let	tablebody = this.getResStaticObjTableBody();
		let	textValue = JSON.stringify(this.state.serviceResStaticObject);

		return (
			<Box
				className={ classes.tableBox }
			>
				<Table
					{ ...theme.r3Service.table }
					className={ classes.table }
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
					onChangePage={ (event) => this.handleResStaticObjPageChange(event) }
				/>
				<TextField
					name={ serviceComponentValues.resStaticObjTextFieldName }
					value={ textValue }
					disabled={ true }
					placeholder={ r3provider.getR3TextRes().tResServiceStaticObjHint }
					InputProps={{ className: classes.inputTextField }}
					{ ...theme.r3Service.resourceTextField }
					className={ classes.staticResourceTextField }
				/>
			</Box>
		);
	}

	//
	// Render: Resource - Unknown
	//
	renderServiceResourceUnknown()
	{
		const { theme, classes, r3provider } = this.props;

		return (
			<React.Fragment>
				<Typography
					{ ...theme.r3Service.unknownMessage }
					className={ classes.unknownMessage }
				>
					{ r3provider.getR3TextRes().tResServiceUnknownType }
				</Typography>
				<TextField
					name={ serviceComponentValues.resUnknownTextFieldName }
					value={ this.state.serviceResUnknown }
					disabled={ true }
					InputProps={{ className: classes.inputTextField }}
					{ ...theme.r3Service.resourceTextField }
					className={ classes.resourceTextField }
				/>
			</React.Fragment>
		);
	}

	//
	// Render: Resource all
	//
	renderServiceResourceGroup()
	{
		const { theme, classes, r3provider } = this.props;

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

		let	radioValue;
		let	serviceResource;
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
					onChange={ (event) => this.handleResourceTypeChange(event) }
					{ ...theme.r3Service.valueRadioGroup }
					className={ classes.valueRadioGroup }
				>
					<FormControlLabel
						value={ serviceResTypeUrl }
						label={ leftTypeSelectLabel }
						disabled={ false }
						control={ <Radio /> }
						{ ...theme.r3Service.valueLeftFormControlLabel }
						className={ classes.valueLeftFormControlLabel }
					/>
					<FormControlLabel
						value={ serviceResTypeObject }
						label={ rightTypeSelectLabel }
						disabled={ false }
						control={ <Radio /> }
						{ ...theme.r3Service.valueRightFormControlLabel }
						className={ classes.valueRightFormControlLabel }
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

		const { theme, classes, r3provider } = this.props;

		let	serviceResourceGroup = this.renderServiceResourceGroup();

		return (
			<div
				className={ classes.root }
			>
				<Typography
					{ ...theme.r3Service.subTitle }
					className={ classes.subTitleTop }
				>
					{ r3provider.getR3TextRes().tResServiceUrlResSubTitle }
				</Typography>
				{ serviceResourceGroup }

				<Typography
					{ ...theme.r3Service.subTitle }
					className={ classes.subTitle }
				>
					{ r3provider.getR3TextRes().tResServiceTenantsSubTitle }
				</Typography>
				{ this.getTenantsContents(this.state.service.tenant) }
				{ this.getAddTenantsContents() }

				<R3FormButtons
					r3provider={ this.props.r3provider }
					status={ this.state.changed }
					onSave={ (event) => this.handleSave(event) }
					onCancel={ (event) => this.handleCancel(event) }
				/>

				<R3CreateServiceDialog
					r3provider={ this.props.r3provider }
					open={ this.state.staticResourceDialog }
					createMode={ false }
					newStaticRes={ this.state.staticResourceObject }
					onCheckConflictName={ this.handleCheckStaticResourceName }
					onClose={ this.handleCloseStaticResourceDialog }
				/>
				<R3PopupMsgDialog
					r3provider={ this.props.r3provider }
					title={ this.props.r3provider.getR3TextRes().cUpdatingTitle }
					r3Message={ this.state.confirmMessageObject }
					twoButton={ true }
					onClose={ this.handleConfirmDialogClose }
				/>
				<R3PopupMsgDialog
					r3provider={ this.props.r3provider }
					r3Message={ this.state.messageDialogObject }
					onClose={ this.handleMessageDialogClose }
				/>
			</div>
		);
	}
}

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
