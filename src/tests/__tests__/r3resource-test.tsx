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
import R3Resource				from '../../components/r3resource';
import R3Provider				from '../../util/r3provider';
import { ResourceData }			from '../../util/r3types';

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
const resource: ResourceData = {
	aliases:	[ 'yrn:yahoo:::33348:resource:k2hr3_entest_str_res_03' ],
	expire:		null,
	keys: {
		k2hr3_entest_obj_res_01_keys_arr: [
			'k2hr3_entest_obj_res_01_keys_arr_val00',
			'k2hr3_entest_obj_res_01_keys_arr_val01'
		],
		k2hr3_entest_obj_res_01_keys_key:			'k2hr3_entest_obj_res_01_keys_val',
		k2hr3_entest_obj_res_01_keys_obj: {
			k2hr3_entest_obj_res_01_keys_obj_key00: 'k2hr3_entest_obj_res_01_keys_obj_val00',
			k2hr3_entest_obj_res_01_keys_obj_key01: 'k2hr3_entest_obj_res_01_keys_obj_val01'
		}
	},
	object:		{ k2hr3_entest_obj_res_01_value_key: 'k2hr3_entest_obj_res_01_value_val' },
	string:		null
};

//
// Main test
//
describe('R3Resource', () => {
	it('test snapshot for R3Resource', () => {
		const r3provider	= new R3Provider(null);

		const element		= (
			<StyledEngineProvider injectFirst>
				<ThemeProvider theme={ r3Theme } >
					<CssBaseline />
					<R3Resource
						theme={ r3Theme }
						r3provider={ r3provider }
						resource={ resource }
						dispUnique={ 1 }
						onSave={ save }
						onUpdate={ update }
						isReadMode={ false }
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
