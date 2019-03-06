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

import React			from 'react';
import ReactDOM			from 'react-dom';									// eslint-disable-line no-unused-vars
import PropTypes		from 'prop-types';

// Components
import Paper			from 'material-ui/Paper';							// For contents wrap
import FontIcon			from 'material-ui/FontIcon';
import R3Message		from '../util/r3message';

// Types
import { errorType, warningType, infoType } from '../util/r3types';			// eslint-disable-line no-unused-vars

//
// Message Box Class
//
export default class R3MsgBox extends React.Component
{
	constructor(props)
	{
		super(props);
	}

	getMessageContents()
	{
		let	msgarr		= this.props.message.getMessageArray();

		return (
			msgarr.map( (item, pos) =>
			{
				return (
					<div key={ pos }>
						<span>{ item }</span>
					</div>
				);
			})
		);
	}

	render()
	{
		if(this.props.message.empty()){
			return null;
		}

		let	iconClassName;
		let	iconStyle;
		let	textStyle;
		if(this.props.message.isErrorType()){
			iconClassName	= this.context.muiTheme.r3IconFonts.errIconFont;
			iconStyle		= this.context.muiTheme.r3MsgBox.errIconFontStyle;
			textStyle		= this.context.muiTheme.r3MsgBox.errTextStyle;
		}else if(this.props.message.isWarningType()){
			iconClassName	= this.context.muiTheme.r3IconFonts.warnIconFont;
			iconStyle		= this.context.muiTheme.r3MsgBox.warnIconFontStyle;
			textStyle		= this.context.muiTheme.r3MsgBox.warnTextStyle;
		}else{	// this.props.message.isInfoType()
			iconClassName	= this.context.muiTheme.r3IconFonts.infoIconFont;
			iconStyle		= this.context.muiTheme.r3MsgBox.infoIconFontStyle;
			textStyle		= this.context.muiTheme.r3MsgBox.infoTextStyle;
		}
		let	messages		= this.getMessageContents();

		return (
			<Paper style={ this.context.muiTheme.r3Paper.paperStyle } zDepth={4} >
				<div className={ 'clearof' } style={{width: '100%'}}>
					<FontIcon
						className={ iconClassName }
						style={ iconStyle }
					/>
					<div style={ textStyle }>
						{ messages }
					</div>
				</div>
			</Paper>
		);
	}
}

R3MsgBox.contextTypes = {
	muiTheme:	PropTypes.object.isRequired,
	r3Context:	PropTypes.object.isRequired
};

R3MsgBox.propTypes = {
	message:	PropTypes.object
};

R3MsgBox.defaultProps = {
	message:	new R3Message()
};

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
