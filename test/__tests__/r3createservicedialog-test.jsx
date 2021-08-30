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
 * CREATE:   Mon Jul 9 2018
 * REVISION:
 *
 */

import React					from 'react';										// eslint-disable-line no-unused-vars
import renderer					from 'react-test-renderer';
import getElementWithContext	from 'react-test-context-provider';					// for context provider
import { ThemeProvider }		from '@material-ui/styles';							// for custom theme
import CssBaseline				from '@material-ui/core/CssBaseline';				// for reset.css

import r3Theme					from '../../src/components/r3theme';				// custom theme
import R3CreateServiceDialog	from '../../src/components/r3createservicedialog';
import R3Provider				from '../../src/util/r3provider';

import mock_fetch				from '../__mocks__/fetchMock';						// eslint-disable-line no-unused-vars
import { createNodeMock }		from '../__mocks__/materialUiMock';					// for material-ui

// [NOTE]
// There is a problem with the Dialog class JEST snapshot.
// At the moment, we have mocked the Fade class and have not taken a
// snapshot of the following elements.
// Please refer to the following FIXME for details. We hope for future
// corrections.
//

// [NOTE][FIXME]
// ReactDOM has Portal, but not react-test-renderer. (React 16.x)
// When testing with react-test-renderer, an error occurs because DOM can
// not have multiple tails.
// "An invalid container has been provided. This may indicate that another
//	renderer is being used in addition to the test renderer. (For example,
//	ReactDOM.createPortal inside of a ReactTestRenderer tree.) This is not
//	supported."
// To avoid this, define createPortal as mock.
// Along with this, an error will occur in Modal/Fade.(described later)
//
import ReactDOM					from 'react-dom';									// For mock of createPortal

const mockCreatePortal = jest.fn((element, node) => {								// eslint-disable-line no-undef, no-unused-vars
	return element;
});

// [NOTE][FIXME]
// Modal generates an error because it accesses without the scrollTop
// property.
// -> https://github.com/mui-org/material-ui/blob/474e56bd90b4edc5c6431ecfcffbb525b1f58806/packages/material-ui/src/Modal/Modal.js#L108
// This error can be avoided by setting the disablePortal property of
// the Dialog class to true.
//
r3Theme.r3CreateServiceDialog.root['disablePortal'] = true;

// [NOTE]
// The Transition class used in this dialog is Fade.
// As mentioned earlier, DOM Portal mocking causes the following error
// in the Fade and Modal classes:
//	'The above error occurred in the <ForwardRef (Modal)> component'
//
// Avoid this error by replacing the Fade and Modal classes with mock.
// Unlike before, by changing the mock content, you can fully check
// the snapshots in the Dialog.
//
jest.mock('@material-ui/core/Fade', () => {												// eslint-disable-line no-undef
	return '';
});
jest.mock('@material-ui/core/Modal', () => {											// eslint-disable-line no-undef
	return '';
});

//
// Mock functions
//
// [NOTE]
// If you need to customize return value, you can call methods
// for return value by each mock function.
// see: https://jestjs.io/docs/ja/mock-functions
//
// ex)	mockfunc
//			.mockReturnValueOnce(10)
//			.mockReturnValueOnce('x')
//			.mockReturnValue(true);
//
const close	= jest.fn();															// eslint-disable-line no-undef

//
// Dummy datas
//
const tenant = {
	name:	'10000',
	display: 'GROUP0:TENANT0'
};

//
// Main test
//
describe('R3CreateServiceDialog', () => {											// eslint-disable-line no-undef
	beforeAll(() => {																// eslint-disable-line no-undef
		ReactDOM.createPortal = mockCreatePortal;
	});

	afterEach(() => {																// eslint-disable-line no-undef
		ReactDOM.createPortal.mockClear();
	});

	it('test snapshot for R3CreateServiceDialog', () => {							// eslint-disable-line no-undef
		/* eslint-disable indent */
		const r3provider	= new R3Provider(null);
		const element		= getElementWithContext({
									r3Context:	r3provider.getR3Context()
								},
								<ThemeProvider theme={ r3Theme } >
									<CssBaseline />
									<R3CreateServiceDialog
										r3provider={ r3provider }
										open={ true }
										createMode={ true }
										tenant={ tenant }
										newServiceName={ '' }
										newVerify={ '' }
										onClose={ close }
									/>
								</ThemeProvider>
							);
		/* eslint-enable indent */

		const component = renderer.create(element, { createNodeMock });
		let tree		= component.toJSON();
		expect(tree).toMatchSnapshot();												// eslint-disable-line no-undef
	});
});

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
