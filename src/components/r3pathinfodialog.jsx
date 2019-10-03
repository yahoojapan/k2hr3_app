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

import React						from 'react';
import ReactDOM						from 'react-dom';						// eslint-disable-line no-unused-vars
import PropTypes					from 'prop-types';

import { withTheme, withStyles }	from '@material-ui/core/styles';		// decorator
import Button						from '@material-ui/core/Button';
import Dialog						from '@material-ui/core/Dialog';
import DialogTitle					from '@material-ui/core/DialogTitle';
import DialogContent				from '@material-ui/core/DialogContent';
import DialogActions				from '@material-ui/core/DialogActions';
import Typography					from '@material-ui/core/Typography';
import TextField					from '@material-ui/core/TextField';
import Tooltip						from '@material-ui/core/Tooltip';
import Table						from '@material-ui/core/Table';
import TableBody					from '@material-ui/core/TableBody';
import TableCell					from '@material-ui/core/TableCell';
import TableHead					from '@material-ui/core/TableHead';
import TablePagination				from '@material-ui/core/TablePagination';
import TableRow						from '@material-ui/core/TableRow';
import Popover						from '@material-ui/core/Popover';
import FormControlLabel				from '@material-ui/core/FormControlLabel';
import Checkbox						from '@material-ui/core/Checkbox';
import Select						from '@material-ui/core/Select';
import MenuItem						from '@material-ui/core/MenuItem';		// for select

import CheckCircleIcon				from '@material-ui/icons/CheckCircle';
import CopyClipBoardIcon			from '@material-ui/icons/AssignmentTurnedInRounded';
import SettingActionIcon			from '@material-ui/icons/SettingsApplicationsRounded';
import CreateRoleTokenIcon			from '@material-ui/icons/AddBoxRounded';
import DeleteIcon					from '@material-ui/icons/Delete';
import DispCodeIcon					from '@material-ui/icons/ViewListRounded';
import BackPageIcon					from '@material-ui/icons/Cancel';

import R3MsgBox						from './r3msgbox';						// Message Box
import R3Message					from '../util/r3message';

import { r3PathInfoDialog }			from './r3styles';
import { roleType, errorType }		from '../util/r3types';
import { r3IsEmptyEntity, r3IsEmptyEntityObject, r3IsEmptyStringObject, r3CompareCaseString, r3IsEmptyString, r3IsSafeTypedEntity, r3CompareString, convertISOStringToLocaleString, getDiffTimeFromISOString, diffRoundType, getDiffRoundStringFromISOString } from '../util/r3util';

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
	sidecarYaml:	'sidecar'
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

const codeTextFieldName	= 'register-code-textfield';

//
// Path Information Class
//
@withTheme
@withStyles(r3PathInfoDialog)
export default class R3PathInfoDialog extends React.Component
{
	static contextTypes = {
		r3Context:		PropTypes.object.isRequired
	};

	static propTypes = {
		r3provider:		PropTypes.object.isRequired,
		open:			PropTypes.bool.isRequired,
		tenant:			PropTypes.object,
		service:		PropTypes.string,
		type:			PropTypes.string,
		fullpath:		PropTypes.string,
		currentpath:	PropTypes.string,
		tableRawCount:	PropTypes.number,
		onClose:		PropTypes.func.isRequired
	};

	static defaultProps = {
		tenant:			null,
		service:		null,
		type:			null,
		fullpath:		null,
		currentpath:	null,
		tableRawCount:	5,
	};

	codeInputElement	= null;													// input textfield for registration code.

	state = {
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

		// In openstack page
		selectedRoleToken:					null,
		selectedRoleTokenTime:				null,
		codeType:							codeTypeValues.uds,
		codeUDS:							null,
		codeSecretYaml:						null,
		codeSidecarYaml:					null,

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
			copyClipboardButtonTooltip:			false
		}
	};

	constructor(props)
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
		this.handleCopyClipboard 			= this.handleCopyClipboard.bind(this);
	}

	// [NOTE]
	// Use getDerivedStateFromProps by deprecating componentWillReceiveProps in React 17.x.
	// The only purpose is to set the state data from props when the dialog changes from hidden to visible.
	//
	static getDerivedStateFromProps(nextProps, prevState)
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
				codeSidecarYaml:		null
			};
		}
		return null;														// Return null to indicate no change to state.
	}

	handleClose(event)														// eslint-disable-line no-unused-vars
	{
		this.props.onClose(event);
	}

	handleBackPage(event)													// eslint-disable-line no-unused-vars
	{
		if(!r3IsSafeTypedEntity(this.state.stackedPreviousPages, 'array') || 0 == this.state.stackedPreviousPages.length){
			return;
		}

		let	newStackedPages	= this.state.stackedPreviousPages.slice();
		let	prevPageType	= newStackedPages.pop();

		this.setState({
			message:				null,
			pageType:				prevPageType,
			stackedPreviousPages:	newStackedPages
		});
	}

	handleManageRoleToken(event)											// eslint-disable-line no-unused-vars
	{
		const { r3provider } = this.props;

		let	_comErrorMessage = r3provider.getR3TextRes().eCommunication;
		let	_newStackedPages = this.state.stackedPreviousPages.slice();
		_newStackedPages.push(pageTypeValues.pageMain);

		// Get Role Token Lists
		this.getRoleTokenList((error, resobj) =>
		{
			if(null !== error){
				console.info(error.message);
				this.setState({
					message:	new R3Message(_comErrorMessage + error.message, errorType)
				});
				return;
			}

			// convert and set for display
			this.complementRoleTokenList(resobj);

			// sort
			this.sortRoleTokenList(resobj);

			this.setState({
				message:				null,
				pageType:				pageTypeValues.pageManageRoleToken,
				stackedPreviousPages:	_newStackedPages,
				manageRoleTokenPageNum:	0,
				roleTokenList:			resobj,
			});
		});
	}

	handleDispCodeNewRoleToken(event)											// eslint-disable-line no-unused-vars
	{
		const { r3provider } = this.props;

		let	_comErrorMessage = r3provider.getR3TextRes().eCommunication;

		// get new role token(expire is default)
		this.getNewRoleToken(null, (error, resobj) =>
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

			// keep new role token
			let	_newRoleToken = resobj.roleToken;

			// remake role token list
			this.getRoleTokenList((error, resobj) =>
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

				// convert and set for display
				this.complementRoleTokenList(resobj, _newRoleToken);

				// sort
				this.sortRoleTokenList(resobj);

				// search new role token in result(token list)
				for(let cnt = 0; cnt < resobj.length; ++cnt){
					if(resobj[cnt].token == _newRoleToken){
						// found
						let	newStackedPages	= this.state.stackedPreviousPages.slice();
						newStackedPages.push(pageTypeValues.pageMain);

						// update
						this.setState({
							message:				null,
							pageType:				pageTypeValues.pageDisplayCode,
							stackedPreviousPages:	newStackedPages,
							manageRoleTokenPageNum:	0,
							selectedRoleToken:		resobj[cnt].token,
							selectedRoleTokenTime:	resobj[cnt].dispTime,
							codeUDS:				resobj[cnt].codeUDS,
							codeSecretYaml:			resobj[cnt].codeSecretYaml,
							codeSidecarYaml:		resobj[cnt].codeSidecarYaml
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

	handleDispCode(event, pos)													// eslint-disable-line no-unused-vars
	{
		if(!r3IsSafeTypedEntity(this.state.roleTokenList, 'array') || pos < 0 || this.state.roleTokenList.length <= pos || r3IsEmptyEntity(this.state.roleTokenList[pos])){
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
			codeSidecarYaml:		this.state.roleTokenList[pos].codeSidecarYaml
		});
	}

	handleManageRoleTokenPageChange(event, page)							// eslint-disable-line no-unused-vars
	{
		this.setState({
			message:				null,
			manageRoleTokenPageNum:	page
		});
	}

	handleNewRoleToken(event)
	{
		this.setState({
			newRoleTokenButtonTooltip:		false,
			newRoleTokenPopoverAnchorEl:	event.currentTarget,
			newRoleTokenNoExpire:			false
		});
	}

	handleCancelNewRoleToken(event)											// eslint-disable-line no-unused-vars
	{
		this.setState({
			newRoleTokenButtonTooltip:		false,
			newRoleTokenPopoverAnchorEl:	null,
			newRoleTokenNoExpire:			false
		});
	}

	handleNoExpireCheckboxChange(event)
	{
		let	isChecked = r3IsEmptyEntityObject(event.target, 'checked') ? null : event.target.checked;

		if(this.state.newRoleTokenNoExpire === isChecked){
			return;
		}

		this.setState({
			newRoleTokenNoExpire:	isChecked
		});
	}

	handleConfirmNewRoleToken(event)											// eslint-disable-line no-unused-vars
	{
		const { r3provider } = this.props;

		let	_comErrorMessage = r3provider.getR3TextRes().eCommunication;
		let	expire = (this.state.newRoleTokenNoExpire ? 0 : null);

		// get new role token
		this.getNewRoleToken(expire, (error, resobj) =>
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

			// new role token
			let	_newRoleToken = resobj.roleToken;

			// remake role token list
			this.getRoleTokenList((error, resobj) =>
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

				// convert and set for display
				this.complementRoleTokenList(resobj, _newRoleToken);

				// sort
				this.sortRoleTokenList(resobj);

				this.setState({
					message:						null,
					manageRoleTokenPageNum:			0,
					roleTokenList:					resobj,
					newRoleTokenButtonTooltip:		false,
					newRoleTokenPopoverAnchorEl:	null,
					newRoleTokenNoExpire:			false
				});
			});
		});
	}

	handleDeleteRoleToken(event, pos)										// eslint-disable-line no-unused-vars
	{
		const { r3provider } = this.props;

		let	_comErrorMessage = r3provider.getR3TextRes().eCommunication;

		if(isNaN(pos) || pos < 0 || this.state.roleTokenList.length <= pos){
			return;
		}
		let	roletoken = this.state.roleTokenList[pos].token;

		// delete role token
		this.deleteRoleToken(roletoken, (error) =>
		{
			if(null !== error){
				console.info(error.message);
				this.setState({
					message:	new R3Message(_comErrorMessage + error.message, errorType),
				});
				return;
			}

			// remake role token list
			this.getRoleTokenList((error, resobj) =>
			{
				if(null !== error){
					console.info(error.message);
					this.setState({
						message:	new R3Message(_comErrorMessage + error.message, errorType),
					});
					return;
				}

				// convert and set for display
				this.complementRoleTokenList(resobj);

				// sort
				this.sortRoleTokenList(resobj);

				this.setState({
					message:		null,
					roleTokenList:	resobj
				});
			});
		});
	}

	handleManageRoleTokenButtonTooltipChange = (event, isOpen) =>			// eslint-disable-line no-unused-vars
	{
		this.setState({
			tooltips: {
				manageRoleTokenButtonTooltip:	isOpen
			}
		});
	}

	handleDispCodeNewRoleTokenButtonTooltipChange = (event, isOpen) =>		// eslint-disable-line no-unused-vars
	{
		this.setState({
			tooltips: {
				dispCodeNewRoleTokenButtonTooltip:	isOpen
			}
		});
	}

	handleNewRoleTokenButtonTooltipChange = (event, isOpen) =>				// eslint-disable-line no-unused-vars
	{
		this.setState({
			tooltips: {
				newRoleTokenButtonTooltip:			isOpen
			}
		});
	}

	handleInTableTooltipChange = (event, type, extData) =>					// eslint-disable-line no-unused-vars
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
	}

	handleCopyClipboardButtonTooltipChange = (event, isOpen) =>				// eslint-disable-line no-unused-vars
	{
		this.setState({
			tooltips: {
				copyClipboardButtonTooltip:	isOpen
			}
		});
	}

	handleCopyClipboard(event)												// eslint-disable-line no-unused-vars
	{
		if(r3IsEmptyEntityObject(this.codeInputElement, 'select') || !r3IsSafeTypedEntity(this.codeInputElement.select, 'function')){
			return;
		}
		this.codeInputElement.select();				// select all text in text field
		document.execCommand('copy');				// cpoy to clipboard
		window.getSelection().removeAllRanges();	// unselect text
		this.codeInputElement.blur();				// off furcus

		this.setState({
			tooltips: {
				copyClipboardButtonTooltip:	false
			}
		});
	}

	handleCodeTypeChange(event)
	{
		//let	key	= r3IsEmptyEntityObject(event.target, 'name') ? null : event.target.name;
		let	newValue= r3IsEmptyEntityObject(event.target, 'value') ? null : event.target.value;

		if(r3IsEmptyString(newValue)){
			console.warn('Changed new register code type is wrong.');
			return;
		}
		if(newValue === this.state.codeType){
			// nothing to update
			return;
		}

		this.setState({
			codeType:	newValue
		});
	}

	//
	// Get Role Token List
	//
	getRoleTokenList(callback)
	{
		const { r3provider } = this.props;

		let	_callback	= callback;

		r3provider.getRoleTokenList(this.props.tenant, this.props.currentpath, true, (error, resobj) =>
		{
			if(null !== error){
				console.info(error.message);
				_callback(error, null);
				return;
			}
			if(null === resobj){
				error = new Error('Could not get role token list');
				console.error(error.message);
				_callback(error, null);
				return;
			}
			_callback(null, resobj);
		});
	}

	compareRoleToken = (token1, token2) =>
	{
		let	result = this.state.roleTokenSortNormal ? 1 : -1;
		if(r3IsEmptyString(token1[this.state.roleTokenSortKey]) && r3IsEmptyString(token2[this.state.roleTokenSortKey])){
			result *= 0;
		}else if(r3IsEmptyString(token1[this.state.roleTokenSortKey])){
			result *= 1;
		}else if(r3IsEmptyString(token2[this.state.roleTokenSortKey])){
			result *= -1;
		}else{
			if(token1[this.state.roleTokenSortKey] > token2[this.state.roleTokenSortKey]){
				result *= 1;
			}else if(token1[this.state.roleTokenSortKey] < token2[this.state.roleTokenSortKey]){
				result *= -1;
			}else{
				result *= 0;
			}
		}
		return result;
	}

	sortRoleTokenList(roleTokens)
	{
		if(!r3IsSafeTypedEntity(roleTokens, 'array')){
			return;
		}
		roleTokens.sort(this.compareRoleToken);
	}

	complementRoleTokenList(roleTokens, newRoleToken)
	{
		const { r3provider } = this.props;

		if(!r3IsSafeTypedEntity(roleTokens, 'array')){
			return;
		}

		let	unknownString = r3provider.getR3TextRes().tResUnknownTimeUnit;
		for(let cnt = 0; cnt < roleTokens.length; ++cnt){
			let	isNewToken		= r3CompareString(roleTokens[cnt].token, newRoleToken);
			let	shortToken		= r3IsEmptyString(roleTokens[cnt].token) ? '...' : (roleTokens[cnt].token.slice(0, 8) + '...');
			let	createTimeString= convertISOStringToLocaleString(roleTokens[cnt].date);
			let	expireTimeString= convertISOStringToLocaleString(roleTokens[cnt].expire);
			let	expireUnixTime	= getDiffTimeFromISOString(roleTokens[cnt].expire, roleTokens[cnt].date);
			let	expireObject	= getDiffRoundStringFromISOString(roleTokens[cnt].expire, roleTokens[cnt].date);
			let	expireString;
			if(diffRoundType.days == expireObject.type){
				expireString	= String(expireObject.value) + r3provider.getR3TextRes().tResDaysTimeUnit;
			}else if(diffRoundType.hours == expireObject.type){
				expireString	= String(expireObject.value) + r3provider.getR3TextRes().tResHoursTimeUnit;
			}else if(diffRoundType.minutes == expireObject.type){
				expireString	= String(expireObject.value) + r3provider.getR3TextRes().tResMinutesTimeUnit;
			}else{	// diffRoundType.seconds == expireObject.type
				expireString	= String(expireObject.value) + r3provider.getR3TextRes().tResSecondsTimeUnit;
			}
			let	dispTime		= (null == createTimeString ? unknownString : createTimeString) + ' ( ' + (null == expireTimeString ? unknownString : expireTimeString) + ' )';
			let	codeUDS			= r3provider.getUserDataScript(roleTokens[cnt].registerpath);
			let	codeSecretYaml	= r3provider.getSecretYaml(roleTokens[cnt].token);
			let	codeSidecarYaml	= r3provider.getSidecarYaml(this.props.fullpath);

			// set
			roleTokens[cnt].newToken		= isNewToken;
			roleTokens[cnt].shortToken		= shortToken;
			roleTokens[cnt].createTime		= (null == createTimeString ? unknownString : createTimeString);
			roleTokens[cnt].expireUnixTime	= expireUnixTime;
			roleTokens[cnt].expireTime		= expireString;
			roleTokens[cnt].dispTime		= dispTime;
			roleTokens[cnt].codeUDS			= codeUDS;
			roleTokens[cnt].codeSecretYaml	= codeSecretYaml;
			roleTokens[cnt].codeSidecarYaml	= codeSidecarYaml;
		}
	}

	//
	// Get New Role Token
	//
	getNewRoleToken(expire, callback)
	{
		const { r3provider } = this.props;

		let	_callback	= callback;

		r3provider.getNewRoleToken(this.props.tenant, this.props.currentpath, expire, (error, resobj) =>
		{
			if(null !== error){
				console.info(error.message);
				_callback(error, null);
				return;
			}
			if(null === resobj || r3IsEmptyString(resobj.roleToken, true)){
				error = new Error('Failed to create new role token');
				console.error(error.message);
				_callback(error, null);
				return;
			}
			_callback(null, resobj);
		});
	}

	//
	// Delete Role Token
	//
	deleteRoleToken(roletoken, callback)
	{
		const { r3provider } = this.props;

		let	_callback	= callback;

		r3provider.deleteRoleToken(this.props.tenant, roletoken, (error) =>
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
		const { theme, classes, r3provider } = this.props;

		return (
			<React.Fragment>
				<Typography
					{ ...theme.r3PathInfoDialog.keyTitle }
					className={ classes.keyTitle }
				>
					{ r3provider.getR3TextRes().tResRoleTokenSubTitle }
				</Typography>
				<Tooltip
					title={ r3provider.getR3TextRes().tResRoleTokenManageTT }
					open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.manageRoleTokenButtonTooltip, 'boolean')) ? false : this.state.tooltips.manageRoleTokenButtonTooltip) }
				>
					<Button
						onClick={ this.handleManageRoleToken }
						onMouseEnter={ event => this.handleManageRoleTokenButtonTooltipChange(event, true) }
						onMouseLeave={ event => this.handleManageRoleTokenButtonTooltipChange(event, false) }
						{ ...theme.r3PathInfoDialog.manageRoleTokenButton }
						className={ classes.roleTokenButton }
					>
						<SettingActionIcon
							className={ classes.roleTokenButtonIcon }
						/>
						{ r3provider.getR3TextRes().tResRoleTokenManageButton }
					</Button>
				</Tooltip>
				<Tooltip
					title={ r3provider.getR3TextRes().tResDispCodeNewRoleTokenTT }
					open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.dispCodeNewRoleTokenButtonTooltip, 'boolean')) ? false : this.state.tooltips.dispCodeNewRoleTokenButtonTooltip) }
				>
					<Button
						onClick={ this.handleDispCodeNewRoleToken }
						onMouseEnter={ event => this.handleDispCodeNewRoleTokenButtonTooltipChange(event, true) }
						onMouseLeave={ event => this.handleDispCodeNewRoleTokenButtonTooltipChange(event, false) }
						{ ...theme.r3PathInfoDialog.dispCodeNewRoleTokenButton }
						className={ classes.roleTokenButton }
					>
						<SettingActionIcon
							className={ classes.roleTokenButtonIcon }
						/>
						{ r3provider.getR3TextRes().tResDispCodeNewRoleToken }
					</Button>
				</Tooltip>
			</React.Fragment>
		);
	}

	renderMain()
	{
		const { theme, classes, r3provider } = this.props;

		let	tenant;
		let	tenantKey = (
			<Typography
				{ ...theme.r3PathInfoDialog.keyTitle }
				className={ classes.keyTitle }
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
						className={ classes.valueItalic }
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
						className={ classes.value }
					>
						{ this.props.tenant.display }
					</Typography>
				</React.Fragment>
			);
		}

		let	serviceContents;
		if(!r3IsEmptyString(this.props.service)){
			serviceContents = (
				<React.Fragment>
					<Typography
						{ ...theme.r3PathInfoDialog.keyTitle }
						className={ classes.keyTitle }
					>
						{ r3provider.getR3TextRes().tResServiceSubTitle }
					</Typography>
					<Typography
						{ ...theme.r3PathInfoDialog.value }
						className={ classes.value }
					>
						{ this.props.service }
					</Typography>
				</React.Fragment>
			);
		}

		let	typeContents;
		if(!r3IsEmptyString(this.props.type)){
			typeContents = (
				<React.Fragment>
					<Typography
						{ ...theme.r3PathInfoDialog.keyTitle }
						className={ classes.keyTitle }
					>
						{ r3provider.getR3TextRes().tResTypeSubTitle }
					</Typography>
					<Typography
						{ ...theme.r3PathInfoDialog.value }
						className={ classes.value }
					>
						{ this.props.type }
					</Typography>
				</React.Fragment>
			);
		}

		let	fullpathContents;
		if(!r3IsEmptyString(this.props.fullpath)){
			fullpathContents = (
				<React.Fragment>
					<Typography
						{ ...theme.r3PathInfoDialog.keyTitle }
						className={ classes.keyTitle }
					>
						{ r3provider.getR3TextRes().tResPathSubTitle }
					</Typography>
					<Typography
						{ ...theme.r3PathInfoDialog.value }
						className={ classes.value }
					>
						{ this.props.fullpath }
					</Typography>
				</React.Fragment>
			);
		}

		let	roleTokenButtons;
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
	getManageRoleTokenInTableButtons(pos)
	{
		const { theme, classes, r3provider } = this.props;

		return(
			<div>
				<Tooltip
					title={ r3provider.getR3TextRes().tResDeleteRoleTokenTT }
					open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.deleteRoleTokenButtonTooltip, 'number') || (this.state.tooltips.deleteRoleTokenButtonTooltip != pos)) ? false : true) }
				>
					<Button
						onClick={ (event) => this.handleDeleteRoleToken(event, pos) }
						onMouseEnter={ event => this.handleInTableTooltipChange(event, tooltipInTableValues.deleteRoleTokenButtonTooltip, pos) }
						onMouseLeave={ event => this.handleInTableTooltipChange(event, tooltipInTableValues.deleteRoleTokenButtonTooltip, -1) }
						{ ...theme.r3PathInfoDialog.manageDeleteButton }
						className={ classes.manageActionButton }
					>
						<DeleteIcon />
					</Button>
				</Tooltip>

				<Tooltip
					title={ r3provider.getR3TextRes().tResDispCodeButtonTT }
					open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.dispCodeButtonTooltip, 'number') || (this.state.tooltips.dispCodeButtonTooltip != pos)) ? false : true) }
				>
					<Button
						onClick={ (event) => this.handleDispCode(event, pos) }
						onMouseEnter={ event => this.handleInTableTooltipChange(event, tooltipInTableValues.dispCodeButtonTooltip, pos) }
						onMouseLeave={ event => this.handleInTableTooltipChange(event, tooltipInTableValues.dispCodeButtonTooltip, -1) }
						{ ...theme.r3PathInfoDialog.manageDispCodeButton }
						className={ classes.manageActionButton }
					>
						<DispCodeIcon />
					</Button>
				</Tooltip>

			</div>
		);
	}

	getNewRoleTokenPopover()
	{
		const { theme, classes, r3provider } = this.props;

		return (
			<Popover
				open={ Boolean(this.state.newRoleTokenPopoverAnchorEl) }
				anchorEl={ this.state.newRoleTokenPopoverAnchorEl }
				onClose={ this.handleCancelNewRoleToken }
				{ ...theme.r3PathInfoDialog.newRoleTokenPopover }
				className={ classes.newRoleTokenPopover }
			>
				<Typography
					{ ...theme.r3PathInfoDialog.newRoleTokenPopoverTitle }
					className={ classes.newRoleTokenPopoverTitle }
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
							className={ classes.newRoleTokenExpireCheck }
						/>
					}
					label={
						<Typography
							{ ...theme.r3PathInfoDialog.newRoleTokenExpireLabel }
							className={ classes.newRoleTokenExpireLabel }
						>
							{ r3provider.getR3TextRes().tResRoleTokenExpireCheck }
						</Typography>
					}
					className={ classes.newRoleTokenExpireForm }
				/>

				<Button
					onClick={ this.handleConfirmNewRoleToken }
					{ ...theme.r3PathInfoDialog.createRoleTokenButton }
					className={ classes.createRoleTokenButton }
				>
					{ r3provider.getR3TextRes().tResNewRoleTokenButton }
					<CheckCircleIcon
						className={ classes.buttonIcon }
					/>
				</Button>

			</Popover>
		);
	}

	getManageRoleTokenTableHead()
	{
		const { theme, classes, r3provider } = this.props;

		let	newRoleTokenPopover = this.getNewRoleTokenPopover();

		return (
			<TableHead
				className={ classes.tableHead }
			>
				<TableRow>
					<TableCell
						className={ classes.tableCell }
					>
						<Tooltip
							title={ r3provider.getR3TextRes().tResAddRoleTokenTT }
							open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.newRoleTokenButtonTooltip, 'boolean')) ? false : this.state.tooltips.newRoleTokenButtonTooltip) }
						>
							<React.Fragment>
								<Button
									onClick={ this.handleNewRoleToken }
									onMouseEnter={ event => this.handleNewRoleTokenButtonTooltipChange(event, true) }
									onMouseLeave={ event => this.handleNewRoleTokenButtonTooltipChange(event, false) }
									{ ...theme.r3PathInfoDialog.manageAddButton }
									className={ classes.manageAddButton }
								>
									<CreateRoleTokenIcon />
								</Button>
								{ newRoleTokenPopover }
							</React.Fragment>
						</Tooltip>
						<Typography
							{ ...theme.r3PathInfoDialog.textTableHead }
							className={ classes.textActionTableHead }
						>
							{ r3provider.getR3TextRes().tResActionTableHead }
						</Typography>
					</TableCell>
					<TableCell
						className={ classes.tableCell }
					>
						<Typography
							{ ...theme.r3PathInfoDialog.textTableHead }
							className={ classes.textTableHead }
						>
							{ r3provider.getR3TextRes().tResCreateTimeTableHead }
						</Typography>
					</TableCell>
					<TableCell
						className={ classes.tableCell }
					>
						<Typography
							{ ...theme.r3PathInfoDialog.textTableHead }
							className={ classes.textTableHead }
						>
							{ r3provider.getR3TextRes().tResExpireTimeTableHead }
						</Typography>
					</TableCell>
					<TableCell
						className={ classes.tableCell }
					>
						<Typography
							{ ...theme.r3PathInfoDialog.textTableHead }
							className={ classes.textTableHead }
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
		const { theme, classes } = this.props;

		if(!r3IsSafeTypedEntity(this.state.roleTokenList, 'array')){
			return;
		}
		let	roleTokens = this.state.roleTokenList;

		return (
			<TableBody>
				{roleTokens.map( (item, pos) => {
					if(pos < (this.state.manageRoleTokenPageNum * this.props.tableRawCount) || ((this.state.manageRoleTokenPageNum + 1) * this.props.tableRawCount) <= pos){
						return;
					}

					let	textTheme	= (item.newToken ? theme.r3PathInfoDialog.textNewTableContent : theme.r3PathInfoDialog.textTableContent);
					let	textCalsses	= (item.newToken ? classes.textNewTableContent : classes.textTableContent);

					return (
						<TableRow
							hover={ false }
							key={ pos }
							selected={ false }
						>
							<TableCell
								className={ classes.tableCell }
							>
								<Typography
									{ ...theme.r3PathInfoDialog.textTableContent }
									className={ classes.textTableContent }
								>
									{ this.getManageRoleTokenInTableButtons(pos) }
								</Typography>
							</TableCell>
							<TableCell
								className={ classes.tableCell }
							>
								<Tooltip
									title={ item.expire }
									open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.detailCreateTimeTooltip, 'number') || (this.state.tooltips.detailCreateTimeTooltip != pos)) ? false : true) }
								>
									<Typography
										onMouseEnter={ event => this.handleInTableTooltipChange(event, tooltipInTableValues.detailCreateTimeTooltip, pos) }
										onMouseLeave={ event => this.handleInTableTooltipChange(event, tooltipInTableValues.detailCreateTimeTooltip, -1) }
										{ ...textTheme }
										className={ textCalsses }
									>
										{ item.createTime }
									</Typography>
								</Tooltip>
							</TableCell>
							<TableCell
								className={ classes.tableCell }
							>
								<Tooltip
									title={ item.expire }
									open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.detailExpireTimeTooltip, 'number') || (this.state.tooltips.detailExpireTimeTooltip != pos)) ? false : true) }
								>
									<Typography
										onMouseEnter={ event => this.handleInTableTooltipChange(event, tooltipInTableValues.detailExpireTimeTooltip, pos) }
										onMouseLeave={ event => this.handleInTableTooltipChange(event, tooltipInTableValues.detailExpireTimeTooltip, -1) }
										{ ...textTheme }
										className={ textCalsses }
									>
										{ item.expireTime }
									</Typography>
								</Tooltip>
							</TableCell>
							<TableCell
								className={ classes.tableCell }
							>
								<Tooltip
									title={ item.token }
									open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.detailRoleTokenTooltip, 'number') || (this.state.tooltips.detailRoleTokenTooltip != pos)) ? false : true) }
									PopperProps={ { className: classes.wordBreakTooltip } }
								>
									<Typography
										onMouseEnter={ event => this.handleInTableTooltipChange(event, tooltipInTableValues.detailRoleTokenTooltip, pos) }
										onMouseLeave={ event => this.handleInTableTooltipChange(event, tooltipInTableValues.detailRoleTokenTooltip, -1) }
										{ ...textTheme }
										className={ textCalsses }
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
		const { theme, classes } = this.props;

		if(!r3IsSafeTypedEntity(this.state.roleTokenList, 'array')){
			return;
		}

		let	tablehead = this.getManageRoleTokenTableHead();
		let	tablebody = this.getManageRoleTokenTableBody();

		return (
			<React.Fragment>
				<Table
					{ ...theme.r3PathInfoDialog.table }
					className={ classes.table }
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
					onChangePage={ this.handleManageRoleTokenPageChange }
				/>
			</React.Fragment>
		);
	}

	//---------------------------------------------------------
	// render Display Role Token and Registration Code page
	//---------------------------------------------------------
	renderDispCode()
	{
		const { theme, classes, r3provider } = this.props;

		let	roletokenContents = (
			<React.Fragment>
				<Typography
					{ ...theme.r3PathInfoDialog.keyTitle }
					className={ classes.keyTitle }
				>
					{ r3provider.getR3TextRes().tResRoleTokenSubTitle }
				</Typography>
				<Typography
					{ ...theme.r3PathInfoDialog.value }
					className={ classes.value }
				>
					{ this.state.selectedRoleToken }
				</Typography>
			</React.Fragment>
		);

		let	timeContents = (
			<React.Fragment>
				<Typography
					{ ...theme.r3PathInfoDialog.keyTitle }
					className={ classes.keyTitle }
				>
					{ r3provider.getR3TextRes().tResRoleTokenTimeSubTitle }
				</Typography>
				<Typography
					{ ...theme.r3PathInfoDialog.value }
					className={ classes.value }
				>
					{ this.state.selectedRoleTokenTime }
				</Typography>
			</React.Fragment>
		);

		let	codeText;
		if(codeTypeValues.secretYaml == this.state.codeType){
			codeText = (null === this.state.codeSecretYaml ? '' : this.state.codeSecretYaml);
		}else if(codeTypeValues.sidecarYaml == this.state.codeType){
			codeText = (null === this.state.codeSidecarYaml ? '' : this.state.codeSidecarYaml);
		}else{	// codeTypeValues.uds == this.state.codeType
			codeText = (null === this.state.codeUDS ? '' : this.state.codeUDS);
		}

		let	codeContents = (
			<React.Fragment>
				<Typography
					{ ...theme.r3PathInfoDialog.keyTitle }
					className={ classes.keyTitle }
				>
					{ r3provider.getR3TextRes().tResCodeSubTitle }
				</Typography>

				<Select
					value={ this.state.codeType }
					onChange={ this.handleCodeTypeChange }
					inputProps={{ className: classes.codeTypeSelectInput }}
					{ ...theme.r3PathInfoDialog.codeTypeSelect }
					className={ classes.codeTypeSelect }
				>
					{
						codeType.map( (item, pos) => {
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
					InputProps={{ className: classes.codeInputTextField }}
					{ ...theme.r3PathInfoDialog.codeTextField }
					className={ classes.codeTextField }
				/>

				<Tooltip
					title={ r3provider.getR3TextRes().tResCopyClipboardTT }
					open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.copyClipboardButtonTooltip, 'boolean')) ? false : this.state.tooltips.copyClipboardButtonTooltip) }
				>
					<Button
						onClick={ this.handleCopyClipboard  }
						onMouseEnter={ event => this.handleCopyClipboardButtonTooltipChange(event, true) }
						onMouseLeave={ event => this.handleCopyClipboardButtonTooltipChange(event, false) }
						{ ...theme.r3PathInfoDialog.copyClipboardButton }
						className={ classes.copyClipboardButton }
					>
						<CopyClipBoardIcon
							className={ classes.copyClipboardIcon }
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
		const { theme, classes, r3provider } = this.props;

		if(!r3IsSafeTypedEntity(this.state.stackedPreviousPages, 'array') || 0 == this.state.stackedPreviousPages.length){
			return;
		}

		return (
			<Button
				onClick={ this.handleBackPage }
				{ ...theme.r3PathInfoDialog.backPageButton }
				className={ classes.backPageButton }
			>
				{ r3provider.getR3TextRes().tResBackPageButton }
				<BackPageIcon
					className={ classes.buttonIcon }
				/>
			</Button>
		);
	}

	//---------------------------------------------------------
	// render
	//---------------------------------------------------------
	render()
	{
		const { theme, classes, r3provider } = this.props;

		let	title;
		let contents;
		let	backpagebutton;
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
				onClose={ this.handleClose }
				{ ...theme.r3PathInfoDialog.root }
				className={ classes.root }
			>
				<DialogTitle
					{ ...theme.r3PathInfoDialog.dialogTitle }
					className={ classes.dialogTitle }
				>
					<Typography
						{ ...theme.r3PathInfoDialog.title }
						className={ classes.title }
					>
						{ title }
					</Typography>
				</DialogTitle>

				<DialogContent
					className={ classes.dialogContent }
				>
					<R3MsgBox message={ this.state.message }/>
					{ contents }
				</DialogContent>

				<DialogActions>
					{ backpagebutton }
					<Button
						onClick={ this.handleClose }
						{ ...theme.r3PathInfoDialog.button }
						className={ classes.button }
					>
						{ r3provider.getR3TextRes().tResButtonClose }
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
