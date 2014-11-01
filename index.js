
var extend = require('extend');
var dots = require('eivindfjeldstad-dot');

var devTasks = require('./tasks/dev');
var webpackTasks = require('./tasks/webpack');
var sharedTasks = require('./tasks/shared');
var serverTasks = require('./tasks/server');

var karmaConf = require('./lib/karma-conf');

exports.init = function(config) {
	
	this.config = extend(true, {
		source: {
	        path: 'app',
	        assets: 'assets',
			features: 'features',
			scripts: '.',
	        styles: '.'
	    },
		target: {
			dev: {
	            path: 'build/dev'
	        },
	        prod: {
	            path: 'build/prod'
	        }
		},
		server: {
			dev: {
				isDev: true,
				compress: true
			},
			prod: {
				isDev: false,
				compress: true
			}
		}
	}, config || {});

	if (typeof this.config.source.features === 'string') {
		this.config.source.features = [this.config.source.features];
	}

	return this;
};

exports.start = function(gulp) {
	this.gulp = gulp;
	sharedTasks.start(gulp, this.config);
	webpackTasks.start(gulp, this.config);
	devTasks.start(gulp, this.config);
	serverTasks.start(gulp, this.config);
};

exports.getConfig = function(path) {
	if (path) {
		return dots.get(this.config, path);
	}
	return this.config;
};

exports.getGulp = function() {
	return this.gulp;
};

exports.karmaConf = karmaConf;
