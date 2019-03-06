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
import DropDownMenu		from 'material-ui/DropDownMenu';
import MenuItem			from 'material-ui/MenuItem';
import Checkbox			from 'material-ui/Checkbox';

import R3FormButtons	from './r3formbuttons';								// Buttons
import R3Message		from '../util/r3message';
import R3PopupMsgDialog	from './r3popupmsgdialog';
import { policyEffects, policyActions, regYrnAnyResourcePath, regYrnAnyPolicyPath }	from '../util/r3define';
import { r3ObjMerge, r3DeepClone, r3DeepCompare, r3ArrayHasValue, r3ArrayAddValue, r3ArrayRemoveValue, r3IsEmptyStringObject, r3IsEmptyString } from '../util/r3util';
import { errorType, actionTypeValue, actionTypeDelete, actionTypeAdd, actionTypeUp, actionTypeDown } from '../util/r3types';

//
// Policy Contents Class
//
export default class R3Policy extends React.Component
{
	constructor(props)
	{
		super(props);

		// Initalize Sate
		this.state						= this.createState(this.props.policy);

		// Binding
		this.handleSave					= this.handleSave.bind(this);
		this.handleCancel				= this.handleCancel.bind(this);
		this.handleConfirmDialogClose	= this.handleConfirmDialogClose.bind(this);
		this.handleMessageDialogClose	= this.handleMessageDialogClose.bind(this);

		this.handleEffectChange			= this.handleEffectChange.bind(this);
		this.handleActionChange			= this.handleActionChange.bind(this);
		this.handleResourceChange		= this.handleResourceChange.bind(this);
		this.handleAddResourceChange	= this.handleAddResourceChange.bind(this);
		this.handleAliasesChange		= this.handleAliasesChange.bind(this);
		this.handleAddAliasesChange		= this.handleAddAliasesChange.bind(this);
	}

	componentWillReceiveProps(nextProps)
	{
		// update State
		this.setState(this.createState(nextProps.policy));
	}

	createState(policy)
	{
		return {
			policy:					r3DeepClone(policy),
			addResource:			'',
			addAliases:				'',
			changed:				false,
			confirmMessageObject:	null,
			messageDialogObject:	null
		};
	}

	//
	// Check Effect state
	//
	isChangedEffectState(nowEffect)
	{
		if(undefined === nowEffect || null === nowEffect || 'string' !== typeof nowEffect || '' === nowEffect){
			// set current value
			nowEffect = this.state.policy.effect;
		}
		if(r3IsEmptyStringObject(this.props.policy, 'effect') !== r3IsEmptyString(nowEffect)){
			return true;
		}
		if(this.props.policy.effect !== nowEffect){
			return true;
		}
		return false;
	}

	//
	// Check Action state
	//
	isChangedActionState(nowAction)
	{
		if(undefined === nowAction || null === nowAction || !(nowAction instanceof Array)){
			// set current value
			nowAction = this.state.policy.action;
		}
		if((undefined === this.props.policy || null === this.props.policy || undefined === this.props.policy.action || null === this.props.policy.action || !(this.props.policy.action instanceof Array)) !== (undefined === nowAction || null === nowAction || !(nowAction instanceof Array))){
			return true;
		}
		return !r3DeepCompare(this.props.policy.action, nowAction);
	}

	//
	// Check Resources state
	//
	isChangedResourcesState(nowResources)
	{
		if(undefined === nowResources || null === nowResources || !(nowResources instanceof Array)){
			// set current value
			nowResources = this.state.policy.resource;
		}
		if((undefined === this.props.policy || null === this.props.policy || undefined === this.props.policy.resource || null === this.props.policy.resource || !(this.props.policy.resource instanceof Array)) !== (undefined === nowResources || null === nowResources || !(nowResources instanceof Array))){
			return true;
		}
		return !r3DeepCompare(this.props.policy.resource, nowResources);
	}

	//
	// Check only aliases state
	//
	isChangedAliasesState(nowAliases)
	{
		if(undefined === nowAliases || null === nowAliases){
			nowAliases	= undefined === this.state.policy || null === this.state.policy ? undefined : this.state.policy.alias;
		}
		if(undefined === nowAliases || null === nowAliases){
			nowAliases = [];									// empty array
		}
		let	propsAliases = undefined === this.props.policy || null === this.props.policy ? undefined : this.props.policy.alias;
		if(undefined === propsAliases || null === propsAliases){
			propsAliases = [];									// empty object
		}
		// check
		return !r3DeepCompare(nowAliases, propsAliases);
	}

	//
	// Check all state
	//
	isChangedState(nowEffect, nowAction, nowResources, nowAliases)
	{
		// check effect
		if(this.isChangedEffectState(nowEffect)){
			return true;
		}
		// check action
		if(this.isChangedActionState(nowAction)){
			return true;
		}
		// check resource
		if(this.isChangedResourcesState(nowResources)){
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
			// Check policy
			//
			let	newPolicy = r3DeepClone(this.state.policy);
			let	cnt;
			let	cnt2;
			let	found;

			//
			// effect
			//
			if(r3IsEmptyString(newPolicy.effect, true)){
				newPolicy.effect = '';
			}
			for(cnt = 0, found = false; !found && cnt < policyEffects.length; ++cnt){
				if(policyEffects[cnt].value === newPolicy.effect){
					found = true;
				}
			}
			if(!found){
				this.setState({
					messageDialogObject:	new R3Message(this.props.r3provider.getR3TextRes().eEffectType, errorType)
				});
				return;
			}

			//
			// action
			//
			if(undefined === newPolicy.action || null === newPolicy.action || !(newPolicy.action instanceof Array)){
				newPolicy.action = [];
			}
			for(cnt = 0; cnt < policyActions.length; ++cnt){
				for(cnt2 = 0, found = false; !found && cnt2 < newPolicy.action.length; ++cnt2){
					if(policyActions[cnt].value === newPolicy.action[cnt2]){
						found = true;
					}
				}
			}
			for(cnt = 0; cnt < newPolicy.action.length; ++cnt){
				for(cnt2 = 0, found = false; !found && cnt2 < policyActions.length; ++cnt2){
					if(policyActions[cnt2].value === newPolicy.action[cnt]){
						found = true;
					}
				}
				if(!found){
					this.setState({
						messageDialogObject:	new R3Message(this.props.r3provider.getR3TextRes().eActionType, errorType)
					});
					return;
				}
			}

			//
			// resource
			//
			if(undefined === newPolicy.resource || null === newPolicy.resource || !(newPolicy.resource instanceof Array)){
				newPolicy.resource = [];
			}
			// check empty and yrn path by regex
			let	regResourcePath = new RegExp(regYrnAnyResourcePath);
			for(cnt = 0; cnt < newPolicy.resource.length; ++cnt){
				newPolicy.resource[cnt] = newPolicy.resource[cnt].trim();

				if(null === newPolicy.resource[cnt].match(regResourcePath)){
					this.setState({
						messageDialogObject:	new R3Message(this.props.r3provider.getR3TextRes().eResourceArray, errorType)
					});
					return;
				}
			}
			// check same value
			for(cnt = 0; cnt < newPolicy.resource.length; ++cnt){
				for(cnt2 = (cnt + 1); cnt2 < newPolicy.resource.length; ++cnt2){
					if(newPolicy.resource[cnt] === newPolicy.resource[cnt2]){
						this.setState({
							messageDialogObject:	new R3Message(this.props.r3provider.getR3TextRes().eResourceArray, errorType)
						});
						return;
					}
				}
			}

			//
			// aliases
			//
			if(undefined === newPolicy.alias || null === newPolicy.alias || !(newPolicy.alias instanceof Array)){
				newPolicy.alias = [];
			}
			// check empty and yrn path by regex
			let	regAliasPath = new RegExp(regYrnAnyPolicyPath);
			for(cnt = 0; cnt < newPolicy.alias.length; ++cnt){
				newPolicy.alias[cnt] = newPolicy.alias[cnt].trim();

				if(null === newPolicy.alias[cnt].match(regAliasPath)){
					this.setState({
						messageDialogObject:	new R3Message(this.props.r3provider.getR3TextRes().eNotYRNAliases, errorType)
					});
					return;
				}
			}
			// check same value
			for(cnt = 0; cnt < newPolicy.alias.length; ++cnt){
				for(cnt2 = (cnt + 1); cnt2 < newPolicy.alias.length; ++cnt2){
					if(newPolicy.alias[cnt] === newPolicy.alias[cnt2]){
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
			if(!this.isChangedState(newPolicy.effect, newPolicy.action, newPolicy.resource, newPolicy.alias)){
				this.setState({
					messageDialogObject:	new R3Message(this.props.r3provider.getR3TextRes().eNoChange, errorType)
				});
				return;
			}
			this.props.onSave(newPolicy);
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
			this.setState(this.createState(this.props.policy));
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
	// Handle Policy Effect Value : Change
	//
	handleEffectChange(event, key, newValue)									// eslint-disable-line no-unused-vars
	{
		if(undefined === newValue || null === newValue || 'string' !== typeof newValue || '' === newValue){
			console.warn('Changed effect new value is wrong.');
			return;
		}

		if(!r3IsEmptyStringObject(this.state.policy, 'effect') && newValue === this.state.policy.effect){
			// nothing to update
			return;
		}

		// make new resource object
		let	newPolicy		= r3DeepClone(this.state.policy);
		newPolicy.effect	= newValue;

		// set parent changed state
		let	changed			= this.isChangedState(newValue);
		this.props.onUpdate(changed);

		// update state
		this.setState({
			policy:			newPolicy,
			changed:		changed
		});
	}

	//
	// Handle Policy Action Value : Change
	//
	handleActionChange(event, value, isChecked)									// eslint-disable-line no-unused-vars
	{
		if(undefined === value || null === value || 'string' !== typeof value || '' === value || undefined === isChecked || null === isChecked || 'boolean' !== typeof isChecked){
			console.warn('Changed effect new value is wrong.');
			return;
		}
		let	nowChecked = r3ArrayHasValue(this.state.policy.action, value);
		if(nowChecked === isChecked){
			// nothing to update
			return;
		}

		// make new resource object
		let	newPolicy		= r3DeepClone(this.state.policy);
		if(undefined === newPolicy.action || null === newPolicy.action || !(newPolicy.action instanceof Array)){
			newPolicy.action = [];
		}
		if(isChecked){
			r3ArrayAddValue(newPolicy.action, value);
		}else{
			r3ArrayRemoveValue(newPolicy.action, value);
		}

		// set parent changed state
		let	changed			= this.isChangedState(null, newPolicy.action);
		this.props.onUpdate(changed);

		// update state
		this.setState({
			policy:			newPolicy,
			changed:		changed
		});
	}

	//
	// Handle Resource Keys( key, value ) : Change
	//
	handleResourceChange(event, type, pos, changedValue)							// eslint-disable-line no-unused-vars
	{
		let	newResources = [];
		if(undefined !== this.state.policy.resource && null !== this.state.policy.resource && this.state.policy.resource instanceof Array){
			newResources = r3DeepClone(this.state.policy.resource);
		}

		let	isClearNewValue	= false;
		if(actionTypeValue === type){
			if(undefined === pos || null === pos || isNaN(pos) || pos < 0 || newResources.length <= pos){
				console.warn('unknown position(' + JSON.stringify(pos) + ') for resources.');
				return;
			}
			newResources[pos] = changedValue.trim();

		}else if(actionTypeDelete === type){
			if(undefined === pos || null === pos || isNaN(pos) || pos < 0 || newResources.length <= pos){
				console.warn('unknown position(' + JSON.stringify(pos) + ') for resources.');
				return;
			}
			newResources.splice(pos, 1);

		}else if(actionTypeAdd === type){
			if(r3IsEmptyString(this.state.addResource, true)){
				this.setState({
					messageDialogObject:	new R3Message(this.props.r3provider.getR3TextRes().eNewResources, errorType)
				});
				return;
			}
			newResources.push(this.state.addResource.trim());
			isClearNewValue = true;

		}else{
			console.warn('unknown action(' + JSON.stringify(type) + ') for resources.');
			return;
		}

		// make new resource object
		let	newPolicy		= r3DeepClone(this.state.policy);
		newPolicy.resource	= newResources;

		// set parent changed state
		let	changed			= this.isChangedState(null, null, newResources);
		this.props.onUpdate(changed);

		// update state
		this.setState({
			policy:			newPolicy,
			changed:		changed,
			addResource:	(isClearNewValue ? '' : this.state.addResource)
		});
	}

	//
	// Handle Add New Resource : Change
	//
	handleAddResourceChange(event, changedValue)								// eslint-disable-line no-unused-vars
	{
		// update state
		this.setState({
			addResource:		changedValue
		});
	}

	//
	// Handle Policy Aliases : Change
	//
	handleAliasesChange(event, type, pos, changedValue)							// eslint-disable-line no-unused-vars
	{
		let	isClearNewAlias	= false;
		let	newAliases		= [];
		if(undefined !== this.state.policy.alias && null !== this.state.policy.alias && this.state.policy.alias instanceof Array){
			newAliases		= r3DeepClone(this.state.policy.alias);
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
		let	newPolicy		= r3DeepClone(this.state.policy);
		newPolicy.alias		= newAliases;

		// set parent changed state
		let	changed			= this.isChangedState(null, null, null, newAliases);
		this.props.onUpdate(changed);

		// update state
		this.setState({
			policy:			newPolicy,
			changed:		changed,
			addAliases:		(isClearNewAlias ? '' : this.state.addAliases)
		});
	}

	//
	// Handle Add Policy Aliases : Change
	//
	handleAddAliasesChange(event, changedValue)									// eslint-disable-line no-unused-vars
	{
		// update state
		this.setState({
			addAliases:		changedValue
		});
	}

	getEffectContents()
	{
		let	effectValue = '';
		if(!r3IsEmptyString(this.state.policy.effect)){
			effectValue = this.state.policy.effect;
		}

		return (
			<DropDownMenu
				value={ effectValue }
				disabled={ this.props.isReadMode }
				autoWidth={ this.props.autoWidth }
				style={ r3ObjMerge(this.context.muiTheme.r3FontMiddle, this.context.muiTheme.r3Contents.dropdownMenuStyle) }
				targetOrigin={ this.context.muiTheme.r3Contents.dropdownMenuTarget }
				anchorOrigin={ this.context.muiTheme.r3Contents.dropdownMenuAnchor }
				onChange={ (event, key, value) => this.handleEffectChange(event, key, value) }
			>
				{
					policyEffects.map( (item, pos) => {
						return (
							<MenuItem
								key={ pos }
								value={ item.value }
								primaryText={ item.name }
							/>
						);
					})
				}
			</DropDownMenu>
		);
	}

	getActionContents()
	{
		return (
			<div className={ 'clearof' }>
				{
					policyActions.map( (item, pos) => {
						return (
							<Checkbox
								key={ pos }
								label={ item.name }
								checked={ r3ArrayHasValue(this.state.policy.action, item.value) }
								disabled={ this.props.isReadMode }
								style={ ((pos + 1) < policyActions.length ? r3ObjMerge(this.context.muiTheme.r3Contents.selectButtonStyle, this.context.muiTheme.r3FontMiddle, { float: 'left' }) : r3ObjMerge(this.context.muiTheme.r3Contents.selectButtonStyle, this.context.muiTheme.r3FontMiddle)) }
								onCheck={ (event, isChecked) => this.handleActionChange(event, item.value, isChecked) }
							/>
						);
					})
				}
			</div>
		);
	}

	getResourceContents(items)
	{
		if(undefined === items || !(items instanceof Array)){
			return;
		}

		return (
			items.map( (item, pos) =>
			{
				let	deleteButton;
				if(!this.props.isReadMode){
					deleteButton = (
						<IconButton
							iconStyle={ this.context.muiTheme.r3Contents.iconButtonColor }
							tooltip={ 'Delete' }
							style={ this.context.muiTheme.r3Contents.iconButtonStyle }
							onClick={ (event) => this.handleResourceChange(event, actionTypeDelete, pos, null) }
						>
							<FontIcon className={ this.context.muiTheme.r3IconFonts.deleteIconFont } />
						</IconButton>
					);
				}

				return (
					<div className={ 'clearof' } key={ pos }>
						<TextField
							name={ 'resource_' + String(pos) }
							value={ item }
							disabled={ this.props.isReadMode }
							style={ this.context.muiTheme.r3Contents.resourcesTextFieldStyle }
							onChange={ (event, value) => this.handleResourceChange(event, actionTypeValue, pos, value) }
						/>
						{ deleteButton }
					</div>
				);
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
				if(items.length <= (pos + 1)){
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
				if(0 === pos){
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
							disabled={ this.props.isReadMode }
							style={ this.context.muiTheme.r3Contents.aliasesTextFieldStyle }
							onChange={ (event, value) => this.handleAliasesChange(event, actionTypeValue, pos, value) }
						/>
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
		console.log('CALL: policy::render()');

		let	resourcesAddFields;
		let	aliasesAddFields;
		if(!this.props.isReadMode){
			resourcesAddFields = (
				<div className={ 'clearof' }>
					<TextField
						name={ 'resource_new' }
						value={ this.state.addResource }
						hintText={ 'Path' }
						style={ this.context.muiTheme.r3Contents.resourcesTextFieldStyle }
						onChange={ (event, value) => this.handleAddResourceChange(event, value) }
					/>
					<IconButton
						iconStyle={ this.context.muiTheme.r3Contents.iconButtonColor }
						tooltip={ 'Add' }
						style={ this.context.muiTheme.r3Contents.iconButtonStyle }
						onClick={ (event) => this.handleResourceChange(event, actionTypeAdd, 0, null) }
					>
						<FontIcon
							className={ this.context.muiTheme.r3IconFonts.addIconFont }
						/>
					</IconButton>
				</div>
			);

			aliasesAddFields = (
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
						<span style={ this.context.muiTheme.r3Contents.labelStyle } >EFFECT</span>
					</div>
					<div style={ this.context.muiTheme.r3Contents.subcomponent } >
						{ this.getEffectContents() }
					</div>

					<div>
						<span style={ this.context.muiTheme.r3Contents.labelStyle } >ACTION</span>
					</div>
					<div style={ this.context.muiTheme.r3Contents.subcomponent } >
						{ this.getActionContents() }
					</div>

					<div style={ this.context.muiTheme.r3Contents.componentSpacer }>
						<span style={ this.context.muiTheme.r3Contents.labelStyle } >RESOURCES</span>
					</div>
					<div style={ this.context.muiTheme.r3Contents.subcomponent } >
						{ this.getResourceContents(this.state.policy.resource) }
						{ resourcesAddFields }
					</div>

					<div style={ this.context.muiTheme.r3Contents.componentSpacer }>
						<span style={ this.context.muiTheme.r3Contents.labelStyle } >ALIAS</span>
					</div>
					<div style={ this.context.muiTheme.r3Contents.subcomponent } >
						{ this.getAliasContents(this.state.policy.alias) }
						{ aliasesAddFields }
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

R3Policy.contextTypes = {
	muiTheme:	PropTypes.object.isRequired,
	r3Context:	PropTypes.object.isRequired
};

R3Policy.propTypes = {
	r3provider:	PropTypes.object.isRequired,
	policy:		PropTypes.object.isRequired,
	isReadMode:	PropTypes.bool,
	autoWidth:	PropTypes.bool,

	onSave:		PropTypes.func.isRequired,
	onUpdate:	PropTypes.func.isRequired
};

R3Policy.defaultProps = {
	isReadMode:	false,
	autoWidth:	true
};

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
