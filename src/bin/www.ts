#!/usr/bin/env node
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
 * AUTHOR:	 Takeshi Nakatani
 * CREATE:	 Tue Aug 15 2017
 * REVISION:
 *
 */

//
// Module dependencies.
//
import app			from '../app';
import dbg			from 'debug';
import fs			from 'fs';
import cluster		from 'cluster';
import os			from 'os';
import http			from 'http';
import https		from 'https';
import R3AppConfig	from '../routes/lib/libr3appconfig';

let	debug	= dbg('k2hr3-app:server');
let numCPUs	= os.cpus().length;
let	appConf	= new R3AppConfig();
let	server: http.Server | https.Server;

//
// Setup console logging
//
appConf.setConsoleLogging(__dirname + '/../..');								// replace output from stdout/stderr to file if set in config

//
// Start multi or single processing
//
if(cluster.isMaster && appConf.isMultiProc()){
	console.log(`Master ${process.pid} is running`);

	// Fork workers.
	for(let cnt = 0; cnt < numCPUs; ++cnt){
		cluster.fork();
	}

	cluster.on('exit', (worker, code, signal) => {
		if(signal){
			console.log(`worker was killed by signal: ${signal}`);
		}else if(0 !== code){
			console.log(`worker exited with error code: ${code}`);
		}else{
			console.log(`worker ${worker.process.pid} died`);
		}
	});
}else{
	//
	// Check scheme and etc
	//
	let	options: { key: Buffer; cert: Buffer; ca: Buffer };
	let	secure	= false;
	let key		= appConf.getPrivateKey();	// allow empty
	let cert	= appConf.getCert();		// allow empty
	let ca		= appConf.getCA();			// allow empty
	let	port	= appConf.getPort();
	if('https' == appConf.getScheme() || 'HTTPS' == appConf.getScheme()){
		secure	= true;
		options = {
			key:	fs.readFileSync(key),
			cert:	fs.readFileSync(cert),
			ca:		fs.readFileSync(ca)
		};
	}else if('http' == appConf.getScheme() || 'HTTP' == appConf.getScheme()){
		secure	= false;
	}else{
		console.log('scheme value(' + appConf.getScheme() + ') in config is wrong');
		process.exit(1);
	}

	//
	// Others
	//
	let hostname= os.hostname()	|| '127.0.0.1';
	let user	= appConf.getRunUser();

	//
	// Get port and store in Express.
	//
	port = appConf.getPort();
	app.set('port', port);

	//
	// Create HTTP server.
	//
	if(secure){
		server	= https.createServer(options, app);
	}else{
		server	= http.createServer(app);
	}

	//
	// Event listener for HTTP server "error" event.
	//
	const onError = (error: NodeJS.ErrnoException) =>
	{
		if('listen' !== error.syscall){
			throw error;
		}
		let	_port = appConf.getPort();
		let	bind = ('string' === typeof _port) ? 'Pipe ' + _port : 'Port ' + _port;

		// handle specific listen errors with friendly messages
		switch(error.code){
			case 'EACCES':
				console.error(bind + ' requires elevated privileges');
				process.exit(1);
				break;
			case 'EADDRINUSE':
				console.error(bind + ' is already in use');
				process.exit(1);
				break;
			default:
				throw error;
		}
	};

	//
	// Event listener for HTTP/HTTPS server "listening" event.
	//
	const onListening = () =>
	{
		let	addr = server.address();
		let	bind = ('string' === typeof addr) ? 'pipe ' + addr : 'port ' + addr.port;
		debug('Listening on ' + bind);
	};

	//
	// Listen on provided port, on all network interfaces.
	//
	server.listen(port, () =>
	{
		if(undefined !== user && null !== user && 'string' == typeof user && '' !== user){
			console.log('Attempting setuid to user "' + user + '"...');
			try {
				process.setuid(user);
				console.log('Succeeded to setuid');
			}catch (err){
				console.log('Failed to setuid');
				process.exit(1);
			}
		}
	});
	server.on('error', onError);
	server.on('listening', onListening);

	console.log('Server running at ' + appConf.getScheme() + '://' + hostname + ':' + port + '/');
	console.log(`Worker ${process.pid} started`);
}

/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * End:
 * vim600: noexpandtab sw=4 ts=4 fdm=marker
 * vim<600: noexpandtab sw=4 ts=4
 */
