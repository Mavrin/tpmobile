var gulp = require('gulp');
var stylus = require('gulp-stylus');
var prefix = require('gulp-autoprefixer');
var path = './src/**/*.styl';
var dest = './src/';

gulp.task('css', function () {
    gulp.src(path)
        .pipe(stylus())
        .pipe(prefix("last 2 Chrome versions"))
        .pipe(gulp.dest(dest))
});
gulp.task('watch', function() {
    gulp.watch(path, ['css']);
});

gulp.task('default', ['css','watch']);