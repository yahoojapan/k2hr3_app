/*
 *
 * K2HR3 Web Application
 *
 * Copyright 2017 Yahoo Japan Corporation.
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
import { ThemeProvider }		from '@mui/material/styles';
import { StyledEngineProvider, CssBaseline}	from '@mui/material';					// for jss and reset.css

import r3Theme					from '../../src/components/r3theme';				// custom theme
import R3AppBar					from '../../src/components/r3appbar';
import { R3CommonContext }		from '../../src/components/r3commoncontext';
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
const treedetach	= jest.fn();										// eslint-disable-line no-undef
const opentree		= jest.fn();										// eslint-disable-line no-undef
const checkupdating	= jest.fn();										// eslint-disable-line no-undef
const about			= jest.fn();										// eslint-disable-line no-undef
const sign			= jest.fn();										// eslint-disable-line no-undef
const account		= jest.fn();										// eslint-disable-line no-undef

//
// Main test
//
describe('R3AppBar', () => {											// eslint-disable-line no-undef
	it('test snapshot for R3AppBar', () => {							// eslint-disable-line no-undef
		const r3provider	= new R3Provider(null);
		const commonContext	= { r3Context: r3provider.getR3Context() };

		const element		= getElementWithContext(
			{
				r3Context:	r3provider.getR3Context()
			},
			<StyledEngineProvider injectFirst>
				<ThemeProvider theme={ r3Theme } >
					<CssBaseline />
					<R3CommonContext.Provider
						value={ commonContext }
					>
						<R3AppBar
							theme={ r3Theme }
							r3provider={ r3provider }
							title='K2HR3'
							enDock={ false }
							isDocking={ true }
							onTreeDetach={ treedetach }
							onOpenTree={ opentree }
							onCheckUpdating={ checkupdating }
							onAbout={ about }
							onSign={ sign }
							onAccount={ account }
						/>
					</R3CommonContext.Provider>
				</ThemeProvider>
			</StyledEngineProvider>
		);

		const component = renderer.create(element, { createNodeMock });
		let tree		= component.toJSON();
		expect(tree).toMatchSnapshot();									// eslint-disable-line no-undef
	});
});

/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * End:
 * vim600: noexpandtab sw=4 ts=4 fdm=marker
 * vim<600: noexpandtab sw=4 ts=4
 */
