/*
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
 */

'use strict';

module.exports = {
	'env': {
		'node':		true,
		'browser':	true,
		'commonjs':	true,
		'es6':		true
	},
	'parser': '@babel/eslint-parser',
	'extends': 'eslint:recommended',
	'rules': {
		'indent': [
			'error',
			'tab',
			{
				'SwitchCase': 1
			}
		],
		'no-console': 0,
		'linebreak-style': [
			'error',
			'unix'
		],
		'quotes': [
			'error',
			'single'
		],
		'semi': [
			'error',
			'always'
		],
		'react/jsx-uses-vars':	1
	},
	'parserOptions': {
		'ecmaVersion':	6,
		'sourceType':	'module',
		'ecmaFeatures': {
			'jsx':				true,
			'legacyDecorators':	true 
		},
		'requireConfigFile': false,
		'babelOptions': {
			'presets': [
				"@babel/preset-react"
			]
		}
	},
	'plugins': [
		'react'
	]
};

/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * End:
 * vim600: noexpandtab sw=4 ts=4 fdm=marker
 * vim<600: noexpandtab sw=4 ts=4
 */
