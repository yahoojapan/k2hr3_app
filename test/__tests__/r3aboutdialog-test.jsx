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

import React					from 'react';							// eslint-disable-line no-unused-vars
import getMuiTheme				from 'material-ui/styles/getMuiTheme';
import renderer					from 'react-test-renderer';
import getElementWithContext	from 'react-test-context-provider';		// for context provider

import R3AboutDialog			from '../../src/components/r3aboutdialog';
import R3Provider				from '../../src/util/r3provider';
import r3Theme					from '../../src/components/r3theme';

import mock_fetch				from '../__mocks__/fetchMock';			// eslint-disable-line no-unused-vars
import { createNodeMock }		from '../__mocks__/materialUiMock';		// for material-ui
import mock_injecttap			from '../__mocks__/injectTapMock';		// eslint-disable-line no-unused-vars


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
const close	= jest.fn();												// eslint-disable-line no-undef

//
// Main test
//
describe('R3AboutDialog', () => {										// eslint-disable-line no-undef
	it('test snapshot for R3AboutDialog', () => {						// eslint-disable-line no-undef
		/* eslint-disable indent */
		const r3provider	= new R3Provider(null);
		const element		= getElementWithContext({
									muiTheme:	getMuiTheme(r3Theme),
									r3Context:	r3provider.getR3Context()
								},
								<R3AboutDialog
									open={ true }
									onClose={ close }
								/>
							);
		/* eslint-enable indent */

		const component = renderer.create(element, { createNodeMock });
		let tree		= component.toJSON();
		expect(tree).toMatchSnapshot();									// eslint-disable-line no-undef
	});
});

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
