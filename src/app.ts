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

//
// Require
//
import express			from 'express';
import path				from 'path';
import favicon			from 'serve-favicon';
import logger			from 'morgan';
import cookieParser		from 'cookie-parser';
import bodyParser		from 'body-parser';
import R3AppConfig		from './routes/lib/libr3appconfig';
import { isSafeEntity, isSafeString, ExtRouterSetConfig, isExtRouterInfos, isExtRouterInfo, isOIDCRouterInfo, isExtRouterSetConfig, isSafeObject }	from './routes/lib/libr3util';

//
// Router
//
import index							from './routes/index';
import tokens							from './routes/tokens';

//
// Types
//
type ExtRouterModule = {
	setConfig:	ExtRouterSetConfig;
	router:		express.Router;
};

type ExtRouterModules = Record<string, ExtRouterModule>;

//
// The application
//
let app			= express();
let	appConf		= new R3AppConfig();

//
// View engine
//
app.set('views',		path.join(__dirname, '..', 'views'));
app.set('view engine',	'ejs');

//
// Setup icon
//
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));			// uncomment after placing your favicon in /public

//
// Setup Log
//
app.use(logger(appConf.getAccessLogFormat(), appConf.getMorganLoggerOption(path.join(__dirname, '..'))));

//
// Setup others
//
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/',				index);
app.use('/public/js',		express.static(path.join(__dirname, '..', 'public/js')));	// for bundle.js
app.use('/public/tokens',	tokens);													// for user token
app.use('/status.html',		express.static(path.join(__dirname, '..', 'public/status.html')));

//
// Setup extension router
//
const cfgExtRouters = appConf.getExtRouters();

if(isExtRouterInfos(cfgExtRouters)){
	let extRouterMods: ExtRouterModules = {};						// for detecting the same value

	Object.keys(cfgExtRouters).forEach((routername) => {
		const	oneExtRouter = cfgExtRouters[routername];

		if(isExtRouterInfo(oneExtRouter) || isOIDCRouterInfo(oneExtRouter)){
			const extRouterName = oneExtRouter.name;

			if(!isSafeEntity(extRouterMods[extRouterName])){
				extRouterMods[extRouterName] = require('./routes/' + extRouterName);
			}

			// check having setConfig function
			if(isExtRouterSetConfig(extRouterMods[extRouterName].setConfig)){
				const extRouterConfig = isSafeObject(oneExtRouter.config) ? oneExtRouter.config : null;

				if(!extRouterMods[extRouterName].setConfig(extRouterConfig, routername)){
					console.error('failed to set configuration for extension router(name=' + JSON.stringify(routername) + ', path=' + JSON.stringify(oneExtRouter.path) + ').');
				}
			}

			// set router
			app.use(oneExtRouter.path, extRouterMods[extRouterName].router);
			console.log('success set extension router(name=' + JSON.stringify(routername) + ', path=' + JSON.stringify(oneExtRouter.path) + ').');
		}
	});
}

//
// Last handling after all routing
//
app.use((req: express.Request, res: express.Response, next: express.NextFunction) =>
{
	let	err: Error & { status?: number }	= new Error('Not Found');
	err.status		= 404;
	next(err);
});

//
// Error handler
//
app.use((err: Error & { status?: number }, req: express.Request, res: express.Response, next: express.NextFunction) =>
{
	// set locals, only providing error in development
	res.locals.message	= err.message;
	res.locals.error	= ('development' === req.app.get('env')) ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

export default app;

/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * End:
 * vim600: noexpandtab sw=4 ts=4 fdm=marker
 * vim<600: noexpandtab sw=4 ts=4
 */
