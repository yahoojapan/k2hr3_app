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

import * as Colors		from 'material-ui/styles/colors';
import { fade }			from 'material-ui/utils/colorManipulator';
import Spacing			from 'material-ui/styles/spacing';

// For IconFont
import styleIconFont	from '../../public/css/styleiconfont.css';

// Utility
import { r3ObjMerge }	from '../util/r3util';

//
// Customize theme from material-ui/lightBaseTheme
// https://github.com/callemall/material-ui/blob/master/src/styles/baseThemes/lightBaseTheme.js
//

const r3CommonFontFamily	=	'Roboto, sans-serif';
const r3CommonLargeSize		=	'20px';
const r3CommonMiddleSize	=	'14px';
const r3CommonSmallSize		=	'14px';

const r3CommonFontMiddle	= {
	fontSize:					r3CommonMiddleSize,
	fontFamily:					r3CommonFontFamily
};

const r3CommonFontSmall		= {
	fontSize:					r3CommonSmallSize,
	fontFamily:					r3CommonFontFamily
};

const r3CommonFontLarge		= {
	fontSize:					r3CommonLargeSize,
	fontFamily:					r3CommonFontFamily
};

const r3CommonPalette		= {
	primary1Color:				Colors.deepPurple500,
	primary2Color:				Colors.deepPurpleA100,					// for toolbar
	primary3Color:				Colors.deepPurple50,					// for toolbar
	accent1Color:				Colors.deepOrange500,					// for RaisedButton
	accent2Color:				Colors.blueGrey500,						// for RaisedButton
	accent3Color:				Colors.deepPurple100,					// for RaisedButton
	textColor:					Colors.grey900,							// original: darkBlack
	secondaryTextColor:			fade(Colors.darkBlack, 0.54),
	alternateTextColor:			Colors.white,
	canvasColor:				Colors.deepPurple50,					// ex. Paper background
	borderColor:				Colors.deepPurple300,					// ex. Divider in menu
	disabledColor:				fade(Colors.darkBlack, 0.3),
	shadowColor:				Colors.deepPurple900,					// for Paper shadow
	errorColor:					Colors.pink800,							// for error
	warningColor:				Colors.yellow800,						// for warning
	informationColor:			Colors.indigo800,						// for information
	white:						Colors.white
};

const r3CommonInfoIconFont	= {
	marginRight:				12,
	padding:					0,
	float:						'left'
};

const r3CommonContents = {
	textLabelStyle:				r3ObjMerge(r3CommonFontMiddle, {
		fontWeight:				'bold'
	}),
	oneButtonTextFieldSize:		r3ObjMerge(r3CommonFontMiddle, {
		width:					'calc(100% - 60px)'						// 48px + some
	}),
	oneButtonTwoTextFieldSize:	r3ObjMerge(r3CommonFontMiddle, {
		width:					'calc(50% - 42px)'						// 48px / 2 + 12px + some
	}),
	threeButtonTextFieldSize:	r3ObjMerge(r3CommonFontMiddle, {
		width:					'calc(100% - 180px)'					// 48px * 3 + some
	})
};

export default {
	// Common material-ui
	spacing:					Spacing,
	fontFamily:					r3CommonFontFamily,
	palette:					r3CommonPalette,

	// For font
	r3FontMiddle:				r3CommonFontMiddle,

	// For appbar
	r3AppBar: {
		loginIconButtonColor: {
			color:				r3CommonPalette.white
		},
		logoutIconButtonColor: {
			color:				r3CommonPalette.accent2Color
		},
		menuIconButtonColor: {
			color:				r3CommonPalette.white
		},
		userNameMenuItem: {
			fontWeight:			'bold'
		},
		userNameDivider: {
			backgroundColor:	r3CommonPalette.accent2Color
		},
		iconButtonStyle: {
			padding:			0
		},
		iconLeftMenuTarget: {
			horizontal:			'left',
			vertical:			'bottom'
		},
		iconLeftMenuAnchor: {
			horizontal:			'left',
			vertical:			'top'
		},
		iconRightMenuTarget: {
			horizontal:			'right',
			vertical:			'bottom'
		},
		iconRightMenuAnchor: {
			horizontal:			'right',
			vertical:			'top'
		}
	},

	// For TreeList
	r3MainTree: {
		//
		// Dummy AppBar styles in Popup(in Drawer) menu
		//
		treeDummyBarStyle: {
			float:				'left'
		},
		textSubHeaderDummyBarStyle: {
			backgroundColor:	r3CommonPalette.primary1Color,
			color:				r3CommonPalette.white,
			marginTop:			0,
			paddingLeft:		'8px',
			lineHeight:			'60px'
		},
		textTitleDummyBarStyle:	r3ObjMerge(r3CommonFontLarge, {
			backgroundColor:	r3CommonPalette.primary1Color,
			color:				r3CommonPalette.white,
			paddingLeft:		'8px'
		}),
		iconButtonDummyBarStyle: {
			padding:			'12px',
			verticalAlign:		'middle'
		},
		iconDummyBarStyle: {
			color:				r3CommonPalette.white
		},
		iconMenuDummyBarTarget: {
			horizontal:			'left',
			vertical:			'bottom'
		},
		iconMenuDummyBarAnchor: {
			horizontal:			'left',
			vertical:			'top'
		},
		drawerWidth:			'100%',
		drawerContainerStyle: {
			overflowX:			'hidden',
			width:				'auto'
		},

		//
		// Main Tree styles
		//
		treeLististStyle: {
			padding:			0
		},
		treeStyle: {
			float:				'left'
		},
		textSubHeaderStyle:		r3ObjMerge(r3CommonFontMiddle, {
			backgroundColor:	r3CommonPalette.primary2Color,
			color:				r3CommonPalette.primary3Color,
			paddingTop:			'4px',
			paddingBottom:		'4px',
			verticalAlign:		'middle'
		}),

		shButtomStyle:	{
			marginTop:			'-3px',
			paddingLeft:		'4px',
			height:				'48px',
			textAlign:			'left'
		},
		shButtomLavelStyle:		r3ObjMerge(r3CommonFontMiddle, {
			color:				r3CommonPalette.primary1Color,
			fontWeight:			'bold',
			verticalAlign:		'middle',
			paddingLeft:		'32px'
		}),
		textLabelInSHStyle: {
			marginRight:		'12px'
		},
		textTitleLabelInSHStyle: {
			fontWeight:			'bold'
		},
		textServiceOwnerLabelStyle: {
			verticalAlign:		'text-top',
			paddingRight:		'8px'
		},
		topListItem: {
			color:				r3CommonPalette.primary1Color,
			fontSize:			r3CommonFontMiddle,
			fontWeight:			'bold'
		},
		topSelectedListItem: {
			color:				r3CommonPalette.accent1Color,
			fontSize:			r3CommonFontMiddle,
			fontWeight:			'bold'
		},
		selectedColor: {
			color:				r3CommonPalette.accent1Color
		},
		noStyle: {
			color:				r3CommonPalette.primary1Color
		},
		iconMenuStyle: {
			float:				'right'
		},
		iconButtonStyle: {
			padding:			0,
		},
		iconRightButtonStyle: {
			color:				r3CommonPalette.primary3Color
		},
		iconMenuTarget: {
			horizontal:			'left',
			vertical:			'bottom'
		},
		iconMenuAnchor: {
			horizontal:			'left',
			vertical:			'top'
		},
	},

	enhancedButton: {
		backgroundColor: r3CommonPalette.primary2Color, textColor: r3CommonPalette.white
	},

	// For toolbar
	r3Toolbar: {
		toolbar: {
			backgroundColor:	r3CommonPalette.primary2Color,
			paddingLeft:		0,
			paddingRight:		0
		},
		toolbarGrp: {
			marginLeft:			0,
			marginRight:		0
		},
		toolbarTitleStyle:		r3ObjMerge(r3CommonFontMiddle, {
			paddingLeft:		0,
			paddingRight:		0,
			color:				r3CommonPalette.primary3Color,
			fontWeight:			'bold',
			wordBreak:			'break-all',
			whiteSpace:			'normal',
			maxHeight:			'-webkit-fill-available'
		}),
		chipStyle: {
			marginLeft:			'4px',
			marginRight:		'12px'
		},
		chipLabelStyle:			r3ObjMerge(r3CommonFontMiddle, {
			fontWeight:			'bold',
			verticalAlign:		'middle'
		}),
		iconButtonStyle: {
			padding:			0
		},
		iconButtonColor: {
			color:				r3CommonPalette.primary3Color
		}
	},

	// Dialog
	dialogSimple: {
		keyTitleStyle: 		r3ObjMerge(r3CommonFontMiddle, {
			color:			r3CommonPalette.primary1Color
		}),
		keyLeftTitleStyle: 	r3ObjMerge(r3CommonFontMiddle, {
			color:			r3CommonPalette.primary1Color,
			float:			'left',
			paddingTop:		'12px',
			paddingBottom:	'12px'
		}),
		valueStyle: {
			paddingLeft:	'48px',
			color:			r3CommonPalette.primary2Color
		},
		TextFieldStyle: {
			paddingLeft:	'48px',
			width:			'calc(100% - 96px)'
		},
		HiddenTextFieldStyle: {
			paddingLeft:	'48px',
			width:			'1px',
			height:			'1px'
		},
		HiddenTextareaStyle: {
			color:			r3CommonPalette.primary2Color,
			whiteSpace:		'nowrap',
			height:			'1px'
		},
		centerTitleStyle: r3ObjMerge(r3CommonFontLarge, {
			color:			r3CommonPalette.primary1Color,
			textAlign:		'center',
			paddingRight:	'48px',
			paddingLeft:	'48px'
		}),
		centerContextStyle:	r3ObjMerge(r3CommonFontMiddle, {
			color:			r3CommonPalette.primary1Color,
			textAlign:		'center',
			paddingRight:	'48px',
			paddingLeft:	'48px'
		}),
		licensesTextStyle:	r3ObjMerge(r3CommonFontSmall, {
			color:			r3CommonPalette.textColor,
			textAlign:		'left',
			paddingRight:	'48px',
			paddingLeft:	'48px'
		}),
		licensesTypeStyle:	r3ObjMerge(r3CommonFontSmall, {
			color:			r3CommonPalette.textColor,
			textAlign:		'left',
			fontWeight:		'bold'
		}),
		scrollDevStyle:		{
			maxHeight:		'inherit',
			overflowY:		'auto'
		},
		iconButtonStyle: {
			padding:		0
		}
	},

	// For Message Box
	r3MsgBox: {
		errIconFontStyle:	r3ObjMerge(r3CommonInfoIconFont, {
			color:			r3CommonPalette.errorColor,
			float:			'left'
		}),
		warnIconFontStyle:	r3ObjMerge(r3CommonInfoIconFont, {
			color:			r3CommonPalette.warningColor,
			float:			'left'
		}),
		infoIconFontStyle:	r3ObjMerge(r3CommonInfoIconFont, {
			color:			r3CommonPalette.informationColor,
			float:			'left'
		}),
		errTextStyle:		r3ObjMerge(r3CommonFontMiddle, {
			color:			r3CommonPalette.errorColor,
			display:		'inline-block',
			width:			'calc(100% - 40px)'					// 36px + some
		}),
		warnTextStyle:		r3ObjMerge(r3CommonFontMiddle, {
			color:			r3CommonPalette.warningColor,
			display:		'inline-block',
			width:			'calc(100% - 40px)'					// 36px + some
		}),
		infoTextStyle:		r3ObjMerge(r3CommonFontMiddle, {
			color:			r3CommonPalette.informationColor,
			display:		'inline-block',
			width:			'calc(100% - 40px)'					// 36px + some
		})
	},

	// For Paper
	r3Paper: {
		paperStyle: {
			margin:				'6px',
			display:			'flex',
			padding:			'24px',
		}
	},

	// For form button
	raisedButton: {
		color:					r3CommonPalette.white,
		textColor:				r3CommonPalette.white,
		primaryColor:			r3CommonPalette.accent1Color,
		primaryTextColor:		r3CommonPalette.white,
		secondaryColor:			r3CommonPalette.accent2Color,
		secondaryTextColor:		r3CommonPalette.white,
		disabledColor:			r3CommonPalette.accent3Color,
		disabledTextColor:		r3CommonPalette.primary3Color
	},
	r3FormButtons: {
		raisedButtonStyle: {
			margin:				4
		}
	},

	// For Contents
	r3Contents: {
		subcomponent: {
			marginLeft:				'64px'
		},
		componentSpacer: {
			marginTop:				'48px'
		},
		labelStyle:					r3CommonContents.textLabelStyle,
		wrapperDivStyle: {
			height:					'48px'
		},

		aliasesTextFieldStyle:		r3CommonContents.threeButtonTextFieldSize,
		resourcesTextFieldStyle:	r3CommonContents.oneButtonTextFieldSize,
		policyTextFieldStyle:		r3CommonContents.oneButtonTextFieldSize,
		tenantsTextFieldStyle:		r3CommonContents.oneButtonTextFieldSize,

		firstInTwoTextFieldStyle:	r3ObjMerge(r3CommonContents.oneButtonTwoTextFieldSize, {
			float:					'left'
		}),
		secondInTwoTextFieldStyle:	r3ObjMerge(r3CommonContents.oneButtonTwoTextFieldSize, {
			marginLeft:				'12px'
		}),

		firstInTwoTextStyle:		r3ObjMerge(r3CommonContents.oneButtonTwoTextFieldSize, r3CommonFontSmall, {
			paddingTop:				'12px',
			borderBottom:			'solid',
			borderBottomWidth:		'1px',
			borderBottomColor:		r3CommonPalette.primary2Color,
			float:					'left'
		}),
		secondInTwoTextStyle:		r3ObjMerge(r3CommonContents.oneButtonTwoTextFieldSize, r3CommonFontSmall, {
			marginLeft:				'12px',
			paddingTop:				'12px',
			borderBottom:			'solid',
			borderBottomWidth:		'1px',
			borderBottomColor:		r3CommonPalette.primary2Color,
			float:					'left'
		}),
		firstInTwoLabelStyle:		r3ObjMerge(r3CommonFontMiddle, r3CommonContents.oneButtonTwoTextFieldSize, {
			color:					r3CommonPalette.primary2Color,
			float:					'left'
		}),
		secondInTwoLabelStyle:		r3ObjMerge(r3CommonFontMiddle, r3CommonContents.oneButtonTwoTextFieldSize, {
			color:					r3CommonPalette.primary2Color,
			marginLeft:				'12px',
			float:					'left'
		}),

		selectButtonStyle: {
			width:					'300px',
			marginLeft:				0,
			marginBottom:			16
		},
		iconButtonColor: {
			color:					r3CommonPalette.accent2Color
		},
		iconButtonStyle: {
			float:					'right',
			padding:				0,
			marginLeft:				6,
		},
		dummyButtonStyle: {
			float:					'right',
			width:					'48px',
			height:					'48px',
			padding:				0,
			marginLeft:				6,
		},

		dropdownMenuStyle: {
			marginLeft:				0,
			paddingLeft:			0,
			marginBottom:			16
		},
		dropdownMenuTarget: {
			horizontal:				'right',
			vertical:				'top'
		},
		dropdownMenuAnchor: {
			horizontal:				'right',
			vertical:				'bottom'
		}
	},

	// For Progress
	r3progress: {
		pageStyle: {											// Full screen and most foreground
			width:					'100vw',
			height:					'100vh',
			top:					0,
			left:					0,
			position:				'fixed',
			zIndex:					1500,
			backgroundColor:		'rgba(0,0,0,0)'
		},
		circularProgressStyle: {								// center of page
			top:					'45vh',
			left:					'45vw',
			position:				'fixed'
		}
	},

	// For IconFonts
	//
	// [NOTE][TODO]
	// It is better to specify SVG icon of material-ui directly than using IconFont.
	// https://www.materialui.co/icons
	//
	// [NOTE]
	// Now could not specify FontIcon size, only you can change it by "space" property.
	// But it will include bad result for another items.
	//
	r3IconFonts: {
		closeIconFont:			styleIconFont['material-icons-close'],
		dehazeIconFont:			styleIconFont['material-icons-dehaze'],

		accountIconFont:		styleIconFont['material-icons-account-box-large'],
		pathIconFont:			styleIconFont['material-icons-description'],
		accountLoginIconFont:	styleIconFont['material-icons-account-login'],

		addIconFont:			styleIconFont['material-icons-add-btn'],
		deleteIconFont:			styleIconFont['material-icons-delete-forever-btn'],

		errIconFont:			styleIconFont['material-icons-error'],
		warnIconFont:			styleIconFont['material-icons-warning'],
		infoIconFont:			styleIconFont['material-icons-information'],

		saveIconFont:			styleIconFont['material-icons-save'],
		checkIconFont:			styleIconFont['material-icons-check'],
		cancelIconFont:			styleIconFont['material-icons-cancel'],

		moreVertIconFont:		styleIconFont['material-icons-more-vert'],
		rightIconFont:			styleIconFont['material-icons-arrow-right'],
		upIconFont:				styleIconFont['material-icons-move-up'],
		downIconFont:			styleIconFont['material-icons-move-down'],

		treeTopIconFont:		styleIconFont['material-icons-label-top'],
		downArrowIconFont:		styleIconFont['material-icons-down-arrow'],
		arrowUpwardIconFont:	styleIconFont['material-icons-arrow-upward'],

		clipboardCopyIconFont:	styleIconFont['material-icons-clipcopy'],
		SettingIconFont:		styleIconFont['material-icons-edit']
	},
};

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
