var childProcess = require('child_process');
var open = require("open");

exports.start = function(gulp, config) {

	gulp.task('wks-server', function (done) {
		startServer(done);
	});

	gulp.task('wks-server-show', function (done) {
		var port = startServer(done);
		open('http://localhost:' + port);
	});

	gulp.task('wks-start', function (done) {
		var args = require('yargs').argv;
		startServer(function() {
	    	console.log('development server has crashed');
	    	done();
	    });
	    startWatch(function() {
	    	console.log('watch proces has crashed');
	    	done();
	    });
	    if (args.t) {
	    	startTdd(function() {
		    	console.log('tdd proces has crashed');
		    	done();
		    });
	    }
	});

};

function startServer(done) {

	var usingPort = '8080';

	var processArgs;
	var serverArgs = '';
	var serverExec = 'foo';

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
		serverArgs += ' -w build/prod';
	} else {
		serverArgs += ' -w build/dev';
	}

	serverExec = 'node node_modules/gulp-workspace/debug-server.js' + serverArgs;

	var server = childProcess.exec(serverExec, function() {});
    
    server.stdout.on('data', function(data) {
        console.log(data);
    });
    
    server.on('exit', done);

    return usingPort;
}

function startWatch(done) {
	var watch = childProcess.exec('gulp watch', function() {});
    watch.stdout.on('data', function(data) {
        console.log(data);
    });
    watch.on('exit', done);
}

function startTdd(done) {
	var watch = childProcess.exec('gulp tdd', function() {});
    watch.stdout.on('data', function(data) {
        console.log(data);
    });
    watch.on('exit', done);
}