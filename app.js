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
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
