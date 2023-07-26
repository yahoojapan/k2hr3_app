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

import React					from 'react';										// eslint-disable-line no-unused-vars
import renderer					from 'react-test-renderer';
import getElementWithContext	from 'react-test-context-provider';					// for context provider
import { ThemeProvider }		from '@mui/material/styles';
import { StyledEngineProvider, CssBaseline}	from '@mui/material';					// for jss and reset.css

import r3Theme					from '../../src/components/r3theme';				// custom theme
import R3MainTree				from '../../src/components/r3maintree';
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
const TenantChange				= jest.fn();							// eslint-disable-line no-undef
const localTenantCreate			= jest.fn();							// eslint-disable-line no-undef
const localTenantChange			= jest.fn();							// eslint-disable-line no-undef
const localTenantDelete			= jest.fn();							// eslint-disable-line no-undef
const TypeItemChange			= jest.fn();							// eslint-disable-line no-undef
const ListItemChange			= jest.fn();							// eslint-disable-line no-undef
const NameItemInServiceChange	= jest.fn();							// eslint-disable-line no-undef
const TypeInServiceChange		= jest.fn();							// eslint-disable-line no-undef
const ListItemInServiceChange	= jest.fn();							// eslint-disable-line no-undef
const OpenChange				= jest.fn();							// eslint-disable-line no-undef
const PopupClose				= jest.fn();							// eslint-disable-line no-undef
const TreeDocking				= jest.fn();							// eslint-disable-line no-undef
const CheckUpdating				= jest.fn();							// eslint-disable-line no-undef
const About						= jest.fn();							// eslint-disable-line no-undef

//
// Dummy datas
//
const tenants = [
	{name: '10000', id: '1000-000', display: 'GROUP0:TENANT0', description: 'GROUP0:DESC TENANT0'},
	{name: '20000', id: '2000-000', display: 'GROUP1:TENANT1', description: 'GROUP0:DESC TENANT1'},
	{name: 'local@3000', id: '3000-000', display: 'GROUP1:LOCAL1', description: 'GROUP0:DESC LOCAL1', users: [ 'test' ]}
];

const treelist = [
	{
		name:		'SERVICE',
		path:		'service:',
		children:	[
			{
				name:			'child_service',
				path:			'service:child_service',
				owner:			true,
				distributed:	false,
				children:		[
					{
						name:		'ROLE',
						path:		'service:child_service:role:',
						children:	[
							{
								name:		'dummyservicerole',
								path:		'service:child_service:role:dummyservicerole',
								children:	[]
							}
						]
					},

					{
						name:		'RESOURCE',
						path:		'service:child_service:resource:',
						children:	[
							{
								name:		'dummyserviceresource',
								path:		'service:child_service:resource:dummyserviceresource',
								children:	[]
							}
						]
					},

					{
						name:		'POLICY',
						path:		'service:child_service:policy:',
						children:	[
							{
								name:		'dummyservicepolicy',
								path:		'service:child_service:policy:dummyservicepolicy',
								children:	[]
							}
						]
					}
				]
			}
		]
	},
	{
		name:		'ROLE',
		path:		'role:',
		children:	[
			{
				name:		'dummyrole',
				path:		'role:dummyrole',
				children:	[
					{
						name:		'dummysubrole',
						path:		'role:dummyrole:dummysubrole',
						children:	[]
					}
				]
			}
		]
	},
	{
		name:		'RESOURCE',
		path:		'resource:',
		children: [
			{
				name:		'dummyresource',
				path:		'resource:dummyresource',
				children:	[
					{
						name:		'dummysubresource',
						path:		'resource:dummyresource:dummysubresource',
						children:	[]
					}
				]
			}
		]
	},
	{
		name:		'POLICY',
		path:		'policy:',
		children: [
			{
				name:		'dummypolicy',
				path:		'policy:dummypolicy',
				children:	[
					{
						name:		'dummysubpolicy',
						path:		'policy:dummypolicy:dummysubpolicy',
						children:	[]
					}
				]
			}
		]
	},
];

const selectedtype		= 'resource';
const selectedservice	= 'child_service';
const selectedpath		= 'service:child_service:resource:dummyserviceresource';

//
// Main test
//
describe('R3MainTree', () => {											// eslint-disable-line no-undef
	it('test snapshot for R3MainTree', () => {							// eslint-disable-line no-undef
		const r3provider	= new R3Provider(null);

		const element		= getElementWithContext(
			{
				r3Context:	r3provider.getR3Context()
			},
			<StyledEngineProvider injectFirst>
				<ThemeProvider theme={ r3Theme } >
					<CssBaseline />
					<R3MainTree
						theme={ r3Theme }
						r3provider={ r3provider }
						title='K2HR3'
						enDock={ false }
						isDocking={ true }
						open={ true }
						editableLocalTenant={ true }
						userName={ 'test' }
						tenants={ tenants }
						treeList={ treelist }
						selectedTenant={ tenants[0] }
						selectedType={ selectedtype }
						selectedService={ selectedservice }
						selectedPath={ selectedpath }
						onTenantChange={ TenantChange }
						onLocalTenantCreate={ localTenantCreate }
						onLocalTenantChange={ localTenantChange }
						onLocalTenantDelete={ localTenantDelete }
						onTypeItemChange={ TypeItemChange }
						onListItemChange={ ListItemChange }
						onNameItemInServiceChange={ NameItemInServiceChange }
						onTypeInServiceChange={ TypeInServiceChange }
						onListItemInServiceChange={ ListItemInServiceChange }
						onOpenChange={ OpenChange }
						onPopupClose={ PopupClose }
						onTreeDocking={ TreeDocking }
						onCheckUpdating={ CheckUpdating }
						onAbout={ About }
					/>
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
