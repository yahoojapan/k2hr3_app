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
// Text Resources for Japanese
//
// Prefix:		i		=> Information
//				w		=> Warning
//				e		=> Error
//				c		=> Confirm
//				tRes	=> Text Resource(other)
//
export const r3TextRes = {
	iNotSignin:					'最初にログインをしてください。',
	iNotSelectTenant:			'最初にテナントを選択し、次に ROLE / RESOURCE / POLICY を選択し、参照、編集してください。',
	iNotSelectPath:				'SERVICE / ROLE / RESOURCE / POLICY 以下のパスを選択し、参照、編集してください。',
	iSucceedChangeTenant:		'TENANTを変更しました。',
	iSucceedChangeType:			'タイプ（SERVICE / ROLE / RESOURE / POLICY）を変更しました。',
	iSucceedChangeServiceName:	'SERVICEを変更しました。\nSERVICEをTENANTに関連付ける、関連を解除することができます。',
	iSucceedChangeServiceOwner:	'SERVICEを変更しました。\nこのTENANTはSERVICEオーナーです。内容の編集とSERVICEの削除ができます。',
	iSucceedChangeServiceType:	'SERVICEのタイプ（ROLE / RESOURE / POLICY）を変更しました。',
	iSucceedChangeServicePath:	'SERVICE以下のITEM（パス）を変更しました。このITEMは編集できません。',
	iSucceedMoveService:		'SERVICEトップに移動しました。',
	iSucceedMoveServiceName:	'SERVICEに移動しました。',
	iSucceedMoveType:			'タイプ（ROLE / POLICY / RESOURCE）に移動しました。',
	iSucceedChangePath:			'ITEM（パス）を変更しました。',
	iSucceedCreatePath:			'ITEM（パス）を新規作成しました。',
	iSucceedDeletePath:			'ITEM（パス）を削除しました。',
	iSucceedCreateService:		'TENANTがオーナーのSERVICEを作成しました。',
	iSucceedCreateServiceTenant:'TENANTに関連付けられたSERVICEを作成しました。',
	iSucceedDeleteService:		'SERVICEを削除しました。',
	iSucceedDeleteServiceTenant:'TENANTに関連付けられたSERVICEを削除しました。',
	iSucceedUpdate:				'データを更新（保存）しました。',
	iNotHaveAnyTenant:			'TENANTがありません。アカウントは1つ以上のOpenStackのサーバーグループに関連付けされていなければなりません。',
	iSignouted:					'ログアウトしました。',
	iSignined:					'ログインしました。',

	cUpdatingTitle:				'確認',
	cUpdatingCancel:			'編集中の内容を破棄しますか ?',
	cCreateNewPathTitle:		'新規パス作成',
	cCreateServiceTitle:		'新規SERVICE作成',
	cCreateServiceTenantTitle:	'TENANT連携SERVICE作成',
	cDefaultRoleAlias:			'初期連携ROLE（SERVICE連携するTENANTのROLEを指定：未設定可能）',
	cDeletingService:			'SERVICEの削除をしますか ? \n（SERVICEを削除した場合には、現在SERVICEに関連付けた全TENANT以下のSERVICEが自動的に削除されます。これにより各TENANT以下のROLEでALIASを設定している箇所は手動で削除しなくてはなりません。）',
	cDeletingServiceTenant:		'TENANT以下の関連付けられたSERVICEの削除をしますか ? \n（このSERVICE以下のROLEをALIASを設定していた場合、手動で削除しなくてはなりません。）',
	cDirectSignInTitle:			'ログイン',

	tResErrorTitle:				'ERROR',
	tResWarnTitle:				'WARNING',
	tResInfoTitle:				'INFORMATION',
	tResLicensesMenu:			'ライセンス情報',
	tResNoLicenseMenu:			'(なし)',
	tResAboutMenu:				'K2HR3について',

	wDeprecateAuth:				'[非推奨] このシステムはパスフレーズは暗号化されずに送信します。',

	eCommunication:				'通信エラーが発生しました。詳細：',
	eNowUpdating:				'現在、編集中です。編集中の内容を破棄（CANCEL）するか、保存（SAVE）した後で操作をしてください。',

	eNewKeyName:				'追加するキー名が不正（空文字など）です。',
	eNewKeyValue:				'追加する値が不正（認識できない型）です。',
	eNewAliases:				'追加するALIASが不正（空文字など）です。',
	eNewResources:				'追加するRESOURCEが不正（空文字など）です。',
	eNewTenant:					'追加するTENANTが不正（空文字など）です。',
	eNewPolicies:				'追加するPOLICYが不正（空文字など）です。',
	eNewHostName:				'追加するHOSTNAMEが不正（空文字など）です。',
	eNewHostAuxiliary:			'追加するHOSTNAMEかAUXILIARYが不正です。',

	eResourceType:				'リソースタイプが不正です。',
	eSameKey:					'KEYに同じ名前のKEYが複数あります。',
	eEmptyKey:					'空のKEY名があります。',
	eEmptyAliases:				'空のALIAS名があります。',
	eNotYRNAliases:				'ALIAS名は、YRNパスで開始されている必要があります。',
	eNotYRNTenant:				'TENANT名は、YRNパスで開始されている必要があります。',
	eNoChange:					'変更箇所が見当たりません。（同じ値です）',
	eEffectType:				'EFFECTの値が不正です。',
	eActionType:				'ACTIONの値が不正です。',
	eResourceArray:				'RESOURCEの値（YRNで開始されている必要があります）が不正です。',
	eAliasArray:				'ALIASの値が不正です。',
	eTenantArray:				'TENANTの値が不正です。（同じ値が複数指定されています）',
	eTenantOwnerArray:			'TENANTの値が不正です。（TENANTオーナーは指定しないでください）',
	eSameHost:					'HOSTNAMEとAUXILIARYに同じ値が複数あります。',
	eWrongAuxiliary:			'HOSTNAMEとAUXILIARYに不正な値があります。',
	ePoliciesArray:				'POLICYの値（YRNで開始されている必要があります）が不正です。',

	eNewServiceName:			'新規作成のSERVICE名が不正です。',
	eNewServiceNameConflict:	'新規作成のSERVICE名はすでに存在しています。',
	eNewEmptyVerify:			'新規作成のSERVICEのVERIFYが不正（空）です。',
	eNewWrongVerifyObject:		'新規作成のSERVICEのVERIFYが不正なSTATIC RESOURCE JSONです。',
	eNewWrongVerifyUrl:			'新規作成のSERVICEのVERIFYが不正なURLです。',
	eNewPath:					'新規作成のPATHが不正です。',
	eNewPathHasParser:			'新規作成のPATHには、"/"を含めることができません。',
	eNewPathConflict:			'新規作成のPATHはすでに存在しています。',

	eNotSelectRole:				'TENANTもしくはROLEパスが選択されていません。',
	eUnknownSignInType:			'Sign In/Outのタイプが未定義です。サーバー管理者に問い合わせしてください。'
};

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
