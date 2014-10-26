var extend = require('jqb-extend');
var dots = require('eivindfjeldstad-dot');

var devTasks = require('./tasks/dev');
var sharedTasks = require('./tasks/shared');
var serverTasks = require('./tasks/server');

var karmaConf = require('./lib/karma-conf');

exports.init = function(config) {
	this.config = config;
	return this;
};

exports.start = function(gulp) {
	var self = this;
	this.gulp = gulp;
	[sharedTasks, devTasks, serverTasks].forEach(function(tasks) {
		tasks.start(self.gulp, self.config);
	});
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
