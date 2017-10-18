/**
 * gulpfile
 */
var gulp = require('gulp'),
    path = require('path');
fileinclude = require('gulp-file-include');

var ROOT_PATH = path.resolve(__dirname);
var HTML_PATH = path.resolve(ROOT_PATH, 'view/*.html');
var DEST = 'dist';

// 导入模板
gulp.task('includeFile', function () {
    return gulp.src(HTML_PATH)
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest(DEST + '/view'));
});

gulp.task('copy:js', function () {
    return gulp.src('./src/**')
        .pipe(gulp.dest(DEST + '/src/'));
});

gulp.task('copy:stub', function () {
    return (gulp.src('./stub/*'))
        .pipe(gulp.dest(DEST + '/stub/'));
});

gulp.task('copy:css', function () {
    return (gulp.src('./style/*'))
        .pipe(gulp.dest(DEST + '/style/'));
});

gulp.task('dist', function () {
    gulp.start(['includeFile', 'copy:js', 'copy:stub', 'copy:css']);
});