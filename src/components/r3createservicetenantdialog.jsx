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
 * CREATE:   Fri Dec 1 2017
 * REVISION:
 *
 */

import React			from 'react';
import ReactDOM			from 'react-dom';									// eslint-disable-line no-unused-vars
import PropTypes		from 'prop-types';

import TextField		from 'material-ui/TextField';
import FontIcon			from 'material-ui/FontIcon';
import RaisedButton		from 'material-ui/RaisedButton';
import Dialog			from 'material-ui/Dialog';

import { r3IsEmptyStringObject, r3IsEmptyString } from '../util/r3util';

//
// Create Service Tenant Dialog Class
//
export default class R3CreateServiceTenantDialog extends React.Component
{
	constructor(props)
	{
		super(props);

		this.state = {
			aliasRole:	this.props.aliasRole
		};

		this.handleAliasRoleChange	= this.handleAliasRoleChange.bind(this);
	}

	componentWillReceiveProps(nextProps)										// eslint-disable-line no-unused-vars
	{
		this.setState({
			aliasRole:	nextProps.aliasRole
		});
	}

	handleAliasRoleChange(event, changedValue)									// eslint-disable-line no-unused-vars
	{
		this.setState({
			aliasRole:	changedValue
		});
	}

	render()
	{
		let	tenant		= r3IsEmptyStringObject(this.props.tenant, 'display') ? '(Unselected)' : this.props.tenant.display;
		let	service		= r3IsEmptyString(this.props.service, true) ? '(Unselected)' : this.props.service.trim();
		let	path		= 'yrn:yahoo:' + service + '::' + (r3IsEmptyStringObject(this.props.tenant, 'name') ? '' : this.props.tenant.name);
		let	actions		= [
			<RaisedButton
				label={ 'CANCEL' }
				labelPosition={ 'after' }
				secondary={ true }
				style={ this.context.muiTheme.r3FormButtons.raisedButtonStyle }
				disabled={ false }
				onClick={ (event) => this.props.onClose(event, false, null) }
				icon={
					<FontIcon className={ this.context.muiTheme.r3IconFonts.cancelIconFont } />
				}
			/>,
			<RaisedButton
				label={ 'OK' }
				labelPosition={ 'after' }
				primary={ true }
				style={ this.context.muiTheme.r3FormButtons.raisedButtonStyle }
				disabled={ false }
				onClick={ (event) => this.props.onClose(event, true, this.state.aliasRole) }
				icon={
					<FontIcon className={ this.context.muiTheme.r3IconFonts.checkIconFont } />
				}
			/>
		];

		return (
			<Dialog
				title={ this.props.r3provider.getR3TextRes().cCreateServiceTenantTitle }
				actions={ actions }
				modal={ true }
				open={ this.props.open }
				onRequestClose={ (event) => this.props.onClose(event, false, null, null) }
			>
				<p style={ this.context.muiTheme.dialogSimple.keyTitleStyle } >TENANT</p>
				<p style={ this.context.muiTheme.dialogSimple.valueStyle } >{ tenant }</p>
				<p style={ this.context.muiTheme.dialogSimple.keyTitleStyle } >SERVICE</p>
				<p style={ this.context.muiTheme.dialogSimple.valueStyle } >{ service }</p>
				<p style={ this.context.muiTheme.dialogSimple.keyTitleStyle } >PATH</p>
				<p style={ this.context.muiTheme.dialogSimple.valueStyle } >{ path }</p>
				<p style={ this.context.muiTheme.dialogSimple.keyTitleStyle } >{ this.props.r3provider.getR3TextRes().cDefaultRoleAlias }</p>
				<TextField
					name={ 'alias_role' }
					value={ this.state.aliasRole }
					hintText={ 'Role path under tenant(yrn:yahoo:::<tenant>)' }
					style={ this.context.muiTheme.dialogSimple.TextFieldStyle }
					onChange={ (event, value) => this.handleAliasRoleChange(event, value) }
				/>
			</Dialog>
		);

	}
}

R3CreateServiceTenantDialog.contextTypes = {
	muiTheme:		PropTypes.object.isRequired,
	r3Context:		PropTypes.object.isRequired
};

R3CreateServiceTenantDialog.propTypes = {
	r3provider:		PropTypes.object.isRequired,
	open:			PropTypes.bool,
	tenant:			PropTypes.object,
	service:		PropTypes.string,
	aliasRole:		PropTypes.string,

	onClose:		PropTypes.func.isRequired
};

R3CreateServiceTenantDialog.defaultProps = {
	open:			false,
	tenant:			null,
	service:		null,
	aliasRole:		''
};

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
