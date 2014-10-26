var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');
var uglify = require('uglify-js');
var md5 = require('MD5');

var Workspace = require('../');

module.exports = function(content) {
	var self = this;
	var dest = Workspace.getConfig().target.dev.path;
    var rname = path.relative(self.file.base, self.file.path).replace(/\//g, '_');

    // relative path from html file to root, useful for nested html
    var rpath = path.relative(path.dirname(self.file.path), self.file.base).replace(/\//g, '_');
    rpath = rpath ? rpath + '/' : './';

    var config = Workspace.getConfig();
    var scriptsFolder = config.source.scripts;
    var stylesFolder = config.source.styles;
    var assetsFolder = config.source.assets;

    // parse "!/" template link to assets
    content = content.replace(/\!\//g, rpath + assetsFolder + '/');

    var $ = cheerio.load(content);

    // predispose dynamic placeholders
    if (!$('#wks-css').length) $('head').append('<link id="wks-css">');
    if (!$('#wks-lib').length) $('body').append('<link id="wks-lib">');
    if (!$('#wks-app').length) $('body').append('<link id="wks-app">');

    // identify all existing scripts
	var scripts = [];
    $('body script').each(function(i, item) {
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
        var fpath = path.normalize(path.join(process.cwd(), dest, folderName, fname));

        if (!fs.existsSync(fpath)) {
            var fname = 'index.' + ext;
            fpath = path.normalize(path.join(process.cwd(), dest, folderName, fname));
        }

        if (fs.existsSync(fpath)) {
            switch (ext) {
                case 'css':
                    if (!$('#wks-css').html().length) {
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
    if (!$('#wks-css').html().length) $('#wks-css').remove();
    if (!$('#wks-lib').html().length) $('#wks-lib').remove();
    if (!$('#wks-app').html().length) $('#wks-app').remove();
        
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

