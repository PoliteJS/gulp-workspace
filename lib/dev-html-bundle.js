var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');
var uglify = require('uglify-js');
var md5 = require('MD5');
var markdownTag = require('markdown-tag');

var importHtml = require('./import-html');

var Workspace = require('../');

module.exports = function(content) {
	var self = this;
	var dest = Workspace.getConfig().target.dev.path;
    var rname = path.relative(self.file.base, self.file.path).replace(/\//g, '_');

    // relative path from html file to root, useful for nested html
    var rpath = path.relative(path.dirname(self.file.path), self.file.base).replace(/\//g, '_');
    rpath = rpath ? rpath + '/' : './';

    // support for pushstate app
    if (Workspace.getConfig().target.dev.usePushState) {
        rpath = '/';
    }

    var config = Workspace.getConfig();
    var scriptsFolder = config.source.scripts;
    var stylesFolder = config.source.styles;
    var assetsFolder = config.source.assets;

    // parse "!/" template link to assets
    content = content.replace(/\!\//g, rpath + assetsFolder + '/');

    // parse dynamic includes & JSSP
    content = importHtml(content, null, path.dirname(self.file.path));

    // parse markdown-tags
    content = markdownTag(content);
    content = markdownTag(content, '<markdown>', '</markdown>');
    content = markdownTag(content, '<!-- Markdown -->', '<!-- /Markdown -->');
    content = markdownTag(content, '<!-- md -->', '<!-- /md -->');

    // html -> DOM Object
    var $ = cheerio.load(content);
    
    // predispose dynamic placeholders
    if (!$('#wks-css').length) $('head').append('<link id="wks-css">');
    if (!$('#wks-lib').length) $('body').append('<link id="wks-lib">');
    if (!$('#wks-app').length) $('body').append('<link id="wks-app">');

    // identify all existing scripts
	var scripts = [];
    $('body script').each(function(i, item) {
        
        // skip an explicit reference to the main app include script
        if (item.attribs.id === 'wks-app') {
            return;
        }
        
        if (!isBundeableScript(item.attribs.src)) return;
        var scriptPath = path.normalize(path.dirname(self.file.path) + '/' + item.attribs.src);
        if (fs.existsSync(scriptPath)) {
            scripts.push(scriptPath);
        } else {
            // Improve this log with some cool colors!
            console.log('Try to load "'+scriptPath+'" in "'+self.file.path+'" but it does not exists!');
        }
        $(item).remove();
    });

    // bundle libraries from HTML
    if (scripts.length) {
        var bundleName = 'lib.' + bundleHashName(scripts) + '.bundle.js';
        var bundlePath = path.normalize(path.join(process.cwd(), dest, scriptsFolder, bundleName));
        var bundleMapName = bundleName.replace('.js', '.js.map');
        var bundleMapPath = path.normalize(path.join(process.cwd(), dest, scriptsFolder, bundleMapName));

        if (!fs.existsSync(bundlePath)) {
            var bundleContent = uglify.minify(scripts, {
                compress: false,
                outSourceMap: bundleMapName,
                sourceMapIncludeSources: true
            });
        	fs.writeFileSync(bundlePath, bundleContent.code);
            fs.writeFileSync(bundleMapPath, bundleContent.map);
        }
        
        if (!$('#wks-lib').html().length) {
            $('#wks-lib').after('<script type="text/javascript" src="' + rpath + scriptsFolder + '/' + bundleName + '"></script>');
        }
    }
    
    // append file specific application bundle
    // -- optional fallback to index.xxx --
    ['css','js'].forEach(function(ext) {
        var folderName;
        switch (ext) {
            case 'css':
                folderName = stylesFolder;
                break;
            case 'js':
                folderName = scriptsFolder;
                break;
        }
        var fname = rname.replace('.html', '.' + ext);
        
        // check for entry point source file to exists to decise wether to include the linked resource
        // NOTE: the compiled output from webpack or less could be delayed!
        var sname = rname.replace('.html', '.' + (ext==='css'?'less':ext));
        var sbase = path.normalize(path.join(process.cwd(), config.source.path, (ext==='css'?config.source.styles:config.source.scripts)));
        var spath = path.join(sbase, sname);
        
        if (!fs.existsSync(spath)) {
            var sname = 'index.' + ext;
            spath = path.join(sbase, sname);
        }
        
        if (fs.existsSync(spath)) {
            switch (ext) {
                case 'css':
                    if (!$('#wks-css').html().length && !$('#wks-css').attr('href').length) {
                        $('#wks-css').after('<link rel="stylesheet" href="' + rpath + folderName + '/' + fname + '">');
                    }
                    break;
                case 'js':
                    if (!$('#wks-app').html().length) {
                        $('#wks-app').after('<script type="text/javascript" src="' + rpath + folderName + '/' + fname + '"></script>');
                    }
                    break;
            }
        }    
    });
    
    // clean empty placeholders
    if (!$('#wks-css').html() && !$('#wks-css').attr('href')) $('#wks-css').remove();
    if (!$('#wks-lib').html() && !$('#wks-lib').attr('src')) $('#wks-lib').remove();
    if (!$('#wks-app').html() && !$('#wks-app').attr('src')) $('#wks-app').remove();
    
	return $.html();
};

/**
 * Hash of a set of file names and content
 */
function bundleHashName(files) {
    return files.reduce(function(previousValue, currentValue) {
        return (previousValue ? path.basename(previousValue) + '--' : '') + path.basename(currentValue);
    },'').replace(/.js/g, '');
}

/**
 * Only local script src urls are embeddable
 */
function isBundeableScript(src) {
    if (
        !src ||
        src.substr(0, 2) === '//' ||
        src.substr(0, 4) === 'http'
    ) {
        return false;
    }
    return true;
}

