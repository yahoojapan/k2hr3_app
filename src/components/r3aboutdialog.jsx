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
import Dialog						from '@material-ui/core/Dialog';
import DialogTitle					from '@material-ui/core/DialogTitle';
import DialogContent				from '@material-ui/core/DialogContent';
import DialogContentText			from '@material-ui/core/DialogContentText';
import DialogActions				from '@material-ui/core/DialogActions';
import Typography					from '@material-ui/core/Typography';
import CancelIcon					from '@material-ui/icons/Cancel';

import { r3IsEmptyString }			from '../util/r3util';
import { r3AboutDialogStyles }		from './r3styles';

//
// Local variables
//
const k2hr3Title		=	'K2HR3';
const k2hr3LicenseType	=	'MIT';
const k2hr3Content		=	'K2HR3 is K2hdkc based Resource and Roles and policy Rules, gathers common' + 
							'management information for the cloud.' + 
							'K2HR3 can dynamically manage information as "who", "what", "operate".' + 
							'These are stored as roles, resources, policies in K2hdkc, and the client' +
							'system can dynamically read and modify these information.';
const k2hr3License		=	'Copyright(C) 2017 Yahoo Japan Corporation.';

//
// User Data(with role token) Information Class
//
@withTheme
@withStyles(r3AboutDialogStyles)
export default class R3AboutDialog extends React.Component
{
	static contextTypes = {
		r3Context:		PropTypes.object.isRequired
	};

	static propTypes = {
		r3provider:		PropTypes.object.isRequired,
		open:			PropTypes.bool.isRequired,
		onClose:		PropTypes.func.isRequired,

		licensePackage:	PropTypes.string,
		licenseType:	PropTypes.string,
		licenseText:	PropTypes.string
	};

	static defaultProps = {
		licensePackage:	null,
		licenseType:	null,
		licenseText:	null
	};

	constructor(props)
	{
		super(props);

		// Binding(do not define handlers as arrow functions for performance)
		this.handleClose	= this.handleClose.bind(this);
	}

	handleClose(event, reason)
	{
		this.props.onClose(event, reason);
	}

	getHtmlLicenseText()
	{

		// Output by <p> tag per line
		//
		let	lines = this.props.licenseText.split('\n');

		return (
			lines.map( (item, pos) => {						// eslint-disable-line no-unused-vars
				return (
					<Typography key={ pos }>
						{ item }
						<br />
					</Typography>
				);
			})
		);
	}

	getLicenseType()
	{
		return (
			<Typography { ...this.props.theme.r3AboutDialog.licenseType }>
				License: { (r3IsEmptyString(this.props.licensePackage) ? k2hr3LicenseType : this.props.licenseType) }
				<br />
			</Typography>
		);
	}

	getContentText()
	{
		if(r3IsEmptyString(this.props.licensePackage)){
			return (
				<Typography { ...this.props.theme.r3AboutDialog.content }>
					{ k2hr3Content }
					<br />
					<br />
					{ k2hr3License }
				</Typography>
			);
		}else{
			return (
				<Typography { ...this.props.theme.r3AboutDialog.content }>
					{ this.getHtmlLicenseText() }
				</Typography>
			);
		}
	}

	render()
	{
		const { theme, classes, r3provider } = this.props;

		let	licenseType	= this.getLicenseType();
		let	contentText	= this.getContentText();

		return (
			<Dialog
				open={ this.props.open }
				onClose={ (event, reason) => this.handleClose(event, reason) }
				{ ...theme.r3AboutDialog.root }
				className={ classes.root }
			>
				<DialogTitle
					{ ...theme.r3AboutDialog.dialogTitle }
					className={ classes.dialogTitle }
				>
					<Typography
						{ ...theme.r3AboutDialog.title }
						className={ classes.title }
					>
						About { (r3IsEmptyString(this.props.licensePackage) ? k2hr3Title : this.props.licensePackage) }
					</Typography>
				</DialogTitle>
				<DialogContent 
					className={ classes.dialogContent }
				>
					<DialogContentText
						{ ...theme.r3AboutDialog.dialogContentText }
						className={ classes.dialogContentText }
					>
						{ licenseType }
						{ contentText }
					</DialogContentText>
				</DialogContent>
				<DialogActions
					className={ classes.dialogAction }
				>
					<Button
						onClick={ (event) => this.handleClose(event, null) }
						{ ...theme.r3AboutDialog.button }
						className={ classes.button }
					>
						{ r3provider.getR3TextRes().tResButtonClose }
						<CancelIcon
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
