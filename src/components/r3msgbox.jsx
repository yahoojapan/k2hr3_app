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
 * CREATE:   Tue Aug 15 2017
 * REVISION:
 *
 */

import React						from 'react';
import ReactDOM						from 'react-dom';						// eslint-disable-line no-unused-vars
import PropTypes					from 'prop-types';

// Components
import { withTheme, withStyles }	from '@material-ui/core/styles';		// decorator
import Paper						from '@material-ui/core/Paper';			// For contents wrap
import Typography					from '@material-ui/core/Typography';
import ErrorIcon					from '@material-ui/icons/ErrorRounded';
import WarningIcon					from '@material-ui/icons/WarningRounded';
import InformationIcon				from '@material-ui/icons/InfoOutlined';

import { r3MsgBox }					from './r3styles';
import R3Message					from '../util/r3message';
import { errorType, warningType, infoType } from '../util/r3types';			// eslint-disable-line no-unused-vars

//
// Message Box Class
//
@withTheme()
@withStyles(r3MsgBox)
export default class R3MsgBox extends React.Component
{
	static contextTypes = {
		r3Context:	PropTypes.object.isRequired
	};

	static propTypes = {
		message:	PropTypes.object
	};

	static defaultProps = {
		message:	new R3Message()
	};

	constructor(props)
	{
		super(props);
	}

	getMessageContents()
	{
		const { theme, classes } = this.props;

		if(null === this.props.message){
			return;
		}

		let	themeobj;
		let	classobj;
		if(this.props.message.isErrorType()){
			themeobj	= theme.r3PopupMsgDialog.dialogErrorContentText;
			classobj	= classes.dialogErrorContentText;
		}else if(this.props.message.isWarningType()){
			themeobj	= theme.r3PopupMsgDialog.dialogWarningContentText;
			classobj	= classes.dialogWarningContentText;
		}else{	// this.props.message.isInfoType()
			themeobj	= theme.r3PopupMsgDialog.dialogInformationContentText;
			classobj	= classes.dialogInformationContentText;
		}
		let	msgarr = this.props.message.getMessageArray();

		return (
			msgarr.map( (item, pos) =>
			{
				return (
					<Typography
						key={ pos }
						{ ...themeobj }
						className={ classobj }
					>
						{ item }
						<br />
					</Typography>
				);
			})
		);
	}

	getIcon()
	{
		const { theme, classes } = this.props;

		let	icon;
		if(null !== this.props.message && this.props.message.isErrorType()){
			icon = (
				<ErrorIcon
					{ ...theme.r3PopupMsgDialog.errorIcon }
					className={ classes.errorIcon }
				/>
			);
		}else if(null !== this.props.message && this.props.message.isWarningType()){
			icon = (
				<WarningIcon
					{ ...theme.r3PopupMsgDialog.warningIcon }
					className={ classes.warningIcon }
				/>
			);
		}else{	// this.props.message.isInfoType()
			icon = (
				<InformationIcon
					{ ...theme.r3PopupMsgDialog.informationIcon }
					className={ classes.informationIcon }
				/>
			);
		}
		return icon;
	}

	render()
	{
		const { theme, classes } = this.props;

		if(null === this.props.message || this.props.message.empty()){
			return null;
		}

		return (
			<Paper
				{ ...theme.r3MsgBox.root }
				className={ classes.root }
			>
				{ this.getIcon() }
				{ this.getMessageContents() }
			</Paper>
		);
	}
}

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
