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
 * CREATE:   Thu Sep 7 2017
 * REVISION:
 *
 */

'use strict';

var	path		= require('path');
var	rotatefs	= require('rotating-file-stream');		// [NOTICE] rotating-file-stream is using fsevents optionally.
var	r3util		= require('./libr3util');

//---------------------------------------------------------
// load configuration for API
//---------------------------------------------------------
var	loadedConfig = (function()
{
	var	config	= require('config');
	var	data	= {
		scheme:				'http',						// This nodejs server scheme
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
			/*
			*  [NOTE] following option is not specified now.
			*
			rotationTime:		true,					// true		: makes rotated file name with time of rotation.
			highWaterMark:		null,					// null		: proxied to new stream.
			history:			null,					// null		: the history filename.
			immutable:			null,					// null		: never mutates file names.
			maxFiles:			null,					// null		: the maximum number of rotated files to keep.
			maxSize:			null,					// null		: the maximum size of rotated files to keep.
			mode:				null,					// null		: proxied to fs.createWriteStream
			rotate:				null,					// null		: enables the classical UNIX logrotate behaviour.
			size:				null					// null		: the file size to rotate the file.
			*/
		},
		apihost:			'localhost',				// API host
		apischeme:			'http',						// API scheme
		apiport:			3001,						// API port

		userdata:			'',							// User Data Script for OpenStack
		secretyaml:			'',							// Secret Yaml for kubernetes
		sidecaryaml:		'',							// Sidecar Yaml for kubernetes
		appmenu:			null,						// The menu array for application
		validator:			'userValidateDebug',		// Validator object module
		validobj:			null,						// Generated(required) validator object module
		rejectUnauthorized:	true,						// reject mode
		lang:				'en',						// Language for javascript application
		extrouter:			{							// Configuration of Router module to be expanded
			/*
			* [NOTE]	Define the following objects as an array.
			*			Define one object for one extended Router.
			*
			routername: {
				name:			'file path',			// Specify JS file name(except js extension) for defining Router. The "/router" directory is current.
				path:			'route top path',		// Specify the router entry path(ex. "/myenter").
				config:			{}						// Specify the configuration required for the extended router. (Value, array, object)
			},
			...
			*/
		}
	};

	if(r3util.isSafeEntity(config)){
		var	tmp;

		// scheme & port
		if(r3util.isSafeString(config.scheme)){
			data.scheme		= r3util.getSafeString(config.scheme);
			if('https' === data.scheme.toLowerCase()){
				data.port	= 443;
			}
		}
		if(r3util.isSafeEntity(config.port)){
			tmp = normalizePort(config.port);
			if(false !== tmp){
				data.port	= tmp;
			}
		}else if(r3util.isSafeEntity(process.env.PORT)){	// Get port from environment
			tmp = normalizePort(process.env.PORT);
			if(false !== tmp){
				data.port	= tmp;
			}
		}
		// private key & cert & ca
		if(r3util.isSafeString(config.privatekey) || null === config.privatekey){
			data.privatekey	= r3util.getSafeString(config.privatekey);
		}
		if(r3util.isSafeString(config.cert) || null === config.cert){
			data.cert		= r3util.getSafeString(config.cert);
		}
		if(r3util.isSafeString(config.ca) || null === config.ca){
			data.ca			= r3util.getSafeString(config.ca);
		}
		// multi processes
		if(r3util.isSafeBoolean(config.multiproc)){
			data.multiproc	= config.multiproc;
		}
		// run user
		if(r3util.isSafeString(config.runuser) || null === config.runuser){
			data.runuser	= r3util.getSafeString(config.runuser);
		}
		// log directory
		if(r3util.isSafeString(config.logdir) || null === config.logdir){
			data.logdir		= r3util.getSafeString(config.logdir);
		}
		// access log file name
		if(r3util.isSafeString(config.accesslogname) || null === config.accesslogname){
			data.accesslogname	= r3util.getSafeString(config.accesslogname);
		}
		// access log format
		if(r3util.isSafeString(config.accesslogform)){
			data.accesslogform	= r3util.getSafeString(config.accesslogform);
		}
		// console(error) log file name
		if(r3util.isSafeString(config.consolelogname) || null === config.consolelogname){
			data.consolelogname	= r3util.getSafeString(config.consolelogname);
		}
		// log rotation option
		if(r3util.isSafeEntity(config.logrotateopt) && 'object' == typeof config.logrotateopt && !r3util.isArray(config.logrotateopt)){
			Object.keys(config.logrotateopt).forEach(function(key){
				if(r3util.isSafeEntity(data.logrotateopt[key])){
					data.logrotateopt[key] = config.logrotateopt[key];
				}else{
					// [NOTE] Not allow keyname
				}
			});
		}

		// api host & scheme & port
		if(r3util.isSafeString(config.apihost)){
			data.apihost	= r3util.getSafeString(config.apihost);
		}
		if(r3util.isSafeString(config.apischeme)){
			data.apischeme	= r3util.getSafeString(config.apischeme);
			if('https' === data.apischeme.toLowerCase()){
				data.apiport= 443;
			}
		}
		if(r3util.isSafeEntity(config.apiport) && !isNaN(config.apiport)){
			data.apiport	= config.apiport;
		}

		// User Date Script
		if(r3util.isSafeString(config.userdata)){
			data.userdata	= r3util.getSafeString(config.userdata);
		}
		// Secret Yaml
		if(r3util.isSafeString(config.secretyaml)){
			data.secretyaml	= r3util.getSafeString(config.secretyaml);
		}
		// Sidecar Yaml
		if(r3util.isSafeString(config.sidecaryaml)){
			data.sidecaryaml	= r3util.getSafeString(config.sidecaryaml);
		}
		// App menu
		if(r3util.isArray(config.appmenu)){
			data.appmenu	= config.appmenu;
		}
		// Validator & validobj
		if(r3util.isSafeString(config.validator)){
			data.validator	= r3util.getSafeString(config.validator);
		}
		data.validobj		= require('./' + data.validator);

		// Reject mode at unauth
		if((r3util.isSafeBoolean(config.rejectunauth) && !config.rejectunauth) || (process.env.NODE_ENV !== 'production')){
			data.rejectUnauthorized	= false;
		}

		// Lang
		if(r3util.isSafeString(config.lang)){
			data.lang		= r3util.getSafeString(config.lang).toLowerCase();
		}

		// Extension Router
		if(r3util.isSafeEntity(config.extrouter)){
			// copy objects
			try{
				var	tmpstr		= JSON.stringify(config.extrouter);
				data.extrouter	= JSON.parse(tmpstr);
			}catch(err){
				console.error('something wrong extrouter value in configration. then skip this value to load.');
			}
		}
	}
	return data;
}());

//
// Normalize a port into a number, string, or false.
//
function normalizePort(val)
{
	var	port = parseInt(val, 10);
	if(isNaN(port)){
		// named pipe
		if(!r3util.isSafeString(val)){
			return false;
		}
		return val;
	}
	if(0 <= port){
		// port number
		return port;
	}
	return false;
}

//---------------------------------------------------------
// Configuration Class
//---------------------------------------------------------
var R3AppConfig = (function()
{
	//
	// Constructor
	//
	var R3AppConfig = function()
	{
		this.loadedConfig	= loadedConfig;
		this.consolelog		= null;
	};

	var proto = R3AppConfig.prototype;

	//
	// Methods
	//
	proto.getScheme = function()
	{
		return this.loadedConfig.scheme;
	};

	proto.getPort = function()
	{
		return this.loadedConfig.port;
	};

	proto.isMultiProc = function()
	{
		return this.loadedConfig.multiproc;
	};

	proto.getRunUser = function()
	{
		return this.loadedConfig.runuser;
	};

	proto.getPrivateKey = function()
	{
		return this.loadedConfig.privatekey;
	};

	proto.getCert = function()
	{
		return this.loadedConfig.cert;
	};

	proto.getCA = function()
	{
		return this.loadedConfig.ca;
	};

	proto.updateLogDir = function(basepath)
	{
		var	dirpath = null;
		if(null !== this.loadedConfig.logdir){
			if(0 === this.loadedConfig.logdir.indexOf('/')){
				dirpath = path.join(this.loadedConfig.logdir);										// logdir is full path
			}else{
				if(r3util.isSafeString(basepath)){
					if(0 === basepath.indexOf('/')){
						dirpath = path.join(basepath, this.loadedConfig.logdir);
					}else{
						dirpath = path.join(__dirname, '../..', basepath, this.loadedConfig.logdir);// from top directory
					}
				}else{
					dirpath = path.join(__dirname, '../..', this.loadedConfig.logdir);				// from top directory
				}
			}
		}else{
			// logdir is null, it means not putting log to file.
		}

		// update log directory
		this.loadedConfig.fixedlogdir = dirpath;
		if(r3util.isSafeString(dirpath)){
			// check log directory and make it if not exists
			if(null !== dirpath && !r3util.checkMakeDir(dirpath)){
				console.warn('Log directory(' + dirpath + ') is not existed, and could not create it.');
				dirpath = null;		// continue with no log directory
			}else{
				// set dir path to log rotation option
				this.loadedConfig.logrotateopt['path'] = dirpath;
			}
		}

		return dirpath;
	};

	proto.getAccessLogName = function()
	{
		return this.loadedConfig.accesslogname;
	};

	proto.getAccessLogFormat = function()
	{
		return this.loadedConfig.accesslogform;
	};

	proto.getConsoleLogName = function()
	{
		return this.loadedConfig.consolelogname;
	};

	proto.getLogRotateOption = function()
	{
		return this.loadedConfig.logrotateopt;
	};

	proto.getRotateLogStream = function(basedir, filename)
	{
		var	logstream	= null;
		var	logdir		= this.updateLogDir(basedir);
		if(null == logdir){
			return logstream;
		}
		if(!r3util.isSafeString(filename)){
			return logstream;
		}
		try{
			logstream = rotatefs(filename, this.loadedConfig.logrotateopt);
		}catch(error){
			console.warn('Could not create log rotate option by : ' + JSON.stringify(error.message));
			logstream = null;
		}
		return logstream;
	};

	proto.getMorganLoggerOption = function(basedir)
	{
		var	loggeropt = null;
		var	logstream = this.getRotateLogStream(basedir, this.loadedConfig.accesslogname);
		if(null !== logstream){
			loggeropt = {
				stream: logstream
			};
		}
		return loggeropt;
	};

	proto.setConsoleLogging = function(basedir)
	{
		var	logstream = this.getRotateLogStream(basedir, this.loadedConfig.consolelogname);
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

	proto.getApiHost = function()
	{
		return this.loadedConfig.apihost;
	};

	proto.getApiScheme = function()
	{
		return this.loadedConfig.apischeme;
	};

	proto.getApiPort = function()
	{
		return this.loadedConfig.apiport;
	};

	proto.getUserData = function()
	{
		return this.loadedConfig.userdata;
	};

	proto.getSecretYaml = function()
	{
		return this.loadedConfig.secretyaml;
	};

	proto.getSidecarYaml = function()
	{
		// make k2hr3-k8s-init.sh parameters which is built from configuration.
		//
		var	params	= '-host ' + this.loadedConfig.apihost + ' -port ' + this.loadedConfig.apiport + ' -schema ' + this.loadedConfig.apischeme;

		// repace '{{= %K2HR3_REST_API_HOST% }}' in sidecaryaml
		//
		// replace keyword in template
		var	replace	= this.loadedConfig.sidecaryaml.replace(/{{= %K2HR3_REST_API_HOST% }}/g, params);

		return replace;
	};

	proto.getAppMenu = function()
	{
		return this.loadedConfig.appmenu;
	};

	proto.getUserValidator = function()
	{
		return this.loadedConfig.validator;
	};

	proto.getUserValidatorObj = function()
	{
		return this.loadedConfig.validobj;
	};

	proto.getRejectUnauthorized = function()
	{
		return this.loadedConfig.rejectUnauthorized;
	};

	proto.getLang = function()
	{
		return this.loadedConfig.lang;
	};

	proto.getExtRouter = function(routername)
	{
		if(r3util.isSafeEntity(routername)){
			if(!r3util.isSafeString(routername)){
				console.error('routername('  + JSON.stringify(routername) + ') parameter is not empty but not string.');
				return null;
			}
			if(!r3util.isSafeEntity(this.loadedConfig.extrouter)){
				console.warn('extrouter configuration does not have router routername('  + JSON.stringify(routername) + ').');
				return null;
			}
			if(!r3util.isSafeEntity(this.loadedConfig.extrouter[routername])){
				console.warn('extrouter configuration does not have router routername('  + JSON.stringify(routername) + ').');
				return null;
			}
			return this.loadedConfig.extrouter[routername];
		}else{
			// return all extrouter object
			return this.loadedConfig.extrouter;
		}
	};

	return R3AppConfig;
})();

//---------------------------------------------------------
// Exports
//---------------------------------------------------------
exports.r3AppConfig				= R3AppConfig;

// SignIn types
exports.r3SigninUnscopedToken	= 'unsopedtoken';
exports.r3SigninCredential		= 'credential';

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
