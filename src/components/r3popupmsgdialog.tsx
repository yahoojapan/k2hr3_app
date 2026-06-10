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
 * CREATE:   Mon Sep 4 2017
 * REVISION:
 *
 */

import React						from 'react';
import ReactDOM						from 'react-dom';						// eslint-disable-line no-unused-vars
import PropTypes					from 'prop-types';

import Button						from '@mui/material/Button';
import Dialog						from '@mui/material/Dialog';
import DialogTitle					from '@mui/material/DialogTitle';
import DialogContent				from '@mui/material/DialogContent';
import DialogContentText			from '@mui/material/DialogContentText';
import DialogActions				from '@mui/material/DialogActions';
import Typography					from '@mui/material/Typography';
import CheckCircleIcon				from '@mui/icons-material/CheckCircle';
import CancelIcon					from '@mui/icons-material/Cancel';
import ErrorIcon					from '@mui/icons-material/ErrorRounded';
import WarningIcon					from '@mui/icons-material/WarningRounded';
import InformationIcon				from '@mui/icons-material/InfoOutlined';

import { r3PopupMsgDialog }			from './r3styles';

//
// Popup Message Dialog Class
//
export default class R3PopupMsgDialog extends React.Component
{
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

		// styles
		this.sxClasses = r3PopupMsgDialog(props.theme);
	}

	getIcon()
	{
		const { theme } = this.props;

		let	icon;
		if(null !== this.props.r3Message && this.props.r3Message.isErrorType()){
			icon = (
				<ErrorIcon
					{ ...theme.r3PopupMsgDialog.errorIcon }
					sx={ this.sxClasses.errorIcon }
				/>
			);
		}else if(null !== this.props.r3Message && this.props.r3Message.isWarningType()){
			icon = (
				<WarningIcon
					{ ...theme.r3PopupMsgDialog.warningIcon }
					sx={ this.sxClasses.warningIcon }
				/>
			);
		}else{	// this.props.r3Message.isInfoType()
			icon = (
				<InformationIcon
					{ ...theme.r3PopupMsgDialog.informationIcon }
					sx={ this.sxClasses.informationIcon }
				/>
			);
		}
		return icon;
	}

	getContentText()
	{
		const { theme } = this.props;

		let	text		= (null === this.props.r3Message ? '' : this.props.r3Message.getMessage());
		let	contentText;
		if(null !== this.props.r3Message && this.props.r3Message.isErrorType()){
			contentText = (
				<DialogContentText
					{ ...theme.r3PopupMsgDialog.dialogErrorContentText }
					sx={ this.sxClasses.dialogErrorContentText }
				>
					{ text }
				</DialogContentText>
			);
		}else if(null !== this.props.r3Message && this.props.r3Message.isWarningType()){
			contentText = (
				<DialogContentText
					{ ...theme.r3PopupMsgDialog.dialogWarningContentText }
					sx={ this.sxClasses.dialogWarningContentText }
				>
					{ text }
				</DialogContentText>
			);
		}else{	// this.props.r3Message.isInfoType()
			contentText = (
				<DialogContentText
					{ ...theme.r3PopupMsgDialog.dialogInformationContentText }
					sx={ this.sxClasses.dialogInformationContentText }
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
			const { theme, r3provider } = this.props;

			return (
				<Button
					onClick={ (event) => { if(null !== this.props.onClose){ this.props.onClose(event, null, false); } } }
					{ ...theme.r3PopupMsgDialog.cancelButton }
					sx={ this.sxClasses.cancelButton }
				>
					{ r3provider.getR3TextRes().tResButtonCancel }
					<CancelIcon
						sx={ this.sxClasses.buttonIcon }
					/>
				</Button>
			);
		}
	}

	getPrimaryButtons()
	{
		const { theme, r3provider } = this.props;

		let	buttonLabel;
		if(this.props.twoButton){
			buttonLabel = r3provider.getR3TextRes().tResButtonOk;
		}else{
			buttonLabel = r3provider.getR3TextRes().tResButtonClose;
		}

		return (
			<Button
				onClick={ (event) => { if(null !== this.props.onClose){ this.props.onClose(event, null, true); } } }
				{ ...theme.r3PopupMsgDialog.primaryButton }
				sx={ this.sxClasses.primaryButton }
			>
				{ buttonLabel }
				<CheckCircleIcon
					sx={ this.sxClasses.buttonIcon }
				/>
			</Button>
		);
	}

	render()
	{
		const { theme, r3provider } = this.props;

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
				onClose={ (event, reason) => { if(null !== this.props.onClose){ this.props.onClose(event, reason, true); } } }
				{ ...theme.r3PopupMsgDialog.root }
				sx={ this.sxClasses.root }
			>
				<DialogTitle
					{ ...theme.r3PopupMsgDialog.dialogTitle }
					sx={ this.sxClasses.dialogTitle }
				>
					<Typography
						{ ...theme.r3PopupMsgDialog.title }
						sx={ this.sxClasses.title }
					>
						{ titleText }
					</Typography>
				</DialogTitle>

				<DialogContent
					sx={ this.sxClasses.dialogContent }
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
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * End:
 * vim600: noexpandtab sw=4 ts=4 fdm=marker
 * vim<600: noexpandtab sw=4 ts=4
 */
