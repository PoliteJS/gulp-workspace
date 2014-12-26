/**
 * MarkdownTag Webpack Loader
 */

var markdownTag = require('markdown-tag');

module.exports = function(source) {
	source = markdownTag(source);
    source = markdownTag(source, '<markdown>', '</markdown>');
    source = markdownTag(source, '<!-- Markdown -->', '<!-- /Markdown -->');
    source = markdownTag(source, '<!-- md -->', '<!-- /md -->');
    return source;
};