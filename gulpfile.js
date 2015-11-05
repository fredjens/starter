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
    gutil = require('gulp-util'),
    sassdoc = require('sassdoc'),
    nunjucksRender = require('gulp-nunjucks-render'),
    data = require('gulp-data');

// PHP

gulp.task('php', function() {
  connect.server();
  });

// BrowserSync

gulp.task('browser-sync', function() {
        browserSync.init ({
            proxy: 'http://localhost:8000/public',
            port: 3000,
            notify: false
        });
});

// SASS Compiler

gulp.task('sass', function() {
    return gulp.src('scss/**/*.scss')
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
        .pipe(concat('main.css'))
        .pipe(gulp.dest('css'))
        .pipe(minifyCSS())
        .pipe(rename('main.min.css'))
        .pipe(sass({errLogToConsole: true}))
        .pipe(gulp.dest('css'))
        .pipe(browserSync.reload({stream: true}))
});

// watch

gulp.task('watch', function() {
    gulp.watch('scss/*.scss', ['sass']);
    gulp.watch('js/*.js', [ 'scripts' ]).on('change', browserSync.reload);
    gulp.watch('pages/*.nunjucks',['nunjucks']);
    gulp.watch('layout/**/*.nunjucks',['nunjucks']);
})

// JS Compiler

gulp.task('scripts', function() {
  gulp.src(['js/*.js'])
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(concat('main.min.js'))
    .pipe(gulp.dest('js/dist'))
});

// Nunjucks + JSON

gulp.task('nunjucks', function() {
    nunjucksRender.nunjucks.configure(['./layout/']);
    return gulp.src('./pages/**/*.+(html|nunjucks)')
    .pipe(data(function() {
      return require('./json/data.json')
    }))
    .pipe(nunjucksRender())
    .pipe(gulp.dest('public'))
    .pipe(browserSync.reload({stream: true}))
});


// Tasks

gulp.task('up', ['php','browser-sync','watch','nunjucks']);

