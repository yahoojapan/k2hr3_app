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
import ReactDOM						from 'react-dom';						// eslint-disable-line no-unused-vars
import PropTypes					from 'prop-types';

import TextField					from '@mui/material/TextField';
import Typography					from '@mui/material/Typography';
import IconButton					from '@mui/material/IconButton';
import Select						from '@mui/material/Select';
import MenuItem						from '@mui/material/MenuItem';
import FormGroup					from '@mui/material/FormGroup';		// For Checkbox
import FormControlLabel				from '@mui/material/FormControlLabel';
import Checkbox						from '@mui/material/Checkbox';
import Tooltip						from '@mui/material/Tooltip';
import Box							from '@mui/material/Box';
import DeleteIcon					from '@mui/icons-material/ClearRounded';
import AddIcon						from '@mui/icons-material/AddRounded';
import UpIcon						from '@mui/icons-material/ArrowUpwardRounded';
import DownIcon						from '@mui/icons-material/ArrowDownwardRounded';

import { r3Policy }					from './r3styles';
import R3FormButtons				from './r3formbuttons';					// Buttons
import R3Message					from '../util/r3message';
import R3PopupMsgDialog				from './r3popupmsgdialog';
import { policyEffects, policyActions, regYrnAnyResourcePath, regYrnAnyPolicyPath }	from '../util/r3define';
import { errorType, actionTypeValue, actionTypeDelete, actionTypeAdd, actionTypeUp, actionTypeDown } from '../util/r3types';
import { r3DeepClone, r3DeepCompare, r3ArrayHasValue, r3ArrayAddValue, r3ArrayRemoveValue, r3IsEmptyEntity, r3IsEmptyEntityObject, r3IsEmptyStringObject, r3IsEmptyString, r3IsSafeTypedEntity } from '../util/r3util';

//
// Local variables
//
const tooltipValues = {
	deleteResourceTooltip:			'deleteResourceTooltip',
	addResourceTooltip:				'addResourceTooltip',
	downAliasTooltip:				'downAliasTooltip',
	upAliasTooltip:					'upAliasTooltip',
	deleteAliasTooltip:				'deleteAliasTooltip',
	addAliasTooltip:				'addAliasTooltip'
};

const policyComponentValues = {
	resourceTextFieldNamePrefix:	'policyResource_',
	resourceNewTextFieldName:		'resourceNew',
	aliasTextFieldNamePrefix:		'aliasValue_',
	aliasNewTextFieldName:			'aliasNew'
};

//
// Policy Contents Class
//
export default class R3Policy extends React.Component
{
	static propTypes = {
		r3provider:	PropTypes.object.isRequired,
		policy:		PropTypes.object.isRequired,
		dispUnique:	PropTypes.number.isRequired,
		isReadMode:	PropTypes.bool,
		autoWidth:	PropTypes.bool,
		onSave:		PropTypes.func.isRequired,
		onUpdate:	PropTypes.func.isRequired
	};

	static defaultProps = {
		isReadMode:	false,
		autoWidth:	true
	};

	state = R3Policy.createState(this.props.policy, this.props.dispUnique);

	constructor(props)
	{
		super(props);

		// Binding(do not define handlers as arrow functions for performance)
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

		// styles
		this.sxClasses					= r3Policy(props.theme);
	}

	componentDidMount()
	{
		// update State
		this.setState(R3Policy.createState(this.props.policy, this.props.dispUnique));
	}

	// [NOTE]
	// Use getDerivedStateFromProps by deprecating componentWillReceiveProps in React 17.x.
	// The only purpose is to set the state data from props when the dialog changes from hidden to visible.
	//
	static getDerivedStateFromProps(nextProps, prevState)
	{
		if(nextProps.dispUnique !== prevState.dispUnique){
			// Inivisible to Visible
			return R3Policy.createState(nextProps.policy, nextProps.dispUnique);
		}
		return null;															// Return null to indicate no change to state.
	}

	static createState(policy, dispUnique)
	{
		return {
			dispUnique:					dispUnique,
			policy:						r3DeepClone(policy),
			addResource:				'',
			addAliases:					'',
			changed:					false,
			confirmMessageObject:		null,
			messageDialogObject:		null,

			tooltips: {
				deleteResourceTooltip:	-1,			// position
				addResourceTooltip:		false,
				downAliasTooltip:		-1,			// position
				upAliasTooltip:			-1,			// position
				deleteAliasTooltip:		-1,			// position
				addAliasTooltip:		false
			}
		};
	}

	//
	// Check Effect state
	//
	isChangedEffectState(nowEffect)
	{
		if(r3IsEmptyString(nowEffect)){
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
		if(!r3IsSafeTypedEntity(nowAction, 'array')){
			// set current value
			nowAction = this.state.policy.action;
		}
		if((r3IsEmptyEntity(this.props.policy) || !r3IsSafeTypedEntity(this.props.policy.action, 'array')) !== (!r3IsSafeTypedEntity(nowAction, 'array'))){
			return true;
		}
		return !r3DeepCompare(this.props.policy.action, nowAction);
	}

	//
	// Check Resources state
	//
	isChangedResourcesState(nowResources)
	{
		if(!r3IsSafeTypedEntity(nowResources, 'array')){
			// set current value
			nowResources = this.state.policy.resource;
		}
		if((r3IsEmptyEntity(this.props.policy) || !r3IsSafeTypedEntity(this.props.policy.resource, 'array')) !== (!r3IsSafeTypedEntity(nowResources, 'array'))){
			return true;
		}
		return !r3DeepCompare(this.props.policy.resource, nowResources);
	}

	//
	// Check only aliases state
	//
	isChangedAliasesState(nowAliases)
	{
		if(r3IsEmptyEntity(nowAliases)){
			nowAliases	= r3IsEmptyEntity(this.state.policy) ? undefined : this.state.policy.alias;
		}
		if(!r3IsSafeTypedEntity(nowAliases, 'array')){
			nowAliases = [];									// empty array
		}
		let	propsAliases = r3IsEmptyEntity(this.props.policy) ? undefined : this.props.policy.alias;
		if(!r3IsSafeTypedEntity(propsAliases, 'array')){
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
			if(!r3IsSafeTypedEntity(newPolicy.action, 'array')){
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
			if(!r3IsSafeTypedEntity(newPolicy.resource, 'array')){
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
			if(!r3IsSafeTypedEntity(newPolicy.alias, 'array')){
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
	handleConfirmDialogClose(event, reason, result)							// eslint-disable-line no-unused-vars
	{
		if(result){
			// case for 'cancel updating' to do
			this.props.onUpdate(false);

			// rewind State
			this.setState(R3Policy.createState(this.props.policy, this.props.dispUnique));
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
	// Handle Policy Effect Value : Change
	//
	handleEffectChange(event)
	{
		//let	key	= r3IsEmptyEntityObject(event.target, 'name') ? null : event.target.name;
		let	newValue= r3IsEmptyEntityObject(event.target, 'value') ? null : event.target.value;

		if(r3IsEmptyString(newValue)){
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
	handleActionChange(event, value)
	{
		let	isChecked = r3IsEmptyEntityObject(event.target, 'checked') ? null : event.target.checked;

		if(r3IsEmptyString(value) || !r3IsSafeTypedEntity(isChecked, 'boolean')){
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
		if(!r3IsSafeTypedEntity(newPolicy.action, 'array')){
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
	handleResourceChange(event, type, pos)
	{
		let	changedValue = r3IsEmptyEntityObject(event.target, 'value') ? null : event.target.value;

		let	newResources = [];
		if(r3IsSafeTypedEntity(this.state.policy.resource, 'array')){
			newResources = r3DeepClone(this.state.policy.resource);
		}

		let	isClearNewValue	= false;
		if(actionTypeValue === type){
			if(r3IsEmptyEntity(pos) || isNaN(pos) || pos < 0 || newResources.length <= pos){
				console.warn('unknown position(' + JSON.stringify(pos) + ') for resources.');
				return;
			}
			newResources[pos] = changedValue.trim();

		}else if(actionTypeDelete === type){
			if(r3IsEmptyEntity(pos) || isNaN(pos) || pos < 0 || newResources.length <= pos){
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
	handleAddResourceChange(event)
	{
		// update state
		this.setState({
			addResource:		event.target.value
		});
	}

	//
	// Handle Policy Aliases : Change
	//
	handleAliasesChange(event, type, pos)
	{
		let	changedValue	= r3IsEmptyEntityObject(event.target, 'value') ? null : event.target.value;
		let	isClearNewAlias	= false;
		let	newAliases		= [];
		if(r3IsSafeTypedEntity(this.state.policy.alias, 'array')){
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
	handleAddAliasesChange(event)
	{
		// update state
		this.setState({
			addAliases:		event.target.value
		});
	}

	handTooltipChange = (event, type, extData) =>								// eslint-disable-line no-unused-vars
	{
		if(tooltipValues.deleteResourceTooltip === type){
			this.setState({
				tooltips: {
					deleteResourceTooltip:	extData
				}
			});
		}else if(tooltipValues.addResourceTooltip === type){
			this.setState({
				tooltips: {
					addResourceTooltip:	extData
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
	};

	getEffectContents()
	{
		const { theme } = this.props;

		let	effectValue = '';
		if(!r3IsEmptyString(this.state.policy.effect)){
			effectValue = this.state.policy.effect;
		}

		return (
			<Select
				value={ effectValue }
				disabled={ this.props.isReadMode }
				autoWidth={ this.props.autoWidth }
				onChange={ (event) => this.handleEffectChange(event) }
				{ ...theme.r3Policy.effectSelect }
				sx={ this.sxClasses.effectSelect }
			>
				{
					policyEffects.map( (item, pos) => {
						return (
							<MenuItem
								key={ pos }
								value={ item.value }
							>
								{ item.name }
							</MenuItem>
						);
					})
				}
			</Select>
		);
	}

	getActionContents()
	{
		const { theme } = this.props;

		return (
			<FormGroup row>
				{
					policyActions.map( (item, pos) => {
						let	formControlLabelClass;
						if(0 == pos){
							formControlLabelClass = this.sxClasses.actionLeftLabel;
						}else if((pos + 1) < policyActions.length){
							formControlLabelClass = this.sxClasses.actionMidLabel;
						}else{
							formControlLabelClass = this.sxClasses.actionEndLabel;
						}

						return (
							<FormControlLabel
								key={ pos }
								control={
									<Checkbox
										disabled={ this.props.isReadMode }
										value={ item.value }
										checked={ r3ArrayHasValue(this.state.policy.action, item.value) }
										onChange={ (event) => this.handleActionChange(event, item.value) }
										{ ...theme.r3Policy.actionCheckbox }
										sx={ this.sxClasses.actionCheckbox }
									/>
								}
								label={
									<Typography
										{ ...theme.r3Policy.actionFormControlLabel }
									>
										{ item.name }
									</Typography>
								}
								{ ...theme.r3Policy.actionLabel }
								sx={ formControlLabelClass }
							/>
						);
					})
				}
			</FormGroup>
		);
	}

	getResourceContents(items)
	{
		const { theme, r3provider } = this.props;

		if(!r3IsSafeTypedEntity(items, 'array')){
			return;
		}
		let	_items = items;

		return _items.map( (item, pos) =>
		{
			let	deleteButton;
			if(this.props.isReadMode){
				deleteButton = (
					<IconButton
						disabled={ true }
						{ ...theme.r3Policy.deleteResourceButton }
						sx={ this.sxClasses.deleteInvisibleResourceButton }
						size="large"
					>
						<DeleteIcon />
					</IconButton>
				);
			}else{
				deleteButton = (
					<Tooltip
						title={ r3provider.getR3TextRes().tResPolicyResourceDelTT }
						open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.deleteResourceTooltip, 'number') || (this.state.tooltips.deleteResourceTooltip != pos)) ? false : true) }
					>
						<IconButton
							onClick={ (event) => this.handleResourceChange(event, actionTypeDelete, pos) }
							onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.deleteResourceTooltip, pos) }
							onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.deleteResourceTooltip, -1) }
							{ ...theme.r3Policy.deleteResourceButton }
							sx={ this.sxClasses.deleteResourceButton }
							size="large"
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
					sx: this.sxClasses.inputTextField
				};
			}

			return (
				<Box
					key={ pos }
					sx={ this.sxClasses.enclosureElement }
				>
					<TextField
						name={ policyComponentValues.resourceTextFieldNamePrefix + String(pos) }
						disabled={ this.props.isReadMode }
						value={ item }
						placeholder={ r3provider.getR3TextRes().tResPolicyResourceHint }
						onChange={ (event) => this.handleResourceChange(event, actionTypeValue, pos) }
						InputProps={ inputProps }
						{ ...theme.r3Policy.resourceTextField }
						sx={ this.sxClasses.resourceTextField }
					/>
					{ deleteButton }
				</Box>
			);
		});
	}

	getAddResourceContents()
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
					name={ policyComponentValues.resourceNewTextFieldName }
					value={ this.state.addResource }
					placeholder={ r3provider.getR3TextRes().tResPolicyResourceHint }
					onChange={ (event) => this.handleAddResourceChange(event) }
					InputProps={{ sx: this.sxClasses.inputTextField }}
					{ ...theme.r3Policy.resourceTextField }
					sx={ this.sxClasses.resourceTextField }
				/>
				<Tooltip
					title={ r3provider.getR3TextRes().tResPolicyResourceAddTT }
					open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.addResourceTooltip, 'boolean')) ? false : this.state.tooltips.addResourceTooltip) }
				>
					<IconButton
						onClick={ (event) => this.handleResourceChange(event, actionTypeAdd, 0) }
						onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.addResourceTooltip, true) }
						onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.addResourceTooltip, false) }
						{ ...theme.r3Policy.addResourceButton }
						sx={ this.sxClasses.addResourceButton }
						size="large"
					>
						<AddIcon />
					</IconButton>
				</Tooltip>
			</Box>
		);
	}

	getAliasContents(items)
	{
		const { theme, r3provider } = this.props;

		if(!r3IsSafeTypedEntity(items, 'array')){
			return;
		}
		let	_items = items;

		return _items.map( (item, pos) =>
		{
			let	downButton;
			if(this.props.isReadMode || (_items.length <= (pos + 1))){
				downButton = (
					<IconButton
						disabled={ true }
						{ ...theme.r3Policy.downAliasButton }
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
						open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.downAliasTooltip, 'number') || (this.state.tooltips.downAliasTooltip != pos)) ? false : true) }
					>
						<IconButton
							onClick={ (event) => this.handleAliasesChange(event, actionTypeDown, pos) }
							onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.downAliasTooltip, pos) }
							onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.downAliasTooltip, -1) }
							{ ...theme.r3Policy.downAliasButton }
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
						{ ...theme.r3Policy.upAliasButton }
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
						open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.upAliasTooltip, 'number') || (this.state.tooltips.upAliasTooltip != pos)) ? false : true) }
					>
						<IconButton
							onClick={ (event) => this.handleAliasesChange(event, actionTypeUp, pos) }
							onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.upAliasTooltip, pos) }
							onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.upAliasTooltip, -1) }
							{ ...theme.r3Policy.upAliasButton }
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
						{ ...theme.r3Policy.deleteAliasButton }
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
						open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.deleteAliasTooltip, 'number') || (this.state.tooltips.deleteAliasTooltip != pos)) ? false : true) }
					>
						<IconButton
							onClick={ (event) => this.handleAliasesChange(event, actionTypeDelete, pos) }
							onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.deleteAliasTooltip, pos) }
							onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.deleteAliasTooltip, -1) }
							{ ...theme.r3Policy.deleteAliasButton }
							sx={ this.sxClasses.deleteAliasButton }
							size="large"
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
					sx: this.sxClasses.inputTextField
				};
			}

			return (
				<Box
					key={ pos }
					sx={ this.sxClasses.enclosureElement }
				>
					<TextField
						name={ policyComponentValues.aliasTextFieldNamePrefix + String(pos) }
						disabled={ this.props.isReadMode }
						value={ item }
						placeholder={ r3provider.getR3TextRes().tResAliasHint }
						onChange={ (event) => this.handleAliasesChange(event, actionTypeValue, pos) }
						InputProps={ inputProps }
						{ ...theme.r3Policy.aliasTextField }
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
					name={ policyComponentValues.aliasNewTextFieldName }
					value={ this.state.addAliases }
					placeholder={ r3provider.getR3TextRes().tResAliasHint }
					onChange={ (event) => this.handleAddAliasesChange(event) }
					InputProps={{ sx: this.sxClasses.inputTextField }}
					{ ...theme.r3Policy.aliasTextField }
					sx={ this.sxClasses.aliasTextField }
				/>
				<Tooltip
					title={ r3provider.getR3TextRes().tResAliasAddTT }
					open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.addAliasTooltip, 'boolean')) ? false : this.state.tooltips.addAliasTooltip) }
				>
					<IconButton
						onClick={ (event) => this.handleAliasesChange(event, actionTypeAdd, 0) }
						onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.addAliasTooltip, true) }
						onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.addAliasTooltip, false) }
						{ ...theme.r3Policy.addAliasButton }
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
		console.log('CALL: policy::render()');

		const { theme, r3provider } = this.props;

		return (
			<Box
				sx={ this.sxClasses.root }
			>
				<Typography
					{ ...theme.r3Policy.subTitle }
					sx={ this.sxClasses.subTitleTop }
				>
					{ r3provider.getR3TextRes().tResPolicyEffectSubTitle }
				</Typography>
				{ this.getEffectContents() }

				<Typography
					{ ...theme.r3Policy.subTitle }
					sx={ this.sxClasses.subTitle }
				>
					{ r3provider.getR3TextRes().tResPolicyActionSubTitle }
				</Typography>
				{ this.getActionContents() }

				<Typography
					{ ...theme.r3Policy.subTitle }
					sx={ this.sxClasses.subTitle }
				>
					{ r3provider.getR3TextRes().tResPolicyResourceSubTitle }
				</Typography>
				{ this.getResourceContents(this.state.policy.resource) }
				{ this.getAddResourceContents() }

				<Typography
					{ ...theme.r3Policy.subTitle }
					sx={ this.sxClasses.subTitle }
				>
					{ r3provider.getR3TextRes().tResAliasSubTitle }
				</Typography>
				{ this.getAliasContents(this.state.policy.alias) }
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
