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

import { withTheme, withStyles }	from '@material-ui/core/styles';		// decorator
import TextField					from '@material-ui/core/TextField';
import Button						from '@material-ui/core/Button';
import IconButton					from '@material-ui/core/IconButton';
import Dialog						from '@material-ui/core/Dialog';
import DialogTitle					from '@material-ui/core/DialogTitle';
import DialogContent				from '@material-ui/core/DialogContent';
import DialogContentText			from '@material-ui/core/DialogContentText';
import DialogActions				from '@material-ui/core/DialogActions';
import InputAdornment				from '@material-ui/core/InputAdornment';
import Typography					from '@material-ui/core/Typography';
import Paper						from '@material-ui/core/Paper';
import VisibilityIcon				from '@material-ui/icons/Visibility';
import VisibilityOffIcon			from '@material-ui/icons/VisibilityOff';
import CheckCircleIcon				from '@material-ui/icons/CheckCircle';
import CancelIcon					from '@material-ui/icons/Cancel';
import WarningIcon					from '@material-ui/icons/WarningRounded';

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
@withTheme
@withStyles(r3SigninCredDialogStyles)
export default class R3SigninCredDialog extends React.Component
{
	static contextTypes = {
		r3Context:		PropTypes.object.isRequired
	};

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
		const { theme, classes } = this.props;

		if(!r3IsEmptyString(this.props.message)){
			return (
				<Paper
					{ ...theme.r3SigninCredDialog.messagePaper }
					className={ classes.messagePaper }
				>
					<WarningIcon
						{ ...theme.r3SigninCredDialog.messageIcon }
						className={ classes.messageIcon }
					/>
					<Typography
						{ ...theme.r3SigninCredDialog.message }
						className={ classes.message }
					>
						{ this.props.message }
					</Typography>
				</Paper>
			);
		}
	}

	render()
	{
		const { theme, classes, r3provider } = this.props;

		let	name		= r3IsEmptyString(this.state.name, true) ?			'' : this.state.name.trim();
		let	passphrase	= r3IsEmptyString(this.state.passphrase, true) ?	'' : this.state.passphrase.trim();

		return (
			<Dialog
				open={ this.props.open }
				onClose={ (event, reson) => this.props.onClose(event, reson, false, null) }
				{ ...theme.r3SigninCredDialog.root }
				className={ classes.root }
			>
				<DialogTitle
					{ ...theme.r3SigninCredDialog.dialogTitle }
					className={ classes.dialogTitle }
				>
					<Typography
						{ ...theme.r3SigninCredDialog.title }
						className={ classes.title }
					>
						{ r3provider.getR3TextRes().cDirectSignInTitle }
					</Typography>
				</DialogTitle>

				<DialogContent
					className={ classes.dialogContent }
				>
					<DialogContentText
						{ ...theme.r3SigninCredDialog.dialogContentText }
						className={ classes.dialogContentText }
					>
						{ this.getMessageBox() }
					</DialogContentText>

					<TextField
						id={ userNameTextFieldId }
						label={ r3provider.getR3TextRes().tResUserNameTitle }
						value={ name }
						placeholder={ r3provider.getR3TextRes().tResUserNamePlaceHolder }
						onChange={ (event) => this.handleUserNameChange(event) }
						InputProps={{ className: classes.inputTextField }}
						{ ...theme.r3SigninCredDialog.textField }
						className={ classes.textField }
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
									>
										{ this.state.showPassphrase ? <VisibilityOffIcon /> : <VisibilityIcon />}
									</IconButton>
								</InputAdornment>
							),
							className:	classes.inputTextField
						}}
						{ ...theme.r3SigninCredDialog.textField }
						className={ classes.textField }
					/>
				</DialogContent>

				<DialogActions>
					<Button
						onClick={ (event) => this.props.onClose(event, false, null, null) }
						{ ...theme.r3SigninCredDialog.cancelButton }
						className={ classes.cancelButton }
					>
						{ r3provider.getR3TextRes().tResButtonCancel }
						<CancelIcon
							className={ classes.buttonIcon }
						/>
					</Button>
					<Button
						disabled={ ('' === name) }
						onClick={ (event) => this.props.onClose(event, true, this.state.name, this.state.passphrase) }
						{ ...theme.r3SigninCredDialog.signinButton }
						className={ classes.signinButton }
					>
						{ r3provider.getR3TextRes().tResButtonSignin }
						<CheckCircleIcon
							className={ classes.buttonIcon }
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
