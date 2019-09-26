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
		margin:					theme.spacing.unit,
		padding:				theme.spacing.unit * 2
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
		marginLeft:				theme.spacing.unit
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
		paddingRight:			theme.spacing.unit
	},
	title: {
		flexGrow:				1
	},
	drawer: {
		width:					'100%'
	},
	chip: {
		paddingLeft:			theme.spacing.unit,
		paddingRight:			theme.spacing.unit
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
		paddingLeft:			theme.spacing.unit * 2
	},
	serviceLabelCollapse: {
		paddingLeft:			(theme.spacing.unit * 2) + (theme.spacing.unit * 2) + theme.spacing.unit
	},
	childListItemText: {
		marginLeft:				(theme.spacing.unit * 2) + (theme.spacing.unit * 2) + theme.spacing.unit
	},
	listItemText: {
		paddingLeft:			0
	},
	inServiceLabelListItemText: {
		paddingLeft:			0
	},
	inServiceChildListItemText: {
		marginLeft:				(theme.spacing.unit * 2) + theme.spacing.unit
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
		paddingLeft:			theme.spacing.unit,
		paddingRight:			theme.spacing.unit
	},
	chip: {
		paddingRight:			theme.spacing.unit
	},
	chipText: {
		color:					theme.palette.primary.contrastText
	},
	ownerText: {
		paddingLeft:			theme.spacing.unit,
		paddingRight:			theme.spacing.unit
	},
	avatar: {
		backgroundColor:		theme.palette.common.white,
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
		margin:					theme.spacing.unit,
		padding:				theme.spacing.unit * 2
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
		marginRight:			theme.spacing.unit,
	},
	warningIcon: {
		float:					'left',
		marginRight:			theme.spacing.unit,
		color:					theme.palette.warning.dark
	},
	informationIcon: {
		float:					'left',
		marginRight:			theme.spacing.unit,
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
		marginTop:				theme.spacing.unit * 6
	},
	valueFormControl: {
		paddingLeft:			theme.spacing.unit * 6
	},
	valueRadioGroup: {
		display:				'block'
	},
	valueLeftFormControlLabel: {
		float:					'left',
	},
	valueRightFormControlLabel: {
		marginLeft:				theme.spacing.unit * 2
	},
	valueTextField: {
		display:				'block',
		paddingLeft:			theme.spacing.unit * 6
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
		paddingLeft:			theme.spacing.unit * 6
	},
	keysValueSubTitle: {
		width:					`calc(50% - 20px)`,				// eslint-disable-line quotes
		paddingLeft:			theme.spacing.unit * 2
	},
	keysKeyTextField: {
		float:					'left',
		width:					`calc(50% - 20px)`,				// eslint-disable-line quotes
		paddingLeft:			theme.spacing.unit * 6
	},
	keysValueTextField: {
		float:					'left',
		width:					`calc(50% - 20px)`,				// eslint-disable-line quotes
		paddingLeft:			theme.spacing.unit * 2
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
		paddingLeft:			theme.spacing.unit * 6
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
		display:				'flex'
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
		marginTop:				theme.spacing.unit * 6
	},
	effectSelect: {
		marginLeft:				theme.spacing.unit * 6
	},
	actionCheckbox: {
	},
	actionLeftLabel: {
		float:					'left',
		marginLeft:				theme.spacing.unit * 6
	},
	actionMidLabel: {
		float:					'left',
		paddingLeft:			theme.spacing.unit
	},
	actionEndLabel: {
		paddingLeft:			theme.spacing.unit
	},

	// [NOTE]
	// about width, please see comment in r3Resource.
	//
	resourceTextField: {
		float:					'left',
		width:					`calc(100% - 40px)`,				// eslint-disable-line quotes
		paddingLeft:			theme.spacing.unit * 6
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
		width:					`calc(100% - 120px)`,				// eslint-disable-line quotes
		paddingLeft:			theme.spacing.unit * 6
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
		display:				'flex'
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
		marginTop:				theme.spacing.unit * 6
	},

	// [NOTE]
	// about width, please see comment in r3Resource.
	//
	hostnameSubTitle: {
		float:					'left',
		width:					`calc(50% - 20px)`,				// eslint-disable-line quotes
		paddingLeft:			theme.spacing.unit * 6
	},
	hostnameAUXSubTitle: {
		width:					`calc(50% - 20px)`,				// eslint-disable-line quotes
		paddingLeft:			theme.spacing.unit * 2
	},
	hostnameTextField: {
		float:					'left',
		width:					`calc(50% - 20px)`,				// eslint-disable-line quotes
		paddingLeft:			theme.spacing.unit * 6
	},
	hostnameAUXTextField: {
		float:					'left',
		width:					`calc(50% - 20px)`,				// eslint-disable-line quotes
		paddingLeft:			theme.spacing.unit * 2
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
		paddingLeft:			theme.spacing.unit * 6
	},
	ipAUXSubTitle: {
		width:					`calc(50% - 20px)`,				// eslint-disable-line quotes
		paddingLeft:			theme.spacing.unit * 2
	},
	ipTextField: {
		float:					'left',
		width:					`calc(50% - 20px)`,				// eslint-disable-line quotes
		paddingLeft:			theme.spacing.unit * 6
	},
	ipAUXTextField: {
		float:					'left',
		width:					`calc(50% - 20px)`,				// eslint-disable-line quotes
		paddingLeft:			theme.spacing.unit * 2
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
		width:					`calc(100% - 40px)`,				// eslint-disable-line quotes
		paddingLeft:			theme.spacing.unit * 6
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
		width:					`calc(100% - 120px)`,				// eslint-disable-line quotes
		paddingLeft:			theme.spacing.unit * 6
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
		display:				'flex'
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
		marginTop:				theme.spacing.unit * 6
	},
	resourceTextField: {
		width:					'100%',
		paddingLeft:			theme.spacing.unit * 6
	},
	inputTextField: {
		color:					theme.palette.text.secondary
	},
	tenantTextField: {
		float:					'left',
		width:					`calc(100% - 40px)`,				// eslint-disable-line quotes
		paddingLeft:			theme.spacing.unit * 6
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
		marginTop:				theme.spacing.unit * 6,
		clear:					'both'
	},
	cancelButton: {
	},
	saveButton: {
		marginLeft:				theme.spacing.unit
	},
	buttonIcon: {
		marginLeft:				theme.spacing.unit,
	}
});

//
// Styles for Progress
//
export const r3Progress = (theme) => ({				// eslint-disable-line no-unused-vars
	root: {											// Full screen and most foreground
		width:					'100vw',
		height:					'100vh',
		top:					0,
		left:					0,
		position:				'fixed',
		zIndex:					1500,
		backgroundColor:		'rgba(0,0,0,0)'
	},
	circularProgress: {								// center of page
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
		marginRight:			theme.spacing.unit
	},
	dialogContentText: {
	},
	dialogAction: {
	},
	button: {
	},
	buttonIcon: {
		marginLeft:				theme.spacing.unit,
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
		padding:				theme.spacing.unit * 2
	},
	messageIcon: {
		float:					'left'
	},
	message: {
		marginRight:			theme.spacing.unit
	},
	textField: {
		clear:					'both',
		margin:					theme.spacing.unit
	},
	inputTextField: {
		color:					theme.palette.text.secondary
	},
	cancelButton: {
		marginTop:				theme.spacing.unit * 2
	},
	signinButton: {
		marginTop:				theme.spacing.unit * 2
	},
	buttonIcon: {
		marginLeft:				theme.spacing.unit
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
		marginRight:			theme.spacing.unit,
	},
	warningIcon: {
		float:					'left',
		marginRight:			theme.spacing.unit,
		color:					theme.palette.warning.dark
	},
	informationIcon: {
		float:					'left',
		marginRight:			theme.spacing.unit,
		color:					theme.palette.information.main
	},
	primaryButton: {
		marginTop:				theme.spacing.unit * 2
	},
	cancelButton: {
		marginTop:				theme.spacing.unit * 2
	},
	buttonIcon: {
		marginLeft:				theme.spacing.unit
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
		marginTop:				theme.spacing.unit * 2
	},
	value: {
		paddingLeft:			theme.spacing.unit * 4
	},
	valueItalic: {
		fontStyle:				'italic',
		paddingLeft:			theme.spacing.unit * 4
	},
	button: {
		marginTop:				theme.spacing.unit * 2
	},
	backPageButton: {
		marginTop:				theme.spacing.unit * 2
	},
	buttonIcon: {
		marginLeft:				theme.spacing.unit
	},

	// Main page
	roleTokenButton: {
		color:					theme.palette.primary.main,
		margin:					0,
		marginLeft:				theme.spacing.unit * 3,
		paddingLeft:			theme.spacing.unit,
		paddingRight:			theme.spacing.unit,
		minWidth:				theme.spacing.unit,
		textTransform:			'none'
	},
	roleTokenButtonIcon: {
		marginRight:			theme.spacing.unit
	},

	// Manage Role Token page
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
		paddingTop:				theme.spacing.unit / 2
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
		paddingLeft:			theme.spacing.unit,
		paddingRight:			theme.spacing.unit
	},
	wordBreakTooltip: {
		whiteSpace:				'normal',
		wordBreak:				'break-all',
		zIndex:					1500,					// original(3.9.4) property value
		opacity:				0.9,					// original(3.9.4) property value
		pointerEvents:			'none'					// original(3.9.4) property value
	},
	manageAddButton: {
		margin:					0,
		paddingLeft:			theme.spacing.unit,
		paddingRight:			theme.spacing.unit,
		minWidth:				theme.spacing.unit,
		float:					'left'
	},
	manageActionButton: {
		margin:					0,
		paddingLeft:			theme.spacing.unit,
		paddingRight:			theme.spacing.unit,
		minWidth:				theme.spacing.unit,
		textTransform:			'none'
	},
	newRoleTokenPopover: {
	},
	newRoleTokenPopoverTitle: {
		marginLeft:				theme.spacing.unit * 2,
		marginTop:				theme.spacing.unit,
		marginBottom:			theme.spacing.unit,
		marginRight:			theme.spacing.unit
	},
	newRoleTokenExpireForm: {
		margin:					theme.spacing.unit
	},
	newRoleTokenExpireCheck: {
		float:					'left'
	},
	newRoleTokenExpireLabel: {
		marginLeft:				0,
		marginTop:				theme.spacing.unit,
		marginBottom:			theme.spacing.unit,
		marginRight:			theme.spacing.unit
	},
	createRoleTokenButton: {
		margin:					theme.spacing.unit
	},

	// Display role token and registration code page
	codeTypeSelect: {
		marginLeft:				theme.spacing.unit * 4,
		marginBottom:			theme.spacing.unit
	},
	codeTypeSelectInput: {
		color:					theme.palette.text.secondary
	},
	codeInputTextField: {
		color:					theme.palette.text.secondary,
		backgroundColor:		theme.palette.common.white,
		padding:				theme.spacing.unit
	},
	codeTextField: {
		paddingLeft:			theme.spacing.unit * 4,
		marginBottom:			theme.spacing.unit
	},
	copyClipboardButton: {
		float:					'right',
		color:					theme.palette.primary.main,
		textTransform:			'none'
	},
	copyClipboardIcon: {
		marginRight:			theme.spacing.unit
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
		marginTop:				theme.spacing.unit * 2
	},
	value: {
		paddingLeft:			theme.spacing.unit * 4
	},
	valueItalic: {
		fontStyle:				'italic',
		paddingLeft:			theme.spacing.unit * 4
	},
	textField: {
		width:					'100%',
		paddingLeft:			theme.spacing.unit * 4,
		paddingRight:			theme.spacing.unit * 4
	},
	inputTextField: {
		color:					theme.palette.text.secondary
	},
	cancelButton: {
		marginTop:				theme.spacing.unit * 2
	},
	okButton: {
		marginTop:				theme.spacing.unit * 2
	},
	buttonIcon: {
		marginLeft:				theme.spacing.unit
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
		marginTop:				theme.spacing.unit * 2
	},
	value: {
		paddingLeft:			theme.spacing.unit * 4
	},
	valueItalic: {
		fontStyle:				'italic',
		paddingLeft:			theme.spacing.unit * 4
	},
	textField: {
		width:					'100%',
		paddingLeft:			theme.spacing.unit * 4,
		paddingRight:			theme.spacing.unit * 4
	},
	inputTextField: {
		color:					theme.palette.text.secondary
	},
	cancelButton: {
		marginTop:				theme.spacing.unit * 2
	},
	okButton: {
		marginTop:				theme.spacing.unit * 2
	},
	buttonIcon: {
		marginLeft:				theme.spacing.unit
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
		marginTop:				theme.spacing.unit * 2
	},
	value: {
		paddingLeft:			theme.spacing.unit * 4
	},
	valueItalic: {
		fontStyle:				'italic',
		paddingLeft:			theme.spacing.unit * 4
	},
	textField: {
		width:					'100%',
		paddingLeft:			theme.spacing.unit * 4,
		paddingRight:			theme.spacing.unit * 4
	},
	inputTextField: {
		color:					theme.palette.text.secondary
	},
	cancelButton: {
		marginTop:				theme.spacing.unit * 2
	},
	okButton: {
		marginTop:				theme.spacing.unit * 2
	},
	buttonIcon: {
		marginLeft:				theme.spacing.unit
	}
});

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
