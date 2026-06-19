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
 * CREATE:   Tue Aug 15 2017
 * REVISION:
 *
 */

import { K2hr3Global } from '../util/r3context';

declare global {
	var k2hr3global: K2hr3Global;
}

global.k2hr3global = {
	r3apischeme:	'http',
	r3apihost:		'localhost',
	r3apiport:		'3000',
	r3appmenu:		'[{"name": "Dummy Menu", "url": "https://localhost/dummy/menu/"}]',
	r3userdata:		'"#include\\n{{= %K2HR3_API_HOST_URI% }}/v1/userdata/TestRegisterPathForJEST\\n"',
	username:		'test',
	unscopedtoken:	'UnscopedUserToken_ForTestByJEST',
	uselocaltenant:	true,
	dbgheader:		'x-k2hr3-debug',
	dbgvalue:		'debug',
	dbgresheader:	'x-k2hr3-error'
};

/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * End:
 * vim600: noexpandtab sw=4 ts=4 fdm=marker
 * vim<600: noexpandtab sw=4 ts=4
 */
