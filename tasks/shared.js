var path = require('path');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');


exports.start = function(gulp, config) {

	gulp.task('wks-jshint', function () {
		return gulp.src([
			path.join(config.source.path, config.source.scripts, '**/*.js'),
			'!' + path.join(config.source.path, config.source.assets, '**/*.js')
		])
			.pipe(jshint())
			.pipe(jshint.reporter(stylish, { fail: true }))
			.pipe(jshint.reporter('fail'))
	    ;
	});

};