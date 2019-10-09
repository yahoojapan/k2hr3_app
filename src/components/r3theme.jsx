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
 * CREATE:   Tue Aug 15 2017
 * REVISION:
 *
 */

import * as Colors		from '@material-ui/core/colors';
import createSpacing	from '@material-ui/core/styles/createSpacing';
import createMuiTheme	from '@material-ui/core/styles/createMuiTheme';

/* eslint-disable indent */
// [NOTE]
// Default theme from material-ui
// https://material-ui.com/customization/default-theme/
//
const r3Theme = createMuiTheme({
	//
	// palette
	//
	palette: {
		// [NOTE]
		// You can set palette which is made by https://material-ui.com/style/color/#color-tool
		// (or https://material.io/tools/color/ )
		// And you do not set contrastText which is is calculated automatically.
		//
		primary: {
			light:					Colors.deepPurple[100],
			main:					Colors.deepPurple[500],
			dark:					Colors.deepPurple[900],
			// linear gradient from deepPurple[500] to deepPurple[900]
			mainGradient:			`linear-gradient(#673ab7, #311b92)`	// eslint-disable-line quotes
		},
		secondary: {
			light:					Colors.deepOrange[100],
			main:					Colors.deepOrange[500],
			dark:					Colors.deepOrange[900]
		},
		error: {
			light:					Colors.red[100],
			main:					Colors.red[500],
			dark:					Colors.red[900]
		},
		background: {
			paper:					Colors.deepPurple[50]
		},

		// custom palette
		warning: {
			light:					Colors.yellow[600],
			main:					Colors.yellow[800],
			dark:					Colors.yellow[900],
			contrastText:			Colors.common.white
		},
		information: {
			light:					'rgba(0, 0, 0, 0.87)',				// same as default's pallete.text.primary
			main:					'rgba(0, 0, 0, 0.54)',				// same as default's pallete.text.secondary
			dark:					'rgba(0, 0, 0, 0.38)',				// same as default's pallete.text.disabled
			contrastText:			Colors.common.white
		}
	},

	//
	// typography
	//
	typography: {
		// [NOTE]
		// material-ui 4.x.x said "12px is recommended as the default font size for Japanese."
		//
		fontSize:					12,

		// [NOTE]
		// Force subtitle1 to be in bold
		// The value was taken from the default value of subtitle1
		// 
		subtitle2: {
			fontSize:				'1rem',
			lineHeight:				1.75,
			letterSpacing:			'0.00938em'
		}
	},

	//
	// Common material-ui
	//
	spacing:						createSpacing(),

	//
	// override components
	//
	overrides: {
		MuiIconButton: {
			root: {
				padding:			'8px'
			}
		},

		// [NOTE]
		// @material-ui 4.x.x removed the default value of 'display: block' in Typography.
		// Since K2HR3 is based on 'display: block', it is set in this overrides to maintain the layout.
		//
		MuiTypography: {
			root: {
				display:			'block'
			}
		}
	},

	//
	// R3Container
	//
	r3Container: {
		root: {
		}
	},

	//
	// R3AppBar
	//
	r3AppBar: {
		root: {
			position:				'static'
		},
		toolbar: {
		},
		smallToolbar: {
			variant:				'dense'
		},
		title: {
			color:					'inherit',
			variant:				'h6',
			noWrap:					true
		},
		mainMenuButton: {
			color:					'inherit',
			label:					'main-menu',
			'aria-label':			'main menu',
			'aria-haspopup':		'true'
		},
		mainMenu: {
			anchorOrigin: {
				vertical:			'bottom',
				horizontal:			'left'
			},
			transformOrigin: {
				vertical:			'top',
				horizontal:			'left'
			}
		},
		licenseMenu: {
			anchorOrigin: {
				vertical:			'top',
				horizontal:			'right'
			},
			transformOrigin: {
				vertical:			'top',
				horizontal:			'left'
			}
		},
		signinButton: {
			color:					'inherit',
			label:					'signin-menu',
			'aria-label':			'signin menu',
			'aria-haspopup':		'true'
		},
		signoutButton: {
			label:					'signout-menu',
			'aria-label':			'signout menu',
			'aria-haspopup':		'true'
		},
		accountMenu: {
			anchorOrigin: {
				vertical:			'bottom',
				horizontal:			'right'
			},
			transformOrigin: {
				vertical:			'top',
				horizontal:			'right'
			}
		},
		signinedMenu: {
		}
	},

	//
	// R3MainTree
	//
	r3MainTree: {
		root: {
		},
		dummyBarAppbar: {
			position:				'static'
		},
		dummyBarToolbar: {
		},
		smallDummyBarToolbar: {
			variant:				'dense'
		},
		subheaderAppbar: {
			position:				'static',
			elevation:				0
		},
		subheaderToolbar: {
		},
		smallSubheaderToolbar: {
			variant:				'dense'
		},
		dummyBarMainMenuButton: {
			color:					'inherit',
			label:					'main-menu',
			'aria-label':			'main menu',
			'aria-haspopup':		'true'
		},
		dummyBarMainMenu: {
			anchorOrigin: {
				vertical:			'bottom',
				horizontal:			'left'
			},
			transformOrigin: {
				vertical:			'top',
				horizontal:			'left'
			}
		},
		chip: {
			clickable:				false,
			color:					'primary'
		},
		chipText: {
			variant:				'subtitle2',
			component:				'span'
		},
		title: {
			color:					'inherit',
			variant:				'h6',
			noWrap:					true
		},
		tenantListText: {
			color:					'textSecondary',
			variant:				'subtitle2',
			component:				'span'
		},
		tenantListButton: {
			label:					'select-tenant',
			'aria-label':			'select tenant'
		},
		tenantListMenu: {
			anchorOrigin: {
				horizontal:			'left',
				vertical:			'bottom'
			},
			transformOrigin: {
				horizontal:			'left',
				vertical:			'top'
			}
		},
		licenseMenu: {
			anchorOrigin: {
				vertical:			'top',
				horizontal:			'right'
			},
			transformOrigin: {
				vertical:			'top',
				horizontal:			'left'
			}
		},
		collapse: {
			timeout:				'auto'
		},
		list: {
			component:				'div',
			disablePadding:			true
		},
		listItem: {
			button:					true
		},
		topItemText: {
			primaryTypographyProps: {
				variant:			'subtitle2',
				color:				'textSecondary'
			}
		},
		topSelectedItemText: {
			primaryTypographyProps: {
				variant:			'subtitle2',
				color:				'secondary'
			}
		},
		childItemText: {
			primaryTypographyProps: {
				variant:			'subtitle1',
				color:				'textSecondary'
			}
		},
		childSelectedItemText: {
			primaryTypographyProps: {
				variant:			'subtitle1',
				color:				'secondary'
			}
		},
		editIcon: {
			color:					'secondary'
		}
	},

	//
	// R3Toolbar
	//
	r3Toolbar: {
		root: {
			position:				'static',
			elevation:				0
		},
		toolbar: {
		},
		smallToolbar: {
			variant:				'dense'
		},
		title: {
			color:					'textSecondary',
			variant:				'subtitle2',
			component:				'span',
			noWrap:					true
		},
		chip: {
			clickable:				true,
			color:					'primary',
			'aria-label':			'current display item and its path'
		},
		chipText: {
			variant:				'subtitle2',
			component:				'span'
		},
		ownerText: {
			variant:				'subtitle2',
			component:				'span',
			color:					'secondary'
		},
		toUpperPathButton: {
			color:					'inherit',
			label:					'move-to-upper-path',
			'aria-label':			'move to upper path'
		},
		createPathButton: {
			color:					'inherit',
			label:					'create-path',
			'aria-label':			'create path or service'
		},
		deletePathButton: {
			color:					'inherit',
			label:					'delete-path',
			'aria-label':			'delete path or service'
		}
	},

	//
	// R3 Message Box
	//
	r3MsgBox: {
		root: {
			elevation:				2
		},
		dialogErrorContentText: {
			component:				'span',
			color:					'error'
		},
		dialogWarningContentText: {
			component:				'span'
		},
		dialogInformationContentText: {
			component:				'span'
		},
		errorIcon: {
			color:					'error'
		},
		warningIcon: {
		},
		informationIcon: {
		}
	},

	//
	// R3 Resource Page
	//
	r3Resource: {
		root: {
		},
		subTitle: {
			variant:				'subtitle2',
			color:					'primary',
			noWrap:					true
		},
		valueFormControl: {
		},
		valueRadioGroup: {
			'aria-label':			'select resource value type'
		},
		valueFormControlLabel: {
			variant:				'body1',
			color:					'textSecondary',
			noWrap:					true
		},
		valueLeftFormControlLabel: {
		},
		valueRightFormControlLabel: {
		},
		valueStringTextField: {
			fullWidth:				true,
			multiline:				true,
			rows:					1,
			rowsMax:				10
		},
		valueObjectTextField: {
			fullWidth:				true,
			multiline:				false
		},
		keysKeySubTitle: {
			variant:				'body2',
			color:					'textSecondary',
			noWrap:					true
		},
		keysValueSubTitle: {
			variant:				'body2',
			color:					'textSecondary',
			noWrap:					true
		},
		keysKeyTextField: {
			multiline:				false,
			rows:					1
		},
		keysValueTextField: {
			multiline:				false,
			rows:					1
		},
		deleteKeysButton: {
			label:					'delete-keys',
			'aria-label':			'delete key and value'
		},
		addKeysButton: {
			label:					'add-keys',
			'aria-label':			'add key and value'
		},
		aliasTextField: {
			multiline:				false,
			rows:					1
		},
		downAliasButton: {
			label:					'move-down-alias',
			'aria-label':			'move to down position in list'
		},
		upAliasButton: {
			label:					'move-up-alias',
			'aria-label':			'move to up position in list'
		},
		addAliasButton: {
			label:					'add-alias',
			'aria-label':			'add alias'
		},
		deleteAliasButton: {
			label:					'delete-alias',
			'aria-label':			'delete alias'
		}
	},

	//
	// R3 Policy Page
	//
	r3Policy: {
		root: {
		},
		subTitle: {
			variant:				'subtitle2',
			color:					'primary',
			noWrap:					true
		},
		effectSelect: {
		},
		actionCheckbox: {
		},
		actionLabel: {
		},
		actionFormControlLabel: {
			variant:				'body2',
			color:					'textSecondary',
			noWrap:					true
		},
		resourceTextField: {
			multiline:				false,
			rows:					1
		},
		addResourceButton: {
			label:					'add-resource',
			'aria-label':			'add resource'
		},
		deleteResourceButton: {
			label:					'delete-resource',
			'aria-label':			'delete resource'
		},
		aliasTextField: {
			multiline:				false,
			rows:					1
		},
		downAliasButton: {
			label:					'move-down-alias',
			'aria-label':			'move to down position in list'
		},
		upAliasButton: {
			label:					'move-up-alias',
			'aria-label':			'move to up position in list'
		},
		addAliasButton: {
			label:					'add-alias',
			'aria-label':			'add alias'
		},
		deleteAliasButton: {
			label:					'delete-alias',
			'aria-label':			'delete alias'
		}
	},

	//
	// R3 Role Page
	//
	r3Role: {
		root: {
		},
		subTitle: {
			variant:				'subtitle2',
			color:					'primary',
			noWrap:					true
		},
		hostnameSubTitle: {
			variant:				'body2',
			color:					'textSecondary',
			noWrap:					true
		},
		hostnameAUXSubTitle: {
			variant:				'body2',
			color:					'textSecondary',
			noWrap:					true
		},
		hostnameTextField: {
			multiline:				false,
			rows:					1
		},
		hostnameAUXTextField: {
			multiline:				false,
			rows:					1
		},
		deleteHostnameButton: {
			label:					'delete-hostname',
			'aria-label':			'delete hostname information'
		},
		addHostnameButton: {
			label:					'add-hostname',
			'aria-label':			'add hostname and AUX'
		},
		ipSubTitle: {
			variant:				'body2',
			color:					'textSecondary',
			noWrap:					true
		},
		ipAUXSubTitle: {
			variant:				'body2',
			color:					'textSecondary',
			noWrap:					true
		},
		ipTextField: {
			multiline:				false,
			rows:					1
		},
		ipAUXTextField: {
			multiline:				false,
			rows:					1
		},
		deleteIpButton: {
			label:					'delete-ip',
			'aria-label':			'delete ip information'
		},
		addIpButton: {
			label:					'add-ip',
			'aria-label':			'add ip and AUX'
		},
		policyTextField: {
			multiline:				false,
			rows:					1
		},
		addPolicyButton: {
			label:					'add-policy',
			'aria-label':			'add policy'
		},
		deletePolicyButton: {
			label:					'delete-policy',
			'aria-label':			'delete policy'
		},

		aliasTextField: {
			multiline:				false,
			rows:					1
		},
		downAliasButton: {
			label:					'move-down-alias',
			'aria-label':			'move to down position in list'
		},
		upAliasButton: {
			label:					'move-up-alias',
			'aria-label':			'move to up position in list'
		},
		addAliasButton: {
			label:					'add-alias',
			'aria-label':			'add alias'
		},
		deleteAliasButton: {
			label:					'delete-alias',
			'aria-label':			'delete alias'
		}
	},

	//
	// R3 Service Page
	//
	r3Service: {
		root: {
		},
		subTitle: {
			variant:				'subtitle2',
			color:					'primary',
			noWrap:					true
		},
		resourceTextField: {
			multiline:				false,
			rows:					1
		},
		valueRadioGroup: {
			'aria-label':			'select type verify url or static resource'
		},
		valueFormControlLabel: {
			variant:				'body1',
			color:					'textSecondary',
			noWrap:					true
		},
		valueLeftFormControlLabel: {
		},
		valueRightFormControlLabel: {
		},
		table: {
		},
		textTableHead: {
			variant:				'subtitle2',
			component:				'span',
			color:					'primary'
		},
		textTableContent: {
			variant:				'body1',
			component:				'span',
			color:					'textSecondary'
		},
		unknownMessage: {
			variant:				'body1',
			noWrap:					true
		},
		tenantTextField: {
			multiline:				false,
			rows:					1
		},
		addResStaticObjButton: {
			label:					'add-static-resource',
			'aria-label':			'add static resource'
		},
		editResStaticObjButton: {
			label:					'edit-static-resource',
			'aria-label':			'edit static resource'
		},
		delResStaticObjButton: {
			label:					'del-static-resource',
			'aria-label':			'delete static resource'
		},
		addTenantButton: {
			label:					'add-tenant',
			'aria-label':			'add tenant'
		},
		deleteTenantButton: {
			label:					'delete-tenant',
			'aria-label':			'delete tenant'
		}
	},

	//
	// R3 Form Button
	//
	r3FormButtons: {
		root: {
		},
		saveButton: {
			variant:				'contained',
			color:					'secondary',
			'aria-label':			'save'
		},
		cancelButton: {
			variant:				'contained',
			color:					'primary',
			'aria-label':			'cancel'
		}
	},

	//
	// R3 Progress
	//
	r3progress: {
		root: {
			elevation:				0
		},
		circularProgress: {
			thickness:				7,
			color:					'secondary'
		}
	},

	//
	// R3 About Dialog
	//
	r3AboutDialog: {
		root: {
			scroll:					'body',
			disableBackdropClick:	true,
			fullWidth:				true,
			label:					'about-dialog',
			'aria-label':			'about dialog'
		},
		dialogTitle: {
			label:					'about-dialog'
		},
		title: {
			variant:				'h5',
			component:				'span',
			color:					'primary',
			noWrap:					true
		},
		dialogContentText: {
			component:				'span'
		},
		button: {
			variant:				'contained',
			color:					'secondary',
			'aria-label':			'close about dialog'
		},
		licenseType: {
			variant:				'h6',
			component:				'span',
			color:					'textSecondary'
		},
		content: {
			component:				'span',
			variant:				'body2'
		}
	},

	//
	// R3 Signin Credential Dialog
	//
	r3SigninCredDialog: {
		root: {
			scroll:					'body',
			disableBackdropClick:	true,
			fullWidth:				true,
			label:					'signin-dialog',
			'aria-label':			'signin credential dialog'
		},
		dialogTitle: {
			label:					'signin-dialog'
		},
		title: {
			variant:				'h5',
			component:				'span',
			color:					'primary',
			noWrap:					true
		},
		dialogContentText: {
			component:				'span'
		},
		messagePaper: {
			square:					false,
			elevation:				1
		},
		message: {
			variant:				'body1',
			color:					'error'
		},
		messageIcon: {
			color:					'error'
		},
		textField: {
			margin:					'normal',
			fullWidth:				true
		},
		inputAdornment: {
			position:				'end'
		},
		passphraseIconButton: {
			color:					'secondary',
			'aria-label':			'toggle passphrase visibility'
		},
		signinButton: {
			variant:				'contained',
			color:					'secondary',
			'aria-label':			'sign in'
		},
		cancelButton: {
			variant:				'contained',
			color:					'primary',
			'aria-label':			'cancel'
		}
	},

	//
	// R3 Popup Message Dialog
	//
	r3PopupMsgDialog: {
		root: {
			scroll:					'body',
			disableBackdropClick:	true,
			fullWidth:				true,
			label:					'message-dialog',
			'aria-label':			'message dialog'
		},
		dialogTitle: {
			label:					'message-dialog'
		},
		title: {
			variant:				'h5',
			component:				'span',
			color:					'primary',
			noWrap:					true
		},
		dialogErrorContentText: {
			component:				'span',
			color:					'error'
		},
		dialogWarningContentText: {
			component:				'span'
		},
		dialogInformationContentText: {
			component:				'span'
		},
		errorIcon: {
			color:					'error'
		},
		warningIcon: {
		},
		informationIcon: {
		},
		primaryButton: {
			variant:				'contained',
			color:					'secondary',
			'aria-label':			'confirm contents and close dialog'
		},
		cancelButton: {
			variant:				'contained',
			color:					'primary',
			'aria-label':			'cancel'
		}
	},

	//
	// R3 Path Information Dialog
	//
	r3PathInfoDialog: {
		root: {
			scroll:					'body',
			disableBackdropClick:	true,
			fullWidth:				true,
			label:					'path-information-dialog',
			'aria-label':			'path information dialog'
		},
		dialogTitle: {
			label:					'path-information-dialog'
		},
		title: {
			variant:				'h5',
			component:				'span',
			color:					'primary',
			noWrap:					true
		},
		keyTitle: {
			variant:				'subtitle2',
			color:					'primary',
			component:				'span',
			noWrap:					true
		},
		value: {
			variant:				'body1',
			component:				'span',
			color:					'textSecondary'
		},
		button: {
			variant:				'contained',
			color:					'secondary',
			'aria-label':			'close dialog'
		},
		previousButton: {
			variant:				'contained',
			color:					'primary',
			'aria-label':			'back to previous page'
		},

		// Main page
		manageRoleTokenButton: {
			'aria-label':			'manage role tokens'
		},
		dispCodeNewRoleTokenButton: {
			'aria-label':			'create a new role token and display the registration code'
		},

		// Manage Role Token page
		table: {
		},
		textTableHead: {
			variant:				'subtitle2',
			component:				'span',
			color:					'primary'
		},
		textTableContent: {
			variant:				'body1',
			component:				'span',
			color:					'textSecondary'
		},
		manageAddButton: {
			color:					'primary',
			'aria-label':			'generate new role token'
		},
		manageDeleteButton: {
			color:					'primary',
			'aria-label':			'delete role token'
		},
		manageDispCodeButton: {
			color:					'primary',
			'aria-label':			'display the registration code with this role token'
		},
		newRoleTokenPopover: {
			anchorOrigin: {
				vertical:			'bottom',
				horizontal:			'left',
			},
			transformOrigin: {
				vertical:			'top',
				horizontal:			'left',
			}
		},
		newRoleTokenPopoverTitle: {
			variant:				'subtitle2',
			component:				'span',
			color:					'primary',
			noWrap:					true
		},
		newRoleTokenExpireLabel: {
			variant:				'body1',
			component:				'span',
			color:					'textSecondary'
		},
		createRoleTokenButton: {
			variant:				'contained',
			color:					'secondary',
			'aria-label':			'close dialog'
		},

		// Display role token and registration code page
		codetypeSelect: {
			disabled:				false,
			autoWidth:				true
		},
		codeTextField: {
			variant:				'outlined',
			disabled:				false,
			multiline:				true,
			fullWidth:				true,
			rows:					1,
			rowsMax:				4
		},
		copyClipboardButton: {
			label:					'copy-clipboard-button',
			'aria-label':			'copy to clipboard'
		}
	},

	//
	// R3 Create Path Dialog
	//
	r3CreatePathDialog: {
		root: {
			scroll:					'body',
			disableBackdropClick:	true,
			fullWidth:				true,
			label:					'create-path-dialog',
			'aria-label':			'create path dialog'
		},
		dialogTitle: {
			label:					'create-path-dialog'
		},
		title: {
			variant:				'h5',
			component:				'span',
			color:					'primary',
			noWrap:					true
		},
		keyTitle: {
			variant:				'subtitle2',
			color:					'primary',
			component:				'span',
			noWrap:					true
		},
		value: {
			variant:				'body1',
			component:				'span',
			color:					'textSecondary'
		},
		textField: {
			disabled:				false,
			inputProps: {
				'aria-label':		'input create path',
			}
		},
		cancelButton: {
			variant:				'contained',
			color:					'primary',
			'aria-label':			'cancel'
		},
		okButton: {
			variant:				'contained',
			color:					'secondary',
			'aria-label':			'ok'
		}
	},

	//
	// R3 Create Service Dialog
	//
	r3CreateServiceDialog: {
		root: {
			scroll:					'body',
			disableBackdropClick:	true,
			fullWidth:				true,
			label:					'create-service-dialog',
			'aria-label':			'create service dialog'
		},
		dialogTitle: {
			label:					'create-service-dialog'
		},
		title: {
			variant:				'h5',
			component:				'span',
			color:					'primary',
			noWrap:					true
		},
		keyTitle: {
			variant:				'subtitle2',
			color:					'primary',
			component:				'span',
			noWrap:					true
		},
		value: {
			variant:				'body1',
			component:				'span',
			color:					'textSecondary'
		},
		valueRadioGroup: {
			'aria-label':			'select type verify url or static resource'
		},
		valueFormControlLabel: {
			variant:				'body1',
			color:					'textSecondary',
			noWrap:					true
		},
		valueLeftFormControlLabel: {
		},
		valueRightFormControlLabel: {
		},
		table: {
		},
		textTableHead: {
			variant:				'subtitle2',
			component:				'span',
			color:					'primary'
		},
		textTableContent: {
			variant:				'body1',
			component:				'span',
			color:					'textSecondary'
		},
		textField: {
			disabled:				false,
			multiline:				false,
			rows:					1
		},
		addResStaticObjButton: {
			color:					'primary',
			label:					'add-static-resource',
			'aria-label':			'add static resource'
		},
		editResStaticObjButton: {
			color:					'primary',
			label:					'edit-static-resource',
			'aria-label':			'edit static resource'
		},
		delResStaticObjButton: {
			color:					'primary',
			label:					'del-static-resource',
			'aria-label':			'delete static resource'
		},

		// Popover for editing key in static resource
		staticResKeyPopover: {
			anchorOrigin: {
				vertical:			'bottom',
				horizontal:			'left',
			},
			transformOrigin: {
				vertical:			'top',
				horizontal:			'left',
			}
		},
		staticResKeyPopoverTitle: {
			variant:				'subtitle2',
			component:				'span',
			color:					'primary',
			noWrap:					true
		},
		staticResKeyPopoverButton: {
			variant:				'contained',
			color:					'secondary',
			'aria-label':			'close dialog'
		},
		staticResKeyPopoverSubtitle: {
			variant:				'body1',
			component:				'span',
			color:					'primary',
			noWrap:					true
		},
		staticResMessage: {
			variant:				'body1',
			noWrap:					true
		},
		cancelButton: {
			variant:				'contained',
			color:					'primary',
			'aria-label':			'cancel'
		},
		okButton: {
			variant:				'contained',
			color:					'secondary',
			'aria-label':			'ok'
		}
	},

	//
	// R3 Create Service Tenant Dialog
	//
	r3CreateServiceTenantDialog: {
		root: {
			scroll:					'body',
			disableBackdropClick:	true,
			fullWidth:				true,
			label:					'create-service-tenant-dialog',
			'aria-label':			'create service attached tenant dialog'
		},
		dialogTitle: {
			label:					'create-service-tenant-dialog'
		},
		title: {
			variant:				'h5',
			component:				'span',
			color:					'primary',
			noWrap:					true
		},
		keyTitle: {
			variant:				'subtitle2',
			color:					'primary',
			component:				'span',
			noWrap:					true
		},
		value: {
			variant:				'body1',
			component:				'span',
			color:					'textSecondary'
		},
		textField: {
			disabled:				false
		},
		cancelButton: {
			variant:				'contained',
			color:					'primary',
			'aria-label':			'cancel'
		},
		okButton: {
			variant:				'contained',
			color:					'secondary',
			'aria-label':			'ok'
		}
	}
});
/* eslint-enable indent */

export default r3Theme;

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
