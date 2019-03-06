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
 * CREATE:   Tue Aug 22 2017
 * REVISION:
 *
 */

import React			from 'react';
import ReactDOM			from 'react-dom';									// eslint-disable-line no-unused-vars
import PropTypes		from 'prop-types';

import TextField		from 'material-ui/TextField';
import FontIcon			from 'material-ui/FontIcon';
import IconButton		from 'material-ui/IconButton';

import R3FormButtons	from './r3formbuttons';								// Buttons
import R3Message		from '../util/r3message';
import R3PopupMsgDialog	from './r3popupmsgdialog';
import { regYrnAnyPolicyPath, regYrnAnyRolePath }	from '../util/r3define';
import { r3DeepClone, r3DeepCompare, parseCombineHostObject, getCombineHostObject, r3IsEmptyString, r3IsEmptyEntity, r3IsEmptyEntityObject, r3IsEmptyStringObject, parseKVString } from '../util/r3util';
import { errorType, actionTypeValue, actionTypeDelete, actionTypeAdd, actionTypeUp, actionTypeDown, actionTypeHostName, actionTypeHostAuxiliary } from '../util/r3types';

//
// Role Contents Class
//
export default class R3Role extends React.Component
{
	constructor(props)
	{
		super(props);

		// Initalize Sate
		this.state						= this.createState(this.props.role);

		// Binding
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
	}

	componentWillReceiveProps(nextProps)
	{
		// update State
		this.setState(this.createState(nextProps.role));
	}

	createState(role)
	{
		let	localHostnames	= [];
		let	localIps		= [];
		let	oneHost;
		let	standars;
		let	cnt;
		if(!r3IsEmptyEntityObject(role, 'hosts') && !r3IsEmptyEntityObject(role.hosts, 'hostnames')){
			standars		= [];
			for(cnt = 0; cnt < role.hosts.hostnames.length; ++cnt){
				oneHost		= parseCombineHostObject(role.hosts.hostnames[cnt]);
				standars.push(oneHost);
			}
			localHostnames	= this.convertStandardToLocal(standars);
		}
		if(!r3IsEmptyEntityObject(role, 'hosts') && !r3IsEmptyEntityObject(role.hosts, 'ips')){
			standars		= [];
			for(cnt = 0; cnt < role.hosts.ips.length; ++cnt){
				oneHost		= parseCombineHostObject(role.hosts.ips[cnt]);
				standars.push(oneHost);
			}
			localIps		= this.convertStandardToLocal(standars);
		}
		return {
			role:					r3DeepClone(role),
			localHostnames:			localHostnames,
			localIps:				localIps,
			addHostName:			'',
			addAuxiliary:			'',
			addPolicies:			'',
			addAliases:				'',
			changed:				false,
			confirmMessageObject:	null,
			messageDialogObject:	null
		};
	}

	//
	// Utility for hostnames/ips
	//
	convertStandardToLocal(standards)
	{
		let	result = [];
		if(r3IsEmptyEntity(standards) || !(standards instanceof Array)){
			return result;
		}
		for(let cnt = 0; cnt < standards.length; ++cnt){
			let	local = this.convertOneStandardToLocal(standards[cnt]);
			result.push(local);
		}
		return result;
	}

	convertOneStandardToLocal(standard)
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
		if(!r3IsEmptyEntityObject(standard, 'port') && ('string' === typeof standard.port || 'number' === typeof standard.port)){
			if('string' === typeof standard.port){
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
		}else{
			let	tmpstr	= local.auxiliary;

			// PORT
			let	parsed	= parseKVString(tmpstr, 'PORT');
			if(!r3IsEmptyEntity(parsed.value)){
				if('string' === typeof parsed.value && '' !== parsed.value){
					if(!isNaN(parsed.value.trim())){
						result.port	= parseInt(parsed.value.trim());
					}else if('*' === parsed.value.trim()){
						result.port	= 0;
					}else{
						result.port	= -1;				// wrong string...
					}
				}else if('number' === typeof parsed.value){
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
		}
		return result;
	}

	checkStandardHostObject(standard)
	{
		if(r3IsEmptyStringObject(standard, 'hostname') || r3IsEmptyString(standard.hostname, true)){
			return false;
		}
		if(r3IsEmptyEntityObject(standard, 'port') || isNaN(standard.port) || 'number' !== typeof standard.port || standard.port < 0 || 65535 < standard.port){
			return false;
		}
		if(!r3IsEmptyStringObject(standard, 'cuk') && -1 !== standard.cuk.indexOf(' ')){
			return false;
		}
		if(!r3IsEmptyStringObject(standard, 'extra') && -1 !== standard.extra.indexOf(' ')){
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
			local	= this.convertOneStandardToLocal(oneHost);
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

				combineObject = getCombineHostObject(oneHost.hostname, oneHost.port, oneHost.cuk, oneHost.extra);
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

				combineObject = getCombineHostObject(oneIp.hostname, oneIp.port, oneIp.cuk, oneIp.extra);
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
	handleConfirmDialogClose(event, result)									// eslint-disable-line no-unused-vars
	{
		if(result){
			// case for 'cancel updating' to do
			this.props.onUpdate(false);

			// rewind State
			this.setState(this.createState(this.props.role));
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
	handleMessageDialogClose(event, result)									// eslint-disable-line no-unused-vars
	{
		this.setState({
			messageDialogObject:	null
		});
	}

	//
	// Handle Hostname and port : Change
	//
	handleHostsChange(event, type, pos, combineHostObject, changedValue)							// eslint-disable-line no-unused-vars
	{
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
			newHosts[pos].host		= changedValue;													// set hostname

		}else if(actionTypeHostAuxiliary === type){
			//
			// change auxiliary
			//
			if(newHosts.length <= pos){
				console.warn('unknown pos(' + JSON.stringify(pos) + ') for hostnames array.');
				return;
			}
			newHosts[pos].auxiliary	= changedValue;													// set auxiliary

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
	handleAddHostsChange(event, type, changedValue)									// eslint-disable-line no-unused-vars
	{
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
	handlePoliciesChange(event, type, pos, changedValue)							// eslint-disable-line no-unused-vars
	{
		let	newPolicies = [];
		if(undefined !== this.state.role.policies && null !== this.state.role.policies && this.state.role.policies instanceof Array){
			newPolicies = r3DeepClone(this.state.role.policies);
		}

		let	isClearNewValue	= false;
		if(actionTypeValue === type){
			if(undefined === pos || null === pos || isNaN(pos) || pos < 0 || newPolicies.length <= pos){
				console.warn('unknown position(' + JSON.stringify(pos) + ') for policies.');
				return;
			}
			newPolicies[pos] = changedValue.trim();

		}else if(actionTypeDelete === type){
			if(undefined === pos || null === pos || isNaN(pos) || pos < 0 || newPolicies.length <= pos){
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
	handleAddPoliciesChange(event, changedValue)								// eslint-disable-line no-unused-vars
	{
		// update state
		this.setState({
			addPolicies:		changedValue
		});
	}

	//
	// Handle Policy Aliases : Change
	//
	handleAliasesChange(event, type, pos, changedValue)							// eslint-disable-line no-unused-vars
	{
		let	isClearNewAlias	= false;
		let	newAliases		= [];
		if(undefined !== this.state.role.aliases && null !== this.state.role.aliases && this.state.role.aliases instanceof Array){
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
	handleAddAliasesChange(event, changedValue)									// eslint-disable-line no-unused-vars
	{
		// update state
		this.setState({
			addAliases:		changedValue
		});
	}

	getHostnameContents()
	{
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
			if(!this.props.isReadMode){
				deleteButton = (
					<IconButton
						iconStyle={ this.context.muiTheme.r3Contents.iconButtonColor }
						tooltip={ 'Delete' }
						style={ this.context.muiTheme.r3Contents.iconButtonStyle }
						onClick={ (event) => this.handleHostsChange(event, actionTypeDelete, pos, null, null) }
					>
						<FontIcon className={ this.context.muiTheme.r3IconFonts.deleteIconFont } />
					</IconButton>
				);
			}

			elementArray.push(
				<div className={ 'clearof' } key={ pos }>
					<TextField
						name={ 'name_' + String(pos) }
						value={ dispName }
						disabled={ this.props.isReadMode }
						style={ this.context.muiTheme.r3Contents.firstInTwoTextFieldStyle }
						onChange={ (event, value) => this.handleHostsChange(event, actionTypeHostName, pos, oneHostObj.host, value) }
					/>
					<TextField
						name={ 'auxiliary_' + String(pos) }
						value={ axiliary }
						disabled={ this.props.isReadMode }
						style={ this.context.muiTheme.r3Contents.secondInTwoTextFieldStyle }
						onChange={ (event, value) => this.handleHostsChange(event, actionTypeHostAuxiliary, pos, oneHostObj.auxiliary, value) }
					/>
					{ deleteButton }
				</div>
			);
		});

		return (
			elementArray.map( (item, pos) => {								// eslint-disable-line no-unused-vars
				return item;
			})
		);
	}

	getIpAddressContents()
	{
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
			if(!this.props.isReadMode){
				deleteButton = (
					<IconButton
						iconStyle={ this.context.muiTheme.r3Contents.iconButtonColor }
						tooltip={ 'Delete' }
						style={ this.context.muiTheme.r3Contents.iconButtonStyle }
						onClick={ (event) => this.handleIpsChange(event, pos) }
					>
						<FontIcon className={ this.context.muiTheme.r3IconFonts.deleteIconFont } />
					</IconButton>
				);
			}

			// [TODO]
			// may use Divider instead of div tag
			//
			elementArray.push(
				<div className={ 'clearof' } key={ pos } style={ this.context.muiTheme.r3Contents.wrapperDivStyle }>
					<div style={ this.context.muiTheme.r3Contents.firstInTwoTextStyle } >
						<span>{ ip }</span>
					</div>
					<div style={ this.context.muiTheme.r3Contents.secondInTwoTextStyle } >
						<span>{ axiliary }</span>
					</div>
					{ deleteButton }
				</div>
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
		if(undefined === items || !(items instanceof Array)){
			return;
		}

		return (
			items.map( (item, pos) =>
			{
				let	deleteButton;
				if(!this.props.isReadMode){
					deleteButton = (
						<IconButton
							iconStyle={ this.context.muiTheme.r3Contents.iconButtonColor }
							tooltip={ 'Delete' }
							style={ this.context.muiTheme.r3Contents.iconButtonStyle }
							onClick={ (event) => this.handlePoliciesChange(event, actionTypeDelete, pos, null) }
						>
							<FontIcon className={ this.context.muiTheme.r3IconFonts.deleteIconFont } />
						</IconButton>
					);
				}

				return (
					<div className={ 'clearof' } key={ pos }>
						<TextField
							name={ 'policy_' + String(pos) }
							value={ item }
							disabled={ this.props.isReadMode }
							style={ this.context.muiTheme.r3Contents.policyTextFieldStyle }
							onChange={ (event, value) => this.handlePoliciesChange(event, actionTypeValue, pos, value) }
						/>
						{ deleteButton }
					</div>
				);
			})
		);
	}

	getAliasContents(items)
	{
		if(undefined === items || !(items instanceof Array)){
			return;
		}

		return (
			items.map( (item, pos) =>
			{
				let	downButton;
				let	upButton;
				let	deleteButton;
				if(this.props.isReadMode || items.length <= (pos + 1)){
					downButton = (
						<div style={ this.context.muiTheme.r3Contents.dummyButtonStyle } ></div>
					);
				}else{
					downButton = (
						<IconButton
							iconStyle={ this.context.muiTheme.r3Contents.iconButtonColor }
							tooltip={ 'Down' }
							disabled={ false }
							style={ this.context.muiTheme.r3Contents.iconButtonStyle }
							onClick={ (event) => this.handleAliasesChange(event, actionTypeDown, pos, null) }
						>
							<FontIcon className={ this.context.muiTheme.r3IconFonts.downIconFont } />
						</IconButton>
					);
				}
				if(this.props.isReadMode || 0 === pos){
					upButton = (
						<div style={ this.context.muiTheme.r3Contents.dummyButtonStyle } ></div>
					);
				}else{
					upButton = (
						<IconButton
							iconStyle={ this.context.muiTheme.r3Contents.iconButtonColor }
							tooltip={ 'Up' }
							disabled={ false }
							style={ this.context.muiTheme.r3Contents.iconButtonStyle }
							onClick={ (event) => this.handleAliasesChange(event, actionTypeUp, pos, null) }
						>
							<FontIcon className={ this.context.muiTheme.r3IconFonts.upIconFont } />
						</IconButton>
					);
				}
				if(!this.props.isReadMode){
					deleteButton = (
						<IconButton
							iconStyle={ this.context.muiTheme.r3Contents.iconButtonColor }
							tooltip={ 'Delete' }
							style={ this.context.muiTheme.r3Contents.iconButtonStyle }
							onClick={ (event) => this.handleAliasesChange(event, actionTypeDelete, pos, null) }
						>
							<FontIcon
								className={ this.context.muiTheme.r3IconFonts.deleteIconFont }
								style={ this.context.muiTheme.r3IconFonts.fontIconMiddle }
							/>
						</IconButton>
					);
				}

				return (
					<div className={ 'clearof' } key={ pos }>
						<TextField
							name={ 'alias_' + String(pos) }
							value={ item }
							disabled={ this.props.isReadMode }
							style={ this.context.muiTheme.r3Contents.aliasesTextFieldStyle }
							onChange={ (event, value) => this.handleAliasesChange(event, actionTypeValue, pos, value) }
						/>
						{ downButton }
						{ upButton }
						{ deleteButton }
					</div>
				);
			})
		);
	}

	render()
	{
		let	hostnameAddFields;
		let	policiesAddFields;
		let	aliasesAddFields;
		if(!this.props.isReadMode){
			hostnameAddFields = (
				<div className={ 'clearof' }>
					<TextField
						name={ 'name_new' }
						hintText={ 'Hostname' }
						value={ this.state.addHostName }
						style={ this.context.muiTheme.r3Contents.firstInTwoTextFieldStyle }
						onChange={ (event, value) => this.handleAddHostsChange(event, actionTypeHostName, value) }
					/>
					<TextField
						name={ 'aux_new' }
						hintText={ 'Additional auxiliary' }
						value={ this.state.addAuxiliary }
						style={ this.context.muiTheme.r3Contents.secondInTwoTextFieldStyle }
						onChange={ (event, value) => this.handleAddHostsChange(event, actionTypeHostAuxiliary, value) }
					/>
					<IconButton
						iconStyle={ this.context.muiTheme.r3Contents.iconButtonColor }
						tooltip={ 'Add' }
						style={ this.context.muiTheme.r3Contents.iconButtonStyle }
						onClick={ (event) => this.handleHostsChange(event, actionTypeAdd, 0, null, null) }
					>
						<FontIcon
							className={ this.context.muiTheme.r3IconFonts.addIconFont }
						/>
					</IconButton>
				</div>
			);

			policiesAddFields = (
				<div className={ 'clearof' }>
					<TextField
						name={ 'policy_new' }
						hintText={ 'Path' }
						value={ this.state.addPolicies }
						style={ this.context.muiTheme.r3Contents.policyTextFieldStyle }
						onChange={ (event, value) => this.handleAddPoliciesChange(event, value) }
					/>
					<IconButton
						iconStyle={ this.context.muiTheme.r3Contents.iconButtonColor }
						tooltip={ 'Add' }
						style={ this.context.muiTheme.r3Contents.iconButtonStyle }
						onClick={ (event) => this.handlePoliciesChange(event, actionTypeAdd, 0, null) }
					>
						<FontIcon
							className={ this.context.muiTheme.r3IconFonts.addIconFont }
						/>
					</IconButton>
				</div>
			);

			aliasesAddFields = (
				<div className={ 'clearof' }>
					<TextField
						name={ 'alias_new' }
						hintText={ 'Path' }
						value={ this.state.addAliases }
						style={ this.context.muiTheme.r3Contents.aliasesTextFieldStyle }
						onChange={ (event, value) => this.handleAddAliasesChange(event, value) }
					/>
					<IconButton
						iconStyle={ this.context.muiTheme.r3Contents.iconButtonColor }
						tooltip={ 'Add' }
						style={ this.context.muiTheme.r3Contents.iconButtonStyle }
						onClick={ (event) => this.handleAliasesChange(event, actionTypeAdd, 0, null) }
					>
						<FontIcon
							className={ this.context.muiTheme.r3IconFonts.addIconFont }
							style={ this.context.muiTheme.r3FontMiddle }
						/>
					</IconButton>
				</div>
			);
		}

		return (
			<div style={{ width: '100%' }} >
				<div>
					<div style={ this.context.muiTheme.r3Contents.componentSpacer }>
						<span style={ this.context.muiTheme.r3Contents.labelStyle } >HOST NAMES</span>
					</div>
					<div style={ this.context.muiTheme.r3Contents.subcomponent } >
						<div style={{ overflow:	'auto' }}>
							<div style={ this.context.muiTheme.r3Contents.firstInTwoLabelStyle } >
								<span>HOST NAME</span>
							</div>
							<div style={ this.context.muiTheme.r3Contents.secondInTwoLabelStyle } >
								<span>AUX</span>
							</div>
						</div>
						{ this.getHostnameContents() }
						{ hostnameAddFields }
					</div>

					<div style={ this.context.muiTheme.r3Contents.componentSpacer }>
						<span style={ this.context.muiTheme.r3Contents.labelStyle } >IP ADDRESSES</span>
					</div>
					<div style={ this.context.muiTheme.r3Contents.subcomponent } >
						<div style={{ overflow:	'auto' }}>
							<div style={ this.context.muiTheme.r3Contents.firstInTwoLabelStyle } >
								<span>IP ADDRESS</span>
							</div>
							<div style={ this.context.muiTheme.r3Contents.secondInTwoLabelStyle } >
								<span>AUX</span>
							</div>
						</div>
						{ this.getIpAddressContents() }
					</div>

					<div style={ this.context.muiTheme.r3Contents.componentSpacer }>
						<span style={ this.context.muiTheme.r3Contents.labelStyle } >POLICIES</span>
					</div>
					<div style={ this.context.muiTheme.r3Contents.subcomponent } >
						{ this.getPolicyContents(this.state.role.policies) }
						{ policiesAddFields }
					</div>

					<div style={ this.context.muiTheme.r3Contents.componentSpacer }>
						<span style={ this.context.muiTheme.r3Contents.labelStyle } >ALIAS</span>
					</div>
					<div style={ this.context.muiTheme.r3Contents.subcomponent } >
						{ this.getAliasContents(this.state.role.aliases) }
						{ aliasesAddFields }
					</div>
				</div>
				<div style={ this.context.muiTheme.r3Contents.componentSpacer }>
					<R3FormButtons
						status={ this.state.changed }
						onSave={ this.handleSave }
						onCancel={ this.handleCancel }
					/>
				</div>
				<R3PopupMsgDialog
					title={ this.props.r3provider.getR3TextRes().cUpdatingTitle }
					r3Message={ this.state.confirmMessageObject }
					twoButton={ true }
					onClose={ this.handleConfirmDialogClose }
				/>
				<R3PopupMsgDialog
					r3Message={ this.state.messageDialogObject }
					onClose={ this.handleMessageDialogClose }
				/>
			</div>
		);
	}
}

R3Role.contextTypes = {
	muiTheme:	PropTypes.object.isRequired,
	r3Context:	PropTypes.object.isRequired
};

R3Role.propTypes = {
	r3provider:	PropTypes.object.isRequired,
	role:		PropTypes.object.isRequired,
	isReadMode:	PropTypes.bool,

	onSave:		PropTypes.func.isRequired,
	onUpdate:	PropTypes.func.isRequired
};

R3Role.defaultProps = {
	isReadMode:	false
};

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
