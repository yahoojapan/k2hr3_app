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

import React					from 'react';
import { render }				from '@testing-library/react';
import { ThemeProvider }		from '@mui/material/styles';
import { StyledEngineProvider, CssBaseline}	from '@mui/material';					// for jss and reset.css

import r3Theme					from '../../components/r3theme';					// custom theme
import R3AppBar					from '../../components/r3appbar';
import R3Provider				from '../../util/r3provider';

import '../__mocks__/fetchMock';

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
const treedetach	= jest.fn();
const opentree		= jest.fn();
const checkupdating	= jest.fn();
const about			= jest.fn();
const sign			= jest.fn();
const account		= jest.fn();

//
// Main test
//
describe('R3AppBar', () => {
	it('test snapshot for R3AppBar', () => {
		const r3provider	= new R3Provider(null);
		const commonContext	= { r3Context: r3provider.getR3Context() };

		const element		= (
			<StyledEngineProvider injectFirst>
				<ThemeProvider theme={ r3Theme } >
					<CssBaseline />
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
				</ThemeProvider>
			</StyledEngineProvider>
		);

		const { baseElement } = render(element);
		expect(baseElement).toMatchSnapshot();
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
