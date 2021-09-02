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

// For MainTree
import { withTheme, withStyles }	from '@material-ui/core/styles';		// decorator
import AppBar						from '@material-ui/core/AppBar';
import Toolbar						from '@material-ui/core/Toolbar';
import Drawer						from '@material-ui/core/Drawer';
import Chip							from '@material-ui/core/Chip';
import Menu							from '@material-ui/core/Menu';
import MenuItem						from '@material-ui/core/MenuItem';
import IconButton					from '@material-ui/core/IconButton';
import Tooltip						from '@material-ui/core/Tooltip';
import Typography					from '@material-ui/core/Typography';
import List							from '@material-ui/core/List';
import ListItem						from '@material-ui/core/ListItem';
import ListItemText					from '@material-ui/core/ListItemText';
import ListItemIcon					from '@material-ui/core/ListItemIcon';
import Collapse						from '@material-ui/core/Collapse';

import ExpandLessIcon				from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon				from '@material-ui/icons/ExpandMore';
import MenuIcon						from '@material-ui/icons/Menu';
import ArrowRightIcon				from '@material-ui/icons/ArrowRight';
import LabelIcon					from '@material-ui/icons/Label';
import OwnerIcon					from '@material-ui/icons/Person';
import MoreVertIcon					from '@material-ui/icons/MoreVert';

import { r3MainTree }				from './r3styles';
import R3PopupMsgDialog				from './r3popupmsgdialog';
import R3Message					from '../util/r3message';

import { serviceType, errorType }	from '../util/r3types';
import { r3DeepCompare, r3IsEmptyEntity, r3IsEmptyStringObject, r3IsEmptyString, r3CompareCaseString, r3IsEmptyEntityObject, r3IsSafeTypedEntity }	from '../util/r3util';

//
// Local variables
//
const menuValues = {
	dock:				'DOCK',
	about:				'ABOUT',
	license:			'LICENSES_TOP',
	noLicense:			'NOLICENSE',
	sign:				'SIGNINOUT',
	userName:			'USERNAME'
};

const componentKeyIds = {
	topListId:			'mainTree-top-list',
	dummyBarMenuId:		'mainTree-dummybar-main-menu',
	dummyLicenseMenuId:	'mainTree-dummybar-license-menu',
	tenantMenuId:		'maintree-select-tenant-menu',
	topList:			'mainTree-top-list',
	subHeaderList:		'mainTree-subheader-list',
	dummyBarList:		'mainTree-dummybar-list',
	noTenantList:		'mainTree-no-tenant-list'
};

const tooltipValues = {
	mainMenu:			'mainMenu',
	tenantMenu:			'tenantMenu'
};

//
// Main TreeView Class
//
@withTheme
@withStyles(r3MainTree)
export default class R3MainTree extends React.Component
{
	static contextTypes = {
		r3Context:					PropTypes.object.isRequired
	};

	static propTypes = {
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
		onPopupClose:				PropTypes.func.isRequired,
		onTreeDocking:				PropTypes.func.isRequired,
		onCheckUpdating:			PropTypes.func,
		onAbout:					PropTypes.func.isRequired
	};

	static defaultProps = {
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

	state = {
		r3Message:					null,
		dummyBarMenuAnchorEl:		null,
		dummyLicenseMenuAnchorEl:	null,
		tenantMenuAnchorEl:			null,

		tooltips: {
			mainMenuTooltip:		false,
			tenantMenuTooltip:		false,
		},
		collapseExpands:			{}
	};

	constructor(props)
	{
		super(props);

		// Binding(do not define handlers as arrow functions for performance)
		this.handleTenantMenuButton			= this.handleTenantMenuButton.bind(this);
		this.handleTenantMenuClose			= this.handleTenantMenuClose.bind(this);
		this.handleTypeItemChange			= this.handleTypeItemChange.bind(this);
		this.handleListItemChange			= this.handleListItemChange.bind(this);
		this.handleNameItemInServiceChange	= this.handleNameItemInServiceChange.bind(this);
		this.handleTypeInServiceChange		= this.handleTypeInServiceChange.bind(this);
		this.handleListItemInServiceChange	= this.handleListItemInServiceChange.bind(this);

		this.handleDummyBarButton			= this.handleDummyBarButton.bind(this);
		this.handleDummyBarMenuClose		= this.handleDummyBarMenuClose.bind(this);
		this.handleTreePopupClose			= this.handleTreePopupClose.bind(this);

		this.handMessageDialogClose			= this.handMessageDialogClose.bind(this);
	}

	handleTenantMenuButton(event)									// eslint-disable-line no-unused-vars
	{
		this.setState({
			tenantMenuAnchorEl:		event.currentTarget,
			tooltips: {
				tenantMenuTooltip:	false
			}
		});
	}

	handleTenantMenuClose(event)									// eslint-disable-line no-unused-vars
	{
		this.setState({
			tenantMenuAnchorEl:	null
		});
	}

	handleTenantChange = (event, value) =>							// eslint-disable-line no-unused-vars
	{
		if(this.checkContentUpdating()){
			this.props.tenants.map( (item, pos) => {
				if(value === pos){
					// if selected tenant is changed, we need to clear collapseExpands{}.
					//
					if(	!r3IsEmptyEntityObject(this.props.selectedTenant, 'name')	&&
						!r3IsEmptyEntityObject(this.props.selectedTenant, 'display')&&
						!r3IsEmptyEntityObject(item, 'name')						&&
						!r3IsEmptyEntityObject(item, 'display')						&&
						item.name !== this.props.selectedTenant.name				&&
						item.display !== this.props.selectedTenant.display			)
					{
						this.setState({
							collapseExpands:	{}
						});
					}
					this.props.onTenantChange(item);
				}
			});
		}
		// closing menu
		this.setState({
			tenantMenuAnchorEl:	null
		});
	}

	updateCollapseChange(prevSelected, collapseKey)
	{
		let newCollapseExpands	= Object.assign({}, this.state.collapseExpands);

		if(r3IsEmptyEntityObject(newCollapseExpands, collapseKey) || !r3IsSafeTypedEntity(newCollapseExpands[collapseKey], 'boolean')){
			// not found collapseKey's state, it means that item does not expand now.
			if(prevSelected){
				// now selected		-> expanding
				newCollapseExpands[collapseKey] = true;					// something wrong, but continue...
			}else{
				// now not selected	-> expanding
				newCollapseExpands[collapseKey] = true;
			}
		}else{
			if(prevSelected){
				// now selected		-> toggle
				newCollapseExpands[collapseKey] = !newCollapseExpands[collapseKey];
			}else{
				// now not selected	-> expanding
				newCollapseExpands[collapseKey] = true;
			}
		}
		this.setState({
			collapseExpands:	newCollapseExpands
		});
	}

	handleTypeItemChange(event, type, prevSelected, collapseKey)								// eslint-disable-line no-unused-vars
	{
		if(!this.checkContentUpdating()){
			return;
		}
		this.updateCollapseChange(prevSelected, collapseKey);

		this.props.onTypeItemChange(type);
	}

	handleListItemChange(event, type, path, prevSelected, collapseKey)							// eslint-disable-line no-unused-vars
	{
		if(!this.checkContentUpdating()){
			return;
		}
		this.updateCollapseChange(prevSelected, collapseKey);

		this.props.onListItemChange(type, path);
	}

	handleNameItemInServiceChange(event, servicename, prevSelected, collapseKey)				// eslint-disable-line no-unused-vars
	{
		if(!this.checkContentUpdating()){
			return;
		}
		this.updateCollapseChange(prevSelected, collapseKey);

		this.props.onNameItemInServiceChange(servicename);
	}

	handleTypeInServiceChange(event, servicename, type_in_service, prevSelected, collapseKey)	// eslint-disable-line no-unused-vars
	{
		if(!this.checkContentUpdating()){
			return;
		}
		this.updateCollapseChange(prevSelected, collapseKey);

		this.props.onTypeInServiceChange(servicename, type_in_service);
	}

	handleListItemInServiceChange(event, servicename, type_in_service, path, prevSelected, collapseKey)	// eslint-disable-line no-unused-vars
	{
		if(!this.checkContentUpdating()){
			return;
		}
		this.updateCollapseChange(prevSelected, collapseKey);

		this.props.onListItemInServiceChange(servicename, type_in_service, path);
	}

	handleTreePopupClose(event)										// eslint-disable-line no-unused-vars
	{
		console.info('CALL - Drawer close');
		this.props.onPopupClose();
	}

	handleDummyBarButton(event)										// eslint-disable-line no-unused-vars
	{
		this.setState({
			dummyBarMenuAnchorEl:		event.currentTarget,
			dummyLicenseMenuAnchorEl:	null,
			tooltips: {
				mainMenuTooltip:		false
			}
		});
	}

	handleDummyBarMenuClose(event)									// eslint-disable-line no-unused-vars
	{
		this.setState({
			dummyBarMenuAnchorEl:		null,
			dummyLicenseMenuAnchorEl:	null
		});
	}

	handleDummyBarClick = (event, value) =>
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
			if(menuValues.dock === value){
				this.props.onTreeDocking(true);

			}else if(menuValues.about === value){
				this.props.onAbout(null);

			}else if(menuValues.noLicense === value || menuValues.license === value){
				if(!this.state.dummyLicenseMenuAnchorEl){
					this.setState({
						dummyLicenseMenuAnchorEl:	event.currentTarget
					});
					return;
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
		// to close drawer
		if(!this.props.isDocking){
			this.props.onPopupClose();
		}
		// closing menu
		this.setState({
			dummyBarMenuAnchorEl:		null,
			dummyLicenseMenuAnchorEl:	null
		});
	}

	handMessageDialogClose(event, reason, result)				// eslint-disable-line no-unused-vars
	{
		this.setState({
			r3Message:	null
		});
	}

	handTooltipChange = (event, type, isOpen) =>				// eslint-disable-line no-unused-vars
	{
		if(tooltipValues.mainMenu === type){
			this.setState({
				tooltips: {
					mainMenuTooltip:	isOpen
				}
			});
		}else if(tooltipValues.tenantMenu === type){
			this.setState({
				tooltips: {
					tenantMenuTooltip:	isOpen
				}
			});
		}
	}

	checkContentUpdating()
	{
		const { r3provider } = this.props;

		if(null !== this.props.onCheckUpdating && this.props.onCheckUpdating()){
			this.setState({
				r3Message:	new R3Message(r3provider.getR3TextRes().eNowUpdating, errorType)
			});
			return false;
		}
		return true;
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
						onClick={ (event) => this.handleDummyBarClick(event, null) }
					>
						{ packages[cnt] }
					</MenuItem>
				);
			}
		}
		return _menuitems;
	}

	getMenuItems()
	{
		const { theme, classes, r3provider } = this.props;
		let	_menuitems = [];

		if(this.props.enDock){
			_menuitems.push(
				<MenuItem
					key={ menuValues.dock }
					onClick={ event => this.handleDummyBarClick(event, menuValues.dock) }
				>
					{ r3provider.getR3TextRes().tResDockTreeMenu }
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
						onClick={ event => this.handleDummyBarClick(event, cnt) }
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
				onClick={ event => this.handleDummyBarClick(event, menuValues.license) }
			>
				{ r3provider.getR3TextRes().tResLicensesMenu }
				<ListItemIcon>
					<ArrowRightIcon
						className={ classes.menuRightIcon }
					/>
				</ListItemIcon>

				<Menu
					id={ componentKeyIds.dummyLicenseMenuId }
					anchorEl={ this.state.dummyLicenseMenuAnchorEl }
					open={ Boolean(this.state.dummyLicenseMenuAnchorEl) }
					onClose={ this.handleDummyBarMenuClose }
					getContentAnchorEl={ null }
					{ ...theme.r3MainTree.licenseMenu }
				>
					{ this.getLicensesMenuItems() }
				</Menu>
			</MenuItem>
		);

		// About
		_menuitems.push(
			<MenuItem
				key={ menuValues.about }
				onClick={ event => this.handleDummyBarClick(event, menuValues.about) }
			>
				{ r3provider.getR3TextRes().tResAboutMenu }
			</MenuItem>
		);

		return _menuitems;
	}

	getTenantListMenuItems()
	{
		const { r3provider } = this.props;

		if(!(this.props.tenants instanceof Array) || 0 === this.props.tenants.length){
			return (
				<MenuItem
					key={ componentKeyIds.noTenantList }
					disabled={ true }
				>
					{ r3provider.getR3TextRes().tResNoTenantLabel }
				</MenuItem>
			);
		}else{
			return (
				this.props.tenants.map( (item, pos) => {
					return (
						<MenuItem
							key={ pos }
							onClick={ event => this.handleTenantChange(event, pos) }
						>
							{ (r3IsEmptyString(item.display) ? r3provider.getR3TextRes().tResUnknownTenantLabel : item.display) }
						</MenuItem>
					);
				})
			);
		}
	}

	getDummyBarSubHeader()
	{
		const { theme, classes, r3provider } = this.props;

		let	themeToolbar = this.props.enDock ? theme.r3MainTree.dummyBarToolbar : theme.r3MainTree.smallDummyBarToolbar;

		return (
			<AppBar
				{ ...theme.r3MainTree.dummyBarAppbar }
				className={ classes.dummyBarAppbar }
			>
				<Toolbar
					{ ...themeToolbar }
					className={ classes.dummyBarToolbar }
				>
					<Tooltip
						title={ r3provider.getR3TextRes().tResMainMenuTT }
						open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.mainMenuTooltip, 'boolean')) ? false : this.state.tooltips.mainMenuTooltip) }
					>
						<IconButton
							onClick={ this.handleDummyBarButton }
							onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.mainMenu, true) }
							onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.mainMenu, false) }
							aria-owns={ this.state.dummyBarMenuAnchorEl ? componentKeyIds.dummyBarMenuId : undefined }
							{ ...theme.r3MainTree.dummyBarMainMenuButton }
						>
							<MenuIcon />
						</IconButton>
					</Tooltip>

					<Menu
						id={ componentKeyIds.dummyBarMenuId }
						anchorEl={ this.state.dummyBarMenuAnchorEl }
						open={ Boolean(this.state.dummyBarMenuAnchorEl) }
						onClose={ this.handleDummyBarMenuClose }
						getContentAnchorEl={ null }
						{ ...theme.r3MainTree.dummyBarMainMenu }
					>
						{ this.getMenuItems() }
					</Menu>

					<Typography
						{ ...theme.r3MainTree.title }
						className={ classes.title }
					>
						{ this.props.title }
					</Typography>
				</Toolbar>
			</AppBar>
		);
	}

	getTenantSubHeaders()
	{
		const { theme, classes, r3provider } = this.props;

		let	menuItem	= this.getTenantListMenuItems();
		let	titleName	= ((this.props.tenants instanceof Array && 0 < this.props.tenants.length) ? r3provider.getR3TextRes().tResUnselectedTenantLabel : r3provider.getR3TextRes().tResNoTenantLabel);
		let	themeToolbar= (this.props.enDock ? theme.r3MainTree.subheaderToolbar : theme.r3MainTree.smallSubheaderToolbar);

		this.props.tenants.map( (tenant, pos) => {			// eslint-disable-line no-unused-vars
			if(r3DeepCompare(tenant, this.props.selectedTenant)){
				titleName	= tenant.display;
			}
		});
		let	textLabel	= (
			<Typography
				{ ...theme.r3MainTree.chipText }
				className={ classes.chipText }
			>
				{ r3provider.getR3TextRes().tResTenantLabel }
			</Typography>
		);

		return (
			<AppBar
				{ ...theme.r3MainTree.subheaderAppbar }
				className={ classes.subheaderAppbar }
			>
				<Toolbar
					{ ...themeToolbar }
					className={ classes.subheaderToolbar }
				>
					<Chip
						label={ textLabel }
						{ ...theme.r3MainTree.chip }
						className={ classes.chip }
					/>

					<Typography
						{ ...theme.r3MainTree.tenantListText }
						className={ classes.tenantListText }
					>
						{ titleName }
					</Typography>

					<Tooltip
						title={ r3provider.getR3TextRes().tResSelectTenantTT }
						open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.tenantMenuTooltip, 'boolean')) ? false : this.state.tooltips.tenantMenuTooltip) }
					>
						<IconButton
							aria-owns={ this.state.tenantMenuAnchorEl ? componentKeyIds.tenantMenuId : undefined }
							onClick={ this.handleTenantMenuButton }
							onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.tenantMenu, true) }
							onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.tenantMenu, false) }
							{ ...theme.r3MainTree.tenantListButton }
						>
							<MoreVertIcon />
						</IconButton>
					</Tooltip>

					<Menu
						id={ componentKeyIds.tenantMenuId }
						anchorEl={ this.state.tenantMenuAnchorEl }
						open={ Boolean(this.state.tenantMenuAnchorEl) }
						onClose={ this.handleTenantMenuClose }
						getContentAnchorEl={ null }
						{ ...theme.r3MainTree.tenantListMenu }
					>
						{ menuItem }
					</Menu>
				</Toolbar>
			</AppBar>
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
		const { theme, classes } = this.props;

		if(undefined === treeList || !(treeList instanceof Array)){
			return;
		}
		let	_type = type;

		return (
			treeList.map( (item, pos) => {							// eslint-disable-line no-unused-vars
				let	listItemKey		= _type + '_' + item.path;
				let	isSelected		= (undefined != item.selected ? true : false);

				let	isCollapseExpand = false;
				if(!r3IsEmptyEntityObject(this.state.collapseExpands, listItemKey) && r3IsSafeTypedEntity(this.state.collapseExpands[listItemKey], 'boolean')){
					isCollapseExpand = this.state.collapseExpands[listItemKey];
				}

				let	expandIcon;
				let	collapseItem;
				if(undefined !== item.children && (item.children instanceof Array) && 0 < item.children.length){
					let childrenItem = this.getChildrenListItems(item.children, _type);

					if(childrenItem){
						if(isCollapseExpand){
							expandIcon = (
								<ListItemIcon
									className={ classes.expandListItemIcon }
								>
									<ExpandLessIcon />
								</ListItemIcon>
							);
						}else{
							expandIcon = (
								<ListItemIcon
									className={ classes.expandListItemIcon }
								>
									<ExpandMoreIcon />
								</ListItemIcon>
							);
						}
						collapseItem = (
							<Collapse
								in={ isCollapseExpand }
								{ ...theme.r3MainTree.collapse }
								className={ classes.collapse }
							>
								<List
									{ ...theme.r3MainTree.list }
								>
									{ childrenItem }
								</List>
							</Collapse>
						);
					}
				}

				let	accordingItemText;
				if(undefined !== item.selected && item.selected){
					accordingItemText = theme.r3MainTree.childSelectedItemText;
				}else{
					accordingItemText = theme.r3MainTree.childItemText;
				}

				// [NOTE]
				// Returning React.Fragment as a top component causes a key props error, so we use div to avoid it.
				//
				return (
					<div key={ listItemKey }>
						<ListItem
							onClick={ (event) => this.handleListItemChange(event, _type, item.path, isSelected, listItemKey) }
							{ ...theme.r3MainTree.listItem }
						>
							<ListItemText
								primary={ item.name }
								{ ...accordingItemText }
								className={ classes.childListItemText }
							/>
							{ expandIcon }
						</ListItem>
						{ collapseItem }
					</div>
				);
			})
		);
	}

	//
	// For Service Name(TOP) under TOP > SERVICE
	//
	getServicesListItems(treeList)
	{
		const { theme, classes } = this.props;

		if(undefined === treeList || !(treeList instanceof Array)){
			return;
		}

		return (
			treeList.map( (item, pos) => {							// eslint-disable-line no-unused-vars
				let	listItemKey		= 'service_' + item.path;
				let	isSelected		= (undefined != item.selected ? true : false);

				let	isCollapseExpand = false;
				if(!r3IsEmptyEntityObject(this.state.collapseExpands, listItemKey) && r3IsSafeTypedEntity(this.state.collapseExpands[listItemKey], 'boolean')){
					isCollapseExpand = this.state.collapseExpands[listItemKey];
				}

				let	ownerIcon;
				if(r3IsSafeTypedEntity(item.owner, 'boolean') && true === item.owner){
					ownerIcon = (
						<ListItemIcon>
							<OwnerIcon
								{ ...theme.r3MainTree.editIcon }
							/>
						</ListItemIcon>
					);
				}

				let	expandIcon;
				let	collapseItem;
				if(undefined !== item.children && (item.children instanceof Array) && 0 < item.children.length){
					let childrenItem = this.getServiceMainListItems(item.children, item.path);
					if(childrenItem){
						if(isCollapseExpand){
							expandIcon = (
								<ListItemIcon
									className={ classes.expandListItemIcon }
								>
									<ExpandLessIcon />
								</ListItemIcon>
							);
						}else{
							expandIcon = (
								<ListItemIcon
									className={ classes.expandListItemIcon }
								>
									<ExpandMoreIcon />
								</ListItemIcon>
							);
						}
						collapseItem = (
							<Collapse
								in={ isCollapseExpand }
								{ ...theme.r3MainTree.collapse }
								className={ classes.serviceLabelCollapse }
							>
								<List
									{ ...theme.r3MainTree.list }
								>
									{ childrenItem }
								</List>
							</Collapse>
						);
					}
				}

				let	accordingItemText;
				if(undefined !== item.selected && item.selected){
					accordingItemText = theme.r3MainTree.childSelectedItemText;
				}else{
					accordingItemText = theme.r3MainTree.childItemText;
				}

				// [NOTE]
				// Returning React.Fragment as a top component causes a key props error, so we use div to avoid it.
				//
				return (
					<div key={ listItemKey }>
						<ListItem
							onClick={ (event) => this.handleNameItemInServiceChange(event, item.path, isSelected, listItemKey) }
							{ ...theme.r3MainTree.listItem }
						>
							<ListItemText
								primary={ item.name }
								{ ...accordingItemText }
								className={ classes.childListItemText }
							/>
							{ ownerIcon }
							{ expandIcon }
						</ListItem>
						{ collapseItem }
					</div>
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
		const { theme, classes } = this.props;

		if(undefined === treeList || !(treeList instanceof Array)){
			return;
		}
		let	_service_name = service_name;

		return (
			treeList.map( (item, pos) => {							// eslint-disable-line no-unused-vars

				let	listItemKey		= 'service_' + _service_name + '_' + item.path;
				let	isSelected		= (undefined != item.selected ? true : false);

				let	isCollapseExpand = false;
				if(!r3IsEmptyEntityObject(this.state.collapseExpands, listItemKey) && r3IsSafeTypedEntity(this.state.collapseExpands[listItemKey], 'boolean')){
					isCollapseExpand = this.state.collapseExpands[listItemKey];
				}

				let	expandIcon;
				let	collapseItem;
				if(undefined !== item.children && (item.children instanceof Array) && 0 < item.children.length){
					let childrenItem = this.getServiceChildrenListItems(item.children, _service_name, item.path);
					if(childrenItem){
						if(isCollapseExpand){
							expandIcon = (
								<ListItemIcon
									className={ classes.expandListItemIcon }
								>
									<ExpandLessIcon />
								</ListItemIcon>
							);
						}else{
							expandIcon = (
								<ListItemIcon
									className={ classes.expandListItemIcon }
								>
									<ExpandMoreIcon />
								</ListItemIcon>
							);
						}
						collapseItem = (
							<Collapse
								in={ isCollapseExpand }
								{ ...theme.r3MainTree.collapse }
								className={ classes.collapse }
							>
								<List
									{ ...theme.r3MainTree.list }
								>
									{ childrenItem }
								</List>
							</Collapse>
						);
					}
				}

				let	accordingItemText;
				if(undefined !== item.selected && item.selected){
					accordingItemText = theme.r3MainTree.topSelectedItemText;
				}else{
					accordingItemText = theme.r3MainTree.topItemText;
				}

				// [NOTE]
				// Returning React.Fragment as a top component causes a key props error, so we use div to avoid it.
				//
				return (
					<div key={ listItemKey }>
						<ListItem
							onClick={ (event) => this.handleTypeInServiceChange(event, _service_name, item.path, isSelected, listItemKey) }
							{ ...theme.r3MainTree.listItem }
						>
							<ListItemIcon>
								<LabelIcon />
							</ListItemIcon>
							<ListItemText
								primary={ item.name }
								{ ...accordingItemText }
								className={ classes.inServiceLabelListItemText }
							/>
							{ expandIcon }
						</ListItem>
						{ collapseItem }
					</div>
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
		const { theme, classes } = this.props;

		if(undefined === treeList || !(treeList instanceof Array)){
			return;
		}
		let	_service_name		= service_name;
		let	_type_in_service	= type_in_service;

		return (
			treeList.map( (item, pos) => {							// eslint-disable-line no-unused-vars
				let	listItemKey		= 'service_' + _service_name + '_' + _type_in_service + '_' + item.path;
				let	isSelected		= (undefined != item.selected ? true : false);

				let	isCollapseExpand = false;
				if(!r3IsEmptyEntityObject(this.state.collapseExpands, listItemKey) && r3IsSafeTypedEntity(this.state.collapseExpands[listItemKey], 'boolean')){
					isCollapseExpand = this.state.collapseExpands[listItemKey];
				}

				let	expandIcon;
				let	collapseItem;
				if(undefined !== item.children && (item.children instanceof Array) && 0 < item.children.length){
					let childrenItem = this.getServiceChildrenListItems(item.children, _service_name, _type_in_service);
					if(childrenItem){
						if(isCollapseExpand){
							expandIcon = (
								<ListItemIcon
									className={ classes.expandListItemIcon }
								>
									<ExpandLessIcon />
								</ListItemIcon>
							);
						}else{
							expandIcon = (
								<ListItemIcon
									className={ classes.expandListItemIcon }
								>
									<ExpandMoreIcon />
								</ListItemIcon>
							);
						}
						collapseItem = (
							<Collapse
								in={ isCollapseExpand }
								{ ...theme.r3MainTree.collapse }
								className={ classes.collapse }
							>
								<List
									{ ...theme.r3MainTree.list }
								>
									{ childrenItem }
								</List>
							</Collapse>
						);
					}
				}

				let	accordingItemText;
				if(undefined !== item.selected && item.selected){
					accordingItemText = theme.r3MainTree.childSelectedItemText;
				}else{
					accordingItemText = theme.r3MainTree.childItemText;
				}

				// [NOTE]
				// Returning React.Fragment as a top component causes a key props error, so we use div to avoid it.
				//
				return (
					<div key={ listItemKey }>
						<ListItem
							onClick={ (event) => this.handleListItemInServiceChange(event, _service_name, _type_in_service, item.path, isSelected, listItemKey) }
							{ ...theme.r3MainTree.listItem }
						>
							<ListItemText
								primary={ item.name }
								{ ...accordingItemText }
								className={ classes.inServiceChildListItemText }
							/>
							{ expandIcon }
						</ListItem>
						{ collapseItem }
					</div>
				);

			})
		);
	}

	//
	// For TOP
	//
	getMainListItems(treeList)
	{
		const { theme, classes } = this.props;

		console.info('CALL : getMainListItems');

		if(undefined === treeList || !(treeList instanceof Array)){
			return;
		}

		return (
			treeList.map( (item, pos) =>							// eslint-disable-line no-unused-vars
			{
				let	listItemKey		= 'top_' + item.path;
				let	isSelected		= (undefined != item.selected ? true : false);

				let	isCollapseExpand = false;
				if(!r3IsEmptyEntityObject(this.state.collapseExpands, listItemKey) && r3IsSafeTypedEntity(this.state.collapseExpands[listItemKey], 'boolean')){
					isCollapseExpand = this.state.collapseExpands[listItemKey];
				}

				let	expandIcon;
				let	collapseItem;
				if(r3IsSafeTypedEntity(item.children, 'array') && 0 < item.children.length){
					let childrenItem;
					if(r3CompareCaseString(serviceType, item.path)){
						childrenItem = this.getServicesListItems(item.children);
					}else{
						childrenItem = this.getChildrenListItems(item.children, item.path);
					}
					if(childrenItem){
						if(isCollapseExpand){
							expandIcon = (
								<ListItemIcon
									className={ classes.expandListItemIcon }
								>
									<ExpandLessIcon />
								</ListItemIcon>
							);
						}else{
							expandIcon = (
								<ListItemIcon
									className={ classes.expandListItemIcon }
								>
									<ExpandMoreIcon />
								</ListItemIcon>
							);
						}
						collapseItem = (
							<Collapse
								in={ isCollapseExpand }
								{ ...theme.r3MainTree.collapse }
							>
								<List
									{ ...theme.r3MainTree.list }
								>
									{ childrenItem }
								</List>
							</Collapse>
						);
					}
				}

				let	accordingItemText;
				if(undefined !== item.selected && item.selected){
					accordingItemText = theme.r3MainTree.topSelectedItemText;
				}else{
					accordingItemText = theme.r3MainTree.topItemText;
				}

				// [NOTE]
				// Returning React.Fragment as a top component causes a key props error, so we use div to avoid it.
				//
				return (
					<div key={ listItemKey }>
						<ListItem
							onClick={ (event) => this.handleTypeItemChange(event, item.path, isSelected, listItemKey) }
							{ ...theme.r3MainTree.listItem }
						>
							<ListItemIcon>
								<LabelIcon />
							</ListItemIcon>
							<ListItemText
								primary={ item.name }
								{ ...accordingItemText }
								className={ classes.listItemText }
							/>
							{ expandIcon }
						</ListItem>
						{ collapseItem }
					</div>
				);
			})
		);
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

	getMainTreeLists()
	{
		const { theme, classes } = this.props;

		return (
			<div
				className={ (this.props.isDocking ? classes.dockedList : {}) }
			>
				{ this.getSubHeaders() }
				<List
					id={ componentKeyIds.topListId }
					key={ componentKeyIds.topList }
					{ ...theme.r3MainTree.list }
				>
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
			const { classes } = this.props;

			return (
				<React.Fragment>
					<Drawer
						open={ this.props.open }
						onClose={ (event) => this.handleTreePopupClose(event) }
						className={ classes.drawer }
					>
						<div
							className={ classes.adjustment }
						>
							{ this.getMainTreeLists() }
						</div>
					</Drawer>
				</React.Fragment>
			);
		}
	}
}

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
