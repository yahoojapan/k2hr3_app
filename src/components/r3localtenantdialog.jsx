/*
 *
 * K2HR3 Web Application
 *
 * Copyright 2023 Yahoo Japan Corporation.
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
 * CREATE:   Fri Jul 14 2017
 * REVISION:
 *
 */

import React						from 'react';
import ReactDOM						from 'react-dom';						// eslint-disable-line no-unused-vars
import PropTypes					from 'prop-types';

import TextField					from '@mui/material/TextField';
import Button						from '@mui/material/Button';
import Dialog						from '@mui/material/Dialog';
import DialogTitle					from '@mui/material/DialogTitle';
import DialogContent				from '@mui/material/DialogContent';
import DialogActions				from '@mui/material/DialogActions';
import Typography					from '@mui/material/Typography';
import IconButton					from '@mui/material/IconButton';
import Tooltip						from '@mui/material/Tooltip';
import Box							from '@mui/material/Box';
import Popover						from '@mui/material/Popover';
import TablePagination				from '@mui/material/TablePagination';

import CheckCircleIcon				from '@mui/icons-material/CheckCircle';
import CancelIcon					from '@mui/icons-material/Cancel';
import AddIcon						from '@mui/icons-material/AddRounded';
import EditIcon						from '@mui/icons-material/Edit';
import DeleteIcon					from '@mui/icons-material/Delete';

import R3PopupMsgDialog				from './r3popupmsgdialog';
import R3Message					from '../util/r3message';
import { warningType }				from '../util/r3types';

import { r3LocalTenantDialog }		from './r3styles';
import { regTenantUserName, localTenantPrefix } from '../util/r3define';
import { r3DeepClone, r3IsEmptyString, r3IsEmptyEntityObject, r3IsSafeTypedEntity, r3ArrayHasValue, r3CompareString, r3DeepCompare } from '../util/r3util';

//
// Local variables
//
const componentKeyIds = {
	tenantNameTextFieldId:		'tenant-new-name-textfield-id',
	displayTextFieldId:			'tenant-display-name-textfield-id',
	descriptionTextFieldId:		'tenant-description-textfield-id',
	tenantUserAddTextFieldId:	'tenant-user-add-textfield-id'
};

const tooltipValues = {
	usersEditButtonTooltip:		'usersEditButtonTooltip',
	userAddButtonTooltip:		'userAddButtonTooltip',
	usersDeleteButtonTooltip:	'usersDeleteButtonTooltip'
};

const disableAllToolTip = {
	usersEditButtonTooltip:		false,
	userAddButtonTooltip:		false,
	usersDeleteButtonTooltip:	-1
};

//
// Create Local Tenant Dialog Class
//
export default class R3LocalTenantDialog extends React.Component
{
	static propTypes = {
		r3provider:			PropTypes.object.isRequired,
		open:				PropTypes.bool,
		createMode:			PropTypes.bool.isRequired,					// Create mode
		userName:			PropTypes.string,
		allTenantNames:		PropTypes.array,
		tenantName:			PropTypes.string,
		tenantId:			PropTypes.string,
		tenantDisplay:		PropTypes.string,
		tenantDescription:	PropTypes.string,
		tenantUsers:		PropTypes.array,
		tenantUserListRow:	PropTypes.number,

		onClose:			PropTypes.func.isRequired
	};

	static defaultProps = {
		open:				false,
		createMode:			false,
		userName:			'',
		allTenantNames:		[],
		tenantName:			'',
		tenantId:			'',
		tenantDisplay:		'',
		tenantDescription:	'',
		tenantUsers:		[],
		tenantUserListRow:	5
	};

	state = {
		open:							this.props.open,

		// main
		tenantName:						(this.props.createMode ? '' : this.props.tenantName),
		tenantDisplay:					(this.props.createMode ? '' : this.props.tenantDisplay),
		tenantDescription:				(this.props.createMode ? '' : this.props.tenantDescription),
		tenantUsers:					(this.props.createMode ? [] : r3IsSafeTypedEntity(this.props.tenantUsers, 'array') ? [] : r3DeepClone(this.props.tenantUsers).sort()),
		tenantNameMessage:				null,
		confirmMessage:					null,

		// popover
		popoverTenantUserAddAnchorEl:	null,
		popoverTenantUserAddValue:		null,
		popoverTenantUsersEditAnchorEl:	null,
		popoverTenantUsers:				[],
		popoverTenantUsersPageNum:		0,
		popoverComfirmMessage:			null,

		// tooltips
		tooltips: 						disableAllToolTip
	};

	constructor(props)
	{
		super(props);

		// Binding(do not define handlers as arrow functions for performance)
		this.handleTenantNameChange			= this.handleTenantNameChange.bind(this);
		this.handleDisplayChange			= this.handleDisplayChange.bind(this);
		this.handleDescriptionChange		= this.handleDescriptionChange.bind(this);
		this.handleTenantUsersEditButton	= this.handleTenantUsersEditButton.bind(this);
		this.handleTenantUserAddButton		= this.handleTenantUserAddButton.bind(this);

		this.handleChangeTenantUserAdd		= this.handleChangeTenantUserAdd.bind(this);
		this.handleConfirmTenantUserAdd		= this.handleConfirmTenantUserAdd.bind(this);
		this.handleCancelTenantUserAdd		= this.handleCancelTenantUserAdd.bind(this);

		this.handleDeleteTenantUsersEdit	= this.handleDeleteTenantUsersEdit.bind(this);
		this.handleChangeRowTenantUsersEdit	= this.handleChangeRowTenantUsersEdit.bind(this);
		this.handleConfirmTenantUsersEdit	= this.handleConfirmTenantUsersEdit.bind(this);
		this.handleCancelTenantUsersEdit	= this.handleCancelTenantUsersEdit.bind(this);

		this.handConfirmMessageClose		= this.handConfirmMessageClose.bind(this);
		this.handleDialogCloseButton		= this.handleDialogCloseButton.bind(this);

		// styles
		this.sxClasses						= r3LocalTenantDialog(props.theme);
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
					open:							nextProps.open,

					tenantName:						nextProps.tenantName,
					tenantDisplay:					nextProps.tenantDisplay,
					tenantDescription:				nextProps.tenantDescription,
					tenantUsers:					r3DeepClone(nextProps.tenantUsers).sort(),
					tenantNameMessage:				null,
					confirmMessage:					null,

					popoverTenantUserAddAnchorEl:	null,
					popoverTenantUserAddValue:		null,
					popoverTenantUsersEditAnchorEl:	null,
					popoverTenantUsers:				[],
					popoverTenantUsersPageNum:		0,
					popoverComfirmMessage:			null,

					tooltips: 						disableAllToolTip
				};
			}else{
				// Visible to Inivisible
				return {
					open:							nextProps.open,

					tenantName:						prevState.tenantName,
					tenantDisplay:					prevState.tenantDisplay,
					tenantDescription:				prevState.tenantDescription,
					tenantUsers:					r3DeepClone(prevState.tenantUsers).sort(),
					tenantNameMessage:				null,
					confirmMessage:					null,

					popoverTenantUserAddAnchorEl:	null,
					popoverTenantUserAddValue:		null,
					popoverTenantUsersEditAnchorEl:	null,
					popoverTenantUsers:				[],
					popoverTenantUsersPageNum:		0,
					popoverComfirmMessage:			null,

					tooltips: 						disableAllToolTip
				};
			}
		}
		return null;														// Return null to indicate no change to state.
	}

	//
	// Handle Popup Message Close ( OK / Cancel )
	//
	handConfirmMessageClose(event, reason, result)							// eslint-disable-line no-unused-vars
	{
		if(result){
			// continue
			this.props.onClose(event, null, true, this.state.tenantName, this.props.tenantId, this.state.tenantDisplay, this.state.tenantDescription, this.state.tenantUsers);
		}else{
			// cancel
			this.setState({
				confirmMessage:		null
			});
		}
	}

	//
	// Handle Dialog Close ( OK / Cancel )
	//
	handleDialogCloseButton(event)											// eslint-disable-line no-unused-vars
	{
		const { r3provider } = this.props;

		let	r3messageobj = null;
		if(!this.props.createMode){
			if(!r3IsSafeTypedEntity(this.state.tenantUsers, 'array') || 0 === this.state.tenantUsers.length){
				// no user
				r3messageobj = new R3Message(r3provider.getR3TextRes().wStaticResTenantDeleting, warningType);
			}else if(!r3ArrayHasValue(this.state.tenantUsers, this.props.userName)){
				// no self
				r3messageobj = new R3Message(r3provider.getR3TextRes().wStaticResTenantNotAccess, warningType);
			}
		}

		if(r3messageobj){
			this.setState({
				confirmMessage:		r3messageobj
			});
		}else{
			this.props.onClose(event, null, true, this.state.tenantName, this.props.tenantId, this.state.tenantDisplay, this.state.tenantDescription, this.state.tenantUsers);
		}
	}

	//
	// Handle Tenant Name Change
	//
	handleTenantNameChange(event)
	{
		const { r3provider } = this.props;

		// check
		let newTenantName;
		if(0 !== event.target.value.indexOf(localTenantPrefix)){
			newTenantName = localTenantPrefix + event.target.value;
		}else{
			newTenantName = event.target.value;
		}
		let	message = null;
		if(r3ArrayHasValue(this.props.allTenantNames, newTenantName)){
			message = r3provider.getR3TextRes().eLocalTenantNameSame;
		}

		this.setState({
			tenantName:			event.target.value,
			tenantNameMessage:	message
		});
	}

	//
	// Handle Display Name Change
	//
	handleDisplayChange(event)
	{
		this.setState({
			tenantDisplay:	event.target.value
		});
	}

	//
	// Handle Description Change
	//
	handleDescriptionChange(event)
	{
		this.setState({
			tenantDescription:	event.target.value
		});
	}

	//
	// Handle Tooltip Change
	//
	handTooltipChange = (event, type, extData) =>							// eslint-disable-line no-unused-vars
	{
		if(tooltipValues.usersEditButtonTooltip === type){
			this.setState({
				tooltips: {
					usersEditButtonTooltip:		extData
				}
			});
		}else if(tooltipValues.userAddButtonTooltip === type){
			this.setState({
				tooltips: {
					userAddButtonTooltip:		extData
				}
			});
		}else if(tooltipValues.usersDeleteButtonTooltip === type){
			this.setState({
				tooltips: {
					usersDeleteButtonTooltip:	extData
				}
			});
		}
	};

	//----------------------------------------------------------
	// Common Utilities
	//----------------------------------------------------------
	checkTenantNameConflict(tenantName)
	{
		// check
		let checkTenantName;
		if(0 !== tenantName.indexOf(localTenantPrefix)){
			checkTenantName = localTenantPrefix + tenantName;
		}else{
			checkTenantName = tenantName;
		}
		return r3ArrayHasValue(this.props.allTenantNames, checkTenantName);
	}

	//----------------------------------------------------------
	// [Popover] Edit Tenant User
	//----------------------------------------------------------
	handleTenantUsersEditButton(event)
	{
		this.setState({
			popoverTenantUsersEditAnchorEl:	event.currentTarget,
			popoverTenantUsers:				(!r3IsSafeTypedEntity(this.state.tenantUsers, 'array') ? [] : r3DeepClone(this.state.tenantUsers).sort()),
			popoverTenantUsersPageNum:		0,
			popoverComfirmMessage:			null,
			tooltips: 						disableAllToolTip
		});
	}

	//
	// Edit Tenant User : Delete
	//
	handleDeleteTenantUsersEdit(event, pos)
	{
		const { r3provider } = this.props;

		let	confirmMessage		= null;
		let	newTenantUserList	= r3DeepClone(this.state.popoverTenantUsers);

		// check
		if(newTenantUserList[pos] == this.props.userName){
			confirmMessage = r3provider.getR3TextRes().eLocalTenantUserDelOwn;
		}else if(0 == newTenantUserList.length){
			confirmMessage = r3provider.getR3TextRes().eLocalTenantNoUser;
		}

		// Delete user
		newTenantUserList.splice(pos, 1);
		newTenantUserList.sort();

		this.setState({
			popoverTenantUsers:		newTenantUserList,
			popoverComfirmMessage:	confirmMessage,
			tooltips: 				disableAllToolTip
		});
	}

	//
	// Edit Tenant User : Delete
	//
	handleChangeRowTenantUsersEdit(event, page)								// eslint-disable-line no-unused-vars
	{
		this.setState({
			popoverTenantUsersPageNum:	page,
			popoverComfirmMessage:		null,
			tooltips: 					disableAllToolTip
		});
	}

	//
	// Edit Tenant User : Confirm
	//
	handleConfirmTenantUsersEdit(event)										// eslint-disable-line no-unused-vars
	{
		// update state
		let	newTenantUsers = r3DeepClone(this.state.popoverTenantUsers).sort();

		this.setState({
			tenantUsers:					newTenantUsers,
			popoverTenantUsersEditAnchorEl:	null,
			popoverTenantUsers:				[],
			popoverTenantUsersPageNum:		0,
			popoverComfirmMessage:			null
		});
	}

	//
	// Edit Tenant User : Cancel
	//
	handleCancelTenantUsersEdit(event)											// eslint-disable-line no-unused-vars
	{
		this.setState({
			popoverTenantUsersEditAnchorEl:	null,
			popoverTenantUsers:				[],
			popoverTenantUsersPageNum:		0,
			popoverComfirmMessage:			null,
			tooltips: 						disableAllToolTip
		});
	}

	//
	// Edit Tenant User : Create user name item
	//
	getPopoverTenantUserListItem(pos, userNameItem)
	{
		const { theme, r3provider } = this.props;

		let	userNameStyle;
		if(userNameItem == this.props.userName){
			userNameStyle = this.sxClasses.popoverTenantUserOwnName;
		}else{
			userNameStyle = this.sxClasses.popoverTenantUserName;
		}

		let	deleteUserBtn;
		if(!this.props.createMode || userNameItem != this.props.userName){
			deleteUserBtn = (
				<Tooltip
					title={ r3provider.getR3TextRes().tResTenantUserDeleteTT }
					open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.usersDeleteButtonTooltip, 'number') || (this.state.tooltips.usersDeleteButtonTooltip != pos)) ? false : true) }
				>
					<Button
						onClick={ (event) => this.handleDeleteTenantUsersEdit(event, pos) }
						onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.usersDeleteButtonTooltip, pos) }
						onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.usersDeleteButtonTooltip, -1) }
						{ ...theme.r3LocalTenantDialog.popoverTenantUserDeleteButton }
						sx={ this.sxClasses.popoverTenantUserDeleteButton }
					>
						<DeleteIcon />
					</Button>
				</Tooltip>
			);
		}

		return(
			<Box
				key={ pos }
				sx={ this.sxClasses.popoverTenantUserItemBox }
			>
				<Typography
					{ ...theme.r3LocalTenantDialog.popoverTenantUserName }
					sx={ userNameStyle }
				>
					{ userNameItem }
				</Typography>
				{ deleteUserBtn }
			</Box>
		);
	}

	//
	// Edit Tenant User : Create user name list
	//
	getPopoverTenantUserList()
	{
		let	tenantUsers	= this.state.popoverTenantUsers;
		let	pageNum		= this.state.popoverTenantUsersPageNum;

		return(
			<Box>
				{ tenantUsers.map( (item, pos) => {
					if(pos < (pageNum * this.props.tenantUserListRow) || ((pageNum + 1) * this.props.tenantUserListRow) <= pos){
						return;
					}
					return this.getPopoverTenantUserListItem(pos, item);
				})}
			</Box>
		);
	}

	//
	// Edit Tenant User : Create contens
	//
	getPopoverTenantUsersEdit()
	{
		const { theme, r3provider } = this.props;

		let	message;
		if(null != this.state.popoverComfirmMessage){
			message = (
				<Typography
					{ ...theme.r3LocalTenantDialog.popoverMessage }
					sx={ this.sxClasses.popoverMessage }
				>
					{ this.state.popoverComfirmMessage }
				</Typography>
			);
		}

		let	tenantUserItems = this.getPopoverTenantUserList();

		return (
			<Popover
				open={ Boolean(this.state.popoverTenantUsersEditAnchorEl) }
				anchorEl={ this.state.popoverTenantUsersEditAnchorEl }
				onClose={ this.handleCancelTenantUsersEdit }
				{ ...theme.r3LocalTenantDialog.popoverTenantUsersEdit }
				sx={ this.sxClasses.popoverTenantUsersEdit }
			>
				<Typography
					{ ...theme.r3LocalTenantDialog.popoverTenantUsersEditTitle }
					sx={ this.sxClasses.popoverTenantUsersEditTitle }
				>
					{ r3provider.getR3TextRes().tResTenantUsersEditTitle }
				</Typography>
				{ message }
				{ tenantUserItems }
				<TablePagination
					component={ 'div' }
					count={ this.state.popoverTenantUsers.length }
					rowsPerPage={ this.props.tenantUserListRow }
					page={ this.state.popoverTenantUsersPageNum }
					rowsPerPageOptions={ [] }
					onPageChange={ this.handleChangeRowTenantUsersEdit }
				/>
				<Button
					disabled={ r3DeepCompare(this.state.tenantUsers, this.state.popoverTenantUsers) }
					onClick={ this.handleConfirmTenantUsersEdit }

					{ ...theme.r3LocalTenantDialog.popoverTenantUsersEditButton }
					sx={ this.sxClasses.popoverTenantUsersEditButton }
				>
					{ r3provider.getR3TextRes().tResTenantUsersEditBtn }
					<CheckCircleIcon
						sx={ this.sxClasses.buttonIcon }
					/>
				</Button>
			</Popover>
		);
	}

	//----------------------------------------------------------
	// [Popover] Add Tenant User
	//----------------------------------------------------------
	handleTenantUserAddButton(event)
	{
		this.setState({
			popoverTenantUserAddAnchorEl:	event.currentTarget,
			popoverTenantUserAddValue:		null,
			popoverComfirmMessage:			null,
			tooltips: 						disableAllToolTip
		});
	}

	//
	// Add Tenant User : Change
	//
	handleChangeTenantUserAdd(event)
	{
		this.setState({
			popoverTenantUserAddValue:	event.target.value,
			popoverComfirmMessage:		null
		});
	}

	//
	// Add Tenant User : Confirm
	//
	handleConfirmTenantUserAdd(event)										// eslint-disable-line no-unused-vars
	{
		const { r3provider } = this.props;

		// check
		let	regUserName		= new RegExp(regTenantUserName);
		let	newUser			= this.state.popoverTenantUserAddValue.trim();
		let	confirmMessage	= null;

		if(r3IsEmptyString(newUser, true)){
			// empty
			confirmMessage = r3provider.getR3TextRes().eLocalTenantUserEmpty;
		}else if(null === newUser.match(regUserName)){
			// invalid values
			confirmMessage = r3provider.getR3TextRes().eLocalTenantUserWrong;
		}else if(r3ArrayHasValue(this.state.tenantUsers, newUser)){
			// found same user name
			confirmMessage = r3provider.getR3TextRes().eLocalTenantUserSame;
		}

		// update state
		if(null != confirmMessage){
			// something error
			this.setState({
				popoverComfirmMessage:			confirmMessage
			});
		}else{
			// update state
			let	newTenantUsers = r3DeepClone(this.state.tenantUsers);
			newTenantUsers.push(newUser);
			newTenantUsers.sort();

			this.setState({
				tenantUsers:					newTenantUsers,
				popoverTenantUserAddAnchorEl:	null,
				popoverTenantUserAddValue:		null,
				popoverComfirmMessage:			null
			});
		}
	}

	//
	// Add Tenant User : Cancel
	//
	handleCancelTenantUserAdd(event)											// eslint-disable-line no-unused-vars
	{
		this.setState({
			popoverTenantUserAddAnchorEl:	null,
			popoverTenantUserAddValue:		null,
			popoverComfirmMessage:			null
		});
	}

	//
	// Add Tenant User : Create contens
	//
	getPopoverTenantUserAdd()
	{
		const { theme, r3provider } = this.props;

		let	message;
		if(null != this.state.popoverComfirmMessage){
			message = (
				<Typography
					{ ...theme.r3LocalTenantDialog.popoverMessage }
					sx={ this.sxClasses.popoverMessage }
				>
					{ this.state.popoverComfirmMessage }
				</Typography>
			);
		}

		return (
			<Popover
				open={ Boolean(this.state.popoverTenantUserAddAnchorEl) }
				anchorEl={ this.state.popoverTenantUserAddAnchorEl }
				onClose={ this.handleCancelTenantUserAdd }
				{ ...theme.r3LocalTenantDialog.popoverTenantUserAdd }
				sx={ this.sxClasses.popoverTenantUserAdd }
			>
				<Typography
					{ ...theme.r3LocalTenantDialog.popoverTenantUserAddTitle }
					sx={ this.sxClasses.popoverTenantUserAddTitle }
				>
					{ r3provider.getR3TextRes().tResTenantUserAddTitle }
				</Typography>
				{ message }
				<TextField
					id={ componentKeyIds.tenantUserAddTextFieldId }
					value={ r3IsEmptyString(this.state.popoverTenantUserAddValue, true) ? '' : this.state.popoverTenantUserAddValue }
					placeholder={ r3provider.getR3TextRes().tResTenantUserAddHint }
					onChange={ (event) => this.handleChangeTenantUserAdd(event) }
					InputProps={{ sx: this.sxClasses.inputTextField }}
					{ ...theme.r3LocalTenantDialog.textField }
					sx={ this.sxClasses.textField }
				/>
				<Button
					disabled={ r3IsEmptyString(this.state.popoverTenantUserAddValue, true) }
					onClick={ this.handleConfirmTenantUserAdd }

					{ ...theme.r3LocalTenantDialog.popoverTenantUserAddButton }
					sx={ this.sxClasses.popoverTenantUserAddButton }
				>
					{ r3provider.getR3TextRes().tResTenantUserAddBtn }
					<CheckCircleIcon
						sx={ this.sxClasses.buttonIcon }
					/>
				</Button>
			</Popover>
		);
	}

	//----------------------------------------------------------
	// Render
	//----------------------------------------------------------
	render()
	{
		const { theme, r3provider } = this.props;

		//
		// Variables by create mode
		//
		let	dialogTitle;
		let	tenantNameValueContent;
		let	tenantIdContent;
		if(this.props.createMode){
			// Create
			dialogTitle = r3provider.getR3TextRes().cCreateLocalTenantTitle;

			// Messages
			let	tenantNameMessage;
			if(null != this.state.tenantNameMessage){
				tenantNameMessage = (
					<Typography
						{ ...theme.r3LocalTenantDialog.localTenantMessage }
						sx={ this.sxClasses.localTenantMessage }
					>
						{ this.state.tenantNameMessage }
					</Typography>
				);
			}else{
				tenantNameMessage = (
					<Typography
						{ ...theme.r3LocalTenantDialog.value }
						sx={ this.sxClasses.value }
					>
						{ r3provider.getR3TextRes().tResCreateTenantNameNote }
					</Typography>
				);
			}

			// Tenant Name
			tenantNameValueContent = (
				<React.Fragment>
					<TextField
						id={ componentKeyIds.tenantNameTextFieldId }
						value={ this.state.tenantName }
						placeholder={ r3provider.getR3TextRes().tResCreateTenantNameHint }
						onChange={ (event) => this.handleTenantNameChange(event) }
						InputProps={{ sx: this.sxClasses.inputTextField }}
						{ ...theme.r3LocalTenantDialog.textField }
						sx={ this.sxClasses.textField }
					/>
					{ tenantNameMessage }
				</React.Fragment>
			);

		}else{
			// Modify
			dialogTitle = r3provider.getR3TextRes().cLocalTenantTitle;

			// Tenant Name
			tenantNameValueContent = (
				<Typography
					{ ...theme.r3LocalTenantDialog.value }
					sx={ this.sxClasses.value }
				>
					{ this.state.tenantName }
				</Typography>
			);

			// Tenant Id contents
			tenantIdContent = (
				<React.Fragment>
					<Typography
						{ ...theme.r3LocalTenantDialog.keyTitle }
						sx={ this.sxClasses.keyTitle }
					>
						{ r3provider.getR3TextRes().tResTenantIdSubTitle }
					</Typography>
					<Typography
						{ ...theme.r3LocalTenantDialog.value }
						sx={ this.sxClasses.value }
					>
						{ this.props.tenantId }
					</Typography>
				</React.Fragment>
			);
		}

		//
		// User list
		//
		let	userListString		= this.state.tenantUsers.join(', ');

		//
		// User edit button
		//
		let	disableManageButton;
		if(!r3IsSafeTypedEntity(this.state.tenantUsers, 'array') || 0 === this.state.tenantUsers.length){
			disableManageButton = true;
		}else if(this.props.createMode && 1 === this.state.tenantUsers.length && r3ArrayHasValue(this.state.tenantUsers, this.props.userName)){
			disableManageButton = true;
		}else{
			disableManageButton = false;
		}

		//
		// Popover
		//
		let	popoverTenantUserAdd	= this.getPopoverTenantUserAdd();
		let	popoverTenantUsersEdit	= this.getPopoverTenantUsersEdit();

		//
		// Messages
		//
		let	userListErrorMessage	= null;
		if(0 == this.state.tenantUsers.length){
			if(this.props.createMode){
				userListErrorMessage = r3provider.getR3TextRes().eLocalTenantUserAddOwn;	// Need to include self
			}else{
				userListErrorMessage = r3provider.getR3TextRes().eLocalTenantUserDelete;	// Removing all user to remove tenant
			}
		}else if(!r3ArrayHasValue(this.state.tenantUsers, this.props.userName)){
			if(this.props.createMode){
				userListErrorMessage = r3provider.getR3TextRes().eLocalTenantUserShould;	// Should include self
			}else{
				userListErrorMessage = r3provider.getR3TextRes().eLocalTenantUserDelOwn;	// Removing self to not access
			}
		}
		let	userListMessage;
		if(null != userListErrorMessage){
			userListMessage = (
				<Typography
					{ ...theme.r3LocalTenantDialog.localTenantMessage }
					sx={ this.sxClasses.localTenantMessage }
				>
					{ userListErrorMessage }
				</Typography>
			);
		}

		//
		// Popup messages
		//
		let	confirmMessage;
		if(this.state.confirmMessage){
			confirmMessage = (
				<R3PopupMsgDialog
					theme={ theme }
					r3provider={ r3provider }
					r3Message={ this.state.confirmMessage }
					twoButton={ true }
					onClose={ this.handConfirmMessageClose }
				/>
			);
		}

		//
		// Dialog button state
		//
		let	enableButtonOK;
		if(this.props.createMode){
			if(	!r3IsEmptyString(this.state.tenantName, true)					&&					// specified tenant name
				!this.checkTenantNameConflict(this.state.tenantName)			&&					// tenant name does not conflict
				0 != this.state.tenantUsers.length								&&					// tenant user list is not empty
				r3ArrayHasValue(this.state.tenantUsers, this.props.userName)	)					// tenant user list has current user name
			{
				enableButtonOK = true;
			}else{
				enableButtonOK = false;
			}
		}else{
			if(	!r3CompareString(this.props.tenantDisplay, this.state.tenantDisplay)			||	// changed tenant display name
				!r3CompareString(this.props.tenantDescription, this.state.tenantDescription)	||	// changed tenant description
				!r3DeepCompare(this.props.tenantUsers, this.state.tenantUsers)					)	// changed user list
			{
				enableButtonOK = true;
			}else{
				enableButtonOK = false;
			}
		}

		return (
			<Dialog
				open={ this.state.open }
				onClose={ (event, reason) => this.props.onClose(event, reason, false, null, null, null, null, null) }
				{ ...theme.r3LocalTenantDialog.root }
				sx={ this.sxClasses.root }
			>
				<DialogTitle
					{ ...theme.r3LocalTenantDialog.dialogTitle }
					sx={ this.sxClasses.dialogTitle }
				>
					<Typography
						{ ...theme.r3LocalTenantDialog.title }
						sx={ this.sxClasses.title }
					>
						{ dialogTitle }
					</Typography>
				</DialogTitle>

				<DialogContent
					sx={ this.sxClasses.dialogContent }
				>
					<Typography
						{ ...theme.r3LocalTenantDialog.keyTitle }
						sx={ this.sxClasses.keyTitle }
					>
						{ r3provider.getR3TextRes().tResTenantNameSubTitle }
					</Typography>
					{ tenantNameValueContent }

					{ tenantIdContent }

					<Typography
						{ ...theme.r3LocalTenantDialog.keyTitle }
						sx={ this.sxClasses.keyTitle }
					>
						{ r3provider.getR3TextRes().tResTenantDisplaySubTitle }
					</Typography>
					<TextField
						id={ componentKeyIds.displayTextFieldId }
						value={ this.state.tenantDisplay }
						placeholder={ r3provider.getR3TextRes().tResCreateTenantDispHint }
						onChange={ (event) => this.handleDisplayChange(event) }
						InputProps={{ sx: this.sxClasses.inputTextField }}
						{ ...theme.r3LocalTenantDialog.textField }
						sx={ this.sxClasses.textField }
					/>

					<Typography
						{ ...theme.r3LocalTenantDialog.keyTitle }
						sx={ this.sxClasses.keyTitle }
					>
						{ r3provider.getR3TextRes().tResTenantDescSubTitle }
					</Typography>
					<TextField
						id={ componentKeyIds.descriptionTextFieldId }
						value={ this.state.tenantDescription }
						placeholder={ r3provider.getR3TextRes().tResTenantDescriptionlHint }
						onChange={ (event) => this.handleDescriptionChange(event) }
						InputProps={{ sx: this.sxClasses.inputTextField }}
						{ ...theme.r3LocalTenantDialog.textField }
						sx={ this.sxClasses.textField }
					/>

					<Typography
						{ ...theme.r3LocalTenantDialog.keyTitle }
						sx={ this.sxClasses.keyTitle }
					>
						{ r3provider.getR3TextRes().tResTenantUserSubTitle }
					</Typography>
					<Typography
						{ ...theme.r3LocalTenantDialog.value }
						sx={ this.sxClasses.usersValue }
					>
						{ userListString }
					</Typography>
					{ popoverTenantUsersEdit }
					{ popoverTenantUserAdd }
					<Box
						sx={ this.sxClasses.usersButtonsBox }
					>
						<Tooltip
							title={ r3provider.getR3TextRes().tResTenantUsersEditTT }
							open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.usersEditButtonTooltip, 'boolean')) ? false : this.state.tooltips.usersEditButtonTooltip) }
						>
							<IconButton
								disabled={ disableManageButton }
								onClick={ this.handleTenantUsersEditButton }
								onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.usersEditButtonTooltip, true) }
								onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.usersEditButtonTooltip, false) }
								{ ...theme.r3LocalTenantDialog.usersEditButton }
								sx={ this.sxClasses.usersEditButton }
								size="large"
							>
								<EditIcon />
							</IconButton>
						</Tooltip>
						<Tooltip
							title={ r3provider.getR3TextRes().tResTenantUsersAddTT }
							open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.userAddButtonTooltip, 'boolean')) ? false : this.state.tooltips.userAddButtonTooltip) }
						>
							<Button
								onClick={ this.handleTenantUserAddButton }
								onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.userAddButtonTooltip, true) }
								onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.userAddButtonTooltip, false) }
								{ ...theme.r3CreateServiceDialog.usersAddButton }
								sx={ this.sxClasses.usersAddButton }
							>
								<AddIcon />
							</Button>
						</Tooltip>
					</Box>
					{ userListMessage }
				</DialogContent>

				<DialogActions>
					<Button
						onClick={ (event) => this.props.onClose(event, null, false, null, null, null, null, null) }
						{ ...theme.r3LocalTenantDialog.cancelButton }
						sx={ this.sxClasses.cancelButton }
					>
						{ r3provider.getR3TextRes().tResButtonCancel }
						<CancelIcon
							sx={ this.sxClasses.buttonIcon }
						/>
					</Button>
					<Button
						disabled={ !enableButtonOK }
						onClick={ this.handleDialogCloseButton }
						{ ...theme.r3LocalTenantDialog.okButton }
						sx={ this.sxClasses.okButton }
					>
						{ r3provider.getR3TextRes().tResButtonOk }
						<CheckCircleIcon
							sx={ this.sxClasses.buttonIcon }
						/>
					</Button>
				</DialogActions>

				{ confirmMessage }
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
