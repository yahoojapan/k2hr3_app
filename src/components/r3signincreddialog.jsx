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
 * CREATE:   Thu Dec 13 2018
 * REVISION:
 *
 */

import React			from 'react';
import ReactDOM			from 'react-dom';										// eslint-disable-line no-unused-vars
import PropTypes		from 'prop-types';

import TextField		from 'material-ui/TextField';
import FontIcon			from 'material-ui/FontIcon';
import RaisedButton		from 'material-ui/RaisedButton';
import Dialog			from 'material-ui/Dialog';

import { r3IsEmptyString }	from '../util/r3util';

//
// SignIn by Credential Dialog
//
export default class R3SigninCredDialog extends React.Component
{
	constructor(props)
	{
		super(props);

		this.state = {
			name:		this.props.name,
			passphrase:	this.props.passphrase,
		};

		this.handleUserNameChange	= this.handleUserNameChange.bind(this);
		this.handlePassPhraseChange	= this.handlePassPhraseChange.bind(this);
	}

	componentWillReceiveProps(nextProps)										// eslint-disable-line no-unused-vars
	{
		this.setState({
			name:		nextProps.name,
			passphrase:	nextProps.passphrase
		});
	}

	handleUserNameChange(event, changedValue)									// eslint-disable-line no-unused-vars
	{
		this.setState({
			name:		changedValue
		});
	}

	handlePassPhraseChange(event, changedValue)									// eslint-disable-line no-unused-vars
	{
		this.setState({
			passphrase:	changedValue
		});
	}

	getMessageBox()
	{
		if(!r3IsEmptyString(this.props.message)){
			return (
				<div style={ this.context.muiTheme.r3MsgBox.warnTextStyle }>
					{ this.props.message }
				</div>
			);
		}
	}

	render()
	{
		let	name		= r3IsEmptyString(this.state.name, true) ?			'' : this.state.name.trim();
		let	passphrase	= r3IsEmptyString(this.state.passphrase, true) ?	'' : this.state.passphrase.trim();

		let	actions		= [
			<RaisedButton
				label={ 'CANCEL' }
				labelPosition={ 'after' }
				secondary={ true }
				style={ this.context.muiTheme.r3FormButtons.raisedButtonStyle }
				disabled={ false }
				onClick={ (event) => this.props.onClose(event, false, null, null) }
				icon={
					<FontIcon className={ this.context.muiTheme.r3IconFonts.cancelIconFont } />
				}
			/>,
			<RaisedButton
				label={ 'LOGIN' }
				labelPosition={ 'after' }
				primary={ true }
				style={ this.context.muiTheme.r3FormButtons.raisedButtonStyle }
				disabled={ ('' === name) }
				onClick={ (event) => this.props.onClose(event, true, this.state.name, this.state.passphrase) }
				icon={
					<FontIcon className={ this.context.muiTheme.r3IconFonts.checkIconFont } />
				}
			/>
		];

		return (
			<Dialog
				title={ this.props.r3provider.getR3TextRes().cDirectSignInTitle }
				actions={ actions }
				modal={ true }
				open={ this.props.open }
				onRequestClose={ (event) => this.props.onClose(event, false, null) }
			>
				{ this.getMessageBox() }
				<p style={ this.context.muiTheme.dialogSimple.keyTitleStyle } >USER NAME</p>
				<TextField
					name={ 'user_name' }
					value={ name }
					hintText={ 'Input user name' }
					style={ this.context.muiTheme.dialogSimple.TextFieldStyle }
					onChange={ (event, value) => this.handleUserNameChange(event, value) }
				/>
				<p style={ this.context.muiTheme.dialogSimple.keyTitleStyle } >PASS PHRASE</p>
				<TextField
					name={ 'pass_phrase' }
					value={ passphrase }
					hintText={ 'Input pass phrase' }
					type={ 'password' }
					style={ this.context.muiTheme.dialogSimple.TextFieldStyle }
					onChange={ (event, value) => this.handlePassPhraseChange(event, value) }
				/>
			</Dialog>
		);
	}
}

R3SigninCredDialog.contextTypes = {
	muiTheme:		PropTypes.object.isRequired,
	r3Context:		PropTypes.object.isRequired
};

R3SigninCredDialog.propTypes = {
	r3provider:		PropTypes.object.isRequired,
	open:			PropTypes.bool,
	name:			PropTypes.string,
	passphrase:		PropTypes.string,
	message:		PropTypes.string,

	onClose:		PropTypes.func.isRequired
};

R3SigninCredDialog.defaultProps = {
	open:			false,
	name:			'',
	passphrase:		'',
	message:		''
};

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
