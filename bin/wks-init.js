#! /usr/bin/env node

var path = require('path');
var gulp = require('gulp');
var gulpSize = require('gulp-size');

var cwd = process.cwd();

gulp.task('default', function() {
    var src = path.join(cwd,'node_modules','gulp-workspace','scaffold','workspace','**/*');
    console.log(src);
    return gulp.src([src])
        .pipe(gulpSize())
        .pipe(gulp.dest(cwd));
});

gulp.run('default');
