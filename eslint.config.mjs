/*
 * K2HR3 Web Application
 *
 * Copyright 2022 Yahoo Japan Corporation.
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
 * CREATE:   Tue, 18 Feb 2025
 * REVISION:
 *
 */

import react from "eslint-plugin-react";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import globals from "globals";
import babelParser from "@babel/eslint-parser";
import js from "@eslint/js";

export default [
	js.configs.recommended,

	//
	// TypeScript files (src/**/*.ts, src/**/*.tsx)
	//
	{
		files: ["src/**/*.ts", "src/**/*.tsx"],
		plugins: {
			react,
			"@typescript-eslint": tseslint,
		},
		languageOptions: {
			globals: {
				...globals.node,
				...globals.browser,
			},
			parser: tsparser,
			ecmaVersion: 2020,
			sourceType: "module",
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
		rules: {
			indent: ["error", "tab", {
				SwitchCase: 1,
			}],
			"no-console": 0,
			"no-var": "error",
			"linebreak-style": ["error", "unix"],
			quotes: ["error", "single"],
			semi: ["error", "always"],
			"react/jsx-uses-vars": 1,
			"no-unused-vars": "off",
			"@typescript-eslint/no-unused-vars": "off",
			"@typescript-eslint/no-explicit-any": "warn",
			"no-redeclare": "off",
			"no-undef": "off",
		},
	},

	//
	// Test files (src/tests/**/*.ts, src/tests/**/*.tsx)
	//
	{
		files: ["src/tests/**/*.ts", "src/tests/**/*.tsx"],
		plugins: {
			react,
			"@typescript-eslint": tseslint,
		},
		languageOptions: {
			globals: {
				...globals.node,
				...globals.browser,
				...globals.jest,
			},
			parser: tsparser,
			ecmaVersion: 2020,
			sourceType: "module",
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
		rules: {
			indent: ["error", "tab", {
				SwitchCase: 1,
			}],
			"no-console": 0,
			"no-var": "error",
			"linebreak-style": ["error", "unix"],
			quotes: ["error", "single"],
			semi: ["error", "always"],
			"react/jsx-uses-vars": 1,
			"no-unused-vars": "off",
			"@typescript-eslint/no-unused-vars": "off",
			"@typescript-eslint/no-explicit-any": "warn",
			"no-redeclare": "off",
			"no-undef": "off",
		},
	},

	//
	// Demo files (demo/*.ts)
	//
	{
		files: ["demo/*.ts"],
		plugins: {
			"@typescript-eslint": tseslint,
		},
		languageOptions: {
			globals: {
				...globals.node,
				...globals.browser,
			},
			parser: tsparser,
			ecmaVersion: 2020,
			sourceType: "module",
			parserOptions: {
				project: "./demo/tsconfig.json",
			},
		},
		rules: {
			indent: ["error", "tab", {
				SwitchCase: 1,
			}],
			"no-console": 0,
			"no-var": "error",
			"linebreak-style": ["error", "unix"],
			quotes: ["error", "single"],
			semi: ["error", "always"],
			"no-unused-vars": "off",
			"@typescript-eslint/no-unused-vars": "off",
			"@typescript-eslint/no-explicit-any": "warn",
			"no-redeclare": "off",
			"no-undef": "off",
		},
	},

	//
	// Config files (webpack.config.js, etc.)
	//
	{
		files: ["*.js", "*.mjs"],
		languageOptions: {
			globals: {
				...globals.node,
			},
			ecmaVersion: 2020,
			sourceType: "module",
		},
		rules: {
			indent: ["error", "tab", {
				SwitchCase: 1,
			}],
			"no-console": 0,
			"linebreak-style": ["error", "unix"],
			quotes: ["error", "single"],
			semi: ["error", "always"],
		},
	},

	//
	// Shell script entry points (bin/build_all_licenses)
	//
	{
		files: ["bin/build_all_licenses"],
		languageOptions: {
			globals: {
				...globals.node,
			},
			ecmaVersion: 2020,
			sourceType: "commonjs",
		},
		rules: {
			indent: ["error", "tab", {
				SwitchCase: 1,
			}],
			"no-console": 0,
			"linebreak-style": ["error", "unix"],
			quotes: ["error", "single"],
			semi: ["error", "always"],
		},
	},
];

/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * End:
 * vim600: noexpandtab sw=4 ts=4 fdm=marker
 * vim<600: noexpandtab sw=4 ts=4
 */
