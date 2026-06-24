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
 * CREATE:   Mon Sep 4 2017
 * REVISION:
 *
 */

import React						from 'react';

import TextField					from '@mui/material/TextField';
import Button						from '@mui/material/Button';
import Dialog						from '@mui/material/Dialog';
import DialogTitle					from '@mui/material/DialogTitle';
import DialogContent				from '@mui/material/DialogContent';
import DialogActions				from '@mui/material/DialogActions';
import Typography					from '@mui/material/Typography';
import CheckCircleIcon				from '@mui/icons-material/CheckCircle';
import CancelIcon					from '@mui/icons-material/Cancel';

import R3Provider					from '../util/r3provider';
import type { R3Theme }				from './r3theme';
import { r3CreatePathDialogStyle }	from './r3styles';
import { valTypeAllObject }			from '../util/r3types';
import { r3IsEmptyStringObject, r3IsEmptyString } from '../util/r3util';

//
// Local variables
//
const pathTextFieldId = 'new-path-textfield-id';

//
// Props/State type
//
type R3CreatePathDialogRequiredProps = {
	theme:				R3Theme;
	r3provider:			R3Provider;
	onClose:			(event: {}, reason: string | null, confirmed: boolean, newPath: string | null) => void;
};

type R3CreatePathDialogOptionProps = {
	open?:				boolean;
	tenant?:			{ display?: string; name?: string } | null;
	type?:				string | null;
	parentPath?:		string | null;
	newPath?:			string;
};

type R3CreatePathDialogProps = R3CreatePathDialogRequiredProps & R3CreatePathDialogOptionProps;

type R3CreatePathDialogState = {
	newPath?:			string;
	open?:				boolean;
};

type R3CreatePathDialogStateAll = Required<R3CreatePathDialogState>;

type R3CreatePathDialogStyleType = ReturnType<typeof r3CreatePathDialogStyle>;

//
// Create New Path Dialog Class
//
export default class R3CreatePathDialog extends React.Component<R3CreatePathDialogProps, R3CreatePathDialogState>
{
	sxClasses: R3CreatePathDialogStyleType;

	static defaultProps: R3CreatePathDialogOptionProps = {
		open:		false,
		tenant:		null,
		type:		null,
		parentPath:	null,
		newPath:	''
	};

	state: R3CreatePathDialogStateAll = {
		newPath:	this.props.newPath,
		open:		this.props.open
	};

	constructor(props: R3CreatePathDialogProps)
	{
		super(props);

		// Binding(do not define handlers as arrow functions for performance)
		this.handleNewPathChange	= this.handleNewPathChange.bind(this);

		// styles
		this.sxClasses				= r3CreatePathDialogStyle(props.theme);
	}

	// [NOTE]
	// Use getDerivedStateFromProps by deprecating componentWillReceiveProps in React 17.x.
	// The only purpose is to set the state data from props when the dialog changes from hidden to visible.
	//
	static getDerivedStateFromProps(nextProps: R3CreatePathDialogProps, prevState: R3CreatePathDialogState): R3CreatePathDialogState | null
	{
		if(prevState.open != nextProps.open){
			if(nextProps.open){
				// Inivisible to Visible
				let	newState: R3CreatePathDialogState = {
					newPath:	nextProps.newPath,
					open:		nextProps.open
				};
				return newState;
			}else{
				// Visible to Inivisible
				let	newState: R3CreatePathDialogState = {
					newPath:	prevState.newPath,
					open:		nextProps.open
				};
				return newState;

			}
		}
		return null;															// Return null to indicate no change to state.
	}

	handleNewPathChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void
	{
		let	newState: R3CreatePathDialogState = {
			newPath:	event.target.value
		};
		this.setState(newState);
	}

	render()
	{
		const { theme, r3provider } = this.props;

		let	tenant: string;
		let	tenantClass: valTypeAllObject;
		if(!r3IsEmptyStringObject(this.props.tenant, 'display')){
			tenant		= this.props.tenant.display;
			tenantClass	= this.sxClasses.value;
		}else{
			tenant		= r3provider.getR3TextRes().tResUnselected;
			tenantClass	= this.sxClasses.valueItalic;
		}

		let	type: string;
		let	typeClass: valTypeAllObject;
		if(!r3IsEmptyString(this.props.type)){
			type		= this.props.type;
			typeClass	= this.sxClasses.value;
		}else{
			type		= r3provider.getR3TextRes().tResUnselected;
			typeClass	= this.sxClasses.valueItalic;
		}

		let	parentPath: string;
		let	parentPathClass: valTypeAllObject;
		if(!r3IsEmptyString(this.props.parentPath)){
			parentPath		= this.props.parentPath;
			parentPathClass	= this.sxClasses.value;
		}else{
			parentPath		= r3provider.getR3TextRes().tResUnselected;
			parentPathClass	= this.sxClasses.valueItalic;
		}

		return (
			<Dialog
				open={ this.props.open }
				onClose={ (event, reason) => this.props.onClose(event, reason, false, null) }
				{ ...theme.r3CreatePathDialog.root }
				sx={ this.sxClasses.root }
			>
				<DialogTitle
					{ ...theme.r3CreatePathDialog.dialogTitle }
					sx={ this.sxClasses.dialogTitle }
				>
					<Typography
						{ ...theme.r3CreatePathDialog.title }
						sx={ this.sxClasses.title }
					>
						{ r3provider.getR3TextRes().cCreateNewPathTitle }
					</Typography>
				</DialogTitle>

				<DialogContent
					sx={ this.sxClasses.dialogContent }
				>
					<Typography
						{ ...theme.r3CreatePathDialog.keyTitle }
						sx={ this.sxClasses.keyTitle }
					>
						{ r3provider.getR3TextRes().tResTenantSubTitle }
					</Typography>
					<Typography
						{ ...theme.r3CreatePathDialog.value }
						sx={ tenantClass }
					>
						{ tenant }
					</Typography>

					<Typography
						{ ...theme.r3CreatePathDialog.keyTitle }
						sx={ this.sxClasses.keyTitle }
					>
						{ r3provider.getR3TextRes().tResTypeSubTitle }
					</Typography>
					<Typography
						{ ...theme.r3CreatePathDialog.value }
						sx={ typeClass }
					>
						{ type }
					</Typography>

					<Typography
						{ ...theme.r3CreatePathDialog.keyTitle }
						sx={ this.sxClasses.keyTitle }
					>
						{ r3provider.getR3TextRes().tResParentPathSubTitle }
					</Typography>
					<Typography
						{ ...theme.r3CreatePathDialog.value }
						sx={ parentPathClass }
					>
						{ parentPath }
					</Typography>

					<Typography
						{ ...theme.r3CreatePathDialog.keyTitle }
						sx={ this.sxClasses.keyTitle }
					>
						{ r3provider.getR3TextRes().tResCreatePathSubTitle }
					</Typography>
					<TextField
						id={ pathTextFieldId }
						value={ this.state.newPath }
						placeholder={ r3provider.getR3TextRes().tResCreatePathHint }
						onChange={ (event) => this.handleNewPathChange(event) }
						slotProps ={{ input: { sx: this.sxClasses.inputTextField } }}
						{ ...theme.r3CreatePathDialog.textField }
						sx={ this.sxClasses.textField }
					/>
				</DialogContent>

				<DialogActions>
					<Button
						onClick={ (event) => this.props.onClose(event, null, false, null) }
						{ ...theme.r3CreatePathDialog.cancelButton }
						sx={ this.sxClasses.cancelButton }
					>
						{ r3provider.getR3TextRes().tResButtonCancel }
						<CancelIcon
							sx={ this.sxClasses.buttonIcon }
						/>
					</Button>
					<Button
						disabled={ r3IsEmptyString(this.state.newPath, true) }
						onClick={ (event) => this.props.onClose(event, null, true, this.state.newPath) }
						{ ...theme.r3CreatePathDialog.okButton }
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
