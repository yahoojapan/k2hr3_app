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

import React			from 'react';
import ReactDOM			from 'react-dom';									// eslint-disable-line no-unused-vars
import PropTypes		from 'prop-types';

import FontIcon			from 'material-ui/FontIcon';
import RaisedButton		from 'material-ui/RaisedButton';
import Dialog			from 'material-ui/Dialog';

//
// Popup Message Dialog Class
//
export default class R3PopupMsgDialog extends React.Component
{
	constructor(props)
	{
		super(props);
	}

	render()
	{
		let	actions = [];

		if(this.props.twoButton){
			actions.push(
				<RaisedButton
					label={ 'CANCEL' }
					labelPosition={ 'after' }
					secondary={ true }
					style={ this.context.muiTheme.r3FormButtons.raisedButtonStyle }
					disabled={ false }
					onClick={ (event) => { if(null !== this.props.onClose){ this.props.onClose(event, false); } } }
					icon={
						<FontIcon className={ this.context.muiTheme.r3IconFonts.cancelIconFont } />
					}
				/>
			);
		}
		actions.push(
			<RaisedButton
				label={ 'OK' }
				labelPosition={ 'after' }
				primary={ true }
				style={ this.context.muiTheme.r3FormButtons.raisedButtonStyle }
				disabled={ false }
				onClick={ (event) => { if(null !== this.props.onClose){ this.props.onClose(event, true); } } }
				icon={
					<FontIcon className={ this.context.muiTheme.r3IconFonts.checkIconFont } />
				}
			/>
		);

		let	iconClassName;
		let	iconStyle;
		let	textStyle;
		if(null !== this.props.r3Message && this.props.r3Message.isErrorType()){
			iconClassName	= this.context.muiTheme.r3IconFonts.errIconFont;
			iconStyle		= this.context.muiTheme.r3MsgBox.errIconFontStyle;
			textStyle		= this.context.muiTheme.r3MsgBox.errTextStyle;
		}else if(null !== this.props.r3Message && this.props.r3Message.isWarningType()){
			iconClassName	= this.context.muiTheme.r3IconFonts.warnIconFont;
			iconStyle		= this.context.muiTheme.r3MsgBox.warnIconFontStyle;
			textStyle		= this.context.muiTheme.r3MsgBox.warnTextStyle;
		}else{	// this.props.r3Message.isInfoType()
			iconClassName	= this.context.muiTheme.r3IconFonts.infoIconFont;
			iconStyle		= this.context.muiTheme.r3MsgBox.infoIconFontStyle;
			textStyle		= this.context.muiTheme.r3MsgBox.infoTextStyle;
		}

		return (
			<Dialog
				title={ (null !== this.props.title ? this.props.title : (null === this.props.r3Message ? 'INFORMATION' : this.props.r3Message.getTypeString())) }
				actions={ actions }
				modal={ true }
				open={ (null !== this.props.r3Message) }
				onRequestClose={ (event) => { if(null !== this.props.onClose){ this.props.onClose(event, true); } } }
			>
				<FontIcon
					className={ iconClassName }
					style={ iconStyle }
				/>
				<div style={ textStyle }>
					<span>{ (null === this.props.r3Message ? '' : this.props.r3Message.getMessage()) }</span>
				</div>
			</Dialog>
		);

	}
}

R3PopupMsgDialog.contextTypes = {
	muiTheme:		PropTypes.object.isRequired,
	r3Context:		PropTypes.object.isRequired
};

R3PopupMsgDialog.propTypes = {
	title:			PropTypes.string,
	r3Message:		PropTypes.object,
	twoButton:		PropTypes.bool,

	onClose:		PropTypes.func
};

R3PopupMsgDialog.defaultProps = {
	title:			null,
	r3Message:		null,
	twoButton:		false,

	onClose:		null
};

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
