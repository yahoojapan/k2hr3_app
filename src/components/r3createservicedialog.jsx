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
 * CREATE:   Fri Nov 24 2017
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

import { r3IsEmptyStringObject } from '../util/r3util';

//
// Create New Path Dialog Class
//
export default class R3CreateServiceDialog extends React.Component
{
	constructor(props)
	{
		super(props);

		this.state = {
			newServiceName:	this.props.newServiceName,
			newVerify:		this.props.newVerify
		};

		this.handleNewServiceNameChange	= this.handleNewServiceNameChange.bind(this);
		this.handleNewVerifyChange		= this.handleNewVerifyChange.bind(this);
	}

	componentWillReceiveProps(nextProps)										// eslint-disable-line no-unused-vars
	{
		this.setState({
			newServiceName:	nextProps.newServiceName,
			newVerify:		nextProps.newVerify
		});
	}

	handleNewServiceNameChange(event, changedValue)								// eslint-disable-line no-unused-vars
	{
		this.setState({
			newServiceName:	changedValue
		});
	}

	handleNewVerifyChange(event, changedValue)									// eslint-disable-line no-unused-vars
	{
		this.setState({
			newVerify:	changedValue
		});
	}

	render()
	{
		let	tenant		= r3IsEmptyStringObject(this.props.tenant, 'display') ? '(Unselected)' : this.props.tenant.display;
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
				label={ 'OK' }
				labelPosition={ 'after' }
				primary={ true }
				style={ this.context.muiTheme.r3FormButtons.raisedButtonStyle }
				disabled={ ('' === this.state.newServiceName) }
				onClick={ (event) => this.props.onClose(event, true, this.state.newServiceName, this.state.newVerify) }
				icon={
					<FontIcon className={ this.context.muiTheme.r3IconFonts.checkIconFont } />
				}
			/>
		];

		return (
			<Dialog
				title={ this.props.r3provider.getR3TextRes().cCreateServiceTitle }
				actions={ actions }
				modal={ true }
				open={ this.props.open }
				onRequestClose={ (event) => this.props.onClose(event, false, null, null) }
			>
				<p style={ this.context.muiTheme.dialogSimple.keyTitleStyle } >TENANT for SERVICE owner</p>
				<p style={ this.context.muiTheme.dialogSimple.valueStyle } >{ tenant }</p>
				<p style={ this.context.muiTheme.dialogSimple.keyTitleStyle } >CREATE SERVICE</p>
				<TextField
					name={ 'new_service_name' }
					value={ this.state.newServiceName }
					hintText={ 'Input create service name'  }
					style={ this.context.muiTheme.dialogSimple.TextFieldStyle }
					onChange={ (event, value) => this.handleNewServiceNameChange(event, value) }
				/>
				<p style={ this.context.muiTheme.dialogSimple.keyTitleStyle } >VERIFY URL or STATIC RESOURCE</p>
				<TextField
					name={ 'new_verify' }
					value={ this.state.newVerify }
					hintText={ 'Input verify'  }
					style={ this.context.muiTheme.dialogSimple.TextFieldStyle }
					onChange={ (event, value) => this.handleNewVerifyChange(event, value) }
				/>
			</Dialog>
		);

	}
}

R3CreateServiceDialog.contextTypes = {
	muiTheme:		PropTypes.object.isRequired,
	r3Context:		PropTypes.object.isRequired
};

R3CreateServiceDialog.propTypes = {
	r3provider:		PropTypes.object.isRequired,
	open:			PropTypes.bool,
	tenant:			PropTypes.object,
	newServiceName:	PropTypes.string,
	newVerify:		PropTypes.string,

	onClose:		PropTypes.func.isRequired
};

R3CreateServiceDialog.defaultProps = {
	open:			false,
	tenant:			null,
	newServiceName:	'',
	newVerify:		''
};

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
