
var devTasks = require('./lib/tasks/dev');
var sharedTasks = require('./lib/tasks/shared');

exports.init = function(gulp, config) {
	this.gulp = gulp;
	this.config = config;

	[sharedTasks, devTasks].forEach(function(tasks) {
		tasks.init(gulp, config);
	});
};

exports.getConfig = function() {
	return this.config;
};

exports.getGulp = function() {
	return this.gulp;
};