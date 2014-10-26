var wks = require('../index');
var extend = require('jqb-extend');
var path = require('path');

module.exports = function(config) {

	var featuresPath = path.join(wks.getConfig('source.path'), wks.getConfig('source.modules'));
	var assetsPath = path.join(wks.getConfig('source.path'), wks.getConfig('source.assets'));

	config = extend({}, {
		preprocessors: {},
		files: []
	}, config || {});

	// load files and preprocess them
	config.files.push(path.join(assetsPath, '**/*.js'));
	config.files.push(path.join(featuresPath, '**/*.spec.js'));
	config.preprocessors[path.join(featuresPath, '**/*.spec.js')] = ['webpack'];
	

	config.webpack = {
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

	// dinamically add sub-modules as sources for webpack global names
	if (wks.getConfig('subModules')) {
		wks.getConfig('subModules').forEach(function(module) {
			config.webpack.resolve.modulesDirectories.push(path.join(wks.getConfig('source.modules'), module));
		});
	} else {
		config.webpack.resolve.modulesDirectories.push(wks.getConfig('source.modules'));
	}

	config.webpackServer = {
	    noInfo:true
	};

	return config;
};