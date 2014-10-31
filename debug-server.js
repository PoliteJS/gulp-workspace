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

var express = require('express');

var app = express();
var server = http.createServer(app);

var serveStatic = require('serve-static')
var cookieParser = require('cookie-parser');
var compression = require('compression')

// dynamic settings for path and port
var TARGET = null;
var PORT = null;
var RELEASE_MODE = false;

var args = require('yargs').argv;

if (args.w) {
    TARGET = args.w;
}

if (args.p) {
    PORT = args.p;
}

// default settings
if (TARGET === null) {
    TARGET = 'build/dev/';
}
if (PORT === null) {
    PORT = '8080';
}


// Settings
var ROOT_DIR = process.cwd();
var PUBLIC_DIR = path.join(ROOT_DIR, '' + TARGET);


// RELEASE MODE FLAG
if (TARGET.toLocaleLowerCase().indexOf('build/prod') !== -1) {
    RELEASE_MODE = true;
}

// Compress output
app.use(compression());

// Parsing
app.use(cookieParser());


// prevent cache
if (!RELEASE_MODE) {
    app.use(function(req, res, next){
        req.connection.setTimeout(500);
        res.setHeader('Last-Modified', (new Date()).toUTCString());
        req.connection.setTimeout(500);
        next();
    });
}

// static files
app.use(serveStatic(PUBLIC_DIR));

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

