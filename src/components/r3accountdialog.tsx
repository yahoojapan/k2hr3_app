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

import R3Provider					from '../util/r3provider';
import type { R3Theme }				from './r3theme';
import { r3AccountDialogStyles }	from './r3styles';
import { valTypeAllObject }			from '../util/r3types';
import { r3IsEmptyString, r3IsEmptyEntityObject, r3IsBoolean, r3IsFunction } from '../util/r3util';

const unscopedtokenFieldName	= 'unscopedtoken-textfield';

//
// Props/State type
//
type R3AccountDialogRequiredProps = {
	theme:				R3Theme;
	r3provider:			R3Provider;
	onClose:			(event: {}, reason: string | null) => void;
};

type R3AccountDialogOptionProps = {
	open?:				boolean;
	username?:			string | null;
	unscopedtoken?:		string | null;
};

type R3AccountDialogProps = R3AccountDialogRequiredProps & R3AccountDialogOptionProps;

type R3AccountDialogTooltips = {
	copyClipboardButtonTooltip?:	boolean;
};

type R3AccountDialogState = {
	open?:				boolean;
	tooltips?: 			R3AccountDialogTooltips;
};

type R3AccountDialogStateAll = Required<R3AccountDialogState>;

type R3AccountDialogStylesType = ReturnType<typeof r3AccountDialogStyles>;

//
// Create New Path Dialog Class
//
export default class R3AccountDialog extends React.Component<R3AccountDialogProps, R3AccountDialogState>
{
	sxClasses: R3AccountDialogStylesType;

	unscopedtokenInputElement: HTMLInputElement | null = null;						// unscopedtoken textfield for registration code.

	static defaultProps: R3AccountDialogOptionProps = {
		open:			false,
		username:		null,
		unscopedtoken:	null
	};

	state: R3AccountDialogStateAll = {
		open:		this.props.open,
		tooltips: {
			copyClipboardButtonTooltip:		false
		}
	};

	constructor(props: R3AccountDialogProps)
	{
		super(props);

		this.handleCopyClipboard = this.handleCopyClipboard.bind(this);

		// styles
		this.sxClasses = r3AccountDialogStyles(props.theme);
	}

	// [NOTE]
	// Use getDerivedStateFromProps by deprecating componentWillReceiveProps in React 17.x.
	// The only purpose is to set the state data from props when the dialog changes from hidden to visible.
	//
	static getDerivedStateFromProps(nextProps: R3AccountDialogProps, prevState: R3AccountDialogState): R3AccountDialogState | null
	{
		if(prevState.open != nextProps.open){
			if(nextProps.open){
				// Inivisible to Visible
				let	newState: R3AccountDialogState = {
					open:	nextProps.open
				};
				return newState;
			}else{
				// Visible to Inivisible
				let	newState: R3AccountDialogState = {
					open:	nextProps.open
				};
				return newState;
			}
		}
		return null;														// Return null to indicate no change to state.
	}

	handleCopyClipboardButtonTooltipChange = (_event: React.MouseEvent<HTMLElement>, isOpen: boolean) =>
	{
		let	newState: R3AccountDialogState = {
			tooltips: {
				copyClipboardButtonTooltip:	isOpen
			}
		};
		this.setState(newState);
	};

	handleCopyClipboard(_event: React.MouseEvent<HTMLElement>): void
	{
		if(r3IsEmptyEntityObject(this.unscopedtokenInputElement, 'select') || !r3IsFunction(this.unscopedtokenInputElement.select)){
			return;
		}
		this.unscopedtokenInputElement.select();	// select all text in text field
		document.execCommand('copy');				// cpoy to clipboard
		window.getSelection().removeAllRanges();	// unselect text
		this.unscopedtokenInputElement.blur();		// off furcus

		let	newState: R3AccountDialogState = {
			tooltips: {
				copyClipboardButtonTooltip:	false
			}
		};
		this.setState(newState);
	}

	render()
	{
		const { theme, r3provider } = this.props;

		let	username: string;
		let	usernameClass: valTypeAllObject;
		if(!r3IsEmptyString(this.props.username)){
			username		= this.props.username;
			usernameClass	= this.sxClasses.value;
		}else{
			username		= r3provider.getR3TextRes().tResUnknownUsernameLabel;
			usernameClass	= this.sxClasses.valueItalic;
		}

		let	unscopedtoken: string;
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
						slotProps ={{
							input: {		sx: this.sxClasses.unscopedtokenInputTextField	},
							htmlInput: {	style: { padding: 0 }							}
						}}
						{ ...theme.r3AccountDialog.unscopedtokenTextField }
						sx={ this.sxClasses.unscopedtokenTextField }
					/>
					<Tooltip
						title={ r3provider.getR3TextRes().tResCopyClipboardTT }
						open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsBoolean(this.state.tooltips.copyClipboardButtonTooltip)) ? false : this.state.tooltips.copyClipboardButtonTooltip) }
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
