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

import path from 'path';

module.exports = {
	resolveSnapshotPath: (testPath: string, snapshotExtension: string): string => {
		const srcPath	= testPath.replace(/dist[/\\]/, 'src/');
		const dir		= path.dirname(srcPath);
		const basename	= path.basename(srcPath);
		return path.join(dir, '__snapshots__', basename + snapshotExtension).replace(/\\/g, '/');
	},
	resolveTestPath: (snapshotPath: string, snapshotExtension: string): string => {
		return snapshotPath
			.replace(/[/\\]__snapshots__[/\\]/, '/')
			.replace(snapshotExtension, '')
			.replace(/src[/\\]/, 'dist/')
			.replace(/\\/g, '/');
	},
	testPathForConsistencyCheck: 'dist/tests/__tests__/r3container-test.js',
};

/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * End:
 * vim600: noexpandtab sw=4 ts=4 fdm=marker
 * vim<600: noexpandtab sw=4 ts=4
 */
