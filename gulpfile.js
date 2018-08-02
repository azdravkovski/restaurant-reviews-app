const gulp = require('gulp');
const minifyCSS = require('gulp-minify-css');
const concat = require('gulp-concat');
const minify = require('gulp-minify');
const imagemin = require('gulp-imagemin');

// Minifies JS
gulp.task('js', function() {
    gulp.src(['js/*.js', 'sw.js'])
      .pipe(minify())
      .pipe(gulp.dest('dist'))
  });
  
gulp.task('styles', function () {
    return gulp.src('css/*.css')
        .pipe(concat('styles.css'))
        .pipe(minifyCSS())
        .pipe(gulp.dest('public/css'))
});

gulp.task('images', () =>
    gulp.src('img/*')
        .pipe(imagemin())
        .pipe(gulp.dest('public/images'))
);
  
gulp.task('default', function () {
    gulp.run('styles')
    gulp.run('js')
    gulp.run('images')
    // gulp.watch('css/**/*.css', function () {
    //     gulp.run('styles')
    // })
});
