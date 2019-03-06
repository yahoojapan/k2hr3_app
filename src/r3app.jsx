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

import reset				from '../public/css/reset.css';				// eslint-disable-line no-unused-vars
import style				from '../public/css/style.css';				// eslint-disable-line no-unused-vars

import React				from 'react';								// eslint-disable-line no-unused-vars
import ReactDOM				from 'react-dom';
import injectTapEventPlugin	from 'react-tap-event-plugin';				// eslint-disable-line no-unused-vars
import R3Container			from './components/r3container';

// Needed for onTouchTap
injectTapEventPlugin();

// Do render
ReactDOM.render(
	<R3Container
		title='K2HR3'
	/>,
	document.getElementById('r3app')
);

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
