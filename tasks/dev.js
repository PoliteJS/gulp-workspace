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
	    	'!' + path.join(config.source.path, config.source.features, '**/*.html')
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
	    	'!' + path.join(config.source.path, config.source.features, '**/*.html')
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
	    	path.join(config.source.path, config.source.styles, '*.less')
	    ])
	        .pipe(size({ title: 'less', 'showFiles': true }))
	        .pipe(sourcemaps.init())
	        .pipe(less())
	        .pipe(sourcemaps.write('./'))
	        .pipe(gulp.dest(path.join(config.target.dev.path, config.source.styles)));
	});




	/**
	 * JS
	 */

	gulp.task('wkd-webpack', function(done) {

		var defaultOptions = {
	    	context: path.join(process.cwd(), config.source.path, config.source.scripts),
	    	entry: {},
	        output: {},
	        resolve: {},
	        plugins: [],
	        devtool: 'sourcemap',
	        debug: true,
	        json: true,
	        progress: true,
	        cache: true,
	        watch: false
	    };

		var defaultOutputOptions = {
			path: path.join(process.cwd(), config.target.dev.path, config.source.scripts),
        	publicPath: '/' + config.source.scripts + '/',
            filename: '[name].js',
            chunkFilename: '[id].js',
            sourceMapFilename: '[file].map'
		};

		var defaultResolveOptions = {
			modulesDirectories: [
               'node_modules',
               config.source.features + '/application',
               config.source.features + '/domain',
               config.source.features + '/modules',
               config.source.features + '/ko-bindings',
               config.source.features + '/ko-components'
           ]
		};

	    // extend with config file options
	    var webpackConfig = extend({}, defaultOptions, config.webpack.dev());
	    webpackConfig.output = extend({}, defaultOutputOptions, webpackConfig.output);
	    webpackConfig.resolve = extend({}, defaultResolveOptions, webpackConfig.resolve);

	    // fetch entry points dynamically
	    if (!Object.keys(webpackConfig.entry).length) {
	    	fs.readdirSync(path.join(config.source.path, config.source.scripts)).filter(function(file) {
				return file.indexOf('.js') !== -1;
			}).forEach(function(file) {
				webpackConfig.entry[file.substr(0, file.indexOf('.'))] = './' + file
			});
	    }

	    // push stats plugin
	    webpackConfig.plugins.push(function() {
	    	this.plugin('done', function(stats) {
		    	fs.writeFileSync(
					path.join(process.cwd(), config.target.dev.path, 'webpack.json'),
					JSON.stringify(stats.toJson())
				);
	    	});
	    });

		// run webpack
		webpack(webpackConfig).run(function(err, stats) {
			if (err) {
				gutil.log(err);
				throw new gutil.PluginError('wpack-dev', err);
			}
			gutil.log('[wpack-dev]', stats.toString({
				colors: true
			}));
			done();
		});
	});



};