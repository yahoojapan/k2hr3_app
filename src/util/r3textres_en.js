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
 * CREATE:   Fri Dec 14 2018
 * REVISION:
 *
 */

//
// Text Resources for English
//
// Prefix:		i		=> Information
//				w		=> Warning
//				e		=> Error
//				c		=> Confirm
//				tRes	=> Text Resource(other)
//
export const r3TextRes = {
	iNotSignin:					'Please signin first.',
	iNotSelectTenant:			'First select the tenant, then select ROLE / RESOURCE / POLICY, then browse and edit.',
	iNotSelectPath:				'Please select the item of SERVICE / ROLE / RESOURCE / POLICY, and reference and edit it.',
	iSucceedChangeTenant:		'Tenant changed.',
	iSucceedChangeType:			'Type (SERVICE / ROLE / RESOURCE / POLICY) has been changed.',
	iSucceedChangeServiceName:	'I changed SERVICE.\nYou can relate SERVICE to TENANT, and unlink it.',
	iSucceedChangeServiceOwner:	'SERVICE was selected.\nThis TENANT is the SERVICE owner. You can edit the contents and delete SERVICE.',
	iSucceedChangeServiceType:	'The type of SERVICE (ROLE / RESOURCE / POLICY) has been changed.',
	iSucceedChangeServicePath:	'The ITEM (path) below SERVICE has been changed. This ITEM can not be edited.',
	iSucceedMoveService:		'The SERVICE top was chosen.',
	iSucceedMoveServiceName:	'SERVICE was selected.',
	iSucceedMoveType:			'Type (ROLE / POLICY / RESOURCE) was selected.',
	iSucceedChangePath:			'ITEM (path) has been changed.',
	iSucceedCreatePath:			'ITEM (path) is created.',
	iSucceedDeletePath:			'ITEM (path) has been deleted.',
	iSucceedCreateService:		'TENANT has created SERVICE which is the owner.',
	iSucceedCreateServiceTenant:'A SERVICE associated with TENANT has been created.',
	iSucceedDeleteService:		'SERVICE has been deleted.',
	iSucceedDeleteServiceTenant:'The SERVICE associated with TENANT has been deleted.',
	iSucceedUpdate:				'Content data has been updated(saved).',
	iNotHaveAnyTenant:			'TENANT is missing. The account must be associated with one or more OpenStack server groups.',
	iSignouted:					'Signed out. ',
	iSignined:					'Signed in. ',

	cUpdatingTitle:				'Confirmation',
	cUpdatingCancel:			'Discard edited content?',
	cCreateNewPathTitle:		'Create a new path',
	cCreateServiceTitle:		'Create a new SERVICE',
	cCreateServiceTenantTitle:	'Created TENANT cooperation SERVICE',
	cDefaultRoleAlias:			'Cooperation ROLE (Specify ROLE: Allowed empty)',
	cDeletingService:			'Do you want to delete SERVICE?\n(If SERVICE is deleted, SERVICE below all TENANTs currently associated with SERVICE are automatically deleted.Therefore, you need to manually delete the place where ALIAS is set with each TENANT ROLE It will not.)',
	cDeletingServiceTenant:		'Do you want to delete the SERVICE with which TENANT is associated?\n(If ALIAS is set for ROLE below this SERVICE, you must delete it manually.)',
	cDirectSignInTitle:			'Signin',

	tResErrorTitle:				'ERROR',
	tResWarnTitle:				'WARNING',
	tResInfoTitle:				'INFORMATION',
	tResButtonOk:				'OK',
	tResButtonClose:			'CLOSE',
	tResButtonCancel:			'CANCEL',
	tResButtonSignin:			'SGIN IN',
	tResButtonSave:				'SAVE',
	tResMainMenuTT:				'Main menu',
	tResLicensesMenu:			'Licenses',
	tResNoLicenseMenu:			'(No licenses)',
	tResAboutMenu:				'About K2HR3',
	tResAccountMenuTT:			'Account',
	tResSigninMenu:				'Sign in',
	tResSignoutMenu:			'Sign out',
	tResSigninName:				'Signed in as ',
	tResDetachTreeMenu:			'Detach Tree',
	tResDockTreeMenu:			'Always display Tree',
	tResUserNameTitle:			'USER NAME(ID etc)',
	tResUserNamePlaceHolder:	'input username(id) to sign in',
	tResPassphraseTitle:		'PASS PHRASE',
	tResPassphrasePlaceHolder:	'input passphrase(allow empty)',
	tResTenantLabel:			'TENANT',
	tResUnselectedTenantLabel:	'Unselected',
	tResNoTenantLabel:			'No tenant list',
	tResUnknownTenantLabel:		'Unknown tenant',
	tResSelectTenantTT:			'Select tenant',
	tResTenantPathLabel:		'TENANT',
	tResUnselected:				'Unselected',
	tResOwnerServiceTag:		'OWNER',
	tResPathChipTT:				'Display path information',
	tResToUpperPathTT:			'Move to upper path',
	tResCreateChildPathTT:		'Create child path',
	tResCreateOwnerServiceTT:	'Create SERVICE(owner)',
	tResCreateServiceTT:		'Create SERVICE under TENANT',
	tResDeletePathTT:			'Delete path',
	tResDeleteOwnerServiceTT:	'Delete SERVICE(owner)',
	tResDeleteServiceTT:		'Delete SERVICE under TENANT',
	tResPathInfoDialogTitle:	'Selected Path Information',
	tResTenantSubTitle:			'TENANT',
	tResServiceSubTitle:		'SERVICE',
	tResTypeSubTitle:			'TYPE',
	tResPathSubTitle:			'PATH',
	tResParentPathSubTitle:		'PARENT PATH',
	tResCreatePathSubTitle:		'CREATE PATH',
	tResRoleTokenSubTitle:		'ROLE TOKEN',
	tResUDSSubTitle:			'USER DATA SCRIPT',
	tResCopyUDSTT:				'Copy user data script to clipboard',
	tResCreatePathHint:			'Input create path',
	tResTenantServiceSubTitle:	'TENANT for SERVICE owner',
	tResCreateServiceSubTitle:	'CREATE SERVICE',
	tResVURLorResourceSubTitle:	'VERIFY URL or STATIC RESOURCE',
	tResCreateServiceHint:		'Input create service name',
	tResVURLorResourceHint:		'Input verify URL or Resource',
	tResAliasRoleHint:			'Role path under tenant(yrn:yahoo:::<tenant>)',
	tResResourceValueSubTitle:	'VALUE',
	tResResourceValueTypeText:	'String Type(text data)',
	tResResourceValueTypeObj:	'Object Type(string formatted by JSON)',
	tResResourceValueTextHint:	'Input text string',
	tResResourceValueObjHint:	'Input object formatted by JSON string',
	tResResourceKeysSubTitle:	'KEYS',
	tResResourceKeySubTitle:	'KEY NAME',
	tResResourceKValueSubTitle:	'VALUE',
	tResResourceKeysKeyHint:	'Input key name',
	tResResourceKeysValueHint:	'Input value(allowed JSON fomrat)',
	tResResourceKeysDelTT:		'Delete key and value',
	tResResourceKeysAddTT:		'Add key and value',
	tResAliasSubTitle:			'ALIASES',
	tResAliasDownTT:			'move to down position in aliases list',
	tResAliasUpTT:				'move to up position in aliases list',
	tResAliasDelTT:				'Delete alias',
	tResAliasAddTT:				'Add alias',
	tResAliasHint:				'Input alias YRN path',
	tResPolicyEffectSubTitle:	'EFFECT',
	tResPolicyActionSubTitle:	'ACTION',
	tResPolicyResourceSubTitle:	'RESOURCE(YRN)',
	tResPolicyResourceDelTT:	'Delete resource YRN path',
	tResPolicyResourceAddTT:	'Add resource YRN path',
	tResPolicyResourceHint:		'Input resource YRN path',
	tResRoleHostnamesSubTitle:	'HOST NAMES',
	tResRoleHostnameLabel:		'HOST NAME',
	tResRoleAUXLabel:			'AUX',
	tResRoleHostnameDelTT:		'Delete hostname information',
	tResRoleHostnameHint:		'Input hostname(FQDN)',
	tResRoleHostnameAUXHint:	'Input AUX for hostname',
	tResRoleHostnameAddTT:		'Add hostname(FQDN) with AUX',
	tResRoleIpsSubTitle:		'IP ADDRESSES',
	tResRoleIpLabel:			'IP ADDRESS',
	tResRoleIpDelTT:			'Delete IP address information',
	tResRolePoliciesSubTitle:	'POLICIES',
	tResRolePolicyDelTT:		'Delete policy YRN path',
	tResRolePolicyHint:			'Input policy YRN path',
	tResRolePolicyAddTT:		'Add policy YRN path',
	tResServiceUrlResSubTitle:	'VERIFY URL or STATIC JSON OBJECT STRING',
	tResServiceUrlResHint:		'Input verify URL or Text string or false or Object formatted by JSON',
	tResServiceTenantsSubTitle:	'TENANTS',
	tResServiceTenantDelTT:		'Delete tenant YRN path',
	tResServiceTenantHint:		'Input tenant YRN path',
	tResServiceTenantAddTT:		'Add tenant YRN path',

	wDeprecateAuth:				'[Deprecated] This system sends passphrases without encryption.',

	eCommunication:				'Communication error. Details: ',
	eNowUpdating:				'Currently being edited. Please discard the contents being edited (CANCEL) or save (SAVE) and then perform the operation.',

	eNewKeyName:				'The key name to be added is incorrect (eg empty string).',
	eNewKeyValue:				'The value to be added is illegal (unrecognizable type).',
	eNewAliases:				'The ALIAS to be added is invalid (such as empty string).',
	eNewResources:				'The RESOURCE to be added is invalid (eg empty string).',
	eNewTenant:					'TENANT to be added is incorrect (such as empty string).',
	eNewPolicies:				'POLICY to be added is invalid (empty string etc).',
	eNewHostName:				'HOSTNAME to be added is invalid (such as empty string).',
	eNewHostAuxiliary:			'Add HOSTNAME or AUXILIARY is invalid.',

	eResourceType:				'The resource type is invalid.',
	eSameKey:					'There are multiple KEYs of the same name in KEY.',
	eEmptyKey:					'There is an empty KEY name.',
	eEmptyAliases:				'There is an empty ALIAS name.',
	eNotYRNAliases:				'The ALIAS name must be started on the YRN path.',
	eNotYRNTenant:				'The TENANT name must be started on the YRN path.',
	eNoChange:					'I can not find any changes. (It is the same value)',
	eEffectType:				'The value of EFFECT is invalid.',
	eActionType:				'The value of ACTION is invalid.',
	eResourceArray:				'RESOURCE value (must be started with YRN) is invalid.',
	eAliasArray:				'The value of ALIAS is invalid.',
	eTenantArray:				'The value of TENANT is invalid. (The same value is specified more than once)',
	eTenantOwnerArray:			'The value of TENANT is invalid. (Please do not specify TENANT owner)',
	eSameHost:					'There are two or more same values in HOSTNAME and AUXILIARY.',
	eWrongAuxiliary:			'HOSTNAME and AUXILIARY have illegal values.',
	ePoliciesArray:				'POLICY value (must be started with YRN) is invalid.',

	eNewServiceName:			'The newly created SERVICE name is invalid.',
	eNewServiceNameConflict:	'A newly created SERVICE name already exists.',
	eNewEmptyVerify:			'VERIFY of newly created SERVICE is illegal (empty).',
	eNewWrongVerifyObject:		'VERIFY of newly created SERVICE is illegal STATIC RESOURCE JSON.',
	eNewWrongVerifyUrl:			'VERIFY of newly created SERVICE is an illegal URL.',
	eNewPath:					'Newly created PATH is invalid.',
	eNewPathHasParser:			'Newly created PATH can not contain "/".',
	eNewPathConflict:			'A newly created PATH already exists.',

	eNotSelectRole:				'TENANT or ROLE path is not selected.',
	eUnknownSignInType:			'The type of Signin / Signout is undefined. Please contact the server administrator.'
};

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
