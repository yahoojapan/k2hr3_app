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
	iNotSignin:					'最初にサインインしてください。',
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
	iSignouted:					'サインアウトしました。',
	iSignined:					'サインインしました。',

	cUpdatingTitle:				'確認',
	cUpdatingCancel:			'編集中の内容を破棄しますか ?',
	cCreateNewPathTitle:		'新規パス作成',
	cCreateServiceTitle:		'新規SERVICE作成',
	cCreateServiceTenantTitle:	'TENANT連携SERVICE作成',
	cDefaultRoleAlias:			'サービス連携するテナントのロール指定（未設定可）',
	cDeletingService:			'SERVICEの削除をしますか ? \n（SERVICEを削除した場合には、現在SERVICEに関連付けた全TENANT以下のSERVICEが自動的に削除されます。これにより各TENANT以下のROLEでALIASを設定している箇所は手動で削除しなくてはなりません。）',
	cDeletingServiceTenant:		'TENANT以下の関連付けられたSERVICEの削除をしますか ? \n（このSERVICE以下のROLEをALIASを設定していた場合、手動で削除しなくてはなりません。）',
	cDirectSignInTitle:			'サインイン',

	tResErrorTitle:				'ERROR',
	tResWarnTitle:				'WARNING',
	tResInfoTitle:				'INFORMATION',
	tResButtonOk:				'OK',
	tResButtonClose:			'閉じる',
	tResButtonCancel:			'キャンセル',
	tResButtonSignin:			'サインイン',
	tResButtonSave:				'更新',
	tResMainMenuTT:				'メインメニュー',
	tResLicensesMenu:			'ライセンス情報',
	tResNoLicenseMenu:			'(なし)',
	tResAboutMenu:				'K2HR3について',
	tResAccountMenuTT:			'アカウント',
	tResSigninMenu:				'サインイン',
	tResSignoutMenu:			'サインアウト',
	tResSigninName:				'サインイン中 : ',
	tResDetachTreeMenu:			'左カラムを隠す',
	tResDockTreeMenu:			'ツリーを常に表示する',
	tResUserNameTitle:			'ユーザ名（IDなど）',
	tResUserNamePlaceHolder:	'ユーザ名（ID）を入力',
	tResPassphraseTitle:		'パスフレーズ',
	tResPassphrasePlaceHolder:	'パスフレーズを入力（入力なし可能）',
	tResTenantLabel:			'テナント',
	tResUnselectedTenantLabel:	'テナント未選択',
	tResNoTenantLabel:			'テナントがありません',
	tResUnknownTenantLabel:		'不明なテナント',
	tResSelectTenantTT:			'テナント選択',
	tResTenantPathLabel:		'テナント',
	tResUnselected:				'未選択',
	tResOwnerServiceTag:		'オーナー',
	tResPathChipTT:				'選択したパス情報の表示',
	tResToUpperPathTT:			'ひとつ上のパスに移動',
	tResCreateChildPathTT:		'子パスを作成',
	tResCreateOwnerServiceTT:	'オーナーのSERVICE作成',
	tResCreateServiceTT:		'SERVICEを連携',
	tResDeletePathTT:			'このパスを削除',
	tResDeleteOwnerServiceTT:	'オーナーのSERVICEを削除',
	tResDeleteServiceTT:		'SERVICEを連携解除',
	tResPathInfoDialogTitle:	'Selected Path Information',
	tResTenantSubTitle:			'テナント名',
	tResServiceSubTitle:		'サービス名',
	tResTypeSubTitle:			'種別',
	tResPathSubTitle:			'パス',
	tResParentPathSubTitle:		'親パス',
	tResCreatePathSubTitle:		'作成パス',
	tResRoleTokenSubTitle:		'ロールトークン',
	tResUDSSubTitle:			'USER DATA SCRIPT',
	tResCopyUDSTT:				'User Data Scriptをクリップボードにコピー',
	tResCreatePathHint:			'作成するパスを入力してください',
	tResTenantServiceSubTitle:	'サービスオーナのテナント',
	tResCreateServiceSubTitle:	'作成サービス',
	tResVURLorResourceSubTitle:	'VERIFY URLもしくは静的リソース',
	tResCreateServiceHint:		'作成するサービス名を入力してください',
	tResVURLorResourceHint:		'VERIFY URLもしくは静的リソースを入力してください',
	tResAliasRoleHint:			'サービス連携するテナント(yrn:yahoo:::<tenant>)',
	tResResourceValueSubTitle:	'リソース値',
	tResResourceValueTypeText:	'文字列タイプ(テキストデータ)',
	tResResourceValueTypeObj:	'オブジェクトタイプ（JSONフォーマット文字列）',
	tResResourceValueTextHint:	'リソース文字列を入力してください',
	tResResourceValueObjHint:	'オブジェクトをJSONフォーマットで入力してください',
	tResResourceKeysSubTitle:	'KEYS',
	tResResourceKeySubTitle:	'キー名',
	tResResourceKValueSubTitle:	'値（文字列）',
	tResResourceKeysKeyHint:	'キー名を入力してください',
	tResResourceKeysValueHint:	'値（JSON可）を入力してください',
	tResResourceKeysDelTT:		'キーと値を削除',
	tResResourceKeysAddTT:		'キーと値を追加',
	tResAliasSubTitle:			'エリアス',
	tResAliasDownTT:			'このエリアスをひとつ下に移動',
	tResAliasUpTT:				'このエリアスをひとつ上に移動',
	tResAliasDelTT:				'このエリアスを削除',
	tResAliasAddTT:				'エリアスを追加',
	tResAliasHint:				'エリアス（YRNパス）を入力してください',
	tResPolicyEffectSubTitle:	'効用（エフェクト）',
	tResPolicyActionSubTitle:	'作用（アクション）',
	tResPolicyResourceSubTitle:	'リソース（YRNパス）',
	tResPolicyResourceDelTT:	'このリソース（YRNパス）を削除',
	tResPolicyResourceAddTT:	'リソース（YRNパス）を追加',
	tResPolicyResourceHint:		'リソース（YRNパス）を入力してください',
	tResRoleHostnamesSubTitle:	'ホスト名登録',
	tResRoleHostnameLabel:		'ホスト名',
	tResRoleAUXLabel:			'AUX情報',
	tResRoleHostnameDelTT:		'このホスト名とAUX情報を削除',
	tResRoleHostnameHint:		'ホスト名を入力してください',
	tResRoleHostnameAUXHint:	'AUX情報を入力してください',
	tResRoleHostnameAddTT:		'ホスト名とAUX情報を追加',
	tResRoleIpsSubTitle:		'IPアドレス登録',
	tResRoleIpLabel:			'IPアドレス',
	tResRoleIpDelTT:			'このIPアドレスとAUX情報を削除',
	tResRolePoliciesSubTitle:	'ポリシー',
	tResRolePolicyDelTT:		'このポリシー（YRNパス）を削除',
	tResRolePolicyHint:			'ポリシー（YRNパス）を入力してください',
	tResRolePolicyAddTT:		'ポリシー（YRNパス）を追加',
	tResServiceUrlResSubTitle:	'VERIFY URL もしくは 静的リソース',
	tResServiceUrlResHint:		'VERIFY URL / 静的リソース（文字列、JSON文字列）/ false を入力してください',
	tResServiceTenantsSubTitle:	'テナント登録',
	tResServiceTenantDelTT:		'このテナント（YRNパス）を削除',
	tResServiceTenantHint:		'テナント（YRNパス）を入力してください',
	tResServiceTenantAddTT:		'テナント（YRNパス）を追加',

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
