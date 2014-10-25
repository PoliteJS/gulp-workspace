var path = require('path');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');


exports.init = function(gulp, config) {

	gulp.task('wks-jshint', function () {
		return gulp.src([
			path.join(config.source.path, config.source.core, '**/*.js')
		])
			.pipe(jshint())
			.pipe(jshint.reporter(stylish, { fail: true }))
			.pipe(jshint.reporter('fail'))
	    ;
	});

};