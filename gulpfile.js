var gulp = require('gulp');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var coffee = require('gulp-coffee');
var concat = require('gulp-concat');
var rename = require("gulp-rename");
var karma = require('gulp-karma');
var runSequence = require('run-sequence');
var browserify = require('gulp-browserify');

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
  '.tmp/browserify/index.js'
];

var bundle = vendor.concat(core);

var coffees = [
  'src/**/*.coffee'
];

var test = bundle.concat([
  'test/**/*.spec.js',
]);

gulp.task('coffee', function () {
  return gulp.src(coffees)
    .pipe(coffee({bare: true}).on('error', gutil.log))
    .pipe(gulp.dest('.tmp'));
});

gulp.task('browserify', function () {
  return gulp.src('.tmp/index.js', { read: false })
      .pipe(browserify({
        detectGlobals: false,
      }))
      .pipe(gulp.dest('.tmp/browserify/'))
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

gulp.task('test', function() {
  return gulp.src(test)
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: 'run'
    }));
});

gulp.task('default', function (callback) {
  runSequence('coffee', 'browserify', ['core', 'bundle'], 'uglify', callback);
});
