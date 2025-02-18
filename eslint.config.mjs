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

//
// [NOTE]
// This file is the old .eslintrc.js file converted by @eslint/migrate-config.
//
import react from "eslint-plugin-react";
import globals from "globals";
import babelParser from "@babel/eslint-parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all
});

export default [...compat.extends("eslint:recommended"), {
	plugins: {
		react,
	},
	languageOptions: {
		globals: {
			...globals.node,
			...globals.browser,
			...globals.commonjs,
		},
		parser: babelParser,
		ecmaVersion: 6,
		sourceType: "module",
		parserOptions: {
			ecmaFeatures: {
				jsx: true,
				legacyDecorators: true,
			},
			requireConfigFile: false,
			babelOptions: {
				presets: ["@babel/preset-react"],
			},
		},
	},
	files: ["**/*.js", "**/*.ts", "**/*.jsx", "**/www", "**/build_all_licenses"],
	rules: {
		indent: ["error", "tab", {
			SwitchCase: 1,
		}],
		"no-console": 0,
		"linebreak-style": ["error", "unix"],
		quotes: ["error", "single"],
		semi: ["error", "always"],
		"react/jsx-uses-vars": 1,
	},
}];

/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * End:
 * vim600: noexpandtab sw=4 ts=4 fdm=marker
 * vim<600: noexpandtab sw=4 ts=4
 */
