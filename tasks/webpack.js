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

	gulp.task('wkd-webpack', function(done) {

		var defaultOptions = {
	    	context: path.join(process.cwd(), config.source.path, config.source.scripts),
	    	entry: {},
	        output: {},
	        resolve: {},
	        module: {},
	        plugins: [],
	        devtool: config.target.dev.js.sourcemaps ? 'sourcemap' : false,
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
               'node_modules'
           ]
		};

		// dinamically add sub-modules as sources for webpack global names
		config.source.features.forEach(function(feature) {
			defaultResolveOptions.modulesDirectories.push(feature);
		});

	    // extend with config file options
	    var webpackConfig = extend({}, defaultOptions, config.webpack.dev());
	    webpackConfig.output = extend({}, defaultOutputOptions, webpackConfig.output);
	    webpackConfig.resolve = extend({}, defaultResolveOptions, webpackConfig.resolve);

	    // handle html in modules
	    pushLoader(webpackConfig, {
	    	test: /\.html$/, 
	    	loader: "raw!gulp-workspace/lib/markdown-tag-loader"
	    });


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


function pushLoader(config, loader) {
	if (!config.module) {
		config.module = {};
	}
	if (!config.module.loaders) {
    	config.module.loaders = [];
    }
    var found = config.module.loaders.some(function(item) {
    	return (
    		item.test.toString() === loader.test.toString() 
    		&& item.loader === item.loader
    	);
    });
    if (!found) {
    	config.module.loaders.push(loader);
    }
}
