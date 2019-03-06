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

import React			from 'react';
import ReactDOM			from 'react-dom';									// eslint-disable-line no-unused-vars
import PropTypes		from 'prop-types';

import TextField		from 'material-ui/TextField';
import FontIcon			from 'material-ui/FontIcon';
import IconButton		from 'material-ui/IconButton';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';	// Radio Button

import R3FormButtons	from './r3formbuttons';								// Buttons
import R3Message		from '../util/r3message';
import R3PopupMsgDialog	from './r3popupmsgdialog';
import { regYrnAnyResourcePath } from '../util/r3define';
import { r3ObjMerge, r3DeepClone, r3DeepCompare, r3RenameObjectKey, r3IsJSON, r3ConvertFromJSON, r3IsEmptyStringObject, r3IsEmptyString } from '../util/r3util';
import { errorType, resourceTypeString, resourceTypeObject, actionTypeName, actionTypeValue, actionTypeNewKey, actionTypeNewValue, actionTypeDelete, actionTypeAdd, actionTypeUp, actionTypeDown } from '../util/r3types';

//
// Resource Contents Class
//
export default class R3Resource extends React.Component
{
	constructor(props)
	{
		super(props);

		// Initalize Sate
		this.state = this.createState(this.props.resource);

		// Binding
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

	componentWillReceiveProps(nextProps)
	{
		// update State
		this.setState(this.createState(nextProps.resource));
	}

	createState(resource)
	{
		let	resourceType	= resourceTypeString;			// default
		let	resourceValue	= '';
		if(undefined !== resource && null !== resource){
			if(undefined !== resource.string && null !== resource.string && 'string' === typeof resource.string){
				resourceType	= resourceTypeString;
				resourceValue	= resource.string;
			}else if(undefined !== resource.object && null !== resource.object && 'object' === typeof resource.object){
				resourceType	= resourceTypeObject;
				resourceValue	= JSON.stringify(resource.object);
			}
		}

		return {
			resource:				r3DeepClone(resource),
			resourceType:			resourceType,
			resourceValue:			resourceValue,
			addKeyName:				'',
			addKeyValue:			'',
			addAliases:				'',
			changed:				false,
			confirmMessageObject:	null,
			messageDialogObject:	null
		};
	}

	//
	// Check only resource value and type state
	//
	isChangedKeysValueState(nowType, nowValue)
	{
		if(undefined === nowType || null === nowType || undefined ===  nowValue || null === nowValue){
			nowType	= this.state.resourceType;
			nowValue= this.state.resourceValue;
		}
		// check type
		let	propsType	= resourceTypeString;
		let	propsValue	= '';
		if(undefined !== this.props.resource && null !== this.props.resource && undefined !== this.props.resource.string && null !== this.props.resource.string && 'string' === typeof this.props.resource.string){
			propsType	= resourceTypeString;
			propsValue	= this.props.resource.string;
		}else if(undefined !== this.props.resource && null !== this.props.resource && undefined !== this.props.resource.object && null !== this.props.resource.object && 'object' === typeof this.props.resource.object){
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
		if(undefined === nowKeys || null === nowKeys){
			nowKeys	= undefined === this.state.resource || null === this.state.resource ? undefined : this.state.resource.keys;
		}
		if(undefined === nowKeys || null === nowKeys){
			nowKeys = {};									// empty object
		}
		let	propsKeys = undefined === this.props.resource || null === this.props.resource ? undefined : this.props.resource.keys;
		if(undefined === propsKeys || null === propsKeys){
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
		if(undefined === nowAliases || null === nowAliases){
			nowAliases	= undefined === this.state.resource || null === this.state.resource ? undefined : this.state.resource.aliases;
		}
		if(undefined === nowAliases || null === nowAliases){
			nowAliases = [];									// empty array
		}
		let	propsAliases = undefined === this.props.resource || null === this.props.resource ? undefined : this.props.resource.aliases;
		if(undefined === propsAliases || null === propsAliases){
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
			if(undefined === newResource.keys || null === newResource.keys || !(newResource.keys instanceof Object)){
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
				if(undefined !== nameLists[name]){
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
			if(undefined === newResource.aliases || null === newResource.aliases || !(newResource.aliases instanceof Array)){
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
			this.setState(this.createState(this.props.resource));
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
			defaultResourceValue = (undefined === this.props.resource || null === this.props.resource || undefined === this.props.resource.object || null === this.props.resource.object || 'object' !== typeof this.props.resource.object) ? '' : this.props.resource.object;
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
				newResourceValue = (undefined === this.props.resource || null === this.props.resource || undefined === this.props.resource.object || null === this.props.resource.object || 'object' !== typeof this.props.resource.object) ? '' : JSON.stringify(this.props.resource.object);
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
	handleValueChange(event, newValue)										// eslint-disable-line no-unused-vars
	{
		// set parent changed state
		let	changed = this.isChangedState(this.state.resourceType, newValue);
		this.props.onUpdate(changed);

		// update state
		this.setState({
			changed:		changed,
			resourceValue:	newValue
		});
	}

	//
	// Handle Resource Keys( key, value ) : Change
	//
	handleKeysChange(event, type, keyname, changedValue)							// eslint-disable-line no-unused-vars
	{
		let	nowKeys = {};
		if(undefined !== this.state.resource.keys && null !== this.state.resource.keys && this.state.resource.keys instanceof Object){
			nowKeys = r3DeepClone(this.state.resource.keys);
		}

		let	newKeys			= nowKeys;
		let	isClearNewKey	= false;
		if(actionTypeName === type){
			//
			// changed name
			//
			if(undefined !== nowKeys[changedValue]){
				// found same name, we allow it as temporary. then pickups temporary additional name.
				for(let counter = 0, found = false; !found; ++counter){
					let tmpName		= changedValue + '\n' + String(counter);		// convert new name with ('\n' + number)
					if(undefined === nowKeys[tmpName]){
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
			if(undefined !== newKeys[keyname]){
				delete newKeys[keyname];
			}

		}else if(actionTypeAdd === type){
			if(r3IsEmptyString(this.state.addKeyName)){
				this.setState({
					messageDialogObject:	new R3Message(this.props.r3provider.getR3TextRes().eNewKeyName, errorType)
				});
				return;
			}
			if(undefined === this.state.addKeyValue || null === this.state.addKeyValue || 'string' !== typeof this.state.addKeyValue){
				this.setState({
					messageDialogObject:	new R3Message(this.props.r3provider.getR3TextRes().eNewKeyValue, errorType)
				});
				return;
			}

			//
			// check name
			//
			let	newName = this.state.addKeyName;
			if(undefined !== nowKeys[newName]){
				// found same name, we allow it as temporary. then pickups temporary additional name.
				for(let counter = 0, found = false; !found; ++counter){
					let tmpName	= newName + '\n' + String(counter);		// convert new name with ('\n' + number)
					if(undefined === nowKeys[tmpName]){
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
	handleAddKeysChange(event, type, changedValue)									// eslint-disable-line no-unused-vars
	{
		// update state
		if(actionTypeNewKey === type){
			this.setState({
				addKeyName:		changedValue
			});
		}else if(actionTypeNewValue === type){
			this.setState({
				addKeyValue:	changedValue
			});
		}else{
			console.warn('unknown action(' + JSON.stringify(type) + ') for keys.');
			return;
		}
	}

	//
	// Handle Resource Aliases : Change
	//
	handleAliasesChange(event, type, pos, changedValue)							// eslint-disable-line no-unused-vars
	{
		let	isClearNewAlias	= false;
		let	newAliases		= [];
		if(undefined !== this.state.resource.aliases && null !== this.state.resource.aliases && this.state.resource.aliases instanceof Array){
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
	handleAddAliasesChange(event, changedValue)										// eslint-disable-line no-unused-vars
	{
		// update state
		this.setState({
			addAliases:		changedValue
		});
	}

	getKeysContents(items)
	{
		if(undefined === items || !(items instanceof Object)){
			return;
		}

		let	elementArray = [];
		let	elementCount = 0;
		Object.keys(items).forEach( (keyname) => {
			let	value = '';
			if(undefined === items[keyname] || null === items[keyname]){
				value = '';
			}else if(items[keyname] instanceof Array){
				value = JSON.stringify(items[keyname]);
			}else if(items[keyname] instanceof Object){
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
			if(!this.props.isReadMode){
				deleteButton = (
					<IconButton
						iconStyle={ this.context.muiTheme.r3Contents.iconButtonColor }
						tooltip={ 'Delete' }
						style={ this.context.muiTheme.r3Contents.iconButtonStyle }
						onClick={ (event) => this.handleKeysChange(event, actionTypeDelete, keyname, null) }
					>
						<FontIcon className={ this.context.muiTheme.r3IconFonts.deleteIconFont } />
					</IconButton>
				);
			}

			elementArray.push(
				<div className={ 'clearof' } key={ elementCount++ }>
					<TextField
						name={ 'key_' + String(elementCount) }
						value={ dispName }
						disabled={ this.props.isReadMode }
						style={ this.context.muiTheme.r3Contents.firstInTwoTextFieldStyle }
						onChange={ (event, value) => this.handleKeysChange(event, actionTypeName, keyname, value) }
					/>
					<TextField
						name={ 'value_' + String(elementCount) }
						value={ value }
						disabled={ this.props.isReadMode }
						style={ this.context.muiTheme.r3Contents.secondInTwoTextFieldStyle }
						onChange={ (event, value) => this.handleKeysChange(event, actionTypeValue, keyname, value) }
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

	getAliasContents(items)
	{
		if(undefined === items || !(items instanceof Array)){
			return;
		}

		return (
			items.map( (item, pos) =>
			{
				let	downButton;
				let	upButton;
				let	deleteButton;
				if(this.props.isReadMode || items.length <= (pos + 1)){
					downButton = (
						<div style={ this.context.muiTheme.r3Contents.dummyButtonStyle } ></div>
					);
				}else{
					downButton = (
						<IconButton
							iconStyle={ this.context.muiTheme.r3Contents.iconButtonColor }
							tooltip={ 'Down' }
							disabled={ false }
							style={ this.context.muiTheme.r3Contents.iconButtonStyle }
							onClick={ (event) => this.handleAliasesChange(event, actionTypeDown, pos, null) }
						>
							<FontIcon className={ this.context.muiTheme.r3IconFonts.downIconFont } />
						</IconButton>
					);
				}
				if(this.props.isReadMode || 0 === pos){
					upButton = (
						<div style={ this.context.muiTheme.r3Contents.dummyButtonStyle } ></div>
					);
				}else{
					upButton = (
						<IconButton
							iconStyle={ this.context.muiTheme.r3Contents.iconButtonColor }
							tooltip={ 'Up' }
							disabled={ false }
							style={ this.context.muiTheme.r3Contents.iconButtonStyle }
							onClick={ (event) => this.handleAliasesChange(event, actionTypeUp, pos, null) }
						>
							<FontIcon className={ this.context.muiTheme.r3IconFonts.upIconFont } />
						</IconButton>
					);
				}

				if(!this.props.isReadMode){
					deleteButton = (
						<IconButton
							iconStyle={ this.context.muiTheme.r3Contents.iconButtonColor }
							tooltip={ 'Delete' }
							style={ this.context.muiTheme.r3Contents.iconButtonStyle }
							onClick={ (event) => this.handleAliasesChange(event, actionTypeDelete, pos, null) }
						>
							<FontIcon className={ this.context.muiTheme.r3IconFonts.deleteIconFont } />
						</IconButton>
					);
				}

				return (
					<div className={ 'clearof' } key={ pos }>
						<TextField
							name={ 'alias_' + String(pos) }
							value={ item }
							style={ this.context.muiTheme.r3Contents.aliasesTextFieldStyle }
							onChange={ (event, value) => this.handleAliasesChange(event, actionTypeValue, pos, value) }
						/>
						<IconButton
							iconStyle={ this.context.muiTheme.r3Contents.iconButtonColor }
							tooltip={ 'Delete' }
							style={ this.context.muiTheme.r3Contents.iconButtonStyle }
							onClick={ (event) => this.handleAliasesChange(event, actionTypeDelete, pos, null) }
						>
							<FontIcon className={ this.context.muiTheme.r3IconFonts.deleteIconFont } />
						</IconButton>
						{ downButton }
						{ upButton }
						{ deleteButton }
					</div>
				);
			})
		);
	}

	render()
	{
		console.info('CALL : resource:render()');

		let	keysAddFields;
		let	aliasAddFields;
		if(!this.props.isReadMode){
			keysAddFields = (
				<div className={ 'clearof' }>
					<TextField
						name={ 'key_new' }
						hintText={ 'Key' }
						value={ this.state.addKeyName }
						style={ this.context.muiTheme.r3Contents.firstInTwoTextFieldStyle }
						onChange={ (event, value) => this.handleAddKeysChange(event, actionTypeNewKey, value) }
					/>
					<TextField
						name={ 'value_new' }
						hintText={ 'Value' }
						value={ this.state.addKeyValue }
						style={ this.context.muiTheme.r3Contents.secondInTwoTextFieldStyle }
						onChange={ (event, value) => this.handleAddKeysChange(event, actionTypeNewValue, value) }
					/>
					<IconButton
						iconStyle={ this.context.muiTheme.r3Contents.iconButtonColor }
						tooltip={ 'Add' }
						style={ this.context.muiTheme.r3Contents.iconButtonStyle }
						onClick={ (event) => this.handleKeysChange(event, actionTypeAdd, null, null) }
					>
						<FontIcon
							className={ this.context.muiTheme.r3IconFonts.addIconFont }
						/>
					</IconButton>
				</div>
			);

			aliasAddFields = (
				<div className={ 'clearof' }>
					<TextField
						name={ 'alias_new' }
						hintText={ 'Path' }
						value={ this.state.addAliases }
						style={ this.context.muiTheme.r3Contents.aliasesTextFieldStyle }
						onChange={ (event, value) => this.handleAddAliasesChange(event, value) }
					/>
					<IconButton
						iconStyle={ this.context.muiTheme.r3Contents.iconButtonColor }
						tooltip={ 'Add' }
						style={ this.context.muiTheme.r3Contents.iconButtonStyle }
						onClick={ (event) => this.handleAliasesChange(event, actionTypeAdd, 0, null) }
					>
						<FontIcon
							className={ this.context.muiTheme.r3IconFonts.addIconFont }
						/>
					</IconButton>
				</div>
			);
		}

		return (
			<div style={{ width: '100%' }} >
				<div>
					<div>
						<span style={ this.context.muiTheme.r3Contents.labelStyle } >VALUE</span>
					</div>
					<div style={ this.context.muiTheme.r3Contents.subcomponent } >
						<div className={ 'clearof' }>
							<RadioButtonGroup
								name={ 'resource_type' }
								valueSelected={ this.state.resourceType }
								onChange={ this.handleValueTypeChange }
							>
								<RadioButton
									value={ resourceTypeString }
									label={ 'Text String Type' }
									disabled={ this.props.isReadMode }
									style={ r3ObjMerge(this.context.muiTheme.r3Contents.selectButtonStyle, this.context.muiTheme.r3FontMiddle, { float: 'left' }) }
								/>
								<RadioButton
									value={ resourceTypeObject }
									label={ 'Object(JSON) Type' }
									disabled={ this.props.isReadMode }
									style={ r3ObjMerge(this.context.muiTheme.r3Contents.selectButtonStyle, this.context.muiTheme.r3FontMiddle) }
								/>
							</RadioButtonGroup>
						</div>
						<div>
							<TextField
								name={ 'resource_value' }
								value={ this.state.resourceValue }
								hintText={ (resourceTypeObject === this.state.resourceType ? 'Input Object formatted by JSON' : 'Input Text string') }
								multiLine={ true }
								rows={ 1 }
								disabled={ this.props.isReadMode }
								style={{ width: '100%' }}
								onChange={ this.handleValueChange }
							/>
						</div>
					</div>

					<div style={ this.context.muiTheme.r3Contents.componentSpacer }>
						<span style={ this.context.muiTheme.r3Contents.labelStyle } >KEYS</span>
					</div>
					<div style={ this.context.muiTheme.r3Contents.subcomponent } >
						<div className={ 'clearof' }>
							<span style={ this.context.muiTheme.r3Contents.firstInTwoLabelStyle } >KEY NAME</span>
							<span style={ this.context.muiTheme.r3Contents.secondInTwoLabelStyle } >VALUE</span>
						</div>
						{ this.getKeysContents(this.state.resource.keys) }
						{ keysAddFields }
					</div>

					<div style={ this.context.muiTheme.r3Contents.componentSpacer }>
						<span style={ this.context.muiTheme.r3Contents.labelStyle } >ALIAS</span>
					</div>
					<div style={ this.context.muiTheme.r3Contents.subcomponent } >
						{ this.getAliasContents(this.state.resource.aliases) }
						{ aliasAddFields }
					</div>
				</div>
				<div style={ this.context.muiTheme.r3Contents.componentSpacer }>
					<R3FormButtons
						status={ this.state.changed }
						onSave={ this.handleSave }
						onCancel={ this.handleCancel }
					/>
				</div>
				<R3PopupMsgDialog
					title={ this.props.r3provider.getR3TextRes().cUpdatingTitle }
					r3Message={ this.state.confirmMessageObject }
					twoButton={ true }
					onClose={ this.handleConfirmDialogClose }
				/>
				<R3PopupMsgDialog
					r3Message={ this.state.messageDialogObject }
					onClose={ this.handleMessageDialogClose }
				/>
			</div>
		);
	}
}

R3Resource.contextTypes = {
	muiTheme:	PropTypes.object.isRequired,
	r3Context:	PropTypes.object.isRequired
};

R3Resource.propTypes = {
	r3provider:	PropTypes.object.isRequired,
	resource:	PropTypes.object.isRequired,
	isReadMode:	PropTypes.bool,

	onSave:		PropTypes.func.isRequired,
	onUpdate:	PropTypes.func.isRequired
};

R3Resource.defaultProps = {
	isReadMode:	false
};

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
