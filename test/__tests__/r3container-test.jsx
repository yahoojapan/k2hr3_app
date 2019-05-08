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
 * CREATE:   Thu Feb 15 2018
 * REVISION:
 *
 */

import React				from 'react';										// eslint-disable-line no-unused-vars
import R3Container			from '../../src/components/r3container';
import renderer				from 'react-test-renderer';
import MuiThemeProvider		from '@material-ui/core/styles/MuiThemeProvider';	// for custom theme
import CssBaseline			from '@material-ui/core/CssBaseline';				// for reset.css

import r3Theme				from '../../src/components/r3theme';				// custom theme

import mock_fetch			from '../__mocks__/fetchMock';						// eslint-disable-line no-unused-vars
import { createNodeMock }	from '../__mocks__/materialUiMock';					// for material-ui

describe('R3Container', () => {										// eslint-disable-line no-undef
	it('test snapshot for R3Container', () => {						// eslint-disable-line no-undef
		const component = renderer.create(
			<MuiThemeProvider theme={ r3Theme } >
				<CssBaseline />
				<R3Container
					title='K2HR3'
				/>
			</MuiThemeProvider>,
			{ createNodeMock }
		);

		let	tree = component.toJSON();
		expect(tree).toMatchSnapshot();								// eslint-disable-line no-undef
	});
});

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
