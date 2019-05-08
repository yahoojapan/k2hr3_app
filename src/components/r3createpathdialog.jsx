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
 * CREATE:   Mon Sep 4 2017
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

import { r3CreatePathDialog }		from './r3styles';
import { r3IsEmptyStringObject, r3IsEmptyString } from '../util/r3util';

//
// Local variables
//
const pathTextFieldId = 'new-path-textfield-id';

//
// Create New Path Dialog Class
//
@withTheme()
@withStyles(r3CreatePathDialog)
export default class R3CreatePathDialog extends React.Component
{
	static contextTypes = {
		r3Context:		PropTypes.object.isRequired
	};

	static propTypes = {
		r3provider:		PropTypes.object.isRequired,
		open:			PropTypes.bool,
		tenant:			PropTypes.object,
		type:			PropTypes.string,
		parentPath:		PropTypes.string,
		newPath:		PropTypes.string,

		onClose:		PropTypes.func.isRequired
	};

	static defaultProps = {
		open:			false,
		tenant:			null,
		type:			null,
		parentPath:		null,
		newPath:		'',
	};

	state = {
		newPath:	this.props.newPath
	};

	constructor(props)
	{
		super(props);

		// Binding(do not define handlers as arrow functions for performance)
		this.handleNewPathChange	= this.handleNewPathChange.bind(this);
	}

	componentWillReceiveProps(nextProps)										// eslint-disable-line no-unused-vars
	{
		this.setState({
			newPath:	nextProps.newPath
		});
	}

	handleNewPathChange(event)
	{
		this.setState({
			newPath:	event.target.value
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

		let	type;
		let	typeClass;
		if(!r3IsEmptyString(this.props.type)){
			type		= this.props.type;
			typeClass	= classes.value;
		}else{
			type		= r3provider.getR3TextRes().tResUnselected;
			typeClass	= classes.valueItalic;
		}

		let	parentPath;
		let	parentPathClass;
		if(!r3IsEmptyString(this.props.parentPath)){
			parentPath		= this.props.parentPath;
			parentPathClass	= classes.value;
		}else{
			parentPath		= r3provider.getR3TextRes().tResUnselected;
			parentPathClass	= classes.valueItalic;
		}

		return (
			<Dialog
				open={ this.props.open }
				onClose={ (event) => this.props.onClose(event, false, null) }
				{ ...theme.r3CreatePathDialog.root }
				className={ classes.root }
			>
				<DialogTitle
					{ ...theme.r3CreatePathDialog.dialogTitle }
					className={ classes.dialogTitle }
				>
					<Typography
						{ ...theme.r3CreatePathDialog.title }
						className={ classes.title }
					>
						{ r3provider.getR3TextRes().cCreateNewPathTitle }
					</Typography>
				</DialogTitle>

				<DialogContent
					className={ classes.dialogContent }
				>
					<Typography
						{ ...theme.r3CreatePathDialog.keyTitle }
						className={ classes.keyTitle }
					>
						{ r3provider.getR3TextRes().tResTenantSubTitle }
					</Typography>
					<Typography
						{ ...theme.r3CreatePathDialog.value }
						className={ tenantClass }
					>
						{ tenant }
					</Typography>

					<Typography
						{ ...theme.r3CreatePathDialog.keyTitle }
						className={ classes.keyTitle }
					>
						{ r3provider.getR3TextRes().tResTypeSubTitle }
					</Typography>
					<Typography
						{ ...theme.r3CreatePathDialog.value }
						className={ typeClass }
					>
						{ type }
					</Typography>

					<Typography
						{ ...theme.r3CreatePathDialog.keyTitle }
						className={ classes.keyTitle }
					>
						{ r3provider.getR3TextRes().tResParentPathSubTitle }
					</Typography>
					<Typography
						{ ...theme.r3CreatePathDialog.value }
						className={ parentPathClass }
					>
						{ parentPath }
					</Typography>

					<Typography
						{ ...theme.r3CreatePathDialog.keyTitle }
						className={ classes.keyTitle }
					>
						{ r3provider.getR3TextRes().tResCreatePathSubTitle }
					</Typography>
					<TextField
						id={ pathTextFieldId }
						value={ this.state.newPath }
						placeholder={ r3provider.getR3TextRes().tResCreatePathHint }
						onChange={ (event) => this.handleNewPathChange(event) }
						InputProps={{ className: classes.inputTextField }}
						{ ...theme.r3CreatePathDialog.textField }
						className={ classes.textField }
					/>
				</DialogContent>

				<DialogActions>
					<Button
						onClick={ (event) => this.props.onClose(event, false, null) }
						{ ...theme.r3CreatePathDialog.cancelButton }
						className={ classes.cancelButton }
					>
						{ r3provider.getR3TextRes().tResButtonCancel }
						<CancelIcon
							className={ classes.buttonIcon }
						/>
					</Button>
					<Button
						disabled={ r3IsEmptyString(this.state.newPath, true) }
						onClick={ (event) => this.props.onClose(event, true, this.state.newPath) }
						{ ...theme.r3CreatePathDialog.okButton }
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
