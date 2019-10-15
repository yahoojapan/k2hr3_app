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
 * CREATE:   Mon Jul 10 2018
 * REVISION:
 *
 */

import React					from 'react';										// eslint-disable-line no-unused-vars
import renderer					from 'react-test-renderer';
import getElementWithContext	from 'react-test-context-provider';					// for context provider
import { ThemeProvider }		from '@material-ui/styles';							// for custom theme
import CssBaseline				from '@material-ui/core/CssBaseline';				// for reset.css

import r3Theme					from '../../src/components/r3theme';				// custom theme
import R3Role					from '../../src/components/r3role';
import R3Provider				from '../../src/util/r3provider';

import mock_fetch				from '../__mocks__/fetchMock';						// eslint-disable-line no-unused-vars
import { createNodeMock }		from '../__mocks__/materialUiMock';					// for material-ui

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
const save		= jest.fn();											// eslint-disable-line no-undef
const update	= jest.fn();											// eslint-disable-line no-undef

//
// Mock functions for parts in TextField
//
// [NOTE]
// Material-ui's TextField has some components these set random "id" to itself.
// The random id is created by Math functions.
//		ex: "Math.floor(Math.random() * 0xFFFF)"
// So we need fixed id to compare snapshots, set following mock function.
//
Math.random = jest.fn(() => 0);											// eslint-disable-line no-undef

//
// Dummy datas
//
/* eslint-disable indent */
const role = {
	aliases:	[ 'yrn:yahoo:::33348:role:k2hr3_entest_obj_role_03' ],
	hosts:		{	hostnames:	[ 'host01.k2hr3_entest_obj_01.k2hr3.yahoo.co.jp * ', 'host02.k2hr3_entest_obj_01.k2hr3.yahoo.co.jp * ' ],
					ips:		[ '127.0.2.0 * ', '127.0.2.1 * ', '127.0.2.2 * ' ]
				},
	policies:	[ 'yrn:yahoo:::33348:policy:k2hr3_entest_obj_pol_01' ]
};
/* eslint-enable indent */

//
// Main test
//
describe('R3Role', () => {												// eslint-disable-line no-undef
	it('test snapshot for R3Role', () => {								// eslint-disable-line no-undef
		/* eslint-disable indent */
		const r3provider	= new R3Provider(null);
		const element		= getElementWithContext({
									r3Context:	r3provider.getR3Context()
								},
								<ThemeProvider theme={ r3Theme } >
									<CssBaseline />
									<R3Role
										r3provider={ r3provider }
										role={ role }
										dispUnique={ 1 }
										onSave={ save }
										onUpdate={ update }
										isReadMode={ false }
									/>
								</ThemeProvider>
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
