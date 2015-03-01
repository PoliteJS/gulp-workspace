var path = require('path');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var react = require('gulp-react');;
var cache = require('gulp-cached');

exports.start = function(gulp, config) {

	var files2hint = [
		path.join(config.source.path, config.source.scripts, '**/*.js'),
		'!' + path.join(config.source.path, config.source.assets, '**/*.js'),

		path.join(config.source.path, config.source.scripts, '**/*.jsx'),
		'!' + path.join(config.source.path, config.source.assets, '**/*.jsx')
	];
	
	gulp.task('wks-jshint', function () {
		return gulp.src(files2hint)
			.pipe(cache('jshint'))
	   		.pipe(react())
	   		.on('error', function(err) {
				console.error('JSX ERROR in ' + err.fileName);
				console.error(err.message);
				this.end();
		    })
			.pipe(jshint({
				esnext: true // allow for ES6 code such "render() {}" by default
			}))
			.pipe(jshint.reporter(stylish, { fail: true }))
			.pipe(jshint.reporter('fail'))
	    ;
	});

};