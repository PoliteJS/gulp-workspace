/**
 * PoliteJS Workspace - Debug Server
 *
 * // run standard debug server on 8080
 * node server.js
 *
 * // custom port
 * node server.js 1234
 *
 * // serve release folder on 8080
 * node server.js -r
 *
 * // serve release folder on custom port
 * node server.js -r 1234
 *
 */
var http = require('http');
var path = require('path');
var fs = require('fs');
var extend = require('jqb-extend');

var express = require('express');

var app = express();
var server = http.createServer(app);

var serveStatic = require('serve-static');
var cookieParser = require('cookie-parser');
var compression = require('compression');

var lifeCycle = require('jqb-lifecycle');
// dynamic settings for path and port
var TARGET = null;
var PORT = null;
var RELEASE_MODE = false;

var args = require('yargs').argv;
var config = {};

// try to parse config from arguments json config
if (args.c) {
    try {
        eval('config = ' + decodeURIComponent(args.c));
    } catch(e) {
        console.log('Server configuration parsin error:');
        console.log(e);
        console.log(args.c);
    }
    config = extend({}, config || {});
}

if (config.target) {
    TARGET = config.target;
}

if (config.port) {
    PORT = config.port;
}

// direct arguments overrides configuration

if (args.w) {
    TARGET = args.w;
}

if (args.p) {
    PORT = args.p;
}

// default settings
if (TARGET === null) {
    TARGET = 'build/dev';
}

if (PORT === null) {
    PORT = '8080';
}


// Settings
var ROOT_DIR = process.cwd();
var PUBLIC_DIR = path.join(ROOT_DIR, '' + TARGET);


// Compress output
if (config.compress) {
    app.use(compression());
}

// Parsing
app.use(cookieParser());


// prevent cache
if (!config.isDev) {
    app.use(function(req, res, next){
        req.connection.setTimeout(500);
        res.setHeader('Last-Modified', (new Date()).toUTCString());
        req.connection.setTimeout(500);
        next();
    });
}

// init custom logic
var entryPoint, featuresPath, features;
if (config.entryPoint) {
    entryPoint = require(path.join(process.cwd(), config.entryPoint));
    entryPoint.init && entryPoint.init(server, app, config);
}
if (config.features) {
    featuresPath = path.join(process.cwd(), config.features);
    features = fs.readdirSync(featuresPath).filter(function(name) {
        return name.indexOf('.') === -1;
    }).map(function(name) {
        return require(path.join(featuresPath, name));
    });
    lifeCycle.start(features, server, app, config);
}
if (entryPoint) {
    entryPoint.start && entryPoint.start();
}

// static files
app.use(serveStatic(PUBLIC_DIR));

// pushstate support
app.get('*', function(request, response){
    response.sendfile(PUBLIC_DIR + '/index.html');
});

// Start
server.listen(PORT);
console.log(' ');
console.log('======= PoliteJS Workspace ========');
console.log('Just open your Chrome and point to:');
console.log('http://localhost:%s', PORT);
console.log('===================================');

// live reload
var livereload = require('livereload');
server = livereload.createServer();
server.watch(PUBLIC_DIR);

