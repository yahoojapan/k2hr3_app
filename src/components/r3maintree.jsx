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

// For MainTree
import Drawer			from 'material-ui/Drawer';
import Subheader		from 'material-ui/Subheader';
import IconButton		from 'material-ui/IconButton';
import IconMenu			from 'material-ui/IconMenu';
import MenuItem			from 'material-ui/MenuItem';
import FontIcon			from 'material-ui/FontIcon';
import ArrowDropRight	from 'material-ui/svg-icons/navigation-arrow-drop-right';
import { List, ListItem } from 'material-ui/List';

import R3TextLabel		from './r3textlabel';

// For dialog
import R3PopupMsgDialog				from './r3popupmsgdialog';
import R3Message					from '../util/r3message';
import { serviceType, errorType }	from '../util/r3types';
import { r3DeepCompare, r3IsEmptyEntity, r3IsEmptyStringObject, r3IsEmptyString, r3CompareCaseString }	from '../util/r3util';

//
// Main TreeView Class
//
export default class R3MainTree extends React.Component
{
	constructor(props)
	{
		super(props);

		this.state = {
			r3Message:		null
		};

		// Binding
		this.handleTenantChange				= this.handleTenantChange.bind(this);
		this.handleTyleItemChange			= this.handleTyleItemChange.bind(this);
		this.handleListItemChange			= this.handleListItemChange.bind(this);
		this.handleNameItemInServiceChange	= this.handleNameItemInServiceChange.bind(this);
		this.handleTypeInServiceChange		= this.handleTypeInServiceChange.bind(this);
		this.handleListItemInServiceChange	= this.handleListItemInServiceChange.bind(this);

		this.handleDummyBarClick			= this.handleDummyBarClick.bind(this);
		this.handleDrawerRequest			= this.handleDrawerRequest.bind(this);

		this.handMessageDialogClose			= this.handMessageDialogClose.bind(this);
	}

	handleTenantChange(event, value)								// eslint-disable-line no-unused-vars
	{
		if(!this.checkContentUpdating()){
			return;
		}
		this.props.tenants.map( (item, pos) => {
			if(value === pos){
				this.props.onTenantChange(item);
			}
		});
	}

	handleTyleItemChange(event, type)								// eslint-disable-line no-unused-vars
	{
		if(!this.checkContentUpdating()){
			return;
		}
		this.props.onTypeItemChange(type);
	}

	handleListItemChange(event, type, path)							// eslint-disable-line no-unused-vars
	{
		if(!this.checkContentUpdating()){
			return;
		}
		this.props.onListItemChange(type, path);
	}

	handleNameItemInServiceChange(event, servicename)				// eslint-disable-line no-unused-vars
	{
		if(!this.checkContentUpdating()){
			return;
		}
		this.props.onNameItemInServiceChange(servicename);
	}

	handleTypeInServiceChange(event, servicename, type_in_service)	// eslint-disable-line no-unused-vars
	{
		if(!this.checkContentUpdating()){
			return;
		}
		this.props.onTypeInServiceChange(servicename, type_in_service);
	}

	handleListItemInServiceChange(event, servicename, type_in_service, path)	// eslint-disable-line no-unused-vars
	{
		if(!this.checkContentUpdating()){
			return;
		}
		this.props.onListItemInServiceChange(servicename, type_in_service, path);
	}

	handleDrawerRequest(open)
	{
		console.info('CALL - Drawer' + open);
		this.props.onOpenChange();
	}

	handleDummyBarClick(event, value)								// eslint-disable-line no-unused-vars
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
			if('DOCK' === value){
				this.props.onTreeDocking(true);

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

				// to close drawer
				if(!this.props.isDocking){
					this.props.onOpenChange();
				}
			}
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
						onClick={ this.handleDummyBarClick }
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
					primaryText='Always display Tree'
					disabled={ false }
					value={ 'DOCK' }
					key={ 'DOCK' }
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

	getTenantListMenuItems()
	{
		if(!(this.props.tenants instanceof Array) || 0 === this.props.tenants.length){
			return (
				<MenuItem
					primaryText={ 'No tenant list' }
					disabled={ true }
					value={ 0 }
					key={ 0 }
				/>
			);
		}else{
			return (
				this.props.tenants.map( (item, pos) => {
					return (
						<MenuItem
							primaryText={ (r3IsEmptyString(item.display) ? 'Unknown' : item.display) }
							value={ pos }
							key={ pos }
						/>
					);
				})
			);
		}
	}

	getDummyBarSubHeader()
	{
		return (
			<Subheader style={ this.context.muiTheme.r3MainTree.textSubHeaderDummyBarStyle }>
				<IconMenu
					iconButtonElement={
						<IconButton style={ this.context.muiTheme.r3MainTree.iconButtonDummyBarStyle } iconStyle={ this.context.muiTheme.r3MainTree.iconDummyBarStyle }>
							<FontIcon
								className={ this.context.muiTheme.r3IconFonts.dehazeIconFont }
							/>
						</IconButton>
					}
					targetOrigin={ this.context.muiTheme.r3MainTree.iconMenuDummyBarTarget }
					anchorOrigin={ this.context.muiTheme.r3MainTree.iconMenuDummyBarAnchor }
					style={ this.context.muiTheme.r3MainTree.treeDummyBarStyle }
					onChange={ this.handleDummyBarClick }
				>
					{ this.getMenuItems() }
				</IconMenu>

				<span style={ this.context.muiTheme.r3MainTree.textTitleDummyBarStyle }>{ this.props.title }</span>
			</Subheader>
		);
	}

	getTenantSubHeaders()
	{
		let	menuItem	= this.getTenantListMenuItems();
		let	titleName	= (this.props.tenants instanceof Array && 0 < this.props.tenants.length ? 'Unselected' : 'No tenant list');
		let	tenantPos	= -1;
		this.props.tenants.map( (tenant, pos) => {
			if(r3DeepCompare(tenant, this.props.selectedTenant)){
				titleName	= tenant.display;
				tenantPos	= pos;
			}
		});

		return (
			<Subheader style={ this.context.muiTheme.r3MainTree.textSubHeaderStyle }>
				<R3TextLabel text={ 'TENANT' } style={ this.context.muiTheme.r3MainTree.textLabelInSHStyle } />
				<span style={ this.context.muiTheme.r3MainTree.textTitleLabelInSHStyle } >{ titleName }</span>
				<IconMenu
					iconButtonElement={
						<IconButton tooltip='Select Tenant' style={ this.context.muiTheme.r3MainTree.iconButtonStyle } iconStyle={ this.context.muiTheme.r3MainTree.iconRightButtonStyle } >
							<FontIcon
								className={ this.context.muiTheme.r3IconFonts.moreVertIconFont }
							/>
						</IconButton>
					}
					targetOrigin={ this.context.muiTheme.r3MainTree.iconMenuTarget }
					anchorOrigin={ this.context.muiTheme.r3MainTree.iconMenuAnchor }
					style={ this.context.muiTheme.r3MainTree.iconMenuStyle }
					value={ tenantPos }
					onChange={ this.handleTenantChange }
				>
					{ menuItem }
				</IconMenu>
			</Subheader>
		);
	}

	getSubHeaders()
	{
		let	dummyBarSubHeader;
		if(!this.props.isDocking){
			dummyBarSubHeader = this.getDummyBarSubHeader();
		}

		return (
			<div>
				{ dummyBarSubHeader }
				{ this.getTenantSubHeaders() }
			</div>
		);
	}

	//
	// For children under TOP > ROLE/POLICY/RESOURCE
	//
	getChildrenListItems(treeList, type)
	{
		if(undefined === treeList || !(treeList instanceof Array)){
			return;
		}

		return (
			treeList.map( (item, pos) => {							// eslint-disable-line no-unused-vars
				return (
					<ListItem
						key={ item.path }
						primaryText={ item.name }
						initiallyOpen={ (undefined !== item.selected ? item.selected : false) }
						primaryTogglesNestedList={ true }
						nestedItems={ this.getChildrenListItems(item.children, type) }
						isKeyboardFocused={ (undefined !== item.selected ? item.selected : false)  }
						style={ (undefined !== item.selected && item.selected ? this.context.muiTheme.r3MainTree.selectedColor : this.context.muiTheme.r3MainTree.noStyle ) }
						onClick={ (event) => this.handleListItemChange(event, type, item.path) }
					/>
				);
			})
		);
	}

	//
	// For Service Name(TOP) under TOP > SERVICE
	//
	getServicesListItems(treeList)
	{
		if(undefined === treeList || !(treeList instanceof Array)){
			return;
		}

		return (
			treeList.map( (item, pos) => {							// eslint-disable-line no-unused-vars
				let	itemtext;
				if(undefined === item.owner || null === item.owner || 'boolean' !== typeof item.owner || false === item.owner){
					itemtext = item.name;
				}else{
					itemtext = (
						<div>
							<span style={ this.context.muiTheme.r3MainTree.textServiceOwnerLabelStyle }>{ item.name }</span>
							<FontIcon
								className={ this.context.muiTheme.r3IconFonts.SettingIconFont }
								color={ this.context.muiTheme.palette.accent1Color }
							/>
						</div>
					);
				}
				return (
					<ListItem
						key={ item.path }
						primaryText={ itemtext }
						initiallyOpen={ (undefined !== item.selected ? item.selected : false) }
						primaryTogglesNestedList={ true }
						nestedItems={ this.getServiceMainListItems(item.children, item.path) }
						isKeyboardFocused={ (undefined !== item.selected ? item.selected : false)  }
						style={ (undefined !== item.selected && item.selected ? this.context.muiTheme.r3MainTree.selectedColor : this.context.muiTheme.r3MainTree.noStyle ) }
						onClick={ (event) => this.handleNameItemInServiceChange(event, item.path) }
					/>
				);
			})
		);
	}

	//
	// For Type(ROLE/POLICY/RESOURCE) under TOP > SERVICE > Service Name(TOP)
	//
	//	service_name		: "service name"
	//
	getServiceMainListItems(treeList, service_name)
	{
		if(undefined === treeList || !(treeList instanceof Array)){
			return;
		}
		let	_service_name = service_name;

		return (
			treeList.map( (item, pos) => {							// eslint-disable-line no-unused-vars
				return (
					<ListItem
						key={ item.path }
						primaryText={ item.name }
						leftIcon={ <FontIcon className={ this.context.muiTheme.r3IconFonts.treeTopIconFont } /> }
						initiallyOpen={ (undefined !== item.selected ? item.selected : false) }
						primaryTogglesNestedList={ true }
						nestedItems={ this.getServiceChildrenListItems(item.children, _service_name, item.path) }
						isKeyboardFocused={ (undefined !== item.selected ? item.selected : false)  }
						style={ ((undefined !== item.selected && item.selected) ? this.context.muiTheme.r3MainTree.topSelectedListItem : this.context.muiTheme.r3MainTree.topListItem) }
						onClick={ (event) => this.handleTypeInServiceChange(event, _service_name, item.path) }
					/>
				);
			})
		);
	}

	//
	// For Item under TOP > SERVICE > Service Name(TOP) > Type(ROLE/POLICY/RESOURCE)
	//
	//	service_name		: "service name"
	//	type_in_service		: "type" under service
	//
	getServiceChildrenListItems(treeList, service_name, type_in_service)
	{
		if(undefined === treeList || !(treeList instanceof Array)){
			return;
		}
		let	_service_name		= service_name;
		let	_type_in_service	= type_in_service;

		return (
			treeList.map( (item, pos) => {							// eslint-disable-line no-unused-vars
				return (
					<ListItem
						key={ item.path }
						primaryText={ item.name }
						initiallyOpen={ (undefined !== item.selected ? item.selected : false) }
						primaryTogglesNestedList={ true }
						nestedItems={ this.getServiceChildrenListItems(item.children, _service_name, _type_in_service) }
						isKeyboardFocused={ (undefined !== item.selected ? item.selected : false)  }
						style={ (undefined !== item.selected && item.selected ? this.context.muiTheme.r3MainTree.selectedColor : this.context.muiTheme.r3MainTree.noStyle ) }
						onClick={ (event) => this.handleListItemInServiceChange(event, _service_name, _type_in_service, item.path) }
					/>
				);
			})
		);
	}

	//
	// For TOP
	//
	getMainListItems(treeList)
	{
		console.info('CALL : getMainListItems');

		if(undefined === treeList || !(treeList instanceof Array)){
			return;
		}

		return (
			treeList.map( (item, pos) =>							// eslint-disable-line no-unused-vars
			{
				let	initalOpen = false;
				if(	(r3IsEmptyString(this.props.selectedService)	&& r3CompareCaseString(this.props.selectedType, item.path)) ||
					(!r3IsEmptyString(this.props.selectedService)	&& r3CompareCaseString(serviceType, item.path))				)
				{
					initalOpen = true;
				}

				return (
					<ListItem
						key={ item.path }
						primaryText={ item.name }
						leftIcon={ <FontIcon className={ this.context.muiTheme.r3IconFonts.treeTopIconFont } /> }
						initiallyOpen={ initalOpen }
						primaryTogglesNestedList={ true }
						nestedItems={ (r3CompareCaseString(serviceType, item.path) ? this.getServicesListItems(item.children) : this.getChildrenListItems(item.children, item.path)) }
						isKeyboardFocused={ (undefined !== item.selected ? item.selected : false)  }
						style={ ((undefined !== item.selected && item.selected) ? this.context.muiTheme.r3MainTree.topSelectedListItem : this.context.muiTheme.r3MainTree.topListItem) }
						onClick={ (event) => this.handleTyleItemChange(event, item.path) }
					/>
				);
			})
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

	getMainTreeLists()
	{
		return (
			<div style={ (this.props.isDocking ? this.context.muiTheme.r3MainTree.treeStyle : {}) } >
				<List style={ this.context.muiTheme.r3MainTree.treeLististStyle } >
					{ this.getSubHeaders() }
					{ this.getMainListItems(this.props.treeList) }
				</List>
				{ this.getPopupMessageDialog() }
			</div>
		);
	}

	render()
	{
		if(this.props.isDocking){
			return this.getMainTreeLists();
		}else{
			// [NOTE]
			// Since witdh=500 maybe used in the calculation as the initial value, it must be specified.(width=256 in default Theme does not work for me)
			// And containerStyle must be specified.
			//
			return (
				<div>
					<Drawer
						open={ this.props.open }
						docked={ false }
						onRequestChange={ this.handleDrawerRequest }
						width={ this.context.muiTheme.r3MainTree.drawerWidth }
						containerStyle={ this.context.muiTheme.r3MainTree.drawerContainerStyle }
					>
						{ this.getMainTreeLists() }
					</Drawer>
					{ this.getPopupMessageDialog() }
				</div>
			);
		}
	}
}

R3MainTree.contextTypes = {
	muiTheme:					PropTypes.object.isRequired,
	r3Context:					PropTypes.object.isRequired
};

R3MainTree.propTypes = {
	r3provider:					PropTypes.object.isRequired,
	title:						PropTypes.string.isRequired,
	open:						PropTypes.bool,
	enDock:						PropTypes.bool,
	isDocking:					PropTypes.bool,
	licensesObj:				PropTypes.object,

	tenants:					PropTypes.array.isRequired,
	treeList:					PropTypes.array,

	selectedTenant:				PropTypes.object,
	selectedType:				PropTypes.string,
	selectedService:			PropTypes.string,
	selectedPath:				PropTypes.string,

	onTenantChange:				PropTypes.func.isRequired,
	onTypeItemChange:			PropTypes.func.isRequired,
	onListItemChange:			PropTypes.func.isRequired,
	onNameItemInServiceChange:	PropTypes.func.isRequired,
	onTypeInServiceChange:		PropTypes.func.isRequired,
	onListItemInServiceChange:	PropTypes.func.isRequired,
	onOpenChange:				PropTypes.func.isRequired,
	onTreeDocking:				PropTypes.func.isRequired,
	onCheckUpdating:			PropTypes.func,
	onAbout:					PropTypes.func.isRequired
};

R3MainTree.defaultProps = {
	open:						false,
	enDock:						true,
	isDocking:					true,
	licensesObj:				null,

	treeList:					null,

	selectedTenant:				null,
	selectedType:				null,
	selectedService:			null,
	selectedPath:				null,

	onCheckUpdating:			null
};

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
