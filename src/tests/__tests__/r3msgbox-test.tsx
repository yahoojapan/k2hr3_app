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
import R3MsgBox					from '../../components/r3msgbox';
import R3Message				from '../../util/r3message';
import { errorType }			from '../../util/r3types';
import R3Provider				from '../../util/r3provider';

import '../__mocks__/fetchMock';

//
// Dummy data
//
const message = new R3Message('Dummy error message', errorType);

//
// Main test
//
describe('R3MsgBox', () => {
	it('test snapshot for R3MsgBox', () => {
		const r3provider	= new R3Provider(null);

		const element		= (
			<StyledEngineProvider injectFirst>
				<ThemeProvider theme={ r3Theme } >
					<CssBaseline />
					<R3MsgBox
						theme={ r3Theme }
						message={ message }
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
