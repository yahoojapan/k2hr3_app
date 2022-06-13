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
 * CREATE:   Fri Nov 24 2017
 * REVISION:
 *
 */

import React						from 'react';
import ReactDOM						from 'react-dom';						// eslint-disable-line no-unused-vars
import PropTypes					from 'prop-types';

import { withTheme, withStyles }	from '@material-ui/core/styles';		// decorator
import TextField					from '@material-ui/core/TextField';
import Button						from '@material-ui/core/Button';
import Dialog						from '@material-ui/core/Dialog';
import DialogTitle					from '@material-ui/core/DialogTitle';
import DialogContent				from '@material-ui/core/DialogContent';
import DialogActions				from '@material-ui/core/DialogActions';
import Typography					from '@material-ui/core/Typography';
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
import Popover						from '@material-ui/core/Popover';

import AddIcon						from '@material-ui/icons/AddBoxRounded';
import DeleteIcon					from '@material-ui/icons/Delete';
import EditIcon						from '@material-ui/icons/Edit';
import CheckCircleIcon				from '@material-ui/icons/CheckCircle';
import CancelIcon					from '@material-ui/icons/Cancel';

import { r3CreateServiceDialog }	from './r3styles';
import { serviceResTypeUrl, serviceResTypeObject }	from '../util/r3types';
import { r3DeepClone, r3IsEmptyEntity, r3IsEmptyString, r3IsEmptyStringObject, r3IsEmptyEntityObject, r3IsSafeTypedEntity, r3IsJSON } from '../util/r3util';

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

const tooltipValues = {
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

const staticResDataType = {
	staticResStringDataType:		'staticResStringDataType',
	staticResObjectDataType:		'staticResObjectDataType'
};

const defaultStaticResourceObj = {
	name:							'',
	expire:							null,
	type:							'string',
	data:							null,
	keys:							{},
	editingStringData:				'',										// Temporary member being edited
	editingObjectData:				''										// Temporary member being edited
};

const disableAllToolTip = {
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

//
// Create New Path Dialog Class
//
@withTheme
@withStyles(r3CreateServiceDialog)
export default class R3CreateServiceDialog extends React.Component
{
	static contextTypes = {
		r3Context:			PropTypes.object.isRequired
	};

	static propTypes = {
		r3provider:				PropTypes.object.isRequired,
		open:					PropTypes.bool,
		createMode:				PropTypes.bool.isRequired,					// Create mode(has main page) or only edit static resource mode(no main page)
		tenant:					PropTypes.object,							// Do not care for createMode(false)
		newServiceName:			PropTypes.string,
		newServiceResType:		PropTypes.string,
		newVerify:				PropTypes.string,
		newStaticRes:			PropTypes.array,							// [NOTE] Pass static resource data as initial data in createMode(false) mode, set it to the 0th position.
		tableRawCount:			PropTypes.number,
		tableKeysRawCount:		PropTypes.number,

		// [NOTE]
		// Called to check for duplicate static resource names when
		// createMode(false) is specified. If it is not set, it will
		// not be called.
		//
		onCheckConflictName:	PropTypes.func,

		// [NOTE]
		// The prototype is different depending on the case of
		// creating new service resource and creating only static resource.
		//
		onClose:				PropTypes.func.isRequired
	};

	static defaultProps = {
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

	state = {
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
		editingStaticRes:		(this.props.createMode ? {} : (0 < this.props.newStaticRes.length ? r3DeepClone(this.props.newStaticRes[0]) : {})),
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

	constructor(props)
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
	}

	// [NOTE]
	// Use getDerivedStateFromProps by deprecating componentWillReceiveProps in React 17.x.
	// The only purpose is to set the state data from props when the dialog changes from hidden to visible.
	//
	static getDerivedStateFromProps(nextProps, prevState)
	{
		if(prevState.open != nextProps.open){
			return {
				editingStaticResMode:	(nextProps.createMode ? false : true),

				newServiceName:			nextProps.newServiceName,
				newServiceResType:		nextProps.newServiceResType,
				newVerify:				nextProps.newVerify,
				newStaticRes:			nextProps.newStaticRes,
				staticResPageNum:		0,

				editingStaticResNew:	true,
				editingStaticResPos:	-1,
				editingStaticRes:		(nextProps.createMode ? {} : (0 < nextProps.newStaticRes.length ? r3DeepClone(nextProps.newStaticRes[0]) : {})),
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
		}
		return null;														// Return null to indicate no change to state.
	}

	//
	// Handle Tooltip Change
	//
	handTooltipChange = (event, type, extData) =>							// eslint-disable-line no-unused-vars
	{
		if(tooltipValues.addResStaticObjTooltip === type){
			this.setState({
				tooltips: {
					addResStaticObjTooltip:		extData
				}
			});
		}else if(tooltipValues.editResStaticObjTooltip === type){
			this.setState({
				tooltips: {
					editResStaticObjTooltip:	extData
				}
			});
		}else if(tooltipValues.delResStaticObjTooltip === type){
			this.setState({
				tooltips: {
					delResStaticObjTooltip:		extData
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
		}else if(tooltipValues.addStaticResKeyTooltip === type){
			this.setState({
				tooltips: {
					addStaticResKeyTooltip:		extData
				}
			});
		}else if(tooltipValues.editStaticResKeyTooltip === type){
			this.setState({
				tooltips: {
					editStaticResKeyTooltip:	extData
				}
			});
		}else if(tooltipValues.delStaticResKeyTooltip === type){
			this.setState({
				tooltips: {
					delStaticResKeyTooltip:		extData
				}
			});
		}else if(tooltipValues.nameStaticResKeyTooltip === type){
			this.setState({
				tooltips: {
					nameStaticResKeyTooltip:	extData
				}
			});
		}else if(tooltipValues.jsonStaticResKeyTooltip === type){
			this.setState({
				tooltips: {
					jsonStaticResKeyTooltip:	extData
				}
			});
		}
	};

	//
	// Handle(Main page) Service Name : Change
	//
	handleNewServiceNameChange(event)
	{
		this.setState({
			newServiceName:	event.target.value
		});
	}

	//
	// Handle(Main page) Verify URL : Change
	//
	handleNewVerifyChange(event)
	{
		this.setState({
			newVerify:	event.target.value
		});
	}

	//
	// Handle(Main page) Static resource object page : Change
	//
	handleResStaticObjPageChange(event, page)								// eslint-disable-line no-unused-vars
	{
		this.setState({
			staticResPageNum:	page
		});
	}

	//
	// Handle(Main page) Service resource type : Change
	//
	handleResourceTypeChange(event, type)									// eslint-disable-line no-unused-vars
	{
		if(this.state.newServiceResType === type){
			console.warn('changed value type(' + JSON.stringify(type) + ') is something wrong.');
			return;
		}
		this.setState({
			newServiceResType:	type
		});
	}

	//
	// Handle(Main page) Add new static resource
	//
	handleNewStaticResourceObj(event)										// eslint-disable-line no-unused-vars
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
	handleEditStaticResourceObj(event, pos)									// eslint-disable-line no-unused-vars
	{
		if(!r3IsSafeTypedEntity(this.state.newStaticRes, 'array')){
			return;
		}
		if(this.state.newStaticRes.length <= pos){
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
		if(!r3IsEmptyEntityObject(editingStaticRes, 'type') && 'object' == editingStaticRes.type){
			// editingStaticRes's resource data type is object
			if(!r3IsEmptyEntity(editingStaticRes.data)){
				if(r3IsSafeTypedEntity(editingStaticRes.data, 'string')){
					editingStaticRes.editingObjectData = editingStaticRes.data;
				}else{
					editingStaticRes.editingObjectData = JSON.stringify(editingStaticRes.data);
				}
			}
		}else{
			// editingStaticRes's resource data type is string
			if(!r3IsEmptyEntity(editingStaticRes.data)){
				if(r3IsSafeTypedEntity(editingStaticRes.data, 'string')){
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
	handleDelStaticResourceObj(event, pos)									// eslint-disable-line no-unused-vars
	{
		if(!r3IsSafeTypedEntity(this.state.newStaticRes, 'array')){
			return;
		}
		if(this.state.newStaticRes.length <= pos){
			return;
		}

		// remove resouce
		let newStaticRes = this.state.newStaticRes.filter( (item, itemPos) => itemPos !== pos);

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
	handleStaticResNameChange(event)
	{
		if(!r3IsSafeTypedEntity(this.state.editingStaticRes, 'object')){
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
	handleStaticResExpireChange(event)
	{
		if(!r3IsSafeTypedEntity(this.state.editingStaticRes, 'object')){
			return;
		}
		// set expire(without checking)
		let	newStaticRes	= r3DeepClone(this.state.editingStaticRes);
		newStaticRes.expire	= event.target.value;

		// update state
		this.setState({
			editingStaticRes:	newStaticRes,
			staticResMessage:	null
		});
	}

	//
	// Handle(Sub page) edit one static resource data type
	//
	handleStaticResTypeChange(event, type)									// eslint-disable-line no-unused-vars
	{
		if(!r3IsSafeTypedEntity(this.state.editingStaticRes, 'object')){
			return;
		}

		// check value
		let	typeString;
		if(staticResDataType.staticResObjectDataType == type){
			typeString = 'object';
		}else{	// staticResDataType.staticResStringDataType
			typeString = 'string';
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
	handleStaticResDataChange(event)
	{
		if(!r3IsSafeTypedEntity(this.state.editingStaticRes, 'object')){
			return;
		}
		// set data
		let	newStaticRes	= r3DeepClone(this.state.editingStaticRes);
		if('object' == newStaticRes.type){
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
	handleStaticResPageClose(event, isCancel)								// eslint-disable-line no-unused-vars
	{
		// cancel
		if(isCancel){
			if(this.props.createMode){
				// move to main page(previous)
				this.setState({
					editingStaticResMode:	false,

					editingStaticResNew:	true,
					editingStaticResPos:	-1,
					editingStaticRes:		{},
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
				this.props.onClose(event, null, false, null);
			}
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
			if(r3IsSafeTypedEntity(this.props.onCheckConflictName, 'function')){
				if(!this.props.onCheckConflictName(this.state.editingStaticRes.name)){
					this.setState({
						staticResMessage:	this.props.r3provider.getR3TextRes().eStaticResNameFoundSame
					});
					return;
				}
			}
		}

		// check expire
		let	expire = null;
		if(!r3IsEmptyEntityObject(this.state.editingStaticRes, 'expire')){
			if(	isNaN(this.state.editingStaticRes.expire)			||
				(parseInt(this.state.editingStaticRes.expire) < 0)	)
			{
				this.setState({
					staticResMessage:	this.props.r3provider.getR3TextRes().eStaticResExpireInvalid
				});
				return;
			}
			expire = parseInt(this.state.editingStaticRes.expire);
		}

		// check data & type
		let	data = null;
		let	type;
		if(!r3IsEmptyEntityObject(this.state.editingStaticRes, 'type') && 'object' == this.state.editingStaticRes.type){
			// type is object
			if(!r3IsEmptyString(this.state.editingStaticRes.editingObjectData)){
				if(!r3IsJSON(this.state.editingStaticRes.editingObjectData)){
					this.setState({
						staticResMessage:	this.props.r3provider.getR3TextRes().eStaticResObjDataInvalid
					});
					return;
				}
				data = this.state.editingStaticRes.editingObjectData;
			}
			type = 'object';
		}else{
			// type is string
			if(!r3IsEmptyString(this.state.editingStaticRes.editingStringData)){
				data = this.state.editingStaticRes.editingStringData;
			}
			type = 'string';
		}

		// make new static resource
		let	newOneStaticRes		= r3DeepClone(this.state.editingStaticRes);
		delete newOneStaticRes.editingObjectData;
		delete newOneStaticRes.editingStringData;
		if(null == expire || 0 == expire){
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
			let	newStaticRes		= r3DeepClone(this.state.newStaticRes);
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
				editingStaticRes:		{},
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
			this.props.onClose(event, null, true, newOneStaticRes);
		}
	}

	//
	// Handle(Sub page) Static resource object keys page : Change
	//
	handleStaticResKeysPageChange(event, page)								// eslint-disable-line no-unused-vars
	{
		this.setState({
			staticResKeysPageNum:	page
		});
	}

	//
	// Handle(Sub page) Delete key in static resource
	//
	handleDelStaticResKey(event, item)										// eslint-disable-line no-unused-vars
	{
		if(!r3IsSafeTypedEntity(this.state.editingStaticRes, 'object') || !r3IsSafeTypedEntity(this.state.editingStaticRes.keys, 'object') || r3IsEmptyEntityObject(this.state.editingStaticRes.keys, item)){
			return;
		}

		// remove key in editing static resouce
		let	newStaticRes = r3DeepClone(this.state.editingStaticRes);
		delete newStaticRes.keys[item];

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
	handleNewStaticResKey(event)
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
	handleEditStaticResKey(event, item)
	{
		if(!r3IsSafeTypedEntity(this.state.editingStaticRes, 'object') || !r3IsSafeTypedEntity(this.state.editingStaticRes.keys, 'object') || r3IsEmptyEntityObject(this.state.editingStaticRes.keys, item)){
			return;
		}

		let	value = this.state.editingStaticRes.keys[item];
		if(r3IsEmptyEntity(value)){
			value = '';
		}else if(r3IsSafeTypedEntity(value, 'array') || r3IsSafeTypedEntity(value, 'object')){
			value = JSON.stringify(value);
		}else{
			value = String(value);		// probabry string type
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
	handleCancelStaticResKey(event)											// eslint-disable-line no-unused-vars
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
	handleConfirmStaticResKey(event)										// eslint-disable-line no-unused-vars
	{
		const { r3provider } = this.props;

		// check 
		let	confirmMessage = null;
		if(r3IsEmptyString(this.state.editingStaticResKey, true)){
			confirmMessage = r3provider.getR3TextRes().eStaticResKeyEmpty;
		}else{
			// check same key name
			if(!r3IsEmptyStringObject(this.state.editingStaticRes.keys, this.state.editingStaticResKey)){
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
		let	newStaticRes		= r3DeepClone(this.state.editingStaticRes);
		if(!r3IsSafeTypedEntity(newStaticRes, 'object')){
			newStaticRes		= {};
		}
		if(r3IsEmptyEntityObject(newStaticRes, 'keys') || !r3IsSafeTypedEntity(newStaticRes.keys, 'object')){
			newStaticRes.keys	= {};
		}
		if(!r3IsEmptyString(this.state.staticResKeyBaseKey, true)){
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
	handleStaticResKeysKeyChange(event)
	{
		this.setState({
			editingComfirmMessage:	null,
			editingStaticResKey:	event.target.value
		});
	}

	//
	// Handle(Popover) Key-Value in static resource keys : Change
	//
	handleStaticResKeysValChange(event)
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
		const { theme, classes, r3provider } = this.props;

		let	title;
		let	buttonName;
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
		let	message;
		if(null != this.state.editingComfirmMessage){
			message		= (
				<Typography
					{ ...theme.r3Service.staticResMessage }
					className={ classes.staticResMessage }
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
				className={ classes.staticResKeyPopover }
			>
				<Typography
					{ ...theme.r3CreateServiceDialog.staticResKeyPopoverTitle }
					className={ classes.staticResKeyPopoverTitle }
				>
					{ title }
				</Typography>
				{ message }
				<Typography
					{ ...theme.r3CreateServiceDialog.staticResKeyPopoverSubtitle }
					className={ classes.staticResKeyPopoverSubtitle }
				>
					{ r3provider.getR3TextRes().tResStaticResKeyPopover }
				</Typography>
				<TextField
					id={ dialogComponentsIds.staticObjKeyTextFieldId }
					value={ keyname }
					placeholder={ r3provider.getR3TextRes().tResResourceKeysKeyHint }
					onChange={ (event) => this.handleStaticResKeysKeyChange(event) }
					InputProps={{ className: classes.inputTextField }}
					{ ...theme.r3CreateServiceDialog.textField }
					className={ classes.textField }
				/>
				<Typography
					{ ...theme.r3CreateServiceDialog.staticResKeyPopoverSubtitle }
					className={ classes.staticResKeyPopoverSubtitle }
				>
					{ r3provider.getR3TextRes().tResStaticResKValPopover }
				</Typography>
				<TextField
					id={ dialogComponentsIds.staticObjValTextFieldId }
					value={ value }
					placeholder={ r3provider.getR3TextRes().tResResourceKeysValueHint }
					onChange={ (event) => this.handleStaticResKeysValChange(event) }
					InputProps={{ className: classes.inputTextField }}
					{ ...theme.r3CreateServiceDialog.textField }
					className={ classes.textField }
				/>
				<Button
					disabled={ r3IsEmptyString(keyname, true) }
					onClick={ this.handleConfirmStaticResKey }
					{ ...theme.r3CreateServiceDialog.staticResKeyPopoverButton }
					className={ classes.staticResKeyPopoverButton }
				>
					{ buttonName }
					<CheckCircleIcon
						className={ classes.buttonIcon }
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
		const { theme, classes, r3provider } = this.props;

		let	newStaticResKeyPopover = this.getNewStaticResKeyPopover();

		return (
			<React.Fragment>
				{ newStaticResKeyPopover }
				<TableHead
					className={ classes.tableHead }
				>
					<TableRow>
						<TableCell
							className={ classes.tableLeftCell }
						>
							<Tooltip
								title={ r3provider.getR3TextRes().tResStaticResAddKeyTT }
								open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.addStaticResKeyTooltip, 'boolean')) ? false : this.state.tooltips.addStaticResKeyTooltip) }
							>
								<Button
									onClick={ this.handleNewStaticResKey }
									onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.addStaticResKeyTooltip, true) }
									onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.addStaticResKeyTooltip, false) }
									{ ...theme.r3CreateServiceDialog.addResStaticObjButton }
									className={ classes.actionResStaticObjButton }
								>
									<AddIcon />
								</Button>
							</Tooltip>
							<Typography
								{ ...theme.r3CreateServiceDialog.textTableHead }
								className={ classes.textTableHead }
							>
								{ r3provider.getR3TextRes().tResStaticResKeyTableHead }
							</Typography>
						</TableCell>
						<TableCell
							className={ classes.tableCell }
						>
							<Typography
								{ ...theme.r3CreateServiceDialog.textTableHead }
								className={ classes.textTableHead }
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
	getStaticResKeysTableBody(staticResKeys)
	{
		const { theme, classes, r3provider } = this.props;

		let	_staticResKeys	= staticResKeys;
		let	_sortedKeys		= Object.keys(_staticResKeys).sort();

		return (
			<TableBody>
				{ _sortedKeys.map( (item, pos) => {
					if(pos < (this.state.staticResKeysPageNum * this.props.tableKeysRawCount) || ((this.state.staticResKeysPageNum + 1) * this.props.tableKeysRawCount) <= pos){
						return;
					}

					let	orgName		= item;
					let	stripName	= orgName;
					if(10 < stripName.length){
						stripName = stripName.slice(0, 7) + '...';
					}
					let	orgJson;
					if(r3IsEmptyEntity(_staticResKeys[item])){
						orgJson = '';
					}else if(r3IsSafeTypedEntity(_staticResKeys[item], 'array') || r3IsSafeTypedEntity(_staticResKeys[item], 'object')){
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
								className={ classes.tableLeftCell }
							>
								<Tooltip
									title={ r3provider.getR3TextRes().tResServiceDelStaticResTT }
									open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.delStaticResKeyTooltip, 'number') || (this.state.tooltips.delStaticResKeyTooltip != pos)) ? false : true) }
								>
									<Button
										onClick={ (event) => this.handleDelStaticResKey(event, item) }
										onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.delStaticResKeyTooltip, pos) }
										onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.delStaticResKeyTooltip, -1) }
										{ ...theme.r3CreateServiceDialog.delResStaticObjButton }
										className={ classes.actionResStaticObjButton }
									>
										<DeleteIcon />
									</Button>
								</Tooltip>
								<Tooltip
									title={ r3provider.getR3TextRes().tResStaticResEditKeyTT }
									open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.editStaticResKeyTooltip, 'number') || (this.state.tooltips.editStaticResKeyTooltip != pos)) ? false : true) }
								>
									<Button
										onClick={ (event) => this.handleEditStaticResKey(event, item) }
										onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.editStaticResKeyTooltip, pos) }
										onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.editStaticResKeyTooltip, -1) }
										{ ...theme.r3CreateServiceDialog.editResStaticObjButton }
										className={ classes.actionResStaticObjButton }
									>
										<EditIcon />
									</Button>
								</Tooltip>
								<Tooltip
									title={ orgName }
									open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.nameStaticResKeyTooltip, 'number') || (this.state.tooltips.nameStaticResKeyTooltip != pos)) ? false : true) }
								>
									<Typography
										onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.nameStaticResKeyTooltip, pos) }
										onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.nameStaticResKeyTooltip, -1) }
										{ ...theme.r3CreateServiceDialog.textTableContent }
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
									open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.jsonStaticResKeyTooltip, 'number') || (this.state.tooltips.jsonStaticResKeyTooltip != pos)) ? false : true) }
								>
									<Typography
										onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.jsonStaticResKeyTooltip, pos) }
										onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.jsonStaticResKeyTooltip, -1) }
										{ ...theme.r3CreateServiceDialog.textTableContent }
										className={ classes.textTableContent }
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
		const { theme, classes, r3provider } = this.props;

		let	staticResKeys = this.state.editingStaticRes.keys;
		if(!r3IsSafeTypedEntity(staticResKeys, 'object')){
			staticResKeys = {};
		}
		let	keysCount = Object.keys(staticResKeys).length;
		let	tablehead = this.getStaticResKeysTableHead();
		let	tablebody = this.getStaticResKeysTableBody(staticResKeys);

		return (
			<React.Fragment>
				<Typography
					{ ...theme.r3CreateServiceDialog.keyTitle }
					className={ classes.keyTitle }
				>
					{ r3provider.getR3TextRes().tResStaticResKeysSubTitle }
				</Typography>
				<Box
					className={ classes.tableBox }
				>
					<Table
						{ ...theme.r3CreateServiceDialog.table }
						className={ classes.table }
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
						onChangePage={ this.handleStaticResKeysPageChange }
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
		const { theme, classes, r3provider } = this.props;

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

		let	message;
		if(null != this.state.staticResMessage){
			message = (
				<Typography
					{ ...theme.r3Service.staticResMessage }
					className={ classes.staticResMessage }
				>
					{ this.state.staticResMessage }
				</Typography>
			);
		}

		let	staticResName = '';
		if(r3IsSafeTypedEntity(this.state.editingStaticRes, 'object') && !r3IsEmptyEntityObject(this.state.editingStaticRes, 'name')){
			staticResName = this.state.editingStaticRes.name;
		}
		let	staticResExpire = '';
		if(r3IsSafeTypedEntity(this.state.editingStaticRes, 'object') && !r3IsEmptyEntityObject(this.state.editingStaticRes, 'expire')){
			staticResExpire = String(this.state.editingStaticRes.expire);
		}

		let	staticResType;
		let	staticResDataHint;
		let	staticResData		= '';
		if(r3IsSafeTypedEntity(this.state.editingStaticRes, 'object') && !r3IsEmptyEntityObject(this.state.editingStaticRes, 'type') && 'object' == this.state.editingStaticRes.type){
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

		let	staticResKeys = this.renderEditStaticResKeys();

		// confirm button
		let	actionButton;
		if(this.props.createMode){
			// has main page
			let	saveButtonName;
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
						className={ classes.cancelButton }
					>
						{ r3provider.getR3TextRes().tResButtonPrevious }
						<CancelIcon
							className={ classes.buttonIcon }
						/>
					</Button>
					<Button
						disabled={ r3IsEmptyString(staticResName, true) }
						onClick={ (event) => this.handleStaticResPageClose(event, false) }
						{ ...theme.r3CreateServiceDialog.okButton }
						className={ classes.okButton }
					>
						{ saveButtonName }
						<CheckCircleIcon
							className={ classes.buttonIcon }
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
						className={ classes.cancelButton }
					>
						{ r3provider.getR3TextRes().tResButtonCancel }
						<CancelIcon
							className={ classes.buttonIcon }
						/>
					</Button>
					<Button
						disabled={ r3IsEmptyString(staticResName, true) }
						onClick={ (event) => this.handleStaticResPageClose(event, false) }
						{ ...theme.r3CreateServiceDialog.okButton }
						className={ classes.okButton }
					>
						{ r3provider.getR3TextRes().tResButtonOk }
						<CheckCircleIcon
							className={ classes.buttonIcon }
						/>
					</Button>
				</DialogActions>
			);
		}

		return (
			<React.Fragment>
				<DialogTitle
					{ ...theme.r3CreateServiceDialog.dialogTitle }
					className={ classes.dialogTitle }
				>
					<Typography
						{ ...theme.r3CreateServiceDialog.title }
						className={ classes.title }
					>
						{ r3provider.getR3TextRes().cStaticResourceTitle }
					</Typography>
				</DialogTitle>

				<DialogContent
					className={ classes.dialogContent }
				>
					{ message }
					<Typography
						{ ...theme.r3CreateServiceDialog.keyTitle }
						className={ classes.keyTitle }
					>
						{ r3provider.getR3TextRes().tResStaticResNameSubTitle }
					</Typography>
					<TextField
						id={ dialogComponentsIds.staticObjNameTextFieldId }
						value={ staticResName }
						placeholder={ r3provider.getR3TextRes().tResStaticResNameHint }
						onChange={ (event) => this.handleStaticResNameChange(event) }
						InputProps={{ className: classes.inputTextField }}
						{ ...theme.r3CreateServiceDialog.textField }
						className={ classes.textField }
					/>
					<Typography
						{ ...theme.r3CreateServiceDialog.keyTitle }
						className={ classes.keyTitle }
					>
						{ r3provider.getR3TextRes().tResStaticResExpSubTitle }
					</Typography>
					<TextField
						id={ dialogComponentsIds.staticObjExpireTextFieldId }
						value={ staticResExpire }
						placeholder={ r3provider.getR3TextRes().tResStaticResExpHint }
						onChange={ (event) => this.handleStaticResExpireChange(event) }
						InputProps={{ className: classes.inputTextField }}
						{ ...theme.r3CreateServiceDialog.textField }
						className={ classes.textField }
					/>
					<Typography
						{ ...theme.r3CreateServiceDialog.keyTitle }
						className={ classes.keyTitle }
					>
						{ r3provider.getR3TextRes().tResStaticResTypeSubTitle }
					</Typography>
					<RadioGroup
						id={ dialogComponentsIds.staticObjTypeGroupId }
						value={ staticResType }
						onChange={ this.handleStaticResTypeChange }
						{ ...theme.r3CreateServiceDialog.valueRadioGroup }
						className={ classes.valueRadioGroup }
					>
						<FormControlLabel
							value={ staticResDataType.staticResStringDataType }
							label={ leftTypeSelectLabel }
							disabled={ false }
							control={ <Radio /> }
							{ ...theme.r3CreateServiceDialog.valueLeftFormControlLabel }
							className={ classes.valueLeftFormControlLabel }
						/>
						<FormControlLabel
							value={ staticResDataType.staticResObjectDataType }
							label={ rightTypeSelectLabel }
							disabled={ false }
							control={ <Radio /> }
							{ ...theme.r3CreateServiceDialog.valueRightFormControlLabel }
							className={ classes.valueRightFormControlLabel }
						/>
					</RadioGroup>
					<TextField
						id={ dialogComponentsIds.staticObjDataTextFieldId }
						value={ staticResData }
						placeholder={ staticResDataHint }
						onChange={ (event) => this.handleStaticResDataChange(event) }
						InputProps={{ className: classes.inputTextField }}
						{ ...theme.r3CreateServiceDialog.textField }
						className={ classes.textField }
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
		const { theme, classes, r3provider } = this.props;

		return (
			<TextField
				id={ dialogComponentsIds.verifyTextFieldId }
				value={ this.state.newVerify }
				placeholder={ r3provider.getR3TextRes().tResServiceUrlResHint }
				onChange={ (event) => this.handleNewVerifyChange(event) }
				InputProps={{ className: classes.inputTextField }}
				{ ...theme.r3CreateServiceDialog.textField }
				className={ classes.textField }
			/>
		);
	}

	//
	// Render: Main page Resoruce - Static resource object(table head)
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
						className={ classes.tableLeftCell }
					>
						<Tooltip
							title={ r3provider.getR3TextRes().tResServiceAddStaticResTT }
							open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.addResStaticObjTooltip, 'boolean')) ? false : this.state.tooltips.addResStaticObjTooltip) }
						>
							<Button
								onClick={ this.handleNewStaticResourceObj }
								onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.addResStaticObjTooltip, true) }
								onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.addResStaticObjTooltip, false) }
								{ ...theme.r3CreateServiceDialog.addResStaticObjButton }
								className={ classes.actionResStaticObjButton }
							>
								<AddIcon />
							</Button>
						</Tooltip>
						<Typography
							{ ...theme.r3CreateServiceDialog.textTableHead }
							className={ classes.textTableHead }
						>
							{ r3provider.getR3TextRes().tResServiceNameTableHead }
						</Typography>
					</TableCell>
					<TableCell
						className={ classes.tableCell }
					>
						<Typography
							{ ...theme.r3CreateServiceDialog.textTableHead }
							className={ classes.textTableHead }
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
		const { theme, classes, r3provider } = this.props;

		if(!r3IsSafeTypedEntity(this.state.newStaticRes, 'array')){
			return;
		}
		let	resources = this.state.newStaticRes;

		return (
			<TableBody>
				{resources.map( (item, pos) => {
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
								className={ classes.tableLeftCell }
							>
								<Tooltip
									title={ r3provider.getR3TextRes().tResServiceEditStaticResTT }
									open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.editResStaticObjTooltip, 'number') || (this.state.tooltips.editResStaticObjTooltip != pos)) ? false : true) }
								>
									<Button
										onClick={ (event) => this.handleEditStaticResourceObj(event, pos) }
										onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.editResStaticObjTooltip, pos) }
										onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.editResStaticObjTooltip, -1) }
										{ ...theme.r3CreateServiceDialog.editResStaticObjButton }
										className={ classes.actionResStaticObjButton }
									>
										<EditIcon />
									</Button>
								</Tooltip>
								<Tooltip
									title={ r3provider.getR3TextRes().tResServiceDelStaticResTT }
									open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.delResStaticObjTooltip, 'number') || (this.state.tooltips.delResStaticObjTooltip != pos)) ? false : true) }
								>
									<Button
										onClick={ (event) => this.handleDelStaticResourceObj(event, pos) }
										onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.delResStaticObjTooltip, pos) }
										onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.delResStaticObjTooltip, -1) }
										{ ...theme.r3CreateServiceDialog.delResStaticObjButton }
										className={ classes.actionResStaticObjButton }
									>
										<DeleteIcon />
									</Button>
								</Tooltip>
								<Tooltip
									title={ orgName }
									open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.nameResStaticObjTooltip, 'number') || (this.state.tooltips.nameResStaticObjTooltip != pos)) ? false : true) }
								>
									<Typography
										onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.nameResStaticObjTooltip, pos) }
										onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.nameResStaticObjTooltip, -1) }
										{ ...theme.r3CreateServiceDialog.textTableContent }
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
										onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.jsonResStaticObjTooltip, pos) }
										onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.jsonResStaticObjTooltip, -1) }
										{ ...theme.r3CreateServiceDialog.textTableContent }
										className={ classes.textTableContent }
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
		const { theme, classes, r3provider } = this.props;

		if(!r3IsSafeTypedEntity(this.state.newStaticRes, 'array')){
			return;
		}

		let	tablehead = this.getResStaticObjTableHead();
		let	tablebody = this.getResStaticObjTableBody();
		let	textValue = JSON.stringify(this.state.newStaticRes);

		return (
			<Box
				className={ classes.tableBox }
			>
				<Table
					{ ...theme.r3CreateServiceDialog.table }
					className={ classes.table }
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
					onChangePage={ this.handleResStaticObjPageChange }
				/>
				<TextField
					id={ dialogComponentsIds.staticObjTextFieldId }
					value={ textValue }
					disabled={ true }
					placeholder={ r3provider.getR3TextRes().tResServiceStaticObjHint }
					InputProps={{ className: classes.inputTextField }}
					{ ...theme.r3CreateServiceDialog.textField }
					className={ classes.reesourceStaticTextField }
				/>
			</Box>
		);
	}

	//
	// Render: Main page(create service page)
	//
	renderCreateMainPage()
	{
		const { theme, classes, r3provider } = this.props;

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

		let	tenant;
		let	tenantClass;
		if(!r3IsEmptyStringObject(this.props.tenant, 'display')){
			tenant		= this.props.tenant.display;
			tenantClass	= classes.value;
		}else{
			tenant		= r3provider.getR3TextRes().tResUnselected;
			tenantClass	= classes.valueItalic;
		}

		let	radioValue;
		let	serviceResource;
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
					className={ classes.dialogTitle }
				>
					<Typography
						{ ...theme.r3CreateServiceDialog.title }
						className={ classes.title }
					>
						{ r3provider.getR3TextRes().cCreateServiceTitle }
					</Typography>
				</DialogTitle>

				<DialogContent
					className={ classes.dialogContent }
				>
					<Typography
						{ ...theme.r3CreateServiceDialog.keyTitle }
						className={ classes.keyTitle }
					>
						{ r3provider.getR3TextRes().tResTenantServiceSubTitle }
					</Typography>
					<Typography
						{ ...theme.r3CreateServiceDialog.value }
						className={ tenantClass }
					>
						{ tenant }
					</Typography>

					<Typography
						{ ...theme.r3CreateServiceDialog.keyTitle }
						className={ classes.keyTitle }
					>
						{ r3provider.getR3TextRes().tResCreateServiceSubTitle }
					</Typography>
					<TextField
						id={ dialogComponentsIds.serviceTextFieldId }
						value={ this.state.newServiceName }
						placeholder={ r3provider.getR3TextRes().tResCreateServiceHint }
						onChange={ (event) => this.handleNewServiceNameChange(event) }
						InputProps={{ className: classes.inputTextField }}
						{ ...theme.r3CreateServiceDialog.textField }
						className={ classes.textField }
					/>

					<Typography
						{ ...theme.r3CreateServiceDialog.keyTitle }
						className={ classes.keyTitle }
					>
						{ r3provider.getR3TextRes().tResServiceUrlResSubTitle }
					</Typography>

					<RadioGroup
						id={ dialogComponentsIds.serviceRadioGroupId }
						value={ radioValue }
						onChange={ this.handleResourceTypeChange }
						{ ...theme.r3CreateServiceDialog.valueRadioGroup }
						className={ classes.valueRadioGroup }
					>
						<FormControlLabel
							value={ serviceResTypeUrl }
							label={ leftTypeSelectLabel }
							disabled={ false }
							control={ <Radio /> }
							{ ...theme.r3CreateServiceDialog.valueLeftFormControlLabel }
							className={ classes.valueLeftFormControlLabel }
						/>
						<FormControlLabel
							value={ serviceResTypeObject }
							label={ rightTypeSelectLabel }
							disabled={ false }
							control={ <Radio /> }
							{ ...theme.r3CreateServiceDialog.valueRightFormControlLabel }
							className={ classes.valueRightFormControlLabel }
						/>
					</RadioGroup>
					{ serviceResource }
				</DialogContent>

				<DialogActions>
					<Button
						onClick={ (event) => this.props.onClose(event, null, false, null, null, null, null) }
						{ ...theme.r3CreateServiceDialog.cancelButton }
						className={ classes.cancelButton }
					>
						{ r3provider.getR3TextRes().tResButtonCancel }
						<CancelIcon
							className={ classes.buttonIcon }
						/>
					</Button>
					<Button
						disabled={ r3IsEmptyString(this.state.newServiceName, true) }
						onClick={ (event) => this.props.onClose(event, null, true, this.state.newServiceName, this.state.newServiceResType, this.state.newVerify, this.state.newStaticRes) }
						{ ...theme.r3CreateServiceDialog.okButton }
						className={ classes.okButton }
					>
						{ r3provider.getR3TextRes().tResButtonOk }
						<CheckCircleIcon
							className={ classes.buttonIcon }
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
		const { theme, classes } = this.props;

		let	dialogContext;
		if(this.state.editingStaticResMode){
			dialogContext = this.renderEditStaticResPage();
		}else{
			dialogContext = this.renderCreateMainPage();
		}

		return (
			<Dialog
				open={ this.props.open }
				onClose={ (event, reason) => this.props.onClose(event, reason, false, null) }
				{ ...theme.r3CreateServiceDialog.root }
				className={ classes.root }
			>
				{ dialogContext }
			</Dialog>
		);
	}
}

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
