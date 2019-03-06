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

import { r3IsEmptyString }	from '../util/r3util';

//
// User Data(with role token) Information Class
//
export default class R3AboutDialog extends React.Component
{
	constructor(props)
	{
		super(props);

		// Binding
		this.handleClose	= this.handleClose.bind(this);
	}

	handleClose(event)														// eslint-disable-line no-unused-vars
	{
		this.props.onClose();
	}

	getHtmlLicenseText()
	{
		// Output by <p> tag per line
		//
		let	lines = this.props.licenseText.split('\n');
		return (
			lines.map( (item, pos) => {										// eslint-disable-line no-unused-vars
				return (
					<p>{ item }</p>
				);
			})
		);
	}

	render()
	{
		const actions = [
			<RaisedButton
				label={ 'CLOSE' }
				primary={ true }
				onClick={ this.handleClose }
				icon={
					<FontIcon className={ this.context.muiTheme.r3IconFonts.closeIconFont } />
				}
			/>
		];

		if(r3IsEmptyString(this.props.licensePackage)){
			// About K2HR3
			return (
				<Dialog
					title={ 'K2HR3' }
					actions={ actions }
					modal={ false }
					open={ this.props.open }
					onRequestClose={ this.handleClose }
					titleStyle={ this.context.muiTheme.dialogSimple.centerTitleStyle }
					style={ this.context.muiTheme.dialogSimple.centerContextStyle }
				>
					<div style={ this.context.muiTheme.dialogSimple.scrollDevStyle }>
						<p>K2HR3 is K2hdkc based Resource and Roles and policy Rules, gathers common management information for the cloud. K2HR3 can dynamically manage information as "who", "what", "operate". These are stored as roles, resources, policies in K2hdkc, and the client system can dynamically read and modify these information.</p>
						<br />
						<p>Copyright(C) 2017 Yahoo Japan Corporation.</p>
					</div>
				</Dialog>
			);
		}else{
			// Licenses
			return (
				<Dialog
					title={ this.props.licensePackage }
					actions={ actions }
					modal={ false }
					open={ this.props.open }
					onRequestClose={ this.handleClose }
					titleStyle={ this.context.muiTheme.dialogSimple.centerTitleStyle }
					style={ this.context.muiTheme.dialogSimple.licensesTextStyle }
				>
					<div style={ this.context.muiTheme.dialogSimple.scrollDevStyle }>
						<p style={ this.context.muiTheme.dialogSimple.licensesTypeStyle }> License: { this.props.licenseType }</p>
						<br />
						{ this.getHtmlLicenseText() }
					</div>
				</Dialog>
			);
		}
	}
}

R3AboutDialog.contextTypes = {
	muiTheme:		PropTypes.object.isRequired,
	r3Context:		PropTypes.object.isRequired
};

R3AboutDialog.propTypes = {
	open:			PropTypes.bool.isRequired,
	onClose:		PropTypes.func.isRequired,

	licensePackage:	PropTypes.string,
	licenseType:	PropTypes.string,
	licenseText:	PropTypes.string
};

R3AboutDialog.defaultProps = {
	licensePackage:	null,
	licenseType:	null,
	licenseText:	null
};

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
