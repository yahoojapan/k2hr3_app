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
import renderer					from 'react-test-renderer';
import { ThemeProvider }		from '@mui/material/styles';
import { StyledEngineProvider, CssBaseline}	from '@mui/material';					// for jss and reset.css

import r3Theme					from '../../components/r3theme';					// custom theme
import R3Toolbar				from '../../components//r3toolbar';
import R3Provider				from '../../util/r3provider';
import { PathDetailInfo, serviceType }		from '../../util/r3types';

import '../__mocks__/fetchMock';
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
const ArrawUpward			= jest.fn();
const CreatePath			= jest.fn();
const CheckPath				= jest.fn();
const DeletePath			= jest.fn();
const CreateService			= jest.fn();
const CreateServiceTenant	= jest.fn();
const CheckServiceName		= jest.fn();
const DeleteService			= jest.fn();
const CheckUpdating			= jest.fn();

//
// Dummy datas
//
const toolbardata: PathDetailInfo = {
	tenant:				{name: '10000', display: 'GROUP0:TENANT0'},
	service:			'dummyservice',
	serviceOwner:		true,
	hasServiceTenant:	false,
	type:				serviceType,
	name:				'dummyresource',
	fullpath:			'yrn:yahoo:dummyservice::dummytenant:resource:dummyresource',
	currentpath:		'dummyresource',
	hasParent:			true,
	canCreatePath:		false,
	canCreateService:	false
};

const r3provider = new R3Provider(null);

const userdata = {
	userDataScript:		r3provider.getR3Context().getUserData(),
	roleToken:			'R=RoleToken_ForTestByJEST'
};

//
// Main test
//
describe('R3ToolBar', () => {
	it('test snapshot for R3ToolBar', () => {
		const element		= (
			<StyledEngineProvider injectFirst>
				<ThemeProvider theme={ r3Theme } >
					<CssBaseline />
					<R3Toolbar
						toolbarData={ toolbardata }
						theme={ r3Theme }
						r3provider={ r3provider }
						userData={ userdata }
						onArrawUpward={ ArrawUpward }
						onCreatePath={ CreatePath }
						onCheckPath={ CheckPath }
						onDeletePath={ DeletePath }
						onCreateService={ CreateService }
						onCreateServiceTenant={ CreateServiceTenant }
						onCheckServiceName={ CheckServiceName }
						onDeleteService={ DeleteService }
						onCheckUpdating={ CheckUpdating }
					/>
				</ThemeProvider>
			</StyledEngineProvider>
		);

		const component = renderer.create(element, { createNodeMock });
		const tree		= component.toJSON();
		expect(tree).toMatchSnapshot();
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
