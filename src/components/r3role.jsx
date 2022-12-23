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
 * CREATE:   Tue Aug 22 2017
 * REVISION:
 *
 */

import React						from 'react';
import ReactDOM						from 'react-dom';						// eslint-disable-line no-unused-vars
import PropTypes					from 'prop-types';

import TextField					from '@mui/material/TextField';
import Typography					from '@mui/material/Typography';
import IconButton					from '@mui/material/IconButton';
import Tooltip						from '@mui/material/Tooltip';
import Box							from '@mui/material/Box';
import DeleteIcon					from '@mui/icons-material/ClearRounded';
import AddIcon						from '@mui/icons-material/AddRounded';
import UpIcon						from '@mui/icons-material/ArrowUpwardRounded';
import DownIcon						from '@mui/icons-material/ArrowDownwardRounded';

import { r3Role }					from './r3styles';
import R3FormButtons				from './r3formbuttons';					// Buttons
import R3Message					from '../util/r3message';
import R3PopupMsgDialog				from './r3popupmsgdialog';
import { regYrnAnyPolicyPath, regYrnAnyRolePath }	from '../util/r3define';
import { errorType, actionTypeValue, actionTypeDelete, actionTypeAdd, actionTypeUp, actionTypeDown, actionTypeHostName, actionTypeHostAuxiliary } from '../util/r3types';
import { r3DeepClone, r3DeepCompare, parseCombineHostObject, getCombineHostObject, r3IsEmptyString, r3IsEmptyEntity, r3IsEmptyEntityObject, r3IsEmptyStringObject, r3IsSafeTypedEntity, parseKVString } from '../util/r3util';

//
// Local variables
//
const tooltipValues = {
	deleteHostnameTooltip:			'deleteHostnameTooltip',
	addHostnameTooltip:				'addHostnameTooltip',
	deleteIpTooltip:				'deleteIpTooltip',
	addIpTooltip:					'addIpTooltip',
	deletePolicyTooltip:			'deletePolicyTooltip',
	addPolicyTooltip:				'addPolicyTooltip',
	downAliasTooltip:				'downAliasTooltip',
	upAliasTooltip:					'upAliasTooltip',
	deleteAliasTooltip:				'deleteAliasTooltip',
	addAliasTooltip:				'addAliasTooltip'
};

const roleComponentValues = {
	hostnameTextFieldNamePrefix:	'roleHostname',
	hostnameAUXTextFieldNamePrefix:	'roleHostnameAUX_',
	hostnameNewTextFieldName:		'roleNewHostname',
	hostnameAUXNewTextFieldName:	'roleNewHostnameAUX',
	ipTextFieldNamePrefix:			'roleIp',
	ipAUXTextFieldNamePrefix:		'roleIpAUX_',
	ipNewTextFieldName:				'roleNewIp',
	ipAUXNewTextFieldName:			'roleNewIpAUX',
	policyTextFieldNamePrefix:		'rolePolicy_',
	policyNewTextFieldName:			'roleNewPolicy',
	aliasTextFieldNamePrefix:		'aliasValue_',
	aliasNewTextFieldName:			'aliasNew'
};

//
// Role Contents Class
//
export default class R3Role extends React.Component
{
	static propTypes = {
		r3provider:	PropTypes.object.isRequired,
		role:		PropTypes.object.isRequired,
		dispUnique:	PropTypes.number.isRequired,
		isReadMode:	PropTypes.bool,
		onSave:		PropTypes.func.isRequired,
		onUpdate:	PropTypes.func.isRequired
	};

	static defaultProps = {
		isReadMode:	false
	};

	state = R3Role.createState(this.props.role, this.props.dispUnique);

	constructor(props)
	{
		super(props);

		// Binding(do not define handlers as arrow functions for performance)
		this.handleSave					= this.handleSave.bind(this);
		this.handleCancel				= this.handleCancel.bind(this);
		this.handleConfirmDialogClose	= this.handleConfirmDialogClose.bind(this);
		this.handleMessageDialogClose	= this.handleMessageDialogClose.bind(this);

		this.handleHostsChange			= this.handleHostsChange.bind(this);
		this.handleAddHostsChange		= this.handleAddHostsChange.bind(this);
		this.handleIpsChange			= this.handleIpsChange.bind(this);
		this.handlePoliciesChange		= this.handlePoliciesChange.bind(this);
		this.handleAddPoliciesChange	= this.handleAddPoliciesChange.bind(this);
		this.handleAliasesChange		= this.handleAliasesChange.bind(this);
		this.handleAddAliasesChange		= this.handleAddAliasesChange.bind(this);

		// styles
		this.sxClasses					= r3Role(props.theme);
	}

	componentDidMount()
	{
		// update State
		this.setState(R3Role.createState(this.props.role, this.props.dispUnique));
	}

	// [NOTE]
	// Use getDerivedStateFromProps by deprecating componentWillReceiveProps in React 17.x.
	// The only purpose is to set the state data from props when the dialog changes from hidden to visible.
	//
	static getDerivedStateFromProps(nextProps, prevState)
	{
		if(nextProps.dispUnique !== prevState.dispUnique){
			// Switching content
			return R3Role.createState(nextProps.role, nextProps.dispUnique);
		}
		return null;															// Return null to indicate no change to state.
	}

	static createState(role, dispUnique)
	{
		let	localHostnames	= [];
		let	localIps		= [];
		let	oneHost;
		let	standards;
		let	cnt;
		if(!r3IsEmptyEntityObject(role, 'hosts') && !r3IsEmptyEntityObject(role.hosts, 'hostnames')){
			standards		= [];
			for(cnt = 0; cnt < role.hosts.hostnames.length; ++cnt){
				oneHost		= parseCombineHostObject(role.hosts.hostnames[cnt]);
				standards.push(oneHost);
			}
			localHostnames	= R3Role.convertStandardToLocal(standards);
		}
		if(!r3IsEmptyEntityObject(role, 'hosts') && !r3IsEmptyEntityObject(role.hosts, 'ips')){
			standards		= [];
			for(cnt = 0; cnt < role.hosts.ips.length; ++cnt){
				oneHost		= parseCombineHostObject(role.hosts.ips[cnt]);
				standards.push(oneHost);
			}
			localIps		= R3Role.convertStandardToLocal(standards);
		}

		return {
			dispUnique:					dispUnique,
			role:						r3DeepClone(role),
			localHostnames:				localHostnames,
			localIps:					localIps,
			addHostName:				'',
			addAuxiliary:				'',
			addPolicies:				'',
			addAliases:					'',
			changed:					false,
			confirmMessageObject:		null,
			messageDialogObject:		null,

			tooltips: {
				deleteHostnameTooltip:	-1,				// position
				addHostnameTooltip:		false,
				deleteIpTooltip:		-1,				// position
				addIpTooltip:			false,
				deletePolicyTooltip:	-1,				// position
				addPolicyTooltip:		false,
				downAliasTooltip:		-1,				// position
				upAliasTooltip:			-1,				// position
				deleteAliasTooltip:		-1,				// position
				addAliasTooltip:		false
			}
		};
	}

	//
	// Utility for hostnames/ips
	//
	static convertStandardToLocal(standards)
	{
		let	result = [];
		if(r3IsEmptyEntity(standards) || !(standards instanceof Array)){
			return result;
		}
		for(let cnt = 0; cnt < standards.length; ++cnt){
			let	local = R3Role.convertOneStandardToLocal(standards[cnt]);
			result.push(local);
		}
		return result;
	}

	static convertOneStandardToLocal(standard)
	{
		let	local = {};

		// host
		if(r3IsEmptyStringObject(standard, 'hostname')){
			local.host	= '';
		}else{
			local.host	= standard.hostname;
		}

		// auxiliary
		local.auxiliary	= '';

		// port in auxiliary
		if(!r3IsEmptyEntityObject(standard, 'port') && (r3IsSafeTypedEntity(standard.port, 'string') || r3IsSafeTypedEntity(standard.port, 'number'))){
			if(r3IsSafeTypedEntity(standard.port, 'string')){
				if(!isNaN(standard.port.trim()) || '*' === standard.port.trim()){
					local.auxiliary += 'PORT=' + standard.port.trim();
				}else{
					// wrong string...
					local.auxiliary += 'PORT=0';
				}
			}else{
				if(0 === standard.port){
					local.auxiliary += 'PORT=*';
				}else{
					local.auxiliary += 'PORT=' + String(standard.port);
				}
			}
		}else{
			local.auxiliary += 'PORT=*';
		}

		// cuk in auxiliary
		if(!r3IsEmptyStringObject(standard, 'cuk') && !r3IsEmptyString(standard.cuk.trim())){
			local.auxiliary += ', CUK=' + standard.cuk.trim();
		}

		// extra in auxiliary
		if(!r3IsEmptyStringObject(standard, 'extra') && !r3IsEmptyString(standard.extra.trim())){
			local.auxiliary += ', EXT=' + standard.extra.trim();
		}

		// tag in auxiliary
		if(!r3IsEmptyStringObject(standard, 'tag') && !r3IsEmptyString(standard.tag.trim())){
			local.auxiliary += ', TAG=' + standard.tag.trim();
		}

		// inboundip in auxiliary
		if(!r3IsEmptyStringObject(standard, 'inboundip') && !r3IsEmptyString(standard.inboundip.trim())){
			local.auxiliary += ', INBOUNDIP=' + standard.inboundip.trim();
		}

		// outboundip in auxiliary
		if(!r3IsEmptyStringObject(standard, 'outboundip') && !r3IsEmptyString(standard.outboundip.trim())){
			local.auxiliary += ', OUTBOUNDIP=' + standard.outboundip.trim();
		}
		return local;
	}

	convertLocalToStandard(locals)
	{
		let	result = [];
		if(r3IsEmptyEntity(locals) || !(locals instanceof Array)){
			return result;
		}
		for(let cnt = 0; cnt < locals.length; ++cnt){
			if(r3IsEmptyStringObject(locals[cnt], 'host') && r3IsEmptyStringObject(locals[cnt], 'auxiliary')){
				continue;
			}
			let	standard = this.convertOneLocalToStandard(locals[cnt]);
			if(!this.checkStandardHostObject(standard)){
				continue;
			}
			result.push(standard);
		}
		return result;
	}

	convertOneLocalToStandard(local)
	{
		let	result = {};

		// host
		if(!r3IsEmptyStringObject(local, 'host')){
			result.hostname = local.host;
		}else{
			result.hostname = '';
		}

		// auxiliary
		if(r3IsEmptyStringObject(local, 'auxiliary')){
			result.port	= 0;
			result.cuk	= null;
			result.extra= null;
			result.tag	= null;
		}else{
			let	tmpstr	= local.auxiliary;

			// PORT
			let	parsed	= parseKVString(tmpstr, 'PORT');
			if(!r3IsEmptyEntity(parsed.value)){
				if(!r3IsEmptyString(parsed.value)){
					if(!isNaN(parsed.value.trim())){
						result.port	= parseInt(parsed.value.trim());
					}else if('*' === parsed.value.trim()){
						result.port	= 0;
					}else{
						result.port	= -1;				// wrong string...
					}
				}else if(r3IsSafeTypedEntity(parsed.value.port, 'number')){
					result.port	= parsed.value;
				}else{
					result.port	= -1;					// wrong type...
				}
				tmpstr = parsed.reststr;
			}else{
				result.port	= -1;
			}

			// CUK
			parsed			= parseKVString(tmpstr, 'CUK');
			if(!r3IsEmptyString(parsed.value, true)){
				result.cuk	= parsed.value.trim();
				tmpstr		= parsed.reststr;
			}else{
				result.cuk	= null;
			}

			// EXTRA
			parsed			= parseKVString(tmpstr, 'EXT');
			if(!r3IsEmptyString(parsed.value, true)){
				result.extra= parsed.value;
				tmpstr		= parsed.reststr;
			}else{
				result.extra= null;
			}

			// TAG
			parsed			= parseKVString(tmpstr, 'TAG');
			if(!r3IsEmptyString(parsed.value, true)){
				result.tag	= parsed.value;
				tmpstr		= parsed.reststr;
			}else{
				result.tag	= null;
			}

			// INBOUNDIP
			parsed					= parseKVString(tmpstr, 'INBOUNDIP');
			if(!r3IsEmptyString(parsed.value, true)){
				result.inboundip	= parsed.value;
				tmpstr				= parsed.reststr;
			}else{
				result.inboundip	= null;
			}

			// OUTBOUNDIP
			parsed					= parseKVString(tmpstr, 'OUTBOUNDIP');
			if(!r3IsEmptyString(parsed.value, true)){
				result.outboundip	= parsed.value;
				tmpstr				= parsed.reststr;
			}else{
				result.outboundip	= null;
			}
		}
		return result;
	}

	checkStandardHostObject(standard)
	{
		if(r3IsEmptyStringObject(standard, 'hostname') || r3IsEmptyString(standard.hostname, true)){
			return false;
		}
		if(r3IsEmptyEntityObject(standard, 'port') || isNaN(standard.port)){
			return false;
		}
		if(!r3IsSafeTypedEntity(standard.port, 'number')){
			standard.port = Number(standard.port);
		}
		if(standard.port < 0 || 65535 < standard.port){
			return false;
		}
		if(!r3IsEmptyStringObject(standard, 'cuk') && -1 !== standard.cuk.indexOf(' ')){
			return false;
		}
		if(!r3IsEmptyStringObject(standard, 'extra') && -1 !== standard.extra.indexOf(' ')){
			return false;
		}
		if(!r3IsEmptyStringObject(standard, 'tag') && -1 !== standard.tag.indexOf(' ')){
			return false;
		}
		if(!r3IsEmptyStringObject(standard, 'inboundip') && -1 !== standard.tag.indexOf(' ')){
			return false;
		}
		if(!r3IsEmptyStringObject(standard, 'outboundip') && -1 !== standard.tag.indexOf(' ')){
			return false;
		}
		return true;
	}

	compareStandardHostObject(standard1, standard2)
	{
		if(	(r3IsEmptyStringObject(standard1, 'hostname')	!== r3IsEmptyStringObject(standard2, 'hostname'))	||
			(r3IsEmptyString(standard1.hostname, true)		!== r3IsEmptyString(standard2.hostname, true)	)	||
			(!r3IsEmptyString(standard1.hostname, true)		&& (standard1.hostname !== standard2.hostname)	)	)
		{
			return false;
		}
		if(	(r3IsEmptyEntityObject(standard1, 'port')	!== r3IsEmptyEntityObject(standard2, 'port'))	||
			String(standard1.port)						!== String(standard2.port)						)
		{
			return false;
		}
		if(	(r3IsEmptyStringObject(standard1, 'cuk')	!== r3IsEmptyStringObject(standard2, 'cuk')	)	||
			(r3IsEmptyString(standard1.cuk, true)		!== r3IsEmptyString(standard2.cuk, true)	)	||
			(!r3IsEmptyString(standard1.cuk, true)		&& (standard1.cuk !== standard2.cuk)		)	)
		{
			return false;
		}
		if(	(r3IsEmptyStringObject(standard1, 'extra')	!== r3IsEmptyStringObject(standard2, 'extra')	)	||
			(r3IsEmptyString(standard1.extra, true)		!== r3IsEmptyString(standard2.extra, true)		)	||
			(!r3IsEmptyString(standard1.extra, true)	&& (standard1.extra !== standard2.extra)		)	)
		{
			return false;
		}
		if(	(r3IsEmptyStringObject(standard1, 'tag')	!== r3IsEmptyStringObject(standard2, 'tag')	)	||
			(r3IsEmptyString(standard1.tag, true)		!== r3IsEmptyString(standard2.tag, true)	)	||
			(!r3IsEmptyString(standard1.tag, true)		&& (standard1.tag !== standard2.tag)		)	)
		{
			return false;
		}
		if(	(r3IsEmptyStringObject(standard1, 'inboundip')	!== r3IsEmptyStringObject(standard2, 'inboundip')	)	||
			(r3IsEmptyString(standard1.inboundip, true)		!== r3IsEmptyString(standard2.inboundip, true)		)	||
			(!r3IsEmptyString(standard1.inboundip, true)	&& (standard1.inboundip !== standard2.inboundip)	)	)
		{
			return false;
		}
		if(	(r3IsEmptyStringObject(standard1, 'outboundip')	!== r3IsEmptyStringObject(standard2, 'outboundip')	)	||
			(r3IsEmptyString(standard1.outboundip, true)	!== r3IsEmptyString(standard2.outboundip, true)		)	||
			(!r3IsEmptyString(standard1.outboundip, true)	&& (standard1.outboundip !== standard2.outboundip)	)	)
		{
			return false;
		}
		return true;
	}

	//
	// Check Hosts.hostnames state
	//
	isChangedHostsState(nowHosts, isHostname)
	{
		let	propsHost = [];
		let	oneHost;
		let	local;
		let	cnt;
		if(isHostname){
			if(!r3IsEmptyEntityObject(this.props.role, 'hosts') && !r3IsEmptyEntityObject(this.props.role.hosts, 'hostnames')){
				for(cnt = 0; cnt < this.props.role.hosts.hostnames.length; ++cnt){
					oneHost	= parseCombineHostObject(this.props.role.hosts.hostnames[cnt]);
					propsHost.push(oneHost);
				}
			}
		}else{
			if(!r3IsEmptyEntityObject(this.props.role, 'hosts') && !r3IsEmptyEntityObject(this.props.role.hosts, 'ips')){
				for(cnt = 0; cnt < this.props.role.hosts.ips.length; ++cnt){
					oneHost	= parseCombineHostObject(this.props.role.hosts.ips[cnt]);
					propsHost.push(oneHost);
				}
			}
		}
		if(r3IsEmptyEntity(nowHosts) || !(nowHosts instanceof Array) || nowHosts.length !== propsHost.length){
			return true;
		}
		let	found = false;
		for(let cnt1 = 0; cnt1 < nowHosts.length; ++cnt1){
			found	= false;
			oneHost = this.convertOneLocalToStandard(nowHosts[cnt1]);
			local	= R3Role.convertOneStandardToLocal(oneHost);

			if(	r3IsEmptyEntityObject(nowHosts[cnt1], 'host')		!== r3IsEmptyEntityObject(local, 'host')			||
				(!r3IsEmptyEntityObject(nowHosts[cnt1], 'host')		&& (nowHosts[cnt1].host !== local.host))			||
				r3IsEmptyEntityObject(nowHosts[cnt1], 'auxiliary')	!== r3IsEmptyEntityObject(local, 'auxiliary')		||
				(!r3IsEmptyEntityObject(nowHosts[cnt1], 'auxiliary') && (nowHosts[cnt1].auxiliary !== local.auxiliary))	)
			{
				return true;
			}
			for(let cnt2 = 0; cnt2 < propsHost.length; ++cnt2){
				if(this.compareStandardHostObject(oneHost, propsHost[cnt2])){
					propsHost.splice(cnt2, 1);
					found = true;
					break;
				}
			}
			if(!found){
				return true;
			}
		}
		return false;
	}

	//
	// Check Polisies state
	//
	isChangedPoliciesState(nowPolicies)
	{
		if(r3IsEmptyEntity(nowPolicies) || !(nowPolicies instanceof Array)){
			// set current value
			nowPolicies = this.state.role.policies;
		}
		if((r3IsEmptyEntityObject(this.props.role, 'policies') || !(this.props.role.policies instanceof Array)) !== (r3IsEmptyEntity(nowPolicies) || !(nowPolicies instanceof Array))){
			return true;
		}
		return !r3DeepCompare(this.props.role.policies, nowPolicies);
	}

	//
	// Check only aliases state
	//
	isChangedAliasesState(nowAliases)
	{
		if(r3IsEmptyEntity(nowAliases)){
			nowAliases	= r3IsEmptyEntityObject(this.state.role, 'aliases') ? undefined : this.state.role.aliases;
		}
		if(r3IsEmptyEntity(nowAliases)){
			nowAliases = [];									// empty array
		}
		let	propsAliases = r3IsEmptyEntityObject(this.props.role, 'aliases') ? undefined : this.props.role.aliases;
		if(r3IsEmptyEntity(propsAliases)){
			propsAliases = [];									// empty object
		}
		// check
		return !r3DeepCompare(nowAliases, propsAliases);
	}

	//
	// Check all state
	//
	isChangedState(nowHosts, nowIps, nowPolicies, nowAliases)
	{
		// check hosts
		if(r3IsEmptyEntity(nowHosts)){
			if(this.isChangedHostsState(this.state.localHostnames, true)){
				return true;
			}
		}else{
			if(this.isChangedHostsState(nowHosts, true)){
				return true;
			}
		}
		// check ips
		if(r3IsEmptyEntity(nowIps)){
			if(this.isChangedHostsState(this.state.localIps, false)){
				return true;
			}
		}else{
			if(this.isChangedHostsState(nowIps, false)){
				return true;
			}
		}
		// check policies
		if(this.isChangedPoliciesState(nowPolicies)){
			return true;
		}
		// check aliases
		if(this.isChangedAliasesState(nowAliases)){
			return true;
		}
		return false;
	}

	//
	// Handle Form Button : Save
	//
	handleSave(event)														// eslint-disable-line no-unused-vars
	{
		if(!this.state.changed){
			return;
		}

		let	newRole = r3DeepClone(this.state.role);
		if(r3IsEmptyEntity(newRole.hosts)){
			newRole.hosts = {
				hostnames:	[],
				ips:		[]
			};
		}
		if(r3IsEmptyEntity(newRole.hosts.hostnames) || !(newRole.hosts.hostnames instanceof Array)){
			newRole.hosts.hostnames = [];
		}
		if(r3IsEmptyEntity(newRole.hosts.ips) || !(newRole.hosts.ips instanceof Array)){
			newRole.hosts.ips = [];
		}

		//
		// Check role
		//
		let	cnt;
		let	cnt2;
		let	combineObject;
		let	isHostChange = false;

		//
		// check hostnames
		//
		if(this.isChangedHostsState(this.state.localHostnames, true)){
			let	newHostnames		= [];
			let	newStandardHostnames= [];
			for(cnt = 0; cnt < this.state.localHostnames.length; ++cnt){
				// convert
				let	oneHost = this.convertOneLocalToStandard(this.state.localHostnames[cnt]);
				if(!this.checkStandardHostObject(oneHost)){
					this.setState({
						messageDialogObject:	new R3Message(this.props.r3provider.getR3TextRes().eNewHostAuxiliary, errorType)
					});
					return;
				}
				// check same host
				for(cnt2 = 0; cnt2 < newHostnames.length; ++cnt2){
					if(this.compareStandardHostObject(oneHost, newHostnames[cnt2])){
						this.setState({
							messageDialogObject:	new R3Message(this.props.r3provider.getR3TextRes().eSameHost, errorType)
						});
						return;
					}
				}
				newHostnames.push(oneHost);

				combineObject = getCombineHostObject(oneHost.hostname, oneHost.port, oneHost.cuk, oneHost.extra, oneHost.tag, oneHost.inboundip, oneHost.outboundip);
				if(!r3IsEmptyEntity(combineObject)){
					newStandardHostnames.push(combineObject);
				}
			}
			newRole.hosts.hostnames	= newStandardHostnames;
			isHostChange			= true;
		}

		//
		// check ips
		//
		if(this.isChangedHostsState(this.state.localIps, false)){
			let	newIps			= [];
			let	newStandardIps	= [];
			for(cnt = 0; cnt < this.state.localIps.length; ++cnt){
				// convert
				let	oneIp = this.convertOneLocalToStandard(this.state.localIps[cnt]);
				if(!this.checkStandardHostObject(oneIp)){
					this.setState({
						messageDialogObject:	new R3Message(this.props.r3provider.getR3TextRes().eNewHostAuxiliary, errorType)
					});
					return;
				}
				// check same host
				for(cnt2 = 0; cnt2 < newIps.length; ++cnt2){
					if(this.compareStandardHostObject(oneIp, newIps[cnt2])){
						this.setState({
							messageDialogObject:	new R3Message(this.props.r3provider.getR3TextRes().eSameHost, errorType)
						});
						return;
					}
				}
				newIps.push(oneIp);

				combineObject = getCombineHostObject(oneIp.hostname, oneIp.port, oneIp.cuk, oneIp.extra, oneIp.tag, oneIp.inboundip, oneIp.outboundip);
				if(!r3IsEmptyEntity(combineObject)){
					newStandardIps.push(combineObject);
				}
			}
			newRole.hosts.ips	= newStandardIps;
			isHostChange		= true;
		}

		//
		// policies
		//
		if(r3IsEmptyEntity(newRole.policies) || !(newRole.policies instanceof Array)){
			newRole.policies = [];
		}
		// check empty and yrn path by regex
		let	regPolicyPath = new RegExp(regYrnAnyPolicyPath);
		for(cnt = 0; cnt < newRole.policies.length; ++cnt){
			newRole.policies[cnt] = newRole.policies[cnt].trim();

			if(null === newRole.policies[cnt].match(regPolicyPath)){
				this.setState({
					messageDialogObject:	new R3Message(this.props.r3provider.getR3TextRes().ePoliciesArray, errorType)
				});
				return;
			}
		}
		// check same value
		for(cnt = 0; cnt < newRole.policies.length; ++cnt){
			for(cnt2 = (cnt + 1); cnt2 < newRole.policies.length; ++cnt2){
				if(newRole.policies[cnt] === newRole.policies[cnt2]){
					this.setState({
						messageDialogObject:	new R3Message(this.props.r3provider.getR3TextRes().ePoliciesArray, errorType)
					});
					return;
				}
			}
		}

		//
		// aliases
		//
		if(r3IsEmptyEntity(newRole.aliases) || !(newRole.aliases instanceof Array)){
			newRole.aliases = [];
		}
		// check empty and yrn path by regex
		let	regAliasPath = new RegExp(regYrnAnyRolePath);
		for(cnt = 0; cnt < newRole.aliases.length; ++cnt){
			newRole.aliases[cnt] = newRole.aliases[cnt].trim();

			if(null === newRole.aliases[cnt].match(regAliasPath)){
				this.setState({
					messageDialogObject:	new R3Message(this.props.r3provider.getR3TextRes().eNotYRNAliases, errorType)
				});
				return;
			}
		}
		// check same value
		for(cnt = 0; cnt < newRole.aliases.length; ++cnt){
			for(cnt2 = (cnt + 1); cnt2 < newRole.aliases.length; ++cnt2){
				if(newRole.aliases[cnt] === newRole.aliases[cnt2]){
					this.setState({
						messageDialogObject:	new R3Message(this.props.r3provider.getR3TextRes().eAliasArray, errorType)
					});
					return;
				}
			}
		}

		//
		// Check changed
		//
		if(!isHostChange && !this.isChangedState(null, null, newRole.policies, newRole.aliases)){
			this.setState({
				messageDialogObject:	new R3Message(this.props.r3provider.getR3TextRes().eNoChange, errorType)
			});
			return;
		}
		this.props.onSave(newRole);
	}

	//
	// Handle Form Button : Cancel
	//
	handleCancel(event)														// eslint-disable-line no-unused-vars
	{
		if(this.state.changed){
			this.setState({
				confirmMessageObject:	new R3Message(this.props.r3provider.getR3TextRes().cUpdatingCancel)
			});
		}
	}

	//
	// Handle Confirm Dialog : Close( OK / Cancel )
	//
	handleConfirmDialogClose(event, reason, result)							// eslint-disable-line no-unused-vars
	{
		if(result){
			// case for 'cancel updating' to do
			this.props.onUpdate(false);

			// rewind State
			this.setState(R3Role.createState(this.props.role, this.props.dispUnique));
		}else{
			// case for 'cancel updating' to cancel
			this.setState({
				confirmMessageObject:	null
			});
		}
	}

	//
	// Handle Message Dialog : Close
	//
	handleMessageDialogClose(event, reason, result)							// eslint-disable-line no-unused-vars
	{
		this.setState({
			messageDialogObject:	null
		});
	}

	//
	// Handle Hostname and port : Change
	//
	handleHostsChange(event, type, pos)
	{
		let	changedValue	= r3IsEmptyEntityObject(event.target, 'value') ? null : event.target.value;
		let	newHosts		= [];
		let	isClearNewKey	= false;

		if(!r3IsEmptyEntity(this.state.localHostnames) && this.state.localHostnames instanceof Array){
			newHosts = r3DeepClone(this.state.localHostnames);
		}

		if(actionTypeHostName === type){
			//
			// change hostname
			//
			if(newHosts.length <= pos){
				console.warn('unknown pos(' + JSON.stringify(pos) + ') for hostnames array.');
				return;
			}
			newHosts[pos].host		= changedValue;						// set hostname

		}else if(actionTypeHostAuxiliary === type){
			//
			// change auxiliary
			//
			if(newHosts.length <= pos){
				console.warn('unknown pos(' + JSON.stringify(pos) + ') for hostnames array.');
				return;
			}
			newHosts[pos].auxiliary	= changedValue;						// set auxiliary

		}else if(actionTypeDelete === type){
			//
			// Delete host + auxiliary
			//
			if(newHosts.length <= pos){
				console.warn('unknown pos(' + JSON.stringify(pos) + ') for hostnames array.');
				return;
			}
			newHosts.splice(pos, 1);

		}else if(actionTypeAdd === type){
			//
			// Add host + auxiliary
			//
			let	newHostname	= this.state.addHostName.trim();
			let	newAuxiliary= this.state.addAuxiliary.trim();
			let	local		= { host: newHostname, auxiliary: newAuxiliary };

			// check hostname
			if(r3IsEmptyString(newHostname)){
				this.setState({
					messageDialogObject:	new R3Message(this.props.r3provider.getR3TextRes().eNewHostName, errorType)
				});
				return;
			}

			// check auxiliary and host to standard and normalization
			let	standard = this.convertOneLocalToStandard(local);
			if(!this.checkStandardHostObject(standard)){
				this.setState({
					messageDialogObject:	new R3Message(this.props.r3provider.getR3TextRes().eNewHostAuxiliary, errorType)
				});
				return;
			}

			// check conflict
			for(let cnt = 0; cnt < this.state.localHostnames.length; ++cnt){
				let	orgstandard = this.convertOneLocalToStandard(this.state.localHostnames[cnt]);
				if(!this.checkStandardHostObject(orgstandard)){
					continue;
				}
				if(this.compareStandardHostObject(standard, orgstandard)){
					// found same object
					this.setState({
						messageDialogObject:	new R3Message(this.props.r3provider.getR3TextRes().eSameHost, errorType)
					});
					return;
				}
			}
			newHosts.push(local);
			isClearNewKey = true;

		}else{
			console.warn('unknown action(' + JSON.stringify(type) + ') for hosts.');
			return;
		}

		// set parent changed state
		let	changed = this.isChangedState(newHosts);
		this.props.onUpdate(changed);

		// update state
		this.setState({
			changed:		changed,
			localHostnames:	newHosts,
			addHostName:	(isClearNewKey ? '' : this.state.addHostName),
			addAuxiliary:	(isClearNewKey ? '' : this.state.addAuxiliary)
		});
	}

	//
	// Handle Add Hostname and port etc : Change
	//
	handleAddHostsChange(event, type)
	{
		let	changedValue = r3IsEmptyEntityObject(event.target, 'value') ? null : event.target.value;

		// update state
		if(actionTypeHostName === type){
			this.setState({
				addHostName:	changedValue
			});
		}else if(actionTypeHostAuxiliary === type){
			this.setState({
				addAuxiliary:	changedValue
			});
		}else{
			console.warn('unknown action(' + JSON.stringify(type) + ') for hosts.');
			return;
		}
	}

	//
	// Handle IP Addresses Value : Change
	//
	handleIpsChange(event, pos)														// eslint-disable-line no-unused-vars
	{
		let	newIps = {};
		if(!r3IsEmptyEntity(this.state.localIps) && this.state.localIps instanceof Array){
			newIps = r3DeepClone(this.state.localIps);
		}

		if(newIps.length <= pos){
			console.warn('unknown pos(' + JSON.stringify(pos) + ') for ips array.');
			return;
		}

		// delete
		newIps.splice(pos, 1);

		// set parent changed state
		let	changed = this.isChangedState(null, newIps);
		this.props.onUpdate(changed);

		// update state
		this.setState({
			changed:	changed,
			localIps:	newIps
		});
	}

	//
	// Handle Policies Value : Change
	//
	handlePoliciesChange(event, type, pos)
	{
		let	changedValue= r3IsEmptyEntityObject(event.target, 'value') ? null : event.target.value;
		let	newPolicies	= [];
		if(r3IsSafeTypedEntity(this.state.role.policies, 'array')){
			newPolicies = r3DeepClone(this.state.role.policies);
		}

		let	isClearNewValue	= false;
		if(actionTypeValue === type){
			if(r3IsEmptyEntity(pos) || isNaN(pos) || pos < 0 || newPolicies.length <= pos){
				console.warn('unknown position(' + JSON.stringify(pos) + ') for policies.');
				return;
			}
			newPolicies[pos] = changedValue.trim();

		}else if(actionTypeDelete === type){
			if(r3IsEmptyEntity(pos) || isNaN(pos) || pos < 0 || newPolicies.length <= pos){
				console.warn('unknown position(' + JSON.stringify(pos) + ') for policies.');
				return;
			}
			newPolicies.splice(pos, 1);

		}else if(actionTypeAdd === type){
			if(r3IsEmptyString(this.state.addPolicies, true)){
				this.setState({
					messageDialogObject:	new R3Message(this.props.r3provider.getR3TextRes().eNewPolicies, errorType)
				});
				return;
			}
			newPolicies.push(this.state.addPolicies.trim());
			isClearNewValue = true;

		}else{
			console.warn('unknown action(' + JSON.stringify(type) + ') for policies.');
			return;
		}

		// make new resource object
		let	newRole			= r3DeepClone(this.state.role);
		newRole.policies	= newPolicies;

		// set parent changed state
		let	changed			= this.isChangedState(null, null, newPolicies);
		this.props.onUpdate(changed);

		// update state
		this.setState({
			role:			newRole,
			changed:		changed,
			addPolicies:	(isClearNewValue ? '' : this.state.addPolicies)
		});
	}

	//
	// Handle Add New Policies : Change
	//
	handleAddPoliciesChange(event)
	{
		// update state
		this.setState({
			addPolicies:		event.target.value
		});
	}

	//
	// Handle Policy Aliases : Change
	//
	handleAliasesChange(event, type, pos)
	{
		let	changedValue	= r3IsEmptyEntityObject(event.target, 'value') ? null : event.target.value;
		let	isClearNewAlias	= false;
		let	newAliases		= [];
		if(r3IsSafeTypedEntity(this.state.role.aliases, 'array')){
			newAliases		= r3DeepClone(this.state.role.aliases);
		}

		if(actionTypeValue === type){
			// change value at pos
			newAliases[pos]	= changedValue;

		}else if(actionTypeDelete === type){
			// delete value at pos
			newAliases.splice(pos, 1);

		}else if(actionTypeUp === type){
			// move pos's value to up
			let	targetValue = newAliases[pos];			// real or ref
			newAliases.splice((pos - 1), 0, targetValue);
			newAliases.splice(pos + 1, 1);

		}else if(actionTypeDown === type){
			// move pos's value to down
			let	targetValue = newAliases[pos + 1];		// real or ref
			newAliases.splice(pos, 0, targetValue);
			newAliases.splice(pos + 2, 1);

		}else if(actionTypeAdd === type){
			// add new aliases
			if(r3IsEmptyString(this.state.addAliases, true)){
				this.setState({
					messageDialogObject:	new R3Message(this.props.r3provider.getR3TextRes().eNewAliases, errorType)
				});
				return;
			}
			// add
			newAliases.push(this.state.addAliases.trim());
			isClearNewAlias = true;

		}else{
			console.warn('unknown action(' + JSON.stringify(type) + ') for aliases.');
			return;
		}

		// make new resource object
		let	newRole			= r3DeepClone(this.state.role);
		newRole.aliases		= newAliases;

		// set parent changed state
		let	changed			= this.isChangedState(null, null, null, newAliases);
		this.props.onUpdate(changed);

		// update state
		this.setState({
			role:			newRole,
			changed:		changed,
			addAliases:		(isClearNewAlias ? '' : this.state.addAliases)
		});
	}

	//
	// Handle Add Policy Aliases : Change
	//
	handleAddAliasesChange(event)
	{
		// update state
		this.setState({
			addAliases:		event.target.value
		});
	}

	handTooltipChange = (event, type, extData) =>									// eslint-disable-line no-unused-vars
	{
		if(tooltipValues.deleteHostnameTooltip === type){
			this.setState({
				tooltips: {
					deleteHostnameTooltip:	extData
				}
			});
		}else if(tooltipValues.addHostnameTooltip === type){
			this.setState({
				tooltips: {
					addHostnameTooltip:		extData
				}
			});
		}else if(tooltipValues.deleteIpTooltip === type){
			this.setState({
				tooltips: {
					deleteIpTooltip:		extData
				}
			});
		}else if(tooltipValues.addIpTooltip === type){
			this.setState({
				tooltips: {
					addIpTooltip:			extData
				}
			});
		}else if(tooltipValues.deletePolicyTooltip === type){
			this.setState({
				tooltips: {
					deletePolicyTooltip:	extData
				}
			});
		}else if(tooltipValues.addPolicyTooltip === type){
			this.setState({
				tooltips: {
					addPolicyTooltip:		extData
				}
			});
		}else if(tooltipValues.downAliasTooltip === type){
			this.setState({
				tooltips: {
					downAliasTooltip:		extData
				}
			});
		}else if(tooltipValues.upAliasTooltip === type){
			this.setState({
				tooltips: {
					upAliasTooltip:			extData
				}
			});
		}else if(tooltipValues.deleteAliasTooltip === type){
			this.setState({
				tooltips: {
					deleteAliasTooltip:		extData
				}
			});
		}else if(tooltipValues.addAliasTooltip === type){
			this.setState({
				tooltips: {
					addAliasTooltip:		extData
				}
			});
		}
	};

	getHostnameContents()
	{
		const { theme, r3provider } = this.props;

		if(r3IsEmptyEntity(this.state.localHostnames) || !(this.state.localHostnames instanceof Array)){
			return;
		}

		let	elementArray = [];
		this.state.localHostnames.map( (oneHostObj, pos) =>
		{
			// parse hostname and port etc
			let	dispName = r3IsEmptyStringObject(oneHostObj, 'host') ?		'' : oneHostObj.host;
			let	axiliary = r3IsEmptyStringObject(oneHostObj, 'auxiliary') ?	'' : oneHostObj.auxiliary;

			let	deleteButton;
			if(this.props.isReadMode){
				deleteButton = (
					<IconButton
						disabled={ true }
						{ ...theme.r3Role.deleteHostnameButton }
						sx={ this.sxClasses.deleteInvisibleHostnameButton }
						size="large"
					>
						<DeleteIcon />
					</IconButton>
				);
			}else{
				deleteButton = (
					<Tooltip
						title={ r3provider.getR3TextRes().tResRoleHostnameDelTT }
						open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.deleteHostnameTooltip, 'number') || (this.state.tooltips.deleteHostnameTooltip != pos)) ? false : true) }
					>
						<IconButton
							onClick={ (event) => this.handleHostsChange(event, actionTypeDelete, pos) }
							onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.deleteHostnameTooltip, pos) }
							onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.deleteHostnameTooltip, -1) }
							{ ...theme.r3Role.deleteHostnameButton }
							sx={ this.sxClasses.deleteHostnameButton }
							size="large"
						>
							<DeleteIcon />
						</IconButton>
					</Tooltip>
				);
			}

			let	inputProps;
			if(this.props.isReadMode){
				inputProps = {};
			}else{
				inputProps = {
					sx: this.sxClasses.inputTextField
				};
			}

			elementArray.push(
				<Box
					key={ pos }
					sx={ this.sxClasses.enclosureElement }
				>
					<TextField
						name={ roleComponentValues.hostnameTextFieldNamePrefix + String(pos) }
						value={ dispName }
						disabled={ this.props.isReadMode }
						placeholder={ r3provider.getR3TextRes().tResRoleHostnameHint }
						onChange={ (event) => this.handleHostsChange(event, actionTypeHostName, pos) }
						InputProps={ inputProps }
						{ ...theme.r3Role.hostnameTextField }
						sx={ this.sxClasses.hostnameTextField }
					/>
					<TextField
						name={ roleComponentValues.hostnameAUXTextFieldNamePrefix + String(pos) }
						value={ axiliary }
						disabled={ this.props.isReadMode }
						placeholder={ r3provider.getR3TextRes().tResRoleHostnameAUXHint }
						onChange={ (event) => this.handleHostsChange(event, actionTypeHostAuxiliary, pos) }
						InputProps={ inputProps }
						{ ...theme.r3Role.hostnameAUXTextField }
						sx={ this.sxClasses.hostnameAUXTextField }
					/>
					{ deleteButton }
				</Box>
			);
		});

		return (
			elementArray.map( (item, pos) => {								// eslint-disable-line no-unused-vars
				return item;
			})
		);
	}

	getAddHostnameContents()
	{
		const { theme, r3provider } = this.props;

		if(this.props.isReadMode){
			return;
		}

		return (
			<Box
				sx={ this.sxClasses.enclosureElement }
			>
				<TextField
					name={ roleComponentValues.hostnameNewTextFieldName }
					value={ this.state.addHostName }
					placeholder={ r3provider.getR3TextRes().tResRoleHostnameHint }
					onChange={ (event) => this.handleAddHostsChange(event, actionTypeHostName) }
					InputProps={{ sx: this.sxClasses.inputTextField }}
					{ ...theme.r3Role.hostnameTextField }
					sx={ this.sxClasses.hostnameTextField }
				/>
				<TextField
					name={ roleComponentValues.hostnameAUXNewTextFieldName }
					value={ this.state.addAuxiliary }
					placeholder={ r3provider.getR3TextRes().tResRoleHostnameAUXHint }
					onChange={ (event) => this.handleAddHostsChange(event, actionTypeHostAuxiliary) }
					InputProps={{ sx: this.sxClasses.inputTextField }}
					{ ...theme.r3Role.hostnameAUXTextField }
					sx={ this.sxClasses.hostnameAUXTextField }
				/>
				<Tooltip
					title={ r3provider.getR3TextRes().tResRoleHostnameAddTT }
					open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.addHostnameTooltip, 'boolean')) ? false : this.state.tooltips.addHostnameTooltip) }
				>
					<IconButton
						onClick={ (event) => this.handleHostsChange(event, actionTypeAdd, 0) }
						onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.addHostnameTooltip, true) }
						onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.addHostnameTooltip, false) }
						{ ...theme.r3Role.addHostnameButton }
						sx={ this.sxClasses.addHostnameButton }
						size="large"
					>
						<AddIcon />
					</IconButton>
				</Tooltip>
			</Box>
		);
	}

	getIpAddressContents()
	{
		const { theme, r3provider } = this.props;

		if(r3IsEmptyEntity(this.state.localIps) || !(this.state.localIps instanceof Array)){
			return;
		}

		let	elementArray = [];
		this.state.localIps.map( (oneHostObj, pos) =>
		{
			// parse ip address and port etc
			let	ip		= r3IsEmptyStringObject(oneHostObj, 'host') ?		'' : oneHostObj.host;
			let	axiliary= r3IsEmptyStringObject(oneHostObj, 'auxiliary') ?	'' : oneHostObj.auxiliary;

			let	deleteButton;
			if(this.props.isReadMode){
				deleteButton = (
					<IconButton
						disabled={ true }
						{ ...theme.r3Role.deleteIpButton }
						sx={ this.sxClasses.deleteInvisibleIpButton }
						size="large"
					>
						<DeleteIcon />
					</IconButton>
				);
			}else{
				deleteButton = (
					<Tooltip
						title={ r3provider.getR3TextRes().tResRoleIpDelTT }
						open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.deleteIpTooltip, 'number') || (this.state.tooltips.deleteIpTooltip != pos)) ? false : true) }
					>
						<IconButton
							onClick={ (event) => this.handleIpsChange(event, pos) }
							onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.deleteIpTooltip, pos) }
							onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.deleteIpTooltip, -1) }
							{ ...theme.r3Role.deleteIpButton }
							sx={ this.sxClasses.deleteIpButton }
							size="large"
						>
							<DeleteIcon />
						</IconButton>
					</Tooltip>
				);
			}

			// [NOTE]
			// IP address is always disable
			//
			elementArray.push(
				<Box
					key={ pos }
					sx={ this.sxClasses.enclosureElement }
				>
					<TextField
						name={ roleComponentValues.ipTextFieldNamePrefix + String(pos) }
						value={ ip }
						disabled={ true }
						{ ...theme.r3Role.ipTextField }
						sx={ this.sxClasses.ipTextField }
					/>
					<TextField
						name={ roleComponentValues.ipAUXTextFieldNamePrefix + String(pos) }
						value={ axiliary }
						disabled={ true }
						{ ...theme.r3Role.ipAUXTextField }
						sx={ this.sxClasses.ipAUXTextField }
					/>
					{ deleteButton }
				</Box>
			);
		});

		return (
			elementArray.map( (item, pos) => {								// eslint-disable-line no-unused-vars
				return item;
			})
		);
	}

	getPolicyContents(items)
	{
		const { theme, r3provider } = this.props;

		if(!r3IsSafeTypedEntity(items, 'array')){
			return;
		}
		let	_items = items;

		return _items.map( (item, pos) =>
		{
			let	deleteButton;
			if(this.props.isReadMode){
				deleteButton = (
					<IconButton
						disabled={ true }
						{ ...theme.r3Role.deletePolicyButton }
						sx={ this.sxClasses.deleteInvisiblePolicyButton }
						size="large"
					>
						<DeleteIcon />
					</IconButton>
				);
			}else{
				deleteButton = (
					<Tooltip
						title={ r3provider.getR3TextRes().tResRolePolicyDelTT }
						open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.deletePolicyTooltip, 'number') || (this.state.tooltips.deletePolicyTooltip != pos)) ? false : true) }
					>
						<IconButton
							onClick={ (event) => this.handlePoliciesChange(event, actionTypeDelete, pos) }
							onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.deletePolicyTooltip, pos) }
							onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.deletePolicyTooltip, -1) }
							{ ...theme.r3Role.deletePolicyButton }
							sx={ this.sxClasses.deletePolicyButton }
							size="large"
						>
							<DeleteIcon />
						</IconButton>
					</Tooltip>
				);
			}

			let	inputProps;
			if(this.props.isReadMode){
				inputProps = {};
			}else{
				inputProps = {
					sx: this.sxClasses.inputTextField
				};
			}

			return (
				<Box
					key={ pos }
					sx={ this.sxClasses.enclosureElement }
				>
					<TextField
						name={ roleComponentValues.policyTextFieldNamePrefix + String(pos) }
						disabled={ this.props.isReadMode }
						value={ item }
						placeholder={ r3provider.getR3TextRes().tResRolePolicyHint }
						onChange={ (event) => this.handlePoliciesChange(event, actionTypeValue, pos) }
						InputProps={ inputProps }
						{ ...theme.r3Role.policyTextField }
						sx={ this.sxClasses.policyTextField }
					/>
					{ deleteButton }
				</Box>
			);
		});
	}

	getAddPolicyContents()
	{
		const { theme, r3provider } = this.props;

		if(this.props.isReadMode){
			return;
		}

		return (
			<Box
				sx={ this.sxClasses.enclosureElement }
			>
				<TextField
					name={ roleComponentValues.policyNewTextFieldName }
					value={ this.state.addPolicies }
					placeholder={ r3provider.getR3TextRes().tResRolePolicyHint }
					onChange={ (event) => this.handleAddPoliciesChange(event) }
					InputProps={{ sx: this.sxClasses.inputTextField }}
					{ ...theme.r3Role.policyTextField }
					sx={ this.sxClasses.policyTextField }
				/>
				<Tooltip
					title={ r3provider.getR3TextRes().tResRolePolicyAddTT }
					open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.addPolicyTooltip, 'boolean')) ? false : this.state.tooltips.addPolicyTooltip) }
				>
					<IconButton
						onClick={ (event) => this.handlePoliciesChange(event, actionTypeAdd, 0) }
						onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.addPolicyTooltip, true) }
						onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.addPolicyTooltip, false) }
						{ ...theme.r3Role.addPolicyButton }
						sx={ this.sxClasses.addPolicyButton }
						size="large"
					>
						<AddIcon />
					</IconButton>
				</Tooltip>
			</Box>
		);
	}

	getAliasContents(items)
	{
		const { theme, r3provider } = this.props;

		if(!r3IsSafeTypedEntity(items, 'array')){
			return;
		}
		let	_items = items;

		return _items.map( (item, pos) =>
		{
			let	downButton;
			if(this.props.isReadMode || (_items.length <= (pos + 1))){
				downButton = (
					<IconButton
						disabled={ true }
						{ ...theme.r3Role.downAliasButton }
						sx={ this.sxClasses.arrowInvisibleAliasButton }
						size="large"
					>
						<DownIcon />
					</IconButton>
				);
			}else{
				downButton = (
					<Tooltip
						title={ r3provider.getR3TextRes().tResAliasDownTT }
						open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.downAliasTooltip, 'number') || (this.state.tooltips.downAliasTooltip != pos)) ? false : true) }
					>
						<IconButton
							onClick={ (event) => this.handleAliasesChange(event, actionTypeDown, pos) }
							onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.downAliasTooltip, pos) }
							onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.downAliasTooltip, -1) }
							{ ...theme.r3Role.downAliasButton }
							sx={ this.sxClasses.arrowAliasButton }
							size="large"
						>
							<DownIcon />
						</IconButton>
					</Tooltip>
				);
			}

			let	upButton;
			if(this.props.isReadMode || (0 === pos)){
				upButton = (
					<IconButton
						disabled={ true }
						{ ...theme.r3Role.upAliasButton }
						sx={ this.sxClasses.arrowInvisibleAliasButton }
						size="large"
					>
						<UpIcon />
					</IconButton>
				);
			}else{
				upButton = (
					<Tooltip
						title={ r3provider.getR3TextRes().tResAliasUpTT }
						open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.upAliasTooltip, 'number') || (this.state.tooltips.upAliasTooltip != pos)) ? false : true) }
					>
						<IconButton
							onClick={ (event) => this.handleAliasesChange(event, actionTypeUp, pos) }
							onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.upAliasTooltip, pos) }
							onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.upAliasTooltip, -1) }
							{ ...theme.r3Role.upAliasButton }
							sx={ this.sxClasses.arrowAliasButton }
							size="large"
						>
							<UpIcon />
						</IconButton>
					</Tooltip>
				);
			}

			let	deleteButton;
			if(this.props.isReadMode){
				deleteButton = (
					<IconButton
						disabled={ true }
						{ ...theme.r3Role.deleteAliasButton }
						sx={ this.sxClasses.deleteInvisibleAliasButton }
						size="large"
					>
						<DeleteIcon />
					</IconButton>
				);
			}else{
				deleteButton = (
					<Tooltip
						title={ r3provider.getR3TextRes().tResAliasDelTT }
						open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.deleteAliasTooltip, 'number') || (this.state.tooltips.deleteAliasTooltip != pos)) ? false : true) }
					>
						<IconButton
							onClick={ (event) => this.handleAliasesChange(event, actionTypeDelete, pos) }
							onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.deleteAliasTooltip, pos) }
							onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.deleteAliasTooltip, -1) }
							{ ...theme.r3Role.deleteAliasButton }
							sx={ this.sxClasses.deleteAliasButton }
							size="large"
						>
							<DeleteIcon />
						</IconButton>
					</Tooltip>
				);
			}

			let	inputProps;
			if(this.props.isReadMode){
				inputProps = {};
			}else{
				inputProps = {
					sx: this.sxClasses.inputTextField
				};
			}

			return (
				<Box
					key={ pos }
					sx={ this.sxClasses.enclosureElement }
				>
					<TextField
						name={ roleComponentValues.aliasTextFieldNamePrefix + String(pos) }
						disabled={ this.props.isReadMode }
						value={ item }
						placeholder={ r3provider.getR3TextRes().tResAliasHint }
						onChange={ (event) => this.handleAliasesChange(event, actionTypeValue, pos) }
						InputProps={ inputProps }
						{ ...theme.r3Role.aliasTextField }
						sx={ this.sxClasses.aliasTextField }
					/>
					{ downButton }
					{ upButton }
					{ deleteButton }
				</Box>
			);
		});
	}

	getAddAliasContents()
	{
		const { theme, r3provider } = this.props;

		if(this.props.isReadMode){
			return;
		}

		return (
			<Box
				sx={ this.sxClasses.enclosureElement }
			>
				<TextField
					name={ roleComponentValues.aliasNewTextFieldName }
					value={ this.state.addAliases }
					placeholder={ r3provider.getR3TextRes().tResAliasHint }
					onChange={ (event) => this.handleAddAliasesChange(event) }
					InputProps={{ sx: this.sxClasses.inputTextField }}
					{ ...theme.r3Role.aliasTextField }
					sx={ this.sxClasses.aliasTextField }
				/>
				<Tooltip
					title={ r3provider.getR3TextRes().tResAliasAddTT }
					open={ ((r3IsEmptyEntityObject(this.state, 'tooltips') || !r3IsSafeTypedEntity(this.state.tooltips.addAliasTooltip, 'boolean')) ? false : this.state.tooltips.addAliasTooltip) }
				>
					<IconButton
						onClick={ (event) => this.handleAliasesChange(event, actionTypeAdd, 0) }
						onMouseEnter={ event => this.handTooltipChange(event, tooltipValues.addAliasTooltip, true) }
						onMouseLeave={ event => this.handTooltipChange(event, tooltipValues.addAliasTooltip, false) }
						{ ...theme.r3Role.addAliasButton }
						sx={ this.sxClasses.addAliasButton }
						size="large"
					>
						<AddIcon />
					</IconButton>
				</Tooltip>
			</Box>
		);
	}

	render()
	{
		console.info('CALL : role:render()');

		const { theme, r3provider } = this.props;

		return (
			<Box
				sx={ this.sxClasses.root }
			>
				<Typography
					{ ...theme.r3Role.subTitle }
					sx={ this.sxClasses.subTitleTop }
				>
					{ r3provider.getR3TextRes().tResRoleHostnamesSubTitle }
				</Typography>
				<Typography
					{ ...theme.r3Role.hostnameSubTitle }
					sx={ this.sxClasses.hostnameSubTitle }
				>
					{ r3provider.getR3TextRes().tResRoleHostnameLabel }
				</Typography>
				<Typography
					{ ...theme.r3Role.hostnameAUXSubTitle }
					sx={ this.sxClasses.hostnameAUXSubTitle }
				>
					{ r3provider.getR3TextRes().tResRoleAUXLabel }
				</Typography>
				{ this.getHostnameContents() }
				{ this.getAddHostnameContents() }

				<Typography
					{ ...theme.r3Role.subTitle }
					sx={ this.sxClasses.subTitle }
				>
					{ r3provider.getR3TextRes().tResRoleIpsSubTitle }
				</Typography>
				<Typography
					{ ...theme.r3Role.ipSubTitle }
					sx={ this.sxClasses.ipSubTitle }
				>
					{ r3provider.getR3TextRes().tResRoleIpLabel }
				</Typography>
				<Typography
					{ ...theme.r3Role.ipAUXSubTitle }
					sx={ this.sxClasses.ipAUXSubTitle }
				>
					{ r3provider.getR3TextRes().tResRoleAUXLabel }
				</Typography>
				{ this.getIpAddressContents() }

				<Typography
					{ ...theme.r3Role.subTitle }
					sx={ this.sxClasses.subTitle }
				>
					{ r3provider.getR3TextRes().tResRolePoliciesSubTitle }
				</Typography>
				{ this.getPolicyContents(this.state.role.policies) }
				{ this.getAddPolicyContents() }

				<Typography
					{ ...theme.r3Role.subTitle }
					sx={ this.sxClasses.subTitle }
				>
					{ r3provider.getR3TextRes().tResAliasSubTitle }
				</Typography>
				{ this.getAliasContents(this.state.role.aliases) }
				{ this.getAddAliasContents() }

				<R3FormButtons
					theme={ theme }
					r3provider={ this.props.r3provider }
					status={ this.state.changed }
					onSave={ this.handleSave }
					onCancel={ this.handleCancel }
				/>

				<R3PopupMsgDialog
					theme={ theme }
					r3provider={ this.props.r3provider }
					title={ this.props.r3provider.getR3TextRes().cUpdatingTitle }
					r3Message={ this.state.confirmMessageObject }
					twoButton={ true }
					onClose={ this.handleConfirmDialogClose }
				/>
				<R3PopupMsgDialog
					theme={ theme }
					r3provider={ this.props.r3provider }
					r3Message={ this.state.messageDialogObject }
					onClose={ this.handleMessageDialogClose }
				/>
			</Box>
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
