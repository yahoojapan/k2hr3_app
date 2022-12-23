/*
 *
 * K2HR3 Web Application
 *
 * Copyright 2017 Yahoo Japan Corporation.
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
 * CREATE:   Fri Sep 24 2021
 * REVISION:
 *
 */

import React						from 'react';
import ReactDOM						from 'react-dom';						// eslint-disable-line no-unused-vars
import PropTypes					from 'prop-types';

import Button						from '@mui/material/Button';
import Dialog						from '@mui/material/Dialog';
import DialogTitle					from '@mui/material/DialogTitle';
import DialogContent				from '@mui/material/DialogContent';
import DialogActions				from '@mui/material/DialogActions';
import Typography					from '@mui/material/Typography';
import Tooltip						from '@mui/material/Tooltip';
import TextField					from '@mui/material/TextField';
import CheckCircleIcon				from '@mui/icons-material/CheckCircle';
import CopyClipBoardIcon			from '@mui/icons-material/AssignmentTurnedInRounded';

import { r3AccountDialog }			from './r3styles';
import { r3IsEmptyString, r3IsEmptyEntityObject, r3IsSafeTypedEntity } from '../util/r3util';

const unscopedtokenFieldName	= 'unscopedtoken-textfield';

//
// Create New Path Dialog Class
//
export default class R3AccountDialog extends React.Component
{
	static propTypes = {
		r3provider:		PropTypes.object.isRequired,
		open:			PropTypes.bool,
		username:		PropTypes.string,
		unscopedtoken:	PropTypes.string,
		onClose:		PropTypes.func.isRequired
	};

	static defaultProps = {
		open:			false,
		username:		null,
		unscopedtoken:	null
	};

	unscopedtokenInputElement = null;												// unscopedtoken textfield for registration code.

	state = {
		open:		this.props.open,
		tooltips: {
			copyClipboardButtonTooltip:		false
		}
	};

	constructor(props)
	{
		super(props);

		this.handleCopyClipboard = this.handleCopyClipboard.bind(this);

		// styles
		this.sxClasses = r3AccountDialog(props.theme);
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
					open:	nextProps.open
				};
			}else{
				// Visible to Inivisible
				return {
					open:	nextProps.open
				};
			}
		}
		return null;														// Return null to indicate no change to state.
	}

	handleCopyClipboardButtonTooltipChange = (event, isOpen) =>				// eslint-disable-line no-unused-vars
	{
		this.setState({
			tooltips: {
				copyClipboardButtonTooltip:	isOpen
			}
		});
	};

	handleCopyClipboard(event)												// eslint-disable-line no-unused-vars
	{
		if(r3IsEmptyEntityObject(this.unscopedtokenInputElement, 'select') || !r3IsSafeTypedEntity(this.unscopedtokenInputElement.select, 'function')){
			return;
		}
		this.unscopedtokenInputElement.select();	// select all text in text field
		document.execCommand('copy');				// cpoy to clipboard
		window.getSelection().removeAllRanges();	// unselect text
		this.unscopedtokenInputElement.blur();		// off furcus

		this.setState({
			tooltips: {
				copyClipboardButtonTooltip:	false
			}
		});
	}

	render()
	{
		const { theme, r3provider } = this.props;

		let	username;
		let	usernameClass;
		if(!r3IsEmptyString(this.props.username)){
			username		= this.props.username;
			usernameClass	= this.sxClasses.value;
		}else{
			username		= r3provider.getR3TextRes().tResUnknownUsernameLabel;
			usernameClass	= this.sxClasses.valueItalic;
		}

		let	unscopedtoken;
		if(!r3IsEmptyString(this.props.unscopedtoken)){
			unscopedtoken	= this.props.unscopedtoken;
		}else{
			unscopedtoken	= r3provider.getR3TextRes().tResNoUnscopedTokenLabel;
		}

		return (
			<Dialog
				open={ this.props.open }
				onClose={ (event, reason) => this.props.onClose(event, reason) }
				{ ...theme.r3AccountDialog.root }
				sx={ this.sxClasses.root }
			>
				<DialogTitle
					{ ...theme.r3AccountDialog.dialogTitle }
					sx={ this.sxClasses.dialogTitle }
				>
					<Typography
						{ ...theme.r3AccountDialog.title }
						sx={ this.sxClasses.title }
					>
						{ r3provider.getR3TextRes().cAccountTitle }
					</Typography>
				</DialogTitle>

				<DialogContent
					sx={ this.sxClasses.dialogContent }
				>
					<Typography
						{ ...theme.r3AccountDialog.subTitle }
						sx={ this.sxClasses.subTitle }
					>
						{ r3provider.getR3TextRes().tResAccoutUsernameTitle }
					</Typography>
					<Typography
						{ ...theme.r3AccountDialog.value }
						sx={ usernameClass }
					>
						{ username }
					</Typography>
					<Typography
						{ ...theme.r3AccountDialog.subTitle }
						sx={ this.sxClasses.subTitle }
					>
						{ r3provider.getR3TextRes().tResUnscopedTokenTitle }
					</Typography>
					<TextField
						name={ unscopedtokenFieldName }
						value={ unscopedtoken }
						inputRef = { (element) => { this.unscopedtokenInputElement = element; } } 
						InputProps={{ sx: this.sxClasses.unscopedtokenInputTextField }}
						inputProps={{ style: { padding: 0 } }}
						{ ...theme.r3AccountDialog.unscopedtokenTextField }
						sx={ this.sxClasses.unscopedtokenTextField }
					/>
					<Tooltip
						title={ r3provider.getR3TextRes().tResCopyClipboardTT }
						open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.copyClipboardButtonTooltip, 'boolean')) ? false : this.state.tooltips.copyClipboardButtonTooltip) }
					>
						<Button
							onClick={ this.handleCopyClipboard }
							onMouseEnter={ event => this.handleCopyClipboardButtonTooltipChange(event, true) }
							onMouseLeave={ event => this.handleCopyClipboardButtonTooltipChange(event, false) }
							{ ...theme.r3AccountDialog.copyClipboardButton }
							sx={ this.sxClasses.copyClipboardButton }
						>
							<CopyClipBoardIcon
								sx={ this.sxClasses.copyClipboardIcon }
							/>
							{ r3provider.getR3TextRes().tResCopyClipboardButton }
						</Button>
					</Tooltip>
				</DialogContent>
				<DialogActions>
					<Button
						disabled={ false }
						onClick={ (event) => this.props.onClose(event, null) }
						{ ...theme.r3AccountDialog.okButton }
						sx={ this.sxClasses.okButton }
					>
						{ r3provider.getR3TextRes().tResButtonOk }
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
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * End:
 * vim600: noexpandtab sw=4 ts=4 fdm=marker
 * vim<600: noexpandtab sw=4 ts=4
 */
