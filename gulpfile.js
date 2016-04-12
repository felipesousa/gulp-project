var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    autoprefixer = require('gulp-autoprefixer'),
    minifyCss = require('gulp-minify-css'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync'),
    flatten = require('gulp-flatten'),
    gulpFilter = require('gulp-filter'),
    connect = require('gulp-connect-php'),
    mainBowerFiles = require('gulp-main-bower-files');


var paths = {
    scripts: 'src/scripts/**/*.js',
    scriptsDest: 'www/assets/scripts',
    styles: 'src/styles/**/*.sass',
    stylesDest: 'www/assets/styles',
    images: 'src/images/**/*.*',
    imagesDest: 'www/assets/images',
    pages: 'src/*.php',
    pagesDest: 'www/',
    fontsDest: 'www/assets/fonts'
};

gulp.task('browser-sync', function() {
  browserSync({
    server: {
       baseDir: "./www"
    }
  });
});

gulp.task('connect-sync', function() {
  connect.server({
    port: 8000,
    base: 'www',
    livereload: true
    }, function (){
    browserSync({
      proxy: '127.0.0.1:8000'
    });
  });
});

gulp.task('bs-reload', function () {
  browserSync.reload();
});

gulp.task('styles', function(){
  gulp.src([paths.styles])
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(rename({suffix: '.min'}))
    .pipe(autoprefixer(['last 2 versions', 'ie 8', 'ie 9', '> 1%']))
    .pipe(gulp.dest(paths.stylesDest))
    .pipe(browserSync.reload({stream:true}))
});

gulp.task('scripts', function(){
  return gulp.src([paths.scripts])
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(concat('main.js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest(paths.scriptsDest))
    .pipe(browserSync.reload({stream:true}))
});

gulp.task('pages', function(){
  return gulp.src([paths.pages])
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(gulp.dest(paths.pagesDest))
    .pipe(browserSync.reload({stream:true}))
});

gulp.task('images', function(){
  gulp.src([paths.images])
    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(gulp.dest(paths.imagesDest));
});

gulp.task('libs', function() {

  var jsFilter = gulpFilter('**/*.js', {restore: true});
  var cssFilter = gulpFilter('**/*.css', {restore: true});
  var fontFilter = gulpFilter(['**/*.eot', '**/*.woff', '**/*.svg', '**/*.ttf'],{restore: true});

  return gulp.src('./bower.json')
    .pipe(mainBowerFiles({
        overrides: {
            bootstrap: {
                main: [
                    './dist/js/bootstrap.js',
                    './dist/css/bootstrap.min.css',
                    './dist/fonts/*.*'
                ]
            }
        }
    }))
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))

    // JS
    .pipe(jsFilter)
    .pipe(concat('libs.js'))
    .pipe(rename({suffix: ".min"}))
    .pipe(uglify())
    .pipe(gulp.dest(paths.scriptsDest))
    .pipe(jsFilter.restore)

    //CSS
    .pipe(cssFilter)
    .pipe(minifyCss({compatibility: 'ie8'}))
    .pipe(concat('libs.min.css'))
    .pipe(gulp.dest(paths.stylesDest))
    .pipe(cssFilter.restore)

    // Fonts
    .pipe(fontFilter)
    .pipe(flatten())
    .pipe(gulp.dest(paths.fontsDest));

});

gulp.task('watch',function(){
  gulp.watch(paths.styles, ['styles', 'bs-reload']);
  gulp.watch(paths.scripts, ['scripts', 'bs-reload']);
  gulp.watch(paths.pages, ['pages', 'bs-reload']);
  gulp.watch(paths.images, ['images', 'bs-reload']);
});

gulp.task('default', ['styles','scripts','pages','images', 'watch' ,'connect-sync']);

gulp.task('build', ['styles', 'scripts', 'pages', 'images', 'libs']);
