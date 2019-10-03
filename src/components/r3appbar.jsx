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
 * CREATE:   Tue Aug 15 2017
 * REVISION:
 *
 */

import React						from 'react';
import ReactDOM						from 'react-dom';						// eslint-disable-line no-unused-vars
import PropTypes					from 'prop-types';

// For AppBar
import { withTheme, withStyles }	from '@material-ui/core/styles';		// decorator
import AppBar						from '@material-ui/core/AppBar';
import Toolbar						from '@material-ui/core/Toolbar';
import Typography					from '@material-ui/core/Typography';
import Menu							from '@material-ui/core/Menu';
import MenuItem						from '@material-ui/core/MenuItem';
import IconButton					from '@material-ui/core/IconButton';
import ListItemIcon					from '@material-ui/core/ListItemIcon';
import Divider						from '@material-ui/core/Divider';
import Tooltip						from '@material-ui/core/Tooltip';
import MenuIcon						from '@material-ui/icons/Menu';
import AccountCircleIcon			from '@material-ui/icons/AccountCircle';
import ArrowRightIcon				from '@material-ui/icons/ArrowRight';

import { r3AppBar }					from './r3styles';
import R3PopupMsgDialog				from './r3popupmsgdialog';
import R3Message					from '../util/r3message';
import { errorType }				from '../util/r3types';
import { r3IsEmptyEntity, r3IsEmptyString, r3IsEmptyEntityObject, r3IsEmptyStringObject, r3IsSafeTypedEntity }	from '../util/r3util';

//
// Local variables
//
const menuValues = {
	detach:			'DETACH',
	about:			'ABOUT',
	license:		'LICENSES_TOP',
	noLicense:		'NOLICENSE',
	sign:			'SIGNINOUT',
	userName:		'USERNAME'
};

const tooltipValues = {
	accountMenu:	'accountMenu',
	mainMenu:		'mainMenu'
};

const mainMenuId		= 'appbar-main-menu';
const licenseMenuId		= 'appbar-license-menu';
const accountMenuId		= 'appbar-sign-menu';

//
// AppBar Class
//
@withTheme
@withStyles(r3AppBar)
export default class R3AppBar extends React.Component
{
	static contextTypes = {
		r3Context:			PropTypes.object.isRequired
	};

	static propTypes = {
		r3provider:			PropTypes.object.isRequired,
		title:				PropTypes.string.isRequired,
		enDock:				PropTypes.bool,
		isDocking:			PropTypes.bool,
		licensesObj:		PropTypes.object,

		onTreeDetach:		PropTypes.func.isRequired,
		onOpenTree:			PropTypes.func.isRequired,
		onCheckUpdating:	PropTypes.func,
		onAbout:			PropTypes.func.isRequired,
		onSign:				PropTypes.func.isRequired
	};

	static defaultProps = {
		enDock:				true,
		isDocking:			true,
		licensesObj:		null,

		onCheckUpdating:	null
	};

	state = {
		r3Message:				null,
		mainMenuAnchorEl:		null,
		signMenuAnchorEl:		null,
		licenseMenuAnchorEl:	null,

		tooltips: {
			accountMenuTooltip:	false,
			mainMenuTooltip:	false
		}
	};

	constructor(props)
	{
		super(props);

		// Binding(do not define handlers as arrow functions for performance)
		this.handleSignButton			= this.handleSignButton.bind(this);
		this.handleSignMenuClose		= this.handleSignMenuClose.bind(this);
		this.handleMainButton			= this.handleMainButton.bind(this);
		this.handleMainMenuClose		= this.handleMainMenuClose.bind(this);
		this.handleDetachedMainButton	= this.handleDetachedMainButton.bind(this);
		this.handMessageDialogClose		= this.handMessageDialogClose.bind(this);
	}

	handleSignMenuChange = (event, value) =>					// eslint-disable-line no-unused-vars
	{
		if(this.checkContentUpdating()){
			if('SIGNINOUT' === value){
				this.props.onSign();
			}
		}

		// closing menu
		this.setState({
			signMenuAnchorEl:		null
		});
	}

	handleSignButton(event)										// eslint-disable-line no-unused-vars
	{
		this.setState({
			signMenuAnchorEl:		event.currentTarget,
			tooltips: {
				accountMenuTooltip:	false
			}
		});
	}

	handleSignMenuClose(event)									// eslint-disable-line no-unused-vars
	{
		this.setState({
			signMenuAnchorEl:	null
		});
	}

	handleMenuChange = (event, value) =>
	{
		// [NOTE]
		// The sub MenuItem for licenses menu is received in the OnClick event,
		// not the OnChange event.
		// Then, the value is undefined in the onClick event, so we change the
		// behavior of the function with this value.
		//
		if(r3IsEmptyEntity(value)){
			if(this.checkContentUpdating()){
				// Licenses
				if(!r3IsEmptyString(event.target.innerText)){
					this.props.onAbout(event.target.innerText);
				}
			}
		}else{
			if(menuValues.detach === value){
				if(this.checkContentUpdating()){
					this.props.onTreeDetach();
				}

			}else if(menuValues.about === value){
				if(this.checkContentUpdating()){
					this.props.onAbout(null);
				}

			}else if(menuValues.noLicense === value || menuValues.license === value){
				if(this.checkContentUpdating()){
					if(!this.state.licenseMenuAnchorEl){
						this.setState({
							licenseMenuAnchorEl:	event.currentTarget
						});
						return;
					}
				}

			}else if(!isNaN(value)){
				let	_appmenu= this.context.r3Context.getSafeAppMenu();
				let	_pos	= parseInt(value);
				if(	0 <= _pos &&
					undefined !== _appmenu && null !== _appmenu && _appmenu instanceof Array && _pos < _appmenu.length &&
					!r3IsEmptyStringObject(_appmenu[_pos], 'url'))
				{
					window.open(_appmenu[_pos].url);
				}
			}
		}
		// closing menu
		this.setState({
			mainMenuAnchorEl:		null,
			licenseMenuAnchorEl:	null,
			tooltips: {
				mainMenuTooltip:	false
			}
		});
	}

	handleDetachedMainButton(event)								// eslint-disable-line no-unused-vars
	{
		if(this.checkContentUpdating()){
			if(this.props.isDocking){
				this.props.onTreeDetach();
			}else{
				this.props.onOpenTree();
			}
		}
		this.setState({
			tooltips: {
				mainMenuTooltip:	false
			}
		});
	}

	handleMainButton(event)										// eslint-disable-line no-unused-vars
	{
		this.setState({
			mainMenuAnchorEl:		event.currentTarget,
			licenseMenuAnchorEl:	null
		});
	}

	handleMainMenuClose(event)									// eslint-disable-line no-unused-vars
	{
		this.setState({
			mainMenuAnchorEl:		null,
			licenseMenuAnchorEl:	null
		});
	}

	handMessageDialogClose()
	{
		this.setState({
			r3Message:	null
		});
	}

	handTooltipChange = (event, type, isOpen) =>				// eslint-disable-line no-unused-vars
	{
		if(tooltipValues.accountMenu === type){
			this.setState({
				tooltips: {
					accountMenuTooltip:		isOpen
				}
			});
		}else if(tooltipValues.mainMenu === type){
			this.setState({
				tooltips: {
					mainMenuTooltip:		isOpen
				}
			});
		}
	}

	checkContentUpdating()
	{
		if(null !== this.props.onCheckUpdating && this.props.onCheckUpdating()){
			this.setState({
				r3Message:	new R3Message(this.props.r3provider.getR3TextRes().eNowUpdating, errorType)
			});
			return false;
		}
		return true;
	}

	getAccountButton()
	{
		const { theme, classes, r3provider } = this.props;

		let accountButton		= (this.context.r3Context.isLogin() ? theme.r3AppBar.signinButton : theme.r3AppBar.signoutButton);
		let accountButtonIcon	= (this.context.r3Context.isLogin() ? classes.signinButton : classes.signoutButton);
		let	btnText				= (this.context.r3Context.isLogin() ? r3provider.getR3TextRes().tResSignoutMenu : r3provider.getR3TextRes().tResSigninMenu);

		let	userMenuItem;
		let	menuDivider;
		if(this.context.r3Context.isLogin()){
			userMenuItem = (
				<MenuItem
					key={ menuValues.userName }
					disabled={ true }
				>
					<Typography
						className={ classes.signinedMenu }
					>
						{ r3provider.getR3TextRes().tResSigninName + this.context.r3Context.getSafeUserName() }
					</Typography>
				</MenuItem>
			);
			menuDivider = (
				<Divider />
			);
		}

		return (
			<React.Fragment>
				<Tooltip
					title={ r3provider.getR3TextRes().tResAccountMenuTT }
					open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.accountMenuTooltip, 'boolean')) ? false : this.state.tooltips.accountMenuTooltip) }
				>
					<IconButton
						aria-owns={ this.state.signMenuAnchorEl ? accountMenuId : undefined }
						onClick={ this.handleSignButton }
						onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.accountMenu, true) }
						onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.accountMenu, false) }
						{ ...accountButton }
						className={ accountButtonIcon }
					>
						<AccountCircleIcon />
					</IconButton>
				</Tooltip>
				<Menu
					id={ accountMenuId }
					anchorEl={ this.state.signMenuAnchorEl }
					open={ Boolean(this.state.signMenuAnchorEl) }
					onClose={ this.handleSignMenuClose }
					getContentAnchorEl={ null }
					{ ...theme.r3AppBar.accountMenu }
				>
					{ userMenuItem }
					{ menuDivider }
					<MenuItem
						key={ menuValues.sign }
						onClick={ event => this.handleSignMenuChange(event, menuValues.sign) }
					>
						{ btnText }
					</MenuItem>
				</Menu>
			</React.Fragment>
		);
	}

	getLicensesMenuItems()
	{
		const { r3provider } = this.props;

		let	_menuitems = [];

		if(r3IsEmptyEntity(this.props.licensesObj)){
			_menuitems.push(
				<MenuItem
					disabled={ true }
					key={ menuValues.noLicense }
				>
					{ r3provider.getR3TextRes().tResNoLicenseMenu }
				</MenuItem>
			);
		}else{
			let	packages = Object.keys(this.props.licensesObj);
			for(let cnt = 0; cnt < packages.length; ++cnt){
				_menuitems.push(
					<MenuItem
						key={ packages[cnt] }
						onClick={ event => this.handleMenuChange(event, null) }
					>
						{ packages[cnt] }
					</MenuItem>
				);
			}
		}
		return _menuitems;
	}

	getMainMenuItems()
	{
		const { theme, classes, r3provider } = this.props;
		let	_menuitems = [];

		if(this.props.enDock){
			_menuitems.push(
				<MenuItem
					key={ menuValues.detach }
					onClick={ event => this.handleMenuChange(event, menuValues.detach) }
				>
					{ r3provider.getR3TextRes().tResDetachTreeMenu }
				</MenuItem>
			);
		}

		let	_appmenu = this.context.r3Context.getSafeAppMenu();
		if(undefined !== _appmenu && null !== _appmenu && _appmenu instanceof Array && 0 < _appmenu.length){
			for(let cnt = 0; cnt < _appmenu.length; ++cnt){
				if(r3IsEmptyStringObject(_appmenu[cnt], 'name')){
					continue;
				}
				_menuitems.push(
					<MenuItem
						key={ cnt }
						onClick={ event => this.handleMenuChange(event, cnt) }
					>
						{ _appmenu[cnt].name }
					</MenuItem>
				);
			}
		}

		// Licenses
		_menuitems.push(
			<MenuItem
				key={ menuValues.license }
				onClick={ event => this.handleMenuChange(event, menuValues.license) }
			>
				{ r3provider.getR3TextRes().tResLicensesMenu }
				<ListItemIcon>
					<ArrowRightIcon
						className={ classes.menuRightIcon }
					/>
				</ListItemIcon>

				<Menu
					id={ licenseMenuId }
					anchorEl={ this.state.licenseMenuAnchorEl }
					open={ Boolean(this.state.licenseMenuAnchorEl) }
					onClose={ this.handleMainMenuClose }
					getContentAnchorEl={ null }
					{ ...theme.r3AppBar.licenseMenu }
				>
					{ this.getLicensesMenuItems() }
				</Menu>
			</MenuItem>
		);

		// About
		_menuitems.push(
			<MenuItem
				key={ menuValues.about }
				onClick={ event => this.handleMenuChange(event, menuValues.about) }
			>
				{ r3provider.getR3TextRes().tResAboutMenu }
			</MenuItem>
		);

		return _menuitems;
	}

	getMainMenuButton()
	{
		const { theme, r3provider } = this.props;

		if(this.props.isDocking){
			return (
				<React.Fragment>
					<Tooltip
						title={ r3provider.getR3TextRes().tResMainMenuTT }
						open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.mainMenuTooltip, 'boolean')) ? false : this.state.tooltips.mainMenuTooltip) }
					>
						<IconButton
							onClick={ this.handleMainButton }
							onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.mainMenu, true) }
							onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.mainMenu, false) }
							aria-owns={ this.state.mainMenuAnchorEl ? mainMenuId : undefined }
							{ ...theme.r3AppBar.mainMenuButton }
						>
							<MenuIcon />
						</IconButton>
					</Tooltip>
					<Menu
						id={ mainMenuId }
						anchorEl={ this.state.mainMenuAnchorEl }
						open={ Boolean(this.state.mainMenuAnchorEl) }
						onClose={ this.handleMainMenuClose }
						getContentAnchorEl={ null }
						{ ...theme.r3AppBar.mainMenu }
					>
						{ this.getMainMenuItems() }
					</Menu>
				</React.Fragment>
			);
		}else{
			return (
				<React.Fragment>
					<Tooltip
						title={ r3provider.getR3TextRes().tResMainMenuTT }
						open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.mainMenuTooltip, 'boolean')) ? false : this.state.tooltips.mainMenuTooltip) }
					>
						<IconButton
							onClick={ this.handleDetachedMainButton }
							onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.mainMenu, true) }
							onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.mainMenu, false) }
							{ ...theme.r3AppBar.mainMenuButton }
						>
							<MenuIcon />
						</IconButton>
					</Tooltip>
				</React.Fragment>
			);
		}
	}

	getPopupMessageDialog()
	{
		return (
			<R3PopupMsgDialog
				r3provider={ this.props.r3provider }
				r3Message={ this.state.r3Message }
				onClose={ this.handMessageDialogClose }
			/>
		);
	}

	render()
	{
		const { theme, classes  } = this.props;

		let	themeToolbar = (this.props.enDock ? theme.r3AppBar.toolbar : theme.r3AppBar.smallToolbar);

		return (
			<React.Fragment>
				<AppBar
					{ ...theme.r3AppBar.root }
					className={ classes.root }
				>
					<Toolbar
						{ ...themeToolbar }
						className={ classes.toolbar }
					>
						{ this.getMainMenuButton() }
						<Typography
							{ ...theme.r3AppBar.title }
							className={ classes.title }
						>
							{ this.props.title }
						</Typography>
						{ this.getAccountButton() }
					</Toolbar>
				</AppBar>
				{ this.getPopupMessageDialog() }
			</React.Fragment>
		);
	}
}

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
