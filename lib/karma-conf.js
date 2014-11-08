var wks = require('../index');
var extend = require('jqb-extend');
var path = require('path');

module.exports = function(karmaConfig) {
	var assetsPath = path.join(wks.getConfig('source.path'), wks.getConfig('source.assets'));

	karmaConfig = extend({}, {
		preprocessors: {},
		files: []
	}, karmaConfig || {});


	karmaConfig.webpack = {

	    resolve: {
	        modulesDirectories: [
	            'node_modules'
	        ]
	    },
	    module: {
	        postLoaders: [{
	            test: /\.js$/,
	            exclude: /(node_modules|specs)\//,
	            loader: 'istanbul-instrumenter'
	        }]
	    }
	};

	// load files and preprocess them
	karmaConfig.files.push(path.join(assetsPath, '**/*.js'));
	wks.getConfig('source.features').forEach(function(feature) {
		var featurePath = path.join(wks.getConfig('source.path'), feature);
		karmaConfig.files.push(path.join(featurePath, '**/*.spec.js'));
		karmaConfig.preprocessors[path.join(featurePath, '**/*.spec.js')] = ['webpack'];
	});

	// push modules entry points
	karmaConfig.webpack.resolve.modulesDirectories.push(wks.getConfig('source.features'));

	// merge webpack configuration
    karmaConfig.webpack = extend({}, karmaConfig.webpack, wks.getConfig('webpack').dev());

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