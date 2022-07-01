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

import * as Colors		from '@mui/material/colors';
import { createTheme, adaptV4Theme } from '@mui/material/styles';

/* eslint-disable indent */
// [NOTE]
// Default theme from material-ui
// https://material-ui.com/customization/default-theme/
//
const r3Theme = createTheme(adaptV4Theme({
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
	spacing:						createTheme.spacing,

	//
	// override components
	//
	// [NOTE]
	// Changed "overrides" to "components" in the migration to MUI v5.
	//
	components: {
		MuiIconButton: {
			root: {
				padding:			'8px'
			}
		},

		// [NOTE]
		// @material-ui 4.x.x removed the default value of 'display: block' in Typography.
		// Since K2HR3 is based on 'display: block', it is set in this overrides to maintain the layout.
		//
		// [NOTE][FIXME]
		// Due to the migration to MUI v5, the following Typography overrides are no longer working.
		// Instead, the display value is set in the individual Typography theme.
		//
		MuiTypography: {
			root: {
				display:			'block'
			}
		},

		// [NOTE]
		// For Avater in Chip, its style using avatarColorPrimary property.
		// But its backgroundColor is set theme.palette.primary.dark.
		// We use avatar in chip only in toolbar, and it needs white.
		//
		// [NOTE][FIXME]
		// Migrated to MUI v5 and changed "& $avatarColorPrimary" to "& .MuiChip-avatarColorPrimary".
		// However, this MuiAvatar is used in R3Toolbar->MuiChip->Avatar, but we haven't been able
		// to override this default CSS.
		// Therefore, in MuiAvatar rendering(in r3toolbar.jsx), we defined "<StyledEngineProvider injectFirst>"
		// and disabled this default CSS of MuiAvatar(Chip).
		// Also, in the r3style.jsx file, marginLeft is added to the CSS of r3Toolbar->avatar to make
		// it consistent.
		//
		MuiChip: {
			root: {
				'& .MuiChip-avatarColorPrimary': {
					backgroundColor:	Colors.common.white
				}
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
			noWrap:					true,
			display:				'block'
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
			component:				'span',
			display:				'block'
		},
		title: {
			color:					'inherit',
			variant:				'h6',
			noWrap:					true,
			display:				'block'
		},
		tenantListText: {
			color:					'textSecondary',
			variant:				'subtitle2',
			component:				'span',
			display:				'block'
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
			noWrap:					true,
			display:				'block'
		},
		chip: {
			clickable:				true,
			color:					'primary',
			'aria-label':			'current display item and its path'
		},
		chipText: {
			variant:				'subtitle2',
			component:				'span',
			display:				'block'
		},
		ownerText: {
			variant:				'subtitle2',
			component:				'span',
			color:					'secondary',
			display:				'block'
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
			color:					'error',
			display:				'block'
		},
		dialogWarningContentText: {
			component:				'span',
			display:				'block'
		},
		dialogInformationContentText: {
			component:				'span',
			display:				'block'
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
			noWrap:					true,
			display:				'block'
		},
		valueFormControl: {
		},
		valueRadioGroup: {
			'aria-label':			'select resource value type'
		},
		valueFormControlLabel: {
			variant:				'body1',
			color:					'textSecondary',
			noWrap:					true,
			display:				'block'
		},
		valueLeftFormControlLabel: {
		},
		valueRightFormControlLabel: {
		},
		valueStringTextField: {
			variant:				'standard',
			fullWidth:				true,
			multiline:				true,
			minRows:				1,
			maxRows:				10
		},
		valueObjectTextField: {
			variant:				'standard',
			fullWidth:				true,
			multiline:				false
		},
		keysKeySubTitle: {
			variant:				'body2',
			color:					'textSecondary',
			noWrap:					true,
			display:				'block'
		},
		keysValueSubTitle: {
			variant:				'body2',
			color:					'textSecondary',
			noWrap:					true,
			display:				'block'
		},
		keysKeyTextField: {
			variant:				'standard',
			multiline:				false,
			minRows:				1
		},
		keysValueTextField: {
			variant:				'standard',
			multiline:				false,
			minRows:				1
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
			variant:				'standard',
			multiline:				false,
			minRows:				1
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
			noWrap:					true,
			display:				'block'
		},
		effectSelect: {
			variant:				'standard'
		},
		actionCheckbox: {
		},
		actionLabel: {
		},
		actionFormControlLabel: {
			variant:				'body2',
			color:					'textSecondary',
			noWrap:					true,
			display:				'block'
		},
		resourceTextField: {
			variant:				'standard',
			multiline:				false,
			minRows:				1
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
			variant:				'standard',
			multiline:				false,
			minRows:				1
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
			noWrap:					true,
			display:				'block'
		},
		hostnameSubTitle: {
			variant:				'body2',
			color:					'textSecondary',
			noWrap:					true,
			display:				'block'
		},
		hostnameAUXSubTitle: {
			variant:				'body2',
			color:					'textSecondary',
			noWrap:					true,
			display:				'block'
		},
		hostnameTextField: {
			variant:				'standard',
			multiline:				false,
			minRows:				1
		},
		hostnameAUXTextField: {
			variant:				'standard',
			multiline:				false,
			minRows:				1
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
			noWrap:					true,
			display:				'block'
		},
		ipAUXSubTitle: {
			variant:				'body2',
			color:					'textSecondary',
			noWrap:					true,
			display:				'block'
		},
		ipTextField: {
			variant:				'standard',
			multiline:				false,
			minRows:				1
		},
		ipAUXTextField: {
			variant:				'standard',
			multiline:				false,
			minRows:				1
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
			variant:				'standard',
			multiline:				false,
			minRows:				1
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
			variant:				'standard',
			multiline:				false,
			minRows:				1
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
			noWrap:					true,
			display:				'block'
		},
		resourceTextField: {
			variant:				'standard',
			multiline:				false,
			minRows:				1
		},
		valueRadioGroup: {
			'aria-label':			'select type verify url or static resource'
		},
		valueFormControlLabel: {
			variant:				'body1',
			color:					'textSecondary',
			noWrap:					true,
			display:				'block'
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
			color:					'primary',
			display:				'block'
		},
		textTableContent: {
			variant:				'body1',
			component:				'span',
			color:					'textSecondary',
			display:				'block'
		},
		unknownMessage: {
			variant:				'body1',
			noWrap:					true,
			display:				'block'
		},
		tenantTextField: {
			variant:				'standard',
			multiline:				false,
			minRows:				1
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
			noWrap:					true,
			display:				'block'
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
			color:					'textSecondary',
			display:				'block'
		},
		content: {
			component:				'span',
			variant:				'body2',
			display:				'block'
		}
	},

	//
	// R3 Account Dialog
	//
	r3AccountDialog: {
		root: {
			scroll:					'body',
			fullWidth:				true,
			label:					'account-dialog',
			'aria-label':			'account dialog'
		},
		dialogTitle: {
			label:					'account-dialog'
		},
		title: {
			variant:				'h5',
			component:				'span',
			color:					'primary',
			noWrap:					true,
			display:				'block'
		},
		subTitle: {
			variant:				'subtitle2',
			color:					'primary',
			component:				'span',
			noWrap:					true,
			display:				'block'
		},
		value: {
			variant:				'body1',
			component:				'span',
			color:					'textSecondary',
			display:				'block'
		},
		unscopedtokenTextField: {
			variant:				'outlined',
			disabled:				false,
			multiline:				false,
			fullWidth:				true,
			minRows:				1,
			maxRows:				1
		},
		okButton: {
			variant:				'contained',
			color:					'secondary',
			'aria-label':			'ok'
		}
	},

	//
	// R3 Signin Credential Dialog
	//
	r3SigninCredDialog: {
		root: {
			scroll:					'body',
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
			noWrap:					true,
			display:				'block'
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
			color:					'error',
			display:				'block'
		},
		messageIcon: {
			color:					'error'
		},
		textField: {
			variant:				'standard',
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
			noWrap:					true,
			display:				'block'
		},
		dialogErrorContentText: {
			component:				'span',
			color:					'error',
			display:				'block'
		},
		dialogWarningContentText: {
			component:				'span',
			display:				'block'
		},
		dialogInformationContentText: {
			component:				'span',
			display:				'block'
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
			noWrap:					true,
			display:				'block'
		},
		keyTitle: {
			variant:				'subtitle2',
			color:					'primary',
			component:				'span',
			noWrap:					true,
			display:				'block'
		},
		value: {
			variant:				'body1',
			component:				'span',
			color:					'textSecondary',
			display:				'block'
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
			color:					'primary',
			display:				'block'
		},
		textTableContent: {
			variant:				'body1',
			component:				'span',
			color:					'textSecondary',
			display:				'block'
		},
		textNewTableContent: {
			variant:				'body1',
			component:				'span',
			color:					'textSecondary',
			display:				'block'
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
			noWrap:					true,
			display:				'block'
		},
		newRoleTokenExpireLabel: {
			variant:				'body1',
			component:				'span',
			color:					'textSecondary',
			display:				'block'
		},
		createRoleTokenButton: {
			variant:				'contained',
			color:					'secondary',
			'aria-label':			'close dialog'
		},

		// Display role token and registration code page
		roletokenTextField: {
			variant:				'outlined',
			disabled:				false,
			multiline:				false,
			fullWidth:				true,
			minRows:				1,
			maxRows:				1
		},
		roletokenClipboardButton: {
			label:					'roletoken-clipboard-button',
			'aria-label':			'copy roletoken to clipboard'
		},
		codeTypeSelect: {
			variant:				'standard',
			disabled:				false,
			autoWidth:				true
		},
		codeTextField: {
			variant:				'outlined',
			disabled:				false,
			multiline:				true,
			fullWidth:				true,
			minRows:				1,
			maxRows:				4
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
			noWrap:					true,
			display:				'block'
		},
		keyTitle: {
			variant:				'subtitle2',
			color:					'primary',
			component:				'span',
			noWrap:					true,
			display:				'block'
		},
		value: {
			variant:				'body1',
			component:				'span',
			color:					'textSecondary',
			display:				'block'
		},
		textField: {
			variant:				'standard',
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
			noWrap:					true,
			display:				'block'
		},
		keyTitle: {
			variant:				'subtitle2',
			color:					'primary',
			component:				'span',
			noWrap:					true,
			display:				'block'
		},
		value: {
			variant:				'body1',
			component:				'span',
			color:					'textSecondary',
			display:				'block'
		},
		valueRadioGroup: {
			'aria-label':			'select type verify url or static resource'
		},
		valueFormControlLabel: {
			variant:				'body1',
			color:					'textSecondary',
			noWrap:					true,
			display:				'block'
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
			color:					'primary',
			display:				'block'
		},
		textTableContent: {
			variant:				'body1',
			component:				'span',
			color:					'textSecondary',
			display:				'block'
		},
		textField: {
			variant:				'standard',
			disabled:				false,
			multiline:				false,
			minRows:				1
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
			noWrap:					true,
			display:				'block'
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
			noWrap:					true,
			display:				'block'
		},
		staticResMessage: {
			variant:				'body1',
			noWrap:					true,
			display:				'block'
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
			noWrap:					true,
			display:				'block'
		},
		keyTitle: {
			variant:				'subtitle2',
			color:					'primary',
			component:				'span',
			noWrap:					true,
			display:				'block'
		},
		value: {
			variant:				'body1',
			component:				'span',
			color:					'textSecondary',
			display:				'block'
		},
		textField: {
			variant:				'standard',
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
}));
/* eslint-enable indent */

export default r3Theme;

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
