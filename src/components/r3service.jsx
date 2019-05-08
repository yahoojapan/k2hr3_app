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
import Tooltip						from '@material-ui/core/Tooltip';
import DeleteIcon					from '@material-ui/icons/ClearRounded';
import AddIcon						from '@material-ui/icons/AddRounded';

import { r3Service }				from './r3styles';
import R3FormButtons				from './r3formbuttons';					// Buttons
import R3Message					from '../util/r3message';
import R3PopupMsgDialog				from './r3popupmsgdialog';
import { regYrnTenantPathPrefix, regYrnAnyTenantPath } from '../util/r3define';
import { errorType, actionTypeValue, actionTypeDelete, actionTypeAdd }	from '../util/r3types';
import { r3DeepClone, r3DeepCompare, r3CompareCaseString, r3IsEmptyStringObject, r3IsEmptyEntityObject, r3IsEmptyString, r3IsEmptyEntity, r3IsSafeTypedEntity } from '../util/r3util';

//
// Local variables
//
const tooltipValues = {
	deleteTenantTooltip:			'deleteTenantTooltip',
	addTenantTooltip:				'addTenantTooltip'
};

const serviceComponentValues = {
	verifyUrlResourceName:			'serviceVerifyUrlResource',
	tenantTextFieldNamePrefix:		'tenantValue_',
	tenantNewTextFieldName:			'tenantNew'
};

//
// Service Contents Class
//
@withTheme()
@withStyles(r3Service)
export default class R3Service extends React.Component
{
	static contextTypes = {
		r3Context:	PropTypes.object.isRequired
	};

	static propTypes = {
		r3provider:	PropTypes.object.isRequired,
		tenant:		PropTypes.string.isRequired,
		service:	PropTypes.object.isRequired,

		onSave:		PropTypes.func.isRequired,
		onUpdate:	PropTypes.func.isRequired
	};

	state = this.createState(this.props.service);

	constructor(props)
	{
		super(props);

		// Binding(do not define handlers as arrow functions for performance)
		this.handleSave					= this.handleSave.bind(this);
		this.handleCancel				= this.handleCancel.bind(this);
		this.handleConfirmDialogClose	= this.handleConfirmDialogClose.bind(this);
		this.handleMessageDialogClose	= this.handleMessageDialogClose.bind(this);

		this.handleVerifyChange			= this.handleVerifyChange.bind(this);
		this.handleTenantsChange		= this.handleTenantsChange.bind(this);
		this.handleAddTenantsChange		= this.handleAddTenantsChange.bind(this);
	}

	componentWillReceiveProps(nextProps)
	{
		// update State
		this.setState(this.createState(nextProps.service));
	}

	createState(service)
	{
		return {
			service:					r3DeepClone(service),
			addTenant:					'',
			changed:					false,
			confirmMessageObject:		null,
			messageDialogObject:		null,

			tooltips: {
				deleteTenantTooltip:	-1,				// position
				addTenantTooltip:		false
			}
		};
	}

	//
	// Check all state
	//
	isChangedState(newVerify, newTenants)
	{
		let	is_changed = false;

		// check verify
		if(r3IsSafeTypedEntity(newVerify, 'string')){
			if('' === newVerify){
				newVerify = null;
			}else if(r3CompareCaseString('null', newVerify)){
				newVerify = null;
			}else if(r3CompareCaseString('true', newVerify)){
				newVerify = true;
			}else if(r3CompareCaseString('false', newVerify)){
				newVerify = false;
			}
			if(r3IsEmptyStringObject(this.props.service, 'verify') || newVerify !== this.props.service.verify){
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
		// Check service
		//
		let	newService = r3DeepClone(this.state.service);

		//
		// verify
		//
		let	errorVerify = this.props.r3provider.isErrorServiceVerifyString(newService.verify);
		if(null !== errorVerify){
			this.setState({
				messageDialogObject:	new R3Message(errorVerify, errorType)
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
		if(!this.isChangedState(newService.verify, newService.tenant)){
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
	handleConfirmDialogClose(event, result)									// eslint-disable-line no-unused-vars
	{
		if(result){
			// case for 'cancel updating' to do
			this.props.onUpdate(false);

			// rewind State
			this.setState(this.createState(this.props.service));
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
	// Handle Verify Value : Change
	//
	handleVerifyChange(event)
	{
		let	newValue = r3IsEmptyEntityObject(event.target, 'value') ? null : event.target.value;

		if(!r3IsSafeTypedEntity(newValue, 'string')){
			console.warn('Changed verify new value is wrong.');
			return;
		}
		if(!r3IsEmptyStringObject(this.state.service, 'verify') && newValue === this.state.service.verify){
			// nothing to update
			return;
		}

		// make new service object
		let	newService		= r3DeepClone(this.state.service);
		newService.verify	= newValue;

		// set parent changed state
		let	changed			= this.isChangedState(newValue, this.state.service.tenant);
		this.props.onUpdate(changed);

		// update state
		this.setState({
			service:		newService,
			changed:		changed
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
		let	changed			= this.isChangedState(this.state.service.verify, newTenants);
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

	handTooltipChange = (event, type, extData) =>									// eslint-disable-line no-unused-vars
	{
		if(tooltipValues.deleteTenantTooltip === type){
			this.setState({
				tooltips: {
					deleteTenantTooltip:	extData
				}
			});
		}else if(tooltipValues.addTenantTooltip === type){
			this.setState({
				tooltips: {
					addTenantTooltip:		extData
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
							onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.deleteTenantTooltip, pos) }
							onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.deleteTenantTooltip, -1) }
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
						onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.addTenantTooltip, true) }
						onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.addTenantTooltip, false) }
						{ ...theme.r3Service.addAliasButton }
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
		console.log('CALL: service::render()');

		const { theme, classes, r3provider } = this.props;

		let	_verify = this.state.service.verify;
		if(r3IsEmptyEntity(_verify)){
			_verify = '';
		}else if(r3IsSafeTypedEntity(_verify, 'string')){
			// nothing to convert
		}else if(r3IsSafeTypedEntity(_verify, 'boolean')){
			_verify = _verify ? 'true' : 'false';
		}else{
			_verify = JSON.stringify(_verify);
		}

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
				<TextField
					name={ serviceComponentValues.verifyUrlResourceName }
					value={ _verify }
					placeholder={ r3provider.getR3TextRes().tResServiceUrlResHint }
					onChange={ (event) => this.handleVerifyChange(event) }
					InputProps={{ className: classes.inputTextField }}
					{ ...theme.r3Service.resourceTextField }
					className={ classes.resourceTextField }
				/>

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
