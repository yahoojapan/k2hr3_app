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

'use strict';

//
// Require
//
var express		= require('express');
var path		= require('path');
var favicon		= require('serve-favicon');										// eslint-disable-line no-unused-vars
var logger		= require('morgan');
var cookieParser= require('cookie-parser');
var bodyParser	= require('body-parser');
var	r3Conf		= require('./routes/lib/libr3appconfig').r3AppConfig;
var	appConf		= new r3Conf();
var	r3util		= require('./routes/lib/libr3util');

//
// Router
//
var index		= require('./routes/index');
var tokens		= require('./routes/tokens');

//
// The application
//
var app			= express();

//
// View engine
//
app.set('views',		path.join(__dirname, 'views'));
app.set('view engine',	'ejs');

//
// Setup icon
//
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));			// uncomment after placing your favicon in /public

//
// Setup Log
//
app.use(logger(appConf.getAccessLogFormat(), appConf.getMorganLoggerOption(__dirname)));

//
// Setup others
//
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/',				index);
app.use('/public/js',		express.static(__dirname + '/public/js'));		// for bundle.js
app.use('/public/tokens',	tokens);										// for user token
app.use('/status.html',		express.static(__dirname + '/public/status.html'));

//
// Setup extension router
//
var	cfgExtRouter= appConf.getExtRouter();
if(r3util.isSafeEntity(cfgExtRouter)){
	Object.keys(cfgExtRouter).forEach(function(routername){
		// check name/path
		if(r3util.isSafeString(cfgExtRouter[routername].name) && r3util.isSafeString(cfgExtRouter[routername].path)){
			var entry	= require('./routes/' + cfgExtRouter[routername].name);
			// check setConfig function
			if(r3util.isSafeEntity(entry.setConfig) && 'function' == typeof entry.setConfig){
				var	routerConfig = r3util.isSafeEntity(cfgExtRouter[routername].config) ? cfgExtRouter[routername].config : null;
				if(!entry.setConfig(routerConfig)){
					console.error('failed to set configuration for extension router(name=' + JSON.stringify(cfgExtRouter[routername].name) + ', path=' + JSON.stringify(cfgExtRouter[routername].path) + ').');
				}
			}
			// set router
			app.use(cfgExtRouter[routername].path, entry.router);
			console.log('success set extension router(name=' + JSON.stringify(cfgExtRouter[routername].name) + ', path=' + JSON.stringify(cfgExtRouter[routername].path) + ').');
		}else{
			console.error('something wrong extrouter configration(name=' + JSON.stringify(cfgExtRouter[routername].name) + ', path=' + JSON.stringify(cfgExtRouter[routername].path) + ').');
		}
	});
}

//
// Last handling after all routing
//
app.use(function(req, res, next)
{
	var	err		= new Error('Not Found');
	err.status	= 404;
	next(err);
});

//
// Error handler
//
app.use(function(err, req, res, next)										// eslint-disable-line no-unused-vars
{
	// set locals, only providing error in development
	res.locals.message	= err.message;
	res.locals.error	= ('development' === req.app.get('env')) ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;

/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * End:
 * vim600: noexpandtab sw=4 ts=4 fdm=marker
 * vim<600: noexpandtab sw=4 ts=4
 */
