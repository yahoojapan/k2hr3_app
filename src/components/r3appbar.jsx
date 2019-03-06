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

import React			from 'react';
import ReactDOM			from 'react-dom';									// eslint-disable-line no-unused-vars
import PropTypes		from 'prop-types';

// For AppBar
import AppBar			from 'material-ui/AppBar';
import FontIcon			from 'material-ui/FontIcon';
import IconButton		from 'material-ui/IconButton';
import IconMenu			from 'material-ui/IconMenu';
import MenuItem			from 'material-ui/MenuItem';
import Divider			from 'material-ui/Divider';
import ArrowDropRight	from 'material-ui/svg-icons/navigation-arrow-drop-right';

// For dialog
import R3PopupMsgDialog			from './r3popupmsgdialog';
import R3Message				from '../util/r3message';
import { errorType }			from '../util/r3types';
import { r3IsEmptyEntity, r3IsEmptyString, r3IsEmptyStringObject }	from '../util/r3util';

//
// AppBar Class
//
export default class R3AppBar extends React.Component
{
	constructor(props)
	{
		super(props);

		this.state = {
			r3Message:				null
		};

		// Binding
		this.handleSignMenuChange	= this.handleSignMenuChange.bind(this);
		this.handleMenuChange		= this.handleMenuChange.bind(this);
		this.handleLeftButton		= this.handleLeftButton.bind(this);

		this.handMessageDialogClose	= this.handMessageDialogClose.bind(this);
	}

	handleSignMenuChange(event, value)
	{
		if('SIGNINOUT' === value){
			this.props.onSign();
		}
	}

	handleMenuChange(event, value)
	{
		// [NOTE]
		// The sub MenuItem for licenses menu is received in the OnClick event,
		// not the OnChange event.
		// Then, the value is undefined in the onClick event, so we change the
		// behavior of the function with this value.
		//
		if(r3IsEmptyEntity(value)){
			// Licenses
			if(!r3IsEmptyString(event.target.innerText)){
				this.props.onAbout(event.target.innerText);
			}
		}else{
			if('DETACH' === value){
				this.props.onTreeDetach();

			}else if('ABOUT' === value){
				this.props.onAbout(null);

			}else if('NOLICENSE' === value || 'LICENSES_TOP' === value){
				// nothing to do(why was this called?)

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
	}

	handleLeftButton(event)								// eslint-disable-line no-unused-vars
	{
		if(this.props.isDocking){
			this.props.onTreeDetach();
		}else{
			this.props.onOpenTree();
		}
	}

	handMessageDialogClose()
	{
		this.setState({
			r3Message:	null
		});
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

	getAccountIcon()
	{
		let	iconStyle		= (this.context.r3Context.isLogin() ? this.context.muiTheme.r3AppBar.loginIconButtonColor : this.context.muiTheme.r3AppBar.logoutIconButtonColor);
		let	btnText			= (this.context.r3Context.isLogin() ? 'Sign out' : 'Sign in');

		let	userMenuItem;
		let	userDivider;
		if(this.context.r3Context.isLogin()){
			userMenuItem = (
				<MenuItem
					primaryText={ 'Signed in as ' + this.context.r3Context.getSafeUserName() }
					disabled={ true }
					style={ this.context.muiTheme.r3AppBar.userNameMenuItem }
				/>
			);
			userDivider = (
				<Divider
					style={ this.context.muiTheme.r3AppBar.userNameDivider }
				/>
			);
		}

		return (
			<IconMenu
				iconButtonElement={
					<IconButton iconStyle={ iconStyle } tooltip='Account' style={ this.context.muiTheme.r3AppBar.iconButtonStyle } >
						<FontIcon
							className={ this.context.muiTheme.r3IconFonts.accountIconFont }
						/>
					</IconButton>
				}
				onChange={ this.handleSignMenuChange }
				targetOrigin={ this.context.muiTheme.r3AppBar.iconRightMenuTarget }
				anchorOrigin={ this.context.muiTheme.r3AppBar.iconRightMenuAnchor }
			>
				{ userMenuItem }
				{ userDivider }
				<MenuItem
					primaryText={ btnText }
					value={ 'SIGNINOUT' }
				/>
			</IconMenu>
		);
	}

	getLicensesMenuItems()
	{
		let	_menuitems	= [];

		if(r3IsEmptyEntity(this.props.licensesObj)){
			_menuitems.push(
				<MenuItem
					primaryText={ this.props.r3provider.getR3TextRes().tResNoLicenseMenu }
					disabled={ true }
					value={ 'NOLICENSE' }
					key={ 'NOLICENSE' }
				/>
			);
		}else{
			let	packages = Object.keys(this.props.licensesObj);
			for(let cnt = 0; cnt < packages.length; ++cnt){
				_menuitems.push(
					<MenuItem
						primaryText={ packages[cnt] }
						disabled={ false }
						value={ packages[cnt] }
						key={ packages[cnt] }
						onClick={ this.handleMenuChange }
					/>
				);
			}
		}
		return _menuitems;
	}

	getMenuItems()
	{
		let	_menuitems = [];
		if(this.props.enDock){
			_menuitems.push(
				<MenuItem
					primaryText='Detach Tree'
					disabled={ false }
					value={ 'DETACH' }
					key={ 'DETACH' }
				/>
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
						primaryText={ _appmenu[cnt].name }
						disabled={ false }
						value={ cnt }
						key={ cnt }
					/>
				);
			}
		}

		// Licenses
		_menuitems.push(
			<MenuItem
				primaryText={ this.props.r3provider.getR3TextRes().tResLicensesMenu }
				rightIcon={<ArrowDropRight />}
				menuItems={ this.getLicensesMenuItems() }
				value={ 'LICENSES_TOP' }
				key={ 'LICENSES_TOP' }
			/>,
		);

		// About
		_menuitems.push(
			<MenuItem
				primaryText={ this.props.r3provider.getR3TextRes().tResAboutMenu }
				disabled={ false }
				value={ 'ABOUT' }
				key={ 'ABOUT' }
			/>
		);

		return _menuitems;
	}

	getMenuIcon()
	{
		return (
			<IconMenu
				iconButtonElement={
					<IconButton iconStyle={ this.context.muiTheme.r3AppBar.menuIconButtonColor } style={ this.context.muiTheme.r3AppBar.iconButtonStyle } >
						<FontIcon
							className={ this.context.muiTheme.r3IconFonts.dehazeIconFont }
						/>
					</IconButton>
				}
				targetOrigin={ this.context.muiTheme.r3AppBar.iconLeftMenuTarget }
				anchorOrigin={ this.context.muiTheme.r3AppBar.iconLeftMenuAnchor }
				onChange={ this.handleMenuChange }
			>
				{ this.getMenuItems() }
			</IconMenu>
		);
	}

	getPopupMessageDialog()
	{
		return (
			<R3PopupMsgDialog
				r3Message={ this.state.r3Message }
				onClose={ this.handMessageDialogClose }
			/>
		);
	}

	render()
	{
		if(this.props.isDocking){
			return (
				<div>
					<AppBar
						title={ this.props.title }
						iconElementLeft={ this.getMenuIcon() }
						iconElementRight={ this.getAccountIcon() }
					/>
					{ this.getPopupMessageDialog() }
				</div>
			);
		}else{
			return (
				<div>
					<AppBar
						title={ this.props.title }
						iconElementRight={ this.getAccountIcon() }
						onLeftIconButtonTouchTap={ this.handleLeftButton }
					/>
					{ this.getPopupMessageDialog() }
				</div>
			);
		}
	}
}

R3AppBar.contextTypes = {
	muiTheme:			PropTypes.object.isRequired,
	r3Context:			PropTypes.object.isRequired
};

R3AppBar.propTypes = {
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

R3AppBar.defaultProps = {
	enDock:				true,
	isDocking:			true,
	licensesObj:		null,

	onCheckUpdating:	null
};

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
