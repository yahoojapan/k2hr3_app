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

import { withTheme, withStyles }	from '@material-ui/core/styles';		// decorator
import IconButton					from '@material-ui/core/IconButton';
import Avatar						from '@material-ui/core/Avatar';
import Chip							from '@material-ui/core/Chip';
import AppBar						from '@material-ui/core/AppBar';
import Toolbar						from '@material-ui/core/Toolbar';
import Typography					from '@material-ui/core/Typography';
import Tooltip						from '@material-ui/core/Tooltip';

import DescriptionIcon				from '@material-ui/icons/Description';
import ArrowUpwardIcon				from '@material-ui/icons/ArrowUpwardRounded';
import AddIcon						from '@material-ui/icons/AddRounded';
import DeleteIcon					from '@material-ui/icons/ClearRounded';

import { r3Toolbar }				from './r3styles';
import R3PathInfoDialog				from './r3pathinfodialog';
import R3CreatePathDialog			from './r3createpathdialog';
import R3CreateServiceDialog		from './r3createservicedialog';
import R3CreateServiceTenantDialog	from './r3createservicetenantdialog';
import R3PopupMsgDialog				from './r3popupmsgdialog';
import R3Message					from '../util/r3message';

import { errorType, infoType, resourceType, roleType, policyType, serviceType } from '../util/r3types';
import { r3CompareCaseString, r3IsEmptyStringObject, r3IsEmptyEntityObject, r3IsEmptyString, r3IsSafeTypedEntity } from '../util/r3util';

//
// Local variables
//
const tooltipValues = {
	pathInfoChip:	'pathInfoChipButton',
	toUpperPath:	'toUpperPathButton',
	createPath:		'createPathButton',
	deletePath:		'deletePathButton'
};

//
// Toolbar Class
//
@withTheme()
@withStyles(r3Toolbar)
export default class R3Toolbar extends React.Component
{
	static contextTypes = {
		r3Context:				PropTypes.object.isRequired
	};

	static propTypes = {
		r3provider:				PropTypes.object.isRequired,
		enDock:					PropTypes.bool,
		toolbarData:			PropTypes.object.isRequired,

		onArrawUpward:			PropTypes.func.isRequired,
		onCreatePath:			PropTypes.func.isRequired,
		onCheckPath:			PropTypes.func.isRequired,
		onDeletePath:			PropTypes.func.isRequired,
		onCreateServiceTenant:	PropTypes.func.isRequired,
		onCreateService:		PropTypes.func.isRequired,
		onCheckServiceName:		PropTypes.func.isRequired,
		onDeleteService:		PropTypes.func.isRequired,
		onCheckUpdating:		PropTypes.func
	};

	static defaultProps = {
		enDock:					true,
		onCheckUpdating:		null
	};

	state = {
		pathInfoDialogOpen:				false,
		createPathDialogOpen:			false,
		createServiceDialogOpen:		false,
		createServiceTenantDialogOpen:	false,
		newServiceName:					'',
		newVerify:						'',
		aliasRole:						'',
		r3DeleteServiceMessage:			null,
		newPath:						'',
		r3Message:						null,

		tooltips: {
			toUpperPathTooltip:			false,
			pathInfoChipTooltip:		false,
			createPathTooltip:			false,
			deletePathTooltip:			false
		}
	};

	constructor(props)
	{
		super(props);

		// Binding(do not define handlers as arrow functions for performance)
		this.handlePathInfoDialogOpen				= this.handlePathInfoDialogOpen.bind(this);
		this.handlePathInfoDialogClose				= this.handlePathInfoDialogClose.bind(this);
		this.handleCreatePathDialogOpen				= this.handleCreatePathDialogOpen.bind(this);
		this.handleCreatePathDialogClose			= this.handleCreatePathDialogClose.bind(this);
		this.handleDeletePath						= this.handleDeletePath.bind(this);
		this.handleCreateServiceDialogOpen			= this.handleCreateServiceDialogOpen.bind(this);
		this.handleCreateServiceDialogClose			= this.handleCreateServiceDialogClose.bind(this);
		this.handleCreateServiceTenant				= this.handleCreateServiceTenant.bind(this);
		this.handleCreateServiceTenantDialogClose	= this.handleCreateServiceTenantDialogClose.bind(this);
		this.handleDeleteService					= this.handleDeleteService.bind(this);
		this.handleDeleteServiceDialogClose			= this.handleDeleteServiceDialogClose.bind(this);
		this.handleToUpperPathButton				= this.handleToUpperPathButton.bind(this);
		this.handleMessageDialogClose				= this.handleMessageDialogClose.bind(this);
	}

	handlePathInfoDialogOpen(event)											// eslint-disable-line no-unused-vars
	{
		this.setState({
			pathInfoDialogOpen:			true,
			tooltips: {
				pathInfoChipTooltip:	false
			}
		});
	}

	handlePathInfoDialogClose(event)										// eslint-disable-line no-unused-vars
	{
		this.setState({ pathInfoDialogOpen:	false });
	}

	handleCreatePathDialogOpen(event)										// eslint-disable-line no-unused-vars
	{
		if(!this.checkContentUpdating()){
			return;
		}
		this.setState({
			newPath:				'',
			createPathDialogOpen:	true,
			tooltips: {
				createPathTooltip:	false
			}
		});
	}

	handleCreatePathDialogClose(event, isAgree, newPath)					// eslint-disable-line no-unused-vars
	{
		if(!isAgree){
			this.setState({
				newPath:				'',
				createPathDialogOpen:	false
			});
			return;
		}
		if(r3IsEmptyString(newPath)){
			this.setState({
				newPath:	'',
				r3Message:	new R3Message(this.props.r3provider.getR3TextRes().eNewPath, errorType)
			});
			return;
		}

		// check '/' parser
		if(-1 !== newPath.indexOf('/')){
			this.setState({
				newPath:	newPath,
				r3Message:	new R3Message(this.props.r3provider.getR3TextRes().eNewPathHasParser, errorType)
			});
			return;
		}

		// check path conflict
		let	newAllPath = (r3IsEmptyString(this.props.toolbarData.currentpath) ? '' : (this.props.toolbarData.currentpath + '/')) + newPath.trim();
		if(this.props.onCheckPath(newAllPath)){
			this.setState({
				newPath:	newPath,
				r3Message:	new R3Message(this.props.r3provider.getR3TextRes().eNewPathConflict, errorType)
			});
			return;
		}

		// create path
		this.props.onCreatePath(newPath, newAllPath);

		// close dialog
		this.setState({
			newPath:				'',
			createPathDialogOpen:	false
		});
	}

	handleCreateServiceDialogOpen(event)									// eslint-disable-line no-unused-vars
	{
		if(!this.checkContentUpdating()){
			return;
		}

		// create service confirm dialog
		this.setState({
			newServiceName:				'',
			newVerify:					'',
			createServiceDialogOpen:	true,
			tooltips: {
				createPathTooltip:		false
			}
		});
	}

	handleCreateServiceDialogClose(event, isAgree, newServiceName, newVerify)	// eslint-disable-line no-unused-vars
	{
		if(!isAgree){
			this.setState({
				newServiceName:			'',
				newVerify:				'',
				createServiceDialogOpen:false
			});
			return;
		}
		if(r3IsEmptyString(newServiceName)){
			this.setState({
				newServiceName:			newServiceName,
				newVerify:				newVerify,
				r3Message:				new R3Message(this.props.r3provider.getR3TextRes().eNewServiceName, errorType)
			});
			return;
		}
		// check service name conflict
		if(this.props.onCheckServiceName(newServiceName)){
			this.setState({
				newServiceName:			newServiceName,
				newVerify:				newVerify,
				r3Message:				new R3Message(this.props.r3provider.getR3TextRes().eNewServiceNameConflict, errorType)
			});
			return;
		}

		// check verify
		let	errorVerify = this.props.r3provider.isErrorServiceVerifyString(newVerify);
		if(null !== errorVerify){
			this.setState({
				newServiceName:			newServiceName,
				newVerify:				newVerify,
				r3Message:				new R3Message(errorVerify, errorType)
			});
			return;
		}

		// create service name
		this.props.onCreateService(newServiceName, newVerify);

		// close dialog
		this.setState({
			newServiceName:				'',
			newVerify:					'',
			createServiceDialogOpen:	false
		});
	}

	//
	// Utility : Check verify for static resource object
	//
	// allowed static resource data is following:
	//	verify	= [					:	An array with at least one element object
	//		{
	//			name				:	resource name which is key name(path) for resource
	//			expire				:	undefined/null or integer
	//			type				:	resource data type(string or object), if date is null or '', this value must be string.
	//			data				:	resource data which must be string or object or null/undefined.
	//			keys = {			:	resource has keys(associative array), or null/undefined.
	//				'foo':	bar,	:	any value is allowed
	//				...				:
	//			}					:
	//		},
	//		...
	//	]
	checkVerifyStaticObject(verify)
	{
		if(undefined === verify || null === verify || !(verify instanceof Array) || 0 === verify.length){
			return false;
		}

		for(let cnt = 0; cnt < verify.length; ++cnt){
			if(r3IsEmptyString(verify[cnt].name)){
				// name key must be existed.
				return false;
			}
			if(!r3CompareCaseString('string', verify[cnt].type) && !r3CompareCaseString('object', verify[cnt].type)){
				// type must be string or object
				return false;
			}
		}
		return true;
	}

	handleCreateServiceTenant(event)										// eslint-disable-line no-unused-vars
	{
		if(!this.checkContentUpdating()){
			return;
		}

		// create service tenant confirm dialog
		this.setState({
			aliasRole:						'',
			createServiceTenantDialogOpen:	true
		});

	}

	handleCreateServiceTenantDialogClose(event, isAgree, aliasRole)			// eslint-disable-line no-unused-vars
	{
		if(!isAgree){
			this.setState({
				aliasRole:						'',
				createServiceTenantDialogOpen:	false,
				tooltips: {
					createPathTooltip:			false
				}
			});
			return;
		}

		// create service tenant
		this.props.onCreateServiceTenant(aliasRole);

		// close dialog
		this.setState({
			aliasRole:						'',
			createServiceTenantDialogOpen:	false,
			tooltips: {
				createPathTooltip:			false
			}
		});
	}

	handleToUpperPathButton(event)											// eslint-disable-line no-unused-vars
	{
		if(!this.checkContentUpdating()){
			return;
		}

		// undisplay tooltip
		this.setState({
			tooltips: {
				toUpperPathTooltip:			false
			}
		});

		this.props.onArrawUpward();
	}

	handTooltipChange = (event, type, isOpen) =>							// eslint-disable-line no-unused-vars
	{
		if(tooltipValues.pathInfoChip === type){
			this.setState({
				tooltips: {
					pathInfoChipTooltip:	isOpen
				}
			});
		}else if(tooltipValues.toUpperPath === type){
			this.setState({
				tooltips: {
					toUpperPathTooltip:		isOpen
				}
			});
		}else if(tooltipValues.createPath === type){
			this.setState({
				tooltips: {
					createPathTooltip:		isOpen
				}
			});
		}else if(tooltipValues.deletePath === type){
			this.setState({
				tooltips: {
					deletePathTooltip:		isOpen
				}
			});
		}
	}

	handleDeletePath(event)													// eslint-disable-line no-unused-vars
	{
		if(!this.checkContentUpdating()){
			return;
		}

		// undisplay tooltip
		this.setState({
			tooltips: {
				deletePathTooltip:	false
			}
		});

		this.props.onDeletePath();
	}

	handleDeleteService(event)												// eslint-disable-line no-unused-vars
	{
		if(!this.checkContentUpdating()){
			return;
		}

		let	message;
		if(this.props.toolbarData.serviceOwner && !this.props.toolbarData.hasServiceTenant){
			// Delete SERVICE
			message = new R3Message(this.props.r3provider.getR3TextRes().cDeletingService, infoType);
		}else{
			// Delete SERVICE TENANT
			message = new R3Message(this.props.r3provider.getR3TextRes().cDeletingServiceTenant, infoType);
		}

		// confirm message
		this.setState({
			r3DeleteServiceMessage:	message,
			tooltips: {
				deletePathTooltip:	false
			}
		});
	}

	//
	// Handle Confirm Dialog for Delete Service(Tenant): Close( OK / Cancel )
	//
	handleDeleteServiceDialogClose(event, result)							// eslint-disable-line no-unused-vars
	{
		if(result){
			// case for 'deleting' to do

			//
			// [NOTE]
			//
			// The service is owner(serviceOwner = false), thus this handler try to remove ServiceTenant.
			// If service is owner(serviceOwner = true) and has children(hasServiceTenant = true), this handler try to remove ServiceTenant.
			// If service is owner(serviceOwner = true) and does not have children(hasServiceTenant = false), this handler try to remove Service.
			//
			this.props.onDeleteService(this.props.toolbarData.serviceOwner, this.props.toolbarData.hasServiceTenant);
		}

		// clear dialog
		this.setState({
			r3DeleteServiceMessage:	null
		});
	}

	handleMessageDialogClose()
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

	getArrawUpwardButton()
	{
		const { theme, r3provider } = this.props;

		if(r3IsEmptyString(this.props.toolbarData.service) && r3IsEmptyString(this.props.toolbarData.currentpath)){
			return;
		}

		return (
			<Tooltip
				title={ r3provider.getR3TextRes().tResToUpperPathTT }
				open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.toUpperPathTooltip, 'boolean')) ? false : this.state.tooltips.toUpperPathTooltip) }
			>
				<IconButton
					onClick={ this.handleToUpperPathButton }
					onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.toUpperPath, true) }
					onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.toUpperPath, false) }
					{ ...theme.r3AppBar.toUpperPathButton }
				>
					<ArrowUpwardIcon />
				</IconButton>
			</Tooltip>
		);
	}

	getCreatePathButton()
	{
		const { theme, r3provider } = this.props;

		let	tooltipText;
		let	handler;
		if(this.props.toolbarData.canCreatePath){
			// Create Path under ROLE/POLICY/RESOURCE
			tooltipText	= r3provider.getR3TextRes().tResCreateChildPathTT;
			handler		= this.handleCreatePathDialogOpen;
		}else if(this.props.toolbarData.canCreateService){
			// Create SERVICE
			tooltipText	= r3provider.getR3TextRes().tResCreateOwnerServiceTT;
			handler		= this.handleCreateServiceDialogOpen;
		}else if(r3CompareCaseString(serviceType, this.props.toolbarData.type) && !r3IsEmptyString(this.props.toolbarData.service) && !this.props.toolbarData.hasServiceTenant){
			// Create SERVICE/TENANT for service name under SERVICE
			tooltipText	= r3provider.getR3TextRes().tResCreateServiceTT;
			handler		= this.handleCreateServiceTenant;
		}else{
			return;
		}

		return (
			<Tooltip
				title={ tooltipText }
				open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.createPathTooltip, 'boolean')) ? false : this.state.tooltips.createPathTooltip) }
			>
				<IconButton
					onClick={ handler }
					onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.createPath, true) }
					onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.createPath, false) }
					{ ...theme.r3AppBar.createPathButton }
				>
					<AddIcon />
				</IconButton>
			</Tooltip>
		);
	}

	getDeletePathButton()
	{
		const { theme, r3provider } = this.props;

		let	isDeleteService	= false;
		let	isServiceTenant	= false;
		if(r3CompareCaseString(serviceType, this.props.toolbarData.type) || !r3IsEmptyString(this.props.toolbarData.service)){
			// under SERVICE type
			if(!r3CompareCaseString(serviceType, this.props.toolbarData.type)){
				// under SERVICE > service name > ROLE/POLICY/RESOURCE
				return;
			}else{
				if(r3IsEmptyString(this.props.toolbarData.service)){
					// under SERVICE top
					return;
				}else{
					// under SERVICE > service name
					isDeleteService = true;

					if(this.props.toolbarData.serviceOwner){
						if(this.props.toolbarData.hasServiceTenant){
							// Delete SERVICE TENANT(service is owner, but service tenant exists)
							isServiceTenant = true;
						}else{
							// Delete SERVICE
							isServiceTenant = false;
						}
					}else{
						if(this.props.toolbarData.hasServiceTenant){
							// Delete SERVICE TENANT
							isServiceTenant = true;
						}else{
							// not owner & not service tenant
							return;
						}
					}
				}
			}
		}else{
			// under ROLE/POLICY/RESOURCE type
			if(r3IsEmptyString(this.props.toolbarData.name)){
				// under ROLE/POLICY/RESOURCE
				return;
			}else{
				// under ROLE/POLICY/RESOURCE > path
				isDeleteService = false;
			}
		}

		let	tooltipText;
		let	handler;
		if(!isDeleteService){
			tooltipText		= r3provider.getR3TextRes().tResDeletePathTT;
			handler			= this.handleDeletePath;
		}else{
			if(isServiceTenant){
				tooltipText	= r3provider.getR3TextRes().tResDeleteOwnerServiceTT;
			}else{
				tooltipText	= r3provider.getR3TextRes().tResDeleteServiceTT;
			}
			handler			= this.handleDeleteService;
		}

		return (
			<Tooltip
				title={ tooltipText }
				open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.deletePathTooltip, 'boolean')) ? false : this.state.tooltips.deletePathTooltip) }
			>
				<IconButton
					onClick={ handler }
					onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.deletePath, true) }
					onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.deletePath, false) }
					{ ...theme.r3AppBar.deletePathButton }
				>
					<DeleteIcon />
				</IconButton>
			</Tooltip>
		);
	}

	getChipInToolbar()
	{
		const { theme, classes, r3provider } = this.props;

		let	strLabel = r3provider.getR3TextRes().tResUnselected;

		if(r3CompareCaseString(serviceType, this.props.toolbarData.type)){
			strLabel = this.props.toolbarData.type.toUpperCase();
		}else if(r3CompareCaseString(resourceType, this.props.toolbarData.type) || r3CompareCaseString(roleType, this.props.toolbarData.type) || r3CompareCaseString(policyType, this.props.toolbarData.type)){
			if(r3IsEmptyString(this.props.toolbarData.service)){
				strLabel = this.props.toolbarData.type.toUpperCase();
			}else{
				strLabel = serviceType + '/' + this.props.toolbarData.type;
				strLabel = strLabel.toUpperCase();
			}
		}else if(!r3IsEmptyStringObject(this.props.toolbarData.tenant, 'name') ){
			strLabel = r3provider.getR3TextRes().tResTenantPathLabel;
		}

		let	avatar = (
			<Avatar
				className={ classes.avatar }
			>
				<DescriptionIcon
					className={ classes.descriptionIcon }
				/>
			</Avatar>
		);

		let	label = (
			<Typography
				{ ...theme.r3Toolbar.chipText }
				className={ classes.chipText }
			>
				{ strLabel }
			</Typography>
		);

		return (
			<Tooltip
				title={ r3provider.getR3TextRes().tResPathChipTT }
				open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.pathInfoChipTooltip, 'boolean')) ? false : this.state.tooltips.pathInfoChipTooltip) }
			>
				<Chip
					avatar={ avatar }
					label={ label }
					onClick={ this.handlePathInfoDialogOpen }
					onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.pathInfoChip, true) }
					onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.pathInfoChip, false) }
					{ ...theme.r3Toolbar.chip }
					className={ classes.chip }
				/>
			</Tooltip>
		);
	}

	render()
	{
		const { theme, classes, r3provider } = this.props;

		let	themeToolbar	= this.props.enDock ? theme.r3Toolbar.toolbar : theme.r3Toolbar.smallToolbar;
		let	name			= '';
		let	ownerTag;
		if(r3IsEmptyString(this.props.toolbarData.name)){
			if(r3CompareCaseString(serviceType, this.props.toolbarData.type) && !r3IsEmptyString(this.props.toolbarData.service)){
				name		= this.props.toolbarData.service;
				if(this.props.toolbarData.serviceOwner){
					ownerTag = (
						<Typography
							{ ...theme.r3Toolbar.ownerText }
							className={ classes.ownerText }
						>
							{ r3provider.getR3TextRes().tResOwnerServiceTag }
						</Typography>
					);
				}
			}
		}else{
			name			= this.props.toolbarData.hasParent ? ('.../' + this.props.toolbarData.name) : this.props.toolbarData.name;
		}

		return (
			<div>
				<AppBar
					{ ...theme.r3Toolbar.root }
					className={ classes.root }
				>
					<Toolbar
						{ ...themeToolbar }
						className={ classes.toolbar }
					>
						{ this.getChipInToolbar() }

						{ ownerTag }
						<Typography
							{ ...theme.r3Toolbar.title }
							className={ classes.title }
						>
							{ name }
						</Typography>

						{ this.getArrawUpwardButton() }

						<div
							className={ classes.spacerInToolbar }
						/>

						{ this.getCreatePathButton() }
						{ this.getDeletePathButton() }
					</Toolbar>
				</AppBar>
				<R3PathInfoDialog
					r3provider={ this.props.r3provider }
					open={ this.state.pathInfoDialogOpen }
					tenant={ this.props.toolbarData.tenant }
					service={ this.props.toolbarData.service }
					type={ this.props.toolbarData.type }
					fullpath={ this.props.toolbarData.fullpath }
					currentpath={ this.props.toolbarData.currentpath }
					onClose={ this.handlePathInfoDialogClose }
				/>
				<R3CreatePathDialog
					r3provider={ this.props.r3provider }
					open={ this.state.createPathDialogOpen }
					tenant={ this.props.toolbarData.tenant }
					type={ this.props.toolbarData.type }
					parentPath={ (null === this.props.toolbarData.currentpath ? '/' : ('/' + this.props.toolbarData.currentpath)) }
					newPath={ this.state.newPath }
					onClose={ this.handleCreatePathDialogClose }
				/>
				<R3CreateServiceDialog
					r3provider={ this.props.r3provider }
					open={ this.state.createServiceDialogOpen }
					tenant={ this.props.toolbarData.tenant }
					newServiceName={ this.state.newServiceName }
					newVerify={ this.state.newVerify }
					onClose={ this.handleCreateServiceDialogClose }
				/>
				<R3CreateServiceTenantDialog
					r3provider={ this.props.r3provider }
					open={ this.state.createServiceTenantDialogOpen }
					tenant={ this.props.toolbarData.tenant }
					service={ this.props.toolbarData.service }
					aliasRole={ this.state.aliasRole }
					onClose={ this.handleCreateServiceTenantDialogClose }
				/>
				<R3PopupMsgDialog
					r3provider={ this.props.r3provider }
					title={ this.props.r3provider.getR3TextRes().cUpdatingTitle }
					r3Message={ this.state.r3DeleteServiceMessage }
					twoButton={ true }
					onClose={ this.handleDeleteServiceDialogClose }
				/>
				<R3PopupMsgDialog
					r3provider={ this.props.r3provider }
					r3Message={ this.state.r3Message }
					onClose={ this.handleMessageDialogClose }
				/>
			</div>
		);
	}
}

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
