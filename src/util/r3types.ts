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
 * CREATE:   Thu Aug 31 2017
 * REVISION:
 *
 */

import { r3IsBoolean, r3IsNumber, r3IsArray, r3IsString, r3IsStringArray, r3IsStringValObject, r3ConvertFromJSON, r3IsObject, r3HasKey }	from '../util/r3util';
import { r3LicensesJsonString } from './r3licenses';

//--------------------------------------------------------------
// Common Interfaces / Types
//--------------------------------------------------------------
//
// Basic types to replace "any"
//
// For example, these are using from JSON parser(and Avoiding self-referencing type aliases)
//
export interface valTypeAllObject extends Record<string, valTypeAll> {}
export type valTypeAllArray	= valTypeAll[];
export type valTypeAll		= null | boolean | number | string | valTypeAllArray | valTypeAllObject;

//
// String Object
//
export type StringValObj		= Record<string, string>;	// = [key: string]: string

//
// Callback types
//
export type FetchError = Error & {
	status?:			number;
};

export type ProgressCallback	= (isStart: boolean) => void;
export type ErrorCallback		= (error: Error | null) => void;
export type DataCallback<T>		= (error: FetchError | null, data?: T | null) => void;
export type FetchCallback		= (error: FetchError | null, data?: valTypeAllObject) => void;
export type TokenCallback		= (error: Error | null, token?: string | null) => void;

//--------------------------------------------------------------
// Types for K2HR3 Data
//--------------------------------------------------------------
//
// Tenant
//
export type rawTenantData = {
	name:				string;
	display?:			string;
	id?:				string;
	description?:		string;
};

export type rawLocalTenantExpandData = {
	name:				string;
	display?:			string;
	id?:				string;
	desc?:				string;
	users?:				string[];
};

export type TenantData = rawTenantData & {
	users?:				string[];
};

//
// List and TreeItem
//
export type rawListData = {
	name:				string;
	children:			rawListData[];
};

export type TreeListItem = {
	name:				string;
	path:				string;
	children:			TreeListItem[];
	selected?:			boolean;
	owner?:				boolean;
	distributed?:		boolean;
};

//
// Role
//
export type RoleHostList = {
	hostnames:			string[];
	ips:				string[];
};

export type RoleData = {
	policies:			string[];
	aliases?:			string[];
	hosts?:				RoleHostList;
};

export type RoleHostInfo = {
	host:				string;
	port:				number;
	cuk:				string | null;
	extra:				string | null;
	tag:				string | null;
	inboundip?:			string | null;
	outboundip?:		string | null;
};

//
// Policy
//
export type PolicyData = {
	name:				string;
	effect:				PolicyEffectType;
	action:				PolicyActionType[];
	resource:			string[];
	alias:				string[];
};

//
// Resource
//
export type BaseResourceObject = {
	name:				string;
	type?:				ResourceType;
	expire?:			number | null;
	data?:				string | valTypeAllObject | null;
	keys?:				valTypeAllObject;
};

export type StaticResourceObject = BaseResourceObject & {
	editingStringData?:	string;						// Temporary member being edited
	editingObjectData?:	string;						// Temporary member being edited
};

export type ResourceData = {
	string?:			string | null;
	object?:			valTypeAllObject | null;
	keys?:				valTypeAllObject | null;
	expire?:			number | null;
	aliases?:			string[] | null;
};

export type ResourceElementData = valTypeAll;

//
// Service
//
export type ServiceResourceObject = BaseResourceObject;

export type ServiceData = {
	verify:				string | ServiceResourceObject[] | null;
	tenant:				string[];
};

export type CheckServiceResult = {
	error:				string | null;
	type:				ServiceResType;
};

//
// RoleToken
//
export type RoleTokenListResponseInfo = {			// One token detail information in Get RoleToken List Response
	date:				string;
	expire:				string;
	user:				string | null;
	hostname:			string | null;
	ip:					string | null;
	port:				number;
	cuk:				string | null;
	registerpath?:		string;
};

export type RoleTokenInfo = RoleTokenListResponseInfo & {
	token:				string;
};

export type RoleTokenPrimitiveInfo = {
	roleToken:			string;
	registerPath:		string;
}

export type RoleTokenMetadata = {
	token:				string;
	date:				string;
	expire:				string;
	registerpath:		string;
	newToken:			boolean;
	shortToken:			string;
	createTime:			string;
	expireUnixTime:		number;
	expireTime:			string;
	dispTime:			string;
	codeUDS:			string | null;
	codeSecretYaml:		string | null;
	codeSidecarYaml:	string | null;
	objCrc:				CRCObject;
};

//
// Custom Registration Code(CRC) object
//
export type CRCObject = Record<string, StringValObj>;

//
// Path Detail Information
//
export type PathDetailInfo = {
	tenant:				TenantData | null;
	service:			string | null;
	serviceOwner:		boolean;
	hasServiceTenant:	boolean;
	type:				ItemType | null;
	name:				string | null;
	fullpath:			string | null;
	currentpath:		string | null;
	hasParent:			boolean;
	canCreatePath:		boolean;
	canCreateService:	boolean;
};

//
// Others
//
export type LicenseEntry = StringValObj & {
	licenseType:		string;
	licenseText:		string | null;
};

export type LicenseEntryObject = Record<string, LicenseEntry>;

export type ParseKVResult = {
	reststr:			string | null;
	value:				string | null;
}

export type ParseUrlResult = {
	https:				boolean;
	host:				string;
	port:				number;
	path:				string;
}

export type DiffRoundResult = {
	type:				string;
	value:				number;
}

export type SignMinUrlEntry = {
	url:		string;
	display?:	string;
};

export type SignUrlEntry = Required<SignMinUrlEntry>;

export type SignMinUrls	= Record<string, SignMinUrlEntry>;

export type SignUrls	= Record<string, SignUrlEntry>;

//--------------------------------------------------------------
// Types for K2HR3 API request/response
//--------------------------------------------------------------
//
// Basically common response items
//
export type resBaseResult = {
	result:				boolean;
	message:			string | null;
};

//
// Token
//
export type resTokenData = resBaseResult & {
	scoped?:			boolean;
	token?:				string;
}

//
// Tenant
//
export type resTenantData = resBaseResult & {
	scoped?:			boolean;
	user?:				string;
	tenants?:			TenantData[];
}

export type resRawLocalTenantExpandData = resBaseResult & {
	tenants?:			rawLocalTenantExpandData[];
};

export type resRawLocalTenantListData = resBaseResult & {
	tenants?:			string[];
};

//
// List
//
export type resRawListData = resBaseResult & {
	children?:			rawListData[];
};

//
// Role
//
export type resRoleData = resBaseResult & {
	role?:				RoleData;
};

export type reqSetRoleHost = {
	host:				RoleHostInfo;
	clear_hostname:		boolean;
	clear_ips:			boolean;
};

export type reqSetRoleHosts = {
	host:				RoleHostInfo[];
	clear_hostname:		boolean;
	clear_ips:			boolean;
};

//
// Policy
//
export type resPolicyData = resBaseResult & {
	policy?:			PolicyData;
};

//
// Resource
//
export type resResourceData = resBaseResult & {
	resource?:			ResourceData | ResourceElementData;
};

//
// Service
//
export type resServiceData = resBaseResult & {
	service?:			ServiceData;
};

//
// RoleToken
//
export type resRoleTokenList = resBaseResult & {
	tokens?:			Record<string, RoleTokenListResponseInfo>;
};

export type resRoleTokenPrimitiveInfo = resBaseResult & {
	token?:				string;
	registerpath?:		string;
};

//--------------------------------------------------------------
// Common Variables
//--------------------------------------------------------------
// for types
export const resourceType			= 'resource';
export const roleType				= 'role';
export const policyType				= 'policy';
export const serviceType			= 'service';

// for types of messages
export const errorType				= 'error';
export const warningType			= 'warning';
export const infoType				= 'information';

// for resource view
export const resourceTypeString		= 'string';
export const resourceTypeObject		= 'object';

// for resource view
export const serviceResTypeUrl		= 'verifyUrl';
export const serviceResTypeObject	= 'staticResourceObject';
export const serviceResTypeUnknown	= 'unknown';

// for action
export const actionTypeName			= 'name';
export const actionTypeValue		= 'value';
export const actionTypeNewKey		= 'newkey';
export const actionTypeNewValue		= 'newvalue';
export const actionTypeDelete		= 'delete';
export const actionTypeAdd			= 'add';
export const actionTypeUp			= 'up';
export const actionTypeDown			= 'down';
export const actionTypeHostName		= 'hostname';
export const actionTypeHostAuxiliary= 'auxiliary';

export const signinUnknownType		= 'unknown';
export const signinUnscopedToken	= 'unsopedtoken';
export const signinCredential		= 'credential';

// values for policy items
export const effectValueAllow		= 'allow';
export const effectValueDeny		= 'deny';
export const actionValueRead		= 'yrn:yahoo::::action:read';
export const actionValueWrite		= 'yrn:yahoo::::action:write';

// types
export type ResourceType			= typeof resourceTypeString | typeof resourceTypeObject;
export type SigninType				= typeof signinUnknownType | typeof signinUnscopedToken | typeof signinCredential;
export type MessageType				= typeof errorType | typeof warningType | typeof infoType;
export type ItemType				= typeof resourceType | typeof roleType | typeof policyType | typeof serviceType;
export type ServiceResType			= typeof serviceResTypeUrl | typeof serviceResTypeObject | typeof serviceResTypeUnknown;
export type PolicyEffectType		= typeof effectValueAllow | typeof effectValueDeny;
export type PolicyActionType		= typeof actionValueRead | typeof actionValueWrite;

// [TODO]
// Now we do not have template engine for this, thus we replace following static string.
//
export const kwApiHostForUD			= /{{= %K2HR3_API_HOST_URI% }}/g;
export const kwIncludePathForUD		= /{{= %K2HR3_USERDATA_INCLUDE_PATH% }}/g;
export const kwRoleTokenForSecret	= /{{= %K2HR3_ROLETOKEN_IN_SECRET% }}/g;
export const kwRawRoleToken			= /{{= %K2HR3_ROLETOKEN_RAW% }}/g;
export const kwRoleTokenForRoleYrn	= /{{= %K2HR3_ROLEYRN_IN_SIDECAR% }}/g;

//--------------------------------------------------------------
// Typecheckers for K2HR3 Data
//--------------------------------------------------------------
//
// Tenant
//
export const isRawTenantData = (val: unknown): val is rawTenantData =>
{
	if(!r3IsObject(val)){
		return false;
	}
	if(	r3IsString(val.name)											&&
		(undefined === val.display || r3IsString(val.display))			&&
		(undefined === val.id || r3IsString(val.id))					&&
		(undefined === val.description || r3IsString(val.description))	)
	{
		return true;
	}
};

export const isTenantData = (val: unknown): val is TenantData =>
{
	if(!r3IsObject(val)){
		return false;
	}
	if(	(undefined === val?.users || r3IsStringArray(val.users))&&
		isRawTenantData(val)									)
	{
		return true;
	}
};

export const isRawLocalTenantExpandData = (val: unknown): val is rawLocalTenantExpandData =>
{
	if(!r3IsObject(val)){
		return false;
	}
	if(	r3IsString(val?.name)									&&
		(undefined === val?.display || r3IsString(val.display))	&&
		(undefined === val?.id || r3IsString(val.id))			&&
		(undefined === val?.desc || r3IsString(val.desc))		&&
		(undefined === val?.users || r3IsStringArray(val.users)))
	{
		return true;
	}
};

//
// List and TreeItem
//
export const isRawListData = (val: unknown): val is rawListData =>
{
	if(!r3IsObject(val)){
		return false;
	}
	if(	r3IsString(val?.name)										&&
		r3IsArray(val?.children)									&&
		val.children.every((item: unknown) => isRawListData(item))	)
	{
		return true;
	}
	return false;
};

export const isTreeListItem = (val: unknown): val is TreeListItem =>
{
	if(!r3IsObject(val)){
		return false;
	}
	if(	r3IsString(val?.name)												&&
		r3IsString(val?.path)												&&
		(undefined === val?.selected	|| r3IsBoolean(val.selected))		&&
		(undefined === val?.owner		|| r3IsBoolean(val.owner))			&&
		(undefined === val?.distributed	|| r3IsBoolean(val.distributed))	&&
		r3IsArray(val?.children)											&&
		val.children.every((item: unknown) => isTreeListItem(item))			)
	{
		return true;
	}
	return false;
};

export const isTreeListItemArray = (val: unknown): val is TreeListItem[] =>
{
	if(!r3IsArray(val)){
		return false;
	}
	return val.every((item: unknown) => isTreeListItem(item));
};

//
// Role
//
export const isRoleHostList = (val: unknown): val is RoleHostList =>
{
	if(!r3IsObject(val)){
		return false;
	}
	if(	r3IsStringArray(val?.hostnames)	&&
		r3IsStringArray(val?.ips)		)
	{
		return true;
	}
	return false;
};

export const isRoleData = (val: unknown): val is RoleData =>
{
	if(!r3IsObject(val)){
		return false;
	}
	if(	r3IsStringArray(val?.policies)								&&
		(undefined === val?.aliases || r3IsStringArray(val.aliases))&&
		(undefined === val?.hosts || isRoleHostList(val.hosts))		)
	{
		return true;
	}
	return false;
};

export const isRoleHostInfo = (val: unknown): val is RoleHostInfo =>
{
	if(!r3IsObject(val)){
		return false;
	}
	if(	r3IsString(val?.host)																	&&
		r3IsNumber(val?.port)																	&&
		(null === val?.cuk || r3IsString(val.cuk))												&&
		(null === val?.extra || r3IsString(val.extra))											&&
		(null === val?.tag || r3IsString(val.tag))												&&
		(undefined === val?.inboundip || null === val?.inboundip || r3IsString(val.inboundip))	&&
		(undefined === val?.outboundip || null === val?.outboundip || r3IsString(val.outboundip)))
	{
		return true;
	}
	return false;
};

//
// Policy
//
export const isPolicyData = (val: unknown): val is PolicyData =>
{
	if(!r3IsObject(val)){
		return false;
	}
	if(	r3IsString(val?.name)											&&
		isPolicyEffectType(val?.effect)									&&
		r3IsArray(val?.action)											&&
		val.action.every((item: unknown) => isPolicyActionType(item))	&&
		r3IsStringArray(val?.resource)									&&
		r3IsStringArray(val?.alias)										)
	{
		return true;
	}
	return false;
};

//
// Resource
//
export const isBaseResourceObject = (val: unknown): val is BaseResourceObject =>
{
	if(!r3IsObject(val)){
		return false;
	}
	if(	r3IsString(val?.name)																			&&
		(undefined === val?.type || isResourceType(val?.type))											&&
		(undefined === val?.expire || null === val?.expire || r3IsNumber(val.expire))					&&
		(undefined === val?.data || null === val?.data || r3IsString(val.data) || r3IsObject(val.data))	&&
		(undefined === val?.keys || r3IsStringValObject(val.keys))										)
	{
		return true;
	}
	return false;
};

export const isStaticResourceObject = (val: unknown): val is StaticResourceObject =>
{
	if(!r3IsObject(val)){
		return false;
	}
	if(	(undefined === val?.editingObjectData || r3IsString(val.editingObjectData))	&&
		(undefined === val?.editingObjectData || r3IsString(val.editingObjectData))	&&
		isBaseResourceObject(val)													)
	{
		return true;
	}
	return false;
};

export const isResourceData = (val: unknown): val is ResourceData =>
{
	if(!r3IsObject(val)){
		return false;
	}
	if(	(undefined === val?.string || null === val?.string || r3IsString(val.string))			&&
		(undefined === val?.object || null === val?.object || r3IsObject(val.object))			&&
		(undefined === val?.keys || null === val?.keys || r3IsObject(val.keys))					&&
		(undefined === val?.expire || null === val?.expire || r3IsNumber(val.expire))			&&
		(undefined === val?.aliases || null === val?.aliases || r3IsStringArray(val.aliases))	)
	{
		return true;
	}
	return false;
};

export const isResourceElementData = (val: unknown): val is ResourceElementData =>
{
	return (undefined !== val);
};

//
// Service
//
export const isServiceData = (val: unknown): val is ServiceData =>
{
	if(!r3IsObject(val)){
		return false;
	}
	if(r3HasKey(val, 'verify') && (r3IsString(val.verify) || r3IsBoolean(val.verify) || null === val.verify) && r3IsStringArray(val?.tenant)){
		return true;
	}
	return false;
};

export const isServiceResourceObject = (val: unknown): val is ServiceResourceObject =>
{
	if(!r3IsObject(val)){
		return false;
	}
	if(isBaseResourceObject(val)){
		return true;
	}
	return false;
};

export const isServiceResourceObjectArray = (val: unknown): val is ServiceResourceObject[] =>
{
	if(!r3IsArray(val) || 0 === val.length){
		return false;
	}
	return val.every((item: unknown) => isServiceResourceObject(item));
};

//
// RoleToken
//
export const isRoleTokenListResponseInfo = (val: unknown): val is RoleTokenListResponseInfo =>
{
	if(!r3IsObject(val)){
		return false;
	}
	if(	r3IsString(val?.date)												&&
		r3IsString(val?.expire)												&&
		(null === val?.user				|| r3IsString(val.user))			&&
		(null === val?.hostname			|| r3IsString(val.hostname))		&&
		(null === val?.ip				|| r3IsString(val.ip))				&&
		r3IsNumber(val?.port)												&&
		(null === val?.cuk				|| r3IsString(val.cuk))				&&
		(undefined === val?.registerpath || r3IsString(val.registerpath))	)
	{
		return true;
	}
	return false;
};

export const isRoleTokenInfo = (val: unknown): val is RoleTokenInfo =>
{
	if(!r3IsObject(val)){
		return false;
	}
	if(	r3IsString(val?.token)			&&
		isRoleTokenListResponseInfo(val))
	{
		return true;
	}
	return false;
};

export const isRoleTokenInfoArray = (val: unknown): val is RoleTokenInfo[] =>
{
	if(!r3IsArray(val)){
		return false;
	}
	return val.every((item: unknown) => isRoleTokenInfo(item));
};

export const isRoleTokenPrimitiveInfo = (val: unknown): val is RoleTokenPrimitiveInfo =>
{
	if(!r3IsObject(val)){
		return false;
	}
	if(	r3IsString(val?.roleToken)		&&
		r3IsString(val?.registerPath)	)
	{
		return true;
	}
	return false;
};

export const isRoleTokenMetadata = (val: unknown): val is RoleTokenMetadata =>
{
	if(!r3IsObject(val)){
		return false;
	}
	if(	r3IsString(val?.token)												&&
		r3IsString(val?.date)												&&
		r3IsString(val?.expire)												&&
		r3IsString(val?.registerpath)										&&
		r3IsBoolean(val?.newToken)											&&
		r3IsString(val?.shortToken)											&&
		r3IsString(val?.createTime)											&&
		r3IsNumber(val?.expireUnixTime)										&&
		r3IsString(val?.expireTime)											&&
		r3IsString(val?.dispTime)											&&
		(null === val?.codeUDS || r3IsString(val?.codeUDS))					&&
		(null === val?.codeSecretYaml || r3IsString(val?.codeSecretYaml))	&&
		(null === val?.codeSidecarYaml || r3IsString(val?.codeSidecarYaml))	&&
		isCRCObject(val?.objCrc)											)
	{
		return true;
	}
	return false;
};

export const isRoleTokenMetadataArray = (val: unknown): val is RoleTokenMetadata[] =>
{
	if(!r3IsArray(val)){
		return false;
	}
	return val.every((item: unknown) => isRoleTokenMetadata(item));
};

//
// Custom Registration Code(CRC) object
//
export const isCRCObject = (val: unknown): val is CRCObject =>
{
	if(!r3IsObject(val)){
		return false;
	}
	return Object.values(val).every(outerVal => r3IsStringValObject(outerVal));
};

//
// Path Detail Information
//
export const isPathDetailInfo = (val: unknown): val is PathDetailInfo =>
{
	if(!r3IsObject(val)){
		return false;
	}
	if(	(null === val?.tenant || isTenantData(val.tenant))			&&
		(null === val?.service || r3IsString(val.service))			&&
		r3IsBoolean(val?.serviceOwner)								&&
		r3IsBoolean(val?.hasServiceTenant)							&&
		(null === val?.type || isItemType(val.type))				&&
		(null === val?.name || r3IsString(val.name))				&&
		(null === val?.fullpath || r3IsString(val.fullpath))		&&
		(null === val?.currentpath || r3IsString(val.currentpath))	&&
		(null === val?.currentpath || r3IsString(val.currentpath))	&&
		r3IsBoolean(val?.hasParent)									&&
		r3IsBoolean(val?.canCreatePath)								&&
		r3IsBoolean(val?.canCreateService)							)
	{
		return true;
	}
	return false;
};

//
// Others
//
export const isLicenseEntry = (val: unknown): val is LicenseEntry =>
{
	if(!r3IsObject(val)){
		return false;
	}
	if(	r3IsString(val?.licenseType)								&&
		(null === val?.licenseText || r3IsString(val?.licenseText))	)
	{
		return true;
	}
	return false;
};

export const isLicenseEntryObject = (val: unknown): val is Record<string, LicenseEntry> =>
{
	if(!r3IsObject(val)){
		return false;
	}
	return Object.values(val).every((item: unknown) => isLicenseEntry(item));
};

export const getLicenseEntryObject = (str: string): Record<string, LicenseEntry> =>
{
	if(!r3IsString(str)){
		const emptyResult: Record<string, LicenseEntry> = {};
		return emptyResult;
	}

	const cvtObj = r3ConvertFromJSON(r3LicensesJsonString);
	if(!isLicenseEntryObject(cvtObj)){
		const emptyResult: Record<string, LicenseEntry> = {};
		return emptyResult;
	}
	return cvtObj;
};

export const isSignMinUrlEntry = (val: unknown): val is SignMinUrlEntry =>
{
	if(!r3IsObject(val)){
		return false;
	}
	if(	r3IsString(val?.url)									&&
		(undefined === val?.display || r3IsString(val?.display)))
	{
		return true;
	}
	return false;
};

export const isSignUrlEntry = (val: unknown): val is SignUrlEntry =>
{
	if(!r3IsObject(val)){
		return false;
	}
	if(	r3IsString(val?.display)&&
		isSignMinUrlEntry(val)	)
	{
		return true;
	}
	return false;
};

export const isSignMinUrls = (val: unknown): val is SignMinUrls =>
{
	if(!r3IsObject(val)){
		return false;
	}
	return Object.values(val).every((item: unknown) => isSignMinUrlEntry(item));
};

export const isSignUrls = (val: unknown): val is SignUrls =>
{
	if(!r3IsObject(val)){
		return false;
	}
	return Object.values(val).every((item: unknown) => isSignUrlEntry(item));
};

//--------------------------------------------------------------
// Typecheckers for Request/Responses
//--------------------------------------------------------------
//
// Base
//
export const isResBaseResult = (val: unknown): val is resBaseResult =>
{
	if(!r3IsObject(val)){
		return false;
	}
	if(r3IsBoolean(val?.result)){
		if(val.result && null === val?.message){
			return true;
		}else if(!val.result && r3IsString(val?.message)){
			return true;
		}
	}
	return false;
};

export const hasResBaseResult = (val: unknown): boolean =>
{
	if(isResBaseResult(val)){
		return true;
	}
	return false;
};

//
// Token
//
export const isResTokenData = (val: unknown): val is resTokenData =>
{
	if(!r3IsObject(val)){
		return false;
	}
	if(	hasResBaseResult(val) &&
		(	(undefined === val?.scoped && undefined === val?.token) 													||
			(undefined !== val?.scoped && undefined !== val?.token && r3IsBoolean(val?.scoped) && r3IsString(val?.token))
		)	)
	{
		return true;
	}
	return false;
};

//
// Tenant
//
export const isResTenantData = (val: unknown): val is resTenantData =>
{
	if(!r3IsObject(val)){
		return false;
	}
	if(	hasResBaseResult(val) &&
		(	(undefined === val?.scoped && undefined === val?.user && undefined === val?.tenants) ||
			(undefined !== val?.scoped && undefined !== val?.user && undefined !== val?.tenants && r3IsBoolean(val?.scoped) && r3IsString(val?.user) && r3IsArray(val?.tenants) && val.tenants.every((item: unknown) => isTenantData(item)))
		)	)
	{
		return true;
	}
	return false;
};

export const isResRawLocalTenantExpandData = (val: unknown): val is resRawLocalTenantExpandData =>
{
	if(!r3IsObject(val)){
		return false;
	}
	if(	hasResBaseResult(val) &&
		(	undefined === val?.tenants ||
			(r3IsArray(val.tenants) && val.tenants.every((item: unknown) => isRawLocalTenantExpandData(item)))
		)	)
	{
		return true;
	}
	return false;
};

export const isResRawLocalTenantListData = (val: unknown): val is resRawLocalTenantListData =>
{
	if(!r3IsObject(val)){
		return false;
	}
	if(	hasResBaseResult(val)											&&
		(undefined === val?.tenants || r3IsStringArray(val?.tenants))	)
	{
		return true;
	}
	return false;
};

//
// List
//
export const isResRawListData = (val: unknown): val is resRawListData =>
{
	if(!r3IsObject(val)){
		return false;
	}
	if(	hasResBaseResult(val) &&
		(	undefined === val?.children ||
			(r3IsArray(val.children) && val.children.every((item: unknown) => isRawListData(item)))
		)	)
	{
		return true;
	}
	return false;
};

//
// Role
//
export const isResRoleData = (val: unknown): val is resRoleData =>
{
	if(!r3IsObject(val)){
		return false;
	}
	if(	hasResBaseResult(val)								&&
		(undefined === val?.role || isRoleData(val.role))	)
	{
		return true;
	}
	return false;
};

export const isReqSetRoleHost = (val: unknown): val is reqSetRoleHost =>
{
	if(!r3IsObject(val)){
		return false;
	}
	if(	isRoleHostInfo(val?.host)			&&
		r3IsBoolean(val?.clear_hostname)	&&
		r3IsBoolean(val?.clear_ips)			)
	{
		return true;
	}
	return false;
};

export const isReqSetRoleHosts = (val: unknown): val is reqSetRoleHosts =>
{
	if(!r3IsObject(val)){
		return false;
	}
	if(	r3IsArray(val?.host)									&&
		val.host.every((item: unknown) => isRoleHostInfo(item))	&&
		r3IsBoolean(val?.clear_hostname)						&&
		r3IsBoolean(val?.clear_ips)								)
	{
		return true;
	}
	return false;
};

//
// Policy
//
export const isResPolicyData = (val: unknown): val is resPolicyData =>
{
	if(!r3IsObject(val)){
		return false;
	}
	if(	hasResBaseResult(val)									&&
		(undefined === val?.policy || isPolicyData(val.policy))	)
	{
		return true;
	}
	return false;
};

//
// Resource
//
export const isResResourceData = (val: unknown): val is resResourceData =>
{
	if(!r3IsObject(val)){
		return false;
	}
	if(	hasResBaseResult(val)																				&&
		(undefined === val?.resource || isResourceData(val.resource) || isResourceElementData(val.resource)))
	{
		return true;
	}
	return false;
};

//
// Service
//
export const isResServiceData = (val: unknown): val is resServiceData =>
{
	if(!r3IsObject(val)){
		return false;
	}
	if(!hasResBaseResult(val)){
		return false;
	}
	if(r3IsBoolean(val?.result) && !val.result && !r3IsObject(val?.service)){
		// failure responsse
		return true;
	}else if(r3IsBoolean(val?.result) && val.result && r3IsObject(val?.service) && isServiceData(val.service)){
		// succeed responsse
		return true;
	}
	return false;
};

//
// RoleToken
//
export const isResRoleTokenList = (val: unknown): val is resRoleTokenList =>
{
	if(!r3IsObject(val)){
		return false;
	}
	if(!hasResBaseResult(val)){
		return false;
	}
	if(!r3IsObject(val?.tokens)){
		return false;
	}
	return Object.values(val.token).every((item: unknown) => isRoleTokenListResponseInfo(item));
};

export const isResRoleTokenPrimitiveInfo = (val: unknown): val is resRoleTokenPrimitiveInfo =>
{
	if(!r3IsObject(val)){
		return false;
	}
	if(!hasResBaseResult(val)){
		return false;
	}
	if(	(undefined === val?.token 			|| r3IsString(val.token))		&&
		(undefined === val?.registerpath	|| r3IsString(val.registerpath)))
	{
		return true;
	}
	return false;
};

//--------------------------------------------------------------
// Typecheckers for Common variables
//--------------------------------------------------------------
export const isResourceType = (str: unknown): str is ResourceType =>
{
	if(!r3IsString(str)){
		return false;
	}
	return (resourceTypeString === str || resourceTypeObject === str);
};

export const isSigninType = (str: unknown): str is SigninType =>
{
	if(!r3IsString(str)){
		return false;
	}
	return (signinUnknownType === str || signinUnscopedToken === str || signinCredential === str);
};

export const isMessageType = (str: unknown): str is MessageType =>
{
	if(!r3IsString(str)){
		return false;
	}
	return (errorType === str || warningType === str || infoType === str);
};

export const isItemType = (str: unknown): str is ItemType =>
{
	if(!r3IsString(str)){
		return false;
	}
	return (resourceType === str || roleType === str || policyType === str || serviceType === str);
};

export const isServiceResType = (str: unknown): str is ServiceResType =>
{
	if(!r3IsString(str)){
		return false;
	}
	return (serviceResTypeUrl === str || serviceResTypeObject === str || serviceResTypeUnknown === str);
};

export const isPolicyEffectType = (str: unknown): str is PolicyEffectType =>
{
	if(!r3IsString(str)){
		return false;
	}
	return (effectValueAllow === str || effectValueDeny === str);
};

export const isPolicyActionType = (str: unknown): str is PolicyActionType =>
{
	if(!r3IsString(str)){
		return false;
	}
	return (actionValueRead === str || actionValueWrite === str);
};

export const isPolicyActionTypeArray = (str: unknown): str is PolicyActionType[] =>
{
	if(!r3IsArray(str)){
		return false;
	}
	return str.every((item: unknown) => isPolicyActionType(item));
};

/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * End:
 * vim600: noexpandtab sw=4 ts=4 fdm=marker
 * vim<600: noexpandtab sw=4 ts=4
 */
