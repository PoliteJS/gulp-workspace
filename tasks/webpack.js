var fs = require('fs');
var path = require('path');
var rimraf = require('gulp-rimraf');
var changed = require('gulp-changed');
var sourcemaps = require('gulp-sourcemaps');
var less = require('gulp-less');
var size = require('gulp-size');
var extend = require('extend');
var webpack = require('webpack');
var gutil = require('gulp-util');
var change = require('gulp-change');

var htmlBundle = require('../lib/dev-html-bundle');

exports.start = function(gulp, config) {

	gulp.task('wkd-webpack', function(done) {

		var defaultOptions = {
	    	context: path.join(process.cwd(), config.source.path, config.source.scripts),
	    	entry: {},
	        output: {
				path: path.join(process.cwd(), config.target.dev.path, config.source.scripts),
	        	publicPath: '/' + config.source.scripts + '/',
	            filename: '[name].js',
	            chunkFilename: '[id].js',
	            sourceMapFilename: '[file].map'
			},
	        resolve: {
				modulesDirectories: [
	               'node_modules'
	           ]
			},
	        module: {
	        	loaders: [{
	                test: /\.jsx?$/, 
	                loaders: ['jsx?harmony'] 
	            },{
	                test: /\.html$/, 
	                loader: "raw!gulp-workspace/lib/markdown-tag-loader"
	            }],
	        },
	        plugins: [],
	        devtool: config.target.dev.js.sourcemaps ? 'sourcemap' : false,
	        debug: true,
	        json: true,
	        progress: true,
	        cache: true,
	        watch: false
	    };

		// dinamically add sub-modules as sources for webpack global names
		config.source.features.forEach(function(feature) {
			defaultOptions.resolve.modulesDirectories.push(feature);
		});

	    // extend with config file options
	    var webpackConfig = extend(true, {}, defaultOptions, config.webpack.dev());

	    // fetch entry points dynamically
	    if (!Object.keys(webpackConfig.entry).length) {
	    	fs.readdirSync(path.join(config.source.path, config.source.scripts)).filter(function(file) {
				return file.indexOf('.js') !== -1;
			}).forEach(function(file) {
				webpackConfig.entry[file.substr(0, file.indexOf('.'))] = './' + file
			});
	    }

	    // minifications from configuration
	    if (config.target.dev.js.minify === true) {
	    	webpackConfig.plugins.push(new webpack.optimize.DedupePlugin());
	    	webpackConfig.plugins.push(new webpack.optimize.UglifyJsPlugin());
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

