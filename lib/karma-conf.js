var wks = require('../index');
var extend = require('extend');
var path = require('path');


var karmaConfig = {
    frameworks: ['es5-shim', 'mocha', 'chai', 'sinon'],
    preprocessors: {},
    files: [],
    webpack: {
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
            postLoaders: [{
                test: /\.jsx?$/,
                exclude: /(node_modules|specs)\//,
                loader: 'istanbul-instrumenter'
            }]
        }
    }
};


module.exports = function(config) {
	var assetsPath = path.join(wks.getConfig('source.path'), wks.getConfig('source.assets'));

    // apply local configuration to default values
	karmaConfig = extend(true, {}, karmaConfig, config || {});

	// load files and preprocess them
	karmaConfig.files.push(path.join(assetsPath, '**/*.js'));
	wks.getConfig('source.features').forEach(function(feature) {
		var featurePath = path.join(wks.getConfig('source.path'), feature);
		karmaConfig.files.push(path.join(featurePath, '**/*.spec.js'));
		karmaConfig.preprocessors[path.join(featurePath, '**/*.spec.js')] = ['webpack'];
	});

	// push modules entry points
	// karmaConfig.webpack.resolve.modulesDirectories.push(wks.getConfig('source.features'));
	wks.getConfig('source.features').forEach(function(feature) {
        karmaConfig.webpack.resolve.modulesDirectories.push(feature);
    });

	// merge webpack configuration, should create a "test" config in your webpack file.
    var webpackConfig = wks.getConfig('webpack').test ? wks.getConfig('webpack').test() : wks.getConfig('webpack').dev();
    karmaConfig.webpack = extend(true, {}, karmaConfig.webpack, webpackConfig);

	// handle html in modules
    pushLoader(karmaConfig.webpack, {
    	test: /\.html$/, 
    	loader: "raw"
    });

	karmaConfig.webpackServer = {
	    noInfo:true
	};

	return karmaConfig;
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