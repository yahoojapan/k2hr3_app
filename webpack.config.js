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
const is_dev	= (undefined !== process.env.NODE_ENV && 'development' === process.env.NODE_ENV);

module.exports = {
	entry: {
		bundle:		path.join(__dirname, '/src/r3app.jsx')
	},
	output: {
		path:		path.join(__dirname, '/public/js'),
		filename:	'bundle.js'
	},
	module: {
		loaders: [
			{
				loader:		'babel-loader',
				exclude:	/node_modules/,
				test:		/\.js[x]?$/,
				query: {
					cacheDirectory:	true,
					presets:		['@babel/preset-react', '@babel/preset-env']
				}
			},
			{
				loaders:	['style-loader', 'css-loader?modules&localIdentName=[path][name]-[local]-[hash:base64:5]'],
				test:		/\.css$/
			},
			{
				loader:		'url-loader?limit=8192',
				test:		/\.(png|jpg)$/
			}
		]
	},
	plugins: is_dev ? [
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('development')
		})
	] : [
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('production')
		}),
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings:	false
			}
		})
	]
	,
	resolve: {  
		extensions: ['*', '.js', '.jsx', '.css']
	}
};

/*
 * VIM modelines
 *
 * vim:set ts=4 fenc=utf-8:
 *
 */
