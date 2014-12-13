var path = require('path');
var fs = require('fs');
var cheerio = require('cheerio');

var jssp = require('./jssp');

module.exports = parseHtml;

function parseHtml(content, params, base) {

	params = makeParams(params);
	var $ = cheerio.load(jssp(content, params));

	// recursive import staff
	$('link[rel=import-html]').each(function() {
        var $include = $(this);
        var html = importHtml($include.attr('href'), $include.attr('params'), base);
        $include.after(html).remove();
    });

	return $.html();
}

function importHtml(href, params, from) {
	var fpath = path.normalize(path.join(from, href));
	
	// output error message
	if (!fs.existsSync(fpath)) {
		return '<div style="padding:5px;font-size:12px;border:1px solid #444;border-radius:3px;background:#fff;color:#f90">@include "'+ href +'"<br><small style="color:#000;font-size:12px">' + fpath + '</small></div>';
	}

	// output parsed file
	return parseHtml(fs.readFileSync(fpath, 'utf-8'), params, path.dirname(fpath));
}

function makeParams(params) {
	if (typeof params === 'object') {
		return params;
	}
	var fn = new Function('return {' + (params || '') + '};');
	return fn();
}