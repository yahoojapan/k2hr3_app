/*
 *
 * K2HR3 Web Application
 *
 * Copyright 2023 Yahoo Japan Corporation.
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
 * CREATE:   Tue Jul 25 2023
 * REVISION:
 *
 */

import React					from 'react';
import { render }				from '@testing-library/react';
import { ThemeProvider }		from '@mui/material/styles';
import { StyledEngineProvider, CssBaseline}	from '@mui/material';					// for jss and reset.css

import r3Theme					from '../../components/r3theme';					// custom theme
import R3LocalTenantDialog		from '../../components/r3localtenantdialog';
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
const close	= jest.fn();

//
// Dummy datas
//
const allTenantNames = [
	'10000',
	'20000',
	'local@3000'
];

const tenantName		= 'local@3000';
const tenantId			= '3000-000';
const tenantDisplay		= 'GROUP1:LOCAL1';
const tenantDescription	= 'GROUP0:DESC LOCAL1';
const tenantUsers		= [ 'test' ];

//
// Main test
//
describe('R3LocalTenantDialog', () =>
{
	it('test snapshot for R3LocalTenantDialog', () => {
		const r3provider	= new R3Provider(null);

		const element		= (
			<StyledEngineProvider injectFirst>
				<ThemeProvider theme={ r3Theme } >
					<CssBaseline />
					<R3LocalTenantDialog
						theme={ r3Theme }
						r3provider={ r3provider }
						open={ true }

						userName={ 'test' }
						createMode={ true }

						allTenantNames={	allTenantNames		}
						tenantName={		tenantName			}
						tenantId={			tenantId			}
						tenantDisplay={		tenantDisplay		}
						tenantDescription={	tenantDescription	}
						tenantUsers={		tenantUsers			}
						onClose={ close }
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
