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

var	express		= require('express');
var	router		= express.Router();

var	libTokens	= require('./lib/libr3tokens').r3UserToken;
var	r3util		= require('./lib/libr3util');

//
// Mountpath				: '/public/tokens'
//
// GET '/public/tokens'		: get scoped/unscoped user token from own client
//
// arguments				: unscoped user token
//								Cookie			=> User Browser Cookie
//							  scoped user token
//								Cookie			=> User Browser Cookie
//								x-auth-token	=> unscoped token in HTTP header
//								tenantname		=> URL arguments for scoped to tenant name
//
//								*)	if x-auth-token header is not specified, try to get unscoped
//									user token at first. after that get scoped user token using
//									it.
//
// response	status			: 200, etc
//			body			: token string(or message if error)
//
router.get('/', function(req, res, next)					// eslint-disable-line no-unused-vars
{
	if(!r3util.isSafeEntity(req) || !r3util.isSafeEntity(req.query)){
		console.error('The request is something wrong.');
		res.status(400);									// 400: Bad Request
		res.send('The request is something wrong.');
		return;
	}
	res.type('application/json; charset=utf-8');

	var	tokensObj	= new libTokens(req);
	var	_res		= res;
	var	_req		= req;									// eslint-disable-line no-unused-vars

	if(!r3util.isSafeString(req.query.tenantname)){
		tokensObj.getUnscopedUserToken(function(error, token)
		{
			if(null !== error){
				console.error('Could not get Unscoped user token by ' + error.message);
				_res.status(400);								// 400: Bad Request
				_res.send(error.message);
				return;
			}
			_res.status(200);									// 200
			_res.send(JSON.stringify(token));
		});
	}else{
		//
		// Get scoped token
		//

		// [NOTE]
		// This code is to set x-auth-token from url arg for debugging manually.
		//
		if('development' === req.app.get('env') && !tokensObj.hasTokenHeader() && r3util.isSafeString(req.query.debugtoken)){
			req.headers['x-auth-token'] = 'U=' + r3util.getSafeString(req.query.debugtoken);
		}

		if(!tokensObj.hasTokenHeader(req)){
			//
			// No x-auth-token header
			//
			// First: Get unscoped token
			//
			tokensObj.getUnscopedUserToken(function(error, token)
			{
				if(null !== error){
					console.error('Could not get Unscoped user token by ' + error.message);
					_res.status(400);								// 400: Bad Request
					_res.send(error.message);
					return;
				}
				// set x-auth-token header
				_req.headers['x-auth-token'] = 'U=' + token;

				//
				// 2'nd: Get scoped token
				//
				tokensObj.getScopedUserToken(_req, r3util.getSafeString(_req.query.tenantname), function(error, token)
				{
					if(null !== error){
						console.error('Could not get Scoped user token by ' + error.message);
						_res.status(400);								// 400: Bad Request
						_res.send(error.message);
						return;
					}
					_res.status(200);									// 200
					_res.send(JSON.stringify(token));
				});
			});

		}else{
			//
			// Found x-auth-token header
			//
			tokensObj.getScopedUserToken(req, r3util.getSafeString(req.query.tenantname), function(error, token)
			{
				if(null !== error){
					console.error('Could not get Scoped user token by ' + error.message);
					_res.status(400);								// 400: Bad Request
					_res.send(error.message);
					return;
				}
				_res.status(200);									// 200
				_res.send(JSON.stringify(token));
			});
		}
	}
});

module.exports = router;

/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * End:
 * vim600: noexpandtab sw=4 ts=4 fdm=marker
 * vim<600: noexpandtab sw=4 ts=4
 */
