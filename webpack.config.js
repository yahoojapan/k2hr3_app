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

const webpack	= require('webpack'); 
const path		= require('path');

module.exports = {
	entry: {
		bundle:		path.join(__dirname, '/src/r3app.jsx')
	},
	output: {
		path:		path.join(__dirname, '/public/js'),
		filename:	'bundle.js'
	},
	module: {
		rules: [
			{
				loader:		'babel-loader',
				exclude:	/node_modules/,
				test:		/\.js[x]?$/,
				options: {
					babelrc:		false,
					cacheDirectory:	true,
					presets: [
						'@babel/preset-react',
						'@babel/preset-env'
					],
					plugins: [
						['@babel/plugin-proposal-decorators', { legacy: true }],
						['@babel/plugin-proposal-class-properties', { loose: true }],
						['@babel/plugin-proposal-private-methods', { loose: true }],
						['@babel/plugin-proposal-private-property-in-object', { loose: true }]
					]
				}
			},
			{
				test:	/\.css$/,
				use: [
					'style-loader',
					{
						loader:	'css-loader',
						options: {
							importLoaders:	1,
							modules: {
								localIdentName:	'[path][name]-[local]-[hash:base64:5]'
							}
						}
					}
				]
			},
			{
				test:	/\.(png|jpg)$/,
				use : [
					'url-loader?limit=8192'
				]
			}
		]
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
		})
	],
	resolve: {  
		extensions: ['*', '.js', '.jsx', '.css']
	},
	performance: {
		maxEntrypointSize:	1572864,
		maxAssetSize:		1572864
	}
};

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
