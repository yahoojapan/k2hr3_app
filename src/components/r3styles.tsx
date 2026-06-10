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
 * CREATE:   Tue Apr 12 2019
 * REVISION:
 *
 */

//
// Styles for Container
//
export const r3Container = (theme) => ({
	root: {
	},
	paper: {
		display:				'flex',
		margin:					theme.spacing(1),
		padding:				theme.spacing(2)
	}
});

//
// Styles for AppBar
//
export const r3AppBar = (theme) => ({
	root: {
		background:				theme.palette.primary.mainGradient
	},
	toolbar: {
	},
	title: {
		flexGrow:				1
	},
	signinedMenu: {
		fontWeight:				'bold'
	},
	menuRightIcon: {
		marginLeft:				theme.spacing(1)
	},
	signinButton: {
	},
	signoutButton: {
		color:					theme.palette.grey[500]
	}
});

//
// Styles for MainTree
//
export const r3MainTree = (theme) => ({
	root: {
	},
	tenantListText: {
		padding:				'0.3rem 0.2rem 0.2rem 0.6rem',
		float:					'left'
	},
	dummyBarAppbar: {
		background:				theme.palette.primary.mainGradient
	},
	dummyBarToolbar: {
	},
	subheaderAppbar: {
		width:					'inherit',
		backgroundColor:		theme.palette.primary.light
	},
	subheaderToolbar: {
		paddingRight:			theme.spacing(1)
	},
	title: {
		flexGrow:				1
	},
	drawer: {
		width:					'100%'
	},
	chip: {
		paddingLeft:			theme.spacing(1),
		paddingRight:			theme.spacing(1)
	},
	chipText: {
		color:					theme.palette.primary.contrastText
	},

	// For background color to over writing to paper
	adjustment: {
		width:					'100%',
		height:					'100%',
		overflowY:				'overlay',
		backgroundColor:		theme.palette.common.white
	},
	dockedList: {
		float:					'left'
	},
	expandListItemIcon: {
		marginRight:			0
	},
	collapse: {
		paddingLeft:			theme.spacing(2)
	},
	serviceLabelCollapse: {
		paddingLeft:			theme.spacing(5)				// 2 + 2 + 1
	},
	childListItemText: {
		marginLeft:				theme.spacing(5)				// 2 + 2 + 1
	},
	listItemText: {
		paddingLeft:			0
	},
	inServiceLabelListItemText: {
		paddingLeft:			0
	},
	inServiceChildListItemText: {
		marginLeft:				theme.spacing(3)				// 2 + 1
	},
	localTenantMenu: {
		fontWeight:				'bold'
	}
});

//
// Styles for Toolbar
//
export const r3Toolbar = (theme) => ({
	root: {
		width:					'inherit',
		backgroundColor:		theme.palette.primary.light
	},
	toolbar: {
	},
	title: {
		paddingLeft:			theme.spacing(1),
		paddingRight:			theme.spacing(1)
	},
	chip: {
		paddingRight:			theme.spacing(1)
	},
	chipText: {
		color:					theme.palette.primary.contrastText
	},
	ownerText: {
		paddingLeft:			theme.spacing(1),
		paddingRight:			theme.spacing(1)
	},
	avatar: {
		// [NOTE][FIXME]
		// These values are the same as .MuiChip-avatar class.
		// If we build with development mode by webpack, .MuiChip-avatar class values can be applied.
		// But if we build without development mode, the .MuiAvatar-root class values will overwrite it.
		// So we are forcing the size here.
		//
		width:					theme.spacing(3),				// 24px( as same as .MuiChip-avatar class value )
		height:					theme.spacing(3)				// 24px( as same as .MuiChip-avatar class value )
	},
	descriptionIcon: {
		color:					theme.palette.secondary.main
	},
	spacerInToolbar: {
		flexGrow:				1
	}
});

//
// Styles for Message Box
//
export const r3MsgBox = (theme) => ({
	root: {
		display:				'flex',
		margin:					theme.spacing(1),
		padding:				theme.spacing(2)
	},
	dialogErrorContentText: {
	},
	dialogWarningContentText: {
		color:					theme.palette.warning.dark
	},
	dialogInformationContentText: {
		color:					theme.palette.information.main
	},
	errorIcon: {
		float:					'left',
		marginRight:			theme.spacing(1),
	},
	warningIcon: {
		float:					'left',
		marginRight:			theme.spacing(1),
		color:					theme.palette.warning.dark
	},
	informationIcon: {
		float:					'left',
		marginRight:			theme.spacing(1),
		color:					theme.palette.information.main
	}
});

//
// Styles for Resource Page
//
export const r3Resource = (theme) => ({
	root: {
		display:				'block',
		width:					'100%'
	},
	subTitleTop: {
		paddingLeft:			'0px',
		clear:					'both'
	},
	subTitle: {
		paddingLeft:			'0px',
		clear:					'both',
		marginTop:				theme.spacing(6)
	},
	valueFormControl: {
		paddingLeft:			theme.spacing(6)
	},
	valueRadioGroup: {
		display:				'block'
	},
	valueLeftFormControlLabel: {
		float:					'left',
	},
	valueRightFormControlLabel: {
		marginLeft:				theme.spacing(2)
	},
	valueTextField: {
		display:				'block',
		paddingLeft:			theme.spacing(6)
	},

	// [NOTE]
	// If the content area is divided into two, the width of one is 50% width size
	// (this value includes the padding size) minus the size of one half of the button.
	// Since the button is 40px wide with padding 8px on (24x24)px, we need to subtract
	// 20px. Because calc can not use variables, it uses numerical values.
	//
	keysKeySubTitle: {
		float:					'left',
		width:					`calc(50% - 20px)`,				// eslint-disable-line quotes
		paddingLeft:			theme.spacing(6)
	},
	keysValueSubTitle: {
		width:					`calc(50% - 20px)`,				// eslint-disable-line quotes
		paddingLeft:			theme.spacing(2)
	},
	keysKeyTextField: {
		float:					'left',
		width:					`calc(50% - 20px)`,				// eslint-disable-line quotes
		paddingLeft:			theme.spacing(6)
	},
	keysValueTextField: {
		float:					'left',
		width:					`calc(50% - 20px)`,				// eslint-disable-line quotes
		paddingLeft:			theme.spacing(2)
	},
	deleteKeysButton: {
		display:				'flex'
	},
	deleteInvisibleKeysButton: {
		visibility:				'hidden',
		display:				'flex'
	},
	addKeysButton: {
		display:				'flex'
	},
	aliasTextField: {
		float:					'left',
		width:					`calc(100% - 120px)`,			// eslint-disable-line quotes
		paddingLeft:			theme.spacing(6)
	},
	arrowAliasButton: {
		float:					'left',
		display:				'flex'
	},
	arrowInvisibleAliasButton: {
		visibility:				'hidden',
		float:					'left',
		display:				'flex'
	},
	addAliasButton: {
		float:					'right',
		display:				'flex',
		paddingRight:			theme.spacing(3)
	},
	deleteAliasButton: {
		display:				'flex'
	},
	deleteInvisibleAliasButton: {
		visibility:				'hidden',
		display:				'flex'
	},
	inputTextField: {
		color:					theme.palette.text.secondary
	},
	enclosureElement: {
		overflow:				'auto',
		clear:					'both'
	}
});

//
// Styles for Policy Page
//
export const r3Policy = (theme) => ({
	root: {
		display:				'block',
		width:					'100%'
	},
	subTitleTop: {
		paddingLeft:			'0px',
		clear:					'both'
	},
	subTitle: {
		paddingLeft:			'0px',
		clear:					'both',
		marginTop:				theme.spacing(6)
	},
	effectSelect: {
		marginLeft:				theme.spacing(6)
	},
	actionCheckbox: {
	},
	actionLeftLabel: {
		float:					'left',
		marginLeft:				theme.spacing(6)
	},
	actionMidLabel: {
		float:					'left',
		paddingLeft:			theme.spacing(1)
	},
	actionEndLabel: {
		paddingLeft:			theme.spacing(1)
	},

	// [NOTE]
	// about width, please see comment in r3Resource.
	//
	resourceTextField: {
		float:					'left',
		width:					`calc(100% - 40px)`,			// eslint-disable-line quotes
		paddingLeft:			theme.spacing(6)
	},
	addResourceButton: {
		display:				'flex'
	},
	deleteResourceButton: {
		display:				'flex'
	},
	deleteInvisibleResourceButton: {
		visibility:				'hidden',
		display:				'flex'
	},
	aliasTextField: {
		float:					'left',
		width:					`calc(100% - 120px)`,			// eslint-disable-line quotes
		paddingLeft:			theme.spacing(6)
	},
	arrowAliasButton: {
		float:					'left',
		display:				'flex'
	},
	arrowInvisibleAliasButton: {
		visibility:				'hidden',
		float:					'left',
		display:				'flex'
	},
	addAliasButton: {
		float:					'right',
		display:				'flex',
		paddingRight:			theme.spacing(3)
	},
	deleteAliasButton: {
		display:				'flex'
	},
	deleteInvisibleAliasButton: {
		visibility:				'hidden',
		display:				'flex'
	},
	inputTextField: {
		color:					theme.palette.text.secondary
	},
	enclosureElement: {
		overflow:				'auto',
		clear:					'both'
	}
});

//
// Styles for Role Page
//
export const r3Role = (theme) => ({
	root: {
		display:				'block',
		width:					'100%'
	},
	subTitleTop: {
		paddingLeft:			'0px',
		clear:					'both'
	},
	subTitle: {
		paddingLeft:			'0px',
		clear:					'both',
		marginTop:				theme.spacing(6)
	},

	// [NOTE]
	// about width, please see comment in r3Resource.
	//
	hostnameSubTitle: {
		float:					'left',
		width:					`calc(50% - 20px)`,				// eslint-disable-line quotes
		paddingLeft:			theme.spacing(6)
	},
	hostnameAUXSubTitle: {
		width:					`calc(50% - 20px)`,				// eslint-disable-line quotes
		paddingLeft:			theme.spacing(2)
	},
	hostnameTextField: {
		float:					'left',
		width:					`calc(50% - 20px)`,				// eslint-disable-line quotes
		paddingLeft:			theme.spacing(6)
	},
	hostnameAUXTextField: {
		float:					'left',
		width:					`calc(50% - 20px)`,				// eslint-disable-line quotes
		paddingLeft:			theme.spacing(2)
	},
	deleteHostnameButton: {
		display:				'flex'
	},
	deleteInvisibleHostnameButton: {
		visibility:				'hidden',
		display:				'flex'
	},
	addHostnameButton: {
		display:				'flex'
	},
	ipSubTitle: {
		float:					'left',
		width:					`calc(50% - 20px)`,				// eslint-disable-line quotes
		paddingLeft:			theme.spacing(6)
	},
	ipAUXSubTitle: {
		width:					`calc(50% - 20px)`,				// eslint-disable-line quotes
		paddingLeft:			theme.spacing(2)
	},
	ipTextField: {
		float:					'left',
		width:					`calc(50% - 20px)`,				// eslint-disable-line quotes
		paddingLeft:			theme.spacing(6)
	},
	ipAUXTextField: {
		float:					'left',
		width:					`calc(50% - 20px)`,				// eslint-disable-line quotes
		paddingLeft:			theme.spacing(2)
	},
	deleteIpButton: {
		display:				'flex'
	},
	deleteInvisibleIpButton: {
		visibility:				'hidden',
		display:				'flex'
	},
	policyTextField: {
		float:					'left',
		width:					`calc(100% - 40px)`,			// eslint-disable-line quotes
		paddingLeft:			theme.spacing(6)
	},
	addPolicyButton: {
		display:				'flex'
	},
	deletePolicyButton: {
		display:				'flex'
	},
	deleteInvisiblePolicyButton: {
		visibility:				'hidden',
		display:				'flex'
	},
	aliasTextField: {
		float:					'left',
		width:					`calc(100% - 120px)`,			// eslint-disable-line quotes
		paddingLeft:			theme.spacing(6)
	},
	arrowAliasButton: {
		float:					'left',
		display:				'flex'
	},
	arrowInvisibleAliasButton: {
		visibility:				'hidden',
		float:					'left',
		display:				'flex'
	},
	addAliasButton: {
		float:					'right',
		display:				'flex',
		paddingRight:			theme.spacing(3)
	},
	deleteAliasButton: {
		display:				'flex'
	},
	deleteInvisibleAliasButton: {
		visibility:				'hidden',
		display:				'flex'
	},
	inputTextField: {
		color:					theme.palette.text.secondary
	},
	enclosureElement: {
		overflow:				'auto',
		clear:					'both'
	}
});

//
// Styles for Service Page
//
export const r3Service = (theme) => ({
	root: {
		display:				'block',
		width:					'100%'
	},
	subTitleTop: {
		paddingLeft:			'0px',
		clear:					'both'
	},
	subTitle: {
		paddingLeft:			'0px',
		clear:					'both',
		marginTop:				theme.spacing(6)
	},
	resourceTextField: {
		width:					'100%',
		paddingLeft:			theme.spacing(6)
	},
	staticResourceTextField: {
		width:					'100%'
	},
	valueRadioGroup: {
		display:				'block',
		paddingLeft:			theme.spacing(6)
	},
	valueLeftFormControlLabel: {
		float:					'left',
	},
	valueRightFormControlLabel: {
		marginLeft:				theme.spacing(2)
	},
	tableBox: {
		paddingLeft:			theme.spacing(6)
	},
	table: {
	},
	tableHead: {
		backgroundColor:		theme.palette.primary.light
	},
	tableCell: {
		whiteSpace:				'nowrap',
		textAlign:				'left',
		paddingTop:				theme.spacing(0.25),
		paddingBottom:			theme.spacing(0.25)
	},
	textTableHead: {
		whiteSpace:				'nowrap',
		textAlign:				'left'
	},
	textTableContent: {
		whiteSpace:				'nowrap'
	},
	unknownMessage: {
		clear:					'both',
		paddingLeft:			theme.spacing(6),
		color:					theme.palette.warning.dark
	},
	inputTextField: {
		color:					theme.palette.text.secondary
	},
	tenantTextField: {
		float:					'left',
		width:					`calc(100% - 40px)`,			// eslint-disable-line quotes
		paddingLeft:			theme.spacing(6)
	},
	addResStaticObjButton: {
		float:					'right',
		display:				'flex'
	},
	editResStaticObjButton: {
		float:					'right',
		display:				'flex'
	},
	delResStaticObjButton: {
		float:					'right',
		display:				'flex'
	},
	addTenantButton: {
		float:					'right',
		display:				'flex'
	},
	deleteTenantButton: {
		display:				'flex'
	},
	enclosureElement: {
		overflow:				'auto',
		clear:					'both'
	}
});

//
// Styles for Form Button
//
export const r3FormButtons = (theme) => ({
	root: {
		float:					'right',
		display:				'inline-block',
		position:				'relative',
		padding:				0,
		marginTop:				theme.spacing(6),
		clear:					'both'
	},
	cancelButton: {
	},
	saveButton: {
		marginLeft:				theme.spacing(1)
	},
	buttonIcon: {
		marginLeft:				theme.spacing(1),
	}
});

//
// Styles for Progress
//
export const r3Progress = (theme) => ({							// eslint-disable-line no-unused-vars
	root: {														// Full screen and most foreground
		width:					'100vw',
		height:					'100vh',
		top:					0,
		left:					0,
		position:				'fixed',
		zIndex:					1500,
		backgroundColor:		'rgba(0,0,0,0)'
	},
	circularProgress: {											// center of page
		top:					'45vh',
		left:					'45vw',
		position:				'fixed'
	}
});

//
// Styles for About Dialog
//
export const r3AboutDialogStyles = (theme) => ({
	root: {
	},
	dialogTitle: {
	},
	title: {
	},
	dialogContent: {
		marginRight:			theme.spacing(1)
	},
	dialogContentText: {
	},
	dialogAction: {
	},
	button: {
	},
	buttonIcon: {
		marginLeft:				theme.spacing(1),
	}
});

//
// Styles for Create Path Dialog
//
export const r3AccountDialog = (theme) => ({
	root: {
	},
	dialogTitle: {
	},
	title: {
	},
	dialogContent: {
	},
	subTitle: {
		marginTop:				theme.spacing(2)
	},
	value: {
		paddingLeft:			theme.spacing(4)
	},
	valueItalic: {
		fontStyle:				'italic',
		paddingLeft:			theme.spacing(4)
	},
	okButton: {
		marginTop:				theme.spacing(2)
	},
	buttonIcon: {
		marginLeft:				theme.spacing(1)
	},
	unscopedtokenInputTextField: {
		color:					theme.palette.text.secondary,
		backgroundColor:		theme.palette.common.white,
		padding:				theme.spacing(1)
	},
	unscopedtokenTextField: {
		paddingLeft:			theme.spacing(4),
		marginBottom:			theme.spacing(1)
	},
	copyClipboardButton: {
		float:					'right',
		color:					theme.palette.primary.main,
		textTransform:			'none'
	},
	copyClipboardIcon: {
		marginRight:			theme.spacing(1)
	}
});

//
// Styles for Signin Credential Dialog
//
export const r3SigninCredDialogStyles = (theme) => ({
	root: {
	},
	dialogTitle: {
	},
	title: {
	},
	dialogContent: {
	},
	dialogContentText: {
	},
	messagePaper: {
		background: 			theme.palette.common.white,
		padding:				theme.spacing(2)
	},
	messageIcon: {
		float:					'left'
	},
	message: {
		marginRight:			theme.spacing(1)
	},
	textField: {
		clear:					'both',
		margin:					theme.spacing(1)
	},
	inputTextField: {
		color:					theme.palette.text.secondary
	},
	cancelButton: {
		marginTop:				theme.spacing(2)
	},
	signinButton: {
		marginTop:				theme.spacing(2)
	},
	buttonIcon: {
		marginLeft:				theme.spacing(1)
	}
});

//
// Styles for Popup Message Dialog
//
export const r3PopupMsgDialog = (theme) => ({
	root: {
	},
	dialogTitle: {
	},
	title: {
	},
	dialogContent: {
	},
	dialogErrorContentText: {
	},
	dialogWarningContentText: {
		color:					theme.palette.warning.dark
	},
	dialogInformationContentText: {
		color:					theme.palette.information.main
	},
	errorIcon: {
		float:					'left',
		marginRight:			theme.spacing(1),
	},
	warningIcon: {
		float:					'left',
		marginRight:			theme.spacing(1),
		color:					theme.palette.warning.dark
	},
	informationIcon: {
		float:					'left',
		marginRight:			theme.spacing(1),
		color:					theme.palette.information.main
	},
	primaryButton: {
		marginTop:				theme.spacing(2)
	},
	cancelButton: {
		marginTop:				theme.spacing(2)
	},
	buttonIcon: {
		marginLeft:				theme.spacing(1)
	}
});

//
// Styles for Path Information Dialog
//
export const r3PathInfoDialog = (theme) => ({
	root: {
	},
	dialogTitle: {
	},
	title: {
	},
	dialogContent: {
	},
	keyTitle: {
		marginTop:				theme.spacing(2)
	},
	value: {
		paddingLeft:			theme.spacing(4)
	},
	valueItalic: {
		fontStyle:				'italic',
		paddingLeft:			theme.spacing(4)
	},
	button: {
		marginTop:				theme.spacing(2)
	},
	previousButton: {
		marginTop:				theme.spacing(2)
	},
	buttonIcon: {
		marginLeft:				theme.spacing(1)
	},

	// Main page
	roleTokenButton: {
		color:					theme.palette.primary.main,
		margin:					0,
		marginLeft:				theme.spacing(3),
		paddingLeft:			theme.spacing(1),
		paddingRight:			theme.spacing(1),
		minWidth:				theme.spacing(1),
		textTransform:			'none'
	},
	roleTokenButtonIcon: {
		marginRight:			theme.spacing(1)
	},

	// Manage Role Token page
	table: {
	},
	tableHead: {
		backgroundColor:		theme.palette.primary.light
	},
	textTableHead: {
		whiteSpace:				'nowrap',
		textAlign:				'center'
	},
	textActionTableHead: {
		whiteSpace:				'nowrap',
		textAlign:				'center',
		paddingTop:				theme.spacing(0.5)
	},
	textTableContent: {
		whiteSpace:				'nowrap'
	},
	textNewTableContent: {
		whiteSpace:				'nowrap',
		fontWeight:				'bold'
	},
	tableCell: {
		whiteSpace:				'nowrap',
		textAlign:				'center',
		paddingTop:				theme.spacing(0.25),
		paddingBottom:			theme.spacing(0.25)
	},
	wordBreakTooltip: {
		whiteSpace:				'normal',
		wordBreak:				'break-all',
		zIndex:					1500,							// original(3.9.4) property value
		opacity:				0.9,							// original(3.9.4) property value
		pointerEvents:			'none'							// original(3.9.4) property value
	},
	manageAddButton: {
		margin:					0,
		paddingLeft:			theme.spacing(1),
		paddingRight:			theme.spacing(1),
		minWidth:				theme.spacing(1),
		float:					'left'
	},
	manageActionButton: {
		margin:					0,
		paddingLeft:			theme.spacing(1),
		paddingRight:			theme.spacing(1),
		minWidth:				theme.spacing(1),
		textTransform:			'none'
	},
	newRoleTokenPopover: {
	},
	newRoleTokenPopoverTitle: {
		marginLeft:				theme.spacing(2),
		marginTop:				theme.spacing(1),
		marginBottom:			theme.spacing(1),
		marginRight:			theme.spacing(1)
	},
	newRoleTokenExpireForm: {
		margin:					theme.spacing(1)
	},
	newRoleTokenExpireCheck: {
		float:					'left'
	},
	newRoleTokenExpireLabel: {
		marginLeft:				0,
		marginTop:				theme.spacing(1),
		marginBottom:			theme.spacing(1),
		marginRight:			theme.spacing(1)
	},
	createRoleTokenButton: {
		margin:					theme.spacing(1)
	},

	// Display role token and registration code page
	roletokenInputTextField: {
		color:					theme.palette.text.secondary,
		backgroundColor:		theme.palette.common.white,
		padding:				theme.spacing(1)
	},
	roletokenTextField: {
		paddingLeft:			theme.spacing(4),
		marginBottom:			theme.spacing(1)
	},
	roletokenClipboardButton: {
		float:					'right',
		color:					theme.palette.primary.main,
		textTransform:			'none'
	},
	codeTypeSelect: {
		marginLeft:				theme.spacing(4),
		marginBottom:			theme.spacing(1)
	},
	codeTypeSelectInput: {
		color:					theme.palette.text.secondary
	},
	codeInputTextField: {
		color:					theme.palette.text.secondary,
		backgroundColor:		theme.palette.common.white,
		padding:				theme.spacing(1)
	},
	codeTextField: {
		paddingLeft:			theme.spacing(4),
		marginBottom:			theme.spacing(1)
	},
	copyClipboardButton: {
		float:					'right',
		color:					theme.palette.primary.main,
		textTransform:			'none'
	},
	copyClipboardIcon: {
		marginRight:			theme.spacing(1)
	}
});

//
// Styles for Create Path Dialog
//
export const r3CreatePathDialog = (theme) => ({
	root: {
	},
	dialogTitle: {
	},
	title: {
	},
	dialogContent: {
	},
	keyTitle: {
		marginTop:				theme.spacing(2)
	},
	value: {
		paddingLeft:			theme.spacing(4)
	},
	valueItalic: {
		fontStyle:				'italic',
		paddingLeft:			theme.spacing(4)
	},
	textField: {
		width:					'100%',
		paddingLeft:			theme.spacing(4),
		paddingRight:			theme.spacing(4)
	},
	inputTextField: {
		color:					theme.palette.text.secondary
	},
	cancelButton: {
		marginTop:				theme.spacing(2)
	},
	okButton: {
		marginTop:				theme.spacing(2)
	},
	buttonIcon: {
		marginLeft:				theme.spacing(1)
	}
});

//
// Styles for Create Service Dialog
//
export const r3CreateServiceDialog = (theme) => ({
	root: {
	},
	dialogTitle: {
	},
	title: {
	},
	dialogContent: {
	},
	keyTitle: {
		marginTop:				theme.spacing(2)
	},
	value: {
		paddingLeft:			theme.spacing(4)
	},
	valueItalic: {
		fontStyle:				'italic',
		paddingLeft:			theme.spacing(4)
	},
	textField: {
		width:					'100%',
		paddingLeft:			theme.spacing(4),
		paddingRight:			theme.spacing(4)
	},
	inputTextField: {
		color:					theme.palette.text.secondary
	},
	reesourceStaticTextField: {
		width:					'100%'
	},
	valueRadioGroup: {
		display:				'block',
		paddingLeft:			theme.spacing(4)
	},
	valueLeftFormControlLabel: {
		float:					'left',
	},
	valueRightFormControlLabel: {
		marginLeft:				theme.spacing(2)
	},
	tableBox: {
		paddingLeft:			theme.spacing(4),
		paddingRight:			theme.spacing(4)
	},
	table: {
	},
	tableHead: {
		backgroundColor:		theme.palette.primary.light
	},
	tableLeftCell: {
		whiteSpace:				'nowrap',
		textAlign:				'left',
		paddingTop:				theme.spacing(0.25),
		paddingBottom:			theme.spacing(0.25),
		paddingLeft:			0,
		paddingRight:			theme.spacing(8)				// [FIXME] for floating left buttons
	},
	tableCell: {
		whiteSpace:				'nowrap',
		textAlign:				'left',
		paddingTop:				theme.spacing(0.25),
		paddingBottom:			theme.spacing(0.25),
		paddingLeft:			0
	},
	textTableHead: {
		whiteSpace:				'nowrap',
		textAlign:				'left',
		paddingTop:				theme.spacing(0.25),
		paddingBottom:			theme.spacing(0.25)
	},
	textTableContent: {
		whiteSpace:				'nowrap',
		textAlign:				'left',
		lineHeight:				'200%',							// [FIXME] for centering text and icons
		paddingTop:				theme.spacing(0.25),
		paddingBottom:			theme.spacing(0.25)
	},
	actionResStaticObjButton: {
		margin:					0,
		paddingLeft:			theme.spacing(1),
		paddingRight:			theme.spacing(1),
		minWidth:				theme.spacing(1),
		float:					'left'
	},

	// Popover for editing key in static resource
	staticResKeyPopover: {
	},
	staticResKeyPopoverTitle: {
		marginLeft:				theme.spacing(2),
		marginTop:				theme.spacing(1),
		marginBottom:			theme.spacing(1),
		marginRight:			theme.spacing(1)
	},
	staticResKeyPopoverButton: {
		float:					'right',
		display:				'flex',
		margin:					theme.spacing(1)
	},
	staticResKeyPopoverSubtitle: {
		marginLeft:				theme.spacing(2),
		marginTop:				theme.spacing(1),
		marginBottom:			theme.spacing(1),
		marginRight:			theme.spacing(1)
	},
	staticResMessage: {
		clear:					'both',
		paddingLeft:			theme.spacing(6),
		color:					theme.palette.warning.dark
	},
	cancelButton: {
		marginTop:				theme.spacing(2)
	},
	okButton: {
		marginTop:				theme.spacing(2)
	},
	buttonIcon: {
		marginLeft:				theme.spacing(1)
	}
});

//
// Styles for Create Service Tenant Dialog
//
export const r3CreateServiceTenantDialog = (theme) => ({
	root: {
		height:					'1000px',
		scrollTop:				0
	},
	dialogTitle: {
	},
	title: {
	},
	dialogContent: {
	},
	keyTitle: {
		marginTop:				theme.spacing(2)
	},
	value: {
		paddingLeft:			theme.spacing(4)
	},
	valueItalic: {
		fontStyle:				'italic',
		paddingLeft:			theme.spacing(4)
	},
	textField: {
		width:					'100%',
		paddingLeft:			theme.spacing(4),
		paddingRight:			theme.spacing(4)
	},
	inputTextField: {
		color:					theme.palette.text.secondary
	},
	cancelButton: {
		marginTop:				theme.spacing(2)
	},
	okButton: {
		marginTop:				theme.spacing(2)
	},
	buttonIcon: {
		marginLeft:				theme.spacing(1)
	}
});

//
// Styles for Local Tenant Dialog
//
export const r3LocalTenantDialog = (theme) => ({
	root: {
	},
	dialogTitle: {
	},
	title: {
	},
	dialogContent: {
	},
	keyTitle: {
		marginTop:				theme.spacing(2)
	},
	value: {
		paddingLeft:			theme.spacing(4)
	},
	localTenantMessage: {
		paddingLeft:			theme.spacing(4),
		paddingRight:			theme.spacing(4)
	},
	textField: {
		width:					'100%',
		paddingLeft:			theme.spacing(4),
		paddingRight:			theme.spacing(4)
	},
	inputTextField: {
		color:					theme.palette.text.secondary
	},
	usersValue: {
		display:				'inline-block',
		paddingLeft:			theme.spacing(4),
		width:					`calc(100% - 96px)`				// eslint-disable-line quotes
	},
	usersButtonsBox: {
		float:					'right',
		display:				'flex',
		alignItems:				'flex-start'
	},
	usersEditButton: {
		padding:				0,
		margin:					theme.spacing(0),
		clear:					'both'
	},
	usersAddButton: {
		padding:				0,
		marginLeft:				theme.spacing(0),
		marginTop:				theme.spacing(0),
		marginBottom:			theme.spacing(0),
		marginRight:			theme.spacing(4),
		minWidth:				theme.spacing(4),
		clear:					'both'
	},
	popoverMessage: {
		clear:					'both',
		paddingLeft:			theme.spacing(4),
		paddingRight:			theme.spacing(4),
		color:					theme.palette.warning.dark
	},
	popoverTenantUserAdd: {
	},
	popoverTenantUserAddTitle: {
		marginLeft:				theme.spacing(2),
		marginTop:				theme.spacing(1),
		marginBottom:			theme.spacing(1),
		marginRight:			theme.spacing(2)
	},
	popoverTenantUserAddButton: {
		float:					'right',
		display:				'flex',
		margin:					theme.spacing(2)
	},
	popoverTenantUsersEdit: {
	},
	popoverTenantUsersEditTitle: {
		marginLeft:				theme.spacing(2),
		marginTop:				theme.spacing(1),
		marginBottom:			theme.spacing(1),
		marginRight:			theme.spacing(2)
	},
	popoverTenantUsersEditButton: {
		float:					'right',
		display:				'flex',
		margin:					theme.spacing(2)
	},
	popoverTenantUserDeleteButton: {
		float:					'right',
		display:				'flex'
	},
	popoverTenantUserItemBox: {
		display:				'flex'
	},
	popoverTenantUserName: {
		width:					'100%',
		display:				'flex',
		marginLeft:				theme.spacing(3),
		marginTop:				theme.spacing(1),
		marginBottom:			theme.spacing(1),
		marginRight:			theme.spacing(1)
	},
	popoverTenantUserOwnName: {
		width:					'100%',
		display:				'flex',
		fontWeight:				'bold',
		marginLeft:				theme.spacing(3),
		marginTop:				theme.spacing(1),
		marginBottom:			theme.spacing(1),
		marginRight:			theme.spacing(1)
	},
	cancelButton: {
		marginTop:				theme.spacing(2)
	},
	okButton: {
		marginTop:				theme.spacing(2)
	},
	buttonIcon: {
		marginLeft:				theme.spacing(1)
	}
});

/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * End:
 * vim600: noexpandtab sw=4 ts=4 fdm=marker
 * vim<600: noexpandtab sw=4 ts=4
 */
