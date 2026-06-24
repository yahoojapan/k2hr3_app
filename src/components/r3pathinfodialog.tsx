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

import Button						from '@mui/material/Button';
import Dialog						from '@mui/material/Dialog';
import DialogTitle					from '@mui/material/DialogTitle';
import DialogContent				from '@mui/material/DialogContent';
import DialogActions				from '@mui/material/DialogActions';
import Typography					from '@mui/material/Typography';
import TextField					from '@mui/material/TextField';
import Tooltip						from '@mui/material/Tooltip';
import Table						from '@mui/material/Table';
import TableBody					from '@mui/material/TableBody';
import TableCell					from '@mui/material/TableCell';
import TableHead					from '@mui/material/TableHead';
import TablePagination				from '@mui/material/TablePagination';
import TableRow						from '@mui/material/TableRow';
import Popover						from '@mui/material/Popover';
import FormControlLabel				from '@mui/material/FormControlLabel';
import Checkbox						from '@mui/material/Checkbox';
import MenuItem						from '@mui/material/MenuItem';			// for select
import Box							from '@mui/material/Box';
import Select, { SelectChangeEvent }	from '@mui/material/Select';

import CheckCircleIcon				from '@mui/icons-material/CheckCircle';
import CopyClipBoardIcon			from '@mui/icons-material/AssignmentTurnedInRounded';
import SettingActionIcon			from '@mui/icons-material/SettingsApplicationsRounded';
import CreateRoleTokenIcon			from '@mui/icons-material/AddBoxRounded';
import DeleteIcon					from '@mui/icons-material/Delete';
import DispCodeIcon					from '@mui/icons-material/ViewListRounded';
import BackPageIcon					from '@mui/icons-material/Cancel';

import R3MsgBox						from './r3msgbox';						// Message Box
import R3Message					from '../util/r3message';
import R3Provider					from '../util/r3provider';

import type { R3Theme }				from './r3theme';
import { r3PathInfoDialogStyle }	from './r3styles';
import { roleType, errorType, CRCObject, DataCallback, isRoleTokenPrimitiveInfo, RoleTokenPrimitiveInfo, RoleTokenMetadata, RoleTokenInfo, StringValObj, TenantData, isRoleTokenInfo, isRoleTokenInfoArray, isRoleTokenMetadataArray }		from '../util/r3types';
import { r3IsEmptyEntity, r3IsEmptyEntityObject, r3IsEmptyStringObject, r3CompareCaseString, r3IsEmptyString, r3CompareString, convertISOStringToLocaleString, getDiffTimeFromISOString, diffRoundType, getDiffRoundStringFromISOString, r3DeepClone, r3HasKey, r3IsArray, r3IsBoolean, r3IsFunction, r3IsNumber, r3IsObject, r3IsString } from '../util/r3util';

//
// Local variables
//
const pageTypeValues = {
	pageMain:				0,
	pageManageRoleToken:	1,
	pageDisplayCode:		2
};

const tooltipInTableValues = {
	deleteRoleTokenButtonTooltip:	'deleteRoleTokenButtonTooltip',
	dispCodeButtonTooltip:			'dispCodeButtonTooltip',
	detailCreateTimeTooltip:		'detailCreateTimeTooltip',
	detailExpireTimeTooltip:		'detailExpireTimeTooltip',
	detailRoleTokenTooltip:			'detailRoleTokenTooltip'
};

const roleTokenSortKeys = {
	createTime:		'date',
	expireTime:		'expire',
	roleToken:		'token',
};

const codeTypeValues = {
	uds:			'uds',
	secretYaml:		'secret',
	sidecarYaml:	'sidecar',
	crcObject:		'crc:'
};

const codeType = [
	{
		name:		'User Data Script for OpenStack',
		value:		codeTypeValues.uds
	},
	{
		name:		'Secret Yaml for kubernetes',
		value:		codeTypeValues.secretYaml
	},
	{
		name:		'Sidecar Yaml for kubernetes',
		value:		codeTypeValues.sidecarYaml
	}
];

const roletokenTextFieldName= 'roletoken-textfield';
const codeTextFieldName		= 'register-code-textfield';

//
// Path Information Dialog interfaces
//
type R3PathInfoDialogRequiredProps = {
	theme:								R3Theme;
	r3provider:							R3Provider;
	open:								boolean;
	onClose:							(event: {}, reason: string) => void;
};

type R3PathInfoDialogOptionProps = {
	tenant?:							TenantData | null;
	service?:							string | null;
	type?:								string | null;
	fullpath?:							string | null;
	currentpath?:						string | null;
	tableRawCount?:						number;
	userDataScript?:					string | null;
	roleToken?:							string | null;
};

type R3PathInfoDialogProps = R3PathInfoDialogRequiredProps & R3PathInfoDialogOptionProps;

type R3PathInfoDialogTooltips = {
	// In main page
	manageRoleTokenButtonTooltip?:		boolean;
	dispCodeNewRoleTokenButtonTooltip?:	boolean;

	// In manage role token page
	deleteRoleTokenButtonTooltip?:		number;
	newRoleTokenButtonTooltip?:			boolean;
	dispCodeButtonTooltip?:				number;
	detailCreateTimeTooltip?:			number;
	detailExpireTimeTooltip?:			number;
	detailRoleTokenTooltip?:			number;

	// In OpenStack page
	roletokenClipboardButtonTooltip?:	boolean;
	copyClipboardButtonTooltip?:		boolean;
};

type R3PathInfoDialogState = {
	// common
	open:								boolean;
	pageType:							number;
	stackedPreviousPages:				number[];
	message:							R3Message | null;

	// In manage role token page
	manageRoleTokenPageNum:				number;
	roleTokenList:						RoleTokenMetadata[];
	roleTokenSortKey:					string;							// default is sorting by create time
	roleTokenSortNormal:				boolean;						// default is reverse sorting
	newRoleTokenPopoverAnchorEl:		HTMLElement | null;
	newRoleTokenNoExpire:				boolean;
	newRoleTokenButtonTooltip:			boolean;

	// In openstack page
	selectedRoleToken:					string | null;
	selectedRoleTokenTime:				string | null;
	codeType:							string;
	codeUDS:							string | null;
	codeSecretYaml:						string | null;
	codeSidecarYaml:					string | null;
	objCrc:								CRCObject;

	// tooltip
	tooltips:							R3PathInfoDialogTooltips;
};

type R3PathInfoDialogStyleType = ReturnType<typeof r3PathInfoDialogStyle>;

//
// Path Information Class
//
export default class R3PathInfoDialog extends React.Component<R3PathInfoDialogProps, R3PathInfoDialogState>
{
	sxClasses: R3PathInfoDialogStyleType;

	static defaultProps: R3PathInfoDialogOptionProps = {
		tenant:			null,
		service:		null,
		type:			null,
		fullpath:		null,
		currentpath:	null,
		tableRawCount:	5
	};

	roletokenInputElement: HTMLInputElement | null	= null;						// input textfield for registration code.
	codeInputElement: HTMLInputElement | null		= null;						// input textfield for registration code.

	state: R3PathInfoDialogState = {
		// common
		open:								this.props.open,
		pageType:							pageTypeValues.pageMain,
		stackedPreviousPages:				[],
		message:							null,

		// In manage role token page
		manageRoleTokenPageNum:				0,
		roleTokenList:						[],
		roleTokenSortKey:					roleTokenSortKeys.createTime,		// default is sorting by create time
		roleTokenSortNormal:				false,								// default is reverse sorting
		newRoleTokenPopoverAnchorEl:		null,
		newRoleTokenNoExpire:				false,
		newRoleTokenButtonTooltip:			false,

		// In openstack page
		selectedRoleToken:					null,
		selectedRoleTokenTime:				null,
		codeType:							codeTypeValues.uds,
		codeUDS:							null,
		codeSecretYaml:						null,
		codeSidecarYaml:					null,
		objCrc:								{},

		tooltips: {
			// In main page
			manageRoleTokenButtonTooltip:		false,
			dispCodeNewRoleTokenButtonTooltip:	false,

			// In manage role token page
			deleteRoleTokenButtonTooltip:		-1,
			newRoleTokenButtonTooltip:			false,
			dispCodeButtonTooltip:				-1,
			detailCreateTimeTooltip:			-1,
			detailExpireTimeTooltip:			-1,
			detailRoleTokenTooltip:				-1,

			// In OpenStack page
			roletokenClipboardButtonTooltip:	false,
			copyClipboardButtonTooltip:			false
		}
	};

	constructor(props: R3PathInfoDialogProps)
	{
		super(props);

		// Binding(do not define handlers as arrow functions for performance)

		// common
		this.handleClose					= this.handleClose.bind(this);
		this.handleBackPage					= this.handleBackPage.bind(this);

		// In main page
		this.handleManageRoleToken			= this.handleManageRoleToken.bind(this);
		this.handleDispCodeNewRoleToken		= this.handleDispCodeNewRoleToken.bind(this);

		// In manage role token page
		this.handleNewRoleToken				= this.handleNewRoleToken.bind(this);
		this.handleNoExpireCheckboxChange	= this.handleNoExpireCheckboxChange.bind(this);
		this.handleConfirmNewRoleToken		= this.handleConfirmNewRoleToken.bind(this);
		this.handleCancelNewRoleToken		= this.handleCancelNewRoleToken.bind(this);
		this.handleManageRoleTokenPageChange= this.handleManageRoleTokenPageChange.bind(this);
		this.handleDeleteRoleToken			= this.handleDeleteRoleToken.bind(this);
		this.handleDispCode					= this.handleDispCode.bind(this);

		// In openstack page
		this.handleCodeTypeChange			= this.handleCodeTypeChange.bind(this);
		this.handleRoleTokenClipboard		= this.handleRoleTokenClipboard.bind(this);
		this.handleCopyClipboard 			= this.handleCopyClipboard.bind(this);

		// styles
		this.sxClasses						= r3PathInfoDialogStyle(props.theme);
	}

	// [NOTE]
	// Use getDerivedStateFromProps by deprecating componentWillReceiveProps in React 17.x.
	// The only purpose is to set the state data from props when the dialog changes from hidden to visible.
	//
	static getDerivedStateFromProps(nextProps: R3PathInfoDialogProps, prevState: R3PathInfoDialogState): Partial<R3PathInfoDialogState> | null
	{
		if(prevState.open != nextProps.open){
			return {
				open:					nextProps.open,
				pageType:				pageTypeValues.pageMain,
				stackedPreviousPages:	[],
				message:				null,
				manageRoleTokenPageNum:	0,
				roleTokenList:			[],
				selectedRoleToken:		null,
				selectedRoleTokenTime:	null,
				codeUDS:				null,
				codeSecretYaml:			null,
				codeSidecarYaml:		null,
				objCrc:					{}
			};
		}
		return null;														// Return null to indicate no change to state.
	}

	handleClose(event: {}, reason: string)
	{
		this.props.onClose(event, reason);
	}

	handleBackPage(event: React.MouseEvent<HTMLElement>)
	{
		if(!r3IsArray(this.state.stackedPreviousPages) || 0 == this.state.stackedPreviousPages.length){
			return;
		}

		let	newStackedPages	= this.state.stackedPreviousPages.slice();
		let	prevPageType	= newStackedPages.pop()!;

		this.setState({
			message:				null,
			pageType:				prevPageType,
			stackedPreviousPages:	newStackedPages
		});
	}

	handleManageRoleToken(event: React.MouseEvent<HTMLElement>)
	{
		const { r3provider } = this.props;

		let	_comErrorMessage = r3provider.getR3TextRes().eCommunication;
		let	_newStackedPages = this.state.stackedPreviousPages.slice();
		_newStackedPages.push(pageTypeValues.pageMain);

		// Get Role Token Lists
		this.getRoleTokenList((error: Error | null, resobj: RoleTokenInfo[] | null) =>
		{
			if(null !== error){
				console.info(error.message);
				this.setState({
					message:	new R3Message(_comErrorMessage + error.message, errorType)
				});
				return;
			}
			if(null === resobj || !isRoleTokenInfoArray(resobj)){
				console.info('Could not get role token list');
				this.setState({
					message:	new R3Message(_comErrorMessage + 'Could not get role token list', errorType)
				});
				return;
			}

			// convert and set for display
			const tokenList: RoleTokenMetadata[] = this.cvtRoleTokenInfoToMetadata(resobj);

			// sort
			this.sortRoleTokenList(tokenList);

			this.setState({
				message:				null,
				pageType:				pageTypeValues.pageManageRoleToken,
				stackedPreviousPages:	_newStackedPages,
				manageRoleTokenPageNum:	0,
				roleTokenList:			structuredClone(tokenList)
			});
		});
	}

	handleDispCodeNewRoleToken(event: React.MouseEvent<HTMLElement>)
	{
		const { r3provider } = this.props;

		let	_comErrorMessage = r3provider.getR3TextRes().eCommunication;

		// get new role token(expire is default)
		this.getNewRoleToken(null, (error: Error | null, resobj: RoleTokenPrimitiveInfo | null) =>
		{
			if(null !== error){
				console.info(error.message);
				this.setState({
					pageType:				pageTypeValues.pageMain,
					stackedPreviousPages:	[],
					message:				new R3Message(_comErrorMessage + error.message, errorType)
				});
				return;
			}
			if(!isRoleTokenPrimitiveInfo(resobj)){
				const err = new Error('Failed to create new role token');
				console.error(err.message);
				this.setState({
					pageType:				pageTypeValues.pageMain,
					stackedPreviousPages:	[],
					message:				new R3Message(_comErrorMessage + err.message, errorType)
				});
				return;
			}

			// keep new role token
			let	_newRoleToken = resobj.roleToken;

			// remake role token list
			this.getRoleTokenList((error: Error | null, resobj: RoleTokenInfo[] | null) =>
			{
				if(null !== error){
					console.info(error.message);
					this.setState({
						pageType:				pageTypeValues.pageMain,
						stackedPreviousPages:	[],
						message:				new R3Message(_comErrorMessage + error.message, errorType)
					});
					return;
				}
				if(null === resobj || !isRoleTokenInfoArray(resobj)){
					console.info('Could not get role token list');
					this.setState({
						pageType:				pageTypeValues.pageMain,
						stackedPreviousPages:	[],
						message:				new R3Message(_comErrorMessage + 'Could not get role token list', errorType)
					});
					return;
				}

				// convert and set for display
				const tokenList: RoleTokenMetadata[] = this.cvtRoleTokenInfoToMetadata(resobj, _newRoleToken);

				// sort
				this.sortRoleTokenList(tokenList);

				// search new role token in result(token list)
				for(let cnt = 0; cnt < tokenList.length; ++cnt){
					if(tokenList[cnt].token == _newRoleToken){
						// found
						let	newStackedPages	= this.state.stackedPreviousPages.slice();
						newStackedPages.push(pageTypeValues.pageMain);

						// update
						this.setState({
							message:				null,
							pageType:				pageTypeValues.pageDisplayCode,
							stackedPreviousPages:	newStackedPages,
							manageRoleTokenPageNum:	0,
							selectedRoleToken:		tokenList[cnt].token,
							selectedRoleTokenTime:	tokenList[cnt].dispTime,
							codeUDS:				tokenList[cnt].codeUDS,
							codeSecretYaml:			tokenList[cnt].codeSecretYaml,
							codeSidecarYaml:		tokenList[cnt].codeSidecarYaml,
							objCrc:					structuredClone(tokenList[cnt].objCrc)
						});
						return;
					}
				}

				// not found new role token
				this.setState({
					pageType:				pageTypeValues.pageMain,
					stackedPreviousPages:	[],
					message:				new R3Message('Failed to create new role token', errorType)
				});
			});
		});
	}

	handleDispCode(event: React.MouseEvent<HTMLElement>, pos: number)
	{
		if(!r3IsArray(this.state.roleTokenList) || pos < 0 || this.state.roleTokenList.length <= pos || r3IsEmptyEntity(this.state.roleTokenList[pos])){
			return;
		}

		let	newStackedPages	= this.state.stackedPreviousPages.slice();
		newStackedPages.push(pageTypeValues.pageManageRoleToken);

		this.setState({
			message:				null,
			pageType:				pageTypeValues.pageDisplayCode,
			stackedPreviousPages:	newStackedPages,
			manageRoleTokenPageNum:	0,
			selectedRoleToken:		this.state.roleTokenList[pos].token,
			selectedRoleTokenTime:	this.state.roleTokenList[pos].dispTime,
			codeUDS:				this.state.roleTokenList[pos].codeUDS,
			codeSecretYaml:			this.state.roleTokenList[pos].codeSecretYaml,
			codeSidecarYaml:		this.state.roleTokenList[pos].codeSidecarYaml,
			objCrc:					this.state.roleTokenList[pos].objCrc
		});
	}

	handleManageRoleTokenPageChange(event: React.MouseEvent<HTMLButtonElement> | null, page: number)
	{
		this.setState({
			message:				null,
			manageRoleTokenPageNum:	page
		});
	}

	handleNewRoleToken(event: React.MouseEvent<HTMLElement>)
	{
		this.setState({
			newRoleTokenButtonTooltip:		false,
			newRoleTokenPopoverAnchorEl:	event.currentTarget,
			newRoleTokenNoExpire:			false
		});
	}

	handleCancelNewRoleToken(event: {}, reason?: string)
	{
		this.setState({
			newRoleTokenButtonTooltip:		false,
			newRoleTokenPopoverAnchorEl:	null,
			newRoleTokenNoExpire:			false
		});
	}

	handleNoExpireCheckboxChange(event: React.ChangeEvent<HTMLInputElement>)
	{
		let	isChecked: boolean = r3IsEmptyEntityObject(event.target, 'checked') ? false : event.target.checked;

		if(this.state.newRoleTokenNoExpire === isChecked){
			return;
		}

		this.setState({
			newRoleTokenNoExpire:	isChecked
		});
	}

	handleConfirmNewRoleToken(event: React.MouseEvent<HTMLElement>)
	{
		const { r3provider } = this.props;

		let	_comErrorMessage = r3provider.getR3TextRes().eCommunication;
		let	expire = (this.state.newRoleTokenNoExpire ? 0 : null);

		// get new role token
		this.getNewRoleToken(expire, (error: Error | null, resobj: RoleTokenPrimitiveInfo | null) =>
		{
			if(null !== error){
				console.info(error.message);
				this.setState({
					message:						new R3Message(_comErrorMessage + error.message, errorType),
					newRoleTokenButtonTooltip:		false,
					newRoleTokenPopoverAnchorEl:	null,
					newRoleTokenNoExpire:			false
				});
				return;
			}
			if(!isRoleTokenPrimitiveInfo(resobj)){
				const err = new Error('Failed to create new role token');
				console.error(err.message);
				this.setState({
					message:						new R3Message(_comErrorMessage + err.message, errorType),
					newRoleTokenButtonTooltip:		false,
					newRoleTokenPopoverAnchorEl:	null,
					newRoleTokenNoExpire:			false
				});
				return;
			}

			// new role token
			let	_newRoleToken = resobj.roleToken;

			// remake role token list
			this.getRoleTokenList((error: Error | null, resobj: RoleTokenInfo[] | null) =>
			{
				if(null !== error){
					console.info(error.message);
					this.setState({
						message:						new R3Message(_comErrorMessage + error.message, errorType),
						newRoleTokenButtonTooltip:		false,
						newRoleTokenPopoverAnchorEl:	null,
						newRoleTokenNoExpire:			false
					});
					return;
				}
				if(null === resobj || !isRoleTokenInfoArray(resobj)){
					console.info('Could not get role token list');
					this.setState({
						message:						new R3Message(_comErrorMessage + 'Could not get role token list', errorType),
						newRoleTokenButtonTooltip:		false,
						newRoleTokenPopoverAnchorEl:	null,
						newRoleTokenNoExpire:			false
					});
				}

				// convert and set for display
				const tokenList: RoleTokenMetadata[] = this.cvtRoleTokenInfoToMetadata(resobj, _newRoleToken);

				// sort
				this.sortRoleTokenList(tokenList);

				this.setState({
					message:						null,
					manageRoleTokenPageNum:			0,
					roleTokenList:					structuredClone(tokenList),
					newRoleTokenButtonTooltip:		false,
					newRoleTokenPopoverAnchorEl:	null,
					newRoleTokenNoExpire:			false
				});
			});
		});
	}

	handleDeleteRoleToken(event: React.MouseEvent<HTMLElement>, pos: number)
	{
		const { r3provider } = this.props;

		let	_comErrorMessage = r3provider.getR3TextRes().eCommunication;

		if(isNaN(pos) || pos < 0 || this.state.roleTokenList.length <= pos){
			return;
		}
		let	roletoken = this.state.roleTokenList[pos].token;

		// delete role token
		this.deleteRoleToken(roletoken, (error: Error | null) =>
		{
			if(null !== error){
				console.info(error.message);
				this.setState({
					message:	new R3Message(_comErrorMessage + error.message, errorType),
				});
				return;
			}

			// remake role token list
			this.getRoleTokenList((error: Error | null, resobj: RoleTokenInfo[] | null) =>
			{
				if(null !== error){
					console.info(error.message);
					this.setState({
						message:	new R3Message(_comErrorMessage + error.message, errorType),
					});
					return;
				}
				if(null === resobj || !isRoleTokenInfoArray(resobj)){
					console.info('Could not get role token list');
					this.setState({
						message:	new R3Message(_comErrorMessage + 'Could not get role token list', errorType)
					});
				}

				// convert and set for display
				const tokenList: RoleTokenMetadata[] = this.cvtRoleTokenInfoToMetadata(resobj);

				// sort
				this.sortRoleTokenList(tokenList);

				this.setState({
					message:		null,
					roleTokenList:	structuredClone(tokenList)
				});
			});
		});
	}

	handleManageRoleTokenButtonTooltipChange = (event: React.SyntheticEvent, isOpen: boolean) =>
	{
		this.setState({
			tooltips: {
				manageRoleTokenButtonTooltip:	isOpen
			}
		});
	};

	handleDispCodeNewRoleTokenButtonTooltipChange = (event: React.SyntheticEvent, isOpen: boolean) =>
	{
		this.setState({
			tooltips: {
				dispCodeNewRoleTokenButtonTooltip:	isOpen
			}
		});
	};

	handleNewRoleTokenButtonTooltipChange = (event: React.SyntheticEvent, isOpen: boolean) =>
	{
		this.setState({
			tooltips: {
				newRoleTokenButtonTooltip:			isOpen
			}
		});
	};

	handleInTableTooltipChange = (event: React.SyntheticEvent, type: string, extData: number) =>
	{
		if(tooltipInTableValues.deleteRoleTokenButtonTooltip === type){
			this.setState({
				tooltips: {
					deleteRoleTokenButtonTooltip:	extData
				}
			});
		}else if(tooltipInTableValues.dispCodeButtonTooltip === type){
			this.setState({
				tooltips: {
					dispCodeButtonTooltip:			extData
				}
			});
		}else if(tooltipInTableValues.detailCreateTimeTooltip === type){
			this.setState({
				tooltips: {
					detailCreateTimeTooltip:		extData
				}
			});
		}else if(tooltipInTableValues.detailExpireTimeTooltip === type){
			this.setState({
				tooltips: {
					detailExpireTimeTooltip:		extData
				}
			});
		}else if(tooltipInTableValues.detailRoleTokenTooltip === type){
			this.setState({
				tooltips: {
					detailRoleTokenTooltip:			extData
				}
			});
		}
	};

	handleRoleTokenClipboardButtonTooltipChange = (event: React.SyntheticEvent, isOpen: boolean) =>
	{
		this.setState({
			tooltips: {
				roletokenClipboardButtonTooltip:	isOpen
			}
		});
	};

	handleRoleTokenClipboard(event: React.MouseEvent<HTMLElement>)
	{
		if(r3IsEmptyEntityObject(this.roletokenInputElement, 'select') || !r3IsFunction(this.roletokenInputElement.select)){
			return;
		}
		this.roletokenInputElement.select();		// select all text in text field
		document.execCommand('copy');				// cpoy to clipboard
		window.getSelection()?.removeAllRanges();	// unselect text
		this.roletokenInputElement.blur();			// off furcus

		this.setState({
			tooltips: {
				roletokenClipboardButtonTooltip:	false
			}
		});
	}

	handleCopyClipboardButtonTooltipChange = (event: React.SyntheticEvent, isOpen: boolean) =>
	{
		this.setState({
			tooltips: {
				copyClipboardButtonTooltip:	isOpen
			}
		});
	};

	handleCopyClipboard(event: React.MouseEvent<HTMLElement>)
	{
		if(r3IsEmptyEntityObject(this.codeInputElement, 'select') || !r3IsFunction(this.codeInputElement.select)){
			return;
		}
		this.codeInputElement.select();				// select all text in text field
		document.execCommand('copy');				// cpoy to clipboard
		window.getSelection()?.removeAllRanges();	// unselect text
		this.codeInputElement.blur();				// off furcus

		this.setState({
			tooltips: {
				copyClipboardButtonTooltip:	false
			}
		});
	}

	handleCodeTypeChange(event: SelectChangeEvent<string>)
	{
		//let	key	= r3IsEmptyEntityObject(event.target, 'name') ? null : event.target.name;
		let	newValue: string | null = r3IsEmptyEntityObject(event.target, 'value') ? null : event.target.value;

		if(r3IsEmptyString(newValue)){
			console.warn('Changed new register code type is wrong.');
			return;
		}
		if(newValue === this.state.codeType){
			// nothing to update
			return;
		}

		this.setState({
			codeType:	newValue!
		});
	}

	//
	// Get Role Token List
	//
	getRoleTokenList(callback: DataCallback<RoleTokenInfo[]>)
	{
		const { r3provider } = this.props;

		let	_callback	= callback;

		r3provider.getRoleTokenList(this.props.tenant!, this.props.currentpath, (error: Error | null, resobj: RoleTokenInfo[] | null) =>
		{
			if(null !== error){
				console.info(error.message);
				_callback(error, null);
				return;
			}
			if(null === resobj || !r3IsArray(resobj) || !resobj.every((item: unknown) => isRoleTokenInfo(item))){
				const err = new Error('Could not get role token list');
				console.error(err.message);
				_callback(err, null);
				return;
			}
			_callback(null, resobj);
		});
	}

	compareRoleToken = (token1: RoleTokenMetadata, token2: RoleTokenMetadata): number =>
	{
		let		result	= this.state.roleTokenSortNormal ? 1 : -1;
		const	sortKey	= this.state.roleTokenSortKey;

		if(r3HasKey(token1, sortKey) && r3HasKey(token2, sortKey)){
			if(r3IsEmptyString(token1[sortKey]) && r3IsEmptyString(token2[sortKey])){
				result *= 0;
			}else if(r3IsEmptyString(token1[sortKey])){
				result *= 1;
			}else if(r3IsEmptyString(token2[sortKey])){
				result *= -1;
			}else{
				if(token1[sortKey] > token2[sortKey]){
					result *= 1;
				}else if(token1[sortKey] < token2[sortKey]){
					result *= -1;
				}else{
					result *= 0;
				}
			}
		}else if(r3HasKey(token1, sortKey)){
			result *= 1;
		}else if(r3HasKey(token2, sortKey)){
			result *= -1;
		}else{
			result *= 0;
		}
		return result;
	};

	sortRoleTokenList(roleTokens: RoleTokenMetadata[] | null)
	{
		if(!isRoleTokenMetadataArray(roleTokens)){
			return;
		}
		roleTokens.sort(this.compareRoleToken);
	}

	cvtRoleTokenInfoToMetadata(detailRoleTokens: RoleTokenInfo[] | null, newRoleToken: string | null = null): RoleTokenMetadata[]
	{
		const	{ r3provider }	= this.props;

		const	unknownString	= r3provider.getR3TextRes().tResUnknownTimeUnit;
		let		tokenMetadatas: RoleTokenMetadata[] = [];

		if(!isRoleTokenInfoArray(detailRoleTokens)){
			return tokenMetadatas;
		}

		detailRoleTokens.forEach((tokenInfo: RoleTokenInfo) => {
			const	_token				= tokenInfo.token;
			const	isNewToken			= r3CompareString(tokenInfo.token, newRoleToken);
			const	shortToken			= r3IsEmptyString(tokenInfo.token) ? '...' : (tokenInfo.token.slice(0, 8) + '...');
			const	createTimeString	= convertISOStringToLocaleString(tokenInfo.date);
			const	expireTimeString	= convertISOStringToLocaleString(tokenInfo.expire);
			const	expireUnixTime		= getDiffTimeFromISOString(tokenInfo.expire, tokenInfo.date);
			const	expireObject		= getDiffRoundStringFromISOString(tokenInfo.expire, tokenInfo.date);

			let		expireString: string;
			if(diffRoundType.days == expireObject.type){
				expireString	= String(expireObject.value) + r3provider.getR3TextRes().tResDaysTimeUnit;
			}else if(diffRoundType.hours == expireObject.type){
				expireString	= String(expireObject.value) + r3provider.getR3TextRes().tResHoursTimeUnit;
			}else if(diffRoundType.minutes == expireObject.type){
				expireString	= String(expireObject.value) + r3provider.getR3TextRes().tResMinutesTimeUnit;
			}else{	// diffRoundType.seconds == expireObject.type
				expireString	= String(expireObject.value) + r3provider.getR3TextRes().tResSecondsTimeUnit;
			}

			const	dispTime			= (null == createTimeString ? unknownString : createTimeString) + ' ( ' + (null == expireTimeString ? unknownString : expireTimeString) + ' )';
			const	codeUDS				= r3provider.getUserDataScript(tokenInfo.registerpath);
			const	codeSecretYaml		= r3provider.getSecretYaml(tokenInfo.token);
			const	codeSidecarYaml		= r3provider.getSidecarYaml(this.props.fullpath);
			const	objCrc				= r3provider.getCRCObject(tokenInfo.token, this.props.fullpath, tokenInfo.registerpath);

			// set
			const	oneRoleToken: RoleTokenMetadata = {
				token:				tokenInfo.token,
				date:				tokenInfo.date,
				expire:				tokenInfo.expire,
				registerpath:		(r3IsString(tokenInfo?.registerpath) ? tokenInfo.registerpath : ''),
				newToken:			isNewToken,
				shortToken:			shortToken,
				createTime:			(null == createTimeString ? unknownString : createTimeString),
				expireUnixTime:		expireUnixTime,
				expireTime:			expireString,
				dispTime:			dispTime,
				codeUDS:			codeUDS,
				codeSecretYaml:		codeSecretYaml,
				codeSidecarYaml:	codeSidecarYaml,
				objCrc:				structuredClone(objCrc)
			};

			tokenMetadatas.push(oneRoleToken);
		});
		return tokenMetadatas;
	}

	//
	// Get New Role Token
	//
	getNewRoleToken(expire: number | null, callback: (error: Error | null, resobj: RoleTokenPrimitiveInfo | null) => void)
	{
		const { r3provider } = this.props;

		let	_callback	= callback;

		r3provider.getNewRoleToken(this.props.tenant!, this.props.currentpath, expire, (error: Error | null, resobj: RoleTokenPrimitiveInfo | null) =>
		{
			if(null !== error){
				console.info(error.message);
				_callback(error, null);
				return;
			}
			if(!isRoleTokenPrimitiveInfo(resobj) || r3IsEmptyString(resobj.roleToken, true)){
				const err = new Error('Failed to create new role token');
				console.error(err.message);
				_callback(err, null);
				return;
			}
			_callback(null, resobj);
		});
	}

	//
	// Delete Role Token
	//
	deleteRoleToken(roletoken: string, callback: (error: Error | null) => void)
	{
		const { r3provider } = this.props;

		let	_callback	= callback;

		r3provider.deleteRoleToken(this.props.tenant!, roletoken, (error: Error | null) =>
		{
			if(null !== error){
				console.info(error.message);
				_callback(error);
				return;
			}
			_callback(null);
		});
	}

	//---------------------------------------------------------
	// render Main Page
	//---------------------------------------------------------
	getActionToRoleTokenButtons()
	{
		const { theme, r3provider } = this.props;

		return (
			<React.Fragment>
				<Typography
					{ ...theme.r3PathInfoDialog.keyTitle }
					sx={ this.sxClasses.keyTitle }
				>
					{ r3provider.getR3TextRes().tResRoleTokenSubTitle }
				</Typography>
				<Tooltip
					title={ r3provider.getR3TextRes().tResRoleTokenManageTT }
					open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsBoolean(this.state.tooltips.manageRoleTokenButtonTooltip)) ? false : this.state.tooltips.manageRoleTokenButtonTooltip) }
				>
					<Button
						onClick={ this.handleManageRoleToken }
						onMouseEnter={ event => this.handleManageRoleTokenButtonTooltipChange(event, true) }
						onMouseLeave={ event => this.handleManageRoleTokenButtonTooltipChange(event, false) }
						{ ...theme.r3PathInfoDialog.manageRoleTokenButton }
						sx={ this.sxClasses.roleTokenButton }
					>
						<SettingActionIcon
							sx={ this.sxClasses.roleTokenButtonIcon }
						/>
						{ r3provider.getR3TextRes().tResRoleTokenManageButton }
					</Button>
				</Tooltip>
				<Tooltip
					title={ r3provider.getR3TextRes().tResDispCodeNewRoleTokenTT }
					open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsBoolean(this.state.tooltips.dispCodeNewRoleTokenButtonTooltip)) ? false : this.state.tooltips.dispCodeNewRoleTokenButtonTooltip) }
				>
					<Button
						onClick={ this.handleDispCodeNewRoleToken }
						onMouseEnter={ event => this.handleDispCodeNewRoleTokenButtonTooltipChange(event, true) }
						onMouseLeave={ event => this.handleDispCodeNewRoleTokenButtonTooltipChange(event, false) }
						{ ...theme.r3PathInfoDialog.dispCodeNewRoleTokenButton }
						sx={ this.sxClasses.roleTokenButton }
					>
						<SettingActionIcon
							sx={ this.sxClasses.roleTokenButtonIcon }
						/>
						{ r3provider.getR3TextRes().tResDispCodeNewRoleToken }
					</Button>
				</Tooltip>
			</React.Fragment>
		);
	}

	renderMain()
	{
		const { theme, r3provider } = this.props;

		let	tenant: React.ReactNode;
		let	tenantKey = (
			<Typography
				{ ...theme.r3PathInfoDialog.keyTitle }
				sx={ this.sxClasses.keyTitle }
			>
				{ r3provider.getR3TextRes().tResTenantSubTitle }
			</Typography>
		);
		if(r3IsEmptyStringObject(this.props.tenant, 'display')){
			tenant = (
				<React.Fragment>
					{ tenantKey }
					<Typography
						{ ...theme.r3PathInfoDialog.value }
						sx={ this.sxClasses.valueItalic }
					>
						{ r3provider.getR3TextRes().tResUnselected }
					</Typography>
				</React.Fragment>
			);
		}else{
			tenant = (
				<React.Fragment>
					{ tenantKey }
					<Typography
						{ ...theme.r3PathInfoDialog.value }
						sx={ this.sxClasses.value }
					>
						{ this.props.tenant!.display }
					</Typography>
				</React.Fragment>
			);
		}

		let	serviceContents: React.ReactNode;
		if(!r3IsEmptyString(this.props.service)){
			serviceContents = (
				<React.Fragment>
					<Typography
						{ ...theme.r3PathInfoDialog.keyTitle }
						sx={ this.sxClasses.keyTitle }
					>
						{ r3provider.getR3TextRes().tResServiceSubTitle }
					</Typography>
					<Typography
						{ ...theme.r3PathInfoDialog.value }
						sx={ this.sxClasses.value }
					>
						{ this.props.service }
					</Typography>
				</React.Fragment>
			);
		}

		let	typeContents: React.ReactNode;
		if(!r3IsEmptyString(this.props.type)){
			typeContents = (
				<React.Fragment>
					<Typography
						{ ...theme.r3PathInfoDialog.keyTitle }
						sx={ this.sxClasses.keyTitle }
					>
						{ r3provider.getR3TextRes().tResTypeSubTitle }
					</Typography>
					<Typography
						{ ...theme.r3PathInfoDialog.value }
						sx={ this.sxClasses.value }
					>
						{ this.props.type }
					</Typography>
				</React.Fragment>
			);
		}

		let	fullpathContents: React.ReactNode;
		if(!r3IsEmptyString(this.props.fullpath)){
			fullpathContents = (
				<React.Fragment>
					<Typography
						{ ...theme.r3PathInfoDialog.keyTitle }
						sx={ this.sxClasses.keyTitle }
					>
						{ r3provider.getR3TextRes().tResPathSubTitle }
					</Typography>
					<Typography
						{ ...theme.r3PathInfoDialog.value }
						sx={ this.sxClasses.value }
					>
						{ this.props.fullpath }
					</Typography>
				</React.Fragment>
			);
		}

		let	roleTokenButtons: React.ReactNode;
		if(!r3IsEmptyString(this.props.currentpath) && r3CompareCaseString(roleType, this.props.type) && r3IsEmptyString(this.props.service)){
			roleTokenButtons = this.getActionToRoleTokenButtons();
		}

		return (
			<React.Fragment>
				{ tenant }
				{ serviceContents }
				{ typeContents }
				{ fullpathContents }
				{ roleTokenButtons }
			</React.Fragment>
		);
	}

	//---------------------------------------------------------
	// render Manage Role Tokens Page
	//---------------------------------------------------------
	getManageRoleTokenInTableButtons(pos: number)
	{
		const { theme, r3provider } = this.props;

		return(
			<Box>
				<Tooltip
					title={ r3provider.getR3TextRes().tResDeleteRoleTokenTT }
					open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsNumber(this.state.tooltips.deleteRoleTokenButtonTooltip) || (this.state.tooltips.deleteRoleTokenButtonTooltip != pos)) ? false : true) }
				>
					<Button
						onClick={ (event) => this.handleDeleteRoleToken(event, pos) }
						onMouseEnter={ event => this.handleInTableTooltipChange(event, tooltipInTableValues.deleteRoleTokenButtonTooltip, pos) }
						onMouseLeave={ event => this.handleInTableTooltipChange(event, tooltipInTableValues.deleteRoleTokenButtonTooltip, -1) }
						{ ...theme.r3PathInfoDialog.manageDeleteButton }
						sx={ this.sxClasses.manageActionButton }
					>
						<DeleteIcon />
					</Button>
				</Tooltip>

				<Tooltip
					title={ r3provider.getR3TextRes().tResDispCodeButtonTT }
					open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsNumber(this.state.tooltips.dispCodeButtonTooltip) || (this.state.tooltips.dispCodeButtonTooltip != pos)) ? false : true) }
				>
					<Button
						onClick={ (event) => this.handleDispCode(event, pos) }
						onMouseEnter={ event => this.handleInTableTooltipChange(event, tooltipInTableValues.dispCodeButtonTooltip, pos) }
						onMouseLeave={ event => this.handleInTableTooltipChange(event, tooltipInTableValues.dispCodeButtonTooltip, -1) }
						{ ...theme.r3PathInfoDialog.manageDispCodeButton }
						sx={ this.sxClasses.manageActionButton }
					>
						<DispCodeIcon />
					</Button>
				</Tooltip>
			</Box>
		);
	}

	getNewRoleTokenPopover()
	{
		const { theme, r3provider } = this.props;

		return (
			<Popover
				open={ Boolean(this.state.newRoleTokenPopoverAnchorEl) }
				anchorEl={ this.state.newRoleTokenPopoverAnchorEl }
				onClose={ this.handleCancelNewRoleToken }
				{ ...theme.r3PathInfoDialog.newRoleTokenPopover }
				sx={ this.sxClasses.newRoleTokenPopover }
			>
				<Typography
					{ ...theme.r3PathInfoDialog.newRoleTokenPopoverTitle }
					sx={ this.sxClasses.newRoleTokenPopoverTitle }
				>
					{ r3provider.getR3TextRes().tResRoleTokenPopoverTitle }
				</Typography>

				<FormControlLabel
					control={
						<Checkbox
							disabled={ false }
							value={ 'noexpire' }
							checked={ this.state.newRoleTokenNoExpire }
							onChange={ this.handleNoExpireCheckboxChange }
							sx={ this.sxClasses.newRoleTokenExpireCheck }
						/>
					}
					label={
						<Typography
							{ ...theme.r3PathInfoDialog.newRoleTokenExpireLabel }
							sx={ this.sxClasses.newRoleTokenExpireLabel }
						>
							{ r3provider.getR3TextRes().tResRoleTokenExpireCheck }
						</Typography>
					}
					sx={ this.sxClasses.newRoleTokenExpireForm }
				/>

				<Button
					onClick={ this.handleConfirmNewRoleToken }
					{ ...theme.r3PathInfoDialog.createRoleTokenButton }
					sx={ this.sxClasses.createRoleTokenButton }
				>
					{ r3provider.getR3TextRes().tResNewRoleTokenButton }
					<CheckCircleIcon
						sx={ this.sxClasses.buttonIcon }
					/>
				</Button>

			</Popover>
		);
	}

	getManageRoleTokenTableHead()
	{
		const { theme, r3provider } = this.props;

		let	newRoleTokenPopover = this.getNewRoleTokenPopover();

		return (
			<TableHead
				sx={ this.sxClasses.tableHead }
			>
				<TableRow>
					<TableCell
						sx={ this.sxClasses.tableCell }
					>
						<React.Fragment>
							<Tooltip
								title={ r3provider.getR3TextRes().tResAddRoleTokenTT }
								open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsBoolean(this.state.tooltips.newRoleTokenButtonTooltip)) ? false : this.state.tooltips.newRoleTokenButtonTooltip) }
							>
								<Button
									onClick={ this.handleNewRoleToken }
									onMouseEnter={ event => this.handleNewRoleTokenButtonTooltipChange(event, true) }
									onMouseLeave={ event => this.handleNewRoleTokenButtonTooltipChange(event, false) }
									{ ...theme.r3PathInfoDialog.manageAddButton }
									sx={ this.sxClasses.manageAddButton }
								>
									<CreateRoleTokenIcon />
								</Button>
							</Tooltip>
							{ newRoleTokenPopover }
						</React.Fragment>
						<Typography
							{ ...theme.r3PathInfoDialog.textTableHead }
							sx={ this.sxClasses.textActionTableHead }
						>
							{ r3provider.getR3TextRes().tResActionTableHead }
						</Typography>
					</TableCell>
					<TableCell
						sx={ this.sxClasses.tableCell }
					>
						<Typography
							{ ...theme.r3PathInfoDialog.textTableHead }
							sx={ this.sxClasses.textTableHead }
						>
							{ r3provider.getR3TextRes().tResCreateTimeTableHead }
						</Typography>
					</TableCell>
					<TableCell
						sx={ this.sxClasses.tableCell }
					>
						<Typography
							{ ...theme.r3PathInfoDialog.textTableHead }
							sx={ this.sxClasses.textTableHead }
						>
							{ r3provider.getR3TextRes().tResExpireTimeTableHead }
						</Typography>
					</TableCell>
					<TableCell
						sx={ this.sxClasses.tableCell }
					>
						<Typography
							{ ...theme.r3PathInfoDialog.textTableHead }
							sx={ this.sxClasses.textTableHead }
						>
							{ r3provider.getR3TextRes().tResRoleTokenTableHead }
						</Typography>
					</TableCell>
				</TableRow>
			</TableHead>
		);
	}

	getManageRoleTokenTableBody()
	{
		const { theme } = this.props;

		if(!r3IsArray(this.state.roleTokenList)){
			return;
		}
		let	roleTokens = this.state.roleTokenList;

		return (
			<TableBody>
				{roleTokens.map( (item: RoleTokenMetadata, pos: number) => {
					if(pos < (this.state.manageRoleTokenPageNum * this.props.tableRawCount) || ((this.state.manageRoleTokenPageNum + 1) * this.props.tableRawCount) <= pos){
						return;
					}

					let	textTheme	= (item.newToken ? theme.r3PathInfoDialog.textNewTableContent : theme.r3PathInfoDialog.textTableContent);
					let	textCalsses	= (item.newToken ? this.sxClasses.textNewTableContent : this.sxClasses.textTableContent);

					return (
						<TableRow
							hover={ false }
							key={ pos }
							selected={ false }
						>
							<TableCell
								sx={ this.sxClasses.tableCell }
							>
								<Typography
									{ ...theme.r3PathInfoDialog.textTableContent }
									sx={ this.sxClasses.textTableContent }
								>
									{ this.getManageRoleTokenInTableButtons(pos) }
								</Typography>
							</TableCell>
							<TableCell
								sx={ this.sxClasses.tableCell }
							>
								<Tooltip
									title={ item.expire }
									open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsNumber(this.state.tooltips.detailCreateTimeTooltip) || (this.state.tooltips.detailCreateTimeTooltip != pos)) ? false : true) }
								>
									<Typography
										onMouseEnter={ (event: React.MouseEvent<HTMLElement>) => this.handleInTableTooltipChange(event, tooltipInTableValues.detailCreateTimeTooltip, pos) }
										onMouseLeave={ (event: React.MouseEvent<HTMLElement>) => this.handleInTableTooltipChange(event, tooltipInTableValues.detailCreateTimeTooltip, -1) }
										{ ...textTheme }
										sx={ textCalsses }
									>
										{ item.createTime }
									</Typography>
								</Tooltip>
							</TableCell>
							<TableCell
								sx={ this.sxClasses.tableCell }
							>
								<Tooltip
									title={ item.expire }
									open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsNumber(this.state.tooltips.detailExpireTimeTooltip) || (this.state.tooltips.detailExpireTimeTooltip != pos)) ? false : true) }
								>
									<Typography
										onMouseEnter={ (event: React.MouseEvent<HTMLElement>) => this.handleInTableTooltipChange(event, tooltipInTableValues.detailExpireTimeTooltip, pos) }
										onMouseLeave={ (event: React.MouseEvent<HTMLElement>) => this.handleInTableTooltipChange(event, tooltipInTableValues.detailExpireTimeTooltip, -1) }
										{ ...textTheme }
										sx={ textCalsses }
									>
										{ item.expireTime }
									</Typography>
								</Tooltip>
							</TableCell>
							<TableCell
								sx={ this.sxClasses.tableCell }
							>
								<Tooltip
									title={ item.token }
									open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsNumber(this.state.tooltips.detailRoleTokenTooltip) || (this.state.tooltips.detailRoleTokenTooltip != pos)) ? false : true) }
									slotProps={{ popper: { sx: this.sxClasses.wordBreakTooltip } }}
								>
									<Typography
										onMouseEnter={ (event: React.MouseEvent<HTMLElement>) => this.handleInTableTooltipChange(event, tooltipInTableValues.detailRoleTokenTooltip, pos) }
										onMouseLeave={ (event: React.MouseEvent<HTMLElement>) => this.handleInTableTooltipChange(event, tooltipInTableValues.detailRoleTokenTooltip, -1) }
										{ ...textTheme }
										sx={ textCalsses }
									>
										{ item.shortToken }
									</Typography>
								</Tooltip>
							</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		);
	}

	renderManageRoleToken()
	{
		const { theme } = this.props;

		if(!r3IsArray(this.state.roleTokenList)){
			return;
		}

		let	tablehead = this.getManageRoleTokenTableHead();
		let	tablebody = this.getManageRoleTokenTableBody();

		return (
			<React.Fragment>
				<Table
					{ ...theme.r3PathInfoDialog.table }
					sx={ this.sxClasses.table }
				>
					{tablehead}
					{tablebody}
				</Table>
				<TablePagination
					component={ 'div' }
					count={ this.state.roleTokenList.length }
					rowsPerPage={ this.props.tableRawCount }
					page={ this.state.manageRoleTokenPageNum }
					rowsPerPageOptions={ [] }
					onPageChange={ this.handleManageRoleTokenPageChange }
				/>
			</React.Fragment>
		);
	}

	//---------------------------------------------------------
	// render Display Role Token and Registration Code page
	//---------------------------------------------------------
	renderDispCode()
	{
		const { theme, r3provider } = this.props;

		let	roletokenContents = (
			<React.Fragment>
				<Typography
					{ ...theme.r3PathInfoDialog.keyTitle }
					sx={ this.sxClasses.keyTitle }
				>
					{ r3provider.getR3TextRes().tResRoleTokenSubTitle }
				</Typography>
				<TextField
					name={ roletokenTextFieldName }
					value={ this.state.selectedRoleToken }
					inputRef = { (element) => { this.roletokenInputElement = element; } }
					slotProps ={{
						input: {		sx: this.sxClasses.roletokenInputTextField	},
						htmlInput: {	style: { padding: 0 }						}
					}}
					{ ...theme.r3PathInfoDialog.roletokenTextField }
					sx={ this.sxClasses.roletokenTextField }
				/>
				<Tooltip
					title={ r3provider.getR3TextRes().tResCopyClipboardTT }
					open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsBoolean(this.state.tooltips.roletokenClipboardButtonTooltip)) ? false : this.state.tooltips.roletokenClipboardButtonTooltip) }
				>
					<Button
						onClick={ this.handleRoleTokenClipboard }
						onMouseEnter={ event => this.handleRoleTokenClipboardButtonTooltipChange(event, true) }
						onMouseLeave={ event => this.handleRoleTokenClipboardButtonTooltipChange(event, false) }
						{ ...theme.r3PathInfoDialog.roletokenClipboardButton }
						sx={ this.sxClasses.roletokenClipboardButton }
					>
						<CopyClipBoardIcon
							sx={ this.sxClasses.copyClipboardIcon }
						/>
						{ r3provider.getR3TextRes().tResCopyClipboardButton }
					</Button>
				</Tooltip>
			</React.Fragment>
		);

		let	timeContents = (
			<React.Fragment>
				<Typography
					{ ...theme.r3PathInfoDialog.keyTitle }
					sx={ this.sxClasses.keyTitle }
				>
					{ r3provider.getR3TextRes().tResRoleTokenTimeSubTitle }
				</Typography>
				<Typography
					{ ...theme.r3PathInfoDialog.value }
					sx={ this.sxClasses.value }
				>
					{ this.state.selectedRoleTokenTime }
				</Typography>
			</React.Fragment>
		);

		let	codeText: string | null = null;
		if(codeTypeValues.crcObject == this.state.codeType.substring(0, codeTypeValues.crcObject.length)){
			let	_crcKey = this.state.codeType.substring(codeTypeValues.crcObject.length);
			if(r3IsObject((this.state.objCrc)[_crcKey]) && !r3IsArray((this.state.objCrc)[_crcKey])){
				codeText = '';
				let	_crcSubobj: StringValObj = (this.state.objCrc)[_crcKey];
				Object.keys(_crcSubobj).forEach((subobjkey: string) => {
					if(0 < codeText!.length){
						codeText += '\n';
					}
					codeText += subobjkey;
					codeText += '=';
					codeText += _crcSubobj[subobjkey];
				});
			}
		}
		if(null == codeText){
			if(codeTypeValues.secretYaml == this.state.codeType){
				codeText = (null === this.state.codeSecretYaml ? '' : this.state.codeSecretYaml);
			}else if(codeTypeValues.sidecarYaml == this.state.codeType){
				codeText = (null === this.state.codeSidecarYaml ? '' : this.state.codeSidecarYaml);
			}else{	// codeTypeValues.uds == this.state.codeType
				codeText = (null === this.state.codeUDS ? '' : this.state.codeUDS);
			}
		}

		// make select items
		let	_margedCodeType = r3DeepClone(codeType);
		Object.keys(this.state.objCrc).forEach((crcKey: string) => {
			_margedCodeType.push({
				name:	crcKey,
				value:	codeTypeValues.crcObject + crcKey
			});
		});

		let	codeContents = (
			<React.Fragment>
				<Typography
					{ ...theme.r3PathInfoDialog.keyTitle }
					sx={ this.sxClasses.keyTitle }
				>
					{ r3provider.getR3TextRes().tResCodeSubTitle }
				</Typography>

				<Select
					value={ this.state.codeType }
					onChange={ this.handleCodeTypeChange }
					inputProps={{ sx: this.sxClasses.codeTypeSelectInput }}
					{ ...theme.r3PathInfoDialog.codeTypeSelect }
					sx={ this.sxClasses.codeTypeSelect }
				>
					{
						_margedCodeType.map( (item: { name: string; value: string }, pos: number) => {
							return (
								<MenuItem
									key={ pos }
									value={ item.value }
								>
									{ item.name }
								</MenuItem>
							);
						})
					}
				</Select>

				<TextField
					name={ codeTextFieldName }
					value={ codeText }
					inputRef = { (element) => { this.codeInputElement = element; } }
					slotProps ={{ input: { sx: this.sxClasses.codeInputTextField } }}
					{ ...theme.r3PathInfoDialog.codeTextField }
					sx={ this.sxClasses.codeTextField }
				/>

				<Tooltip
					title={ r3provider.getR3TextRes().tResCopyClipboardTT }
					open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsBoolean(this.state.tooltips.copyClipboardButtonTooltip)) ? false : this.state.tooltips.copyClipboardButtonTooltip) }
				>
					<Button
						onClick={ this.handleCopyClipboard }
						onMouseEnter={ event => this.handleCopyClipboardButtonTooltipChange(event, true) }
						onMouseLeave={ event => this.handleCopyClipboardButtonTooltipChange(event, false) }
						{ ...theme.r3PathInfoDialog.copyClipboardButton }
						sx={ this.sxClasses.copyClipboardButton }
					>
						<CopyClipBoardIcon
							sx={ this.sxClasses.copyClipboardIcon }
						/>
						{ r3provider.getR3TextRes().tResCopyClipboardButton }
					</Button>
				</Tooltip>
			</React.Fragment>
		);

		return (
			<React.Fragment>
				{ roletokenContents }
				{ timeContents }
				{ codeContents }
			</React.Fragment>
		);
	}

	//---------------------------------------------------------
	// render Common parts
	//---------------------------------------------------------
	getBackPageButton()
	{
		const { theme, r3provider } = this.props;

		if(!r3IsArray(this.state.stackedPreviousPages) || 0 == this.state.stackedPreviousPages.length){
			return;
		}

		return (
			<Button
				onClick={ this.handleBackPage }
				{ ...theme.r3PathInfoDialog.previousButton }
				sx={ this.sxClasses.previousButton }
			>
				{ r3provider.getR3TextRes().tResButtonPrevious }
				<BackPageIcon
					sx={ this.sxClasses.buttonIcon }
				/>
			</Button>
		);
	}

	//---------------------------------------------------------
	// render
	//---------------------------------------------------------
	render()
	{
		const { theme, r3provider } = this.props;

		let	title:			string;
		let contents:		React.ReactNode;
		let	backpagebutton:	React.ReactNode;
		if(pageTypeValues.pageManageRoleToken == this.state.pageType){
			title			= r3provider.getR3TextRes().tResRoleTokenDialogTitle;
			contents		= this.renderManageRoleToken();
			backpagebutton	= this.getBackPageButton();
		}else if(pageTypeValues.pageDisplayCode == this.state.pageType){
			title			= r3provider.getR3TextRes().tResDispCodeDialogTitle;
			contents		= this.renderDispCode();
			backpagebutton	= this.getBackPageButton();
		}else{	// pageTypeValues.pageMain == this.state.pageType
			title			= r3provider.getR3TextRes().tResPathInfoDialogTitle;
			contents		= this.renderMain();
		}

		return (
			<Dialog
				open={ this.props.open }
				onClose={ (event, reason) => this.handleClose(event, reason) }
				{ ...theme.r3PathInfoDialog.root }
				sx={ this.sxClasses.root }
			>
				<DialogTitle
					{ ...theme.r3PathInfoDialog.dialogTitle }
					sx={ this.sxClasses.dialogTitle }
				>
					<Typography
						{ ...theme.r3PathInfoDialog.title }
						sx={ this.sxClasses.title }
					>
						{ title }
					</Typography>
				</DialogTitle>

				<DialogContent
					sx={ this.sxClasses.dialogContent }
				>
					<R3MsgBox
						theme={ theme }
						message={ this.state.message }
					/>
					{ contents }
				</DialogContent>

				<DialogActions>
					{ backpagebutton }
					<Button
						onClick={ (event) => this.handleClose(event, 'buttonClick') }
						{ ...theme.r3PathInfoDialog.button }
						sx={ this.sxClasses.button }
					>
						{ r3provider.getR3TextRes().tResButtonClose }
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
