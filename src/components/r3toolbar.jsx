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

import FontIcon						from 'material-ui/FontIcon';
import IconButton					from 'material-ui/IconButton';
import Avatar						from 'material-ui/Avatar';
import Chip							from 'material-ui/Chip';
import {Toolbar, ToolbarGroup, ToolbarTitle} from 'material-ui/Toolbar';

import R3PathInfoDialog				from './r3pathinfodialog';
import R3CreatePathDialog			from './r3createpathdialog';
import R3CreateServiceDialog		from './r3createservicedialog';
import R3CreateServiceTenantDialog	from './r3createservicetenantdialog';
import R3PopupMsgDialog				from './r3popupmsgdialog';
import R3Message					from '../util/r3message';
import { errorType, infoType, resourceType, roleType, policyType, serviceType } from '../util/r3types';
import { r3CompareCaseString, r3IsEmptyStringObject, r3IsEmptyString } from '../util/r3util';

//
// Toolbar Class
//
export default class R3Toolbar extends React.Component
{
	constructor(props)
	{
		super(props);

		this.state = {
			pathInfoDialogOpen:						false,
			createPathDialogOpen:					false,
			createServiceDialogOpen:				false,
			createServiceTenantDialogOpen:			false,
			newServiceName:							'',
			newVerify:								'',
			aliasRole:								'',
			r3DeleteServiceMessage:					null,
			newPath:								'',
			r3Message:								null
		};

		// Binding
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
		this.handleArrawUpwardButton				= this.handleArrawUpwardButton.bind(this);
		this.handleMessageDialogClose				= this.handleMessageDialogClose.bind(this);
	}

	handlePathInfoDialogOpen(event)											// eslint-disable-line no-unused-vars
	{
		this.setState({ pathInfoDialogOpen:	true });
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
			createPathDialogOpen:	true
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
			createServiceDialogOpen:	true
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
				createServiceTenantDialogOpen:	false
			});
			return;
		}

		// create service tenant
		this.props.onCreateServiceTenant(aliasRole);

		// close dialog
		this.setState({
			aliasRole:						'',
			createServiceTenantDialogOpen:	false
		});
	}

	handleArrawUpwardButton(event)											// eslint-disable-line no-unused-vars
	{
		if(!this.checkContentUpdating()){
			return;
		}
		this.props.onArrawUpward();
	}

	handleDeletePath(event)													// eslint-disable-line no-unused-vars
	{
		if(!this.checkContentUpdating()){
			return;
		}
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
			r3DeleteServiceMessage:	message
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
		if(r3IsEmptyString(this.props.toolbarData.service) && r3IsEmptyString(this.props.toolbarData.currentpath)){
			return;
		}

		return (
			<IconButton
				tooltip="Move to upper path"
				iconStyle={ this.context.muiTheme.r3Toolbar.iconButtonColor }
				onClick={ this.handleArrawUpwardButton }
				style={ this.context.muiTheme.r3Toolbar.iconButtonStyle }
			>
				<FontIcon
					className={ this.context.muiTheme.r3IconFonts.arrowUpwardIconFont }
				/>
			</IconButton>
		);
	}

	getAddPathButton()
	{
		let	toolchipText;
		let	handler;

		if(this.props.toolbarData.canCreatePath){
			// Create Path under ROLE/POLICY/RESOURCE
			toolchipText= 'Create child path';
			handler		= this.handleCreatePathDialogOpen;

		}else if(this.props.toolbarData.canCreateService){
			// Create SERVICE
			toolchipText= 'Create SERVICE(owner)';
			handler		= this.handleCreateServiceDialogOpen;

		}else if(r3CompareCaseString(serviceType, this.props.toolbarData.type) && !r3IsEmptyString(this.props.toolbarData.service) && !this.props.toolbarData.hasServiceTenant){
			// Create SERVICE/TENANT for service name under SERVICE
			toolchipText= 'Create SERVICE under TENANT';
			handler		= this.handleCreateServiceTenant;
		}else{
			return;
		}

		return (
			<IconButton
				iconStyle={ this.context.muiTheme.r3Toolbar.iconButtonColor }
				tooltip={ toolchipText }
				style={ this.context.muiTheme.r3Toolbar.iconButtonStyle }
				onClick={ handler }
			>
				<FontIcon
					className={ this.context.muiTheme.r3IconFonts.addIconFont }
				/>
			</IconButton>
		);
	}

	getDeleteButtonToolbarGroup()
	{
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

		return (
			<ToolbarGroup style={ this.context.muiTheme.r3Toolbar.toolbarGrp } >
				<IconButton
					iconStyle={ this.context.muiTheme.r3Toolbar.iconButtonColor }
					tooltip={ (!isDeleteService ? 'Delete path' : isServiceTenant ? 'Delete SERVICE/TENANT' : 'Delete SERVICE') }
					style={ this.context.muiTheme.r3Toolbar.iconButtonStyle }
					onClick={ (!isDeleteService ? this.handleDeletePath : this.handleDeleteService) }
				>
					<FontIcon
						className={ this.context.muiTheme.r3IconFonts.deleteIconFont }
					/>
				</IconButton>
			</ToolbarGroup>
		);
	}

	getChipInToolbar()
	{
		let	strLabel = 'Unselected';

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
			strLabel = 'TENANT';
		}

		return (
			<Chip
				backgroundColor={ this.context.muiTheme.palette.primary1Color }
				labelColor={ this.context.muiTheme.palette.primary3Color }
				labelStyle={ this.context.muiTheme.r3Toolbar.chipLabelStyle }
				onClick={ this.handlePathInfoDialogOpen }
				style={ this.context.muiTheme.r3Toolbar.chipStyle }
			>
				<Avatar
					backgroundColor={ this.context.muiTheme.palette.primary3Color }
					color={ this.context.muiTheme.palette.accent1Color }
				>
					<FontIcon
						className={ this.context.muiTheme.r3IconFonts.pathIconFont }
						color={ this.context.muiTheme.palette.accent1Color }
					/>
				</Avatar>
				{ strLabel }
			</Chip>
		);
	}

	render()
	{
		let	userDataScript	= r3IsEmptyStringObject(this.props.userData, 'userDataScript') ? null : this.props.userData.userDataScript;
		let	roleToken		= r3IsEmptyStringObject(this.props.userData, 'roleToken') ? null : this.props.userData.roleToken;
		let	name			= '';
		if(r3IsEmptyString(this.props.toolbarData.name)){
			if(r3CompareCaseString(serviceType, this.props.toolbarData.type) && !r3IsEmptyString(this.props.toolbarData.service)){
				if(this.props.toolbarData.serviceOwner){
					name	= 'OWNER: ' + this.props.toolbarData.service;
				}else{
					name	= this.props.toolbarData.service;
				}
			}
		}else{
			name			= this.props.toolbarData.hasParent ? ('.../' + this.props.toolbarData.name) : this.props.toolbarData.name;
		}

		return (
			<div>
				<Toolbar style={ this.context.muiTheme.r3Toolbar.toolbar } >
					<ToolbarGroup firstChild={true} style={ this.context.muiTheme.r3Toolbar.toolbarGrp } >
						{ this.getChipInToolbar() }
						<ToolbarTitle
							style={ this.context.muiTheme.r3Toolbar.toolbarTitleStyle }
							text={ name }
						/>
						{ this.getArrawUpwardButton() }
						{ this.getAddPathButton() }
					</ToolbarGroup>
					{ this.getDeleteButtonToolbarGroup() }
				</Toolbar>
				<R3PathInfoDialog
					open={ this.state.pathInfoDialogOpen }
					tenant={ this.props.toolbarData.tenant }
					service={ this.props.toolbarData.service }
					type={ this.props.toolbarData.type }
					fullpath={ this.props.toolbarData.fullpath }
					userDataScript={ userDataScript }
					roleToken={ roleToken }
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
					title={ this.props.r3provider.getR3TextRes().cUpdatingTitle }
					r3Message={ this.state.r3DeleteServiceMessage }
					twoButton={ true }
					onClose={ this.handleDeleteServiceDialogClose }
				/>
				<R3PopupMsgDialog
					r3Message={ this.state.r3Message }
					onClose={ this.handleMessageDialogClose }
				/>
			</div>
		);
	}
}

R3Toolbar.contextTypes = {
	muiTheme:				PropTypes.object.isRequired,
	r3Context:				PropTypes.object.isRequired
};

R3Toolbar.propTypes = {
	r3provider:				PropTypes.object.isRequired,
	toolbarData:			PropTypes.object.isRequired,
	userData:				PropTypes.object,

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

R3Toolbar.defaultProps = {
	userData:				null,
	onCheckUpdating:		null
};

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
