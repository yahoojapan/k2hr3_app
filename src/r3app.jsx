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
 * CREATE:   Tue Aug 15 2017
 * REVISION:
 *
 */

import style				from '../public/css/style.css';						// eslint-disable-line no-unused-vars

import React				from 'react';										// eslint-disable-line no-unused-vars
import ReactDOM				from 'react-dom';
import MuiThemeProvider		from '@material-ui/core/styles/MuiThemeProvider';	// for custom theme
import CssBaseline			from '@material-ui/core/CssBaseline';				// for reset.css

import r3Theme				from './components/r3theme';						// custom theme
import R3Container			from './components/r3container';

// Do render
ReactDOM.render(
	<MuiThemeProvider theme={ r3Theme } >
		<CssBaseline />
		<R3Container
			title='K2HR3'
		/>
	</MuiThemeProvider>,
	document.getElementById('r3app')
);

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
