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
	iNotHaveAnyTenant:			'TENANT is missing. The account must be associated with one or more tenant(project/server/namespace groups).',
	iSignouted:					'Signed out. ',
	iSignined:					'Signed in. ',

	cUpdatingTitle:				'Confirmation',
	cUpdatingCancel:			'Discard edited content?',
	cAccountTitle:				'Account Information',
	cCreateNewPathTitle:		'Create a new path',
	cCreateServiceTitle:		'Create a new SERVICE',
	cCreateLocalTenantTitle:	'Create a Local TENANT',
	cLocalTenantTitle:			'Local TENANT Information',
	cStaticResourceTitle:		'STATIC RESOURCE OBJECT',
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
	tResButtonPrevious:			'PREVIOUS',
	tResButtonCreate:			'CREATE',
	tResMainMenuTT:				'Main menu',
	tResLicensesMenu:			'Licenses',
	tResNoLicenseMenu:			'(No licenses)',
	tResAboutMenu:				'About K2HR3',
	tResAccountMenuTT:			'Account',
	tResSigninMenu:				'Sign in',
	tResSignoutMenu:			'Sign out',
	tResSigninName:				'Signed in as ',
	tResAddLocalTenantMenu:		'Create Local Tenant...',
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
	tResRoleTokenDialogTitle:	'Manage Role Tokens',
	tResDispCodeDialogTitle:	'Role Token / Registration code',
	tResTenantSubTitle:			'TENANT',
	tResServiceSubTitle:		'SERVICE',
	tResTypeSubTitle:			'TYPE',
	tResPathSubTitle:			'PATH',
	tResParentPathSubTitle:		'PARENT PATH',
	tResCreatePathSubTitle:		'CREATE PATH',
	tResRoleTokenSubTitle:		'ROLE TOKEN',
	tResRoleTokenTimeSubTitle:	'Creation date ( Expiration date )',
	tResUnknownTimeUnit:		'(unknown)',
	tResDaysTimeUnit:			'day',
	tResHoursTimeUnit:			'hour',
	tResMinutesTimeUnit:		'min',
	tResSecondsTimeUnit:		'sec',
	tResRoleTokenManageButton:	'Manage role tokens',
	tResDispCodeNewRoleToken:	'Creating a new role token(expire) and registration code',
	tResRoleTokenManageTT:		'List and manage role tokens',
	tResDispCodeNewRoleTokenTT:	'Create a new role token(with default exipre) and display the registration code',
	tResAddRoleTokenTT:			'Create new role token',
	tResDeleteRoleTokenTT:		'Delete this role token',
	tResDispCodeButtonTT:		'Display the registration code with this role token',
	tResActionTableHead:		'Action',
	tResCreateTimeTableHead:	'Create Time',
	tResExpireTimeTableHead:	'Expire Time',
	tResRoleTokenTableHead:		'Role Token',
	tResRoleTokenPopoverTitle:	'CREATE NEW ROLE TOKEN',
	tResRoleTokenExpireCheck:	'Set the expiration date to the longest',
	tResNewRoleTokenButton:		'CREATE',
	tResCodeSubTitle:			'Registration code',
	tResCopyClipboardButton:	'Copy to clipboard',
	tResCopyClipboardTT:		'Copy to clipboard',
	tResCreatePathHint:			'Input create path',
	tResTenantServiceSubTitle:	'TENANT for SERVICE owner',
	tResCreateServiceSubTitle:	'CREATE SERVICE',
	tResCreateServiceHint:		'Input create service name',
	tResStaticResNameSubTitle:	'STATIC RESOURCE NAME',
	tResStaticResNameHint:		'Input STATIC RESOURCE NAME',
	tResStaticResExpSubTitle:	'Valid period(Second: Unset is allowed)',
	tResStaticResExpHint:		'Input valid period second(empty is allowed)',
	tResStaticResTypeSubTitle:	'RESOURCE VALUE TYPE',
	tResStaticResKeysSubTitle:	'KEYS(Key Value)',
	tResStaticResStringType:	'String(text)',
	tResStaticResObjectType:	'Object',
	tResStaticResAddKeyTT:		'add new Key and Value',
	tResStaticResDelKeyTT:		'delete this Key and Value',
	tResStaticResEditKeyTT:		'edit this Key and Value',
	tResStaticResKeyTableHead:	'KEY NAME',
	tResStaticResKValTableHead:	'VALUE',
	tResStaticResKeyNewTitle:	'CREATE KEY',
	tResStaticResKeyEditTitle:	'EDIT KEY',
	tResStaticResKeyCreateBtn:	'CREATE',
	tResStaticResKeyUpdateBtn:	'UPDATE',
	tResTenantUserAddBtn:		'ADD',
	tResTenantUsersEditBtn:		'UPDATE',
	tResStaticResKeyPopover:	'KEY NAME',
	tResStaticResKValPopover:	'VALUE',
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
	tResTenantEditTT:			'edit this Local Tenant',
	tResTenantUsersAddTT:		'add User to this Local Tenant',
	tResTenantUsersEditTT:		'edit Users for this Local Tenant',
	tResTenantUserDeleteTT:		'remove User from this Local Tenant member',
	tResServiceUrlResSubTitle:	'SERVICE RESOURCES',
	tResServiceResTypeUrl:		'VERIFY URL',
	tResServiceResTypeStatic:	'STATIC RESOURCE OBJECT',
	tResServiceNameTableHead:	'RESOURCES',
	tResServiceJsonTableHead:	'JSON',
	tResServiceAddStaticResTT:	'add new STATIC RESOURCE',
	tResServiceEditStaticResTT:	'edit this STATIC RESOURCE',
	tResServiceDelStaticResTT:	'delete this STATIC RESOURCE',
	tResServiceUrlResHint:		'Input verify URL',
	tResServiceTenantsSubTitle:	'TENANTS',
	tResServiceTenantDelTT:		'Delete tenant YRN path',
	tResServiceTenantHint:		'Input tenant YRN path',
	tResServiceTenantAddTT:		'Add tenant YRN path',
	tResServiceStaticObjHint:	'STATIC RESOURCE OBJECT(JSON) is not set',
	tResServiceUnknownType:		'Details cannot be displayed because an invalid STATIC RESOURCE OBJECT(JSON) is set.',
	tResAccoutUsernameTitle:	'User name',
	tResUnscopedTokenTitle:		'Unscoped Token',
	tResUnknownUsernameLabel:	'Unknown user',
	tResNoUnscopedTokenLabel:	'No unscoped token',
	tResAccountMenu:			'About Account',
	tResTenantNameSubTitle:		'TENANT name',
	tResTenantIdSubTitle:		'TENANT ID',
	tResTenantDisplaySubTitle:	'Display name',
	tResTenantDescSubTitle:		'Description',
	tResTenantUserSubTitle:		'TENANT User',
	tResLocalTenantNamePrefix:	'local@',
	tResCreateTenantNameNote:	'(If not "local@" prefix, it is automatically given.)',
	tResCreateTenantNameHint:	'Input Local TENANT name',
	tResCreateTenantDispHint:	'Input Display name for Local TENANT',
	tResTenantDescriptionlHint:	'K2HR3 Cluster Local tenant',
	tResTenantUserAddTitle:		'ADD TENANT USER',
	tResTenantUsersEditTitle:	'MANAGE TENANT USER',
	tResTenantUserAddHint:		'Input user name',

	wDeprecateAuth:				'[Deprecated] This system sends passphrases without encryption.',
	wStaticResTenantDeleting:	'There are no Users, so this Local Tenant will be permanently DELETED. ',
	wStaticResTenantNotAccess:	'You will NO LONGER have ACCESS to this Local Tenant as you will be removed from its User. ',

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
	eNewEmptyVerify:			'SERVICE VERIFY URL or STATIC RESOURCE OBJECT(JSON) is invalid(empty).',
	eNewWrongVerifyObject:		'SERVICE STATIC RESOURCE OBJECT(JSON) is invalid JSON or empty.',
	eNewWrongVerifyUrl:			'SERVICE VERIFY URL is invalid. ',
	eNewPath:					'Newly created PATH is invalid.',
	eNewPathHasParser:			'Newly created PATH can not contain "/".',
	eNewPathConflict:			'A newly created PATH already exists.',

	eNotSelectRole:				'TENANT or ROLE path is not selected.',
	eUnknownSignInType:			'The type of Signin / Signout is undefined. Please contact the server administrator.',
	eUnknownErrorKey:			'An error occurred during message processing. The exact error message cannot be displayed.',
	eStaticResNameEmpty:		'The resource name is empty. Please enter a valid resource name.',
	eStaticResNameFoundSame:	'The same resource name has already been registered.',
	eStaticResExpireInvalid:	'Valid period is not a positive number. Please enter an empty value or a positive number.',
	eStaticResObjDataInvalid:	'STATIC RESOURCE values must be empty or JSON strings.',
	eStaticResKeyEmpty:			'The key name is empty. Please enter a valid key name.',
	eStaticResKeySameKey:		'The key name entered is already defined.',
	eLocalTenantNameSame:		'The same tenant name has already been registered.',
	eLocalTenantUserEmpty:		'The user name is empty. Please enter a valid user name.',
	eLocalTenantUserWrong:		'The user name has invalid charactor. Please enter a valid user name.',
	eLocalTenantUserSame:		'The same user name has already been registered.',
	eLocalTenantUserDelOwn:		'Deleting yourself will not access to this tenant.',
	eLocalTenantNoUser:			'At least one tenant user is required.',
	eLocalTenantUserAddOwn:		'Specify users including yourself at creating a new tenant.',
	eLocalTenantUserDelete:		'Deleting all users will delete the tenant.',
	eLocalTenantUserShould:		'Recommend to register users including yourself at creating a new tenant.',
	eLocalTenantCreate:			'Failed to create local tenant : ',
	eLocalTenantUpdate:			'Failed to update local tenant : ',
	eLocalTenantDelete:			'Failed to delete local tenant : '
};

/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * End:
 * vim600: noexpandtab sw=4 ts=4 fdm=marker
 * vim<600: noexpandtab sw=4 ts=4
 */
