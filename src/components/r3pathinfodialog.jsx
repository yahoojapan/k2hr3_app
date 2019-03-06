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

import IconButton		from 'material-ui/IconButton';
import TextField		from 'material-ui/TextField';

import { r3IsEmptyStringObject, r3IsEmptyString } from '../util/r3util';

//
// Path Information Class
//
export default class R3PathInfoDialog extends React.Component
{
	constructor(props)
	{
		super(props);

		// Binding
		this.handleClose		= this.handleClose.bind(this);
		this.handleClipboardCopy= this.handleClipboardCopy.bind(this);
	}

	handleClose(event)														// eslint-disable-line no-unused-vars
	{
		this.props.onClose(event);
	}

	handleClipboardCopy(event)												// eslint-disable-line no-unused-vars
	{
		this.refs.userscripttextarea.select();
		document.execCommand('copy');
	}

	getRoleTokenContents(roleToken, userDataScript)
	{
		if(r3IsEmptyString(roleToken) || r3IsEmptyString(userDataScript)){
			return;
		}
		return (
			<div>
				<p style={ this.context.muiTheme.dialogSimple.keyTitleStyle } >ROLE TOKEN</p>
				<p style={ this.context.muiTheme.dialogSimple.valueStyle } >{ roleToken }</p>
				<div className={ 'clearof' }>
					<span style={ this.context.muiTheme.dialogSimple.keyLeftTitleStyle } >USER DATA SCRIPT</span>
					<IconButton
						tooltip="Copy user script to clipboard"
						onClick={ this.handleClipboardCopy }
						style={ this.context.muiTheme.dialogSimple.iconButtonStyle }
					>
						<FontIcon
							className={ this.context.muiTheme.r3IconFonts.clipboardCopyIconFont }
							color={ this.context.muiTheme.palette.accent1Color }
						/>
					</IconButton>
				</div>
				<TextField
					name={ 'userscript' }
					value={ userDataScript }
					multiLine={ true }
					rows={ 10 }
					rowsMax={ 12 }
					underlineShow={ false }
					textareaStyle={ this.context.muiTheme.dialogSimple.HiddenTextareaStyle }
					style={ this.context.muiTheme.dialogSimple.HiddenTextFieldStyle }
					ref={ 'userscripttextarea' }
				/>
			</div>
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

		let	tenant	= r3IsEmptyStringObject(this.props.tenant, 'display') ? '(Unselected)' : this.props.tenant.display;

		let	serviceContents;
		if(!r3IsEmptyString(this.props.service)){
			serviceContents = (
				<div>
					<p style={ this.context.muiTheme.dialogSimple.keyTitleStyle } >SERVICE</p>
					<p style={ this.context.muiTheme.dialogSimple.valueStyle } >{ this.props.service }</p>
				</div>
			);
		}
		let	typeContents;
		if(!r3IsEmptyString(this.props.type)){
			typeContents = (
				<div>
					<p style={ this.context.muiTheme.dialogSimple.keyTitleStyle } >TYPE</p>
					<p style={ this.context.muiTheme.dialogSimple.valueStyle } >{ this.props.type }</p>
				</div>
			);
		}
		let	fullpathContents;
		if(!r3IsEmptyString(this.props.fullpath)){
			fullpathContents = (
				<div>
					<p style={ this.context.muiTheme.dialogSimple.keyTitleStyle } >PATH</p>
					<p style={ this.context.muiTheme.dialogSimple.valueStyle } >{ this.props.fullpath }</p>
				</div>
			);
		}

		return (
			<Dialog
				title={ 'Selected Path Information' }
				actions={ actions }
				modal={ false }
				autoScrollBodyContent={ false }
				open={ this.props.open }
				onRequestClose={ this.handleClose }
			>
				<p style={ this.context.muiTheme.dialogSimple.keyTitleStyle } >TENANT</p>
				<p style={ this.context.muiTheme.dialogSimple.valueStyle } >{ tenant }</p>
				{ serviceContents }
				{ typeContents }
				{ fullpathContents }
				{ this.getRoleTokenContents(this.props.roleToken, this.props.userDataScript) }
			</Dialog>
		);
	}
}

R3PathInfoDialog.contextTypes = {
	muiTheme:		PropTypes.object.isRequired,
	r3Context:		PropTypes.object.isRequired
};

R3PathInfoDialog.propTypes = {
	open:			PropTypes.bool.isRequired,
	tenant:			PropTypes.object,
	service:		PropTypes.string,
	type:			PropTypes.string,
	fullpath:		PropTypes.string,
	userDataScript:	PropTypes.string,
	roleToken:		PropTypes.string,
	onClose:		PropTypes.func.isRequired
};

R3PathInfoDialog.defaultProps = {
	tenant:			null,
	service:		null,
	type:			null,
	fullpath:		null,
	userDataScript:	null,
	roleToken:		null
};

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
