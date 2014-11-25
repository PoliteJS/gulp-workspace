var fs = require('fs');
var path = require('path');
var rimraf = require('gulp-rimraf');
var changed = require('gulp-changed');
var sourcemaps = require('gulp-sourcemaps');
var less = require('gulp-less');
var size = require('gulp-size');
var extend = require('jqb-extend');
var webpack = require('webpack');
var gutil = require('gulp-util');
var change = require('gulp-change');
var gulpif = require('gulp-if');
var minifyCSS = require('gulp-minify-css');

var htmlBundle = require('../lib/dev-html-bundle');


exports.start = function(gulp, config) {

	gulp.task('wkd-clean-js', function () {
	    return gulp.src([
	    	path.join(config.target.dev.path, config.source.scripts, '**/*.js'),
	    	path.join(config.target.dev.path, config.source.scripts, '**/*.js.map')
	    ], { read: false })
	        .pipe(rimraf())
	    ;
	});

	gulp.task('wkd-clean-libs', function () {
	    return gulp.src([
	    	path.join(config.target.dev.path, config.source.scripts, '**/lib.*.bundle.js'),
	    	path.join(config.target.dev.path, config.source.scripts, '**/lib.*.bundle.js.map')
	    ], { read: false })
	        .pipe(rimraf())
	    ;
	});

	gulp.task('wkd-clean-css', function () {
	    return gulp.src([
	        path.join(config.target.dev.path, config.source.styles, '**/*.css'),
	    	path.join(config.target.dev.path, config.source.styles, '**/*.css.map')
	    ], { read: false })
	        .pipe(rimraf())
	    ;
	});

	gulp.task('wkd-clean-assets', function () {
	    return gulp.src([
	    	path.join(config.target.dev.path, config.source.assets)
	    ], { read: false })
	        .pipe(rimraf())
	    ;
	});

	gulp.task('wkd-clean-html', function () {
	    return gulp.src([
	    	path.join(config.target.dev.path, '**/*.html'),
	    	'!' + path.join(config.source.dev.path, config.source.assets, '**/*.html')
	    ], { read: false })
	        .pipe(rimraf())
	    ;
	});

	gulp.task('wkd-clean', function () {
	    return gulp.src([
	    	config.target.dev.path
	    ], { read: false })
	        .pipe(rimraf())
	    ;
	});



	/**
	 * HTML & ASSETS
	 */

	var copyHtmlSrc = [
		path.join(config.source.path, '**/*.html'),
		'!' + path.join(config.source.path, config.source.assets, '**/*.html')
	];
	if (config.source.path, config.source.scripts && config.source.path, config.source.scripts !== '.') {
		copyHtmlSrc.push('!' + path.join(config.source.path, config.source.scripts, '**/*.html'));
	}
	if (config.source.path, config.source.styles && config.source.path, config.source.styles !== '.') {
		copyHtmlSrc.push('!' + path.join(config.source.path, config.source.styles, '**/*.html'));
	}
	config.source.features.forEach(function(feature) {
		copyHtmlSrc.push('!' + path.join(config.source.path, feature, '**/*.html'));
	});

	gulp.task('wkd-copy-assets', function () {
	    return gulp.src([
	    	path.join(config.source.path, config.source.assets, '**/*'), '!**/*.less'
	    ])
	        .pipe(changed(path.join(config.target.dev.path, config.source.assets)))
	        .pipe(gulp.dest(path.join(config.target.dev.path, config.source.assets)))
	    ;
	});

	gulp.task('wkd-copy-html', function () {
	    return gulp.src(copyHtmlSrc)
	        .pipe(changed('build/dev'))
	        .pipe(change(htmlBundle))
	        .pipe(gulp.dest(config.target.dev.path))
	    ;
	});

	gulp.task('wkd-copy-html-hard', function () {
	    return gulp.src(copyHtmlSrc)
	        .pipe(change(htmlBundle))
	        .pipe(gulp.dest(config.target.dev.path))
	    ;
	});





	/**
	 * LESS
	 */

	gulp.task('wkd-less', function () {
	    gulp.src([
	    	path.join(config.source.path, config.source.styles, '*.less'),
            '!' + path.join(config.source.path, config.source.styles, '*.inc.less'),
	    ])
	        .pipe(size({ title: 'less', 'showFiles': true }))
	        .pipe(gulpif(config.target.dev.css.sourcemaps, sourcemaps.init()))
	        .pipe(less())
	        .pipe(gulpif(config.target.dev.css.minify, minifyCSS({keepBreaks:false})))
	        .pipe(gulpif(config.target.dev.css.sourcemaps, sourcemaps.write('./')))
	        .pipe(gulp.dest(path.join(config.target.dev.path, config.source.styles)));
	});

};
