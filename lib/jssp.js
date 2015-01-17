/**
 * Basic support for executing Javascript within an HTML template
 */

var path = require('path');

module.exports = jssp;

function jssp(content, params) {	
	var ctx = {
		require: innerRequire,
		output: '',
		params: params || {}
	};
	var src = 'this.output += \'' + jsspPrepareSource(content) + '\';return this.output;';

	var fn = new Function(src);
	return fn.call(ctx);
}

function jsspPrepareSource(src) {

	var re, res, code;

	// <%= variable %>
	re = /<%=(.*?)%>/ig;
    while (res = re.exec(src)) {
        code = "' + " + res[1] + " + '";
        src = src.replace(res[0], code.replace(/'/g, "__JSSP_SINGLE_APIX_PLACEHOLDER__"));
    }

	// <% javascript code %>
	re = /<%([\s\S]*?)%>/ig;
    while (res = re.exec(src)) {
    	code = "';"
    	code += res[1].replace(/\n/g, '');
    	code += "this.output += '";
        src = src.replace(res[0], code.replace(/'/g, "__JSSP_SINGLE_APIX_PLACEHOLDER__"));
    }


	src = src.replace(/'/g, "\\'");
	src = src.replace(/\r\n/g, "\n");
	src = src.replace(/\n/g, "' + '\\n' + '");

	src = src.replace(/__JSSP_SINGLE_APIX_PLACEHOLDER__/g, "'");

	return src;
}

/**
 * allow jssp to require a resource within the project folder
 */
function innerRequire(_path) {
	return require(path.join(process.cwd(), _path));
}
