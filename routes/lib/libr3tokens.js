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
 * CREATE:   Wed Sep 6 2017
 * REVISION:
 *
 */

'use strict';

var	r3util		= require('./libr3util');
var	appConfig	= require('./libr3appconfig').r3AppConfig;

//---------------------------------------------------------
// User Token Class
//---------------------------------------------------------
var R3UserToken = (function()
{
	//
	// Constructor
	//
	var R3UserToken = function(req)
	{
		if(!(this instanceof R3UserToken)){
			return new R3UserToken(req);
		}

		this.appConfig	= new appConfig();
		this.username	= this.appConfig.getUserValidatorObj().getUserName(req);
		if(null === this.username){
			console.error('could not get user name, it is not login status.');
		}
		this.sinintype	= this.appConfig.getUserValidatorObj().getSignInType();
		this.signinUrl	= this.appConfig.getUserValidatorObj().getSginInUri(req);
		this.signoutUrl	= this.appConfig.getUserValidatorObj().getSginOutUri(req);
	};

	var proto = R3UserToken.prototype;

	//
	// Methods
	//
	proto.getUserName = function()
	{
		return this.username;
	};

	proto.rawExtractUserToken = function(req)
	{
		if(	!r3util.isSafeEntity(req)							||
			!r3util.isSafeEntity(req.headers)					||
			!r3util.isSafeString(req.headers['x-auth-token'])	)
		{
			return null;
		}
		var	token = req.headers['x-auth-token'];
		if(-1 !== token.indexOf('R=')){
			console.warn('The request object does not have user token header but has role token.');
			return null;
		}
		if(-1 !== token.indexOf('U=')){
			token = token.substr(2);
			if(!r3util.isSafeString(token)){
				console.warn('The request object has empty user token.');
				return null;
			}
		}
		return token;
	};

	proto.rawGetUserToken = function(callback, token, tenant)
	{
		if(!r3util.isSafeString(this.username)){
			var	errobj = new Error('User name is not specified(not found backyard cookie)');
			console.error(errobj.message);
			_callback(errobj, null);
			return;
		}
		var	secure		= false;
		var	httpobj		= null;
		var agent		= null;			// for HTTPS
		if('https' == this.appConfig.getApiScheme() || 'HTTPS' == this.appConfig.getApiScheme()){
			secure		= true;
			httpobj		= require('https');

			/* eslint-disable indent, no-mixed-spaces-and-tabs */
			var agentOptions = {
								host:				this.appConfig.getApiHost(),
								port:				this.appConfig.getApiPort(),
								path:				'/',
								rejectUnauthorized:	this.appConfig.getRejectUnauthorized()
							};
			/* eslint-enable indent, no-mixed-spaces-and-tabs */
			agent		= new httpobj.Agent(agentOptions);

		}else{
			httpobj		= require('http');
		}
		var	_callback	= callback;
		var	isscoped	= r3util.isSafeString(tenant) && r3util.isSafeString(token);

		// arguments for the request to API server
		/* eslint-disable indent, no-mixed-spaces-and-tabs */
		var urlarg		= '?username=' + this.username + (isscoped ? ('&tenantname=' + tenant) : '');
		var	headers		= {
							'Content-Type':		'application/json',
							'Content-Length':	0
						   };
		if(isscoped){
			headers['x-auth-token'] = 'U=' + token;
		}
		var	options		= {	'host':				this.appConfig.getApiHost(),
							'port':				this.appConfig.getApiPort(),
							'method':			'PUT',
							'headers':			headers,
							'path':				('/v1/user/tokens' + encodeURI(urlarg))
						};
		if(secure){
			options.agent	= agent;
		}
		/* eslint-enable indent, no-mixed-spaces-and-tabs */

		console.info('api host = ' + this.appConfig.getApiHost());
		console.info('api port = ' + this.appConfig.getApiPort());
		console.info('method = PUT');
		console.info('headers = ' + headers);
		console.info('path = /v1/user/tokens' + encodeURI(urlarg));

		// send request
		var	request		= httpobj.request(options, function(response)
		{
			response.setEncoding('utf8');
			var	resBody = '';

			response.on('data', function(chunk)
			{
				console.info('RESPONSE CHUNK = ' + chunk);
				resBody += chunk;
			});

			response.on('end', function(result)					// eslint-disable-line no-unused-vars
			{
				console.info('RESPONSE CODE   = ' + response.statusCode);
				console.info('RESPONSE HEADER = ' + JSON.stringify(response.headers));
				console.info('RESPONSE BODY   = ' + r3util.getSafeString(resBody));

				var	errobj	= null;
				var	cvtBody	= JSON.parse(r3util.getSafeString(resBody));

				if(300 <= response.statusCode){
					errobj = new Error('RESPONSE CODE = ' + response.statusCode);
				}else if(	!r3util.isSafeEntity(cvtBody)			||
							!r3util.isSafeBoolean(cvtBody.result)	||
							!r3util.isSafeEntity(cvtBody.message)	||
							!r3util.isSafeBoolean(cvtBody.scoped)	||
							!r3util.isSafeEntity(cvtBody.token)		)
				{
					errobj = new Error('Response body is something wrong.');
				}else if(!cvtBody.result){
					errobj = new Error('Could not get user token by ' + r3util.isSafeString(cvtBody.message));
				}else if(isscoped !== cvtBody.scoped){
					errobj = new Error('Could not get ' + (isscoped ? 'scoped' : 'unscoped') + ' user token.');
				}else if(!r3util.isSafeString(cvtBody.token)){
					errobj = new Error('Got token is not strong type.');
				}
				if(null !== errobj){
					console.error(errobj.message);
					_callback(errobj, null);
					return;
				}
				_callback(null, cvtBody.token);
			});
		});
		request.on('error', function(error)
		{
			// [NOTE]
			// If fatal error is occurred, the error message must be started with 'K2HR3 API SERVER ERROR'.
			// This value is checked in caller function.
			//
			console.error('ERROR RESPONSE = ' + error.message);
			_callback(new Error('K2HR3 API SERVER ERROR : ' + error.message), null);
		});
		request.end();
	};

	proto.hasTokenHeader = function(req)
	{
		return (null !== this.rawExtractUserToken(req));
	};

	proto.getUnscopedUserToken = function(callback)
	{
		if(!r3util.isSafeString(this.username)){
			var	errobj = new Error('User name is not specified(not found backyard cookie)');
			console.error(errobj.message);
			callback(errobj, null);
			return;
		}
		return this.rawGetUserToken(callback);
	};

	proto.getScopedUserToken = function(req, tenant, callback)
	{
		var	errobj;
		if(!r3util.isSafeString(this.username)){
			errobj = new Error('User name is not specified(not found backyard cookie)');
			console.error(errobj.message);
			callback(errobj, null);
			return;
		}
		var	token = this.rawExtractUserToken(req);
		if(!r3util.isSafeString(token)){
			errobj = new Error('The request does not safe unscoped user token.');
			console.error(errobj.message);
			callback(errobj, null);
			return;
		}
		return this.rawGetUserToken(callback, token, tenant);
	};

	proto.getSignInType = function()
	{
		return this.sinintype;
	};

	proto.getSignInUrl = function()
	{
		return this.signinUrl;
	};

	proto.getSignOutUrl = function()
	{
		return this.signoutUrl;
	};

	return R3UserToken;
})();

//---------------------------------------------------------
// Exports
//---------------------------------------------------------
exports.r3UserToken = R3UserToken;

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
