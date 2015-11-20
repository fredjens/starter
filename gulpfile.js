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
    styledown = require('gulp-styledown'),
    nunjucksRender = require('gulp-nunjucks-render'),
    data = require('gulp-data'),
    newer = require('gulp-newer'),
    imagemin = require('gulp-imagemin');

// PHP

gulp.task('php', function() {
  connect.server({
    keepalive: false,
    base: './dist'
  });
});

// BrowserSync

gulp.task('browser-sync', function() {
        browserSync.init ({
            proxy: 'localhost:8000',
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
        .pipe(gulp.dest('dist/css'))
        .pipe(minifyCSS())
        .pipe(rename('main.min.css'))
        .pipe(gulp.dest('dist/css'))
        .pipe(sass({errLogToConsole: true}))
        .pipe(browserSync.reload({stream: true}))
});

// JS Compiler

var bower = 'bower_components/';
gulp.task('scripts', function() {
    gulp.src([bower+'modernizr/modernizr.js',
              bower+'jquery/dist/jquery.js',
              bower+'/fastclick/lib/fastclick.js',
              'js/**/*.js'])
    .pipe(concat('main.js'))
    .pipe(gulp.dest('dist/js/'))
    .pipe(uglify())
    .pipe(rename('main.min.js'))
    .pipe(gulp.dest('dist/js/'))
});

// Nunjucks + JSON

gulp.task('nunjucks', function() {
    nunjucksRender.nunjucks.configure(['src/layout/']);
    return gulp.src('src/pages/**/*.+(html|nunjucks)')
    .pipe(data(function() {
      return require('./src/json/data.json')
    }))
    .pipe(nunjucksRender())
    .pipe(gulp.dest('dist'))
    .pipe(browserSync.reload({stream: true}))
});

// Styleguide 

gulp.task('styledown', function() {
    gulp.src('styledown/*.md')
    .pipe(styledown({
      config: 'styledown/config.md',
      filename: 'index.html'
    }))
    .pipe(gulp.dest('dist/styleguide/'));
});

// Copy images to dist

var imgSrc = 'src/images/**';
var imgDest = 'dist/images';
gulp.task('images', function() {
   return gulp.src(imgSrc)
      .pipe(newer(imgDest))
      .pipe(imagemin())
      .pipe(gulp.dest(imgDest)); 
});


// watch

gulp.task('watch', function() {
    gulp.watch('scss/*.scss', ['sass']);
    gulp.watch('js/*.js', [ 'scripts' ]).on('change', browserSync.reload);
    gulp.watch('src/layout/**/*.nunjucks',['nunjucks']);
    gulp.watch('src/pages/*.nunjucks',['nunjucks']);
    gulp.watch('styledown/**/*.md',['styledown']);
    gulp.watch(imgSrc, ['images']);
})

// Tasks

gulp.task('styleguide', ['sass','styledown']);
gulp.task('default', ['php','images','browser-sync','sass','watch','nunjucks']);

