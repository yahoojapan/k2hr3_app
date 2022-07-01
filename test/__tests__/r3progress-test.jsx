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
import { ThemeProvider }		from '@mui/styles';									// for custom theme
import { StyledEngineProvider, CssBaseline}	from '@mui/material';					// for jss and reset.css

import r3Theme					from '../../src/components/r3theme';				// custom theme
import R3Progress				from '../../src/components/r3progress';
import R3Provider				from '../../src/util/r3provider';

import mock_fetch				from '../__mocks__/fetchMock';						// eslint-disable-line no-unused-vars
import { createNodeMock }		from '../__mocks__/materialUiMock';					// for material-ui

//
// Main test
//
// [NOTE]
// It is currently unknown how we can test the Progress dialog.
// The Progress component is refreshed, is a globally existing window,
// controlled only display/hidden.
// Since control is only start/stop, it can not be controlled externally,
// so it is the current test content.
//
describe('R3Progress', () => {											// eslint-disable-line no-undef
	it('test snapshot for R3Progress', () => {							// eslint-disable-line no-undef
		const r3provider	= new R3Provider(null);

		const element		= getElementWithContext(
			{
				r3Context:	r3provider.getR3Context()
			},
			<StyledEngineProvider injectFirst>
				<ThemeProvider theme={ r3Theme } >
					<CssBaseline />
					<R3Progress />
				</ThemeProvider>
			</StyledEngineProvider>
		);

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
