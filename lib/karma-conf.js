var wks = require('../index');
var extend = require('jqb-extend');
var path = require('path');

module.exports = function(config) {

	var featuresPath = path.join(wks.getConfig('source.path'), wks.getConfig('source.features'));
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
	            'node_modules',
	            path.join(featuresPath, 'application'),
	            path.join(featuresPath, 'domain'),
	            path.join(featuresPath, 'ko-bindings'),
	            path.join(featuresPath, 'ko-components'),
	            path.join(featuresPath, 'modules')
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

	config.webpackServer = {
	    noInfo:true
	};

	return config;
};