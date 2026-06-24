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
 * CREATE:   Thu Sep 7 2017
 * REVISION:
 *
 */

import express		from 'express';
import morgan		from 'morgan';
import path			from 'path';
import rawConfig	from 'config';
import { Console }	from 'console';
import { createStream, RotatingFileStream, Options as logrotateOptions }	from 'rotating-file-stream';
import { CRCObject, valTypeAllObject, checkMakeDir, getSafeString, isCRCObject, isSafeObject, isSafeBoolean, isSafeNumber, isSafeEntity, isSafeString, ValidatorModule, AppMenuItem, ExtRouterInfo, OIDCRouterInfo, ExtRouterInfos, deepClone, isSafeHaskey, isValidatorModule, isExtRouterInfos, isExtRouterInfo, isOIDCRouterInfo, isAppMenuItemArray }	from './libr3util';

//
// Types
//
type ConfigData = {
	scheme: 			string;								// This nodejs server scheme
	port:				number | string;					// This nodejs server port
	multiproc:			boolean;							// Run multi processes mode
	runuser:			string;								// User for process owner
	privatekey:			string;								// Private key path for https
	cert:				string;								// Certification file path for https
	ca:					string;								// CA path for https
	logdir:				string | null;						// Path for logging directory
	fixedlogdir:		string | null;						// Fixed log directory
	accesslogname:		string;								// Access log name
	accesslogform:		string;								// Access log format by morgan
	consolelogname:		string | null;						// Console(Error) log name

	logrotateopt: 		logrotateOptions;					// rotating-file-stream option object

	apihost:			string;								// API host
	apischeme:			string;								// API scheme
	apiport:			number;								// API port

	userdata:			string;								// User Data Script for OpenStack
	secretyaml:			string;								// Secret Yaml for kubernetes
	sidecaryaml:		string;								// Sidecar Yaml for kubernetes
	crcobj:				CRCObject;							// Custom Registration Codes(CRC) object
	appmenu:			AppMenuItem[] | null;				// The menu array for application
	validator:			string;								// Validator object module
	validobj:			ValidatorModule | null;				// Generated(required) validator object module
	rejectUnauthorized:	boolean;							// reject mode
	uselocaltenant:		boolean;							// Use Local Tenant
	lang:				string;								// Language for javascript application
	extrouter:			ExtRouterInfos;						// Configuration of Router module to be expanded(ex. { 'routername': ExtRouterInfo[], ... })
};

//
// Variables
//
const config: valTypeAllObject	= (isSafeObject(rawConfig) ? rawConfig : {});

//
// Normalize a port into a number, string.
//
const normalizePort = (val: unknown): number | string | null =>
{
	if(isSafeString(val)){
		const _port = parseInt(val, 10);
		if(isNaN(_port)){
			// named pipe
			return val;
		}
	}else if(isSafeNumber(val)){
		if(0 <= val){
			// port number
			return val;
		}
	}
	return null;
};

//---------------------------------------------------------
// load configuration for API
//---------------------------------------------------------
const loadedConfig: ConfigData = (() =>
{
	const data: ConfigData = {
		scheme: 			'http',						// This nodejs server scheme
		port:				80,							// This nodejs server port
		multiproc:			true,						// Run multi processes mode
		runuser:			'',							// User for process owner
		privatekey:			'',							// Private key path for https
		cert:				'',							// Certification file path for https
		ca:					'',							// CA path for https
		logdir:				null,						// Path for logging directory
		fixedlogdir:		null,						// Fixed log directory
		accesslogname:		'access.log',				// Access log name
		accesslogform:		'combined',					// Access log format by morgan
		consolelogname:		null,						// Console(Error) log name

		logrotateopt: 		{							// rotating-file-stream option object
			compress:			'gzip',					// gzip		: compression method of rotated files.
			interval:			'6h',					// 6 hour	: the time interval to rotate the file.
			initialRotation:	true,					// true		: initial rotation based on not-rotated file timestamp.
			path:				null					// null		: the base path for files.(* this value is replace by 'logdir')
		},

		apihost:			'localhost',				// API host
		apischeme:			'http',						// API scheme
		apiport:			3001,						// API port

		userdata:			'',							// User Data Script for OpenStack
		secretyaml:			'',							// Secret Yaml for kubernetes
		sidecaryaml:		'',							// Sidecar Yaml for kubernetes
		crcobj:				{},							// Custom Registration Codes(CRC) object
		appmenu:			null,						// The menu array for application
		validator:			'userValidateCredential',	// Validator object module
		validobj:			null,						// Generated(required) validator object module
		rejectUnauthorized:	true,						// reject mode
		uselocaltenant:		true,						// Use Local Tenant
		lang:				'en',						// Language for javascript application
		extrouter:			{}							// Configuration of Router module to be expanded(ex. { 'routername': ExtRouterInfo[], ... })
	};

	if(isSafeObject(config)){
		// scheme & port
		if(isSafeString(config?.scheme)){
			data.scheme		= getSafeString(config.scheme);
			if('https' === data.scheme.toLowerCase()){
				data.port	= 443;
			}
		}
		if(isSafeEntity(config?.port)){
			const	tmp = normalizePort(config.port);
			if(isSafeString(tmp) || isSafeNumber(tmp)){
				data.port	= tmp;
			}
		}else if(isSafeObject(process?.env) && isSafeString(process.env?.PORT)){	// Get port from environment
			const	tmp = normalizePort(process.env.PORT);
			if(isSafeString(tmp) || isSafeNumber(tmp)){
				data.port	= tmp;
			}
		}

		// private key & cert & ca
		if(isSafeString(config?.privatekey) || null === config.privatekey){
			data.privatekey	= getSafeString(config.privatekey);
		}
		if(isSafeString(config?.cert) || null === config.cert){
			data.cert		= getSafeString(config.cert);
		}
		if(isSafeString(config?.ca) || null === config.ca){
			data.ca			= getSafeString(config.ca);
		}

		// multi processes
		if(isSafeBoolean(config?.multiproc)){
			data.multiproc	= config.multiproc;
		}

		// run user
		if(isSafeString(config?.runuser) || null === config.runuser){
			data.runuser	= getSafeString(config.runuser);
		}

		// log directory
		if(isSafeString(config?.logdir) || null === config.logdir){
			data.logdir		= getSafeString(config.logdir);
		}

		// access log file name
		if(isSafeString(config?.accesslogname) || null === config.accesslogname){
			data.accesslogname	= getSafeString(config.accesslogname);
		}

		// access log format
		if(isSafeString(config?.accesslogform)){
			data.accesslogform	= getSafeString(config.accesslogform);
		}

		// console(error) log file name
		if(isSafeString(config?.consolelogname) || null === config.consolelogname){
			data.consolelogname	= getSafeString(config.consolelogname);
		}

		// log rotation option
		if(isSafeObject(config?.logrotateopt)){
			if(isSafeObject(data?.logrotateopt)){
				const configLogRotateOpt = config.logrotateopt;
				const targetLogRotateOpt = data.logrotateopt;

				Object.keys(targetLogRotateOpt).forEach((key) => {
					if(isSafeEntity(configLogRotateOpt[key])){
						targetLogRotateOpt[key] = configLogRotateOpt[key];
					}
				});
			}
		}

		// api host & scheme & port
		if(isSafeString(config?.apihost)){
			data.apihost	= getSafeString(config.apihost);
		}
		if(isSafeString(config?.apischeme)){
			data.apischeme	= getSafeString(config.apischeme);
			if('https' === data.apischeme.toLowerCase()){
				data.apiport= 443;
			}
		}
		if(isSafeEntity(config?.apiport)){
			const tmpport = parseInt(String(config.apiport), 10);
			if(!isNaN(tmpport)){
				data.apiport = tmpport;
			}
		}

		// User Date Script
		if(isSafeString(config?.userdata)){
			data.userdata	= getSafeString(config.userdata);
		}

		// Secret Yaml
		if(isSafeString(config?.secretyaml)){
			data.secretyaml	= getSafeString(config.secretyaml);
		}

		// Sidecar Yaml
		if(isSafeString(config?.sidecaryaml)){
			data.sidecaryaml= getSafeString(config.sidecaryaml);
		}

		// Custom Configuration Codes(CRC) object
		if(isCRCObject(config?.crcobj)){
			data.crcobj		= deepClone(config.crcobj);
		}

		// App menu
		if(isAppMenuItemArray(config?.appmenu)){
			data.appmenu	= config.appmenu;
		}

		// Validator
		if(isSafeString(config?.validator)){
			data.validator	= getSafeString(config.validator);
		}

		// Validator Module
		try{
			const	_validmod	= require('./' + data.validator);
			if(isValidatorModule(_validmod)){
				data.validobj	= _validmod;
			}else{
				console.error('invalid validator module:' + data.validator);
				data.validobj = null;
			}
		}catch(_error){
			// not found file
			console.error('failed to load varidator module:' + data.validator);
			data.validobj = null;
		}

		// Reject mode at unauth
		if((isSafeBoolean(config?.rejectunauth) && !config.rejectunauth) || (process.env.NODE_ENV !== 'production')){
			data.rejectUnauthorized	= false;
		}

		// Use Local Tenant
		if(isSafeBoolean(config?.uselocaltenant)){
			data.uselocaltenant = config.uselocaltenant;
		}

		// Lang
		if(isSafeString(config?.lang)){
			data.lang		= getSafeString(config.lang).toLowerCase();
		}

		// Extension Router
		if(isSafeObject(config?.extrouter)){
			if(isExtRouterInfos(config.extrouter)){
				data.extrouter = deepClone(config.extrouter);
			}else{
				console.error('something wrong extrouter value in configration. then skip this value to load.');
			}
		}
	}
	return data;
})();

//---------------------------------------------------------
// Configuration Class
//---------------------------------------------------------
export default class R3AppConfig
{
	private loadedConfig:	ConfigData;
	private consolelog:		Console | null;

	//
	// Constructor
	//
	constructor()
	{
		this.loadedConfig	= loadedConfig;
		this.consolelog		= null;
	}

	//
	// Methods
	//
	getScheme = (): string =>
	{
		return this.loadedConfig.scheme;
	};

	getPort = (): number | string =>
	{
		return this.loadedConfig.port;
	};

	isMultiProc = (): boolean =>
	{
		return this.loadedConfig.multiproc;
	};

	getRunUser = (): string =>
	{
		return this.loadedConfig.runuser;
	};

	getPrivateKey = (): string =>
	{
		return this.loadedConfig.privatekey;
	};

	getCert = (): string =>
	{
		return this.loadedConfig.cert;
	};

	getCA = (): string =>
	{
		return this.loadedConfig.ca;
	};

	updateLogDir = (basepath: string | null): string | null =>
	{
		let	dirpath: string | null = null;
		if(null !== this.loadedConfig.logdir){
			if(0 === this.loadedConfig.logdir.indexOf('/')){
				// logdir is full path
				dirpath = path.join(this.loadedConfig.logdir);
			}else{
				if(isSafeString(basepath)){
					if(0 === basepath.indexOf('/')){
						dirpath = path.join(basepath, this.loadedConfig.logdir);
					}else{
						// from top directory
						dirpath = path.join(__dirname, '../../..', basepath, this.loadedConfig.logdir);
					}
				}else{
					// from top directory
					dirpath = path.join(__dirname, '../../..', this.loadedConfig.logdir);
				}
			}
		}else{
			// logdir is null, it means not putting log to file.
		}

		// update log directory
		this.loadedConfig.fixedlogdir = dirpath;
		if(isSafeString(dirpath)){
			// check log directory and make it if not exists
			if(null !== dirpath && !checkMakeDir(dirpath)){
				console.warn('Log directory(' + dirpath + ') is not existed, and could not create it.');
				dirpath = null;		// continue with no log directory
			}else{
				// set dir path to log rotation option
				this.loadedConfig.logrotateopt.path = dirpath;
			}
		}
		return dirpath;
	};

	getAccessLogName = (): string =>
	{
		return this.loadedConfig.accesslogname;
	};

	getAccessLogFormat = (): string =>
	{
		return this.loadedConfig.accesslogform;
	};

	getConsoleLogName = (): string | null =>
	{
		return this.loadedConfig.consolelogname;
	};

	getLogRotateOption = (): logrotateOptions =>
	{
		return this.loadedConfig.logrotateopt;
	};

	getRotateLogStream = (basedir: string | null, filename: string): RotatingFileStream | null =>
	{
		let logstream: RotatingFileStream | null	= null;
		let	logdir: string | null					= this.updateLogDir(basedir);

		if(null === logdir){
			return logstream;
		}
		if(!isSafeString(filename)){
			return logstream;
		}
		try{
			logstream = createStream(filename, this.loadedConfig.logrotateopt);
		}catch(error: unknown){
			console.warn('Could not create log rotate option by : ' + JSON.stringify((isSafeObject(error) && isSafeString(error?.message)) ? error.message : 'unknown'));
			logstream = null;
		}
		return logstream;
	};

	getMorganLoggerOption = (basedir: string | null): morgan.Options<express.Request, express.Response> | null =>
	{
		let logstream = this.getRotateLogStream(basedir, this.loadedConfig.accesslogname);
		if(null !== logstream){
			const loggeropt: morgan.Options<express.Request, express.Response> = { stream: logstream };
			return loggeropt;
		}
		return null;
	};

	setConsoleLogging = (basedir: string | null): boolean =>
	{
		let	logstream = this.getRotateLogStream(basedir, this.loadedConfig.consolelogname);
		if(null !== logstream){
			this.consolelog		= new console.Console(logstream, logstream);
			global.console.error= this.consolelog.error;
			global.console.warn	= this.consolelog.warn;
			global.console.log	= this.consolelog.log;
			global.console.debug= this.consolelog.debug;
			global.console.info	= this.consolelog.info;
		}
		return true;
	};

	getApiHost = (): string =>
	{
		return this.loadedConfig.apihost;
	};

	getApiScheme = (): string =>
	{
		return this.loadedConfig.apischeme;
	};

	getApiPort = (): number =>
	{
		return this.loadedConfig.apiport;
	};

	getUserData = (): string =>
	{
		return this.loadedConfig.userdata;
	};

	getSecretYaml = (): string =>
	{
		return this.loadedConfig.secretyaml;
	};

	getSidecarYaml = (): string =>
	{
		// make k2hr3-k8s-init.sh parameters which is built from configuration.
		//
		const	params	= '-host ' + this.loadedConfig.apihost + ' -port ' + String(this.loadedConfig.apiport) + ' -schema ' + this.loadedConfig.apischeme;

		// repace '{{= %K2HR3_REST_API_HOST% }}' in sidecaryaml
		//
		// replace keyword in template
		const	replace	= this.loadedConfig.sidecaryaml.replace(/{{= %K2HR3_REST_API_HOST% }}/g, params);

		return replace;
	};

	getCRCObject = (): CRCObject =>
	{
		return this.loadedConfig.crcobj;
	};

	getAppMenu = (): AppMenuItem[] | null =>
	{
		return this.loadedConfig.appmenu;
	};

	getUserValidator = (): string =>
	{
		return this.loadedConfig.validator;
	};

	getUserValidatorObj = (): ValidatorModule | null =>
	{
		return this.loadedConfig.validobj;
	};

	getRejectUnauthorized = (): boolean =>
	{
		return this.loadedConfig.rejectUnauthorized;
	};

	useLocalTenant = (): boolean =>
	{
		return this.loadedConfig.uselocaltenant;
	};

	getLang = (): string =>
	{
		return this.loadedConfig.lang;
	};

	getExtRouters = (routername?: string | null): ExtRouterInfos =>
	{
		return this.loadedConfig.extrouter;
	};

	getExtRouter = (routername: string): ExtRouterInfo | OIDCRouterInfo | null =>
	{
		if(!isSafeString(routername)){
			console.error('routername(' + JSON.stringify(routername) + ') parameter is not empty but not string.');
			return null;
		}
		if(isSafeHaskey(this.loadedConfig.extrouter, routername) && (isExtRouterInfo(this.loadedConfig.extrouter[routername]) || isOIDCRouterInfo(this.loadedConfig.extrouter[routername]))){
			return this.loadedConfig.extrouter[routername];
		}
		console.warn('extrouter configuration does not have router routername(' + JSON.stringify(routername) + ').');

		return null;
	};
}

/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * End:
 * vim600: noexpandtab sw=4 ts=4 fdm=marker
 * vim<600: noexpandtab sw=4 ts=4
 */
