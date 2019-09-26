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
 * CREATE:   Tue Aug 22 2017
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
import FormControl					from '@material-ui/core/FormControl';	// For Radio Button
import FormControlLabel				from '@material-ui/core/FormControlLabel';
import RadioGroup					from '@material-ui/core/RadioGroup';
import Radio						from '@material-ui/core/Radio';
import Tooltip						from '@material-ui/core/Tooltip';
import DeleteIcon					from '@material-ui/icons/ClearRounded';
import AddIcon						from '@material-ui/icons/AddRounded';
import UpIcon						from '@material-ui/icons/ArrowUpwardRounded';
import DownIcon						from '@material-ui/icons/ArrowDownwardRounded';

import { r3Resource }				from './r3styles';
import R3FormButtons				from './r3formbuttons';					// Buttons
import R3PopupMsgDialog				from './r3popupmsgdialog';
import R3Message					from '../util/r3message';
import { regYrnAnyResourcePath }	from '../util/r3define';
import { errorType, resourceTypeString, resourceTypeObject, actionTypeName, actionTypeValue, actionTypeNewKey, actionTypeNewValue, actionTypeDelete, actionTypeAdd, actionTypeUp, actionTypeDown } from '../util/r3types';
import { r3DeepClone, r3DeepCompare, r3RenameObjectKey, r3IsJSON, r3ConvertFromJSON, r3IsEmptyEntity, r3IsEmptyEntityObject, r3IsEmptyStringObject, r3IsEmptyString, r3IsSafeTypedEntity } from '../util/r3util';

//
// Local variables
//
const tooltipValues = {
	deleteKeysTooltip:				'deleteKeysTooltip',
	addKeysTooltip:					'addKeysTooltip',
	downAliasTooltip:				'downAliasTooltip',
	upAliasTooltip:					'upAliasTooltip',
	deleteAliasTooltip:				'deleteAliasTooltip',
	addAliasTooltip:				'addAliasTooltip'
};

const resourceComponentValues = {
	valueTypeRadioName:				'resourceType',
	valueTextFieldName:				'resourceValue',
	keysKeyTextFieldNamePrefix:		'resourceKeysKey_',
	keysValueTextFieldNamePrefix:	'resourceKeysValue_',
	keysNewKeyTextFieldName:		'resourceKeysNewKey',
	keysNewValueTextFieldName:		'resourceKeysNewValue',
	aliasTextFieldNamePrefix:		'aliasValue_',
	aliasNewTextFieldName:			'aliasNew'
};

//
// Resource Contents Class
//
@withTheme()
@withStyles(r3Resource)
export default class R3Resource extends React.Component
{
	static contextTypes = {
		r3Context:	PropTypes.object.isRequired
	};

	static propTypes = {
		r3provider:	PropTypes.object.isRequired,
		resource:	PropTypes.object.isRequired,
		dispUnique:	PropTypes.number.isRequired,
		isReadMode:	PropTypes.bool,
		onSave:		PropTypes.func.isRequired,
		onUpdate:	PropTypes.func.isRequired
	};

	static defaultProps = {
		isReadMode:	false
	};

	state = R3Resource.createState(this.props.resource, this.props.dispUnique);

	constructor(props)
	{
		super(props);

		// Binding(do not define handlers as arrow functions for performance)
		this.handleSave					= this.handleSave.bind(this);
		this.handleCancel				= this.handleCancel.bind(this);
		this.handleConfirmDialogClose	= this.handleConfirmDialogClose.bind(this);
		this.handleMessageDialogClose	= this.handleMessageDialogClose.bind(this);

		this.handleValueTypeChange		= this.handleValueTypeChange.bind(this);
		this.handleValueChange			= this.handleValueChange.bind(this);
		this.handleKeysChange			= this.handleKeysChange.bind(this);
		this.handleAddKeysChange		= this.handleAddKeysChange.bind(this);
		this.handleAliasesChange		= this.handleAliasesChange.bind(this);
		this.handleAddAliasesChange		= this.handleAddAliasesChange.bind(this);
	}

	componentDidMount()
	{
		// update State
		this.setState(R3Resource.createState(this.props.resource, this.props.dispUnique));
	}

	// [NOTE]
	// Use getDerivedStateFromProps by deprecating componentWillReceiveProps in React 17.x.
	// The only purpose is to set the state data from props when the dialog changes from hidden to visible.
	//
	static getDerivedStateFromProps(nextProps, prevState)
	{
		if(nextProps.dispUnique !== prevState.dispUnique){
			// Switching content
			return R3Resource.createState(nextProps.resource, nextProps.dispUnique);
		}
		return null;															// Return null to indicate no change to state.
	}

	static createState(resource, dispUnique)
	{
		let	resourceType	= resourceTypeString;			// default
		let	resourceValue	= '';
		if(!r3IsEmptyEntity(resource)){
			if(r3IsSafeTypedEntity(resource.string, 'string')){
				resourceType	= resourceTypeString;
				resourceValue	= resource.string;
			}else if(r3IsSafeTypedEntity(resource.object, 'object')){
				resourceType	= resourceTypeObject;
				resourceValue	= JSON.stringify(resource.object);
			}
		}

		return {
			dispUnique:				dispUnique,
			resource:				r3DeepClone(resource),
			resourceType:			resourceType,
			resourceValue:			resourceValue,
			addKeyName:				'',
			addKeyValue:			'',
			addAliases:				'',
			changed:				false,
			confirmMessageObject:	null,
			messageDialogObject:	null,

			tooltips: {
				deleteKeysTooltip:	null,		// keyname
				addKeysTooltip:		false,
				downAliasTooltip:	-1,			// position
				upAliasTooltip:		-1,			// position
				deleteAliasTooltip:	-1,			// position
				addAliasTooltip:	false
			}
		};
	}

	//
	// Check only resource value and type state
	//
	isChangedKeysValueState(nowType, nowValue)
	{
		if(r3IsEmptyEntity(nowType) || r3IsEmptyEntity(nowValue)){
			nowType	= this.state.resourceType;
			nowValue= this.state.resourceValue;
		}
		// check type
		let	propsType	= resourceTypeString;
		let	propsValue	= '';
		if(!r3IsEmptyEntity(this.props.resource) && r3IsSafeTypedEntity(this.props.resource.string, 'string')){
			propsType	= resourceTypeString;
			propsValue	= this.props.resource.string;
		}else if(!r3IsEmptyEntity(this.props.resource) && r3IsSafeTypedEntity(this.props.resource.object, 'object')){
			propsType	= resourceTypeObject;
			propsValue	= this.props.resource.object;
		}
		if(propsType !== nowType){
			return true;
		}

		// check value
		return !r3DeepCompare(nowValue, propsValue);
	}

	//
	// Check only keys state
	//
	isChangedKeysNameState(nowKeys)
	{
		if(r3IsEmptyEntity(nowKeys)){
			nowKeys	= r3IsEmptyEntity(this.state.resource) ? undefined : this.state.resource.keys;
		}
		if(r3IsEmptyEntity(nowKeys)){
			nowKeys = {};									// empty object
		}
		let	propsKeys = r3IsEmptyEntity(this.props.resource) ? undefined : this.props.resource.keys;
		if(r3IsEmptyEntity(propsKeys)){
			propsKeys = {};									// empty object
		}
		// check
		return !r3DeepCompare(nowKeys, propsKeys);
	}

	//
	// Check only aliases state
	//
	isChangedAliasesState(nowAliases)
	{
		if(r3IsEmptyEntity(nowAliases)){
			nowAliases	= r3IsEmptyEntity(this.state.resource) ? undefined : this.state.resource.aliases;
		}
		if(!r3IsSafeTypedEntity(nowAliases, 'array')){
			nowAliases = [];									// empty array
		}
		let	propsAliases = r3IsEmptyEntity(this.props.resource) ? undefined : this.props.resource.aliases;
		if(!r3IsSafeTypedEntity(propsAliases, 'array')){
			propsAliases = [];									// empty object
		}
		// check
		return !r3DeepCompare(nowAliases, propsAliases);
	}

	//
	// Check all state
	//
	isChangedState(nowType, nowValue, nowKeys, nowAliases)
	{
		// check resource value and type
		if(this.isChangedKeysValueState(nowType, nowValue)){
			return true;
		}
		// check keys
		if(this.isChangedKeysNameState(nowKeys)){
			return true;
		}
		// check aliases
		if(this.isChangedAliasesState(nowAliases)){
			return true;
		}
		return false;
	}

	//
	// Handle Form Button : Save
	//
	handleSave(event)														// eslint-disable-line no-unused-vars
	{
		if(this.state.changed){
			//
			// Check resource
			//
			let	newResource = r3DeepClone(this.state.resource);
			let	cnt;
			let	cnt2;

			//
			// type and value
			//
			if(resourceTypeString === this.state.resourceType){
				if(r3IsEmptyString(this.state.resourceValue)){
					newResource.string = null;
					newResource.object = null;
				}else{
					newResource.string = this.state.resourceValue.trim();
					newResource.object = null;
				}
			}else if(resourceTypeObject === this.state.resourceType){
				if(r3IsEmptyString(this.state.resourceValue)){
					newResource.object = null;
					newResource.string = null;
				}else{
					let	tmpValue = this.state.resourceValue.trim();
					if(!r3IsJSON(tmpValue)){
						// value as string to JSON
						tmpValue = JSON.stringify(tmpValue);
					}
					newResource.object = r3ConvertFromJSON(tmpValue);	// to objects
					newResource.string = null;
				}
			}else{
				this.setState({
					messageDialogObject:	new R3Message(this.props.r3provider.getR3TextRes().eResourceType, errorType)
				});
				return;
			}

			//
			// keys
			//
			if(!r3IsSafeTypedEntity(newResource.keys, 'object')){
				newResource.keys = {};
			}
			let	keyNames = Object.keys(newResource.keys);
			let	nameLists= {};

			// check same key name and empty
			for(cnt = 0; cnt < keyNames.length; ++cnt){
				let	name= keyNames[cnt];
				if(r3IsEmptyString(name, true)){
					this.setState({
						messageDialogObject:	new R3Message(this.props.r3provider.getR3TextRes().eEmptyKey, errorType)
					});
					return;
				}
				name = name.trim();
				let	pos	= name.lastIndexOf('\n');
				if(-1 !== pos){
					name = name.substr(0, pos);							// cut '\n'...
					if(r3IsEmptyString(name)){
						this.setState({
							messageDialogObject:	new R3Message(this.props.r3provider.getR3TextRes().eEmptyKey, errorType)
						});
						return;
					}
				}
				if(!r3IsEmptyEntity(nameLists[name])){
					this.setState({
						messageDialogObject:	new R3Message(this.props.r3provider.getR3TextRes().eSameKey, errorType)
					});
					return;
				}
				nameLists[name] = null;
			}

			// convert key name in object and convert value to object
			for(cnt = 0; cnt < keyNames.length; ++cnt){
				let	name= keyNames[cnt].trim();
				let	pos	= name.lastIndexOf('\n');
				if(-1 !== pos){
					name = name.substr(0, pos);							// cut '\n'...
					newResource.keys[name] = newResource.keys[keyNames[cnt]];
					delete newResource.keys[keyNames[cnt]];
				}
				let	tmpValue = newResource.keys[name];
				if(!r3IsJSON(tmpValue)){
					// value to JSON
					tmpValue = JSON.stringify(tmpValue);
				}
				newResource.keys[name] = r3ConvertFromJSON(tmpValue);	// to objects
			}

			//
			// aliases
			//
			if(!r3IsSafeTypedEntity(newResource.aliases, 'array')){
				newResource.aliases = [];
			}
			// check empty and yrn path by regex
			let	regAliasPath = new RegExp(regYrnAnyResourcePath);
			for(cnt = 0; cnt < newResource.aliases.length; ++cnt){
				newResource.aliases[cnt] = newResource.aliases[cnt].trim();

				if(null === newResource.aliases[cnt].match(regAliasPath)){
					this.setState({
						messageDialogObject:	new R3Message(this.props.r3provider.getR3TextRes().eNotYRNAliases, errorType)
					});
					return;
				}
			}
			// check same value
			for(cnt = 0; cnt < newResource.aliases.length; ++cnt){
				for(cnt2 = (cnt + 1); cnt2 < newResource.aliases.length; ++cnt2){
					if(newResource.aliases[cnt] === newResource.aliases[cnt2]){
						this.setState({
							messageDialogObject:	new R3Message(this.props.r3provider.getR3TextRes().eAliasArray, errorType)
						});
						return;
					}
				}
			}

			//
			// Check changed
			//
			if(!this.isChangedState(this.state.resourceType, (resourceTypeString === this.state.resourceType ? newResource.string : newResource.object), newResource.keys, newResource.aliases)){
				this.setState({
					messageDialogObject:	new R3Message(this.props.r3provider.getR3TextRes().eNoChange, errorType)
				});
				return;
			}
			this.props.onSave(newResource);
		}
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
	handleConfirmDialogClose(event, result)									// eslint-disable-line no-unused-vars
	{
		if(result){
			// case for 'cancel updating' to do
			this.props.onUpdate(false);

			// rewind State
			this.setState(R3Resource.createState(this.props.resource, this.props.dispUnique));
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
	handleMessageDialogClose(event, result)									// eslint-disable-line no-unused-vars
	{
		this.setState({
			messageDialogObject:	null
		});
	}

	//
	// Handle Resource Value Type : Change
	//
	handleValueTypeChange(event, type)										// eslint-disable-line no-unused-vars
	{
		if(this.state.resourceType === type){
			console.warn('changed value type(' + JSON.stringify(type) + ') is something wrong.');
			return;
		}
		// now type and value
		let	nowResourceType	= this.state.resourceType;
		let	nowResourceValue= this.state.resourceValue;

		// default(props) value by now type
		let	defaultResourceValue;
		if(resourceTypeString === nowResourceType){
			defaultResourceValue = r3IsEmptyStringObject(this.props.resource, 'string') ? '' : this.props.resource.string;
		}else{
			defaultResourceValue = (r3IsEmptyEntity(this.props.resource) || !r3IsSafeTypedEntity(this.props.resource.object, 'object')) ? '' : this.props.resource.object;
		}

		// new type and value
		let	newResourceType	= type;
		let	newResourceValue= nowResourceValue;			// = now value

		// check whether now value and default value is changed
		if(r3DeepCompare(nowResourceValue, defaultResourceValue)){
			// not modified value, thus gets new value for new type from props
			if(resourceTypeString === newResourceType){
				newResourceValue = r3IsEmptyStringObject(this.props.resource, 'string') ? '' : this.props.resource.string;
			}else{
				newResourceValue = (r3IsEmptyEntity(this.props.resource) || !r3IsSafeTypedEntity(this.props.resource.object, 'object')) ? '' : JSON.stringify(this.props.resource.object);
			}
		}

		// set parent changed state
		let	changed = this.isChangedState(newResourceType, newResourceValue);
		this.props.onUpdate(changed);

		// update state
		this.setState({
			changed:		changed,
			resourceType:	newResourceType,
			resourceValue:	newResourceValue
		});
	}

	//
	// Handle Resource Value : Change
	//
	handleValueChange(event)
	{
		// set parent changed state
		let	changed = this.isChangedState(this.state.resourceType, event.target.value);
		this.props.onUpdate(changed);

		// update state
		this.setState({
			changed:		changed,
			resourceValue:	event.target.value
		});
	}

	//
	// Handle Resource Keys( key, value ) : Change
	//
	handleKeysChange(event, type, keyname)
	{
		let	nowKeys = {};
		if(r3IsSafeTypedEntity(this.state.resource.keys, 'object')){
			nowKeys = r3DeepClone(this.state.resource.keys);
		}

		let	changedValue	= r3IsEmptyEntityObject(event.target, 'value') ? null : event.target.value;
		let	newKeys			= nowKeys;
		let	isClearNewKey	= false;
		if(actionTypeName === type){
			//
			// changed name
			//
			if(!r3IsEmptyEntity(nowKeys[changedValue])){
				// found same name, we allow it as temporary. then pickups temporary additional name.
				for(let counter = 0, found = false; !found; ++counter){
					let tmpName		= changedValue + '\n' + String(counter);		// convert new name with ('\n' + number)
					if(r3IsEmptyEntity(nowKeys[tmpName])){
						changedValue= tmpName;
						found		= true;
					}
				}
			}
			// change keyname
			newKeys = r3RenameObjectKey(nowKeys, keyname, changedValue);

		}else if(actionTypeValue === type){
			//
			// changed value
			//
			newKeys[keyname] = changedValue;

		}else if(actionTypeDelete === type){
			if(!r3IsEmptyEntity(newKeys[keyname])){
				delete newKeys[keyname];
			}

		}else if(actionTypeAdd === type){
			if(r3IsEmptyString(this.state.addKeyName)){
				this.setState({
					messageDialogObject:	new R3Message(this.props.r3provider.getR3TextRes().eNewKeyName, errorType)
				});
				return;
			}
			if(!r3IsSafeTypedEntity(this.state.addKeyValue, 'string')){
				this.setState({
					messageDialogObject:	new R3Message(this.props.r3provider.getR3TextRes().eNewKeyValue, errorType)
				});
				return;
			}

			//
			// check name
			//
			let	newName = this.state.addKeyName;
			if(!r3IsEmptyEntity(nowKeys[newName])){
				// found same name, we allow it as temporary. then pickups temporary additional name.
				for(let counter = 0, found = false; !found; ++counter){
					let tmpName	= newName + '\n' + String(counter);		// convert new name with ('\n' + number)
					if(r3IsEmptyEntity(nowKeys[tmpName])){
						newName	= tmpName;
						found	= true;
					}
				}
			}
			// add
			newKeys[newName]	= this.state.addKeyValue;
			isClearNewKey		= true;

		}else{
			console.warn('unknown action(' + JSON.stringify(type) + ') for keys.');
			return;
		}

		// make new resource object
		let	newResource		= r3DeepClone(this.state.resource);
		newResource.keys	= newKeys;

		// set parent changed state
		let	changed			= this.isChangedState(null, null, newKeys);
		this.props.onUpdate(changed);

		// update state
		this.setState({
			resource:		newResource,
			changed:		changed,
			addKeyName:		(isClearNewKey ? '' : this.state.addKeyName),
			addKeyValue:	(isClearNewKey ? '' : this.state.addKeyValue)
		});
	}

	//
	// Handle Add Resource Keys( key, value ) : Change
	//
	handleAddKeysChange(event, type)
	{
		// update state
		if(actionTypeNewKey === type){
			this.setState({
				addKeyName:		event.target.value
			});
		}else if(actionTypeNewValue === type){
			this.setState({
				addKeyValue:	event.target.value
			});
		}else{
			console.warn('unknown action(' + JSON.stringify(type) + ') for keys.');
			return;
		}
	}

	//
	// Handle Resource Aliases : Change
	//
	handleAliasesChange(event, type, pos)
	{
		let	changedValue	= r3IsEmptyEntityObject(event.target, 'value') ? null : event.target.value;
		let	isClearNewAlias	= false;
		let	newAliases		= [];
		if(r3IsSafeTypedEntity(this.state.resource.aliases, 'array')){
			newAliases		= r3DeepClone(this.state.resource.aliases);
		}

		if(actionTypeValue === type){
			// change value at pos
			newAliases[pos]	= changedValue;

		}else if(actionTypeDelete === type){
			// delete value at pos
			newAliases.splice(pos, 1);

		}else if(actionTypeUp === type){
			// move pos's value to up
			let	targetValue = newAliases[pos];			// real or ref
			newAliases.splice((pos - 1), 0, targetValue);
			newAliases.splice(pos + 1, 1);

		}else if(actionTypeDown === type){
			// move pos's value to down
			let	targetValue = newAliases[pos + 1];		// real or ref
			newAliases.splice(pos, 0, targetValue);
			newAliases.splice(pos + 2, 1);

		}else if(actionTypeAdd === type){
			// add new aliases
			if(r3IsEmptyString(this.state.addAliases, true)){
				this.setState({
					messageDialogObject:	new R3Message(this.props.r3provider.getR3TextRes().eNewAliases, errorType)
				});
				return;
			}
			// add
			newAliases.push(this.state.addAliases.trim());
			isClearNewAlias = true;

		}else{
			console.warn('unknown action(' + JSON.stringify(type) + ') for aliases.');
			return;
		}

		// make new resource object
		let	newResource		= r3DeepClone(this.state.resource);
		newResource.aliases	= newAliases;

		// set parent changed state
		let	changed			= this.isChangedState(null, null, null, newAliases);
		this.props.onUpdate(changed);

		// update state
		this.setState({
			resource:		newResource,
			changed:		changed,
			addAliases:		(isClearNewAlias ? '' : this.state.addAliases)
		});
	}

	//
	// Handle Add Resource Aliases : Change
	//
	handleAddAliasesChange(event)
	{
		// update state
		this.setState({
			addAliases:		event.target.value
		});
	}

	handTooltipChange = (event, type, extData) =>									// eslint-disable-line no-unused-vars
	{
		if(tooltipValues.deleteKeysTooltip === type){
			this.setState({
				tooltips: {
					deleteKeysTooltip:	extData
				}
			});
		}else if(tooltipValues.addKeysTooltip === type){
			this.setState({
				tooltips: {
					addKeysTooltip:		extData
				}
			});
		}else if(tooltipValues.downAliasTooltip === type){
			this.setState({
				tooltips: {
					downAliasTooltip:	extData
				}
			});
		}else if(tooltipValues.upAliasTooltip === type){
			this.setState({
				tooltips: {
					upAliasTooltip:		extData
				}
			});
		}else if(tooltipValues.deleteAliasTooltip === type){
			this.setState({
				tooltips: {
					deleteAliasTooltip:	extData
				}
			});
		}else if(tooltipValues.addAliasTooltip === type){
			this.setState({
				tooltips: {
					addAliasTooltip:	extData
				}
			});
		}
	}

	getKeysContents(items)
	{
		const { theme, classes, r3provider } = this.props;

		if(!r3IsSafeTypedEntity(items, 'object')){
			return;
		}

		let	elementArray = [];
		let	elementCount = 0;
		Object.keys(items).forEach( (keyname) => {
			let	value = '';
			if(r3IsEmptyEntity(items[keyname])){
				value = '';
			}else if(r3IsSafeTypedEntity(items[keyname], 'array')){
				value = JSON.stringify(items[keyname]);
			}else if(r3IsSafeTypedEntity(items[keyname], 'object')){
				value = JSON.stringify(items[keyname]);
			}else{
				// probabry string type
				value = String(items[keyname]);
			}

			// if keyname has '\n', it means escaped same key name.
			let	dispName= keyname;
			let	pos		= dispName.lastIndexOf('\n');
			if(-1 !== pos){
				dispName = dispName.substr(0, pos);
			}

			let	deleteButton;
			if(this.props.isReadMode){
				deleteButton = (
					<IconButton
						disabled={ true }
						{ ...theme.r3Resource.deleteKeysButton }
						className={ classes.deleteInvisibleKeysButton }
					>
						<DeleteIcon />
					</IconButton>
				);
			}else{
				deleteButton = (
					<Tooltip
						title={ r3provider.getR3TextRes().tResResourceKeysDelTT }
						open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.deleteKeysTooltip, 'string') || (this.state.tooltips.deleteKeysTooltip != keyname)) ? false : true) }
					>
						<IconButton
							onClick={ (event) => this.handleKeysChange(event, actionTypeDelete, keyname) }
							onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.deleteKeysTooltip, keyname) }
							onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.deleteKeysTooltip, null) }
							{ ...theme.r3Resource.deleteKeysButton }
							className={ classes.deleteKeysButton }
						>
							<DeleteIcon />
						</IconButton>
					</Tooltip>
				);
			}

			let	inputProps;
			if(this.props.isReadMode){
				inputProps = {};
			}else{
				inputProps = {
					className: classes.inputTextField
				};
			}

			elementArray.push(
				<div
					key={ elementCount++ }
					className={ classes.enclosureElement }
				>
					<TextField
						name={ resourceComponentValues.keysKeyTextFieldNamePrefix + String(elementCount) }
						value={ dispName }
						disabled={ this.props.isReadMode }
						placeholder={ r3provider.getR3TextRes().tResResourceKeysKeyHint }
						onChange={ (event) => this.handleKeysChange(event, actionTypeName, keyname) }
						InputProps={ inputProps }
						{ ...theme.r3Resource.keysKeyTextField }
						className={ classes.keysKeyTextField }
					/>
					<TextField
						name={ resourceComponentValues.keysValueTextFieldNamePrefix + String(elementCount) }
						value={ value }
						disabled={ this.props.isReadMode }
						placeholder={ r3provider.getR3TextRes().tResResourceKeysValueHint }
						onChange={ (event) => this.handleKeysChange(event, actionTypeValue, keyname) }
						InputProps={ inputProps }
						{ ...theme.r3Resource.keysValueTextField }
						className={ classes.keysValueTextField }
					/>
					{ deleteButton }
				</div>
			);
		});

		return (
			elementArray.map( (item, pos) => {							// eslint-disable-line no-unused-vars
				return item;
			})
		);
	}

	getAddKeysContents()
	{
		const { theme, classes, r3provider } = this.props;

		if(this.props.isReadMode){
			return;
		}

		return (
			<div
				className={ classes.enclosureElement }
			>
				<TextField
					name={ resourceComponentValues.keysNewKeyTextFieldName }
					value={ this.state.addKeyName }
					placeholder={ r3provider.getR3TextRes().tResResourceKeysKeyHint }
					onChange={ (event) => this.handleAddKeysChange(event, actionTypeNewKey) }
					InputProps={{ className: classes.inputTextField }}
					{ ...theme.r3Resource.keysKeyTextField }
					className={ classes.keysKeyTextField }
				/>
				<TextField
					name={ resourceComponentValues.keysNewValueTextFieldName }
					value={ this.state.addKeyValue }
					placeholder={ r3provider.getR3TextRes().tResResourceKeysValueHint }
					onChange={ (event) => this.handleAddKeysChange(event, actionTypeNewValue) }
					InputProps={{ className: classes.inputTextField }}
					{ ...theme.r3Resource.keysValueTextField }
					className={ classes.keysValueTextField }
				/>
				<Tooltip
					title={ r3provider.getR3TextRes().tResResourceKeysAddTT }
					open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.addKeysTooltip, 'boolean')) ? false : this.state.tooltips.addKeysTooltip) }
				>
					<IconButton
						onClick={ (event) => this.handleKeysChange(event, actionTypeAdd, null) }
						onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.addKeysTooltip, true) }
						onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.addKeysTooltip, false) }
						{ ...theme.r3Resource.addKeysButton }
						className={ classes.addKeysButton }
					>
						<AddIcon />
					</IconButton>
				</Tooltip>
			</div>
		);
	}

	getAliasContents(items)
	{
		const { theme, classes, r3provider } = this.props;

		if(!r3IsSafeTypedEntity(items, 'array')){
			return;
		}
		let	_items = items;

		return (
			_items.map( (item, pos) =>
			{
				let	downButton;
				if(this.props.isReadMode || (_items.length <= (pos + 1))){
					downButton = (
						<IconButton
							disabled={ true }
							{ ...theme.r3Resource.downAliasButton }
							className={ classes.arrowInvisibleAliasButton }
						>
							<DownIcon />
						</IconButton>
					);
				}else{
					downButton = (
						<Tooltip
							title={ r3provider.getR3TextRes().tResAliasDownTT }
							open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.downAliasTooltip, 'number') || (this.state.tooltips.downAliasTooltip != pos)) ? false : true) }
						>
							<IconButton
								onClick={ (event) => this.handleAliasesChange(event, actionTypeDown, pos) }
								onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.downAliasTooltip, pos) }
								onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.downAliasTooltip, -1) }
								{ ...theme.r3Resource.downAliasButton }
								className={ classes.arrowAliasButton }
							>
								<DownIcon />
							</IconButton>
						</Tooltip>
					);
				}

				let	upButton;
				if(this.props.isReadMode || (0 === pos)){
					upButton = (
						<IconButton
							disabled={ true }
							{ ...theme.r3Resource.upAliasButton }
							className={ classes.arrowInvisibleAliasButton }
						>
							<UpIcon />
						</IconButton>
					);
				}else{
					upButton = (
						<Tooltip
							title={ r3provider.getR3TextRes().tResAliasUpTT }
							open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.upAliasTooltip, 'number') || (this.state.tooltips.upAliasTooltip != pos)) ? false : true) }
						>
							<IconButton
								onClick={ (event) => this.handleAliasesChange(event, actionTypeUp, pos) }
								onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.upAliasTooltip, pos) }
								onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.upAliasTooltip, -1) }
								{ ...theme.r3Resource.upAliasButton }
								className={ classes.arrowAliasButton }
							>
								<UpIcon />
							</IconButton>
						</Tooltip>
					);
				}

				let	deleteButton;
				if(this.props.isReadMode){
					deleteButton = (
						<IconButton
							disabled={ true }
							{ ...theme.r3Resource.deleteAliasButton }
							className={ classes.deleteInvisibleAliasButton }
						>
							<DeleteIcon />
						</IconButton>
					);
				}else{
					deleteButton = (
						<Tooltip
							title={ r3provider.getR3TextRes().tResAliasDelTT }
							open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.deleteAliasTooltip, 'number') || (this.state.tooltips.deleteAliasTooltip != pos)) ? false : true) }
						>
							<IconButton
								onClick={ (event) => this.handleAliasesChange(event, actionTypeDelete, pos) }
								onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.deleteAliasTooltip, pos) }
								onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.deleteAliasTooltip, -1) }
								{ ...theme.r3Resource.deleteAliasButton }
								className={ classes.deleteAliasButton }
							>
								<DeleteIcon />
							</IconButton>
						</Tooltip>
					);
				}

				let	inputProps;
				if(this.props.isReadMode){
					inputProps = {};
				}else{
					inputProps = {
						className: classes.inputTextField
					};
				}

				return (
					<div
						key={ pos }
						className={ classes.enclosureElement }
					>
						<TextField
							name={ resourceComponentValues.aliasTextFieldNamePrefix + String(pos) }
							disabled={ this.props.isReadMode }
							value={ item }
							placeholder={ r3provider.getR3TextRes().tResAliasHint }
							onChange={ (event) => this.handleAliasesChange(event, actionTypeValue, pos) }
							InputProps={ inputProps }
							{ ...theme.r3Resource.aliasTextField }
							className={ classes.aliasTextField }
						/>
						{ downButton }
						{ upButton }
						{ deleteButton }
					</div>
				);
			})
		);
	}

	getAddAliasContents()
	{
		const { theme, classes, r3provider } = this.props;

		if(this.props.isReadMode){
			return;
		}

		return (
			<div
				className={ classes.enclosureElement }
			>
				<TextField
					name={ resourceComponentValues.aliasNewTextFieldName }
					value={ this.state.addAliases }
					placeholder={ r3provider.getR3TextRes().tResAliasHint }
					onChange={ (event) => this.handleAddAliasesChange(event) }
					InputProps={{ className: classes.inputTextField }}
					{ ...theme.r3Resource.aliasTextField }
					className={ classes.aliasTextField }
				/>
				<Tooltip
					title={ r3provider.getR3TextRes().tResAliasAddTT }
					open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.addAliasTooltip, 'boolean')) ? false : this.state.tooltips.addAliasTooltip) }
				>
					<IconButton
						onClick={ (event) => this.handleAliasesChange(event, actionTypeAdd, 0) }
						onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.addAliasTooltip, true) }
						onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.addAliasTooltip, false) }
						{ ...theme.r3Resource.addAliasButton }
						className={ classes.addAliasButton }
					>
						<AddIcon />
					</IconButton>
				</Tooltip>
			</div>
		);
	}

	render()
	{
		console.info('CALL : resource:render()');

		const { theme, classes, r3provider } = this.props;

		let valueTextFieldTheme		= (resourceTypeObject === this.state.resourceType ? theme.r3Resource.valueObjectTextField : theme.r3Resource.valueStringTextField);
		let	leftValueSelectLabel	= (
			<Typography
				{ ...theme.r3Resource.valueFormControlLabel }
			>
				{ r3provider.getR3TextRes().tResResourceValueTypeText }
			</Typography>
		);
		let	rightValueSelectLabel	= (
			<Typography
				{ ...theme.r3Resource.valueFormControlLabel }
			>
				{ r3provider.getR3TextRes().tResResourceValueTypeObj }
			</Typography>
		);

		let	inputProps;
		if(this.props.isReadMode){
			inputProps = {};
		}else{
			inputProps = {
				className: classes.inputTextField
			};
		}

		return (
			<div
				className={ classes.root }
			>
				<Typography
					{ ...theme.r3Resource.subTitle }
					className={ classes.subTitleTop }
				>
					{ r3provider.getR3TextRes().tResResourceValueSubTitle }
				</Typography>
				<FormControl
					{ ...theme.r3Resource.valueFormControl }
					className={ classes.valueFormControl }
				>
					<RadioGroup
						name={ resourceComponentValues.valueTypeRadioName }
						value={ this.state.resourceType }
						onChange={ this.handleValueTypeChange }
						{ ...theme.r3Resource.valueRadioGroup }
						className={ classes.valueRadioGroup }
					>
						<FormControlLabel
							value={ resourceTypeString }
							label={ leftValueSelectLabel }
							disabled={ this.props.isReadMode }
							control={ <Radio /> }
							{ ...theme.r3Resource.valueLeftFormControlLabel }
							className={ classes.valueLeftFormControlLabel }
						/>
						<FormControlLabel
							value={ resourceTypeObject }
							label={ rightValueSelectLabel }
							disabled={ this.props.isReadMode }
							control={ <Radio /> }
							{ ...theme.r3Resource.valueRightFormControlLabel }
							className={ classes.valueRightFormControlLabel }
						/>
					</RadioGroup>
				</FormControl>

				<TextField
					name={ resourceComponentValues.valueTextFieldName }
					value={ this.state.resourceValue }
					placeholder={ (resourceTypeObject === this.state.resourceType ? r3provider.getR3TextRes().tResResourceValueObjHint : r3provider.getR3TextRes().tResResourceValueTextHint) }
					disabled={ this.props.isReadMode }
					onChange={ (event) => this.handleValueChange(event) }
					InputProps={ inputProps }
					{ ...valueTextFieldTheme }
					className={ classes.valueTextField }
				/>

				<Typography
					{ ...theme.r3Resource.subTitle }
					className={ classes.subTitle }
				>
					{ r3provider.getR3TextRes().tResResourceKeysSubTitle }
				</Typography>
				<Typography
					{ ...theme.r3Resource.keysKeySubTitle }
					className={ classes.keysKeySubTitle }
				>
					{ r3provider.getR3TextRes().tResResourceKeySubTitle }
				</Typography>
				<Typography
					{ ...theme.r3Resource.keysValueSubTitle }
					className={ classes.keysValueSubTitle }
				>
					{ r3provider.getR3TextRes().tResResourceKValueSubTitle }
				</Typography>
				{ this.getKeysContents(this.state.resource.keys) }
				{ this.getAddKeysContents() }

				<Typography
					{ ...theme.r3Resource.subTitle }
					className={ classes.subTitle }
				>
					{ r3provider.getR3TextRes().tResAliasSubTitle }
				</Typography>
				{ this.getAliasContents(this.state.resource.aliases) }
				{ this.getAddAliasContents() }

				<R3FormButtons
					r3provider={ this.props.r3provider }
					status={ this.state.changed }
					onSave={ this.handleSave }
					onCancel={ this.handleCancel }
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
