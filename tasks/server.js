var childProcess = require('child_process');
var open = require('open');
var path = require('path');
var notifier = require('node-notifier');

var __childProcesses = [];

exports.start = function(gulp, config) {

	gulp.task('wks-server', function (done) {
		startServer(config, done);
	});

	gulp.task('wks-server-show', function (done) {
		var port = startServer(config, done);
		open('http://localhost:' + port);
	});

	gulp.task('wks-start', function (done) {
		var args = require('yargs').argv;
	    startWatch(function() {
	    	killAll('watch proces has crashed');
	    });
	    if (args.t) {
	    	startTdd(function() {
		    	killAll('tdd proces has crashed');
		    });
	    }
	    startServer(config, function() {
	    	killAll('development server has crashed');
	    });
	});

	gulp.task('wks-install-karma', function(done) {
		var cmd = 'npm install ' + [
			"karma@^0.12.24",
		    "karma-chai@^0.1.0",
		    "karma-coverage@^0.2.6",
		    "karma-mocha@^0.1.9",
		    "karma-osx-reporter@^0.1.0",
		    "karma-phantomjs-launcher@^0.1.4",
		    "karma-sinon@^1.0.3",
		    "karma-webpack@^1.3.1",
		    "karma-es5-shim@^0.0.4",
		    "istanbul@^0.3.2",
		    "istanbul-instrumenter-loader@^0.1.2",
		    "mocha@^2.0.1",
		    "chai@^1.9.2",
		    "sinon@^1.10.3",
		    "react@^0.12.2",
		].join(' ');
		var watch = childProcess.exec(cmd, function() {});
	    watch.stdout.on('data', function(data) {
	        console.log(data);
	    });
	    watch.on('exit', done);
	});

};

function startServer(config, done) {
	
	var usingPort = '8080';

	var processArgs;
	var serverArgs = '';
	var serverExec = '';

	try {
		processArgs = require('yargs').argv;
	} catch(e) {
		processArgs = {};
	};

	if (processArgs.p) {
		serverArgs += ' -p ' + processArgs.p;
		usingPort = processArgs.p;
	}
	if (processArgs.r) {
		serverArgs += ' -w ' + config.target.prod.path;
		serverArgs += ' -c ' + encodeURIComponent(JSON.stringify(config.server.prod || {}));
		serverExec = config.server.prod.exec;
	} else {
		serverArgs += ' -w ' + config.target.dev.path;
		serverArgs += ' -c ' + encodeURIComponent(JSON.stringify(config.server.dev || {}));
		serverExec = config.server.dev.exec;
	}
	
	serverExec += ' node_modules/gulp-workspace/server.js' + serverArgs;

	var server = childProcess.exec(serverExec, function() {});
    
    server.stdout.on('data', function(data) {
    	process.stdout.write(data);
    });
    
    server.on('exit', done);
    __childProcesses.push(server);

    return usingPort;
}

function startWatch(done) {
	var watch = childProcess.exec('gulp watch', function() {});
    watch.stdout.on('data', function(data) {
    	process.stdout.write(data);
    });

    watch.on('exit', done);
    __childProcesses.push(watch);
}

function startTdd(done) {
	var watch = childProcess.exec('gulp tdd', function() {});
    watch.stdout.on('data', function(data) {
        process.stdout.write(data);
    });

    watch.on('exit', done);
    __childProcesses.push(watch);
}


/**
 * Kill all the child processes and terminate the process
 */
var __isKilling;
function killAll(msg) {
	if (__isKilling) {
		return;
	}
	__isKilling = true;

	console.log('');
	console.log('');
	console.log(msg);
	console.log('');
	console.log('');

	notifier.notify({
		title: 'Workspace Crash',
		message: msg,
		sound: 'Basso'
	});

	__childProcesses.forEach(function(child) {
		child.kill();
	});
	process.exit(1);
}
