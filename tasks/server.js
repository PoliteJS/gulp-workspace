var childProcess = require('child_process');

exports.start = function(gulp, config) {

	gulp.task('wks-server', function (done) {

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
	});

};