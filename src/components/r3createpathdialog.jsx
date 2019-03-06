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

import TextField		from 'material-ui/TextField';
import FontIcon			from 'material-ui/FontIcon';
import RaisedButton		from 'material-ui/RaisedButton';
import Dialog			from 'material-ui/Dialog';

import { r3IsEmptyStringObject, r3IsEmptyString } from '../util/r3util';

//
// Create New Path Dialog Class
//
export default class R3CreatePathDialog extends React.Component
{
	constructor(props)
	{
		super(props);

		this.state = {
			newPath:	this.props.newPath
		};

		this.handleNewPathChange	= this.handleNewPathChange.bind(this);
	}

	componentWillReceiveProps(nextProps)										// eslint-disable-line no-unused-vars
	{
		this.setState({
			newPath:	nextProps.newPath
		});
	}

	handleNewPathChange(event, changedValue)									// eslint-disable-line no-unused-vars
	{
		this.setState({
			newPath:	changedValue
		});
	}

	render()
	{
		let	tenant		= r3IsEmptyStringObject(this.props.tenant, 'display') ?	'(Unselected)' : this.props.tenant.display;
		let	type		= r3IsEmptyString(this.props.type) ?					'(Unselected)' : this.props.type;
		let	parentPath	= r3IsEmptyString(this.props.parentPath) ?				'(Unselected)' : this.props.parentPath;
		let	actions		= [
			<RaisedButton
				label={ 'CANCEL' }
				labelPosition={ 'after' }
				secondary={ true }
				style={ this.context.muiTheme.r3FormButtons.raisedButtonStyle }
				disabled={ false }
				onClick={ (event) => this.props.onClose(event, false, null) }
				icon={
					<FontIcon className={ this.context.muiTheme.r3IconFonts.cancelIconFont } />
				}
			/>,
			<RaisedButton
				label={ 'OK' }
				labelPosition={ 'after' }
				primary={ true }
				style={ this.context.muiTheme.r3FormButtons.raisedButtonStyle }
				disabled={ ('' === this.state.newPath) }
				onClick={ (event) => this.props.onClose(event, true, this.state.newPath) }
				icon={
					<FontIcon className={ this.context.muiTheme.r3IconFonts.checkIconFont } />
				}
			/>
		];

		return (
			<Dialog
				title={ this.props.r3provider.getR3TextRes().cCreateNewPathTitle }
				actions={ actions }
				modal={ true }
				open={ this.props.open }
				onRequestClose={ (event) => this.props.onClose(event, false, null) }
			>
				<p style={ this.context.muiTheme.dialogSimple.keyTitleStyle } >TENANT</p>
				<p style={ this.context.muiTheme.dialogSimple.valueStyle } >{ tenant }</p>
				<p style={ this.context.muiTheme.dialogSimple.keyTitleStyle } >TYPE</p>
				<p style={ this.context.muiTheme.dialogSimple.valueStyle } >{ type }</p>
				<p style={ this.context.muiTheme.dialogSimple.keyTitleStyle } >PARENT PATH</p>
				<p style={ this.context.muiTheme.dialogSimple.valueStyle } >{ parentPath }</p>
				<p style={ this.context.muiTheme.dialogSimple.keyTitleStyle } >CREATE PATH</p>
				<TextField
					name={ 'new_path' }
					value={ this.state.newPath }
					hintText={ 'Input create path'  }
					style={ this.context.muiTheme.dialogSimple.TextFieldStyle }
					onChange={ (event, value) => this.handleNewPathChange(event, value) }
				/>
			</Dialog>
		);

	}
}

R3CreatePathDialog.contextTypes = {
	muiTheme:		PropTypes.object.isRequired,
	r3Context:		PropTypes.object.isRequired
};

R3CreatePathDialog.propTypes = {
	r3provider:		PropTypes.object.isRequired,
	open:			PropTypes.bool,
	tenant:			PropTypes.object,
	type:			PropTypes.string,
	parentPath:		PropTypes.string,
	newPath:		PropTypes.string,

	onClose:		PropTypes.func.isRequired
};

R3CreatePathDialog.defaultProps = {
	open:			false,
	tenant:			null,
	type:			null,
	parentPath:		null,
	newPath:		'',
};

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
