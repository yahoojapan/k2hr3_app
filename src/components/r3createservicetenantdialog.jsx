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
 * CREATE:   Fri Dec 1 2017
 * REVISION:
 *
 */

import React						from 'react';
import ReactDOM						from 'react-dom';						// eslint-disable-line no-unused-vars
import PropTypes					from 'prop-types';

import TextField					from '@mui/material/TextField';
import Button						from '@mui/material/Button';
import Dialog						from '@mui/material/Dialog';
import DialogTitle					from '@mui/material/DialogTitle';
import DialogContent				from '@mui/material/DialogContent';
import DialogActions				from '@mui/material/DialogActions';
import Typography					from '@mui/material/Typography';
import CheckCircleIcon				from '@mui/icons-material/CheckCircle';
import CancelIcon					from '@mui/icons-material/Cancel';

import { r3CreateServiceTenantDialog } from './r3styles';
import { r3IsEmptyStringObject, r3IsEmptyString } from '../util/r3util';

//
// Local variables
//
const serviceTenantTextFieldId	= 'service-tenant-textfield-id';

//
// Create Service Tenant Dialog Class
//
export default class R3CreateServiceTenantDialog extends React.Component
{
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
		aliasRole:	this.props.aliasRole,
		open:		this.props.open
	};

	constructor(props)
	{
		super(props);

		// Binding(do not define handlers as arrow functions for performance)
		this.handleAliasRoleChange	= this.handleAliasRoleChange.bind(this);

		// styles
		this.sxClasses				= r3CreateServiceTenantDialog(props.theme);
	}

	// [NOTE]
	// Use getDerivedStateFromProps by deprecating componentWillReceiveProps in React 17.x.
	// The only purpose is to set the state data from props when the dialog changes from hidden to visible.
	//
	static getDerivedStateFromProps(nextProps, prevState)
	{
		if(prevState.open != nextProps.open){
			if(nextProps.open){
				// Inivisible to Visible
				return {
					aliasRole:	nextProps.aliasRole,
					open:		nextProps.open
				};
			}else{
				// Visible to Inivisible
				return {
					aliasRole:	prevState.aliasRole,
					open:		nextProps.open
				};
			}
		}
		return null;															// Return null to indicate no change to state.
	}

	handleAliasRoleChange(event)
	{
		this.setState({
			aliasRole:	event.target.value
		});
	}

	render()
	{
		const { theme, r3provider } = this.props;

		let	tenant;
		let	tenantClass;
		if(!r3IsEmptyStringObject(this.props.tenant, 'display')){
			tenant		= this.props.tenant.display;
			tenantClass	= this.sxClasses.value;
		}else{
			tenant		= r3provider.getR3TextRes().tResUnselected;
			tenantClass	= this.sxClasses.valueItalic;
		}

		let	service;
		let	serviceClass;
		if(!r3IsEmptyString(this.props.service, true)){
			service			= this.props.service.trim();
			serviceClass	= this.sxClasses.value;
		}else{
			service			= r3provider.getR3TextRes().tResUnselected;
			serviceClass	= this.sxClasses.valueItalic;
		}

		let	path		= 'yrn:yahoo:' + service + '::' + (r3IsEmptyStringObject(this.props.tenant, 'name') ? '' : this.props.tenant.name);
		let	pathClass	= this.sxClasses.value;

		return (
			<Dialog
				open={ this.props.open }
				onClose={ (event, reason) => this.props.onClose(event, reason, false, null) }
				{ ...theme.r3CreateServiceDialog.root }
				sx={ this.sxClasses.root }
			>
				<DialogTitle
					{ ...theme.r3CreateServiceDialog.dialogTitle }
					sx={ this.sxClasses.dialogTitle }
				>
					<Typography
						{ ...theme.r3CreateServiceDialog.title }
						sx={ this.sxClasses.title }
					>
						{ r3provider.getR3TextRes().cCreateServiceTenantTitle }
					</Typography>
				</DialogTitle>

				<DialogContent
					sx={ this.sxClasses.dialogContent }
				>
					<Typography
						{ ...theme.r3CreateServiceDialog.keyTitle }
						sx={ this.sxClasses.keyTitle }
					>
						{ r3provider.getR3TextRes().tResTenantSubTitle }
					</Typography>
					<Typography
						{ ...theme.r3CreateServiceDialog.value }
						sx={ tenantClass }
					>
						{ tenant }
					</Typography>

					<Typography
						{ ...theme.r3CreateServiceDialog.keyTitle }
						sx={ this.sxClasses.keyTitle }
					>
						{ r3provider.getR3TextRes().tResServiceSubTitle }
					</Typography>
					<Typography
						{ ...theme.r3CreateServiceDialog.value }
						sx={ serviceClass }
					>
						{ service }
					</Typography>

					<Typography
						{ ...theme.r3CreateServiceDialog.keyTitle }
						sx={ this.sxClasses.keyTitle }
					>
						{ r3provider.getR3TextRes().tResPathSubTitle }
					</Typography>
					<Typography
						{ ...theme.r3CreateServiceDialog.value }
						sx={ pathClass }
					>
						{ path }
					</Typography>

					<Typography
						{ ...theme.r3CreateServiceDialog.keyTitle }
						sx={ this.sxClasses.keyTitle }
					>
						{ r3provider.getR3TextRes().cDefaultRoleAlias }
					</Typography>
					<TextField
						id={ serviceTenantTextFieldId }
						value={ this.state.aliasRole }
						placeholder={ r3provider.getR3TextRes().tResAliasRoleHint }
						onChange={ (event) => this.handleAliasRoleChange(event) }
						InputProps={{ sx: this.sxClasses.inputTextField }}
						{ ...theme.r3CreatePathDialog.textField }
						sx={ this.sxClasses.textField }
					/>
				</DialogContent>

				<DialogActions>
					<Button
						onClick={ (event) => this.props.onClose(event, null, false, null) }
						{ ...theme.r3CreateServiceDialog.cancelButton }
						sx={ this.sxClasses.cancelButton }
					>
						{ r3provider.getR3TextRes().tResButtonCancel }
						<CancelIcon
							sx={ this.sxClasses.buttonIcon }
						/>
					</Button>
					<Button
						onClick={ (event) => this.props.onClose(event, null, true, this.state.aliasRole) }
						{ ...theme.r3CreateServiceDialog.okButton }
						sx={ this.sxClasses.okButton }
					>
						{ r3provider.getR3TextRes().tResButtonOk }
						<CheckCircleIcon
							sx={ this.sxClasses.buttonIcon }
						/>
					</Button>
				</DialogActions>
			</Dialog>
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
