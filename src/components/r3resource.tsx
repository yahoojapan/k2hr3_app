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
 * CREATE:   Tue Aug 22 2017
 * REVISION:
 *
 */

import React						from 'react';

import TextField					from '@mui/material/TextField';
import Typography					from '@mui/material/Typography';
import IconButton					from '@mui/material/IconButton';
import FormControl					from '@mui/material/FormControl';	// For Radio Button
import FormControlLabel				from '@mui/material/FormControlLabel';
import RadioGroup					from '@mui/material/RadioGroup';
import Radio						from '@mui/material/Radio';
import Tooltip						from '@mui/material/Tooltip';
import Box							from '@mui/material/Box';
import DeleteIcon					from '@mui/icons-material/ClearRounded';
import AddIcon						from '@mui/icons-material/AddRounded';
import UpIcon						from '@mui/icons-material/ArrowUpwardRounded';
import DownIcon						from '@mui/icons-material/ArrowDownwardRounded';

import type { R3Theme }				from './r3theme';
import { r3ResourceStyle }			from './r3styles';
import R3FormButtons				from './r3formbuttons';					// Buttons
import R3PopupMsgDialog				from './r3popupmsgdialog';
import R3Message					from '../util/r3message';
import R3Provider					from '../util/r3provider';
import { regYrnAnyResourcePath }	from '../util/r3define';
import { errorType, resourceTypeString, resourceTypeObject, actionTypeName, actionTypeValue, actionTypeNewKey, actionTypeNewValue, actionTypeDelete, actionTypeAdd, actionTypeUp, actionTypeDown, ResourceData, valTypeAllObject } from '../util/r3types';
import { r3IsNumber, r3IsBoolean, r3DeepClone, r3DeepCompare, r3RenameObjectKey, r3IsJSON, r3ConvertFromJSON, r3IsEmptyEntity, r3IsEmptyEntityObject, r3IsEmptyStringObject, r3IsEmptyString, r3IsArray, r3IsObject, r3IsString } from '../util/r3util';

//
// Types
//
type R3ResourceTooltips = {
	deleteKeysTooltip?:				string | null;
	addKeysTooltip?:				boolean;
	downAliasTooltip?:				number;
	upAliasTooltip?:				number;
	deleteAliasTooltip?:			number;
	addAliasTooltip?:				boolean;
};

type R3ResourceRequiredProps = {
	theme:							R3Theme;
	r3provider:						R3Provider;
	resource:						ResourceData;
	dispUnique:						string | number;
	onSave:							(resource: ResourceData) => void;
	onUpdate:						(changed: boolean) => void;
};

type R3ResourceOptionProps = {
	isReadMode?:					boolean;
};

type R3ResourceProps = R3ResourceRequiredProps & R3ResourceOptionProps;

type R3ResourceState = {
	dispUnique:						string | number;
	resource:						ResourceData;
	resourceType:					string;
	resourceValue:					string;
	addKeyName:						string;
	addKeyValue:					string;
	addAliases:						string;
	changed:						boolean;
	confirmMessageObject:			R3Message | null;
	messageDialogObject:			R3Message | null;
	tooltips:						R3ResourceTooltips;
};

type R3ResourceStyleType = ReturnType<typeof r3ResourceStyle>;

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
export default class R3Resource extends React.Component<R3ResourceProps, R3ResourceState>
{
	sxClasses: R3ResourceStyleType;

	static defaultProps: R3ResourceOptionProps = {
		isReadMode:	false
	};

	state: R3ResourceState = R3Resource.createState(this.props.resource, this.props.dispUnique);

	constructor(props: R3ResourceProps)
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

		// styles
		this.sxClasses					= r3ResourceStyle(props.theme);
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
	static getDerivedStateFromProps(nextProps: R3ResourceProps, prevState: R3ResourceState): R3ResourceState | null
	{
		if(nextProps.dispUnique !== prevState.dispUnique){
			// Switching content
			return R3Resource.createState(nextProps.resource, nextProps.dispUnique);
		}
		return null;	// Return null to indicate no change to state.
	}

	static createState(resource: ResourceData, dispUnique: string | number): R3ResourceState
	{
		let	resourceType: string	= resourceTypeString;	// default
		let	resourceValue			= '';
		if(!r3IsEmptyEntity(resource)){
			if(r3IsString(resource.string)){
				resourceType	= resourceTypeString;
				resourceValue	= resource.string;
			}else if(r3IsObject(resource.object)){
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
				deleteKeysTooltip:	null,					// keyname
				addKeysTooltip:		false,
				downAliasTooltip:	-1,				// position
				upAliasTooltip:		-1,				// position
				deleteAliasTooltip:	-1,				// position
				addAliasTooltip:	false
			}
		};
	}

	//
	// Check only resource value and type state
	//
	isChangedKeysValueState(nowType: string | null, nowValue: string | valTypeAllObject | null): boolean
	{
		if(r3IsEmptyEntity(nowType) || r3IsEmptyEntity(nowValue)){
			nowType	= this.state.resourceType;
			nowValue= this.state.resourceValue;
		}

		// check type
		let	propsType: string;
		let	propsValue: string | valTypeAllObject | null;
		if(!r3IsEmptyEntity(this.props.resource) && r3IsString(this.props.resource.string)){
			propsType	= resourceTypeString;
			propsValue	= this.props.resource.string;
		}else if(!r3IsEmptyEntity(this.props.resource) && r3IsObject(this.props.resource.object)){
			propsType	= resourceTypeObject;
			propsValue	= JSON.stringify(this.props.resource.object);
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
	isChangedKeysNameState(nowKeys: valTypeAllObject | null): boolean
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
	isChangedAliasesState(nowAliases: string[] | null): boolean
	{
		if(r3IsEmptyEntity(nowAliases)){
			nowAliases	= r3IsEmptyEntity(this.state.resource) ? undefined : this.state.resource.aliases;
		}
		if(!r3IsArray(nowAliases)){
			nowAliases = [];									// empty array
		}

		let	propsAliases = r3IsEmptyEntity(this.props.resource) ? undefined : this.props.resource.aliases;
		if(!r3IsArray(propsAliases)){
			propsAliases = [];									// empty object
		}
		// check
		return !r3DeepCompare(nowAliases, propsAliases);
	}

	//
	// Check all state
	//
	isChangedState(nowType: string | null = null, nowValue: string | valTypeAllObject | null = null, nowKeys: valTypeAllObject | null = null, nowAliases: string[] | null = null): boolean
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
	handleSave(event: React.MouseEvent<HTMLElement>)
	{
		if(this.state.changed){
			//
			// Check resource
			//
			let	newResource = r3DeepClone(this.state.resource);
			let	cnt: number;
			let	cnt2: number;

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

					const	tmpObj = r3ConvertFromJSON(tmpValue);	// to objects
					if(!r3IsObject(tmpObj)){
						newResource.object	= null;
					}else{
						newResource.object	= r3DeepClone(tmpObj);
					}
					newResource.string		= null;
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
			if(!r3IsObject(newResource.keys)){
				newResource.keys = {};
			}
			const	keyNames = Object.keys(newResource.keys);
			let		nameLists: Record<string, boolean> = {};			// for same key name check

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
					name = name.substring(0, pos);						// cut '\n'...
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
				nameLists[name] = true;
			}

			// convert key name in object and convert value to object
			for(cnt = 0; cnt < keyNames.length; ++cnt){
				let	name= keyNames[cnt].trim();
				let	pos	= name.lastIndexOf('\n');
				if(-1 !== pos){
					name = name.substring(0, pos);						// cut '\n'...
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
			if(!r3IsArray(newResource.aliases)){
				newResource.aliases = [];
			}

			// check empty and yrn path by regex
			const	regAliasPath = new RegExp(regYrnAnyResourcePath);
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
	handleMessageDialogClose(event: {}, reason: string, result: boolean)
	{
		this.setState({
			messageDialogObject:	null
		});
	}

	//
	// Handle Resource Value Type : Change
	//
	handleValueTypeChange(event: React.ChangeEvent<HTMLInputElement>, type: string)
	{
		if(this.state.resourceType === type){
			console.warn('changed value type(' + JSON.stringify(type) + ') is something wrong.');
			return;
		}
		// now type and value
		const	nowResourceType: string	= this.state.resourceType;
		let		nowResourceValue: string | valTypeAllObject | null;
		if(resourceTypeString === nowResourceType){
			nowResourceValue = this.state.resourceValue;
		}else{
			if(!r3IsJSON(this.state.resourceValue)){
				nowResourceValue = this.state.resourceValue;
			}else{
				const	tmpObj = r3ConvertFromJSON(this.state.resourceValue);				// to objects
				if(!r3IsObject(tmpObj)){
					nowResourceValue = null;
				}else{
					nowResourceValue = r3DeepClone(tmpObj);
				}
			}
		}

		// default(props) value by now type
		let	defaultResourceValue: string | valTypeAllObject | null;							// string or object resource type
		if(resourceTypeString === nowResourceType){
			defaultResourceValue = r3IsEmptyStringObject(this.props.resource, 'string') ? '' : this.props.resource.string;
		}else{
			if((r3IsEmptyEntity(this.props.resource) || !r3IsObject(this.props.resource?.object))){
				defaultResourceValue = null;
			}else{
				if(!r3IsJSON(this.props.resource.object)){
					defaultResourceValue = this.props.resource.object;
				}else{
					const	tmpObj = r3ConvertFromJSON(this.props.resource.object);			// to objects
					if(!r3IsObject(tmpObj)){
						defaultResourceValue = null;
					}else{
						defaultResourceValue = r3DeepClone(tmpObj);
					}
				}
			}
		}

		// new type and value
		const	newResourceType	= type;
		let		newResourceValue: string | valTypeAllObject | null = nowResourceValue;		// = now value
		let		newStrResourceValue: string;

		// check whether now value and default value is changed
		if(r3DeepCompare(nowResourceValue, defaultResourceValue)){
			// not modified value, thus gets new value for new type from props
			if(resourceTypeString === newResourceType){
				newResourceValue	= r3IsEmptyStringObject(this.props.resource, 'string') ? '' : this.props.resource.string;
				newStrResourceValue	= newResourceValue;
			}else{
				if((r3IsEmptyEntity(this.props.resource) || !r3IsObject(this.props.resource?.object))){
					newResourceValue	= null;
					newStrResourceValue	= '';
				}else{
					if(!r3IsJSON(this.props.resource.object)){
						newResourceValue = this.props.resource.object;
					}else{
						const	tmpObj = r3ConvertFromJSON(this.props.resource.object);		// to objects
						if(!r3IsObject(tmpObj)){
							newResourceValue = null;
						}else{
							newResourceValue = r3DeepClone(tmpObj);
						}
					}
					newStrResourceValue	= JSON.stringify(newResourceValue);
				}
			}
		}

		// set parent changed state
		const	changed = this.isChangedState(newResourceType, newResourceValue);
		this.props.onUpdate(changed);

		// update state
		this.setState({
			changed:		changed,
			resourceType:	newResourceType,
			resourceValue:	newStrResourceValue
		});
	}

	//
	// Handle Resource Value : Change
	//
	handleValueChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)
	{
		// set parent changed state
		const	changed = this.isChangedState(this.state.resourceType, event.target.value);
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
	handleKeysChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | React.MouseEvent<HTMLElement>, type: string, keyname: string | null)
	{
		let	nowKeys: valTypeAllObject = {};
		if(r3IsObject(this.state.resource.keys)){
			nowKeys = r3DeepClone(this.state.resource.keys);
		}

		let	changedValue: string | null	= null;
		if(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement){
			changedValue = r3IsEmptyEntityObject(event.target, 'value') ? null : event.target.value;
		}

		let	newKeys: valTypeAllObject	= nowKeys;
		let	isClearNewKey				= false;
		if(actionTypeName === type){
			//
			// changed name
			//
			if(!r3IsEmptyEntity(nowKeys[changedValue])){
				// found same name, we allow it as temporary. then pickups temporary additional name.
				for(let counter = 0, found = false; !found; ++counter){
					const	tmpName	= changedValue + '\n' + String(counter);		// convert new name with ('\n' + number)
					if(r3IsEmptyEntity(nowKeys[tmpName])){
						changedValue= tmpName;
						found		= true;
					}
				}
			}
			// change keyname
			const	tmpObj = r3RenameObjectKey(nowKeys, keyname, changedValue);
			if(!r3IsObject(tmpObj)){
				newKeys = {};
			}else{
				newKeys = r3DeepClone(tmpObj);
			}

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
			if(!r3IsString(this.state.addKeyValue)){
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
	handleAddKeysChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, type: string)
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
	handleAliasesChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | React.MouseEvent<HTMLElement>, type: string, pos: number)
	{
		let	changedValue: string | null	= null;
		if(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement){
			changedValue = r3IsEmptyEntityObject(event.target, 'value') ? null : event.target.value;
		}

		let	isClearNewAlias				= false;
		let	newAliases: string[]		= [];
		if(r3IsArray(this.state.resource.aliases)){
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
			const	targetValue = newAliases[pos];		// real or ref
			newAliases.splice((pos - 1), 0, targetValue);
			newAliases.splice(pos + 1, 1);

		}else if(actionTypeDown === type){
			// move pos's value to down
			const	targetValue = newAliases[pos + 1];	// real or ref
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
		const	changed		= this.isChangedState(null, null, null, newAliases);
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
	handleAddAliasesChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)
	{
		// update state
		this.setState({
			addAliases:		event.target.value
		});
	}

	handTooltipChange = (event: React.MouseEvent<HTMLElement>, type: string, extData: string | number | boolean | null) =>
	{
		if(tooltipValues.deleteKeysTooltip === type && typeof extData !== 'number' && typeof extData !== 'boolean'){
			this.setState({
				tooltips: {
					deleteKeysTooltip:	extData
				}
			});
		}else if(tooltipValues.addKeysTooltip === type && r3IsBoolean(extData)){
			this.setState({
				tooltips: {
					addKeysTooltip:		extData
				}
			});
		}else if(tooltipValues.downAliasTooltip === type && r3IsNumber(extData)){
			this.setState({
				tooltips: {
					downAliasTooltip:	extData
				}
			});
		}else if(tooltipValues.upAliasTooltip === type && r3IsNumber(extData)){
			this.setState({
				tooltips: {
					upAliasTooltip:		extData
				}
			});
		}else if(tooltipValues.deleteAliasTooltip === type && r3IsNumber(extData)){
			this.setState({
				tooltips: {
					deleteAliasTooltip:	extData
				}
			});
		}else if(tooltipValues.addAliasTooltip === type && r3IsBoolean(extData)){
			this.setState({
				tooltips: {
					addAliasTooltip:	extData
				}
			});
		}
	};

	getKeysContents(items: valTypeAllObject)
	{
		const { theme, r3provider } = this.props;

		if(!r3IsObject(items)){
			return;
		}

		let	elementArray: React.ReactNode[] = [];
		let	elementCount = 0;
		Object.keys(items).forEach( (keyname) => {
			let	value = '';
			if(r3IsEmptyEntity(items[keyname])){
				value = '';
			}else if(r3IsArray(items[keyname])){
				value = JSON.stringify(items[keyname]);
			}else if(r3IsObject(items[keyname])){
				value = JSON.stringify(items[keyname]);
			}else{
				// probabry string type
				value = String(items[keyname]);
			}

			// if keyname has '\n', it means escaped same key name.
			let	dispName= keyname;
			let	pos		= dispName.lastIndexOf('\n');
			if(-1 !== pos){
				dispName = dispName.substring(0, pos);
			}

			let	deleteButton;
			if(this.props.isReadMode){
				deleteButton = (
					<IconButton
						disabled={ true }
						{ ...theme.r3Resource.deleteKeysButton }
						sx={ this.sxClasses.deleteInvisibleKeysButton }
						size="large"
					>
						<DeleteIcon />
					</IconButton>
				);
			}else{
				deleteButton = (
					<Tooltip
						title={ r3provider.getR3TextRes().tResResourceKeysDelTT }
						open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsString(this.state.tooltips.deleteKeysTooltip) || (this.state.tooltips.deleteKeysTooltip != keyname)) ? false : true) }
					>
						<IconButton
							onClick={ (event) => this.handleKeysChange(event, actionTypeDelete, keyname) }
							onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.deleteKeysTooltip, keyname) }
							onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.deleteKeysTooltip, null) }
							{ ...theme.r3Resource.deleteKeysButton }
							sx={ this.sxClasses.deleteKeysButton }
							size="large"
						>
							<DeleteIcon />
						</IconButton>
					</Tooltip>
				);
			}

			let	customSlotProps;
			if(this.props.isReadMode){
				customSlotProps = {};
			}else{
				customSlotProps = {
					input: {
						sx: this.sxClasses.inputTextField
					}
				};
			}

			elementArray.push(
				<Box
					key={ elementCount++ }
					sx={ this.sxClasses.enclosureElement }
				>
					<TextField
						name={ resourceComponentValues.keysKeyTextFieldNamePrefix + String(elementCount) }
						value={ dispName }
						disabled={ this.props.isReadMode }
						placeholder={ r3provider.getR3TextRes().tResResourceKeysKeyHint }
						onChange={ (event) => this.handleKeysChange(event, actionTypeName, keyname) }
						slotProps ={ customSlotProps }
						{ ...theme.r3Resource.keysKeyTextField }
						sx={ this.sxClasses.keysKeyTextField }
					/>
					<TextField
						name={ resourceComponentValues.keysValueTextFieldNamePrefix + String(elementCount) }
						value={ value }
						disabled={ this.props.isReadMode }
						placeholder={ r3provider.getR3TextRes().tResResourceKeysValueHint }
						onChange={ (event) => this.handleKeysChange(event, actionTypeValue, keyname) }
						slotProps ={ customSlotProps }
						{ ...theme.r3Resource.keysValueTextField }
						sx={ this.sxClasses.keysValueTextField }
					/>
					{ deleteButton }
				</Box>
			);
		});

		return (
			elementArray.map( (item: React.ReactNode, pos: number) => {
				return item;
			})
		);
	}

	getAddKeysContents()
	{
		const { theme, r3provider } = this.props;

		if(this.props.isReadMode){
			return;
		}

		return (
			<Box
				sx={ this.sxClasses.enclosureElement }
			>
				<TextField
					name={ resourceComponentValues.keysNewKeyTextFieldName }
					value={ this.state.addKeyName }
					placeholder={ r3provider.getR3TextRes().tResResourceKeysKeyHint }
					onChange={ (event) => this.handleAddKeysChange(event, actionTypeNewKey) }
					slotProps ={{ input: { sx: this.sxClasses.inputTextField } }}
					{ ...theme.r3Resource.keysKeyTextField }
					sx={ this.sxClasses.keysKeyTextField }
				/>
				<TextField
					name={ resourceComponentValues.keysNewValueTextFieldName }
					value={ this.state.addKeyValue }
					placeholder={ r3provider.getR3TextRes().tResResourceKeysValueHint }
					onChange={ (event) => this.handleAddKeysChange(event, actionTypeNewValue) }
					slotProps ={{ input: { sx: this.sxClasses.inputTextField } }}
					{ ...theme.r3Resource.keysValueTextField }
					sx={ this.sxClasses.keysValueTextField }
				/>
				<Tooltip
					title={ r3provider.getR3TextRes().tResResourceKeysAddTT }
					open={ (r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsBoolean(this.state.tooltips.addKeysTooltip)) ? false : this.state.tooltips.addKeysTooltip === true }
				>
					<IconButton
						onClick={ (event) => this.handleKeysChange(event, actionTypeAdd, null) }
						onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.addKeysTooltip, true) }
						onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.addKeysTooltip, false) }
						{ ...theme.r3Resource.addKeysButton }
						sx={ this.sxClasses.addKeysButton }
						size="large"
					>
						<AddIcon />
					</IconButton>
				</Tooltip>
			</Box>
		);
	}

	getAliasContents(items: string[])
	{
		const { theme, r3provider } = this.props;

		if(!r3IsArray(items)){
			return;
		}
		const _items = items;

		return _items.map( (item: string, pos: number) =>
		{
			let	downButton;
			if(this.props.isReadMode || (_items.length <= (pos + 1))){
				downButton = (
					<IconButton
						disabled={ true }
						{ ...theme.r3Resource.downAliasButton }
						sx={ this.sxClasses.arrowInvisibleAliasButton }
						size="large"
					>
						<DownIcon />
					</IconButton>
				);
			}else{
				downButton = (
					<Tooltip
						title={ r3provider.getR3TextRes().tResAliasDownTT }
						open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsNumber(this.state.tooltips.downAliasTooltip) || (this.state.tooltips.downAliasTooltip != pos)) ? false : true) }
					>
						<IconButton
							onClick={ (event) => this.handleAliasesChange(event, actionTypeDown, pos) }
							onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.downAliasTooltip, pos) }
							onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.downAliasTooltip, -1) }
							{ ...theme.r3Resource.downAliasButton }
							sx={ this.sxClasses.arrowAliasButton }
							size="large"
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
						sx={ this.sxClasses.arrowInvisibleAliasButton }
						size="large"
					>
						<UpIcon />
					</IconButton>
				);
			}else{
				upButton = (
					<Tooltip
						title={ r3provider.getR3TextRes().tResAliasUpTT }
						open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsNumber(this.state.tooltips.upAliasTooltip) || (this.state.tooltips.upAliasTooltip != pos)) ? false : true) }
					>
						<IconButton
							onClick={ (event) => this.handleAliasesChange(event, actionTypeUp, pos) }
							onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.upAliasTooltip, pos) }
							onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.upAliasTooltip, -1) }
							{ ...theme.r3Resource.upAliasButton }
							sx={ this.sxClasses.arrowAliasButton }
							size="large"
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
						sx={ this.sxClasses.deleteInvisibleAliasButton }
						size="large"
					>
						<DeleteIcon />
					</IconButton>
				);
			}else{
				deleteButton = (
					<Tooltip
						title={ r3provider.getR3TextRes().tResAliasDelTT }
						open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsNumber(this.state.tooltips.deleteAliasTooltip) || (this.state.tooltips.deleteAliasTooltip != pos)) ? false : true) }
					>
						<IconButton
							onClick={ (event) => this.handleAliasesChange(event, actionTypeDelete, pos) }
							onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.deleteAliasTooltip, pos) }
							onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.deleteAliasTooltip, -1) }
							{ ...theme.r3Resource.deleteAliasButton }
							sx={ this.sxClasses.deleteAliasButton }
							size="large"
						>
							<DeleteIcon />
						</IconButton>
					</Tooltip>
				);
			}

			let	customSlotProps;
			if(this.props.isReadMode){
				customSlotProps = {};
			}else{
				customSlotProps = {
					input: {
						sx: this.sxClasses.inputTextField
					}
				};
			}

			return (
				<Box
					key={ pos }
					sx={ this.sxClasses.enclosureElement }
				>
					<TextField
						name={ resourceComponentValues.aliasTextFieldNamePrefix + String(pos) }
						disabled={ this.props.isReadMode }
						value={ item }
						placeholder={ r3provider.getR3TextRes().tResAliasHint }
						onChange={ (event) => this.handleAliasesChange(event, actionTypeValue, pos) }
						slotProps ={ customSlotProps }
						{ ...theme.r3Resource.aliasTextField }
						sx={ this.sxClasses.aliasTextField }
					/>
					{ downButton }
					{ upButton }
					{ deleteButton }
				</Box>
			);
		});
	}

	getAddAliasContents()
	{
		const { theme, r3provider } = this.props;

		if(this.props.isReadMode){
			return;
		}

		return (
			<Box
				sx={ this.sxClasses.enclosureElement }
			>
				<TextField
					name={ resourceComponentValues.aliasNewTextFieldName }
					value={ this.state.addAliases }
					placeholder={ r3provider.getR3TextRes().tResAliasHint }
					onChange={ (event) => this.handleAddAliasesChange(event) }
					slotProps ={{ input: { sx: this.sxClasses.inputTextField } }}
					{ ...theme.r3Resource.aliasTextField }
					sx={ this.sxClasses.aliasTextField }
				/>
				<Tooltip
					title={ r3provider.getR3TextRes().tResAliasAddTT }
					open={ (r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsBoolean(this.state.tooltips.addAliasTooltip)) ? false : this.state.tooltips.addAliasTooltip === true }
				>
					<IconButton
						onClick={ (event) => this.handleAliasesChange(event, actionTypeAdd, 0) }
						onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.addAliasTooltip, true) }
						onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.addAliasTooltip, false) }
						{ ...theme.r3Resource.addAliasButton }
						sx={ this.sxClasses.addAliasButton }
						size="large"
					>
						<AddIcon />
					</IconButton>
				</Tooltip>
			</Box>
		);
	}

	render()
	{
		console.info('CALL : resource:render()');

		const { theme, r3provider } = this.props;

		const valueTextFieldTheme	= (resourceTypeObject === this.state.resourceType ? theme.r3Resource.valueObjectTextField : theme.r3Resource.valueStringTextField);
		const leftValueSelectLabel	= (
			<Typography
				{ ...theme.r3Resource.valueFormControlLabel }
			>
				{ r3provider.getR3TextRes().tResResourceValueTypeText }
			</Typography>
		);
		const rightValueSelectLabel	= (
			<Typography
				{ ...theme.r3Resource.valueFormControlLabel }
			>
				{ r3provider.getR3TextRes().tResResourceValueTypeObj }
			</Typography>
		);

		let	customSlotProps;
		if(this.props.isReadMode){
			customSlotProps = {};
		}else{
			customSlotProps = {
				input: {
					sx: this.sxClasses.inputTextField
				}
			};
		}

		return (
			<Box
				sx={ this.sxClasses.root }
			>
				<Typography
					{ ...theme.r3Resource.subTitle }
					sx={ this.sxClasses.subTitleTop }
				>
					{ r3provider.getR3TextRes().tResResourceValueSubTitle }
				</Typography>
				<FormControl
					{ ...theme.r3Resource.valueFormControl }
					sx={ this.sxClasses.valueFormControl }
				>
					<RadioGroup
						name={ resourceComponentValues.valueTypeRadioName }
						value={ this.state.resourceType }
						onChange={ this.handleValueTypeChange }
						{ ...theme.r3Resource.valueRadioGroup }
						sx={ this.sxClasses.valueRadioGroup }
					>
						<FormControlLabel
							value={ resourceTypeString }
							label={ leftValueSelectLabel }
							disabled={ this.props.isReadMode }
							control={ <Radio /> }
							{ ...theme.r3Resource.valueLeftFormControlLabel }
							sx={ this.sxClasses.valueLeftFormControlLabel }
						/>
						<FormControlLabel
							value={ resourceTypeObject }
							label={ rightValueSelectLabel }
							disabled={ this.props.isReadMode }
							control={ <Radio /> }
							{ ...theme.r3Resource.valueRightFormControlLabel }
							sx={ this.sxClasses.valueRightFormControlLabel }
						/>
					</RadioGroup>
				</FormControl>

				<TextField
					name={ resourceComponentValues.valueTextFieldName }
					value={ this.state.resourceValue }
					placeholder={ (resourceTypeObject === this.state.resourceType ? r3provider.getR3TextRes().tResResourceValueObjHint : r3provider.getR3TextRes().tResResourceValueTextHint) }
					disabled={ this.props.isReadMode }
					onChange={ (event) => this.handleValueChange(event) }
					slotProps ={ customSlotProps }
					{ ...valueTextFieldTheme }
					sx={ this.sxClasses.valueTextField }
				/>

				<Typography
					{ ...theme.r3Resource.subTitle }
					sx={ this.sxClasses.subTitle }
				>
					{ r3provider.getR3TextRes().tResResourceKeysSubTitle }
				</Typography>
				<Typography
					{ ...theme.r3Resource.keysKeySubTitle }
					sx={ this.sxClasses.keysKeySubTitle }
				>
					{ r3provider.getR3TextRes().tResResourceKeySubTitle }
				</Typography>
				<Typography
					{ ...theme.r3Resource.keysValueSubTitle }
					sx={ this.sxClasses.keysValueSubTitle }
				>
					{ r3provider.getR3TextRes().tResResourceKValueSubTitle }
				</Typography>
				{ this.getKeysContents(this.state.resource.keys) }
				{ this.getAddKeysContents() }

				<Typography
					{ ...theme.r3Resource.subTitle }
					sx={ this.sxClasses.subTitle }
				>
					{ r3provider.getR3TextRes().tResAliasSubTitle }
				</Typography>
				{ this.getAliasContents(this.state.resource.aliases) }
				{ this.getAddAliasContents() }

				<R3FormButtons
					theme={ theme }
					r3provider={ this.props.r3provider }
					status={ this.state.changed }
					onSave={ this.handleSave }
					onCancel={ this.handleCancel }
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
