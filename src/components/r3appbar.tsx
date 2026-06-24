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
 * CREATE:   Tue Aug 15 2017
 * REVISION:
 *
 */

import React						from 'react';

import AppBar						from '@mui/material/AppBar';
import Toolbar						from '@mui/material/Toolbar';
import Typography					from '@mui/material/Typography';
import Menu							from '@mui/material/Menu';
import MenuItem						from '@mui/material/MenuItem';
import IconButton					from '@mui/material/IconButton';
import ListItemIcon					from '@mui/material/ListItemIcon';
import Divider						from '@mui/material/Divider';
import Tooltip						from '@mui/material/Tooltip';
import MenuIcon						from '@mui/icons-material/Menu';
import AccountCircleIcon			from '@mui/icons-material/AccountCircle';
import ArrowRightIcon				from '@mui/icons-material/ArrowRight';

import { r3AppBarStyle }			from './r3styles';
import type { R3Theme }				from './r3theme';
import R3PopupMsgDialog				from './r3popupmsgdialog';
import R3Message					from '../util/r3message';
import R3Provider					from '../util/r3provider';
import { errorType, LicenseEntryObject }	from '../util/r3types';
import { r3IsNumber, r3IsArray, r3IsEmptyEntity, r3IsEmptyString, r3IsEmptyEntityObject, r3IsEmptyStringObject, r3IsBoolean }	from '../util/r3util';

//
// Props and State type
//
type R3AppBarRequiredProps = {
	theme:				R3Theme;
	r3provider:			R3Provider;
	title:				string;
	onTreeDetach:		() => void;
	onOpenTree:			() => void;
	onAbout:			(packageName: string | null) => void;
	onSign:				(configName?: string) => void;
	onAccount:			() => void;
};

type R3AppBarOptionProps = {
	enDock?:			boolean;
	isDocking?:			boolean;
	licensesObj?:		LicenseEntryObject;
	onCheckUpdating?:	(() => boolean) | null;
};

type R3AppBarProps = R3AppBarRequiredProps & R3AppBarOptionProps;

type R3AppBarState = {
	r3Message:				R3Message | null;
	mainMenuAnchorEl:		HTMLElement | null;
	signMenuAnchorEl:		HTMLElement | null;
	signSubMenuAnchorEl:	HTMLElement | null;
	licenseMenuAnchorEl:	HTMLElement | null;
	tooltips: {
		accountMenuTooltip?:	boolean;
		mainMenuTooltip?:		boolean;
	};
};

type R3AppBarStyleType = ReturnType<typeof r3AppBarStyle>;

//
// Local variables
//
const menuValues = {
	detach:			'DETACH',
	about:			'ABOUT',
	license:		'LICENSES_TOP',
	noLicense:		'NOLICENSE',
	sign:			'SIGNINOUT',
	signSub:		'SIGNINOUT_SUB',
	userName:		'USERNAME',
	account:		'ACCOUNT'
};

const tooltipValues = {
	accountMenu:	'accountMenu',
	mainMenu:		'mainMenu'
};

const mainMenuId			= 'appbar-main-menu';
const licenseMenuId			= 'appbar-license-menu';
const accountMenuId			= 'appbar-sign-menu';
const signinSubMenuId		= 'appbar-sign-sub-menu';
const signinSubMenuPrefix	= 'appbar-signin-sub-menu-';

//
// AppBar Class
//
export default class R3AppBar extends React.Component<R3AppBarProps, R3AppBarState>
{
	sxClasses: R3AppBarStyleType;

	static defaultProps: R3AppBarOptionProps = {
		enDock:				true,
		isDocking:			true,
		licensesObj:		null,
		onCheckUpdating:	null
	};

	state: R3AppBarState = {
		r3Message:				null,
		mainMenuAnchorEl:		null,
		signMenuAnchorEl:		null,
		signSubMenuAnchorEl:	null,
		licenseMenuAnchorEl:	null,

		tooltips: {
			accountMenuTooltip:	false,
			mainMenuTooltip:	false
		}
	};

	constructor(props: R3AppBarProps)
	{
		super(props);

		// Binding(do not define handlers as arrow functions for performance)
		this.handleSignButton			= this.handleSignButton.bind(this);
		this.handleSignMenuClose		= this.handleSignMenuClose.bind(this);
		this.handleMainButton			= this.handleMainButton.bind(this);
		this.handleMainMenuClose		= this.handleMainMenuClose.bind(this);
		this.handleDetachedMainButton	= this.handleDetachedMainButton.bind(this);
		this.handMessageDialogClose		= this.handMessageDialogClose.bind(this);

		// styles
		this.sxClasses					= r3AppBarStyle(props.theme);
	}

	handleSignMenuChange = (event: React.MouseEvent<HTMLElement>, value: string) =>
	{
		if(this.checkContentUpdating()){
			if('SIGNINOUT' === value){
				this.props.onSign();
			}else if(0 == value.indexOf(signinSubMenuPrefix)){
				this.props.onSign(value.replace(signinSubMenuPrefix, ''));
			}
		}

		// closing menu
		this.setState({
			signMenuAnchorEl:		null,
			signSubMenuAnchorEl:	null
		});
	};

	handleSignButton(event: React.MouseEvent<HTMLElement>)
	{
		this.setState({
			signMenuAnchorEl:		event.currentTarget,
			signSubMenuAnchorEl:	null,
			tooltips: {
				accountMenuTooltip:	false
			}
		});
	}

	handleSignMenuClose(event: React.SyntheticEvent)
	{
		this.setState({
			signMenuAnchorEl:		null,
			signSubMenuAnchorEl:	null
		});
	}

	handleMenuChange = (event: React.MouseEvent<HTMLElement>, value: string | number | null) =>
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
				if(event.target instanceof HTMLElement && !r3IsEmptyString(event.target.innerText)){
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

			}else if(menuValues.account === value){
				this.props.onAccount();

			}else if(menuValues.noLicense === value || menuValues.license === value){
				if(this.checkContentUpdating()){
					if(!this.state.licenseMenuAnchorEl){
						this.setState({
							licenseMenuAnchorEl:	event.currentTarget
						});
						return;
					}
				}

			}else if(menuValues.signSub === value){
				if(this.checkContentUpdating()){
					if(!this.state.signSubMenuAnchorEl){
						this.setState({
							signSubMenuAnchorEl:	event.currentTarget
						});
						return;
					}
				}

			}else if(r3IsNumber(value) && !isNaN(value)){
				let	_appmenu= this.props.r3provider.getR3Context().getSafeAppMenu();
				let	_pos	= value;
				if(0 <= _pos && r3IsArray(_appmenu) && _pos < _appmenu.length && !r3IsEmptyStringObject(_appmenu[_pos], 'url')){
					window.open(_appmenu[_pos].url);
				}
			}
		}
		// closing menu
		this.setState({
			mainMenuAnchorEl:		null,
			licenseMenuAnchorEl:	null,
			signSubMenuAnchorEl:	null,
			tooltips: {
				mainMenuTooltip:	false
			}
		});
	};

	handleDetachedMainButton(event: React.MouseEvent<HTMLElement>)
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

	handleMainButton(event: React.MouseEvent<HTMLElement>)
	{
		this.setState({
			mainMenuAnchorEl:		event.currentTarget,
			licenseMenuAnchorEl:	null
		});
	}

	handleMainMenuClose(event: React.SyntheticEvent)
	{
		this.setState({
			mainMenuAnchorEl:		null,
			licenseMenuAnchorEl:	null
		});
	}

	handMessageDialogClose(_event: {}, _reason: string | undefined, _result: boolean)
	{
		this.setState({
			r3Message:	null
		});
	}

	handTooltipChange = (event: React.MouseEvent<HTMLElement>, type: string, isOpen: boolean) =>
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
	};

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

	getSigninSubMenuItems()
	{
		let	signInObj	= this.props.r3provider.getR3Context().getAllSignInUrl();		// Get all singin url object
		let	_menuitems: React.ReactNode[]	= [];

		Object.keys(signInObj).forEach((configName) =>
		{
			let	_menuName = signinSubMenuPrefix + configName;
			_menuitems.push(
				<MenuItem
					key={ _menuName }
					onClick={ event => this.handleSignMenuChange(event, _menuName) }
				>
					{ r3IsEmptyString(signInObj[configName].display) ? configName : signInObj[configName].display }
				</MenuItem>
			);
		});
		return _menuitems;
	}

	getAccountButton()
	{
		const { theme, r3provider } = this.props;

		let	isLogined			= this.props.r3provider.getR3Context().isLogin();
		let accountButton		= (isLogined ? theme.r3AppBar.signinButton : theme.r3AppBar.signoutButton);
		let accountButtonIcon	= (isLogined ? this.sxClasses.signinButton : this.sxClasses.signoutButton);

		let	userMenuItem:		React.ReactNode;
		let	menuDivider:		React.ReactNode;
		let	menuAccountItem:	React.ReactNode;
		let	menuSignInItem:		React.ReactNode;
		let	menuSignOutItem:	React.ReactNode;

		if(isLogined){
			//
			// Current signin
			//
			userMenuItem = (
				<MenuItem
					key={ menuValues.userName }
					disabled={ true }
				>
					<Typography
						sx={ this.sxClasses.signinedMenu }
					>
						{ r3provider.getR3TextRes().tResSigninName + this.props.r3provider.getR3Context().getSafeUserName() }
					</Typography>
				</MenuItem>
			);

			menuDivider = (
				<Divider />
			);

			menuAccountItem = (
				<MenuItem
					key={ menuValues.account }
					onClick={ event => this.handleMenuChange(event, menuValues.account) }
				>
					{ r3provider.getR3TextRes().tResAccountMenu }
				</MenuItem>
			);

			menuSignOutItem = (
				<MenuItem
					key={ menuValues.sign }
					onClick={ event => this.handleSignMenuChange(event, menuValues.sign) }
				>
					{ r3provider.getR3TextRes().tResSignoutMenu }
				</MenuItem>
			);

		}else{
			//
			// Current signout
			//
			if(1 < this.props.r3provider.getR3Context().getSafeConfigCount(true)){
				//
				// Has many singin logic
				//
				menuSignInItem = (
					<MenuItem
						key={ menuValues.signSub }
						onClick={ event => this.handleMenuChange(event, menuValues.signSub) }
					>
						{ r3provider.getR3TextRes().tResSigninMenu }
						<ListItemIcon>
							<ArrowRightIcon
								sx={ this.sxClasses.menuRightIcon }
							/>
						</ListItemIcon>
						<Menu
							id={ signinSubMenuId }
							anchorEl={ this.state.signSubMenuAnchorEl }
							open={ Boolean(this.state.signSubMenuAnchorEl) }
							onClose={ this.handleSignMenuClose }
							{ ...theme.r3AppBar.signinSubMenu }
						>
							{ this.getSigninSubMenuItems() }
						</Menu>
					</MenuItem>
				);

			}else{
				//
				// Has only one singin logic
				//
				menuSignInItem = (
					<MenuItem
						key={ menuValues.sign }
						onClick={ event => this.handleSignMenuChange(event, menuValues.sign) }
					>
						{ r3provider.getR3TextRes().tResSigninMenu }
					</MenuItem>
				);
			}
		}

		return (
			<React.Fragment>
				<Tooltip
					title={ r3provider.getR3TextRes().tResAccountMenuTT }
					open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsBoolean(this.state.tooltips.accountMenuTooltip)) ? false : this.state.tooltips.accountMenuTooltip) }
				>
					<IconButton
						aria-owns={ this.state.signMenuAnchorEl ? accountMenuId : undefined }
						onClick={ this.handleSignButton }
						onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.accountMenu, true) }
						onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.accountMenu, false) }
						{ ...accountButton }
						sx={ accountButtonIcon }
						size="large"
					>
						<AccountCircleIcon />
					</IconButton>
				</Tooltip>
				<Menu
					id={ accountMenuId }
					anchorEl={ this.state.signMenuAnchorEl }
					open={ Boolean(this.state.signMenuAnchorEl) }
					onClose={ this.handleSignMenuClose }
					{ ...theme.r3AppBar.accountMenu }
				>
					{ userMenuItem }
					{ menuDivider }
					{ menuAccountItem }
					{ menuSignInItem }
					{ menuSignOutItem }
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
		const { theme, r3provider } = this.props;
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

		let	_appmenu = this.props.r3provider.getR3Context().getSafeAppMenu();
		if(r3IsArray(_appmenu) && 0 < _appmenu.length){
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
						sx={ this.sxClasses.menuRightIcon }
					/>
				</ListItemIcon>

				<Menu
					id={ licenseMenuId }
					anchorEl={ this.state.licenseMenuAnchorEl }
					open={ Boolean(this.state.licenseMenuAnchorEl) }
					onClose={ this.handleMainMenuClose }
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
						open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsBoolean(this.state.tooltips.mainMenuTooltip)) ? false : this.state.tooltips.mainMenuTooltip) }
					>
						<IconButton
							onClick={ this.handleMainButton }
							onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.mainMenu, true) }
							onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.mainMenu, false) }
							aria-owns={ this.state.mainMenuAnchorEl ? mainMenuId : undefined }
							{ ...theme.r3AppBar.mainMenuButton }
							size="large"
						>
							<MenuIcon />
						</IconButton>
					</Tooltip>
					<Menu
						id={ mainMenuId }
						anchorEl={ this.state.mainMenuAnchorEl }
						open={ Boolean(this.state.mainMenuAnchorEl) }
						onClose={ this.handleMainMenuClose }
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
						open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsBoolean(this.state.tooltips.mainMenuTooltip)) ? false : this.state.tooltips.mainMenuTooltip) }
					>
						<IconButton
							onClick={ this.handleDetachedMainButton }
							onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.mainMenu, true) }
							onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.mainMenu, false) }
							{ ...theme.r3AppBar.mainMenuButton }
							size="large"
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
				theme={ this.props.theme }
				r3provider={ this.props.r3provider }
				r3Message={ this.state.r3Message }
				onClose={ this.handMessageDialogClose }
			/>
		);
	}

	render()
	{
		const { theme } = this.props;

		let	themeToolbar = (this.props.enDock ? theme.r3AppBar.toolbar : theme.r3AppBar.smallToolbar);

		return (
			<React.Fragment>
				<AppBar
					{ ...theme.r3AppBar.root }
					sx={ this.sxClasses.root }
				>
					<Toolbar
						{ ...themeToolbar }
						sx={ this.sxClasses.toolbar }
					>
						{ this.getMainMenuButton() }
						<Typography
							{ ...theme.r3AppBar.title }
							sx={ this.sxClasses.title }
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
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * End:
 * vim600: noexpandtab sw=4 ts=4 fdm=marker
 * vim<600: noexpandtab sw=4 ts=4
 */
