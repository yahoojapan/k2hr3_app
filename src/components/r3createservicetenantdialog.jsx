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
import CheckCircleIcon				from '@material-ui/icons/CheckCircle';
import CancelIcon					from '@material-ui/icons/Cancel';

import { r3CreateServiceTenantDialog } from './r3styles';
import { r3IsEmptyStringObject, r3IsEmptyString } from '../util/r3util';

//
// Local variables
//
const serviceTenantTextFieldId	= 'service-tenant-textfield-id';

//
// Create Service Tenant Dialog Class
//
@withTheme()
@withStyles(r3CreateServiceTenantDialog)
export default class R3CreateServiceTenantDialog extends React.Component
{
	static contextTypes = {
		r3Context:		PropTypes.object.isRequired
	};

	static propTypes = {
		r3provider:		PropTypes.object.isRequired,
		open:			PropTypes.bool,
		tenant:			PropTypes.object,
		service:		PropTypes.string,
		aliasRole:		PropTypes.string,

		onClose:		PropTypes.func.isRequired
	};

	static defaultProps = {
		open:			false,
		tenant:			null,
		service:		null,
		aliasRole:		''
	};

	state = {
		aliasRole:	this.props.aliasRole
	};

	constructor(props)
	{
		super(props);

		// Binding(do not define handlers as arrow functions for performance)
		this.handleAliasRoleChange	= this.handleAliasRoleChange.bind(this);
	}

	componentWillReceiveProps(nextProps)										// eslint-disable-line no-unused-vars
	{
		this.setState({
			aliasRole:	nextProps.aliasRole
		});
	}

	handleAliasRoleChange(event)
	{
		this.setState({
			aliasRole:	event.target.value
		});
	}

	render()
	{
		const { theme, classes, r3provider } = this.props;

		let	tenant;
		let	tenantClass;
		if(!r3IsEmptyStringObject(this.props.tenant, 'display')){
			tenant		= this.props.tenant.display;
			tenantClass	= classes.value;
		}else{
			tenant		= r3provider.getR3TextRes().tResUnselected;
			tenantClass	= classes.valueItalic;
		}

		let	service;
		let	serviceClass;
		if(!r3IsEmptyString(this.props.service, true)){
			service			= this.props.service.trim();
			serviceClass	= classes.value;
		}else{
			service			= r3provider.getR3TextRes().tResUnselected;
			serviceClass	= classes.valueItalic;
		}

		let	path		= 'yrn:yahoo:' + service + '::' + (r3IsEmptyStringObject(this.props.tenant, 'name') ? '' : this.props.tenant.name);
		let	pathClass	= classes.value;

		return (
			<Dialog
				open={ this.props.open }
				onClose={ (event) => this.props.onClose(event, false, null, null) }
				{ ...theme.r3CreateServiceDialog.root }
				className={ classes.root }
			>
				<DialogTitle
					{ ...theme.r3CreateServiceDialog.dialogTitle }
					className={ classes.dialogTitle }
				>
					<Typography
						{ ...theme.r3CreateServiceDialog.title }
						className={ classes.title }
					>
						{ r3provider.getR3TextRes().cCreateServiceTenantTitle }
					</Typography>
				</DialogTitle>

				<DialogContent
					className={ classes.dialogContent }
				>
					<Typography
						{ ...theme.r3CreateServiceDialog.keyTitle }
						className={ classes.keyTitle }
					>
						{ r3provider.getR3TextRes().tResTenantSubTitle }
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
						{ r3provider.getR3TextRes().tResServiceSubTitle }
					</Typography>
					<Typography
						{ ...theme.r3CreateServiceDialog.value }
						className={ serviceClass }
					>
						{ service }
					</Typography>

					<Typography
						{ ...theme.r3CreateServiceDialog.keyTitle }
						className={ classes.keyTitle }
					>
						{ r3provider.getR3TextRes().tResPathSubTitle }
					</Typography>
					<Typography
						{ ...theme.r3CreateServiceDialog.value }
						className={ pathClass }
					>
						{ path }
					</Typography>

					<Typography
						{ ...theme.r3CreateServiceDialog.keyTitle }
						className={ classes.keyTitle }
					>
						{ r3provider.getR3TextRes().cDefaultRoleAlias }
					</Typography>
					<TextField
						id={ serviceTenantTextFieldId }
						value={ this.state.aliasRole }
						placeholder={ r3provider.getR3TextRes().tResAliasRoleHint }
						onChange={ (event) => this.handleAliasRoleChange(event) }
						InputProps={{ className: classes.inputTextField }}
						{ ...theme.r3CreatePathDialog.textField }
						className={ classes.textField }
					/>
				</DialogContent>

				<DialogActions>
					<Button
						onClick={ (event) => this.props.onClose(event, false, null) }
						{ ...theme.r3CreateServiceDialog.cancelButton }
						className={ classes.cancelButton }
					>
						{ r3provider.getR3TextRes().tResButtonCancel }
						<CancelIcon
							className={ classes.buttonIcon }
						/>
					</Button>
					<Button
						onClick={ (event) => this.props.onClose(event, true, this.state.aliasRole) }
						{ ...theme.r3CreateServiceDialog.okButton }
						className={ classes.okButton }
					>
						{ r3provider.getR3TextRes().tResButtonOk }
						<CheckCircleIcon
							className={ classes.buttonIcon }
						/>
					</Button>
				</DialogActions>
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
