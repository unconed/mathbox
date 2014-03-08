var gulp = require('gulp');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require("gulp-rename");
var karma = require('gulp-karma');
var runSequence = require('run-sequence');
var browserify = require('gulp-browserify');
var watch = require('gulp-watch');

var builds = {
  core: 'build/mathbox-core.js',
  bundle: 'build/mathbox-bundle.js',
};

var products = [
  builds.core,
  builds.bundle
];

var vendor = [
  'vendor/three.js',
  'vendor/threestrap/build/threestrap.js',
];

var core = [
  '.tmp/index.js'
];

var bundle = vendor.concat(core);

var coffees = [
  'src/**/*.coffee'
];

var test = bundle.concat([
  'test/**/*.spec.js',
]);

gulp.task('browserify', function () {
  return gulp.src('src/index.coffee', { read: false })
      .pipe(browserify({
        debug: false,
        //detectGlobals: false,
        bare: true,
        transform: ['coffeeify'],
        extensions: ['.coffee'],
      }))
      .pipe(rename({
        ext: ".js"
      }))
      .pipe(gulp.dest('.tmp/'))
});

gulp.task('core', function () {
  return gulp.src(core)
    .pipe(concat(builds.core))
    .pipe(gulp.dest(''));
});

gulp.task('bundle', function () {
  return gulp.src(bundle)
    .pipe(concat(builds.bundle))
    .pipe(gulp.dest(''));
});

gulp.task('uglify', function () {
  return gulp.src(products)
    .pipe(uglify())
    .pipe(rename({
      ext: ".min.js"
    }))
    .pipe(gulp.dest('build'));
});

gulp.task('karma', function() {
  return gulp.src(test)
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: 'run'
    }));
});

gulp.task('watch', function () {
  return gulp.watch(coffees[0], ['default']);
});

gulp.task('default', function (callback) {
  runSequence('browserify', ['core', 'bundle'], 'uglify', callback);
});

gulp.task('test', function (callback) {
  runSequence('build', 'karma', callback);
});
