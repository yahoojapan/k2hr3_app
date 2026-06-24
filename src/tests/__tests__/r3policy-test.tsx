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
 * CREATE:   Mon Jul 10 2018
 * REVISION:
 *
 */

import React					from 'react';
import { render }				from '@testing-library/react';
import { ThemeProvider }		from '@mui/material/styles';
import { StyledEngineProvider, CssBaseline}	from '@mui/material';					// for jss and reset.css

import r3Theme					from '../../components/r3theme';					// custom theme
import R3Policy					from '../../components/r3policy';
import R3Provider				from '../../util/r3provider';
import { PolicyData, effectValueAllow, actionValueRead } from '../../util/r3types';

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
const save		= jest.fn();
const update	= jest.fn();

//
// Mock functions for parts in TextField
//
// [NOTE]
// Material-ui's TextField has some components these set random "id" to itself.
// The random id is created by Math functions.
//		ex: "Math.floor(Math.random() * 0xFFFF)"
// So we need fixed id to compare snapshots, set following mock function.
//
Math.random = jest.fn(() => 0);

//
// Dummy datas
//
const policy: PolicyData = {
	name:		'',
	effect:		effectValueAllow,
	action:		[ actionValueRead ],
	alias:		[],
	resource:	[ 'yrn:yahoo:::33348:resource:k2hr3_entest_obj_res_01' ]
};

//
// Main test
//
describe('R3Policy', () => {
	it('test snapshot for R3Policy', () => {
		// [NOTE]
		// R3Policy has autoWidth property which is set to DropDownMenu component through R3Policy
		// The reason why we defined autoWidth as a property of R3Policy is that JEST+material-ui
		// test detects the following errors.
		//		TypeError: Can not read property 'style' of undefined
		// This error occurred in DropDownMenu.js file. Property of DropDownMenu autoWidth works
		// as true if undefined, but it must be false when using JEST. For that, autoWidth is
		// defined in the property of R3Policy, and in this test it is set to false.
		//
		const r3provider	= new R3Provider(null);

		const element		= (
			<StyledEngineProvider injectFirst>
				<ThemeProvider theme={ r3Theme } >
					<CssBaseline />
					<R3Policy
						theme={ r3Theme }
						r3provider={ r3provider }
						policy={ policy }
						dispUnique={ 1 }
						onSave={ save }
						onUpdate={ update }
						isReadMode={ false }
						autoWidth={ false }
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
