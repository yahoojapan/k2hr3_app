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
import Drawer						from '@mui/material/Drawer';
import Chip							from '@mui/material/Chip';
import Menu							from '@mui/material/Menu';
import MenuItem						from '@mui/material/MenuItem';
import Divider						from '@mui/material/Divider';
import IconButton					from '@mui/material/IconButton';
import Tooltip						from '@mui/material/Tooltip';
import Typography					from '@mui/material/Typography';
import List							from '@mui/material/List';
import ListItem						from '@mui/material/ListItem';
import ListItemText					from '@mui/material/ListItemText';
import ListItemIcon					from '@mui/material/ListItemIcon';
import Collapse						from '@mui/material/Collapse';
import Box							from '@mui/material/Box';

import ExpandLessIcon				from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon				from '@mui/icons-material/ExpandMore';
import MenuIcon						from '@mui/icons-material/Menu';
import ArrowRightIcon				from '@mui/icons-material/ArrowRight';
import LabelIcon					from '@mui/icons-material/Label';
import OwnerIcon					from '@mui/icons-material/Person';
import MoreVertIcon					from '@mui/icons-material/MoreVert';
import EditIcon						from '@mui/icons-material/Edit';

import type { R3Theme }				from './r3theme';
import { r3MainTreeStyle }				from './r3styles';
import R3LocalTenantDialog			from './r3localtenantdialog';
import R3PopupMsgDialog				from './r3popupmsgdialog';
import R3Message					from '../util/r3message';
import R3Provider					from '../util/r3provider';
import { localTenantPrefix }		from '../util/r3define';
import { TreeListItem, serviceType, errorType, LicenseEntryObject, TenantData }	from '../util/r3types';
import { r3IsNumber, r3IsArray, r3DeepCompare, r3IsEmptyEntity, r3IsEmptyStringObject, r3IsEmptyString, r3CompareCaseString, r3IsEmptyEntityObject, r3DeepClone, r3IsBoolean }	from '../util/r3util';

//
// Props and State type
//
type R3MainTreeRequiredProps = {
	theme:						R3Theme;
	r3provider:					R3Provider;
	title:						string;
	tenants:					TenantData[];
	onTenantChange:				(tenant: TenantData) => void;
	onLocalTenantCreate:		(name: string, display: string, description: string, users: string[]) => void;
	onLocalTenantChange:		(name: string, id: string, display: string, description: string, users: string[]) => void;
	onLocalTenantDelete:		(name: string, id: string) => void;
	onTypeItemChange:			(type: string) => void;
	onListItemChange:			(type: string, path: string) => void;
	onNameItemInServiceChange:	(servicename: string) => void;
	onTypeInServiceChange:		(servicename: string, type_in_service: string) => void;
	onListItemInServiceChange:	(servicename: string, type_in_service: string, path: string) => void;
	onPopupClose:				() => void;
	onTreeDocking:				(docking: boolean) => void;
	onAbout:					(packageName: string | null) => void;
};

type R3MainTreeOptionProps = {
	open?:						boolean;
	enDock?:					boolean;
	isDocking?:					boolean;
	licensesObj?:				LicenseEntryObject;

	editableLocalTenant?:		boolean;
	userName?:					string | null;
	treeList?:					TreeListItem[] | null;

	selectedTenant?:			TenantData | null;
	selectedType?:				string | null;
	selectedService?:			string | null;
	selectedPath?:				string | null;

	onCheckUpdating?:			(() => boolean) | null;
	onOpenChange?:				((open: boolean) => void) | null;
};

type R3MainTreeProps = R3MainTreeRequiredProps & R3MainTreeOptionProps;

type R3MainTreeState = {
	r3Message:					R3Message | null;
	dummyBarMenuAnchorEl:		HTMLElement | null;
	dummyLicenseMenuAnchorEl:	HTMLElement | null;
	tenantMenuAnchorEl:			HTMLElement | null;
	localTenantDialogOpen:		boolean;
	localTenantCreateMode:		boolean;
	tooltips: {
		mainMenuTooltip?:		boolean;
		tenantEditTooltip?:		boolean;
		tenantMenuTooltip?:		boolean;
	};
	collapseExpands:			Record<string, boolean>;
};

type R3MainTreeStyleType = ReturnType<typeof r3MainTreeStyle>;

//
// Local variables
//
const menuValues = {
	dock:				'DOCK',
	about:				'ABOUT',
	license:			'LICENSES_TOP',
	noLicense:			'NOLICENSE',
	sign:				'SIGNINOUT',
	userName:			'USERNAME',
	localTenant:		'LOCALTENANT'
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
	tenantEdit:			'tenantEdit',
	tenantMenu:			'tenantMenu'
};

//
// Main TreeView Class
//
export default class R3MainTree extends React.Component<R3MainTreeProps, R3MainTreeState>
{
	sxClasses: R3MainTreeStyleType;

	static defaultProps: R3MainTreeOptionProps = {
		open:					false,
		enDock:					true,
		isDocking:				true,
		licensesObj:			null,

		editableLocalTenant:	true,
		userName:				null,
		treeList:				null,

		selectedTenant:			null,
		selectedType:			null,
		selectedService:		null,
		selectedPath:			null,

		onCheckUpdating:		null
	};

	state: R3MainTreeState = {
		r3Message:					null,
		dummyBarMenuAnchorEl:		null,
		dummyLicenseMenuAnchorEl:	null,
		tenantMenuAnchorEl:			null,
		localTenantDialogOpen:		false,
		localTenantCreateMode:		false,

		tooltips: {
			mainMenuTooltip:		false,
			tenantEditTooltip:		false,
			tenantMenuTooltip:		false
		},
		collapseExpands:			{}
	};

	constructor(props: R3MainTreeProps)
	{
		super(props);

		// Binding(do not define handlers as arrow functions for performance)
		this.handleTenantEditButton			= this.handleTenantEditButton.bind(this);
		this.handLocalTenantDialogClose		= this.handLocalTenantDialogClose.bind(this);

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

		// styles
		this.sxClasses						= r3MainTreeStyle(props.theme);
	}

	handleTenantEditButton(event: React.MouseEvent<HTMLElement>)
	{
		if(!this.checkContentUpdating()){
			return;
		}

		this.setState({
			localTenantDialogOpen:	true,
			localTenantCreateMode:	false,
			tooltips: {
				tenantEditTooltip:	false
			}
		});
	}

	handLocalTenantDialogClose(event: React.SyntheticEvent | {}, reason: string | null, result: boolean, newTenantName: string | null, tenantId: string | null, newTenantDisplay: string | null, newTenantDescription: string | null, newTenantUsers: string[] | null)
	{
		if(!result){
			this.setState({
				localTenantDialogOpen:	false,
				localTenantCreateMode:	false,
				r3Message:				null,
				tooltips: {
					tenantEditTooltip:	false
				}
			});
			return;
		}
		// [NOTE]
		// Value checking is completed in R3LocalTenantDialog.
		// No checks are required here.
		//

		//
		// Call parent handler for update/create tenant
		//
		if(this.state.localTenantCreateMode){
			// create
			this.props.onLocalTenantCreate(newTenantName, newTenantDisplay, newTenantDescription, newTenantUsers);
		}else if(!r3IsArray(newTenantUsers) || 0 === newTenantUsers.length){
			// delete
			this.props.onLocalTenantDelete(newTenantName, tenantId);
		}else{
			// update
			this.props.onLocalTenantChange(newTenantName, tenantId, newTenantDisplay, newTenantDescription, newTenantUsers);
		}

		// close tenant dialog
		this.setState({
			localTenantDialogOpen:	false,
			localTenantCreateMode:	false,
			r3Message:				null,
			tooltips: {
				tenantEditTooltip:	false
			}
		});
	}

	handleTenantMenuButton(event: React.MouseEvent<HTMLElement>)
	{
		this.setState({
			tenantMenuAnchorEl:		event.currentTarget,
			tooltips: {
				tenantMenuTooltip:	false
			}
		});
	}

	handleTenantMenuClose(event: React.SyntheticEvent)
	{
		this.setState({
			tenantMenuAnchorEl:	null
		});
	}

	handleTenantChange = (event: React.MouseEvent<HTMLElement>, value: number) =>
	{
		if(this.checkContentUpdating()){
			this.props.tenants.map( (item: TenantData, pos: number) => {
				if(value === pos){
					// if selected tenant is changed, we need to clear collapseExpands{}.
					//
					if(	!r3IsEmptyEntityObject(this.props.selectedTenant, 'name')		&&
						!r3IsEmptyEntityObject(this.props.selectedTenant, 'display')	&&
						!r3IsEmptyEntityObject(this.props.selectedTenant, 'id')			&&
						!r3IsEmptyEntityObject(this.props.selectedTenant, 'description')&&
						!r3IsEmptyEntityObject(item, 'name')							&&
						!r3IsEmptyEntityObject(item, 'display')							&&
						item.name !== this.props.selectedTenant.name					&&
						item.display !== this.props.selectedTenant.display				)
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
	};

	handleCreateLocalTenant = (event: React.MouseEvent<HTMLElement>) =>
	{
		if(this.checkContentUpdating()){
			// open dialog and closing menu
			this.setState({
				localTenantDialogOpen:	true,
				localTenantCreateMode:	true,
				tenantMenuAnchorEl:		null
			});
		}

		// closing menu
		this.setState({
			tenantMenuAnchorEl:	null
		});
	};

	updateCollapseChange(prevSelected: boolean, collapseKey: string)
	{
		let newCollapseExpands	= Object.assign({}, this.state.collapseExpands);

		if(r3IsEmptyEntityObject(newCollapseExpands, collapseKey) || !r3IsBoolean(newCollapseExpands[collapseKey])){
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

	handleTypeItemChange(event: React.MouseEvent<HTMLElement>, type: string, prevSelected: boolean, collapseKey: string)
	{
		if(!this.checkContentUpdating()){
			return;
		}
		this.updateCollapseChange(prevSelected, collapseKey);

		this.props.onTypeItemChange(type);
	}

	handleListItemChange(event: React.MouseEvent<HTMLElement>, type: string, path: string, prevSelected: boolean, collapseKey: string)
	{
		if(!this.checkContentUpdating()){
			return;
		}
		this.updateCollapseChange(prevSelected, collapseKey);

		this.props.onListItemChange(type, path);
	}

	handleNameItemInServiceChange(event: React.MouseEvent<HTMLElement>, servicename: string, prevSelected: boolean, collapseKey: string)
	{
		if(!this.checkContentUpdating()){
			return;
		}
		this.updateCollapseChange(prevSelected, collapseKey);

		this.props.onNameItemInServiceChange(servicename);
	}

	handleTypeInServiceChange(event: React.MouseEvent<HTMLElement>, servicename: string, type_in_service: string, prevSelected: boolean, collapseKey: string)
	{
		if(!this.checkContentUpdating()){
			return;
		}
		this.updateCollapseChange(prevSelected, collapseKey);

		this.props.onTypeInServiceChange(servicename, type_in_service);
	}

	handleListItemInServiceChange(event: React.MouseEvent<HTMLElement>, servicename: string, type_in_service: string, path: string, prevSelected: boolean, collapseKey: string)
	{
		if(!this.checkContentUpdating()){
			return;
		}
		this.updateCollapseChange(prevSelected, collapseKey);

		this.props.onListItemInServiceChange(servicename, type_in_service, path);
	}

	handleTreePopupClose(event: object, _reason?: string)
	{
		console.info('CALL - Drawer close');
		this.props.onPopupClose();
	}

	handleDummyBarButton(event: React.MouseEvent<HTMLElement>)
	{
		this.setState({
			dummyBarMenuAnchorEl:		event.currentTarget,
			dummyLicenseMenuAnchorEl:	null,
			tooltips: {
				mainMenuTooltip:		false
			}
		});
	}

	handleDummyBarMenuClose(event: React.SyntheticEvent)
	{
		this.setState({
			dummyBarMenuAnchorEl:		null,
			dummyLicenseMenuAnchorEl:	null
		});
	}

	handleDummyBarClick = (event: React.MouseEvent<HTMLElement>, value: string | number | null) =>
	{
		// [NOTE]
		// The sub MenuItem for licenses menu is received in the OnClick event,
		// not the OnChange event.
		// Then, the value is undefined in the onClick event, so we change the
		// behavior of the function with this value.
		//
		if(r3IsEmptyEntity(value)){
			// Licenses
			if(event.target instanceof HTMLElement && !r3IsEmptyString(event.target.innerText)){
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

			}else if(r3IsNumber(value) && !isNaN(value)){
				let	_appmenu= this.props.r3provider.getR3Context().getSafeAppMenu();
				let	_pos	= value;
				if(0 <= _pos && r3IsArray(_appmenu) && _pos < _appmenu.length && !r3IsEmptyStringObject(_appmenu[_pos], 'url')){
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
	};

	handMessageDialogClose(_event: {}, _reason: string | undefined, _result: boolean)
	{
		this.setState({
			r3Message:	null
		});
	}

	handTooltipChange = (event: React.MouseEvent<HTMLElement>, type: string, isOpen: boolean) =>
	{
		if(tooltipValues.mainMenu === type){
			this.setState({
				tooltips: {
					mainMenuTooltip:	isOpen
				}
			});
		}else if(tooltipValues.tenantEdit === type){
			this.setState({
				tooltips: {
					tenantEditTooltip:	isOpen
				}
			});
		}else if(tooltipValues.tenantMenu === type){
			this.setState({
				tooltips: {
					tenantMenuTooltip:	isOpen
				}
			});
		}
	};

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

	getAllTenantNames()
	{
		let	tenantNames = [];
		for(let cnt = 0; cnt < this.props.tenants.length; ++cnt){
			if(!r3IsEmptyEntityObject(this.props.tenants[cnt], 'name') && !r3IsEmptyString(this.props.tenants[cnt].name)){
				tenantNames.push(this.props.tenants[cnt].name);
			}
		}
		tenantNames.sort();
		return tenantNames;
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
		const { theme, r3provider } = this.props;
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

		let	_appmenu = this.props.r3provider.getR3Context().getSafeAppMenu();
		if(r3IsArray(_appmenu) && 0 < _appmenu.length){
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
						sx={ this.sxClasses.menuRightIcon }
					/>
				</ListItemIcon>

				<Menu
					id={ componentKeyIds.dummyLicenseMenuId }
					anchorEl={ this.state.dummyLicenseMenuAnchorEl }
					open={ Boolean(this.state.dummyLicenseMenuAnchorEl) }
					onClose={ this.handleDummyBarMenuClose }
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

		if(!r3IsArray(this.props.tenants) || 0 === this.props.tenants.length){
			return (
				<MenuItem
					key={ componentKeyIds.noTenantList }
					disabled={ (r3IsEmptyString(this.props.userName) || !this.props.editableLocalTenant) }
				>
					{ r3provider.getR3TextRes().tResNoTenantLabel }
				</MenuItem>
			);
		}else{
			return (
				this.props.tenants.map( (item: TenantData, pos: number) => {
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

	getLocalTenantMenuItem()
	{
		const { r3provider } = this.props;

		if(r3IsEmptyString(this.props.userName) || !this.props.editableLocalTenant){
			return;
		}
		return (
			<MenuItem
				key={ menuValues.localTenant }
				onClick={ event => this.handleCreateLocalTenant(event) }
			>
				<Typography
					sx={ this.sxClasses.localTenantMenu }
				>
					{ r3provider.getR3TextRes().tResAddLocalTenantMenu }
				</Typography>
			</MenuItem>
		);
	}

	getLocalTenantMenuDivider()
	{
		if(r3IsEmptyString(this.props.userName) || !this.props.editableLocalTenant){
			return;
		}
		return (
			<Divider />
		);
	}

	getDummyBarSubHeader()
	{
		const { theme, r3provider } = this.props;

		let	themeToolbar = this.props.enDock ? theme.r3MainTree.dummyBarToolbar : theme.r3MainTree.smallDummyBarToolbar;

		return (
			<AppBar
				{ ...theme.r3MainTree.dummyBarAppbar }
				sx={ this.sxClasses.dummyBarAppbar }
			>
				<Toolbar
					{ ...themeToolbar }
					sx={ this.sxClasses.dummyBarToolbar }
				>
					<Tooltip
						title={ r3provider.getR3TextRes().tResMainMenuTT }
						open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsBoolean(this.state.tooltips.mainMenuTooltip)) ? false : this.state.tooltips.mainMenuTooltip) }
					>
						<IconButton
							onClick={ this.handleDummyBarButton }
							onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.mainMenu, true) }
							onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.mainMenu, false) }
							aria-owns={ this.state.dummyBarMenuAnchorEl ? componentKeyIds.dummyBarMenuId : undefined }
							{ ...theme.r3MainTree.dummyBarMainMenuButton }
							size="large"
						>
							<MenuIcon />
						</IconButton>
					</Tooltip>

					<Menu
						id={ componentKeyIds.dummyBarMenuId }
						anchorEl={ this.state.dummyBarMenuAnchorEl }
						open={ Boolean(this.state.dummyBarMenuAnchorEl) }
						onClose={ this.handleDummyBarMenuClose }
						{ ...theme.r3MainTree.dummyBarMainMenu }
					>
						{ this.getMenuItems() }
					</Menu>

					<Typography
						{ ...theme.r3MainTree.title }
						sx={ this.sxClasses.title }
					>
						{ this.props.title }
					</Typography>
				</Toolbar>
			</AppBar>
		);
	}

	getTenantSubHeaders()
	{
		const { theme, r3provider } = this.props;

		let	menuItem				= this.getTenantListMenuItems();
		let	menuLocalTenantItem		= this.getLocalTenantMenuItem();
		let	menuLocalTenantDivider	= this.getLocalTenantMenuDivider();
		let	titleName				= ((r3IsArray(this.props.tenants) && 0 < this.props.tenants.length) ? r3provider.getR3TextRes().tResUnselectedTenantLabel : r3provider.getR3TextRes().tResNoTenantLabel);
		let	themeToolbar			= (this.props.enDock ? theme.r3MainTree.subheaderToolbar : theme.r3MainTree.smallSubheaderToolbar);

		this.props.tenants.map( (tenant: TenantData, _pos: number) => {
			if(r3DeepCompare(tenant, this.props.selectedTenant)){
				titleName	= tenant.display;
			}
		});

		//
		// Local tenant edit button
		//
		let	tenantEditBtn;
		if(	!r3IsEmptyString(this.props.userName)							&&
			this.props.editableLocalTenant									&&
			!r3IsEmptyEntityObject(this.props.selectedTenant, 'name')		&&
			0 === this.props.selectedTenant.name.indexOf(localTenantPrefix)	&&
			r3IsArray(this.props.selectedTenant.users)						)
		{
			tenantEditBtn = (
				<Tooltip
					title={ r3provider.getR3TextRes().tResTenantEditTT }
					open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsBoolean(this.state.tooltips.tenantEditTooltip)) ? false : this.state.tooltips.tenantEditTooltip) }
				>
					<IconButton
						onClick={ this.handleTenantEditButton }
						onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.tenantEdit, true) }
						onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.tenantEdit, false) }
						{ ...theme.r3MainTree.tenantEditButton }
						size="large"
					>
						<EditIcon />
					</IconButton>
				</Tooltip>
			);
		}

		let	textLabel	= (
			<Typography
				{ ...theme.r3MainTree.chipText }
				sx={ this.sxClasses.chipText }
			>
				{ r3provider.getR3TextRes().tResTenantLabel }
			</Typography>
		);

		return (
			<AppBar
				{ ...theme.r3MainTree.subheaderAppbar }
				sx={ this.sxClasses.subheaderAppbar }
			>
				<Toolbar
					{ ...themeToolbar }
					sx={ this.sxClasses.subheaderToolbar }
				>
					<Chip
						label={ textLabel }
						{ ...theme.r3MainTree.chip }
						sx={ this.sxClasses.chip }
					/>

					<Typography
						{ ...theme.r3MainTree.tenantListText }
						sx={ this.sxClasses.tenantListText }
					>
						{ titleName }
					</Typography>

					{ tenantEditBtn }

					<Tooltip
						title={ r3provider.getR3TextRes().tResSelectTenantTT }
						open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsBoolean(this.state.tooltips.tenantMenuTooltip)) ? false : this.state.tooltips.tenantMenuTooltip) }
					>
						<IconButton
							disabled={ r3IsEmptyString(this.props.userName) }
							aria-owns={ this.state.tenantMenuAnchorEl ? componentKeyIds.tenantMenuId : undefined }
							onClick={ this.handleTenantMenuButton }
							onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.tenantMenu, true) }
							onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.tenantMenu, false) }
							{ ...theme.r3MainTree.tenantListButton }
							size="large"
						>
							<MoreVertIcon />
						</IconButton>
					</Tooltip>
					<Menu
						id={ componentKeyIds.tenantMenuId }
						anchorEl={ this.state.tenantMenuAnchorEl }
						open={ Boolean(this.state.tenantMenuAnchorEl) }
						onClose={ this.handleTenantMenuClose }
						{ ...theme.r3MainTree.tenantListMenu }
					>
						{ menuItem }
						{ menuLocalTenantDivider }
						{ menuLocalTenantItem }
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
			<Box>
				{ dummyBarSubHeader }
				{ this.getTenantSubHeaders() }
			</Box>
		);
	}

	//
	// For children under TOP > ROLE/POLICY/RESOURCE
	//
	getChildrenListItems(treeList: TreeListItem[], type: string)
	{
		const { theme } = this.props;

		if(!r3IsArray(treeList)){
			return;
		}
		let	_type = type;

		return (
			treeList.map( (item: TreeListItem, _pos: number) => {
				let	listItemKey		= _type + '_' + item.path;
				let	isSelected		= (undefined != item.selected ? true : false);

				let	isCollapseExpand = false;
				if(!r3IsEmptyEntityObject(this.state.collapseExpands, listItemKey) && r3IsBoolean(this.state.collapseExpands[listItemKey])){
					isCollapseExpand = this.state.collapseExpands[listItemKey];
				}

				let	expandIcon;
				let	collapseItem;
				if(r3IsArray(item.children) && 0 < item.children.length){
					let childrenItem = this.getChildrenListItems(item.children, _type);

					if(childrenItem){
						if(isCollapseExpand){
							expandIcon = (
								<ListItemIcon
									sx={ this.sxClasses.expandListItemIcon }
								>
									<ExpandLessIcon />
								</ListItemIcon>
							);
						}else{
							expandIcon = (
								<ListItemIcon
									sx={ this.sxClasses.expandListItemIcon }
								>
									<ExpandMoreIcon />
								</ListItemIcon>
							);
						}
						collapseItem = (
							<Collapse
								in={ isCollapseExpand }
								{ ...theme.r3MainTree.collapse }
								sx={ this.sxClasses.collapse }
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
					<Box
						key={ listItemKey }
					>
						<ListItem
							onClick={ (event: React.MouseEvent<HTMLElement>) => this.handleListItemChange(event, _type, item.path, isSelected, listItemKey) }
							{ ...theme.r3MainTree.listItemButton }
						>
							<ListItemText
								primary={ item.name }
								{ ...accordingItemText }
								sx={ this.sxClasses.childListItemText }
							/>
							{ expandIcon }
						</ListItem>
						{ collapseItem }
					</Box>
				);
			})
		);
	}

	//
	// For Service Name(TOP) under TOP > SERVICE
	//
	getServicesListItems(treeList: TreeListItem[])
	{
		const { theme } = this.props;

		if(!r3IsArray(treeList)){
			return;
		}

		return (
			treeList.map( (item: TreeListItem, _pos: number) => {
				let	listItemKey		= 'service_' + item.path;
				let	isSelected		= (undefined != item.selected ? true : false);

				let	isCollapseExpand = false;
				if(!r3IsEmptyEntityObject(this.state.collapseExpands, listItemKey) && r3IsBoolean(this.state.collapseExpands[listItemKey])){
					isCollapseExpand = this.state.collapseExpands[listItemKey];
				}

				let	ownerIcon;
				if(r3IsBoolean(item.owner) && true === item.owner){
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
				if(r3IsArray(item.children) && 0 < item.children.length){
					let childrenItem = this.getServiceMainListItems(item.children, item.path);
					if(childrenItem){
						if(isCollapseExpand){
							expandIcon = (
								<ListItemIcon
									sx={ this.sxClasses.expandListItemIcon }
								>
									<ExpandLessIcon />
								</ListItemIcon>
							);
						}else{
							expandIcon = (
								<ListItemIcon
									sx={ this.sxClasses.expandListItemIcon }
								>
									<ExpandMoreIcon />
								</ListItemIcon>
							);
						}
						collapseItem = (
							<Collapse
								in={ isCollapseExpand }
								{ ...theme.r3MainTree.collapse }
								sx={ this.sxClasses.serviceLabelCollapse }
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
					<Box
						key={ listItemKey }
					>
						<ListItem
							onClick={ (event: React.MouseEvent<HTMLElement>) => this.handleNameItemInServiceChange(event, item.path, isSelected, listItemKey) }
							{ ...theme.r3MainTree.listItemButton }
						>
							<ListItemText
								primary={ item.name }
								{ ...accordingItemText }
								sx={ this.sxClasses.childListItemText }
							/>
							{ ownerIcon }
							{ expandIcon }
						</ListItem>
						{ collapseItem }
					</Box>
				);
			})
		);
	}

	//
	// For Type(ROLE/POLICY/RESOURCE) under TOP > SERVICE > Service Name(TOP)
	//
	//	service_name		: "service name"
	//
	getServiceMainListItems(treeList: TreeListItem[], service_name: string)
	{
		const { theme } = this.props;

		if(!r3IsArray(treeList)){
			return;
		}
		let	_service_name = service_name;

		return (
			treeList.map( (item: TreeListItem, _pos: number) => {

				let	listItemKey		= 'service_' + _service_name + '_' + item.path;
				let	isSelected		= (undefined != item.selected ? true : false);

				let	isCollapseExpand = false;
				if(!r3IsEmptyEntityObject(this.state.collapseExpands, listItemKey) && r3IsBoolean(this.state.collapseExpands[listItemKey])){
					isCollapseExpand = this.state.collapseExpands[listItemKey];
				}

				let	expandIcon;
				let	collapseItem;
				if(r3IsArray(item.children) && 0 < item.children.length){
					let childrenItem = this.getServiceChildrenListItems(item.children, _service_name, item.path);
					if(childrenItem){
						if(isCollapseExpand){
							expandIcon = (
								<ListItemIcon
									sx={ this.sxClasses.expandListItemIcon }
								>
									<ExpandLessIcon />
								</ListItemIcon>
							);
						}else{
							expandIcon = (
								<ListItemIcon
									sx={ this.sxClasses.expandListItemIcon }
								>
									<ExpandMoreIcon />
								</ListItemIcon>
							);
						}
						collapseItem = (
							<Collapse
								in={ isCollapseExpand }
								{ ...theme.r3MainTree.collapse }
								sx={ this.sxClasses.collapse }
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
					<Box
						key={ listItemKey }
					>
						<ListItem
							onClick={ (event: React.MouseEvent<HTMLElement>) => this.handleTypeInServiceChange(event, _service_name, item.path, isSelected, listItemKey) }
							{ ...theme.r3MainTree.listItemButton }
						>
							<ListItemIcon
								sx={ this.sxClasses.labelListItemIcon }
							>
								<LabelIcon />
							</ListItemIcon>
							<ListItemText
								primary={ item.name }
								{ ...accordingItemText }
								sx={ this.sxClasses.inServiceLabelListItemText }
							/>
							{ expandIcon }
						</ListItem>
						{ collapseItem }
					</Box>
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
	getServiceChildrenListItems(treeList: TreeListItem[], service_name: string, type_in_service: string)
	{
		const { theme } = this.props;

		if(!r3IsArray(treeList)){
			return;
		}
		let	_service_name		= service_name;
		let	_type_in_service	= type_in_service;

		return (
			treeList.map( (item: TreeListItem, _pos: number) => {
				let	listItemKey		= 'service_' + _service_name + '_' + _type_in_service + '_' + item.path;
				let	isSelected		= (undefined != item.selected ? true : false);

				let	isCollapseExpand = false;
				if(!r3IsEmptyEntityObject(this.state.collapseExpands, listItemKey) && r3IsBoolean(this.state.collapseExpands[listItemKey])){
					isCollapseExpand = this.state.collapseExpands[listItemKey];
				}

				let	expandIcon;
				let	collapseItem;
				if(r3IsArray(item.children) && 0 < item.children.length){
					let childrenItem = this.getServiceChildrenListItems(item.children, _service_name, _type_in_service);
					if(childrenItem){
						if(isCollapseExpand){
							expandIcon = (
								<ListItemIcon
									sx={ this.sxClasses.expandListItemIcon }
								>
									<ExpandLessIcon />
								</ListItemIcon>
							);
						}else{
							expandIcon = (
								<ListItemIcon
									sx={ this.sxClasses.expandListItemIcon }
								>
									<ExpandMoreIcon />
								</ListItemIcon>
							);
						}
						collapseItem = (
							<Collapse
								in={ isCollapseExpand }
								{ ...theme.r3MainTree.collapse }
								sx={ this.sxClasses.collapse }
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
					<Box
						key={ listItemKey }
					>
						<ListItem
							onClick={ (event: React.MouseEvent<HTMLElement>) => this.handleListItemInServiceChange(event, _service_name, _type_in_service, item.path, isSelected, listItemKey) }
							{ ...theme.r3MainTree.listItemButton }
						>
							<ListItemText
								primary={ item.name }
								{ ...accordingItemText }
								sx={ this.sxClasses.inServiceChildListItemText }
							/>
							{ expandIcon }
						</ListItem>
						{ collapseItem }
					</Box>
				);

			})
		);
	}

	//
	// For TOP
	//
	getMainListItems(treeList: TreeListItem[])
	{
		const { theme } = this.props;

		console.info('CALL : getMainListItems');

		if(!r3IsArray(treeList)){
			return;
		}

		return (
			treeList.map( (item: TreeListItem, _pos: number) =>
			{
				let	listItemKey		= 'top_' + item.path;
				let	isSelected		= (undefined != item.selected ? true : false);

				let	isCollapseExpand = false;
				if(!r3IsEmptyEntityObject(this.state.collapseExpands, listItemKey) && r3IsBoolean(this.state.collapseExpands[listItemKey])){
					isCollapseExpand = this.state.collapseExpands[listItemKey];
				}

				let	expandIcon;
				let	collapseItem;
				if(r3IsArray(item.children) && 0 < item.children.length){
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
									sx={ this.sxClasses.expandListItemIcon }
								>
									<ExpandLessIcon />
								</ListItemIcon>
							);
						}else{
							expandIcon = (
								<ListItemIcon
									sx={ this.sxClasses.expandListItemIcon }
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
					<Box
						key={ listItemKey }
					>
						<ListItem
							onClick={ (event: React.MouseEvent<HTMLElement>) => this.handleTypeItemChange(event, item.path, isSelected, listItemKey) }
							{ ...theme.r3MainTree.listItemButton }
						>
							<ListItemIcon
								sx={ this.sxClasses.labelListItemIcon }
							>
								<LabelIcon />
							</ListItemIcon>
							<ListItemText
								primary={ item.name }
								{ ...accordingItemText }
								sx={ this.sxClasses.listItemText }
							/>
							{ expandIcon }
						</ListItem>
						{ collapseItem }
					</Box>
				);
			})
		);
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

	getMainTreeLists()
	{
		const { theme } = this.props;

		return (
			<React.Fragment>
				<Box
					sx={ (this.props.isDocking ? this.sxClasses.dockedList : {}) }
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
				</Box>
				<R3LocalTenantDialog
					theme={ theme }
					r3provider={ this.props.r3provider }
					open={ this.state.localTenantDialogOpen }
					userName={ this.props.userName }
					createMode={ this.state.localTenantCreateMode }
					allTenantNames={ this.getAllTenantNames() }
					tenantName={		(this.state.localTenantCreateMode || r3IsEmptyEntity(this.props.selectedTenant) || r3IsEmptyEntityObject(this.props.selectedTenant, 'name'))		? '' : this.props.selectedTenant.name }
					tenantId={			(this.state.localTenantCreateMode || r3IsEmptyEntity(this.props.selectedTenant) || r3IsEmptyEntityObject(this.props.selectedTenant, 'id'))			? '' : this.props.selectedTenant.id }
					tenantDisplay={		(this.state.localTenantCreateMode || r3IsEmptyEntity(this.props.selectedTenant) || r3IsEmptyEntityObject(this.props.selectedTenant, 'display'))		? '' : this.props.selectedTenant.display }
					tenantDescription={	(this.state.localTenantCreateMode || r3IsEmptyEntity(this.props.selectedTenant) || r3IsEmptyEntityObject(this.props.selectedTenant, 'description'))	? '' : this.props.selectedTenant.description }
					tenantUsers={		(this.state.localTenantCreateMode || r3IsEmptyEntity(this.props.selectedTenant) || r3IsEmptyEntityObject(this.props.selectedTenant, 'users') || !r3IsArray(this.props.selectedTenant.users)) ? [ this.props.userName ] : r3DeepClone(this.props.selectedTenant.users).sort() }
					onClose={ this.handLocalTenantDialogClose }
				/>
			</React.Fragment>
		);
	}

	render()
	{
		const { theme } = this.props;

		if(this.props.isDocking){
			return this.getMainTreeLists();
		}else{
			// [NOTE]
			// Since witdh=500 maybe used in the calculation as the initial value,
			// it must be specified.(width=256 in default Theme does not work for me)
			// And containerStyle must be specified.
			//
			return (
				<React.Fragment>
					<Drawer
						open={ this.props.open }
						onClose={ (event) => this.handleTreePopupClose(event) }
						sx={ this.sxClasses.drawer }
					>
						<Box
							sx={ this.sxClasses.adjustment }
						>
							{ this.getMainTreeLists() }
						</Box>
					</Drawer>
					<R3LocalTenantDialog
						theme={ theme }
						r3provider={ this.props.r3provider }
						open={ this.state.localTenantDialogOpen }
						userName={ this.props.userName }
						createMode={ this.state.localTenantCreateMode }
						allTenantNames={ this.getAllTenantNames() }
						tenantName={		(this.state.localTenantCreateMode || r3IsEmptyEntity(this.props.selectedTenant) || r3IsEmptyEntityObject(this.props.selectedTenant, 'name'))		? '' : this.props.selectedTenant.name }
						tenantId={			(this.state.localTenantCreateMode || r3IsEmptyEntity(this.props.selectedTenant) || r3IsEmptyEntityObject(this.props.selectedTenant, 'id'))			? '' : this.props.selectedTenant.id }
						tenantDisplay={		(this.state.localTenantCreateMode || r3IsEmptyEntity(this.props.selectedTenant) || r3IsEmptyEntityObject(this.props.selectedTenant, 'display'))		? '' : this.props.selectedTenant.display }
						tenantDescription={	(this.state.localTenantCreateMode || r3IsEmptyEntity(this.props.selectedTenant) || r3IsEmptyEntityObject(this.props.selectedTenant, 'description'))	? '' : this.props.selectedTenant.description }
						tenantUsers={		(this.state.localTenantCreateMode || r3IsEmptyEntity(this.props.selectedTenant) || r3IsEmptyEntityObject(this.props.selectedTenant, 'users') || !r3IsArray(this.props.selectedTenant.users)) ? [ this.props.userName ] : r3DeepClone(this.props.selectedTenant.users).sort() }
						onClose={ this.handLocalTenantDialogClose }
					/>
				</React.Fragment>
			);
		}
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
