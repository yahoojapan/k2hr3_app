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

import React			from 'react';
import ReactDOM			from 'react-dom';									// eslint-disable-line no-unused-vars
import PropTypes		from 'prop-types';

import TextField		from 'material-ui/TextField';
import FontIcon			from 'material-ui/FontIcon';
import IconButton		from 'material-ui/IconButton';

import R3FormButtons	from './r3formbuttons';								// Buttons
import R3Message		from '../util/r3message';
import R3PopupMsgDialog	from './r3popupmsgdialog';
import { regYrnTenantPathPrefix, regYrnAnyTenantPath } from '../util/r3define';
import { errorType, actionTypeValue, actionTypeDelete, actionTypeAdd }	from '../util/r3types';
import { r3DeepClone, r3DeepCompare, r3CompareCaseString, r3IsEmptyStringObject, r3IsEmptyString }	from '../util/r3util';

//
// Service Contents Class
//
export default class R3Service extends React.Component
{
	constructor(props)
	{
		super(props);

		// Initalize Sate
		this.state						= this.createState(this.props.service);

		// Binding
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
			service:				r3DeepClone(service),
			addTenant:				'',
			changed:				false,
			confirmMessageObject:	null,
			messageDialogObject:	null
		};
	}

	//
	// Check all state
	//
	isChangedState(newVerify, newTenants)
	{
		let	is_changed = false;

		// check verify
		if(undefined !== newVerify && null !== newVerify && 'string' === typeof newVerify){
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
		if(undefined !== newTenants && null !== newTenants && newTenants instanceof Array){
			if(undefined === this.props.service || null === this.props.service || undefined === this.props.service.tenant || null === this.props.service.tenant || !(this.props.service.tenant instanceof Array)){
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
		if(undefined === newService.tenant || null === newService.tenant || !(newService.tenant instanceof Array)){
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
	handleVerifyChange(event, newValue)										// eslint-disable-line no-unused-vars
	{
		if(undefined === newValue || null === newValue || 'string' !== typeof newValue){
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
	handleTenantsChange(event, type, pos, changedValue)						// eslint-disable-line no-unused-vars
	{
		let	newTenants = [];
		if(undefined !== this.state.service.tenant && null !== this.state.service.tenant && this.state.service.tenant instanceof Array){
			newTenants = r3DeepClone(this.state.service.tenant);
		}

		let	isClearNewValue	= false;
		if(actionTypeValue === type){
			if(undefined === pos || null === pos || isNaN(pos) || pos < 0 || newTenants.length <= pos){
				console.warn('unknown position(' + JSON.stringify(pos) + ') for tenants.');
				return;
			}
			newTenants[pos] = changedValue.trim();

		}else if(actionTypeDelete === type){
			if(undefined === pos || null === pos || isNaN(pos) || pos < 0 || newTenants.length <= pos){
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
	handleAddTenantsChange(event, changedValue)								// eslint-disable-line no-unused-vars
	{
		// update state
		this.setState({
			addTenant:		changedValue
		});
	}

	getTenantsContents(items)
	{
		if(undefined === items || !(items instanceof Array)){
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

				return (
					<div className={ 'clearof' } key={ pos }>
						<TextField
							name={ 'tenants_' + String(pos) }
							value={ item }
							style={ this.context.muiTheme.r3Contents.tenantsTextFieldStyle }
							onChange={ (event, value) => this.handleTenantsChange(event, actionTypeValue, pos, value) }
						/>
						<IconButton
							iconStyle={ this.context.muiTheme.r3Contents.iconButtonColor }
							tooltip={ 'Delete' }
							style={ this.context.muiTheme.r3Contents.iconButtonStyle }
							onClick={ (event) => this.handleTenantsChange(event, actionTypeDelete, pos, null) }
						>
							<FontIcon className={ this.context.muiTheme.r3IconFonts.deleteIconFont } />
						</IconButton>
					</div>
				);
			})
		);
	}

	render()
	{
		console.log('CALL: service::render()');

		let	_verify = this.state.service.verify;
		if(undefined === _verify || null === _verify){
			_verify = '';
		}else if('string' === typeof _verify){
			// nothing to convert
		}else if('boolean' === typeof _verify){
			_verify = _verify ? 'true' : 'false';
		}else{
			_verify = JSON.stringify(_verify);
		}

		return (
			<div style={{ width: '100%' }} >
				<div>
					<div style={ this.context.muiTheme.r3Contents.componentSpacer }>
						<span style={ this.context.muiTheme.r3Contents.labelStyle } >VERIFY URL or STATIC JSON OBJECT STRING</span>
					</div>
					<div style={ this.context.muiTheme.r3Contents.subcomponent } >
						<TextField
							name={ 'verify_value' }
							value={ _verify }
							hintText={ 'Input Text string or false or Object formatted by JSON' }
							multiLine={ false }
							rows={ 1 }
							style={{ width: '100%' }}
							onChange={ this.handleVerifyChange }
						/>
					</div>

					<div style={ this.context.muiTheme.r3Contents.componentSpacer }>
						<span style={ this.context.muiTheme.r3Contents.labelStyle } >TENANTS</span>
					</div>
					<div style={ this.context.muiTheme.r3Contents.subcomponent } >
						{ this.getTenantsContents(this.state.service.tenant) }
						<div className={ 'clearof' }>
							<TextField
								name={ 'tenant_new' }
								value={ this.state.addTenant }
								hintText={ 'Tenant YRN path' }
								style={ this.context.muiTheme.r3Contents.tenantsTextFieldStyle }
								onChange={ (event, value) => this.handleAddTenantsChange(event, value) }
							/>
							<IconButton
								iconStyle={ this.context.muiTheme.r3Contents.iconButtonColor }
								tooltip={ 'Add' }
								style={ this.context.muiTheme.r3Contents.iconButtonStyle }
								onClick={ (event) => this.handleTenantsChange(event, actionTypeAdd, 0, null) }
							>
								<FontIcon
									className={ this.context.muiTheme.r3IconFonts.addIconFont }
								/>
							</IconButton>
						</div>
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

R3Service.contextTypes = {
	muiTheme:	PropTypes.object.isRequired,
	r3Context:	PropTypes.object.isRequired
};

R3Service.propTypes = {
	r3provider:	PropTypes.object.isRequired,
	tenant:		PropTypes.string.isRequired,
	service:	PropTypes.object.isRequired,

	onSave:		PropTypes.func.isRequired,
	onUpdate:	PropTypes.func.isRequired
};

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
