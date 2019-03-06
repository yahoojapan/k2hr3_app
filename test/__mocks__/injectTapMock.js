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
 * CREATE:   Fri Feb 16 2018
 * REVISION:
 *
 */

//
// This file is not mock, but we need to import this file for all jest codes.
// Because we use onTap Event in our react application, then we need to call
// injectTapEventPlugin function in all jest codes.
// This file wraps for call injectTapEventPlugin function easy.
//

import injectTapEventPlugin from 'react-tap-event-plugin';

injectTapEventPlugin();                                         // Needed for onTouchTap

module.export = null;

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
