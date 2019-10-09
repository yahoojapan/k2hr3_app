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
	cStaticResourceTitle:		'静的リソース',
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
	tResButtonPrevious:			'前に戻る',
	tResButtonCreate:			'新規作成',
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
	tResPathInfoDialogTitle:	'パス情報',
	tResRoleTokenDialogTitle:	'ロールトークン管理',
	tResDispCodeDialogTitle:	'ロールトークン / 登録用コード',
	tResTenantSubTitle:			'テナント名',
	tResServiceSubTitle:		'サービス名',
	tResTypeSubTitle:			'種別',
	tResPathSubTitle:			'パス',
	tResParentPathSubTitle:		'親パス',
	tResCreatePathSubTitle:		'作成パス',
	tResRoleTokenSubTitle:		'ロールトークン',
	tResRoleTokenTimeSubTitle:	'作成日時 ( 有効期限 )',
	tResUnknownTimeUnit:		'(不明)',
	tResDaysTimeUnit:			'日',
	tResHoursTimeUnit:			'時間',
	tResMinutesTimeUnit:		'分',
	tResSecondsTimeUnit:		'秒',
	tResRoleTokenManageButton:	'ロールトークンの管理',
	tResDispCodeNewRoleToken:	'ロールトークン新規作成（有効期限付き）・登録用コード表示',
	tResRoleTokenManageTT:		'ロールトークンの一覧表示と管理',
	tResDispCodeNewRoleTokenTT:	'デフォルトの有効期限付きロールトークンを新規作成して登録用コードを表示',
	tResAddRoleTokenTT:			'ロールトークンを新規作成',
	tResDeleteRoleTokenTT:		'このロールトークンを削除',
	tResDispCodeButtonTT:		'このロールトークンに対応した登録用コードを表示',
	tResActionTableHead:		'操作',
	tResCreateTimeTableHead:	'作成日時',
	tResExpireTimeTableHead:	'有効期限',
	tResRoleTokenTableHead:		'ロールトークン',
	tResRoleTokenPopoverTitle:	'新規ロールトークン',
	tResRoleTokenExpireCheck:	'有効期限を最長期間にする',
	tResNewRoleTokenButton:		'作成',
	tResCodeSubTitle:			'登録用コード',
	tResCopyClipboardButton:	'クリップボードにコピー',
	tResCopyClipboardTT:		'クリップボードにコピーする',
	tResCreatePathHint:			'作成するパスを入力してください',
	tResTenantServiceSubTitle:	'サービスオーナのテナント',
	tResCreateServiceSubTitle:	'作成サービス',
	tResCreateServiceHint:		'作成するサービス名を入力してください',
	tResStaticResNameSubTitle:	'静的リソース名',
	tResStaticResNameHint:		'静的リソース名を入力してください',
	tResStaticResExpSubTitle:	'有効期間（秒：未入力可）',
	tResStaticResExpHint:		'有効期間（秒）を入力してください（未入力可能）',
	tResStaticResTypeSubTitle:	'静的リソース値タイプ',
	tResStaticResKeysSubTitle:	'KEYS（キー/値）',
	tResStaticResStringType:	'文字列(テキスト)',
	tResStaticResObjectType:	'オブジェクト',
	tResStaticResAddKeyTT:		'新規キーと値を追加',
	tResStaticResDelKeyTT:		'このキーと値を削除',
	tResStaticResEditKeyTT:		'このキーと値を編集',
	tResStaticResKeyTableHead:	'キー名',
	tResStaticResKValTableHead:	'値',
	tResStaticResKeyNewTitle:	'KEY新規作成',
	tResStaticResKeyEditTitle:	'KEY編集',
	tResStaticResKeyCreateBtn:	'作成',
	tResStaticResKeyUpdateBtn:	'更新',
	tResStaticResKeyPopover:	'キー名',
	tResStaticResKValPopover:	'値',
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
	tResServiceUrlResSubTitle:	'サービスリソース',
	tResServiceResTypeUrl:		'VERIFY URL',
	tResServiceResTypeStatic:	'静的リソース',
	tResServiceNameTableHead:	'静的リソース名',
	tResServiceJsonTableHead:	'JSON文字列',
	tResServiceAddStaticResTT:	'静的リソースを追加',
	tResServiceEditStaticResTT:	'この静的リソースを編集',
	tResServiceDelStaticResTT:	'この静的リソースを削除',
	tResServiceUrlResHint:		'VERIFY URL を入力してください',
	tResServiceTenantsSubTitle:	'テナント登録',
	tResServiceTenantDelTT:		'このテナント（YRNパス）を削除',
	tResServiceTenantHint:		'テナント（YRNパス）を入力してください',
	tResServiceTenantAddTT:		'テナント（YRNパス）を追加',
	tResServiceStaticObjHint:	'静的リソースが設定されていません',
	tResServiceUnknownType:		'不正な静的リソース（JSON）が設定されているため、詳細を表示できません。',

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

	eNewServiceName:			'SERVICE名が不正です。',
	eNewServiceNameConflict:	'SERVICE名はすでに存在しています。',
	eNewEmptyVerify:			'SERVICEのVERIFY URLもしくは静的リソースが不正（空）です。',
	eNewWrongVerifyObject:		'SERVICEの静的リソースが不正なJSONもしくは空です。',
	eNewWrongVerifyUrl:			'SERVICEのVERIFY URLが不正なURLです。',
	eNewPath:					'新規作成のPATHが不正です。',
	eNewPathHasParser:			'新規作成のPATHには、"/"を含めることができません。',
	eNewPathConflict:			'新規作成のPATHはすでに存在しています。',

	eNotSelectRole:				'TENANTもしくはROLEパスが選択されていません。',
	eUnknownSignInType:			'Sign In/Outのタイプが未定義です。サーバー管理者に問い合わせしてください。',
	eUnknownErrorKey:			'メッセージ処理中にエラーが発生しました。正確なエラーメッセージが表示できません。',
	eStaticResNameEmpty:		'リソース名が空です。有効なリソース名を入力してください。',
	eStaticResNameFoundSame:	'既に同じリソース名が登録されています。',
	eStaticResExpireInvalid:	'有効期間が不正です。未入力もしくは正の数値を入力してください。',
	eStaticResObjDataInvalid:	'静的リソース値は空かJSON文字列でなければなりません。',
	eStaticResKeyEmpty:			'キー名が空です。有効なキー名を入力してください。',
	eStaticResKeySameKey:		'入力されたキー名は既に定義されています。'
};

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
