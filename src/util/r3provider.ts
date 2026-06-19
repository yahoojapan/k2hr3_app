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
 * CREATE:   Tue Sep 5 2017
 * REVISION:
 *
 */

import R3Context						from '../util/r3context';
import { r3GetTextRes }					from '../util/r3define';
import { checkServiceResourceValue }	from '../util/r3verifyutil';
import { resourceType, roleType, policyType, serviceType, ItemType, isItemType, CRCObject, ErrorCallback, DataCallback, FetchCallback, FetchError, PathDetailInfo, PolicyData, ProgressCallback, ResourceData, RoleData, RoleHostInfo, RoleTokenPrimitiveInfo, RoleTokenInfo, ServiceData, StaticResourceObject, ServiceResourceObject, isServiceResourceObjectArray, StringValObj, TenantData, TokenCallback, TreeListItem, actionValueRead, effectValueAllow, isCRCObject, isPolicyActionTypeArray, isPolicyData, isPolicyEffectType, isResBaseResult, isResPolicyData, isResRawListData, isResRawLocalTenantExpandData, isResTenantData, isResResourceData, isResRoleData, isResRoleTokenList, isResRoleTokenPrimitiveInfo, isResServiceData, isResTokenData, isResourceData, isRoleData, isRoleHostList, isRoleTokenPrimitiveInfo, isServiceData, isTenantData, isTreeListItem, rawListData, reqSetRoleHosts, valTypeAll, valTypeAllObject }	from '../util/r3types';
import { r3DeepClone, r3StringValObjMerge, parseCombineHostObject, r3IsEmptyEntity, r3IsEmptyStringObject, r3IsEmptyString, r3CompareCaseString, r3GetSafeString, r3IsArray, r3IsBoolean, r3IsFunction, r3IsNumber, r3IsObject, r3IsString, r3IsStringArray } from '../util/r3util';

//
// K2HR3 Data Provider Class
//
export default class R3Provider
{
	tokenHeaderType:	{ noUserToken: number; unscopedUserToken: number };
	r3Context:			R3Context;
	scopedUserToken:	StringValObj;
	tenantList:			TenantData[];
	cbProgressControl:	ProgressCallback | null;
	r3TextRes:			StringValObj;

	constructor(cbProgressControl: ProgressCallback | null, signin?: boolean, username?: string, unscopedtoken?: string)
	{
		this.tokenHeaderType	= {
			noUserToken:		-1,
			unscopedUserToken:	-2
		};
		this.r3Context			= new R3Context(signin, username, unscopedtoken);

		// caches
		//
		// [TODO]
		// Need to implement timeout
		//
		this.scopedUserToken	= {};							// Scoped User Tokens - Key is Tenant name
		this.tenantList			= [];							// Tenant name list(element is object = {name: "tenant name", display: "display name"})
		this.cbProgressControl	= cbProgressControl;			// Callback function for progress(allow null)

		// text resource
		this.r3TextRes			= r3GetTextRes(this.r3Context.getSafeLang());
	}

	getR3Context(): R3Context
	{
		return this.r3Context;
	}

	getR3TextRes(): StringValObj
	{
		return this.r3TextRes;
	}

	startProgress(): void
	{
		if(null !== this.cbProgressControl){
			this.cbProgressControl(true);
		}
	}

	stopProgress(): void
	{
		if(null !== this.cbProgressControl){
			this.cbProgressControl(false);
		}
	}

	//--------------------------------------------------
	// FETCH
	//--------------------------------------------------
	// raw methods
	//
	_fetch(path: string, method: string, headers: StringValObj | null, tokenType: number | string, body: valTypeAll, isCvtBodyJSON: boolean, callback: FetchCallback): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}
		const _callback	= callback;
		const _path		= r3IsEmptyString(path) ? '/' : encodeURI(path).replace(/#/g, '%23');// force replace '#'
		const _url		= this.r3Context.getApiUrlBase() + _path;
		const _method	= r3IsEmptyString(method) ? 'GET' : method;							// default is GET

		let	_length		= 0;
		let	_strBody: string | undefined;
		if(!r3IsEmptyEntity(body)){
			if(r3IsString(body) && (!r3IsBoolean(isCvtBodyJSON) || !isCvtBodyJSON)){
				_strBody = body;
			}else{
				_strBody = JSON.stringify(body);
			}
			_length = _strBody.length;
		}

		let	_headers: StringValObj = r3StringValObjMerge(headers, {
			'Content-Type':		'application/json',
			'Content-Length':	String(_length)
		});
		this.r3Context.getDbgHeader(_headers);												// Add debug header if development environment

		// get token
		this.getUserTokenByType(tokenType, (error: Error | null, token: string | null) =>
		{
			if(null !== error){
				console.error(error.message);
				_callback(error, null);
				return;
			}
			if(r3IsString(token)){
				_headers['x-auth-token'] = 'U=' + token;
			}

			const _fetchOpt: RequestInit = {
				mode:		'cors',
				method:		_method,
				headers: 	_headers
			};
			if(r3IsString(_strBody)){
				_fetchOpt.body = _strBody;
			}

			this.startProgress();															// start progressing

			// Send request
			fetch(_url, _fetchOpt).then(response => {
				if(!response.ok){
					const	dbgresheader		= this.r3Context.getSafeDbgResHeaderName();
					let		errorinfo: string	= '';
					if('' !== dbgresheader && response.headers.has(dbgresheader)){
						errorinfo = response.headers.get(dbgresheader) || '';
					}
					const _errobj: FetchError = new Error('REQUEST = ' + decodeURI(_path) + ', STATUS = ' + response.statusText + ':' + String(response.status) + ', ERROR HEADER = ' + errorinfo);
					_errobj.status	= response.status;

					// [NOTE]
					// Do not call stopProgress() here, it is called after throwing exception.
					//
					throw _errobj;
				}
				if(204 === response.status){
					// 204 does not have response body, thus make resobj here.
					return { result: true };
				}
				return response.json();

			}).then((resobj: valTypeAll) => {
				this.stopProgress();														// stop progressing

				if(	r3IsEmptyEntity(resobj)		||
					!r3IsObject(resobj)			||
					!r3IsBoolean(resobj.result)	||
					!resobj.result				)
				{
					throw new Error('REQUEST = ' + decodeURI(_path) + ', ERROR = Response is sonmething wrong or false: ' + JSON.stringify(resobj));
				}
				_callback(null, resobj);													// resobj is valTypeAllObject
				return;

			}).catch((error: FetchError) => {
				this.stopProgress();														// stop progressing

				if(r3IsEmptyEntity(error)){
					const newErr: FetchError	= new Error('K2HR3 API ERROR => Unknown reason.');
					newErr.status				= 500;
					console.error(newErr.message);
					_callback(newErr, null);
				}else{
					error.message	= 'K2HR3 API ERROR => ' + error.message;
					if(undefined === error.status || null === error.status){
						error.status= 500;
					}
					console.error(error.message);
					_callback(error, null);
				}
				return;
			});
		});
	}

	//
	// GET raw method
	//
	_get(path: string, urlargs: string | undefined | null, headers: StringValObj | null, tokenType: number | string, callback: FetchCallback): void
	{
		let	fullPath = path;
		if(!r3IsEmptyString(path) && !r3IsEmptyString(urlargs)){
			fullPath += '?' + urlargs;
		}
		return this._fetch(fullPath, 'GET', headers, tokenType, null, false, callback);
	}

	//
	// HEAD raw method
	//
	_head(path: string, urlargs: string | undefined | null, headers: StringValObj | null, tokenType: number | string, callback: FetchCallback): void
	{
		let	fullPath = path;
		if(!r3IsEmptyString(path) && !r3IsEmptyString(urlargs)){
			fullPath += '?' + urlargs;
		}
		return this._fetch(fullPath, 'HEAD', headers, tokenType, null, false, callback);
	}

	//
	// PUT raw method
	//
	_put(path: string, urlargs: string | undefined | null, headers: StringValObj | null, tokenType: number | string, callback: FetchCallback): void
	{
		let	fullPath = path;
		if(!r3IsEmptyString(path) && !r3IsEmptyString(urlargs)){
			fullPath += '?' + urlargs;
		}
		return this._fetch(fullPath, 'PUT', headers, tokenType, null, false, callback);
	}

	//
	// POST raw method
	//
	_post(path: string, headers: StringValObj | null, tokenType: number | string, body: valTypeAll, isCvtBodyJSON: boolean, callback: FetchCallback): void
	{
		return this._fetch(path, 'POST', headers, tokenType, body, isCvtBodyJSON, callback);
	}

	//
	// DELETE raw method
	//
	_delete(path: string, urlargs: string | undefined | null, headers: StringValObj | null, tokenType: number | string, callback: FetchCallback): void
	{
		let	fullPath = path;
		if(!r3IsEmptyString(path) && !r3IsEmptyString(urlargs)){
			fullPath += '?' + urlargs;
		}
		return this._fetch(fullPath, 'DELETE', headers, tokenType, null, false, callback);
	}

	//--------------------------------------------------
	// TOKEN
	//--------------------------------------------------
	//
	// raw get Unscoped User token
	//
	getUnscopedUserToken(username: string, passphrase: string | null, callback: TokenCallback): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}
		if(r3IsEmptyString(username, true)){
			const error = new Error('username parameter is empty');
			console.error(error.message);
			callback(error, null);
			return;
		}
		const _callback		= callback;
		const _username		= username;
		const _passphrase	= (!r3IsString(passphrase) || r3IsEmptyString(passphrase, true)) ? null : (passphrase).trim();		// allow empty passphrase
		const _body = {
			'auth': {
				'tenantName': '',
				'passwordCredentials': {
					'username':	_username,
					'password':	_passphrase
				}
			}
		};

		this.startProgress();																// start progressing

		this._post('/v1/user/tokens', null, this.tokenHeaderType.noUserToken, _body, true, (error: FetchError | null, resobj: valTypeAllObject) =>
		{
			this.stopProgress();															// stop progressing

			if(null !== error){
				console.error(error.message);
				_callback(error, null);
				return;
			}
			if(!isResTokenData(resobj)){
				const err = new Error('Unknown response object type.');
				console.error(err.message);
				_callback(err, null);
				return;
			}
			if(!resobj.result){
				const err = new Error('No result object.');
				console.error(err.message);
				_callback(err, null);
				return;
			}
			if(undefined === resobj.scoped || !r3IsBoolean(resobj.scoped) || resobj.scoped || undefined === resobj.token || !r3IsString(resobj.token)){
				const err = new Error('Response data is sonmething wrong: ' + JSON.stringify(resobj));
				console.error(err.message);
				_callback(err, null);
				return;
			}
			_callback(null, resobj.token);
		});
	}

	//
	// raw get Scoped User token
	//
	getScopedUserToken(tenantname: string, callback: TokenCallback): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}
		if(r3IsEmptyString(tenantname)){
			const error = new Error('tenantname parameter is wrong.');
			console.error(error.message);
			callback(error, null);
			return;
		}

		if(!r3IsEmptyStringObject(this.scopedUserToken, tenantname)){
			callback(null, this.scopedUserToken[tenantname]);
			return;
		}
		const _callback		= callback;
		const _tenantname	= tenantname;
		const _body = {
			'auth': {
				'tenantName': _tenantname
			}
		};

		this.startProgress();																// start progressing

		this._post('/v1/user/tokens', null, this.tokenHeaderType.unscopedUserToken, _body, true, (error: FetchError | null, resobj: valTypeAllObject) =>
		{
			this.stopProgress();															// stop progressing

			if(null !== error){
				console.error(error.message);
				_callback(error, null);
				return;
			}
			if(!isResTokenData(resobj)){
				const err = new Error('Unknown response object type.');
				console.error(err.message);
				_callback(err, null);
				return;
			}
			if(!resobj.result){
				const err = new Error('No result object.');
				console.error(err.message);
				_callback(err, null);
				return;
			}
			if(undefined === resobj.scoped || !r3IsBoolean(resobj.scoped) || !resobj.scoped || undefined === resobj.token || !r3IsString(resobj.token)){
				const err = new Error('Response data is sonmething wrong: ' + JSON.stringify(resobj));
				console.error(err.message);
				_callback(err, null);
				return;
			}
			this.scopedUserToken[_tenantname] = resobj.token;
			_callback(null, resobj.token);
		});
	}

	//
	// raw get Token( No token / Scoped / Unscoped ) method
	//
	// tokenType is number or string as tenant name.
	// If it is number, it means no token(tokenHeaderType.noUserToken) or
	// unscoped token(tokenHeaderType.unscopedUserToken).
	// If string, it means tenant name. then this method sets scoped token
	// to headers object.
	//
	// [NOTE]
	// If there is no scoped token, this method calls API for getting scoped
	// token for tenant.
	//
	getUserTokenByType(tokenType: number | string, callback: TokenCallback): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}
		if(r3IsEmptyEntity(tokenType)){
			const error = new Error('tokenType parameter is wrong.');
			console.error(error.message);
			callback(error, null);
			return;
		}

		if(r3IsNumber(tokenType) && this.tokenHeaderType.noUserToken === tokenType){
			// no token
			callback(null, null);

		}else if(r3IsNumber(tokenType) && this.tokenHeaderType.unscopedUserToken === tokenType){
			// unscoped token
			callback(null, this.r3Context.getSafeUnscopedToken());

		}else if(r3IsNumber(tokenType) || (r3IsString(tokenType) && !r3IsEmptyString(tokenType))){
			let	strTokenType: string;
			if(r3IsNumber(tokenType)){
				// force string
				strTokenType = String(tokenType);
			}else{
				strTokenType = tokenType;
			}

			this.startProgress();														// start progressing

			this.getScopedUserToken(strTokenType, (error, token) =>
			{
				this.stopProgress();													// stop progressing

				if(null !== error){
					console.error(error.message);
					callback(error, null);
					return;
				}
				callback(null, token);
			});
		}else{
			const error = new Error('tokenType is not number nor string.');
			console.error(error.message);
			callback(error, null);
		}
	}

	//--------------------------------------------------
	// Tenant List
	//--------------------------------------------------
	//
	// Get tenant list
	//
	getTenantList(force: boolean, useLocalTenant: boolean, callback: DataCallback<TenantData[]>): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}
		const _callback = callback;

		if(force){
			this.tenantList = [];
		}
		if(0 < this.tenantList.length){
			// using cache
			_callback(null, this.tenantList);
			return;
		}

		if(!this.r3Context.isLogin()){
			console.info('Not logged in yet.');
			// return empty cache
			_callback(null, this.tenantList);
			return;
		}

		this.startProgress();																// start progressing

		this._get('/v1/user/tokens', null, null, this.tokenHeaderType.unscopedUserToken, (error: FetchError | null, resobj: valTypeAllObject) =>
		{
			this.stopProgress();															// stop progressing

			if(null !== error){
				if(undefined !== error.status && 404 == error.status){
					console.error('Could not get tenat list with response status is 404, thus return empty tenant list : ' + error.message);
					this.tenantList = [];
					_callback(null, this.tenantList);
				}else{
					console.error(error.message);
					_callback(error, null);
				}
				return;
			}

			if(!isResTenantData(resobj)){
				const err = new Error('Response data is sonmething wrong: ' + JSON.stringify(resobj));
				console.error(err.message);
				_callback(err, null);
				return;
			}
			if(!resobj.result || !r3IsBoolean(resobj.scoped) || resobj.scoped || !r3IsString(resobj.user) || this.r3Context.getSafeUserName() !== resobj.user){
				const err = new Error('Response data is sonmething wrong: ' + JSON.stringify(resobj));
				console.error(err.message);
				_callback(err, null);
				return;
			}

			if(!r3IsArray(resobj.tenants)){
				this.tenantList = [];
			}else{
				// set tenant list from response to this object's tenant list with users[]
				this.tenantList = resobj.tenants.map(tenant => {
					const	existUsers = r3IsStringArray(tenant?.users) ? tenant.users : [];
					return {
						...tenant,
						users: [...existUsers, resobj.user]		// add resobj.user to users[]
					};
				});

				// sort
				this.tenantList.sort((tenant1, tenant2) =>
				{
					if(!r3IsString(tenant1.display) && !r3IsString(tenant2.display)){
						return 0;
					}else if(!r3IsString(tenant1.display)){
						return 1;
					}else if(!r3IsString(tenant2.display)){
						return -1;
					}else{
						if(r3IsEmptyString(tenant1.display) && r3IsEmptyString(tenant2.display)){
							return 0;
						}
						if(tenant1.display < tenant2.display){
							return -1;
						}else if(tenant1.display > tenant2.display){
							return 1;
						}
					}
					return 0;
				});
			}

			if(!useLocalTenant){
				//
				// local tenant is invalid, so stop here
				//
				_callback(null, this.tenantList);
				return;
			}

			//
			// Get All local Tenant Infomration
			//
			this.startProgress();															// start progressing

			this._get('/v1/tenant', 'expand=true', null, this.tokenHeaderType.unscopedUserToken, (error: FetchError | null, resobj: valTypeAllObject) =>
			{
				this.stopProgress();														// stop progressing

				if(null !== error){
					if(r3IsNumber(error?.status) && 404 == error.status){
						console.error('Could not get tenat list with response status is 404, thus return existed(normal) tenant list : ' + error.message);
						_callback(null, this.tenantList);
					}else{
						console.error(error.message);
						_callback(error, null);
					}
					return;
				}
				if(!isResRawLocalTenantExpandData(resobj)){
					const err = new Error('Response data is sonmething wrong: ' + JSON.stringify(resobj));
					console.error(err.message);
					_callback(err, null);
					return;
				}
				if(true !== resobj.result){
					const err = new Error('Could not get local tenant list : ' + r3GetSafeString(resobj.message, 'unknown'));
					console.error(err.message);
					_callback(err, null);
					return;
				}

				//
				// Add users data to local tenant information
				//
				if(r3IsArray(resobj.tenants)){
					const	localTenants = resobj.tenants;
					for(let cnt = 0; cnt < localTenants.length; ++cnt){
						if(r3IsEmptyString(localTenants[cnt].name)){
							console.warn('The local tenant name in respose is empty, so skip this.');
							continue;
						}

						let	foundTenant = false;
						for(let cnt2 = 0; cnt2 < this.tenantList.length; ++cnt2){
							if(!r3IsEmptyString(this.tenantList[cnt2].name) && this.tenantList[cnt2].name == localTenants[cnt].name){
								//
								// Add(merge) users
								//
								if(r3IsStringArray(localTenants[cnt].users) && r3IsStringArray(this.tenantList[cnt2].users)){
									const	mergedUsers: string[]	= [...new Set([...(this.tenantList[cnt2].users), ...(localTenants[cnt].users)])];
									this.tenantList[cnt2].users		= r3DeepClone(mergedUsers);
								}else if(r3IsStringArray(localTenants[cnt].users)){
									this.tenantList[cnt2].users = r3DeepClone(localTenants[cnt].users);
								}
								foundTenant = true;
								break;
							}
						}
						if(!foundTenant){
							console.warn('Not found ' + localTenants[cnt].name + ' local tenant in current tenant list, so skip this.');
						}
					}
				}else{
					console.warn('Respose for getting local tenant list is something wrong, but continue...');
				}

				_callback(null, this.tenantList);
			});
		});
	}

	//--------------------------------------------------
	// Local Tenant
	//--------------------------------------------------
	//
	// Create Local Tenant
	//
	// name			: local tenant name
	// display		: display name for new local tenant(allowed null/emptyv1/tenant)
	// description	: description for new local tenant(allowed null/emptyv1/tenant)
	// users		: initial user name array for new local tenant
	//
	createLocalTenant(name: string, display: string | null, description: string | null, users: string[], callback: ErrorCallback): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}

		const _callback = callback;
		if(r3IsEmptyString(name, true) || !r3IsStringArray(users) || 0 === users.length){
			const _error = new Error('name(' + JSON.stringify(name) + ') or users(' + JSON.stringify(users) + ') parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}

		const _name: string					= name.trim();
		const _display: string | null		= ((!r3IsString(display) || r3IsEmptyString(display, true))			? null : display.trim() === ''		? null : display.trim());
		const _description: string | null	= ((!r3IsString(description) || r3IsEmptyString(description, true))	? null : description.trim() === ''	? null : description.trim());
		const _users: string[]				= r3DeepClone(users);
		const _body = {
			'tenant': {
				'name':		_name,
				'display':	_display,
				'desc':		_description,
				'users':	_users
			}
		};

		this.startProgress();																// start progressing

		this._post('/v1/tenant', null, this.tokenHeaderType.unscopedUserToken, _body, true, (error: FetchError | null, resobj: valTypeAllObject) =>
		{
			this.stopProgress();															// stop progressing

			if(null !== error){
				console.error(error.message);
				_callback(error);
				return;
			}
			if(!isResBaseResult(resobj)){
				const err = new Error('Response data is sonmething wrong: ' + JSON.stringify(resobj));
				console.error(err.message);
				_callback(err);
				return;
			}
			if(true !== resobj.result){
				const err = new Error(r3GetSafeString(resobj.message, 'unknown'));
				console.error(err.message);
				_callback(err);
				return;
			}
			_callback(null);
		});
	}

	//
	// Update Local Tenant
	//
	// name			: local tenant name
	// id			: local tenant id
	// display		: display name for local tenant(allowed null/emptyv1/tenant)
	// description	: description for local tenant(allowed null/emptyv1/tenant)
	// users		: user name array for local tenant
	//
	updateLocalTenant(name: string, id: string, display: string | null, description: string | null, users: string[], callback: ErrorCallback): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}

		const _callback = callback;
		if(r3IsEmptyString(name, true) || r3IsEmptyString(id, true) || !r3IsStringArray(users) || 0 === users.length){
			const _error = new Error('name(' + JSON.stringify(name) + ') or id(' + JSON.stringify(id) + ') or users(' + JSON.stringify(users) + ') parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}

		const _name: string					= name.trim();
		const _id: string					= id.trim();
		const _display: string | null		= ((!r3IsString(display) || r3IsEmptyString(display, true))			? null : display.trim() === ''		? null : display.trim());
		const _description: string | null	= ((!r3IsString(description) || r3IsEmptyString(description, true))	? null : description.trim() === ''	? null : description.trim());
		const _users: string[]				= r3DeepClone(users);
		const _url: string					= '/v1/tenant/' + _name;
		const _body = {
			'tenant': {
				'id':		_id,
				'display':	_display,
				'desc':		_description,
				'users':	_users
			}
		};

		this.startProgress();																// start progressing

		this._post(_url, null, this.tokenHeaderType.unscopedUserToken, _body, true, (error: FetchError | null, resobj: valTypeAllObject) =>
		{
			this.stopProgress();															// stop progressing

			if(null !== error){
				console.error(error.message);
				_callback(error);
				return;
			}
			if(!isResBaseResult(resobj)){
				const err = new Error('Response data is sonmething wrong: ' + JSON.stringify(resobj));
				console.error(err.message);
				_callback(err);
				return;
			}
			if(true !== resobj.result){
				const err = new Error(r3GetSafeString(resobj.message, 'unknown'));
				console.error(err.message);
				_callback(err);
				return;
			}
			_callback(null);
		});
	}

	//
	// Delete Local Tenant
	//
	// name			: local tenant name
	// id			: local tenant id
	//
	deleteLocalTenant(name: string, id: string, callback: ErrorCallback): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}

		const _callback = callback;
		if(r3IsEmptyString(name, true) || r3IsEmptyString(id, true)){
			const _error = new Error('name(' + JSON.stringify(name) + ') or id(' + JSON.stringify(id) + ') parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}

		const _name		= name.trim();
		const _id		= id.trim();
		const _url		= '/v1/tenant/' + _name;
		const _urlargs	= 'id=' + _id;

		this.startProgress();																// start progressing

		this._delete(_url, _urlargs, null, this.tokenHeaderType.unscopedUserToken, (error: FetchError | null, resobj: valTypeAllObject) =>
		{
			this.stopProgress();															// stop progressing

			if(null !== error){
				console.error(error.message);
				_callback(error);
				return;
			}
			if(!isResBaseResult(resobj)){
				const err = new Error('Response data is sonmething wrong: ' + JSON.stringify(resobj));
				console.error(err.message);
				_callback(err);
				return;
			}
			if(true !== resobj.result){
				const err = new Error(r3GetSafeString(resobj.message, 'unknown'));
				console.error(err.message);
				_callback(err);
				return;
			}
			_callback(null);
		});
	}

	//--------------------------------------------------
	// TREE LIST( Role / Resource / Policy Tree List )
	//--------------------------------------------------
	//
	// Common raw method : convert tree list for container's data
	//
	rawCvtTreeListForContainer(resList: rawListData[], parentPath: string | null): TreeListItem[]
	{
		let	treeList: TreeListItem[] = [];
		if(!r3IsArray(resList)){
			return treeList;
		}
		let	separator = '';
		if(!r3IsString(parentPath) || r3IsEmptyString(parentPath)){
			parentPath = '';
		}else{
			separator = '/';
		}

		for(let cnt = 0; cnt < resList.length; ++cnt){
			treeList[cnt]	= {
				name:		resList[cnt].name,
				path:		parentPath + separator + resList[cnt].name,
				children:	(r3IsArray(resList[cnt].children) ? this.rawCvtTreeListForContainer(resList[cnt].children, parentPath + separator + treeList[cnt].name) : [])		// reentrant
			};
		}
		return treeList;
	}

	//
	// Common raw method : Get tree in tenant
	//
	rawGetTreeList(tenant: TenantData, service: string | null, type: ItemType, path: string | null, expand: boolean | null, callback: DataCallback<TreeListItem[]>): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}
		if(!isTenantData(tenant) || r3IsEmptyString(tenant.name)){
			const error = new Error('type(' + JSON.stringify(type) + ') or tenant(' + JSON.stringify(tenant) + ') parameters are wrong.');
			console.error(error.message);
			callback(error, null);
			return;
		}
		if(!isItemType(type)){
			const error = new Error('type(' + JSON.stringify(type) + ') or tenant(' + JSON.stringify(tenant) + ') parameters are wrong.');
			console.error(error.message);
			callback(error, null);
			return;
		}
		if(r3IsString(service) && r3IsEmptyString(service)){
			service = null;
		}

		const _callback	= callback;
		const _tenant	= tenant.name;
		const _path		= path;
		let	_url		= '/v1/list/';
		if(r3IsString(service)){
			_url		+= service + '/';
		}
		_url			+= type;
		if(r3IsString(path) && !r3IsEmptyString(path)){
			_url		+= '/' + path;
		}
		let	_urlargs: string | undefined = undefined;
		if(r3IsBoolean(expand)){
			_urlargs = 'expand=' + (expand ? 'true' : 'false');
		}

		this.startProgress();																// start progressing

		this._get(_url, _urlargs, null, _tenant, (error: FetchError | null, resobj: valTypeAllObject) =>
		{
			this.stopProgress();															// stop progressing

			if(null !== error){
				console.error(error.message);
				_callback(error, null);
				return;
			}
			if(!isResRawListData(resobj)){
				const err = new Error('Response data is sonmething wrong: ' + JSON.stringify(resobj));
				console.error(err.message);
				_callback(err, null);
				return;
			}
			if(true !== resobj.result){
				const err = new Error(r3GetSafeString(resobj.message, 'unknown'));
				console.error(err.message);
				_callback(err, null);
				return;
			}

			if(!r3IsArray(resobj.children)){
				_callback(null, this.rawCvtTreeListForContainer([], _path));
			}else{
				_callback(null, this.rawCvtTreeListForContainer(resobj.children, _path));
			}
		});
	}

	//
	// Get tree in tenant
	//
	getRoleTreeList(tenant: TenantData, service: string | null, path: string | null, expand: boolean | null, callback: DataCallback<TreeListItem[]>): void
	{
		this.rawGetTreeList(tenant, service, roleType, path, expand, callback);
	}

	getResourceTreeList(tenant: TenantData, service: string | null, path: string | null, expand: boolean | null, callback: DataCallback<TreeListItem[]>): void
	{
		this.rawGetTreeList(tenant, service, resourceType, path, expand, callback);
	}

	getPolicyTreeList(tenant: TenantData, service: string | null, path: string | null, expand: boolean | null, callback: DataCallback<TreeListItem[]>): void
	{
		this.rawGetTreeList(tenant, service, policyType, path, expand, callback);
	}

	getServiceTreeList(tenant: TenantData, expand: boolean, callback: DataCallback<TreeListItem[]>): void
	{
		const _tenant	= tenant;
		const _expand	= expand;
		const _callback	= callback;

		this.startProgress();																// start progressing

		//
		// Get service list for tenant
		//
		this.rawGetTreeList(_tenant, null, serviceType, null, false, (error, serviceChildren) =>
		{
			if(null !== error){
				console.error('Could not get SERVICE Tree list by ' + error.message);

				this.stopProgress();														// stop progressing
				_callback(error, null);
				return;
			}
			if(!r3IsArray(serviceChildren) || !serviceChildren.every((item: unknown) => isTreeListItem(item))){
				console.info('SERVICE Tree list is something wrong.');

				this.stopProgress();														// stop progressing
				_callback(null, []);
				return;
			}

			//
			// Check each service for distributed
			//
			if(0 < serviceChildren.length){
				const _serviceChildren = serviceChildren;
				for(let cnt = 0; cnt < _serviceChildren.length; ++cnt){
					((pos: number) =>
					{
						if(r3IsEmptyStringObject(_serviceChildren[pos], 'name')){
							return;
						}
						this.rawGetTreeListInServiceTenant(_tenant, _serviceChildren[pos].name, _expand, (children, distributed) =>
						{
							_serviceChildren[pos].children		= children;
							_serviceChildren[pos].distributed	= distributed;

							if((pos + 1) === _serviceChildren.length){
								this.stopProgress();										// stop progressing
								_callback(null, _serviceChildren);
							}
						});
					})(cnt);
				}
				this.stopProgress();														// stop progressing
			}else{
				this.stopProgress();														// stop progressing
				_callback(null, serviceChildren);
			}
		});
	}

	rawGetTreeListInServiceTenant(tenant: TenantData, servicename: string, expand: boolean, callback: (children: TreeListItem[], distributed: boolean) => void): void
	{
		const	_tenant						= tenant;
		const	_servicename				= servicename;
		const	_expand						= expand;
		const	_callback					= callback;
		let		_children: TreeListItem[]	= [];
		let		_distributed				= false;

		if(!isTenantData(_tenant) || r3IsEmptyString(_tenant.name) || r3IsEmptyString(_servicename)){
			_callback(_children, _distributed);
			return;
		}

		this.startProgress();																// start progressing

		//
		// Check role under service+tenant(If it is distributed, the service+tenant is existed)
		//
		this.getRoleTreeList(_tenant, _servicename, null, _expand, (error, roleChildren) =>
		{
			if(null !== error){
				console.info('Could not get ROLE Tree list in SERVICE+TENANT by ' + error.message);
			}

			//
			// Set distributed flag for service
			//
			if(null !== error || !r3IsArray(roleChildren) || 0 === roleChildren.length){
				_distributed = false;
			}else{
				// Role under service+tenant is existed(distributed).
				_distributed = true;
			}
			if(!_expand || !_distributed){
				// Not expand or not distributed
				this.stopProgress();														// stop progressing
				_callback(_children, _distributed);
				return;
			}

			_children = this.getEmptyTreeList(false);

			//
			// Set role under service+tenant
			//
			this.rawSetTreeListChildren(_children, roleType, roleChildren);

			//
			// Get resource under service+tenant
			//
			this.getResourceTreeList(_tenant, _servicename, null, _expand, (error, resourceChildren) =>
			{
				if(null !== error || !r3IsArray(resourceChildren) || 0 === resourceChildren.length){
					console.info('Could not get RESOURCE Tree list in SERVICE+TENANT by ' + r3GetSafeString(error?.message));
				}else{
					this.rawSetTreeListChildren(_children, resourceType, resourceChildren);
				}

				//
				// Get policy under service+tenant
				//
				this.getPolicyTreeList(_tenant, _servicename, null, _expand, (error, policyChildren) =>
				{
					if(null !== error || !r3IsArray(policyChildren) || 0 === policyChildren.length){
						console.info('Could not get POLICY Tree list in SERVICE+TENANT by ' + r3GetSafeString(error?.message));
					}else{
						this.rawSetTreeListChildren(_children, policyType, policyChildren);
					}
					this.stopProgress();														// stop progressing

					_callback(_children, _distributed);
				});
			});
		});
	}

	//
	// Get All Tree List for tenant
	//
	// array:	[
	//				{
	//					name:		"SERVICE"
	//					path:		"service:",
	//					children: [
	//						{
	//							name:		"path",
	//							path:		"full path",
	//							owner:		true,
	//							distributed:true/false,					=> the flag for this service is distributed under service+tenant
	//							children:	[							=> If service is distributed, this array has ROLE/RESOURCE/POLICY data for service+tenant
	//								{
	//									name:	"ROLE",
	//									...
	//								},
	//								{
	//									name:	"RESOURCE",
	//									...
	//								},
	//								{
	//									name:	"POLICY",
	//									...
	//								}
	//							]
	//						},
	//						...
	//					]
	//				},
	//				{
	//					name:		"ROLE"
	//					path:		"role:",
	//					children: [
	//						{
	//							name:		"path",
	//							path:		"full path",
	//							children: [
	//										...
	//							]
	//						},
	//						...
	//					]
	//				},
	//				{
	//					name:		"RESOURCE"
	//					path:		"resource:",
	//					children: [
	//						...
	//					]
	//				},
	//				{
	//					name:		"POLICY"
	//					path:		"policy:",
	//					children: [
	//						...
	//					]
	//				},
	//			]
	//
	// [NOTE]
	// This method always does not return error.
	//
	getAllTreeList(tenant: TenantData, callback: DataCallback<TreeListItem[]>): void
	{
		const _tenant	= tenant;
		const _callback	= callback;
		const _all		= this.getEmptyTreeList(true);

		if(!isTenantData(tenant) || r3IsEmptyString(tenant.name)){
			_callback(null, _all);
			return;
		}

		this.startProgress();																// start progressing

		this.getServiceTreeList(_tenant, true, (error, serviceChildren) =>
		{
			if(null !== error){
				console.error('Could not get SERVICE Tree list by ' + error.message);
			}else{
				this.rawSetTreeListChildren(_all, serviceType, serviceChildren);
			}

			this.getRoleTreeList(_tenant, null, null, true, (error, roleChildren) =>
			{
				if(null !== error){
					console.error('Could not get ROLE Tree list by ' + error.message);
				}else{
					this.rawSetTreeListChildren(_all, roleType, roleChildren);
				}

				this.getResourceTreeList(_tenant, null, null, true, (error, resourceChildren) =>
				{
					if(null !== error){
						console.error('Could not get RESOURCE Tree list by ' + error.message);
					}else{
						this.rawSetTreeListChildren(_all, resourceType, resourceChildren);
					}

					this.getPolicyTreeList(_tenant, null, null, true, (error, policyChildren) =>
					{
						if(null !== error){
							console.error('Could not get POLICY Tree list by ' + error.message);
						}else{
							this.rawSetTreeListChildren(_all, policyType, policyChildren);
						}
						this.stopProgress();												// stop progressing

						_callback(null, _all);
					});
				});
			});
		});
	}

	rawSetTreeListChildren(allTreeList: TreeListItem[], path: string, children: TreeListItem[]): boolean
	{
		if(!r3IsArray(allTreeList)){
			return false;
		}
		for(let cnt = 0; cnt < allTreeList.length; ++cnt){
			if(allTreeList[cnt].path === path){
				allTreeList[cnt].children = children;
				return true;
			}
		}
		return false;
	}

	getEmptyTreeList(is_service: boolean): TreeListItem[]
	{
		const treeList: TreeListItem[] = [];

		if(r3IsBoolean(is_service) && is_service){
			treeList.push({
				name:		serviceType.toUpperCase(),
				path:		serviceType,
				children:	[]
			});
		}

		treeList.push({
			name:		roleType.toUpperCase(),
			path:		roleType,
			children:	[]
		});

		treeList.push({
			name:		resourceType.toUpperCase(),
			path:		resourceType,
			children:	[]
		});

		treeList.push({
			name:		policyType.toUpperCase(),
			path:		policyType,
			children:	[]
		});
		return treeList;
	}

	//
	// Select pattern(see: r3container.jsx)
	//
	// [type]				[service]		[path]		[selected item]
	// ROLE/POLICY/RESOURCE	empty			empty/path	ROLE/POLICY/RESOURCE top or path under it
	// ROLE/POLICY/RESOURCE	service name	empty		"SERVICE > service name > ROLE/POLICY/RESOURCE"
	// ROLE/POLICY/RESOURCE	service name	path		"SERVICE > service name > ROLE/POLICY/RESOURCE > path"
	// SERVICE				empty			empty		SERVICE top
	// SERVICE				service name	empty		"SERVICE > service name"
	//
	selectTreeList(treeList: TreeListItem[], service: string | null, type: ItemType, path: string | null): boolean
	{
		if(!r3IsArray(treeList) || 0 === treeList.length){
			return false;
		}
		if(!isItemType(type)){
			return false;
		}

		if(r3CompareCaseString(serviceType, type)){
			//
			// This case is under SERVICE
			//
			if(!r3IsString(path) || !r3IsEmptyString(path, true)){
				console.error('Wrong parameter: type is SERVICE but specified path(' + path + ')');
				return false;
			}

			// search 'SERVICE' top
			for(let cnt = 0; cnt < treeList.length; ++cnt){
				if(!isTreeListItem(treeList[cnt]) || r3IsEmptyString(treeList[cnt].path) || !r3CompareCaseString(serviceType, treeList[cnt].path)){
					continue;									// not target tree
				}
				// found 'path' == 'service'

				// case : select "SERVICE" top
				if(!r3IsString(service) || r3IsEmptyString(service, true)){
					treeList[cnt].selected = true;
					return true;								// finish
				}

				// search 'service name' top in children
				if(!r3IsArray(treeList[cnt].children) || 0 === treeList[cnt].children.length){
					continue;									// SERVICE does not have children
				}
				for(let cnt2 = 0; cnt2 < treeList[cnt].children.length; ++cnt2){
					if(isTreeListItem(treeList[cnt].children[cnt2]) && !r3IsEmptyString(treeList[cnt].children[cnt2].path) && r3CompareCaseString(service, treeList[cnt].children[cnt2].path)){
						// found 'path' == 'service name'
						treeList[cnt].children[cnt2].selected = true;
						return true;							// finish
					}
				}
			}

		}else if(r3CompareCaseString(roleType, type) || r3CompareCaseString(policyType, type) || r3CompareCaseString(resourceType, type)){
			//
			// Case : selected item under ROLE/POLICY/RESOURCE
			//
			let	fullPath: string = type;						// target path is 'ROLE or POLICY or RESOURCE' or 'ROLE or POLICY or RESOURCE'/path...
			if(r3IsString(path) && !r3IsEmptyString(path, true)){
				fullPath += '/' + path.trim();
			}

			if(r3IsString(service) && !r3IsEmptyString(service, true)){
				//
				// The case is under SERVICE
				//
				// search 'SERVICE' top
				for(let cnt = 0; cnt < treeList.length; ++cnt){
					if(!isTreeListItem(treeList[cnt]) || r3IsEmptyString(treeList[cnt].path) || !r3CompareCaseString(serviceType, treeList[cnt].path)){
						continue;								// not target tree
					}
					// found 'path' == 'service'

					// search 'service name' top in children
					if(!r3IsArray(treeList[cnt].children) || 0 === treeList[cnt].children.length){
						continue;								// SERVICE does not have children
					}
					for(let cnt2 = 0; cnt2 < treeList[cnt].children.length; ++cnt2){
						if(isTreeListItem(treeList[cnt].children[cnt2]) && r3IsEmptyString(treeList[cnt].children[cnt2].path) && r3CompareCaseString(service, treeList[cnt].children[cnt2].path)){
							// found 'path' == 'service name'
							return this.selectSubTreeList(treeList[cnt].children[cnt2].children, fullPath);
						}
					}
				}
			}else{
				//
				// The case is not under SERVICE
				//
				return this.selectSubTreeList(treeList, fullPath);
			}
		}else{
			console.error('Wrong parameter: unknown type(' + JSON.stringify(type) + ')');
		}
		return false;											// not found
	}

	selectSubTreeList(subTreeList: TreeListItem[], path: string): boolean
	{
		if(!r3IsArray(subTreeList) || 0 === subTreeList.length){
			return false;
		}
		if(r3IsEmptyString(path, true)){
			return false;
		}

		const pos						= path.indexOf('/');
		let	curPath						= path;
		let	childPath: string | null	= null;
		if(0 === pos){
			return false;
		}else if(0 < pos){
			curPath		= path.substring(0, pos);
			childPath	= path.substring(pos + 1);
		}

		// search current path top
		for(let cnt = 0; cnt < subTreeList.length; ++cnt){
			if(isTreeListItem(subTreeList[cnt]) && !r3IsEmptyString(subTreeList[cnt].name) && r3CompareCaseString(curPath, subTreeList[cnt].name)){
				// found 'name' == current path
				if(!r3IsString(childPath) || r3IsEmptyString(childPath, true)){
					subTreeList[cnt].selected = true;
					return true;									// finish
				}

				// search child path under current path in children
				if(!r3IsArray(subTreeList[cnt].children) || 0 === subTreeList[cnt].children.length){
					continue;										// current path does not have children
				}
				// reentrant
				return this.selectSubTreeList(subTreeList[cnt].children, childPath);
			}
		}
		return false;
	}

	//
	// Check service owner
	//
	checkServiceOwnerInTreeList(treeList: TreeListItem[], service: string): boolean
	{
		if(!r3IsArray(treeList) || 0 === treeList.length || r3IsEmptyString(service, true)){
			return false;
		}
		const _service = service.trim();

		// search 'SERVICE' top
		for(let cnt = 0; cnt < treeList.length; ++cnt){
			if(!isTreeListItem(treeList[cnt]) || r3IsEmptyString(treeList[cnt].path) || !r3CompareCaseString(serviceType, treeList[cnt].path)){
				continue;									// not target tree
			}
			// search 'service name' top in children
			if(!r3IsArray(treeList[cnt].children) || 0 === treeList[cnt].children.length){
				continue;									// SERVICE does not have children
			}
			for(let cnt2 = 0; cnt2 < treeList[cnt].children.length; ++cnt2){
				if(isTreeListItem(treeList[cnt].children[cnt2]) && !r3IsEmptyString(treeList[cnt].children[cnt2].path) && r3CompareCaseString(_service, treeList[cnt].children[cnt2].path)){
					// found 'path' == 'service name'
					if(r3IsBoolean(treeList[cnt].children[cnt2].owner) && true === treeList[cnt].children[cnt2].owner){
						// service owner is tenant
						return true;
					}
				}
			}
		}
		return false;
	}

	//
	// Check service tenant type
	//
	checkServiceTenantInTreeList(treeList: TreeListItem[], service: string): boolean
	{
		if(!r3IsArray(treeList) || 0 === treeList.length || r3IsEmptyString(service, true)){
			return false;
		}
		const _service = service.trim();

		// search 'SERVICE' top
		for(let cnt = 0; cnt < treeList.length; ++cnt){
			if(!isTreeListItem(treeList[cnt]) || r3IsEmptyString(treeList[cnt].path) || !r3CompareCaseString(serviceType, treeList[cnt].path)){
				continue;									// not target tree
			}
			// search 'service name' top in children
			if(!r3IsArray(treeList[cnt].children) || 0 === treeList[cnt].children.length){
				continue;									// SERVICE does not have children
			}
			for(let cnt2 = 0; cnt2 < treeList[cnt].children.length; ++cnt2){					// found 'path' == 'service name'
				if(isTreeListItem(treeList[cnt].children[cnt2]) && !r3IsEmptyString(treeList[cnt].children[cnt2].path) && r3CompareCaseString(_service, treeList[cnt].children[cnt2].path)){
					// found 'path' == 'service name'
					if(r3IsArray(treeList[cnt].children[cnt2].children) && 0 < treeList[cnt].children[cnt2].children.length){
						// service has children, thus service is mapped service tenant.
						return true;
					}
				}
			}
		}
		return false;
	}

	//--------------------------------------------------
	// Get Detail information for path
	//--------------------------------------------------
	getPathDetailInfo(tenant: TenantData | null, service: string | null, isServiceOwner: boolean, hasServiceTenant: boolean, type: ItemType | null, path: string | null): PathDetailInfo
	{
		let	_tenant: TenantData | null	= null;
		let	_service: string | null		= null;
		let	_serviceOwner				= false;
		let	_hasServiceTenant			= false;
		let	_type: ItemType | null		= null;
		let	_name: string | null		= null;
		let	_fullpath: string | null	= null;
		let	_currentpath: string | null	= null;
		let	_hasParent					= false;
		let	_canCreatePath				= false;
		let	_canCreateService			= false;

		if(isTenantData(tenant) && !r3IsEmptyString(tenant.name)){
			_tenant = tenant;

			if((isItemType(type) && serviceType === type) || (r3IsString(service) && !r3IsEmptyString(service))){
				// [SELECTED TENANT] > SERVICE
				_type = type;

				// under service
				if(!r3IsString(service) || r3IsEmptyString(service)){
					// [SELECTED TENANT] > SERVICE
					_fullpath			= 'yrn:yahoo::::service';
					_canCreateService	= true;

				}else if(isItemType(type) && (resourceType === type || roleType === type || policyType === type)){
					// [SELECTED TENANT] > SERVICE > service > ROLE/POLICY/RESOURCE
					_service			= service;
					_serviceOwner		= isServiceOwner;
					_fullpath			= 'yrn:yahoo:' + _service + '::' + _tenant.name + ':' + _type;
					_currentpath		= '';

					if(r3IsString(path) && !r3IsEmptyString(path)){
						// [SELECTED TENANT] > SERVICE > service > ROLE/POLICY/RESOURCE > path
						const splitedPath = path.split('/');
						if(1 < splitedPath.length){
							_hasParent	= true;
						}
						_name			= splitedPath[splitedPath.length - 1];
						_fullpath		+= ':' + path;
						_currentpath 	= path;
					}
				}else{
					// [SELECTED TENANT] > SERVICE > service
					_service			= service;
					_serviceOwner		= isServiceOwner;
					_hasServiceTenant	= hasServiceTenant;
					_fullpath			= 'yrn:yahoo::::service:' + _service;
				}

			}else if(isItemType(type) && (resourceType === type || roleType === type || policyType === type)){
				// [SELECTED TENANT] > ROLE/POLICY/RESOURCE
				_type			= type;
				_fullpath		= 'yrn:yahoo:::' + _tenant.name + ':' + _type;
				_currentpath	= '';

				if(!r3IsString(path) || r3IsEmptyString(path)){
					// [SELECTED TENANT] > ROLE/POLICY/RESOURCE
					_canCreatePath = true;
				}else{
					// [SELECTED TENANT] > ROLE/POLICY/RESOURCE > path
					const splitedPath	= path.split('/');
					if(1 < splitedPath.length){
						_hasParent	= true;
					}
					_name			= splitedPath[splitedPath.length - 1];
					_fullpath		+= ':' + path;
					_currentpath	= path;

					if(resourceType === type || roleType === type){
						_canCreatePath = true;
					}
				}
			}else{
				// [SELECTED TENANT]
				_fullpath		= 'yrn:yahoo:::' + _tenant.name;
				_currentpath	= '';
			}
		}
		return {
			tenant:				_tenant,
			service:			_service,
			serviceOwner:		_serviceOwner,
			hasServiceTenant:	_hasServiceTenant,
			type:				_type,
			name:				_name,
			fullpath:			_fullpath,
			currentpath:		_currentpath,
			hasParent:			_hasParent,
			canCreatePath:		_canCreatePath,
			canCreateService:	_canCreateService
		};
	}

	//--------------------------------------------------
	// Common
	//--------------------------------------------------
	createEmptyData(tenant: TenantData, type: ItemType, path: string, callback: ErrorCallback): void
	{
		if(!isItemType(type)){
			const error = new Error('create empty data for unknown type(' + JSON.stringify(type) + ')');
			console.error(error.message);
			callback(error);
		}else if(roleType === type){
			this.createEmptyRoleData(tenant, path, callback);
		}else if(policyType === type){
			this.createEmptyPolicyData(tenant, path, callback);
		}else if(resourceType === type){
			this.createEmptyResourceData(tenant, path, callback);
		}else{
			const error = new Error('create empty data for unknown type(' + JSON.stringify(type) + ')');
			console.error(error.message);
			callback(error);
		}
	}

	removeData(tenant: TenantData, type: ItemType, path: string, callback: ErrorCallback): void
	{
		if(!isItemType(type)){
			const error = new Error('remove data for unknown type(' + JSON.stringify(type) + ')');
			console.error(error.message);
			callback(error);
		}else if(roleType === type){
			this.removeRoleData(tenant, path, callback);
		}else if(policyType === type){
			this.removePolicyData(tenant, path, callback);
		}else if(resourceType === type){
			this.removeResourceData(tenant, path, callback);
		}else{
			const error = new Error('remove data for unknown type(' + JSON.stringify(type) + ')');
			console.error(error.message);
			callback(error);
		}
	}

	updateData(tenant: TenantData, type: ItemType, path: string, data: RoleData | PolicyData | ResourceData, callback: ErrorCallback): void
	{
		if(!isItemType(type)){
			const error = new Error('update data for unknown type(' + JSON.stringify(type) + ')');
			console.error(error.message);
			callback(error);

		}else if(roleType === type && isRoleData(data)){
			this.updateRoleData(tenant, path, data, true, callback);

		}else if(policyType === type && isPolicyData(data)){
			this.updatePolicyData(tenant, path, data, callback);

		}else if(resourceType === type && isResourceData(data)){
			this.updateResourceData(tenant, path, data, callback);

		}else{
			const error = new Error('update data for unknown type(' + JSON.stringify(type) + ')');
			console.error(error.message);
			callback(error);
		}
	}

	//--------------------------------------------------
	// Service
	//--------------------------------------------------
	//
	// Get Service data
	//
	// tenant		: tenant name
	// servicename	: service name
	//
	getServiceData(tenant: TenantData, servicename: string, callback: DataCallback<ServiceData>): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}
		const _callback = callback;
		if(!isTenantData(tenant) || !r3IsString(servicename) || r3IsEmptyString(servicename, true)){
			const _error = new Error('tenant(' + JSON.stringify(tenant) + ') or service(' + JSON.stringify(servicename) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error, null);
			return;
		}
		const _tenant	= tenant.name;
		const _service	= servicename.trim();
		const _url		= '/v1/service/' + _service;

		this.startProgress();																// start progressing

		this._get(_url, null, null, _tenant, (error: FetchError | null, resobj: valTypeAllObject) =>
		{
			this.stopProgress();															// stop progressing

			if(null !== error){
				console.error(error.message);
				_callback(error, null);
				return;
			}
			if(!isResServiceData(resobj) || !r3IsBoolean(resobj.result) || !resobj.result){
				const err = new Error(r3IsString(resobj.message) ? resobj.message : 'unknown');
				console.error(err.message);
				_callback(err, null);
				return;
			}

			_callback(null, isServiceData(resobj.service) ? resobj.service : null);
		});
	}

	//
	// Update Service data
	//
	// tenant		: tenant name
	// servicename	: service name
	// tenants		: adding tenant name(s), this value means following:
	//					undefined		do not set any new tenants
	//					null			do not set any new tenants(but if clear_tenant is true, remove all tenants without owner)
	//					string			set one new tenant(if clear_tenant is true, remove existing tenants without owner)
	//					array			set some new tenant(if clear_tenant is true, remove existing tenants without owner)
	// clear_tenant	: value is true, it means remove tenants without "tenants"
	// verify		: verify url/object, if undefined/null, verify is not update.
	//
	updateServiceData(tenant: TenantData, servicename: string, tenants: string[] | string | null | undefined, clear_tenant: boolean, verify: string | ServiceResourceObject[] | null, callback: ErrorCallback): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}
		const _callback = callback;

		if(!isTenantData(tenant) || r3IsEmptyString(tenant.name, true) || !r3IsString(servicename) || r3IsEmptyString(servicename, true)){
			const _error = new Error('tenant(' + JSON.stringify(tenant) + ') or service(' + JSON.stringify(servicename) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}
		const	_service					= servicename.trim();
		let		_tenants: string[] | null	= null;
		let		_is_clear: boolean			= false;
		let		_verify: string | null		= null;

		if(undefined !== tenants){
			if(r3IsBoolean(clear_tenant) && true === clear_tenant){
				_is_clear = true;
			}
			if(r3IsStringArray(tenants) && 0 < tenants.length){
				_tenants = tenants;
			}else if(r3IsString(tenants) && !r3IsEmptyString(tenants)){
				_tenants = [tenants];
			}
		}
		if(r3IsString(verify)){
			_verify = verify;
		}else if(isServiceResourceObjectArray(verify)){
			_verify = JSON.stringify(verify);
		}
		if(null === _tenants && false === _is_clear && null === _verify){
			const _error = new Error('Nothing to update for service');
			console.error(_error.message);
			_callback(_error);
			return;
		}

		const _tenant						= tenant.name;
		const _url							= '/v1/service/' + _service;
		let	_urlargs: string | undefined	= undefined;
		if(r3IsStringArray(_tenants) && 0 < _tenants.length){
			_urlargs = 'tenant=' + JSON.stringify(_tenants);
		}
		if(_is_clear){
			_urlargs = (undefined !== _urlargs ? _urlargs + '&' : '') + 'clear_tenant=true';
		}
		if(null !== _verify){
			_urlargs = (undefined !== _urlargs ? _urlargs + '&' : '') + 'verify=' + JSON.stringify(_verify);
		}

		this.startProgress();																// start progressing

		this._put(_url, _urlargs, null, _tenant, (error: FetchError | null, resobj: valTypeAllObject) => {
			this.stopProgress();															// stop progressing

			if(null !== error){
				console.error(error.message);
				_callback(error);
				return;
			}
			if(!isResBaseResult(resobj)){
				const err = new Error('Response object is unknown object.');
				console.error(err.message);
				_callback(err);
				return;
			}
			if(!resobj.result){
				const err = new Error(r3GetSafeString(resobj.message, 'unknown'));
				console.error(r3GetSafeString(resobj.message, 'unknown'));
				_callback(err);
				return;
			}
			_callback(null);
		});
	}

	//
	// Create Initialized Service
	//
	// tenant		: tenant name
	// servicename	: service name
	// verify		: verify url or static resource data object
	//
	createInitializedService(tenant: TenantData, servicename: string, verify: string, callback: ErrorCallback): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}
		const _callback = callback;
		if(!isTenantData(tenant) || r3IsEmptyString(tenant.name, true) || !r3IsString(servicename) || r3IsEmptyString(servicename, true) || !r3IsString(verify) || r3IsEmptyString(verify)){
			const _error = new Error('tenant(' + JSON.stringify(tenant) + ') or service(' + JSON.stringify(servicename) + ') or verify(' + JSON.stringify(verify) + ') parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}
		const _tenant	= tenant.name;
		const _service	= servicename.trim();
		const _verify	= verify.trim();
		const _url		= '/v1/service';
		const _urlargs	= 'name=' + _service + '&verify=' + JSON.stringify(_verify);

		this.startProgress();																// start progressing

		this._put(_url, _urlargs, null, _tenant, (error: FetchError | null, resobj: valTypeAllObject) =>
		{
			this.stopProgress();															// stop progressing

			if(null !== error){
				console.error(error.message);
				_callback(error);
				return;
			}
			if(!isResBaseResult(resobj)){
				const err = new Error('Response object is unknown object.');
				console.error(err.message);
				_callback(err);
				return;
			}
			if(!resobj.result){
				const err = new Error(r3GetSafeString(resobj.message, 'unknown'));
				console.error(r3GetSafeString(resobj.message, 'unknown'));
				_callback(err);
				return;
			}
			_callback(null);
		});
	}

	//
	// Remove Service or Service tenant
	//
	// tenant		: tenant name
	// servicename	: service name
	//
	removeService(tenant: TenantData, servicename: string, isServiceTenant: boolean, callback: ErrorCallback): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}
		const _callback = callback;

		if(!isTenantData(tenant) || r3IsEmptyString(tenant.name, true) || !r3IsString(servicename) || r3IsEmptyString(servicename, true)){
			const _error = new Error('tenant(' + JSON.stringify(tenant) + ') or service(' + JSON.stringify(servicename) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}
		const _tenant						= tenant.name;
		const _service						= servicename.trim();
		const _url							= '/v1/service/' + _service;
		let	_urlargs: string | undefined	= undefined;
		if(r3IsBoolean(isServiceTenant) && true === isServiceTenant){
			_urlargs = 'tenant=' + tenant.name;
		}

		this.startProgress();																// start progressing

		this._delete(_url, _urlargs, null, _tenant, (error: FetchError | null, resobj: valTypeAllObject) =>
		{
			this.stopProgress();															// stop progressing

			if(null !== error){
				console.error(error.message);
				_callback(error);
				return;
			}
			if(!isResBaseResult(resobj)){
				const err = new Error('Response object is unknown object.');
				console.error(err.message);
				_callback(err);
				return;
			}
			if(!resobj.result){
				const err = new Error(r3GetSafeString(resobj.message, 'unknown'));
				console.error(r3GetSafeString(resobj.message, 'unknown'));
				_callback(err);
				return;
			}
			_callback(null);
		});
	}

	//
	// Utility: Get error string which is result of verifying service resource
	//
	getErrorServiceResourceVerify(serviceResource: StaticResourceObject[] | string): string | null
	{
		const	checkResult				= checkServiceResourceValue(serviceResource);
		let		result: string | null	= null;
		if(r3IsString(checkResult.error)){
			if(r3IsEmptyStringObject(this.r3TextRes, checkResult.error)){
				result = this.r3TextRes.eUnknownErrorKey;
			}else{
				result = this.r3TextRes[checkResult.error];
			}
		}
		return result;
	}

	//--------------------------------------------------
	// ACR(Create SERVICE/TENANT)
	//--------------------------------------------------
	//
	// Create SERVICE/TENANT
	//
	// tenant		: tenant object
	// servicename	: service name
	// role			: default link alias role name(allowed empty)
	//
	createServiceTenant(tenant: TenantData, servicename: string, role: string | null, callback: ErrorCallback): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}
		const _role		= role;
		const _callback	= callback;
		if(!isTenantData(tenant) || r3IsEmptyString(tenant.name, true) || !r3IsString(servicename) || r3IsEmptyString(servicename, true)){
			const _error = new Error('tenant(' + JSON.stringify(tenant) + ') or service(' + JSON.stringify(servicename) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}
		const _tenant	= tenant;
		const _service	= servicename.trim();
		const _url		= '/v1/acr/' + _service;

		this.startProgress();																// start progressing

		this._put(_url, null, null, _tenant.name, (error: FetchError | null, resobj: valTypeAllObject) =>
		{
			if(null !== error){
				console.error(error.message);
				this.stopProgress();														// stop progressing
				_callback(error);
				return;
			}
			if(!isResBaseResult(resobj)){
				const err = new Error('Response object is unknown object.');
				console.error(err.message);
				this.stopProgress();														// stop progressing
				_callback(err);
				return;
			}
			if(!resobj.result){
				const err = new Error(r3GetSafeString(resobj.message, 'unknown'));
				console.error(r3GetSafeString(resobj.message, 'unknown'));
				this.stopProgress();														// stop progressing
				_callback(err);
				return;
			}

			// check role name
			if(!r3IsString(_role) || r3IsEmptyString(_role, true)){
				this.stopProgress();														// stop progressing
				_callback(null);
				return;
			}

			// set role alias
			this.setServiceTenantRoleAlias(_tenant, _service, _role.trim(), _callback);

			this.stopProgress();															// stop progressing
		});
	}

	//
	// Set SERVICE/TENANT's role into ROLE alias
	//
	// tenant		: tenant object
	// servicename	: service name
	// role			: role name
	//
	setServiceTenantRoleAlias(tenant: TenantData, servicename: string, role: string, callback: ErrorCallback): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}
		const _callback = callback;
		if(!isTenantData(tenant) || r3IsEmptyString(tenant.name, true) || !r3IsString(servicename) || r3IsEmptyString(servicename, true) || !r3IsString(role) || r3IsEmptyString(role, true)){
			const _error = new Error('tenant(' + JSON.stringify(tenant) + ') or service(' + JSON.stringify(servicename) + ') or role(' + JSON.stringify(role) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}

		//
		// get role data
		//
		const _tenant	= tenant;
		const _service	= servicename.trim();
		const _role		= role.trim();

		this.startProgress();																// start progressing

		this.getRoleData(_tenant, null, _role, false, (error: FetchError | null, roledata: valTypeAllObject) =>
		{
			if(null !== error){
				console.error(error.message);
				this.stopProgress();														// stop progressing
				_callback(error);
				return;
			}
			if(!isRoleData(roledata)){
				const err = new Error('Could not get role data for tenant(' + _tenant.name + '), path(' + _role + ')');
				console.error(err.message);
				this.stopProgress();														// stop progressing
				_callback(err);
				return;
			}

			//
			// SERVICE+TENANT ROLE path
			// ( yrn:yahoo:<service name>::<tenant name>:role:acr-role )
			//
			const _service_tenant_role = 'yrn:yahoo:' + _service + '::' + _tenant.name + ':role:acr-role';

			// add alias to service
			const aliases: string[] = [];
			if(r3IsStringArray(roledata.aliases)){
				for(let cnt = 0; cnt < roledata.aliases.length; ++cnt){
					if(r3CompareCaseString(roledata.aliases[cnt], _service_tenant_role)){
						// already has role in alias
						this.stopProgress();													// stop progressing
						_callback(null);
						return;
					}
				}
			}
			roledata.aliases.push(_service_tenant_role);

			//
			// update role for alias
			//
			this.updateRoleData(_tenant, _role, roledata, false, (error: FetchError | null) =>
			{
				this.stopProgress();														// stop progressing

				if(null !== error){
					console.error(error.message);
				}
				_callback(error);
			});
		});
	}

	//--------------------------------------------------
	// Role
	//--------------------------------------------------
	//
	// Get Role data
	//
	getRoleData(tenant: TenantData, service: string | null, path: string, expand: boolean, callback: DataCallback<RoleData>): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}
		const _callback = callback;
		if(!isTenantData(tenant) || r3IsEmptyString(tenant.name, true) || !r3IsString(path) || r3IsEmptyString(path, true)){
			const _error = new Error('tenant(' + JSON.stringify(tenant) + ') or path(' + JSON.stringify(path) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error, null);
			return;
		}

		const _tenant	= tenant.name;
		let	_url		= '/v1/role/';
		if(!r3IsString(service) || r3IsEmptyString(service, true)){
			_url		+= path;
		}else{
			// path under service, then full yrn path
			_url		+= 'yrn:yahoo:' + service + '::' + tenant.name + ':role:' + path;
		}
		let	_urlargs: string | undefined = undefined;
		if(r3IsBoolean(expand)){
			_urlargs	= 'expand=' + (expand ? 'true' : 'false');
		}

		this.startProgress();																// start progressing

		this._get(_url, _urlargs, null, _tenant, (error: FetchError | null, resobj: valTypeAllObject) =>
		{
			this.stopProgress();															// stop progressing

			if(null !== error){
				console.error(error.message);
				_callback(error, null);
				return;
			}
			if(!isResRoleData(resobj) || !r3IsBoolean(resobj.result) || !resobj.result){
				const err = new Error(r3GetSafeString(resobj.message, 'unknown'));
				console.error(r3GetSafeString(resobj.message, 'unknown'));
				_callback(err, null);
				return;
			}
			_callback(null, isRoleData(resobj.role) ? resobj.role : null);
		});
	}

	//
	// Update Role data
	//
	updateRoleData(tenant: TenantData, path: string, data: RoleData | null, isOWHosts: boolean, callback: ErrorCallback): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}
		const _callback					= callback;
		const _role: RoleData | null	= isRoleData(data) ? data : null;
		const _isow						= r3IsBoolean(isOWHosts) ? isOWHosts : false;
		if(!isTenantData(tenant) || r3IsEmptyString(tenant.name, true) || !r3IsString(path) || r3IsEmptyString(path, true)){
			const _error = new Error('tenant(' + JSON.stringify(tenant) + ') or path(' + JSON.stringify(path) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}

		const	_tenant	= tenant.name;
		const	_path	= path.trim();
		let		_url	= '/v1/role';
		let		_urlargs= 'name=' + _path;

		if(null !== _role && r3IsStringArray(_role.policies)){
			_urlargs += '&policies=' + JSON.stringify(_role.policies);
		}
		if(null !== _role && r3IsStringArray(_role.aliases)){
			_urlargs += '&alias=' + JSON.stringify(_role.aliases);
		}

		this.startProgress();																// start progressing

		this._put(_url, _urlargs, null, _tenant, (error: FetchError | null, resobj: valTypeAllObject) =>
		{
			if(null !== error){
				console.error(error.message);
				this.stopProgress();														// stop progressing
				_callback(error);
				return;
			}
			if(!isResBaseResult(resobj)){
				const err = new Error('Response object is unknown object.');
				console.error(err.message);
				this.stopProgress();														// stop progressing
				_callback(err);
				return;
			}
			if(!resobj.result){
				const err = new Error(r3GetSafeString(resobj.message, 'unknown'));
				console.error(r3GetSafeString(resobj.message, 'unknown'));
				this.stopProgress();														// stop progressing
				_callback(err);
				return;
			}

			// check hosts.{hostnames, ips}
			let	hosts: string[] = [];
			if(null !== _role && isRoleHostList(_role.hosts) && 0 < _role.hosts.hostnames.length){
				hosts = hosts.concat(_role.hosts.hostnames);
			}
			if(null !== _role && isRoleHostList(_role.hosts) && 0 < _role.hosts.ips.length){
				hosts = hosts.concat(_role.hosts.ips);
			}
			if(0 === hosts.length && !_isow){
				// finish
				this.stopProgress();														// stop progressing
				_callback(null);
				return;
			}

			// build post hosts arguments
			_url	= '/v1/role/' + _path;

			const _body: reqSetRoleHosts = {
				host:			[],
				clear_hostname:	_isow,
				clear_ips:		_isow
			};

			for(let cnt = 0; cnt < hosts.length; ++cnt){
				const tmpCombine	= parseCombineHostObject(hosts[cnt]);
				const onehost: RoleHostInfo = {
					host:		tmpCombine.host,
					port:		parseInt(String(tmpCombine.port)),
					cuk:		tmpCombine.cuk,
					extra:		tmpCombine.extra,
					tag:		tmpCombine.tag
				};
				if(!r3IsEmptyString(tmpCombine.inboundip)){
					onehost.inboundip	= tmpCombine.inboundip;
				}
				if(!r3IsEmptyString(tmpCombine.outboundip)){
					onehost.outboundip	= tmpCombine.outboundip;
				}
				_body.host.push(onehost);
			}

			// update hosts
			this._post(_url, null, _tenant, _body, true, (error: FetchError | null, resobj: valTypeAllObject) =>
			{
				this.stopProgress();														// stop progressing

				if(null !== error){
					console.error(error.message);
					_callback(error);
					return;
				}
				if(!isResBaseResult(resobj)){
					const err = new Error('Response object is unknown object.');
					console.error(err.message);
					_callback(err);
					return;
				}
				if(!resobj.result){
					const err = new Error(r3GetSafeString(resobj.message, 'unknown'));
					console.error(r3GetSafeString(resobj.message, 'unknown'));
					_callback(err);
					return;
				}
				_callback(null);
			});
		});
	}

	//
	// Create Empty Role data
	//
	createEmptyRoleData(tenant: TenantData, path: string, callback: ErrorCallback): void
	{
		return this.updateRoleData(tenant, path, null, true, callback);
	}

	//
	// Remove Role data
	//
	removeRoleData(tenant: TenantData, path: string, callback: ErrorCallback): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}
		const _callback = callback;
		if(!isTenantData(tenant) || r3IsEmptyString(tenant.name, true) || !r3IsString(path) || r3IsEmptyString(path, true)){
			const _error = new Error('tenant(' + JSON.stringify(tenant) + ') or path(' + JSON.stringify(path) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}

		const _tenant	= tenant.name;
		const _path		= path.trim();
		const _url		= '/v1/role/' + _path;

		this.startProgress();																// start progressing

		this._delete(_url, null, null, _tenant, (error: FetchError | null, resobj: valTypeAllObject) =>
		{
			this.stopProgress();															// stop progressing

			if(null !== error){
				console.error(error.message);
				_callback(error);
				return;
			}
			if(!isResBaseResult(resobj)){
				const err = new Error('Response object is unknown object.');
				console.error(err.message);
				_callback(err);
				return;
			}
			if(!resobj.result){
				const err = new Error(r3GetSafeString(resobj.message, 'unknown'));
				console.error(r3GetSafeString(resobj.message, 'unknown'));
				_callback(err);
				return;
			}
			_callback(null);
		});
	}

	//--------------------------------------------------
	// Policy
	//--------------------------------------------------
	//
	// Get Policy data
	//
	getPolicyData(tenant: TenantData, service: string | null, path: string, callback: DataCallback<PolicyData>): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}
		const _callback = callback;
		if(!isTenantData(tenant) || r3IsEmptyString(tenant.name, true) || !r3IsString(path) || r3IsEmptyString(path, true)){
			const _error = new Error('tenant(' + JSON.stringify(tenant) + ') or path(' + JSON.stringify(path) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error, null);
			return;
		}

		const _tenant	= tenant.name;
		let	_url		= '/v1/policy/';
		if(!r3IsString(service) || r3IsEmptyString(service, true)){
			_url		+= path;
		}else{
			// path under service, then full yrn path
			//
			// [TODO]
			// This API gets service name by urlarg instead of yrn full path.
			// (If you set yrn full path for service name, but API does not use it!)
			// The API should use/check full yrn path.
			//
			_url		+= 'yrn:yahoo:' + service + '::' + tenant.name + ':policy:' + path;
		}

		this.startProgress();																// start progressing

		this._get(_url, null, null, _tenant, (error: FetchError | null, resobj: valTypeAllObject) =>
		{
			this.stopProgress();															// stop progressing

			if(null !== error){
				console.error(error.message);
				_callback(error, null);
				return;
			}
			if(!isResPolicyData(resobj) || !r3IsBoolean(resobj.result) || !resobj.result){
				const err = new Error(r3GetSafeString(resobj.message, 'unknown'));
				console.error(r3GetSafeString(resobj.message, 'unknown'));
				_callback(err, null);
				return;
			}
			_callback(null, isPolicyData(resobj.policy) ? resobj.policy : null);
		});
	}

	//
	// Update Policy data
	//
	updatePolicyData(tenant: TenantData, path: string, data: PolicyData, callback: ErrorCallback): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}
		const _callback						= callback;
		const _policy: PolicyData | null	= isPolicyData(data) ? data : null;
		if(!isTenantData(tenant) || r3IsEmptyString(tenant.name, true) || !r3IsString(path) || r3IsEmptyString(path, true)){
			const _error = new Error('tenant(' + JSON.stringify(tenant) + ') or path(' + JSON.stringify(path) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}

		const _tenant	= tenant.name;
		const _path		= path.trim();
		let	_urlargs	= 'name=' + _path;
		if(null !== _policy){
			if(isPolicyEffectType(_policy.effect)){
				_urlargs	+= '&effect=' + _policy.effect;
			}
			if(isPolicyActionTypeArray(_policy.action)){
				_urlargs	+= '&action=' + JSON.stringify(_policy.action);
			}
			if(r3IsStringArray(_policy.resource)){
				_urlargs	+= '&resource=' + JSON.stringify(_policy.resource);
			}
			if(r3IsStringArray(_policy.alias)){
				_urlargs	+= '&alias=' + JSON.stringify(_policy.alias);
			}
		}

		this.startProgress();																// start progressing

		this._put('/v1/policy', _urlargs, null, _tenant, (error: FetchError | null, resobj: valTypeAllObject) =>
		{
			this.stopProgress();															// stop progressing

			if(null !== error){
				console.error(error.message);
				_callback(error);
				return;
			}
			if(!isResBaseResult(resobj)){
				const err = new Error('Response object is unknown object.');
				console.error(err.message);
				_callback(err);
				return;
			}
			if(!resobj.result){
				const err = new Error(r3GetSafeString(resobj.message, 'unknown'));
				console.error(r3GetSafeString(resobj.message, 'unknown'));
				_callback(err);
				return;
			}
			_callback(null);
		});
	}

	//
	// Create Empty Policy data
	//
	createEmptyPolicyData(tenant: TenantData, path: string, callback: ErrorCallback): void
	{
		// default	action is read('yrn:yahoo::::action:read');
		//			effect is allow
		//
		// [NOTE]
		// The name member in PolicyData is not used, but the path parameter is used instead of it.
		//
		return this.updatePolicyData(tenant, path, { name: '', action: [actionValueRead], effect: effectValueAllow, resource: [], alias: [] }, callback);
	}

	//
	// Remove Policy data
	//
	removePolicyData(tenant: TenantData, path: string, callback: ErrorCallback): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}

		const _callback	= callback;
		if(!isTenantData(tenant) || r3IsEmptyString(tenant.name, true) || !r3IsString(path) || r3IsEmptyString(path, true)){
			const _error = new Error('tenant(' + JSON.stringify(tenant) + ') or path(' + JSON.stringify(path) + ')  parameters are wrong.');
			_callback(_error);
			return;
		}
		const _url	= '/v1/policy/' + path.trim();

		this.startProgress();																// start progressing

		this._delete(_url, null, null, tenant.name, (error: FetchError | null, resobj: valTypeAllObject) =>
		{
			this.stopProgress();															// stop progressing

			if(null !== error){
				console.error(error.message);
				_callback(error);
				return;
			}
			if(!isResBaseResult(resobj)){
				const err = new Error('Response object is unknown object.');
				console.error(err.message);
				_callback(err);
				return;
			}
			if(!resobj.result){
				const err = new Error(r3GetSafeString(resobj.message, 'unknown'));
				console.error(r3GetSafeString(resobj.message, 'unknown'));
				_callback(err);
				return;
			}
			_callback(null);
		});
	}

	//--------------------------------------------------
	// Resource
	//--------------------------------------------------
	//
	// Get Resource data
	//
	getResourceData(tenant: TenantData, service: string | null, path: string, expand: boolean, callback: DataCallback<ResourceData>): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}
		const _callback	= callback;
		if(!isTenantData(tenant) || r3IsEmptyString(tenant.name, true) || !r3IsString(path) || r3IsEmptyString(path, true)){
			const _error = new Error('tenant(' + JSON.stringify(tenant) + ') or path(' + JSON.stringify(path) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error, null);
			return;
		}

		const _tenant	= tenant.name;
		let	_url		= '/v1/resource/';
		if(!r3IsString(service) || r3IsEmptyString(service, true)){
			_url		+= path;
		}else{
			// path under service, then full yrn path
			//
			// [TODO]
			// This API gets service name by urlarg instead of yrn full path.
			// (If you set yrn full path for service name, but API does not use it!)
			// The API should use/check full yrn path.
			//
			_url		+= 'yrn:yahoo:' + service + '::' + tenant.name + ':resource:' + path;
		}
		let	_urlargs: string | undefined	= undefined;
		if(r3IsBoolean(expand)){
			_urlargs	= 'expand=' + (expand ? 'true' : 'false');
		}

		this.startProgress();																// start progressing

		this._get(_url, _urlargs, null, _tenant, (error: FetchError | null, resobj: valTypeAllObject) =>
		{
			this.stopProgress();															// stop progressing

			if(null !== error){
				console.error(error.message);
				_callback(error, null);
				return;
			}
			if(!isResResourceData(resobj) || !r3IsBoolean(resobj.result) || !resobj.result){
				const err = new Error(r3GetSafeString(resobj.message, 'unknown'));
				console.error(r3GetSafeString(resobj.message, 'unknown'));
				_callback(err, null);
				return;
			}
			if(isResourceData(resobj.resource)){
				_callback(null, resobj.resource);
			}else{
				console.error('Could not get resource data(maybe token is not specified.)');
				_callback(null, null);
			}
		});
	}

	//
	// Update Resource data
	//
	updateResourceData(tenant: TenantData, path: string, data: ResourceData | null, callback: ErrorCallback): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}
		const _callback	= callback;
		if(!isTenantData(tenant) || r3IsEmptyString(tenant.name, true) || !r3IsString(path) || r3IsEmptyString(path, true)){
			const _error = new Error('tenant(' + JSON.stringify(tenant) + ') or path(' + JSON.stringify(path) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}
		const _resource	= isResourceData(data) ? data : null;
		const _tenant	= tenant.name;
		const _path		= path.trim();

		let	_urlargs	= 'name=' + _path;
		if(_resource && r3IsString(_resource.string)){
			_urlargs	+= '&type=string';
			_urlargs	+= '&data=' + JSON.stringify(_resource.string);
		}else if(_resource && r3IsObject(_resource.object)){
			_urlargs	+= '&type=object';
			_urlargs	+= '&data=' + JSON.stringify(_resource.object);
		}else{
			_urlargs	+= '&type=string';
			_urlargs	+= '&data=';
		}
		if(_resource && r3IsObject(_resource.keys)){
			_urlargs	+= '&keys=' + JSON.stringify(_resource.keys);
		}
		if(_resource && r3IsStringArray(_resource.aliases)){
			// [NOTE]
			// Note that while the member of ResourceData is "aliases",
			// it is also "alias" in the PUT parameter.
			//
			_urlargs	+= '&alias=' + JSON.stringify(_resource.aliases);
		}

		this.startProgress();																// start progressing

		this._put('/v1/resource', _urlargs, null, _tenant, (error: FetchError | null, resobj: valTypeAllObject) =>
		{
			this.stopProgress();															// stop progressing

			if(null !== error){
				console.error(error.message);
				_callback(error);
				return;
			}
			if(!isResBaseResult(resobj)){
				const err = new Error('Response object is unknown object.');
				console.error(err.message);
				_callback(err);
				return;
			}
			if(!resobj.result){
				const err = new Error(r3GetSafeString(resobj.message, 'unknown'));
				console.error(r3GetSafeString(resobj.message, 'unknown'));
				_callback(err);
				return;
			}
			_callback(null);
		});
	}

	//
	// Create Empty Resource data
	//
	createEmptyResourceData(tenant: TenantData, path: string, callback: ErrorCallback): void
	{
		return this.updateResourceData(tenant, path, null, callback);
	}

	//
	// Remove Resource data
	//
	removeResourceData(tenant: TenantData, path: string, callback: ErrorCallback): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}
		const _callback	= callback;
		if(!isTenantData(tenant) || r3IsEmptyString(tenant.name, true) || !r3IsString(path) || r3IsEmptyString(path, true)){
			const _error = new Error('tenant(' + JSON.stringify(tenant) + ') or path(' + JSON.stringify(path) + ')  parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}

		const _url	= '/v1/resource/' + path.trim();

		this.startProgress();																// start progressing

		this._delete(_url, null, null, tenant.name, (error: FetchError | null, resobj: valTypeAllObject) =>
		{
			this.stopProgress();															// stop progressing

			if(null !== error){
				console.error(error.message);
				_callback(error);
				return;
			}
			if(!isResBaseResult(resobj)){
				const err = new Error('Response object is unknown object.');
				console.error(err.message);
				_callback(err);
				return;
			}
			if(!resobj.result){
				const err = new Error(r3GetSafeString(resobj.message, 'unknown'));
				console.error(r3GetSafeString(resobj.message, 'unknown'));
				_callback(err);
				return;
			}
			_callback(null);
		});
	}

	//--------------------------------------------------
	// Token
	//--------------------------------------------------
	//
	// Get New Role Token
	//
	getNewRoleToken(tenant: TenantData, role: string, expire: number | null, callback: DataCallback<RoleTokenPrimitiveInfo>): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}
		const _callback	= callback;
		if(!isTenantData(tenant) || r3IsEmptyString(tenant.name, true) || r3IsEmptyString(role, true) || (null !== expire && !r3IsNumber(expire)) || (r3IsNumber(expire) && expire < 0)){
			const _error = new Error('tenant(' + JSON.stringify(tenant) + ') or role path(' + JSON.stringify(role) + ') or expire(' + JSON.stringify(expire) + ') parameters are wrong.');
			console.error(_error.message);
			_callback(_error, null);
			return;
		}
		const _tenant						= tenant.name;
		const _url							= '/v1/role/token/' + role;
		let	_urlargs: string | undefined	= undefined;
		if(r3IsNumber(expire)){
			_urlargs = 'expire=' + String(expire);
		}

		this.startProgress();																// start progressing

		this._get(_url, _urlargs, null, _tenant, (error: FetchError | null, resobj: valTypeAllObject) =>
		{
			this.stopProgress();															// stop progressing

			if(null !== error){
				console.error(error.message);
				_callback(error, null);
				return;
			}
			if(!isResRoleTokenPrimitiveInfo(resobj) || !r3IsBoolean(resobj.result) || !resobj.result){
				const err = new Error(r3GetSafeString(resobj.message, 'unknown'));
				console.error(r3GetSafeString(resobj.message, 'unknown'));
				_callback(err, null);
				return;
			}
			if(!isRoleTokenPrimitiveInfo(resobj)){
				const err = new Error('Could not get role token or register path.');
				console.error(err.message);
				_callback(err, null);
				return;
			}
			_callback(null, {
				roleToken:		resobj.token,
				registerPath:	resobj.registerpath
			});
		});
	}

	//
	// Get Role Token List
	//
	getRoleTokenList(tenant: TenantData, role: string, callback: DataCallback<RoleTokenInfo[]>): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}
		const _callback	= callback;
		if(!isTenantData(tenant) || r3IsEmptyString(tenant.name, true) || r3IsEmptyString(role, true)){
			const _error = new Error('tenant(' + JSON.stringify(tenant) + ') or role path(' + JSON.stringify(role) + ') parameters are wrong.');
			console.error(_error.message);
			_callback(_error, null);
			return;
		}
		const _tenant	= tenant.name;
		const _url		= '/v1/role/token/list/' + role;
		const _urlargs	= 'expand=true';													// [NOTE] Always expand=true

		this.startProgress();																// start progressing

		this._get(_url, _urlargs, null, _tenant, (error: FetchError | null, resobj: valTypeAllObject) =>
		{
			this.stopProgress();															// stop progressing

			if(null !== error){
				console.error(error.message);
				_callback(error, null);
				return;
			}
			if(!isResRoleTokenList(resobj) || !r3IsBoolean(resobj.result) || !resobj.result){
				const err = new Error(r3GetSafeString(resobj.message, 'unknown'));
				console.error(r3GetSafeString(resobj.message, 'unknown'));
				_callback(err, null);
				return;
			}
			if(!r3IsObject(resobj.tokens)){
				const err = new Error('Could not get role token list.');
				console.error(err.message);
				_callback(err, null);
				return;
			}

			// convert TokenList(Detail) to TokenList
			const tokenArray: RoleTokenInfo[] = [];
			Object.keys(resobj.tokens).forEach((oneToken) => {
				const	item: RoleTokenInfo = {
					token:			oneToken,
					date:			resobj.tokens[oneToken].date,
					expire:			resobj.tokens[oneToken].expire,
					user:			resobj.tokens[oneToken].user,
					hostname:		resobj.tokens[oneToken].hostname,
					ip:				resobj.tokens[oneToken].ip,
					port:			resobj.tokens[oneToken].port,
					cuk:			resobj.tokens[oneToken].cuk,
					registerpath:	(r3IsString(resobj.tokens[oneToken]?.registerpath) ? resobj.tokens[oneToken].registerpath : undefined)
				};
				tokenArray.push(item);
			});

			_callback(null, tokenArray);
		});
	}

	//
	// Remove Role Token
	//
	deleteRoleToken(tenant: TenantData, roletoken: string, callback: ErrorCallback): void
	{
		if(!r3IsFunction(callback)){
			console.error('callback parameter is wrong.');
			return;
		}
		const _callback = callback;
		if(!isTenantData(tenant) || r3IsEmptyString(tenant.name, true) || r3IsEmptyString(roletoken, true)){
			const _error = new Error('tenant(' + JSON.stringify(tenant) + ') or role token(not printed) parameters are wrong.');
			console.error(_error.message);
			_callback(_error);
			return;
		}
		const _url	= '/v1/role/token/' + roletoken;

		this.startProgress();																// start progressing

		this._delete(_url, null, null, tenant.name, (error: FetchError | null, resobj: valTypeAllObject) =>
		{
			this.stopProgress();															// stop progressing

			if(null !== error){
				console.error(error.message);
				_callback(error);
				return;
			}
			if(!isResBaseResult(resobj)){
				const err = new Error('Response object is unknown object.');
				console.error(err.message);
				_callback(err);
				return;
			}
			if(!resobj.result){
				const err = new Error(r3GetSafeString(resobj.message, 'unknown'));
				console.error(r3GetSafeString(resobj.message, 'unknown'));
				_callback(err);
				return;
			}
			_callback(null);
		});
	}

	//
	// Get User Data Script
	//
	getUserDataScript(registerpath: string): string | null
	{
		if(r3IsEmptyString(registerpath, true)){
			console.error('registerpath(not printed) parameter is wrong.');
			return null;
		}

		// get user token script by expanding template
		const userDataScript = this.r3Context.getExpandUserData(registerpath);
		if(r3IsEmptyString(userDataScript, true)){
			console.error('Failed to generate user data script from template.');
			return null;
		}

		return userDataScript;
	}

	//
	// Get Secret Yaml
	//
	getSecretYaml(roletoken: string): string | null
	{
		if(r3IsEmptyString(roletoken, true)){
			console.error('role token(not printed) parameter is wrong.');
			return null;
		}

		// get secret yaml by expanding template
		const secretYaml = this.r3Context.getExpandSecretYaml(roletoken);
		if(r3IsEmptyString(secretYaml, true)){
			console.error('Failed to generate secret yaml from template.');
			return null;
		}

		return secretYaml;
	}

	//
	// Get Secret Yaml
	//
	getSidecarYaml(roleyrn: string): string | null
	{
		if(r3IsEmptyString(roleyrn, true)){
			console.error('role full yrn path(' + JSON.stringify(roleyrn) + ') parameter is wrong.');
			return null;
		}

		// get sidecar yaml by expanding template
		const sidecarYaml = this.r3Context.getExpandSidecarYaml(roleyrn);
		if(r3IsEmptyString(sidecarYaml, true)){
			console.error('Failed to generate sidecar yaml from template.');
			return null;
		}
		return sidecarYaml;
	}

	//
	// Get Custom Registration Codes
	//
	getCRCObject(roleToken: string, roleyrn: string, registerpath: string): CRCObject | null
	{
		if(r3IsEmptyString(roleToken, true) || r3IsEmptyString(roleyrn, true) || r3IsEmptyString(registerpath, true)){
			console.error('role token(not printed) or full yrn path(' + JSON.stringify(roleyrn) + ') or registerpath(not printed) parameters are wrong.');
			return null;
		}

		// get sidecar yaml by expanding template
		const crcObject = this.r3Context.getExpandCRCObject(roleToken, roleyrn, registerpath);
		if(!isCRCObject(crcObject)){
			console.error('Failed to generate CRC object from template.');
			return null;
		}
		return crcObject;
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
