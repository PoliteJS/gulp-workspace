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
		    "istanbul@^0.3.2",
		    "istanbul-instrumenter-loader@^0.1.2",
		    "mocha@^2.0.1",
		    "chai@^1.9.2",
		    "sinon@^1.10.3"
		].join(' ');
		var watch = childProcess.exec(cmd, function() {});
	    watch.stdout.on('data', function(data) {
	        console.log(data);
	    });
	    watch.on('exit', done);
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