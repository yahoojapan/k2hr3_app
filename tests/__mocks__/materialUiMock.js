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
 * CREATE:   Fri Feb 16 2018
 * REVISION:
 *
 */

//
// This mock function is used in calling parameter for react-test-renderer create method.
// The ToolChip and Ripple object in material-ui react object is using browser DOM object.
// Then we need to use mock function for those properties instead of browser DOM.
//
// [NOTE]
// If you got following error from jest, you should add property into mocks object.
//	ex =>
//		'TypeError: Cannot read property 'style' of undefined'
//			...
//		at CircularProgress.rotateWrapper (node_modules/material-ui/CircularProgress/CircularProgress.js:165:39)
//			...
//
// The codes in node_modules/material-ui/CircularProgress/CircularProgress.js:165 is
// following.
//	=>	_autoPrefix2.default.set(wrapper.style, 'transform', 'rotate(0deg)');
//
// Then you can see that the 'style' is 'wrapper' member. So that you should add object
// 'wrapper' with empty 'style' in mocks object.
//
const mocks = {
	tooltip: {
		offsetWidth: 100
	},
	ripple: {
		style: {}
	},
	path: {
		style: {}
	},
	wrapper: {
		style: {}
	},
	checkbox: {
		checked: true
	},
	shadow: {
		value: 'dummy test string for shadow in TextField/EnhancedTextarea'
	}
};

export const createNodeMock = (element) =>
{
	if(	undefined === element            || null === element           ||
		undefined === element.ref        || null === element.ref       ||
		undefined === mocks[element.ref] || null === mocks[element.ref] )
	{
		return null;
	}
	return mocks[element.ref];
};

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
