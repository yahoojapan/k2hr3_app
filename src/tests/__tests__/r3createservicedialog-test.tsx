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
import renderer					from 'react-test-renderer';
import { ThemeProvider }		from '@mui/material/styles';
import { StyledEngineProvider, CssBaseline}	from '@mui/material';					// for jss and reset.css

import r3Theme					from '../../components/r3theme';					// custom theme
import R3CreateServiceDialog	from '../../components/r3createservicedialog';
import R3Provider				from '../../util/r3provider';

import '../__mocks__/fetchMock';
import { createNodeMock }		from '../__mocks__/materialUiMock';					// for material-ui

// [NOTE]
// There is a problem with the Dialog class JEST snapshot.
// At the moment, we have mocked the Fade class and have not taken a
// snapshot of the following elements.
// Please refer to the following FIXME for details. We hope for future
// corrections.
//

// [NOTE][FIXME]
// ReactDOM has Portal, but not react-test-renderer. (React 16.x)
// When testing with react-test-renderer, an error occurs because DOM can
// not have multiple tails.
// "An invalid container has been provided. This may indicate that another
//	renderer is being used in addition to the test renderer. (For example,
//	ReactDOM.createPortal inside of a ReactTestRenderer tree.) This is not
//	supported."
// To avoid this, define createPortal as mock.
// Along with this, an error will occur in Modal/Fade.(described later)
//
import ReactDOM				from 'react-dom';									// For mock of createPortal

const mockCreatePortal = jest.fn((element: React.ReactNode, _node: Element | DocumentFragment): React.ReactPortal =>
{
	const	DummyComponent = (): React.ReactElement | null => null;		// for type member value(= string | JSXElementConstructor)
	return {
		type:		DummyComponent,
		props:		{ children: element },
		key:		null,
		children:	element
	};
});

// [NOTE][FIXME]
// Modal generates an error because it accesses without the scrollTop
// property.
// -> https://github.com/mui-org/material-ui/blob/474e56bd90b4edc5c6431ecfcffbb525b1f58806/packages/material-ui/src/Modal/Modal.js#L108
// This error can be avoided by setting the disablePortal property of
// the Dialog class to true.
//
const testTheme = {
	...r3Theme,
	r3CreateServiceDialog: {
		...r3Theme.r3CreateServiceDialog,
		root: {
			...r3Theme.r3CreateServiceDialog.root,
			disablePortal:	true				// for test
		}
	}
};

// [NOTE]
// The Transition class used in this dialog is Fade.
// As mentioned earlier, DOM Portal mocking causes the following error
// in the Fade and Modal classes:
//	'The above error occurred in the <ForwardRef (Modal)> component'
//
// Avoid this error by replacing the Fade and Modal classes with mock.
// Unlike before, by changing the mock content, you can fully check
// the snapshots in the Dialog.
//
jest.mock('@mui/material/Fade', () => {
	return '';
});
jest.mock('@mui/material/Modal', () => {
	return '';
});

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
const tenant = {
	name:	'10000',
	display: 'GROUP0:TENANT0'
};

//
// Main test
//
describe('R3CreateServiceDialog', () =>
{
	let	createPortalSpy: jest.SpyInstance;

	beforeAll(() => {
		createPortalSpy = jest.spyOn(ReactDOM, 'createPortal').mockImplementation(mockCreatePortal);
	});

	afterEach(() => {
		createPortalSpy.mockClear();
	});

	afterAll(() => {
		createPortalSpy.mockRestore();
	});

	it('test snapshot for R3CreateServiceDialog', () => {
		const r3provider	= new R3Provider(null);

		const element		= (
			<StyledEngineProvider injectFirst>
				<ThemeProvider theme={ testTheme } >
					<CssBaseline />
					<R3CreateServiceDialog
						theme={ testTheme }
						r3provider={ r3provider }
						open={ true }
						createMode={ true }
						tenant={ tenant }
						newServiceName={ '' }
						newVerify={ '' }
						onClose={ close }
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
