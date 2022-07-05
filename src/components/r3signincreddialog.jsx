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

import React						from 'react';
import ReactDOM						from 'react-dom';						// eslint-disable-line no-unused-vars
import PropTypes					from 'prop-types';

import TextField					from '@mui/material/TextField';
import Button						from '@mui/material/Button';
import IconButton					from '@mui/material/IconButton';
import Dialog						from '@mui/material/Dialog';
import DialogTitle					from '@mui/material/DialogTitle';
import DialogContent				from '@mui/material/DialogContent';
import DialogContentText			from '@mui/material/DialogContentText';
import DialogActions				from '@mui/material/DialogActions';
import InputAdornment				from '@mui/material/InputAdornment';
import Typography					from '@mui/material/Typography';
import Paper						from '@mui/material/Paper';
import VisibilityIcon				from '@mui/icons-material/Visibility';
import VisibilityOffIcon			from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon				from '@mui/icons-material/CheckCircle';
import CancelIcon					from '@mui/icons-material/Cancel';
import WarningIcon					from '@mui/icons-material/WarningRounded';

import { r3IsEmptyString }			from '../util/r3util';
import { r3SigninCredDialogStyles }	from './r3styles';

//
// Local variables
//
const userNameTextFieldId		= 'username-textfield-id';
const passphraseTextFieldId		= 'passphrase-textfield-id';

//
// SignIn by Credential Dialog
//
export default class R3SigninCredDialog extends React.Component
{
	static propTypes = {
		r3provider:		PropTypes.object.isRequired,
		open:			PropTypes.bool,
		name:			PropTypes.string,
		passphrase:		PropTypes.string,
		message:		PropTypes.string,

		onClose:		PropTypes.func.isRequired
	};

	static defaultProps = {
		open:			false,
		name:			'',
		passphrase:		'',
		message:		''
	};

	state = {
		name:			this.props.name,
		passphrase:		this.props.passphrase,
		showPassphrase:	false,
		open:			this.props.open
	};

	constructor(props)
	{
		super(props);

		// Binding(do not define handlers as arrow functions for performance)
		this.handleUserNameChange		= this.handleUserNameChange.bind(this);
		this.handlePassPhraseChange		= this.handlePassPhraseChange.bind(this);
		this.handleClickShowPassphrase	= this.handleClickShowPassphrase.bind(this);

		// styles
		this.sxClasses					= r3SigninCredDialogStyles(props.theme);
	}

	// [NOTE]
	// Use getDerivedStateFromProps by deprecating componentWillReceiveProps in React 17.x.
	// The only purpose is to set the state data from props when the dialog changes from hidden to visible.
	//
	static getDerivedStateFromProps(nextProps, prevState)
	{
		if(prevState.open != nextProps.open){
			if(nextProps.open){
				// Inivisible to Visible
				return {
					name:			nextProps.name,
					passphrase:		nextProps.passphrase,
					showPassphrase:	nextProps.showPassphrase,
					open:			nextProps.open
				};
			}else{
				// Visible to Inivisible
				return {
					name:			prevState.name,
					passphrase:		prevState.passphrase,
					showPassphrase:	prevState.showPassphrase,
					open:			nextProps.open
				};
			}
		}
		return null;															// Return null to indicate no change to state.
	}

	handleUserNameChange(event)
	{
		this.setState({
			name:		event.target.value
		});
	}

	handlePassPhraseChange(event)
	{
		this.setState({
			passphrase:	event.target.value
		});
	}

	handleClickShowPassphrase()
	{
		this.setState({
			showPassphrase:	!this.state.showPassphrase
		});
	}

	getMessageBox()
	{
		const { theme } = this.props;

		if(!r3IsEmptyString(this.props.message)){
			return (
				<Paper
					{ ...theme.r3SigninCredDialog.messagePaper }
					sx={ this.sxClasses.messagePaper }
				>
					<WarningIcon
						{ ...theme.r3SigninCredDialog.messageIcon }
						sx={ this.sxClasses.messageIcon }
					/>
					<Typography
						{ ...theme.r3SigninCredDialog.message }
						sx={ this.sxClasses.message }
					>
						{ this.props.message }
					</Typography>
				</Paper>
			);
		}
	}

	render()
	{
		const { theme, r3provider } = this.props;

		let	name		= r3IsEmptyString(this.state.name, true) ?			'' : this.state.name.trim();
		let	passphrase	= r3IsEmptyString(this.state.passphrase, true) ?	'' : this.state.passphrase.trim();

		return (
			<Dialog
				open={ this.props.open }
				onClose={ (event, reason) => this.props.onClose(event, reason, false, null, null) }
				{ ...theme.r3SigninCredDialog.root }
				sx={ this.sxClasses.root }
			>
				<DialogTitle
					{ ...theme.r3SigninCredDialog.dialogTitle }
					sx={ this.sxClasses.dialogTitle }
				>
					<Typography
						{ ...theme.r3SigninCredDialog.title }
						sx={ this.sxClasses.title }
					>
						{ r3provider.getR3TextRes().cDirectSignInTitle }
					</Typography>
				</DialogTitle>

				<DialogContent
					sx={ this.sxClasses.dialogContent }
				>
					<DialogContentText
						{ ...theme.r3SigninCredDialog.dialogContentText }
						sx={ this.sxClasses.dialogContentText }
					>
						{ this.getMessageBox() }
					</DialogContentText>

					<TextField
						id={ userNameTextFieldId }
						label={ r3provider.getR3TextRes().tResUserNameTitle }
						value={ name }
						placeholder={ r3provider.getR3TextRes().tResUserNamePlaceHolder }
						onChange={ (event) => this.handleUserNameChange(event) }
						InputProps={{ sx: this.sxClasses.inputTextField }}
						{ ...theme.r3SigninCredDialog.textField }
						sx={ this.sxClasses.textField }
					/>

					<TextField
						id={ passphraseTextFieldId }
						label={ r3provider.getR3TextRes().tResPassphraseTitle }
						value={ passphrase }
						type={ this.state.showPassphrase ? 'text' : 'password' }
						placeholder={ r3provider.getR3TextRes().tResPassphrasePlaceHolder }
						onChange={ (event) => this.handlePassPhraseChange(event) }
						InputProps={{
							endAdornment: (
								<InputAdornment
									{ ...theme.r3SigninCredDialog.inputAdornment }
								>
									<IconButton
										onClick={ this.handleClickShowPassphrase }
										{ ...theme.r3SigninCredDialog.passphraseIconButton }
										size="large"
									>
										{ this.state.showPassphrase ? <VisibilityOffIcon /> : <VisibilityIcon />}
									</IconButton>
								</InputAdornment>
							),
							sx:	this.sxClasses.inputTextField
						}}
						{ ...theme.r3SigninCredDialog.textField }
						sx={ this.sxClasses.textField }
					/>
				</DialogContent>

				<DialogActions>
					<Button
						onClick={ (event) => this.props.onClose(event, null, false, null, null) }
						{ ...theme.r3SigninCredDialog.cancelButton }
						sx={ this.sxClasses.cancelButton }
					>
						{ r3provider.getR3TextRes().tResButtonCancel }
						<CancelIcon
							sx={ this.sxClasses.buttonIcon }
						/>
					</Button>
					<Button
						disabled={ ('' === name) }
						onClick={ (event) => this.props.onClose(event, null, true, this.state.name, this.state.passphrase) }
						{ ...theme.r3SigninCredDialog.signinButton }
						sx={ this.sxClasses.signinButton }
					>
						{ r3provider.getR3TextRes().tResButtonSignin }
						<CheckCircleIcon
							sx={ this.sxClasses.buttonIcon }
						/>
					</Button>
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
