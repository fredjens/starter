//----------------------------------------------------------------
// GULP
//----------------------------------------------------------------
// Dependencies

var gulp = require('gulp'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    connect = require('gulp-connect-php'),
    browserSync = require('browser-sync'),
    watch = require('gulp-watch'),
    autoprefixer = require('gulp-autoprefixer'),
	minifyCSS = require('gulp-minify-css'),
    rename = require('gulp-rename'), 
    uglify = require('gulp-uglify'), 
    //sassdoc = require('sassdoc'),
    gutil = require('gulp-util'),
    nunjucksRender = require('gulp-nunjucks-render'),
    data = require('gulp-data');

// BrowserSync

gulp.task('browser-sync', function() {
    connect.server({}, function (){
        browserSync ({
            proxy: 'http://localhost:8000/app'
        });
    });
    gulp.watch('scss/*.scss', ['sass']);
    gulp.watch('js/*.js', [ 'scripts' ]).on('change', browserSync.reload);
    gulp.watch('templates/*.html').on('change', browserSync.reload);
});
// SASS Compiler

gulp.task('sass', function() {
    return gulp.src('scss/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({ 
            style: 'expanded'
            })
                .on('error', function(err){
                browserSync.notify(err.message, 10000);
                this.emit('end');
            })
            .on('error', sass.logError)
        )
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(sourcemaps.write())
        //.pipe(sassdoc())
        .pipe(concat('main.css'))
        .pipe(gulp.dest('css'))
        .pipe(minifyCSS())
        .pipe(rename('main.min.css'))
        .pipe(sass({errLogToConsole: true}))
        .pipe(gulp.dest('css'))
        .pipe(browserSync.reload({stream: true}))
});

// JS Compiler

gulp.task('scripts', function() {
  gulp.src(['js/*.js'])
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(concat('main.min.js'))
    .pipe(gulp.dest('js/dist'))
});

gulp.task('nunjucks', function() {
    nunjucksRender.nunjucks.configure(['app/templates/']);
    return gulp.src('app/pages/**/*.+(html|nunjucks)')
    .pipe(data(function() {
      return require('./app/json/data.json')
    }))
    .pipe(nunjucksRender())
    .pipe(gulp.dest('app'))
});



// Tasks

gulp.task('up', ['browser-sync','sass']);

gulp.task('default', ['browser-sync']);
