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
import Button						from '@material-ui/core/Button';
import IconButton					from '@material-ui/core/IconButton';
import Dialog						from '@material-ui/core/Dialog';
import DialogTitle					from '@material-ui/core/DialogTitle';
import DialogContent				from '@material-ui/core/DialogContent';
import DialogActions				from '@material-ui/core/DialogActions';
import Typography					from '@material-ui/core/Typography';
import TextField					from '@material-ui/core/TextField';
import Tooltip						from '@material-ui/core/Tooltip';
import CheckCircleIcon				from '@material-ui/icons/CheckCircle';
import CopyClipBoardIcon			from '@material-ui/icons/AssignmentTurnedInRounded';

import { r3PathInfoDialog }			from './r3styles';
import { r3IsEmptyEntityObject, r3IsEmptyStringObject, r3IsEmptyString, r3IsSafeTypedEntity } from '../util/r3util';

//
// Local variables
//
const pathInfoDialogTextFields = {
	name:	'userdatascript'
};

//
// Path Information Class
//
@withTheme()
@withStyles(r3PathInfoDialog)
export default class R3PathInfoDialog extends React.Component
{
	static contextTypes = {
		r3Context:		PropTypes.object.isRequired
	};

	static propTypes = {
		r3provider:		PropTypes.object.isRequired,
		open:			PropTypes.bool.isRequired,
		tenant:			PropTypes.object,
		service:		PropTypes.string,
		type:			PropTypes.string,
		fullpath:		PropTypes.string,
		userDataScript:	PropTypes.string,
		roleToken:		PropTypes.string,
		onClose:		PropTypes.func.isRequired
	};

	static defaultProps = {
		tenant:			null,
		service:		null,
		type:			null,
		fullpath:		null,
		userDataScript:	null,
		roleToken:		null
	};

	inputElementUSD	= null;														// input textfield for user data script.

	state = {
		tooltips: {
			copyUDSButtonTooltip:	false
		}
	};

	constructor(props)
	{
		super(props);

		// Binding(do not define handlers as arrow functions for performance)
		this.handleClose		= this.handleClose.bind(this);
		this.handleClipboardCopy= this.handleClipboardCopy.bind(this);
	}

	handleClose(event)														// eslint-disable-line no-unused-vars
	{
		this.props.onClose(event);
	}

	handleClipboardCopy(event)												// eslint-disable-line no-unused-vars
	{
		if(r3IsEmptyEntityObject(this.inputElementUSD, 'select') || !r3IsSafeTypedEntity(this.inputElementUSD.select, 'function')){
			return;
		}
		this.inputElementUSD.select();
		document.execCommand('copy');

		this.setState({
			tooltips: {
				copyUDSButtonTooltip:	false
			}
		});
	}

	handTooltipChange = (event, isOpen) =>									// eslint-disable-line no-unused-vars
	{
		this.setState({
			tooltips: {
				copyUDSButtonTooltip:	isOpen
			}
		});
	}

	getRoleTokenContents(roleToken, userDataScript)
	{
		const { theme, classes, r3provider } = this.props;

		if(r3IsEmptyString(roleToken) || r3IsEmptyString(userDataScript)){
			return;
		}

		return (
			<React.Fragment>
				<Typography
					{ ...theme.r3PathInfoDialog.keyTitle }
					className={ classes.keyTitle }
				>
					{ r3provider.getR3TextRes().tResRoleTokenSubTitle }
				</Typography>
				<Typography
					{ ...theme.r3PathInfoDialog.value }
					className={ classes.value }
				>
					{ roleToken }
				</Typography>

				<Typography
					{ ...theme.r3PathInfoDialog.keyTitle }
					className={ classes.floatKeyTitle }
				>
					{ r3provider.getR3TextRes().tResUDSSubTitle }
				</Typography>

				<Tooltip
					title={ r3provider.getR3TextRes().tResCopyUDSTT }
					open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.copyUDSButtonTooltip, 'boolean')) ? false : this.state.tooltips.copyUDSButtonTooltip) }
				>
					<IconButton
						onClick={ this.handleClipboardCopy }
						onMouseEnter={ event => this.handTooltipChange(event, true) }
						onMouseLeave={ event => this.handTooltipChange(event, false) }
						{ ...theme.r3AppBar.copyUDSButton }
						className={ classes.copyUDSButton }
					>
						<CopyClipBoardIcon
							className={ classes.copyUDSIcon }
						/>
					</IconButton>
				</Tooltip>

				<div
					className={ classes.textFieldWrapper }
				>
					<TextField
						name={ pathInfoDialogTextFields.name }
						value={ userDataScript }
						inputRef = { (element) => { this.inputElementUSD = element; } } 
						InputProps={{ className: classes.inputTextField }}
						{ ...theme.r3AppBar.textFieldUDS }
						className={ classes.textFieldUDS }
					/>
				</div>
			</React.Fragment>
		);
	}

	render()
	{
		const { theme, classes, r3provider } = this.props;

		let	tenant;
		let	tenantKey = (
			<Typography
				{ ...theme.r3PathInfoDialog.keyTitle }
				className={ classes.keyTitle }
			>
				{ r3provider.getR3TextRes().tResTenantSubTitle }
			</Typography>
		);
		if(r3IsEmptyStringObject(this.props.tenant, 'display')){
			tenant = (
				<React.Fragment>
					{ tenantKey }
					<Typography
						{ ...theme.r3PathInfoDialog.value }
						className={ classes.valueItalic }
					>
						{ r3provider.getR3TextRes().tResUnselected }
					</Typography>
				</React.Fragment>
			);
		}else{
			tenant = (
				<React.Fragment>
					{ tenantKey }
					<Typography
						{ ...theme.r3PathInfoDialog.value }
						className={ classes.value }
					>
						{ this.props.tenant.display }
					</Typography>
				</React.Fragment>
			);
		}

		let	serviceContents;
		if(!r3IsEmptyString(this.props.service)){
			serviceContents = (
				<React.Fragment>
					<Typography
						{ ...theme.r3PathInfoDialog.keyTitle }
						className={ classes.keyTitle }
					>
						{ r3provider.getR3TextRes().tResServiceSubTitle }
					</Typography>
					<Typography
						{ ...theme.r3PathInfoDialog.value }
						className={ classes.value }
					>
						{ this.props.service }
					</Typography>
				</React.Fragment>
			);
		}

		let	typeContents;
		if(!r3IsEmptyString(this.props.type)){
			typeContents = (
				<React.Fragment>
					<Typography
						{ ...theme.r3PathInfoDialog.keyTitle }
						className={ classes.keyTitle }
					>
						{ r3provider.getR3TextRes().tResTypeSubTitle }
					</Typography>
					<Typography
						{ ...theme.r3PathInfoDialog.value }
						className={ classes.value }
					>
						{ this.props.type }
					</Typography>
				</React.Fragment>
			);
		}

		let	fullpathContents;
		if(!r3IsEmptyString(this.props.fullpath)){
			fullpathContents = (
				<React.Fragment>
					<Typography
						{ ...theme.r3PathInfoDialog.keyTitle }
						className={ classes.keyTitle }
					>
						{ r3provider.getR3TextRes().tResPathSubTitle }
					</Typography>
					<Typography
						{ ...theme.r3PathInfoDialog.value }
						className={ classes.value }
					>
						{ this.props.fullpath }
					</Typography>
				</React.Fragment>
			);
		}

		return (

			<Dialog
				open={ this.props.open }
				onClose={ this.handleClose }
				{ ...theme.r3PathInfoDialog.root }
				className={ classes.root }
			>
				<DialogTitle
					{ ...theme.r3PathInfoDialog.dialogTitle }
					className={ classes.dialogTitle }
				>
					<Typography
						{ ...theme.r3PathInfoDialog.title }
						className={ classes.title }
					>
						{ r3provider.getR3TextRes().tResPathInfoDialogTitle }
					</Typography>
				</DialogTitle>

				<DialogContent
					className={ classes.dialogContent }
				>
					{ tenant }
					{ serviceContents }
					{ typeContents }
					{ fullpathContents }
					{ this.getRoleTokenContents(this.props.roleToken, this.props.userDataScript) }
				</DialogContent>

				<DialogActions>
					<Button
						onClick={ this.handleClose }
						{ ...theme.r3PathInfoDialog.button }
						className={ classes.button }
					>
						{ r3provider.getR3TextRes().tResButtonClose }
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
