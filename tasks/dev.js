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

	gulp.task('wkd-copy-assets', function () {
	    return gulp.src([
	    	path.join(config.source.path, config.source.assets, '**/*'), '!**/*.less'
	    ])
	        .pipe(changed(path.join(config.target.dev.path, config.source.assets)))
	        .pipe(gulp.dest(path.join(config.target.dev.path, config.source.assets)))
	    ;
	});

	gulp.task('wkd-copy-html', function () {
	    return gulp.src([
	    	path.join(config.source.path, '**/*.html'),
	    	'!' + path.join(config.source.path, config.source.assets, '**/*.html'),
	    	// '!' + path.join(config.source.path, config.source.scripts, '**/*.html'),
	    	'!' + path.join(config.source.path, config.source.modules, '**/*.html')
	    ])
	        .pipe(changed('build/dev'))
	        .pipe(change(htmlBundle))
	        .pipe(gulp.dest(config.target.dev.path))
	    ;
	});

	gulp.task('wkd-copy-html-hard', function () {
	    return gulp.src([
	    	path.join(config.source.path, '**/*.html'),
	    	'!' + path.join(config.source.path, config.source.assets, '**/*.html'),
	    	// '!' + path.join(config.source.path, config.source.core, '**/*.html'),
	    	'!' + path.join(config.source.path, config.source.modules, '**/*.html')
	    ])
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
	        .pipe(sourcemaps.init())
	        .pipe(less())
	        .pipe(sourcemaps.write('./'))
	        .pipe(gulp.dest(path.join(config.target.dev.path, config.source.styles)));
	});

};
