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
 * CREATE:   Fri Nov 24 2017
 * REVISION:
 *
 */

import React						from 'react';

import TextField					from '@mui/material/TextField';
import Button						from '@mui/material/Button';
import Dialog						from '@mui/material/Dialog';
import DialogTitle					from '@mui/material/DialogTitle';
import DialogContent				from '@mui/material/DialogContent';
import DialogActions				from '@mui/material/DialogActions';
import Typography					from '@mui/material/Typography';
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
import Popover						from '@mui/material/Popover';

import AddIcon						from '@mui/icons-material/AddBoxRounded';
import DeleteIcon					from '@mui/icons-material/Delete';
import EditIcon						from '@mui/icons-material/Edit';
import CheckCircleIcon				from '@mui/icons-material/CheckCircle';
import CancelIcon					from '@mui/icons-material/Cancel';

import R3Provider					from '../util/r3provider';
import type { R3Theme }				from './r3theme';
import { r3CreateServiceDialogStyle }	from './r3styles';
import { StaticResourceObject, isStaticResourceObject, serviceResTypeUrl, serviceResTypeObject, ServiceResType, resourceTypeObject, resourceTypeString, ResourceType, isServiceResType, valTypeAllObject }	from '../util/r3types';
import { r3IsString, r3IsArray, r3IsObject, r3IsFunction, r3IsBoolean, r3IsNumber, r3DeepClone, r3IsEmptyEntity, r3IsEmptyString, r3IsEmptyStringObject, r3IsEmptyEntityObject, r3IsJSON, r3GetDecNumber, r3HasKey } from '../util/r3util';

//
// Interfaces / Types
//
type R3CreateServiceDialogRequiredProps = {
	theme:						R3Theme;
	r3provider:					R3Provider;
	createMode:					boolean;									// Create mode(has main page) or only edit static resource mode(no main page)
	onClose:					(event: {}, reason: string | null, isAgree: boolean, newServiceName: string | null, newServiceResType: ServiceResType | null, newVerify: string | null, newStaticRes: StaticResourceObject[] | null) => void;
};

type R3CreateServiceDialogOptionProps = {
	open?:						boolean;
	tenant?:					{ display?: string; name?: string } | null;	// Do not care for createMode(false)
	newServiceName?:			string;
	newServiceResType?:			ServiceResType;
	newVerify?:					string;
	newStaticRes?:				StaticResourceObject[];
	tableRawCount?:				number;
	tableKeysRawCount?:			number;

	// [NOTE]
	// Called to check for duplicate static resource names when
	// createMode(false) is specified. If it is not set, it will
	// not be called.
	//
	onCheckConflictName?:	((name: string) => boolean) | null;
};

type R3CreateServiceDialogProps = R3CreateServiceDialogRequiredProps & R3CreateServiceDialogOptionProps;

type TooltipState = {
	addResStaticObjTooltip?:	boolean;
	editResStaticObjTooltip?:	number;
	delResStaticObjTooltip?:	number;
	nameResStaticObjTooltip?:	number;
	jsonResStaticObjTooltip?:	number;
	addStaticResKeyTooltip?:	boolean;
	editStaticResKeyTooltip?:	number;
	delStaticResKeyTooltip?:	number;
	nameStaticResKeyTooltip?:	number;
	jsonStaticResKeyTooltip?:	number;
}

type TooltipStateAll		= Required<TooltipState>;
type TooltipStateStrings	= Record<keyof TooltipState, string>;

type R3CreateServiceDialogState = {
	open?:						boolean;
	editingStaticResMode?:		boolean;									// Main page(all service resource) or Sub page(one static resource)

	// main page
	newServiceName?:			string;
	newServiceResType?:			ServiceResType;
	newVerify?:					string;
	newStaticRes?:				StaticResourceObject[];
	staticResPageNum?:			number;

	// edit one static resource(sub page)
	editingStaticResNew?:		boolean;									// Set to true for new creation
	editingStaticResPos?:		number;
	editingStaticRes?:			StaticResourceObject | null;
	staticResMessage?:			string | null;
	staticResKeysPageNum?:		number;
	staticResKeyAnchorEl?:		HTMLElement | null;
	staticResKeyCreateType?:	boolean;
	staticResKeyBaseKey?:		string | null;

	// edit one key-value in static resource(popover)
	editingStaticResKey?:		string | null;
	editingStaticResValue?:		string | null;
	editingComfirmMessage?:		string | null;

	// tooltips
	tooltips?:					TooltipState;
};

type R3CreateServiceDialogStateAll	= Required<R3CreateServiceDialogState>;

type R3CreateServiceDialogStyleType = ReturnType<typeof r3CreateServiceDialogStyle>;

//
// Local variables
//
const dialogComponentsIds = {
	serviceTextFieldId:				'new-service-textfield-id',
	verifyTextFieldId:				'new-verify-textfield-id',
	serviceRadioGroupId:			'new-service-radiogroup-id',
	staticObjTextFieldId:			'new-staticobj-textfield-id',
	staticObjNameTextFieldId:		'new-staticobjname-textfield-id',
	staticObjExpireTextFieldId:		'new-staticobjexp-textfield-id',
	staticObjTypeGroupId:			'new-staticobjtype-radiogroup-id',
	staticObjDataTextFieldId:		'new-staticobjdata-textfield-id',
	staticObjKeyTextFieldId:		'new-staticobjkey-textfield-id',
	staticObjValTextFieldId:		'new-staticobjval-textfield-id',
};

const tooltipValues: TooltipStateStrings = {
	addResStaticObjTooltip:			'addResStaticObjTooltip',
	editResStaticObjTooltip:		'editResStaticObjTooltip',
	delResStaticObjTooltip:			'delResStaticObjTooltip',
	nameResStaticObjTooltip:		'nameResStaticObjTooltip',
	jsonResStaticObjTooltip:		'jsonResStaticObjTooltip',
	addStaticResKeyTooltip:			'addStaticResKeyTooltip',
	editStaticResKeyTooltip:		'editStaticResKeyTooltip',
	delStaticResKeyTooltip:			'delStaticResKeyTooltip',
	nameStaticResKeyTooltip:		'nameStaticResKeyTooltip',
	jsonStaticResKeyTooltip:		'jsonStaticResKeyTooltip'
};

const disableAllToolTip: TooltipStateAll = {
	addResStaticObjTooltip:			false,
	editResStaticObjTooltip:		-1,
	delResStaticObjTooltip:			-1,
	nameResStaticObjTooltip:		-1,
	jsonResStaticObjTooltip:		-1,
	addStaticResKeyTooltip:			false,
	editStaticResKeyTooltip:		-1,
	delStaticResKeyTooltip:			-1,
	nameStaticResKeyTooltip:		-1,
	jsonStaticResKeyTooltip:		-1
};

const staticResDataType = {
	staticResStringDataType:		'staticResStringDataType',
	staticResObjectDataType:		'staticResObjectDataType'
};

const defaultStaticResourceObj: StaticResourceObject = {
	name:							'',
	expire:							null,
	type:							resourceTypeString,
	data:							null,
	keys:							{},
	editingStringData:				'',										// Temporary member being edited
	editingObjectData:				''										// Temporary member being edited
};

//
// Create New Path Dialog Class
//
export default class R3CreateServiceDialog extends React.Component<R3CreateServiceDialogProps, R3CreateServiceDialogState>
{
	sxClasses: R3CreateServiceDialogStyleType;

	static defaultProps: R3CreateServiceDialogOptionProps = {
		open:					false,
		tenant:					null,
		newServiceName:			'',
		newServiceResType:		serviceResTypeUrl,
		newVerify:				'',
		newStaticRes:			[],
		tableRawCount:			3,
		tableKeysRawCount:		3,
		onCheckConflictName:	null
	};

	state: R3CreateServiceDialogStateAll = {
		open:					this.props.open,
		editingStaticResMode:	(this.props.createMode ? false : true),		// Main page(all service resource) or Sub page(one static resource)

		// main page
		newServiceName:			this.props.newServiceName,
		newServiceResType:		this.props.newServiceResType,
		newVerify:				this.props.newVerify,
		newStaticRes:			this.props.newStaticRes,
		staticResPageNum:		0,

		// edit one static resource(sub page)
		editingStaticResNew:	true,										// Set to true for new creation
		editingStaticResPos:	-1,
		editingStaticRes:		((!this.props.createMode && 0 < this.props.newStaticRes.length) ? r3DeepClone(this.props.newStaticRes[0]) : r3DeepClone(defaultStaticResourceObj)),
		staticResMessage:		null,
		staticResKeysPageNum:	0,
		staticResKeyAnchorEl:	null,
		staticResKeyCreateType:	true,
		staticResKeyBaseKey:	null,

		// edit one key-value in static resource(popover)
		editingStaticResKey:	null,
		editingStaticResValue:	null,
		editingComfirmMessage:	null,

		// tooltips
		tooltips: 				disableAllToolTip
	};

	constructor(props: R3CreateServiceDialogProps)
	{
		super(props);

		// Binding(do not define handlers as arrow functions for performance)
		this.handleNewServiceNameChange		= this.handleNewServiceNameChange.bind(this);
		this.handleNewVerifyChange			= this.handleNewVerifyChange.bind(this);
		this.handleResourceTypeChange		= this.handleResourceTypeChange.bind(this);
		this.handleResStaticObjPageChange	= this.handleResStaticObjPageChange.bind(this);
		this.handleNewStaticResourceObj		= this.handleNewStaticResourceObj.bind(this);
		this.handleDelStaticResourceObj		= this.handleDelStaticResourceObj.bind(this);
		this.handleEditStaticResourceObj	= this.handleEditStaticResourceObj.bind(this);

		// edit one static resource(sub page)
		this.handleStaticResNameChange		= this.handleStaticResNameChange.bind(this);
		this.handleStaticResExpireChange	= this.handleStaticResExpireChange.bind(this);
		this.handleStaticResTypeChange		= this.handleStaticResTypeChange.bind(this);
		this.handleStaticResDataChange		= this.handleStaticResDataChange.bind(this);
		this.handleStaticResPageClose		= this.handleStaticResPageClose.bind(this);

		// edit one key-value in static resource(popover)
		this.handleStaticResKeysPageChange	= this.handleStaticResKeysPageChange.bind(this);
		this.handleDelStaticResKey			= this.handleDelStaticResKey.bind(this);
		this.handleNewStaticResKey			= this.handleNewStaticResKey.bind(this);
		this.handleEditStaticResKey			= this.handleEditStaticResKey.bind(this);
		this.handleCancelStaticResKey		= this.handleCancelStaticResKey.bind(this);
		this.handleConfirmStaticResKey		= this.handleConfirmStaticResKey.bind(this);
		this.handleStaticResKeysKeyChange	= this.handleStaticResKeysKeyChange.bind(this);
		this.handleStaticResKeysValChange	= this.handleStaticResKeysValChange.bind(this);

		// styles
		this.sxClasses						= r3CreateServiceDialogStyle(props.theme);
	}

	// [NOTE]
	// Use getDerivedStateFromProps by deprecating componentWillReceiveProps in React 17.x.
	// The only purpose is to set the state data from props when the dialog changes from hidden to visible.
	//
	static getDerivedStateFromProps(nextProps: R3CreateServiceDialogProps, prevState: R3CreateServiceDialogState): R3CreateServiceDialogState | null
	{
		if(prevState.open != nextProps.open){
			let	newState: R3CreateServiceDialogState = {
				editingStaticResMode:	(nextProps.createMode ? false : true),

				newServiceName:			nextProps.newServiceName,
				newServiceResType:		nextProps.newServiceResType,
				newVerify:				nextProps.newVerify,
				newStaticRes:			nextProps.newStaticRes,
				staticResPageNum:		0,

				editingStaticResNew:	true,
				editingStaticResPos:	-1,
				editingStaticRes:		((!nextProps.createMode && 0 < nextProps.newStaticRes.length) ? r3DeepClone(nextProps.newStaticRes[0]) : r3DeepClone(defaultStaticResourceObj)),
				staticResMessage:		null,
				staticResKeysPageNum:	0,
				staticResKeyAnchorEl:	null,
				staticResKeyCreateType:	true,
				staticResKeyBaseKey:	null,
				editingStaticResKey:	null,
				editingStaticResValue:	null,
				editingComfirmMessage:	null,

				open:					nextProps.open
			};
			return newState;
		}
		return null;														// Return null to indicate no change to state.
	}

	//
	// Handle Tooltip Change
	//
	handTooltipChange = (event: React.SyntheticEvent, type: string, extData: boolean | number) =>
	{
		if(tooltipValues.addResStaticObjTooltip === type){
			let	newTooltips: TooltipState = {
				addResStaticObjTooltip:		(r3IsBoolean(extData) ? extData : false)
			};
			this.setState({ tooltips : newTooltips });

		}else if(tooltipValues.editResStaticObjTooltip === type){
			let	newTooltips: TooltipState = {
				editResStaticObjTooltip:	(r3IsNumber(extData) ? extData : -1)
			};
			this.setState({ tooltips : newTooltips });

		}else if(tooltipValues.delResStaticObjTooltip === type){
			let	newTooltips: TooltipState = {
				delResStaticObjTooltip:		(r3IsNumber(extData) ? extData : -1)
			};
			this.setState({ tooltips : newTooltips });

		}else if(tooltipValues.nameResStaticObjTooltip === type){
			let	newTooltips: TooltipState = {
				nameResStaticObjTooltip:	(r3IsNumber(extData) ? extData : -1)
			};
			this.setState({ tooltips : newTooltips });

		}else if(tooltipValues.jsonResStaticObjTooltip === type){
			let	newTooltips: TooltipState = {
				jsonResStaticObjTooltip:	(r3IsNumber(extData) ? extData : -1)
			};
			this.setState({ tooltips : newTooltips });

		}else if(tooltipValues.addStaticResKeyTooltip === type){
			let	newTooltips: TooltipState = {
				addStaticResKeyTooltip:		(r3IsBoolean(extData) ? extData : false)
			};
			this.setState({ tooltips : newTooltips });

		}else if(tooltipValues.editStaticResKeyTooltip === type){
			let	newTooltips: TooltipState = {
				editStaticResKeyTooltip:	(r3IsNumber(extData) ? extData : -1)
			};
			this.setState({ tooltips : newTooltips });

		}else if(tooltipValues.delStaticResKeyTooltip === type){
			let	newTooltips: TooltipState = {
				delStaticResKeyTooltip:		(r3IsNumber(extData) ? extData : -1)
			};
			this.setState({ tooltips : newTooltips });

		}else if(tooltipValues.nameStaticResKeyTooltip === type){
			let	newTooltips: TooltipState = {
				nameStaticResKeyTooltip:	(r3IsNumber(extData) ? extData : -1)
			};
			this.setState({ tooltips : newTooltips });

		}else if(tooltipValues.jsonStaticResKeyTooltip === type){
			let	newTooltips: TooltipState = {
				jsonStaticResKeyTooltip:	(r3IsNumber(extData) ? extData : -1)
			};
			this.setState({ tooltips : newTooltips });
		}
	};

	//
	// Handle(Main page) Service Name : Change
	//
	handleNewServiceNameChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void
	{
		let	newState: R3CreateServiceDialogState = {
			newServiceName:	event.target.value
		};
		this.setState(newState);
	}

	//
	// Handle(Main page) Verify URL : Change
	//
	handleNewVerifyChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void
	{
		let	newState: R3CreateServiceDialogState = {
			newVerify:	event.target.value
		};
		this.setState(newState);
	}

	//
	// Handle(Main page) Static resource object page : Change
	//
	handleResStaticObjPageChange(event: React.MouseEvent<HTMLElement> | null, page: number): void
	{
		let	newState: R3CreateServiceDialogState = {
			staticResPageNum:	page
		};
		this.setState(newState);
	}

	//
	// Handle(Main page) Service resource type : Change
	//
	handleResourceTypeChange(event: React.ChangeEvent<HTMLInputElement>, type: string): void
	{
		if(!isServiceResType(type)){
			return;
		}
		if(this.state.newServiceResType === type){
			console.warn('changed value type(' + JSON.stringify(type) + ') is something wrong.');
			return;
		}
		let	newState: R3CreateServiceDialogState = {
			newServiceResType:	type
		};
		this.setState(newState);
	}

	//
	// Handle(Main page) Add new static resource
	//
	handleNewStaticResourceObj(event: React.MouseEvent<HTMLElement>): void
	{
		this.setState({
			editingStaticResMode:	true,

			editingStaticResNew:	true,
			editingStaticResPos:	-1,
			editingStaticRes:		r3DeepClone(defaultStaticResourceObj),
			staticResMessage:		null,
			staticResKeysPageNum:	0,
			staticResKeyAnchorEl:	null,
			staticResKeyCreateType:	true,
			staticResKeyBaseKey:	null,
			editingStaticResKey:	null,
			editingStaticResValue:	null,
			editingComfirmMessage:	null,

			tooltips: 				disableAllToolTip
		});
	}

	//
	// Handle(Sub page) Edit static resource
	//
	handleEditStaticResourceObj(event: React.MouseEvent<HTMLElement>, pos: number): void
	{
		if(!r3IsArray(this.state.newStaticRes)){
			return;
		}
		if(this.state.newStaticRes.length <= pos){
			return;
		}
		if(!Object.values(this.state.newStaticRes).every(val => isStaticResourceObject(val))){
			return;
		}

		// make temp static resource for editing
		//
		// [NOTE]
		// When editing individual resources, the 'data' member is not manipulated directly.
		// Instead, add 'editingStringData' and 'editingObjectData' members and work with them.
		//
		let	editingStaticRes				= r3DeepClone(this.state.newStaticRes[pos]);
		editingStaticRes.editingStringData	= '';
		editingStaticRes.editingObjectData	= '';
		if(r3IsString(editingStaticRes.type) && !r3IsEmptyString(editingStaticRes.type) && resourceTypeObject == editingStaticRes.type){
			// editingStaticRes's resource data type is object
			if(!r3IsEmptyEntity(editingStaticRes.data)){
				if(r3IsString(editingStaticRes.data)){
					editingStaticRes.editingObjectData = editingStaticRes.data;
				}else{
					editingStaticRes.editingObjectData = JSON.stringify(editingStaticRes.data);
				}
			}
		}else{
			// editingStaticRes's resource data type is string
			if(!r3IsEmptyEntity(editingStaticRes.data)){
				if(r3IsString(editingStaticRes.data)){
					editingStaticRes.editingStringData = editingStaticRes.data;
				}else{
					editingStaticRes.editingStringData = JSON.stringify(editingStaticRes.data);
				}
			}
		}

		this.setState({
			editingStaticResMode:	true,

			editingStaticResNew:	false,
			editingStaticResPos:	pos,
			editingStaticRes:		editingStaticRes,
			staticResMessage:		null,
			staticResKeysPageNum:	0,
			staticResKeyAnchorEl:	null,
			staticResKeyCreateType:	true,
			staticResKeyBaseKey:	null,
			editingStaticResKey:	null,
			editingStaticResValue:	null,
			editingComfirmMessage:	null,

			tooltips: 				disableAllToolTip
		});
	}

	//
	// Handle(Sub page) Delete static resource
	//
	handleDelStaticResourceObj(event: React.MouseEvent<HTMLElement>, pos: number): void
	{
		if(!r3IsArray(this.state.newStaticRes)){
			return;
		}
		if(this.state.newStaticRes.length <= pos){
			return;
		}
		if(!Object.values(this.state.newStaticRes).every(val => isStaticResourceObject(val))){
			return;
		}

		// remove resouce
		let newStaticRes = this.state.newStaticRes.filter( (_item: StaticResourceObject, itemPos: number) => itemPos !== pos);

		// update state
		this.setState({
			newStaticRes:		newStaticRes,
			staticResMessage:	null,

			tooltips: 			disableAllToolTip
		});
	}

	//
	// Handle(Sub page) edit one static resource name
	//
	handleStaticResNameChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void
	{
		if(!isStaticResourceObject(this.state.editingStaticRes) || !r3IsString(event.target.value)){
			return;
		}
		// set name
		let	newStaticRes	= r3DeepClone(this.state.editingStaticRes);
		newStaticRes.name	= event.target.value;

		// update state
		this.setState({
			editingStaticRes:	newStaticRes,
			staticResMessage:	null
		});
	}

	//
	// Handle(Sub page) edit one static resource expire
	//
	handleStaticResExpireChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void
	{
		if(!isStaticResourceObject(this.state.editingStaticRes)){
			return;
		}
		// set expire(without checking)
		let	newStaticRes	= r3DeepClone(this.state.editingStaticRes);
		newStaticRes.expire	= r3GetDecNumber(event.target.value);

		// update state
		this.setState({
			editingStaticRes:	newStaticRes,
			staticResMessage:	null
		});
	}

	//
	// Handle(Sub page) edit one static resource data type
	//
	handleStaticResTypeChange(event: React.ChangeEvent<HTMLInputElement>, type: string | null = null): void
	{
		if(!isStaticResourceObject(this.state.editingStaticRes)){
			return;
		}

		// check value
		let	typeString: ResourceType;
		if(staticResDataType.staticResObjectDataType == type){
			typeString = resourceTypeObject;
		}else{	// staticResDataType.staticResStringDataType
			typeString = resourceTypeString;
		}
		if(!r3IsEmptyEntityObject(this.state.editingStaticRes, 'type')){
			if(typeString == this.state.editingStaticRes.type){
				console.warn('changed value type(' + JSON.stringify(type) + ') is something wrong.');
				return;
			}
		}

		// set type
		let	newStaticRes	= r3DeepClone(this.state.editingStaticRes);
		newStaticRes.type	= typeString;

		// update state
		this.setState({
			editingStaticRes:	newStaticRes,
			staticResMessage:	null
		});
	}

	//
	// Handle(Sub page) edit one static resource data
	//
	handleStaticResDataChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void
	{
		if(!isStaticResourceObject(this.state.editingStaticRes) || !r3IsString(event.target.value)){
			return;
		}
		// set data
		let	newStaticRes	= r3DeepClone(this.state.editingStaticRes);
		if(resourceTypeObject == newStaticRes.type){
			newStaticRes.editingObjectData = event.target.value;
		}else{
			newStaticRes.editingStringData = event.target.value;
		}

		// update state
		this.setState({
			editingStaticRes:	newStaticRes,
			staticResMessage:	null
		});
	}

	//
	// Handle(Sub page) Static resource page close
	//
	handleStaticResPageClose(event: React.MouseEvent<HTMLElement>, isCancel: boolean): void
	{
		// cancel
		if(isCancel){
			if(this.props.createMode){
				// move to main page(previous)
				this.setState({
					editingStaticResMode:	false,

					editingStaticResNew:	true,
					editingStaticResPos:	-1,
					editingStaticRes:		r3DeepClone(defaultStaticResourceObj),
					staticResKeysPageNum:	0,
					staticResKeyAnchorEl:	null,
					staticResKeyCreateType:	true,
					staticResKeyBaseKey:	null,
					editingStaticResKey:	null,
					editingStaticResValue:	null,
					editingComfirmMessage:	null,
				});
			}else{
				// close dialog
				this.props.onClose(event, null, false, null, null, null, null);
			}
			return;
		}

		if(!isStaticResourceObject(this.state.editingStaticRes)){
			return;
		}

		// check name
		if(r3IsEmptyString(this.state.editingStaticRes.name)){
			this.setState({
				staticResMessage:	this.props.r3provider.getR3TextRes().eStaticResNameEmpty
			});
			return;
		}
		if(this.props.createMode){
			// has main page(has all static resource array)
			for(let cnt = 0; cnt < this.state.newStaticRes.length; ++cnt){
				if(0 <= this.state.editingStaticResPos && this.state.editingStaticResPos == cnt){
					continue;
				}
				if(!r3IsEmptyString(this.state.newStaticRes[cnt].name) && this.state.newStaticRes[cnt].name == this.state.editingStaticRes.name){
					this.setState({
						staticResMessage:	this.props.r3provider.getR3TextRes().eStaticResNameFoundSame
					});
					return;
				}
			}
		}else{
			// not have all static resource array
			if(r3IsFunction(this.props.onCheckConflictName)){
				if(!this.props.onCheckConflictName!(this.state.editingStaticRes.name)){
					this.setState({
						staticResMessage:	this.props.r3provider.getR3TextRes().eStaticResNameFoundSame
					});
					return;
				}
			}
		}

		// check expire
		let	expire: number | null = null;
		if(!r3IsEmptyEntityObject(this.state.editingStaticRes, 'expire')){
			if(	isNaN(Number(this.state.editingStaticRes.expire))			||
				(parseInt(String(this.state.editingStaticRes.expire)) < 0)	)
			{
				this.setState({
					staticResMessage:	this.props.r3provider.getR3TextRes().eStaticResExpireInvalid
				});
				return;
			}
			expire = r3GetDecNumber(this.state.editingStaticRes.expire);
		}

		// check data & type
		let	data: string | null = null;
		let	type: ResourceType;
		if(!r3IsEmptyEntityObject(this.state.editingStaticRes, 'type') && resourceTypeObject == this.state.editingStaticRes.type){
			// type is object
			if(r3IsString(this.state.editingStaticRes.editingObjectData) && !r3IsEmptyString(this.state.editingStaticRes.editingObjectData)){
				if(!r3IsJSON(this.state.editingStaticRes.editingObjectData)){
					this.setState({
						staticResMessage:	this.props.r3provider.getR3TextRes().eStaticResObjDataInvalid
					});
					return;
				}
				data = this.state.editingStaticRes.editingObjectData;
			}
			type = resourceTypeObject;
		}else{
			// type is string
			if(r3IsString(this.state.editingStaticRes.editingStringData) && !r3IsEmptyString(this.state.editingStaticRes.editingStringData)){
				data = this.state.editingStaticRes.editingStringData;
			}
			type = resourceTypeString;
		}

		// make new static resource
		let	newOneStaticRes		= r3DeepClone(this.state.editingStaticRes);
		delete newOneStaticRes.editingObjectData;
		delete newOneStaticRes.editingStringData;
		if(null === expire || 0 === expire){
			delete newOneStaticRes.expire;
		}else{
			newOneStaticRes.expire	= expire;
		}
		newOneStaticRes.data	= data;
		newOneStaticRes.type	= type;

		// move to previous(main page) or close
		if(this.props.createMode){
			// move to main page(previous)

			// set new(edit) static resource to array
			let	newStaticRes	= r3DeepClone(this.state.newStaticRes);
			if(0 <= this.state.editingStaticResPos && this.state.editingStaticResPos < this.state.newStaticRes.length){
				// override
				newStaticRes[this.state.editingStaticResPos] = newOneStaticRes;
			}else{
				// add
				newStaticRes.push(newOneStaticRes);
			}

			// update stats
			this.setState({
				editingStaticResMode:	false,
				newStaticRes:			newStaticRes,
				editingStaticResNew:	true,
				editingStaticResPos:	-1,
				editingStaticRes:		r3DeepClone(defaultStaticResourceObj),
				staticResMessage:		null,
				staticResKeysPageNum:	0,
				staticResKeyAnchorEl:	null,
				staticResKeyCreateType:	true,
				staticResKeyBaseKey:	null,
				editingStaticResKey:	null,
				editingStaticResValue:	null,
				editingComfirmMessage:	null,
			});
		}else{
			// close dialog
			this.props.onClose(event, null, true, null, null, null, [newOneStaticRes]);
		}
	}

	//
	// Handle(Sub page) Static resource object keys page : Change
	//
	handleStaticResKeysPageChange(event: React.MouseEvent<HTMLElement> | null, page: number): void
	{
		this.setState({
			staticResKeysPageNum:	page
		});
	}

	//
	// Handle(Sub page) Delete key in static resource
	//
	handleDelStaticResKey(event: React.MouseEvent<HTMLElement>, item: string): void
	{
		if(!isStaticResourceObject(this.state.editingStaticRes) || !r3IsObject(this.state.editingStaticRes.keys)){
			return;
		}

		// remove key in editing static resouce
		let	newStaticRes = r3DeepClone(this.state.editingStaticRes);
		delete newStaticRes.keys![item];

		// update state
		this.setState({
			editingStaticRes:	newStaticRes,
			staticResMessage:	null,

			tooltips: 			disableAllToolTip
		});
	}

	//
	// Handle(Sub page) new Key in static resource keys - Display Popover(new)
	//
	handleNewStaticResKey(event: React.MouseEvent<HTMLElement>): void
	{
		this.setState({
			staticResKeyAnchorEl:	event.currentTarget,
			staticResKeyCreateType:	true,
			staticResKeyBaseKey:	null,
			editingStaticResKey:	null,
			editingStaticResValue:	null,
			editingComfirmMessage:	null,

			tooltips: 				disableAllToolTip
		});
	}

	//
	// Handle(Popover) edit Key in static resource keys - Display Popover(edit)
	//
	handleEditStaticResKey(event: React.MouseEvent<HTMLElement>, item: string): void
	{
		if(!isStaticResourceObject(this.state.editingStaticRes) || !r3IsObject(this.state.editingStaticRes.keys) || !r3IsString(item) || !r3IsEmptyString(item, true)){
			return;
		}

		let	value: string;
		if(!r3HasKey(this.state.editingStaticRes.keys, item)){
			value = '';
		}else{
			const rawValue = this.state.editingStaticRes.keys[item];
			if(r3IsEmptyEntity(rawValue)){
				value = '';
			}else if(r3IsArray(rawValue) || r3IsObject(rawValue)){
				value = JSON.stringify(rawValue);
			}else{
				value = String(rawValue);		// probabry string type
			}
		}

		this.setState({
			staticResKeyAnchorEl:	event.currentTarget,
			staticResKeyCreateType:	false,
			staticResKeyBaseKey:	item,
			editingStaticResKey:	item,
			editingStaticResValue:	value,
			editingComfirmMessage:	null,

			tooltips: 				disableAllToolTip
		});
	}

	//
	// Handle(Popover) cancel Key in static resource keys - Close Popover(without saving)
	//
	handleCancelStaticResKey(_event?: object, _reason?: string): void
	{
		this.setState({
			staticResKeyAnchorEl:	null,
			staticResKeyCreateType:	true,
			staticResKeyBaseKey:	null,
			editingStaticResKey:	null,
			editingStaticResValue:	null,
			editingComfirmMessage:	null,
		});
	}

	//
	// Handle(Popover) update Key in static resource keys - Close Popover(with saving)
	//
	handleConfirmStaticResKey(event: React.MouseEvent<HTMLElement>): void
	{
		const { r3provider } = this.props;

		// check
		let	confirmMessage = null;
		if(r3IsEmptyString(this.state.editingStaticResKey, true)){
			confirmMessage = r3provider.getR3TextRes().eStaticResKeyEmpty;
		}else{
			// check same key name
			if(isStaticResourceObject(this.state.editingStaticRes) && !r3IsEmptyStringObject(this.state.editingStaticRes.keys, this.state.editingStaticResKey)){
				// found same key name
				if(r3IsEmptyString(this.state.staticResKeyBaseKey, true)){
					confirmMessage = r3provider.getR3TextRes().eStaticResKeySameKey;
				}else{
					if(this.state.staticResKeyBaseKey !== this.state.editingStaticResKey){
						confirmMessage = r3provider.getR3TextRes().eStaticResKeySameKey;
					}
				}
			}
		}

		if(null != confirmMessage){
			// update state
			this.setState({
				editingComfirmMessage:	confirmMessage,
			});
			return;
		}

		// make new static resource
		let	newStaticRes: StaticResourceObject;
		if(isStaticResourceObject(this.state.editingStaticRes)){
			newStaticRes = r3DeepClone(this.state.editingStaticRes);
		}else{
			newStaticRes = r3DeepClone(defaultStaticResourceObj);
		}
		if(!r3IsObject(newStaticRes?.keys)){
			newStaticRes.keys = {};
		}
		if(r3IsString(this.state.staticResKeyBaseKey) && !r3IsEmptyString(this.state.staticResKeyBaseKey, true) && r3HasKey(newStaticRes.keys, this.state.staticResKeyBaseKey)){
			delete newStaticRes.keys[this.state.staticResKeyBaseKey];
		}
		newStaticRes.keys[this.state.editingStaticResKey] = this.state.editingStaticResValue;

		// update state
		this.setState({
			editingStaticRes:		newStaticRes,
			staticResMessage:		null,
			staticResKeyAnchorEl:	null,
			staticResKeyCreateType:	true,
			staticResKeyBaseKey:	null,
			editingStaticResKey:	null,
			editingStaticResValue:	null,
		});
	}

	//
	// Handle(Popover) Key in static resource keys : Change
	//
	handleStaticResKeysKeyChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void
	{
		this.setState({
			editingComfirmMessage:	null,
			editingStaticResKey:	event.target.value
		});
	}

	//
	// Handle(Popover) Key-Value in static resource keys : Change
	//
	handleStaticResKeysValChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void
	{
		this.setState({
			editingComfirmMessage:	null,
			editingStaticResValue:	event.target.value
		});
	}

	//---------------------------------------------------------
	// Popover for editing one key-value
	//---------------------------------------------------------
	//
	// Render : Popover for static resource key
	//
	getNewStaticResKeyPopover()
	{
		const { theme, r3provider } = this.props;

		let	title: string;
		let	buttonName: string;
		if(this.state.staticResKeyCreateType){
			title		= r3provider.getR3TextRes().tResStaticResKeyNewTitle;
			buttonName	= r3provider.getR3TextRes().tResStaticResKeyCreateBtn;
		}else{
			title		= r3provider.getR3TextRes().tResStaticResKeyEditTitle;
			buttonName	= r3provider.getR3TextRes().tResStaticResKeyUpdateBtn;
		}
		let	keyname		= this.state.editingStaticResKey;
		if(r3IsEmptyString(keyname, true)){
			keyname		= '';
		}
		let	value		= this.state.editingStaticResValue;
		if(r3IsEmptyString(value, true)){
			value		= '';
		}
		let	message: React.ReactNode;
		if(null != this.state.editingComfirmMessage){
			message		= (
				<Typography
					{ ...theme.r3CreateServiceDialog.staticResMessage }
					sx={ this.sxClasses.staticResMessage }
				>
					{ this.state.editingComfirmMessage }
				</Typography>
			);
		}

		return (
			<Popover
				open={ Boolean(this.state.staticResKeyAnchorEl) }
				anchorEl={ this.state.staticResKeyAnchorEl }
				onClose={ this.handleCancelStaticResKey }
				{ ...theme.r3CreateServiceDialog.staticResKeyPopover }
				sx={ this.sxClasses.staticResKeyPopover }
			>
				<Typography
					{ ...theme.r3CreateServiceDialog.staticResKeyPopoverTitle }
					sx={ this.sxClasses.staticResKeyPopoverTitle }
				>
					{ title }
				</Typography>
				{ message }
				<Typography
					{ ...theme.r3CreateServiceDialog.staticResKeyPopoverSubtitle }
					sx={ this.sxClasses.staticResKeyPopoverSubtitle }
				>
					{ r3provider.getR3TextRes().tResStaticResKeyPopover }
				</Typography>
				<TextField
					id={ dialogComponentsIds.staticObjKeyTextFieldId }
					value={ keyname }
					placeholder={ r3provider.getR3TextRes().tResResourceKeysKeyHint }
					onChange={ (event) => this.handleStaticResKeysKeyChange(event) }
					slotProps ={{ input: { sx: this.sxClasses.inputTextField } }}
					{ ...theme.r3CreateServiceDialog.textField }
					sx={ this.sxClasses.textField }
				/>
				<Typography
					{ ...theme.r3CreateServiceDialog.staticResKeyPopoverSubtitle }
					sx={ this.sxClasses.staticResKeyPopoverSubtitle }
				>
					{ r3provider.getR3TextRes().tResStaticResKValPopover }
				</Typography>
				<TextField
					id={ dialogComponentsIds.staticObjValTextFieldId }
					value={ value }
					placeholder={ r3provider.getR3TextRes().tResResourceKeysValueHint }
					onChange={ (event) => this.handleStaticResKeysValChange(event) }
					slotProps ={{ input: { sx: this.sxClasses.inputTextField } }}
					{ ...theme.r3CreateServiceDialog.textField }
					sx={ this.sxClasses.textField }
				/>
				<Button
					disabled={ r3IsEmptyString(keyname, true) }
					onClick={ this.handleConfirmStaticResKey }
					{ ...theme.r3CreateServiceDialog.staticResKeyPopoverButton }
					sx={ this.sxClasses.staticResKeyPopoverButton }
				>
					{ buttonName }
					<CheckCircleIcon
						sx={ this.sxClasses.buttonIcon }
					/>
				</Button>

			</Popover>
		);
	}

	//
	// Render : table head static resource keys
	//
	getStaticResKeysTableHead()
	{
		const { theme, r3provider } = this.props;

		let	newStaticResKeyPopover = this.getNewStaticResKeyPopover();

		return (
			<React.Fragment>
				{ newStaticResKeyPopover }
				<TableHead
					sx={ this.sxClasses.tableHead }
				>
					<TableRow>
						<TableCell
							sx={ this.sxClasses.tableLeftCell }
						>
							<Tooltip
								title={ r3provider.getR3TextRes().tResStaticResAddKeyTT }
								open={ (r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsBoolean(this.state.tooltips.addStaticResKeyTooltip)) ? false : this.state.tooltips.addStaticResKeyTooltip === true }
							>
								<Button
									onClick={ this.handleNewStaticResKey }
									onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.addStaticResKeyTooltip, true) }
									onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.addStaticResKeyTooltip, false) }
									{ ...theme.r3CreateServiceDialog.addResStaticObjButton }
									sx={ this.sxClasses.actionResStaticObjButton }
								>
									<AddIcon />
								</Button>
							</Tooltip>
							<Typography
								{ ...theme.r3CreateServiceDialog.textTableHead }
								sx={ this.sxClasses.textTableHead }
							>
								{ r3provider.getR3TextRes().tResStaticResKeyTableHead }
							</Typography>
						</TableCell>
						<TableCell
							sx={ this.sxClasses.tableCell }
						>
							<Typography
								{ ...theme.r3CreateServiceDialog.textTableHead }
								sx={ this.sxClasses.textTableHead }
							>
								{ r3provider.getR3TextRes().tResStaticResKValTableHead }
							</Typography>
						</TableCell>
					</TableRow>
				</TableHead>
			</React.Fragment>
		);
	}

	//
	// Render : table body static resource keys
	//
	getStaticResKeysTableBody(staticResKeys: valTypeAllObject)
	{
		const { theme, r3provider } = this.props;

		let	_staticResKeys	= staticResKeys;
		let	_sortedKeys		= Object.keys(_staticResKeys).sort();

		return (
			<TableBody>
				{ _sortedKeys.map( (item: string, pos: number) => {
					if(pos < (this.state.staticResKeysPageNum * this.props.tableKeysRawCount) || ((this.state.staticResKeysPageNum + 1) * this.props.tableKeysRawCount) <= pos){
						return;
					}

					let	orgName		= item;
					let	stripName	= orgName;
					if(10 < stripName.length){
						stripName = stripName.slice(0, 7) + '...';
					}
					let	orgJson: string;
					if(r3IsEmptyEntity(_staticResKeys[item])){
						orgJson = '';
					}else if(r3IsArray(_staticResKeys[item]) || r3IsObject(_staticResKeys[item])){
						orgJson = JSON.stringify(_staticResKeys[item]);
					}else{
						orgJson = String(_staticResKeys[item]);		// probabry string type
					}
					let	stripJson	= orgJson;
					if(40 < stripJson.length){
						stripJson = stripJson.slice(0, 37) + '...';
					}

					return (
						<TableRow
							hover={ false }
							key={ pos }
							selected={ false }
						>
							<TableCell
								sx={ this.sxClasses.tableLeftCell }
							>
								<Tooltip
									title={ r3provider.getR3TextRes().tResServiceDelStaticResTT }
									open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsNumber(this.state.tooltips.delStaticResKeyTooltip) || (this.state.tooltips.delStaticResKeyTooltip != pos)) ? false : true) }
								>
									<Button
										onClick={ (event) => this.handleDelStaticResKey(event, item) }
										onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.delStaticResKeyTooltip, pos) }
										onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.delStaticResKeyTooltip, -1) }
										{ ...theme.r3CreateServiceDialog.delResStaticObjButton }
										sx={ this.sxClasses.actionResStaticObjButton }
									>
										<DeleteIcon />
									</Button>
								</Tooltip>
								<Tooltip
									title={ r3provider.getR3TextRes().tResStaticResEditKeyTT }
									open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsNumber(this.state.tooltips.editStaticResKeyTooltip) || (this.state.tooltips.editStaticResKeyTooltip != pos)) ? false : true) }
								>
									<Button
										onClick={ (event) => this.handleEditStaticResKey(event, item) }
										onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.editStaticResKeyTooltip, pos) }
										onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.editStaticResKeyTooltip, -1) }
										{ ...theme.r3CreateServiceDialog.editResStaticObjButton }
										sx={ this.sxClasses.actionResStaticObjButton }
									>
										<EditIcon />
									</Button>
								</Tooltip>
								<Tooltip
									title={ orgName }
									open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsNumber(this.state.tooltips.nameStaticResKeyTooltip) || (this.state.tooltips.nameStaticResKeyTooltip != pos)) ? false : true) }
								>
									<Typography
										onMouseEnter={ (event: React.MouseEvent<HTMLSpanElement>) => this.handTooltipChange(event, tooltipValues.nameStaticResKeyTooltip, pos) }
										onMouseLeave={ (event: React.MouseEvent<HTMLSpanElement>) => this.handTooltipChange(event, tooltipValues.nameStaticResKeyTooltip, -1) }
										{ ...theme.r3CreateServiceDialog.textTableContent }
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
									open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsNumber(this.state.tooltips.jsonStaticResKeyTooltip) || (this.state.tooltips.jsonStaticResKeyTooltip != pos)) ? false : true) }
								>
									<Typography
										onMouseEnter={ (event: React.MouseEvent<HTMLSpanElement>) => this.handTooltipChange(event, tooltipValues.jsonStaticResKeyTooltip, pos) }
										onMouseLeave={ (event: React.MouseEvent<HTMLSpanElement>) => this.handTooltipChange(event, tooltipValues.jsonStaticResKeyTooltip, -1) }
										{ ...theme.r3CreateServiceDialog.textTableContent }
										sx={ this.sxClasses.textTableContent }
									>
										{ stripJson }
									</Typography>
								</Tooltip>
							</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		);
	}

	//
	// Render : static resource keys
	//
	renderEditStaticResKeys()
	{
		const { theme, r3provider } = this.props;

		let	staticResKeys: valTypeAllObject = isStaticResourceObject(this.state.editingStaticRes) ? (this.state.editingStaticRes.keys || {}) : {};
		if(!r3IsObject(staticResKeys)){
			staticResKeys = {};
		}
		let	keysCount = Object.keys(staticResKeys).length;
		let	tablehead = this.getStaticResKeysTableHead();
		let	tablebody = this.getStaticResKeysTableBody(staticResKeys);

		return (
			<React.Fragment>
				<Typography
					{ ...theme.r3CreateServiceDialog.keyTitle }
					sx={ this.sxClasses.keyTitle }
				>
					{ r3provider.getR3TextRes().tResStaticResKeysSubTitle }
				</Typography>
				<Box
					sx={ this.sxClasses.tableBox }
				>
					<Table
						{ ...theme.r3CreateServiceDialog.table }
						sx={ this.sxClasses.table }
					>
						{ tablehead }
						{ tablebody }
					</Table>
					<TablePagination
						component={ 'div' }
						count={ keysCount }
						rowsPerPage={ this.props.tableKeysRawCount }
						page={ this.state.staticResKeysPageNum }
						rowsPerPageOptions={ [] }
						onPageChange={ this.handleStaticResKeysPageChange }
					/>
				</Box>
			</React.Fragment>
		);
	}

	//
	// Render : Edit one static resource
	//
	renderEditStaticResPage()
	{
		const { theme, r3provider } = this.props;

		let	leftTypeSelectLabel = (
			<Typography
				{ ...theme.r3CreateServiceDialog.valueFormControlLabel }
			>
				{ r3provider.getR3TextRes().tResStaticResStringType }
			</Typography>
		);
		let	rightTypeSelectLabel = (
			<Typography
				{ ...theme.r3CreateServiceDialog.valueFormControlLabel }
			>
				{ r3provider.getR3TextRes().tResStaticResObjectType }
			</Typography>
		);

		let	message: React.ReactNode;
		if(null != this.state.staticResMessage){
			message = (
				<Typography
					{ ...theme.r3CreateServiceDialog.staticResMessage }
					sx={ this.sxClasses.staticResMessage }
				>
					{ this.state.staticResMessage }
				</Typography>
			);
		}

		let	staticResName = '';
		if(isStaticResourceObject(this.state.editingStaticRes) && r3IsString(this.state.editingStaticRes.name) && !r3IsEmptyString(this.state.editingStaticRes.name)){
			staticResName = this.state.editingStaticRes.name;
		}
		let	staticResExpire = '';
		if(isStaticResourceObject(this.state.editingStaticRes) && r3IsNumber(this.state.editingStaticRes.expire)){
			staticResExpire = String(this.state.editingStaticRes.expire);
		}

		let	staticResType: string;
		let	staticResDataHint: string;
		let	staticResData		= '';
		if(isStaticResourceObject(this.state.editingStaticRes)){
			if(r3IsString(this.state.editingStaticRes.type) && resourceTypeObject == this.state.editingStaticRes.type){
				staticResType		= staticResDataType.staticResObjectDataType;
				staticResDataHint	= r3provider.getR3TextRes().tResResourceValueObjHint;
				if(!r3IsEmptyString(this.state.editingStaticRes.editingObjectData, true)){
					staticResData	= this.state.editingStaticRes.editingObjectData;
				}
			}else{
				staticResType		= staticResDataType.staticResStringDataType;
				staticResDataHint	= r3provider.getR3TextRes().tResResourceValueTextHint;
				if(!r3IsEmptyString(this.state.editingStaticRes.editingStringData, true)){
					staticResData	= this.state.editingStaticRes.editingStringData;
				}
			}
		}

		let	staticResKeys = this.renderEditStaticResKeys();

		// confirm button
		let	actionButton: React.ReactNode;
		if(this.props.createMode){
			// has main page
			let	saveButtonName: string;
			if(this.state.editingStaticResNew){
				saveButtonName = r3provider.getR3TextRes().tResButtonCreate;
			}else{
				saveButtonName = r3provider.getR3TextRes().tResButtonSave;
			}

			actionButton = (
				<DialogActions>
					<Button
						onClick={ (event) => this.handleStaticResPageClose(event, true) }
						{ ...theme.r3CreateServiceDialog.cancelButton }
						sx={ this.sxClasses.cancelButton }
					>
						{ r3provider.getR3TextRes().tResButtonPrevious }
						<CancelIcon
							sx={ this.sxClasses.buttonIcon }
						/>
					</Button>
					<Button
						disabled={ r3IsEmptyString(staticResName, true) }
						onClick={ (event) => this.handleStaticResPageClose(event, false) }
						{ ...theme.r3CreateServiceDialog.okButton }
						sx={ this.sxClasses.okButton }
					>
						{ saveButtonName }
						<CheckCircleIcon
							sx={ this.sxClasses.buttonIcon }
						/>
					</Button>
				</DialogActions>
			);
		}else{
			// has only sub page
			actionButton = (
				<DialogActions>
					<Button
						onClick={ (event) => this.handleStaticResPageClose(event, true) }
						{ ...theme.r3CreateServiceDialog.cancelButton }
						sx={ this.sxClasses.cancelButton }
					>
						{ r3provider.getR3TextRes().tResButtonCancel }
						<CancelIcon
							sx={ this.sxClasses.buttonIcon }
						/>
					</Button>
					<Button
						disabled={ r3IsEmptyString(staticResName, true) }
						onClick={ (event) => this.handleStaticResPageClose(event, false) }
						{ ...theme.r3CreateServiceDialog.okButton }
						sx={ this.sxClasses.okButton }
					>
						{ r3provider.getR3TextRes().tResButtonOk }
						<CheckCircleIcon
							sx={ this.sxClasses.buttonIcon }
						/>
					</Button>
				</DialogActions>
			);
		}

		return (
			<React.Fragment>
				<DialogTitle
					{ ...theme.r3CreateServiceDialog.dialogTitle }
					sx={ this.sxClasses.dialogTitle }
				>
					<Typography
						{ ...theme.r3CreateServiceDialog.title }
						sx={ this.sxClasses.title }
					>
						{ r3provider.getR3TextRes().cStaticResourceTitle }
					</Typography>
				</DialogTitle>

				<DialogContent
					sx={ this.sxClasses.dialogContent }
				>
					{ message }
					<Typography
						{ ...theme.r3CreateServiceDialog.keyTitle }
						sx={ this.sxClasses.keyTitle }
					>
						{ r3provider.getR3TextRes().tResStaticResNameSubTitle }
					</Typography>
					<TextField
						id={ dialogComponentsIds.staticObjNameTextFieldId }
						value={ staticResName }
						placeholder={ r3provider.getR3TextRes().tResStaticResNameHint }
						onChange={ (event) => this.handleStaticResNameChange(event) }
						slotProps ={{ input: { sx: this.sxClasses.inputTextField } }}
						{ ...theme.r3CreateServiceDialog.textField }
						sx={ this.sxClasses.textField }
					/>
					<Typography
						{ ...theme.r3CreateServiceDialog.keyTitle }
						sx={ this.sxClasses.keyTitle }
					>
						{ r3provider.getR3TextRes().tResStaticResExpSubTitle }
					</Typography>
					<TextField
						id={ dialogComponentsIds.staticObjExpireTextFieldId }
						value={ staticResExpire }
						placeholder={ r3provider.getR3TextRes().tResStaticResExpHint }
						onChange={ (event) => this.handleStaticResExpireChange(event) }
						slotProps ={{ input: { sx: this.sxClasses.inputTextField } }}
						{ ...theme.r3CreateServiceDialog.textField }
						sx={ this.sxClasses.textField }
					/>
					<Typography
						{ ...theme.r3CreateServiceDialog.keyTitle }
						sx={ this.sxClasses.keyTitle }
					>
						{ r3provider.getR3TextRes().tResStaticResTypeSubTitle }
					</Typography>
					<RadioGroup
						id={ dialogComponentsIds.staticObjTypeGroupId }
						value={ staticResType }
						onChange={ (event, value) => this.handleStaticResTypeChange(event, value) }
						{ ...theme.r3CreateServiceDialog.valueRadioGroup }
						sx={ this.sxClasses.valueRadioGroup }
					>
						<FormControlLabel
							value={ staticResDataType.staticResStringDataType }
							label={ leftTypeSelectLabel }
							disabled={ false }
							control={ <Radio /> }
							{ ...theme.r3CreateServiceDialog.valueLeftFormControlLabel }
							sx={ this.sxClasses.valueLeftFormControlLabel }
						/>
						<FormControlLabel
							value={ staticResDataType.staticResObjectDataType }
							label={ rightTypeSelectLabel }
							disabled={ false }
							control={ <Radio /> }
							{ ...theme.r3CreateServiceDialog.valueRightFormControlLabel }
							sx={ this.sxClasses.valueRightFormControlLabel }
						/>
					</RadioGroup>
					<TextField
						id={ dialogComponentsIds.staticObjDataTextFieldId }
						value={ staticResData }
						placeholder={ staticResDataHint }
						onChange={ (event) => this.handleStaticResDataChange(event) }
						slotProps ={{ input: { sx: this.sxClasses.inputTextField } }}
						{ ...theme.r3CreateServiceDialog.textField }
						sx={ this.sxClasses.textField }
					/>
					{ staticResKeys }
				</DialogContent>
				{ actionButton }
			</React.Fragment>
		);
	}

	//---------------------------------------------------------
	// Main page for editing service resource
	//---------------------------------------------------------
	//
	// Render: Main page Resource - Verify URL
	//
	renderResourceVerifyUrl()
	{
		const { theme, r3provider } = this.props;

		return (
			<TextField
				id={ dialogComponentsIds.verifyTextFieldId }
				value={ this.state.newVerify }
				placeholder={ r3provider.getR3TextRes().tResServiceUrlResHint }
				onChange={ (event) => this.handleNewVerifyChange(event) }
				slotProps ={{ input: { sx: this.sxClasses.inputTextField } }}
				{ ...theme.r3CreateServiceDialog.textField }
				sx={ this.sxClasses.textField }
			/>
		);
	}

	//
	// Render: Main page Resoruce - Static resource object(table head)
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
						sx={ this.sxClasses.tableLeftCell }
					>
						<Tooltip
							title={ r3provider.getR3TextRes().tResServiceAddStaticResTT }
							open={ (r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsBoolean(this.state.tooltips.addResStaticObjTooltip)) ? false : this.state.tooltips.addResStaticObjTooltip === true }
						>
							<Button
								onClick={ this.handleNewStaticResourceObj }
								onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.addResStaticObjTooltip, true) }
								onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.addResStaticObjTooltip, false) }
								{ ...theme.r3CreateServiceDialog.addResStaticObjButton }
								sx={ this.sxClasses.actionResStaticObjButton }
							>
								<AddIcon />
							</Button>
						</Tooltip>
						<Typography
							{ ...theme.r3CreateServiceDialog.textTableHead }
							sx={ this.sxClasses.textTableHead }
						>
							{ r3provider.getR3TextRes().tResServiceNameTableHead }
						</Typography>
					</TableCell>
					<TableCell
						sx={ this.sxClasses.tableCell }
					>
						<Typography
							{ ...theme.r3CreateServiceDialog.textTableHead }
							sx={ this.sxClasses.textTableHead }
						>
							{ r3provider.getR3TextRes().tResServiceJsonTableHead }
						</Typography>
					</TableCell>
				</TableRow>
			</TableHead>
		);
	}

	//
	// Render: Main page Resoruce - Static resource object(table body)
	//
	getResStaticObjTableBody()
	{
		const { theme, r3provider } = this.props;

		if(!r3IsArray(this.state.newStaticRes)){
			return;
		}
		if(!Object.values(this.state.newStaticRes).every(val => isStaticResourceObject(val))){
			return;
		}
		let	resources = this.state.newStaticRes;

		return (
			<TableBody>
				{resources.map( (item: StaticResourceObject, pos: number) => {
					if(pos < (this.state.staticResPageNum * this.props.tableRawCount) || ((this.state.staticResPageNum + 1) * this.props.tableRawCount) <= pos){
						return;
					}

					let	orgName		= item.name;
					let	stripName	= orgName;
					if(13 < stripName.length){
						stripName = stripName.slice(0, 10) + '...';
					}
					let	orgJson		= JSON.stringify(item);
					let	stripJson	= orgJson;
					if(48 < stripJson.length){
						stripJson = stripJson.slice(0, 45) + '...';
					}

					return (
						<TableRow
							hover={ false }
							key={ pos }
							selected={ false }
						>
							<TableCell
								sx={ this.sxClasses.tableLeftCell }
							>
								<Tooltip
									title={ r3provider.getR3TextRes().tResServiceEditStaticResTT }
									open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsNumber(this.state.tooltips.editResStaticObjTooltip) || (this.state.tooltips.editResStaticObjTooltip != pos)) ? false : true) }
								>
									<Button
										onClick={ (event) => this.handleEditStaticResourceObj(event, pos) }
										onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.editResStaticObjTooltip, pos) }
										onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.editResStaticObjTooltip, -1) }
										{ ...theme.r3CreateServiceDialog.editResStaticObjButton }
										sx={ this.sxClasses.actionResStaticObjButton }
									>
										<EditIcon />
									</Button>
								</Tooltip>
								<Tooltip
									title={ r3provider.getR3TextRes().tResServiceDelStaticResTT }
									open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsNumber(this.state.tooltips.delResStaticObjTooltip) || (this.state.tooltips.delResStaticObjTooltip != pos)) ? false : true) }
								>
									<Button
										onClick={ (event) => this.handleDelStaticResourceObj(event, pos) }
										onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.delResStaticObjTooltip, pos) }
										onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.delResStaticObjTooltip, -1) }
										{ ...theme.r3CreateServiceDialog.delResStaticObjButton }
										sx={ this.sxClasses.actionResStaticObjButton }
									>
										<DeleteIcon />
									</Button>
								</Tooltip>
								<Tooltip
									title={ orgName }
									open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsNumber(this.state.tooltips.nameResStaticObjTooltip) || (this.state.tooltips.nameResStaticObjTooltip != pos)) ? false : true) }
								>
									<Typography
										onMouseEnter={ (event: React.MouseEvent<HTMLSpanElement>) => this.handTooltipChange(event, tooltipValues.nameResStaticObjTooltip, pos) }
										onMouseLeave={ (event: React.MouseEvent<HTMLSpanElement>) => this.handTooltipChange(event, tooltipValues.nameResStaticObjTooltip, -1) }
										{ ...theme.r3CreateServiceDialog.textTableContent }
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
										onMouseEnter={ (event: React.MouseEvent<HTMLSpanElement>) => this.handTooltipChange(event, tooltipValues.jsonResStaticObjTooltip, pos) }
										onMouseLeave={ (event: React.MouseEvent<HTMLSpanElement>) => this.handTooltipChange(event, tooltipValues.jsonResStaticObjTooltip, -1) }
										{ ...theme.r3CreateServiceDialog.textTableContent }
										sx={ this.sxClasses.textTableContent }
									>
										{ stripJson }
									</Typography>
								</Tooltip>
							</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		);
	}

	//
	// Render: Main page Resoruce - Static resource object
	//
	renderResourceStaticObj()
	{
		const { theme, r3provider } = this.props;

		if(!r3IsArray(this.state.newStaticRes)){
			return;
		}
		if(!Object.values(this.state.newStaticRes).every(val => isStaticResourceObject(val))){
			return;
		}

		let	tablehead = this.getResStaticObjTableHead();
		let	tablebody = this.getResStaticObjTableBody();
		let	textValue = JSON.stringify(this.state.newStaticRes);

		return (
			<Box
				sx={ this.sxClasses.tableBox }
			>
				<Table
					{ ...theme.r3CreateServiceDialog.table }
					sx={ this.sxClasses.table }
				>
					{ tablehead }
					{ tablebody }
				</Table>
				<TablePagination
					component={ 'div' }
					count={ this.state.newStaticRes.length }
					rowsPerPage={ this.props.tableRawCount }
					page={ this.state.staticResPageNum }
					rowsPerPageOptions={ [] }
					onPageChange={ this.handleResStaticObjPageChange }
				/>
				<TextField
					id={ dialogComponentsIds.staticObjTextFieldId }
					value={ textValue }
					disabled={ true }
					placeholder={ r3provider.getR3TextRes().tResServiceStaticObjHint }
					slotProps ={{ input: { sx: this.sxClasses.inputTextField } }}
					{ ...theme.r3CreateServiceDialog.textField }
					sx={ this.sxClasses.reesourceStaticTextField }
				/>
			</Box>
		);
	}

	//
	// Render: Main page(create service page)
	//
	renderCreateMainPage()
	{
		const { theme, r3provider } = this.props;

		let	leftTypeSelectLabel = (
			<Typography
				{ ...theme.r3CreateServiceDialog.valueFormControlLabel }
			>
				{ r3provider.getR3TextRes().tResServiceResTypeUrl }
			</Typography>
		);
		let	rightTypeSelectLabel = (
			<Typography
				{ ...theme.r3CreateServiceDialog.valueFormControlLabel }
			>
				{ r3provider.getR3TextRes().tResServiceResTypeStatic }
			</Typography>
		);

		let	tenant: string | undefined;
		let	tenantClass: object;
		if(r3IsString(this.props.tenant?.display) && !r3IsEmptyString(this.props.tenant.display)){
			tenant		= this.props.tenant.display;
			tenantClass	= this.sxClasses.value;
		}else{
			tenant		= r3provider.getR3TextRes().tResUnselected;
			tenantClass	= this.sxClasses.valueItalic;
		}

		let	radioValue: ServiceResType;
		let	serviceResource: React.ReactNode;
		if(serviceResTypeUrl == this.state.newServiceResType){
			radioValue		= serviceResTypeUrl;
			serviceResource	= this.renderResourceVerifyUrl();
		}else{	// serviceResTypeObject
			radioValue		= serviceResTypeObject;
			serviceResource	= this.renderResourceStaticObj();
		}

		return (
			<React.Fragment>
				<DialogTitle
					{ ...theme.r3CreateServiceDialog.dialogTitle }
					sx={ this.sxClasses.dialogTitle }
				>
					<Typography
						{ ...theme.r3CreateServiceDialog.title }
						sx={ this.sxClasses.title }
					>
						{ r3provider.getR3TextRes().cCreateServiceTitle }
					</Typography>
				</DialogTitle>

				<DialogContent
					sx={ this.sxClasses.dialogContent }
				>
					<Typography
						{ ...theme.r3CreateServiceDialog.keyTitle }
						sx={ this.sxClasses.keyTitle }
					>
						{ r3provider.getR3TextRes().tResTenantServiceSubTitle }
					</Typography>
					<Typography
						{ ...theme.r3CreateServiceDialog.value }
						sx={ tenantClass }
					>
						{ tenant }
					</Typography>

					<Typography
						{ ...theme.r3CreateServiceDialog.keyTitle }
						sx={ this.sxClasses.keyTitle }
					>
						{ r3provider.getR3TextRes().tResCreateServiceSubTitle }
					</Typography>
					<TextField
						id={ dialogComponentsIds.serviceTextFieldId }
						value={ this.state.newServiceName }
						placeholder={ r3provider.getR3TextRes().tResCreateServiceHint }
						onChange={ (event) => this.handleNewServiceNameChange(event) }
						slotProps ={{ input: { sx: this.sxClasses.inputTextField } }}
						{ ...theme.r3CreateServiceDialog.textField }
						sx={ this.sxClasses.textField }
					/>

					<Typography
						{ ...theme.r3CreateServiceDialog.keyTitle }
						sx={ this.sxClasses.keyTitle }
					>
						{ r3provider.getR3TextRes().tResServiceUrlResSubTitle }
					</Typography>

					<RadioGroup
						id={ dialogComponentsIds.serviceRadioGroupId }
						value={ radioValue }
						onChange={ this.handleResourceTypeChange }
						{ ...theme.r3CreateServiceDialog.valueRadioGroup }
						sx={ this.sxClasses.valueRadioGroup }
					>
						<FormControlLabel
							value={ serviceResTypeUrl }
							label={ leftTypeSelectLabel }
							disabled={ false }
							control={ <Radio /> }
							{ ...theme.r3CreateServiceDialog.valueLeftFormControlLabel }
							sx={ this.sxClasses.valueLeftFormControlLabel }
						/>
						<FormControlLabel
							value={ serviceResTypeObject }
							label={ rightTypeSelectLabel }
							disabled={ false }
							control={ <Radio /> }
							{ ...theme.r3CreateServiceDialog.valueRightFormControlLabel }
							sx={ this.sxClasses.valueRightFormControlLabel }
						/>
					</RadioGroup>
					{ serviceResource }
				</DialogContent>

				<DialogActions>
					<Button
						onClick={ (event) => this.props.onClose(event, null, false, null, null, null, null) }
						{ ...theme.r3CreateServiceDialog.cancelButton }
						sx={ this.sxClasses.cancelButton }
					>
						{ r3provider.getR3TextRes().tResButtonCancel }
						<CancelIcon
							sx={ this.sxClasses.buttonIcon }
						/>
					</Button>
					<Button
						disabled={ r3IsEmptyString(this.state.newServiceName, true) }
						onClick={ (event) => this.props.onClose(event, null, true, this.state.newServiceName, this.state.newServiceResType, this.state.newVerify, this.state.newStaticRes) }
						{ ...theme.r3CreateServiceDialog.okButton }
						sx={ this.sxClasses.okButton }
					>
						{ r3provider.getR3TextRes().tResButtonOk }
						<CheckCircleIcon
							sx={ this.sxClasses.buttonIcon }
						/>
					</Button>
				</DialogActions>
			</React.Fragment>
		);
	}

	//---------------------------------------------------------
	// Render all
	//---------------------------------------------------------
	render()
	{
		const { theme } = this.props;

		let	dialogContext: React.ReactNode;
		if(this.state.editingStaticResMode){
			dialogContext = this.renderEditStaticResPage();
		}else{
			dialogContext = this.renderCreateMainPage();
		}
		return (
			<Dialog
				open={ this.props.open }
				onClose={ (event, reason) => this.props.onClose(event, reason, false, null, null, null, null) }
				{ ...theme.r3CreateServiceDialog.root }
				sx={ this.sxClasses.root }
				disableRestoreFocus
			>
				{ dialogContext }
			</Dialog>
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
