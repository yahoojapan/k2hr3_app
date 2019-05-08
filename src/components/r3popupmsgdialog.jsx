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
import CheckCircleIcon				from '@material-ui/icons/CheckCircle';
import CancelIcon					from '@material-ui/icons/Cancel';
import ErrorIcon					from '@material-ui/icons/ErrorRounded';
import WarningIcon					from '@material-ui/icons/WarningRounded';
import InformationIcon				from '@material-ui/icons/InfoOutlined';

import { r3PopupMsgDialog }			from './r3styles';

//
// Popup Message Dialog Class
//
@withTheme()
@withStyles(r3PopupMsgDialog)
export default class R3PopupMsgDialog extends React.Component
{
	static contextTypes = {
		r3Context:		PropTypes.object.isRequired
	};

	static propTypes = {
		r3provider:		PropTypes.object.isRequired,
		title:			PropTypes.string,
		r3Message:		PropTypes.object,
		twoButton:		PropTypes.bool,

		onClose:		PropTypes.func
	};

	static defaultProps = {
		title:			null,
		r3Message:		null,
		twoButton:		false,

		onClose:		null
	};

	constructor(props)
	{
		super(props);
	}

	getIcon()
	{
		const { theme, classes } = this.props;

		let	icon;
		if(null !== this.props.r3Message && this.props.r3Message.isErrorType()){
			icon = (
				<ErrorIcon
					{ ...theme.r3PopupMsgDialog.errorIcon }
					className={ classes.errorIcon }
				/>
			);
		}else if(null !== this.props.r3Message && this.props.r3Message.isWarningType()){
			icon = (
				<WarningIcon
					{ ...theme.r3PopupMsgDialog.warningIcon }
					className={ classes.warningIcon }
				/>
			);
		}else{	// this.props.r3Message.isInfoType()
			icon = (
				<InformationIcon
					{ ...theme.r3PopupMsgDialog.informationIcon }
					className={ classes.informationIcon }
				/>
			);
		}
		return icon;
	}

	getContentText()
	{
		const { theme, classes } = this.props;

		let	text		= (null === this.props.r3Message ? '' : this.props.r3Message.getMessage());
		let	contentText;
		if(null !== this.props.r3Message && this.props.r3Message.isErrorType()){
			contentText = (
				<DialogContentText
					{ ...theme.r3PopupMsgDialog.dialogErrorContentText }
					className={ classes.dialogErrorContentText }
				>
					{ text }
				</DialogContentText>
			);
		}else if(null !== this.props.r3Message && this.props.r3Message.isWarningType()){
			contentText = (
				<DialogContentText
					{ ...theme.r3PopupMsgDialog.dialogWarningContentText }
					className={ classes.dialogWarningContentText }
				>
					{ text }
				</DialogContentText>
			);
		}else{	// this.props.r3Message.isInfoType()
			contentText = (
				<DialogContentText
					{ ...theme.r3PopupMsgDialog.dialogInformationContentText }
					className={ classes.dialogInformationContentText }
				>
					{ text }
				</DialogContentText>
			);
		}
		return contentText;
	}

	getCancelButtons()
	{
		if(this.props.twoButton){
			const { theme, classes, r3provider } = this.props;

			return (
				<Button
					onClick={ (event) => { if(null !== this.props.onClose){ this.props.onClose(event, false); } } }
					{ ...theme.r3PopupMsgDialog.cancelButton }
					className={ classes.cancelButton }
				>
					{ r3provider.getR3TextRes().tResButtonCancel }
					<CancelIcon
						className={ classes.buttonIcon }
					/>
				</Button>
			);
		}
	}

	getPrimaryButtons()
	{
		const { theme, classes, r3provider } = this.props;

		let	buttonLabel;
		if(this.props.twoButton){
			buttonLabel = r3provider.getR3TextRes().tResButtonOk;
		}else{
			buttonLabel = r3provider.getR3TextRes().tResButtonClose;
		}

		return (
			<Button
				onClick={ (event) => { if(null !== this.props.onClose){ this.props.onClose(event, true); } } }
				{ ...theme.r3PopupMsgDialog.primaryButton }
				className={ classes.primaryButton }
			>
				{ buttonLabel }
				<CheckCircleIcon
					className={ classes.buttonIcon }
				/>
			</Button>
		);
	}

	render()
	{
		const { theme, classes, r3provider } = this.props;

		let	titleText;
		if(null !== this.props.title){
			titleText = this.props.title;
		}else if(null === this.props.r3Message){
			titleText = r3provider.getR3TextRes().tResInfoTitle;
		}else{
			titleText = this.props.r3Message.getTypeString();
		}

		return (
			<Dialog
				open={ (null !== this.props.r3Message) }
				onClose={ (event) => { if(null !== this.props.onClose){ this.props.onClose(event, true); } } }
				{ ...theme.r3PopupMsgDialog.root }
				className={ classes.root }
			>
				<DialogTitle
					{ ...theme.r3PopupMsgDialog.dialogTitle }
					className={ classes.dialogTitle }
				>
					<Typography
						{ ...theme.r3PopupMsgDialog.title }
						className={ classes.title }
					>
						{ titleText }
					</Typography>
				</DialogTitle>

				<DialogContent
					className={ classes.dialogContent }
				>
					{ this.getIcon() }
					{ this.getContentText() }
				</DialogContent>

				<DialogActions>
					{ this.getCancelButtons() }
					{ this.getPrimaryButtons() }
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
