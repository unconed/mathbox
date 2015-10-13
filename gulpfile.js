var gulp       = require('gulp');
var gutil      = require('gulp-util');
var uglify     = require('gulp-uglify');
var concat     = require('gulp-concat');
var rename     = require("gulp-rename");
var karma      = require('gulp-karma');
var sequence   = require('run-sequence');
var browserify = require('gulp-browserify');
var watch      = require('gulp-watch');
var shell      = require('gulp-shell');
var jsify      = require('./vendor/gulp-jsify');
var plumber    = require('gulp-plumber');
var batch      = require('gulp-batch');

var KarmaServer = require('karma').Server;

var builds = {
  core:   'build/mathbox-core.js',
  bundle: 'build/mathbox-bundle.js',
  css:    'build/mathbox.css',
};

var products = [
  builds.core,
  builds.bundle
];

var vendor = [
  'vendor/three.js',
  'vendor/threestrap/build/threestrap.js',
  'vendor/threestrap/vendor/renderers/VRRenderer.js',
  'vendor/threestrap/vendor/controls/VRControls.js',
  'vendor/threestrap/vendor/controls/OrbitControls.js',
  'vendor/threestrap/vendor/controls/DeviceOrientationControls.js',
  'vendor/threestrap/vendor/controls/TrackBallControls.js',
];

var css = [
  'vendor/shadergraph/build/*.css',
  'src/**/*.css',
];

var core = [
  '.tmp/index.js', 
];

var glsls = [
  'src/shaders/glsl/**/*.glsl'
];

var coffees = [
  'src/**/*.coffee'
];

var source = coffees.concat(glsls).concat(vendor).concat(css);
var bundle = vendor.concat(core);

var test = bundle.concat([
  'test/**/*.spec.coffee',
]).filter(function (path) { return !path.match(/fix\.js/); });

gulp.task('glsl', function () {
  return gulp.src(glsls)
    .pipe(jsify("shaders.js", "module.exports"))
    .pipe(gulp.dest('./build/'))
});

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
        extname: ".js",
      }))
      .pipe(gulp.dest('.tmp/'))
});

gulp.task('css', function () {
  return gulp.src(css)
    .pipe(concat(builds.css))
    .pipe(gulp.dest(''));
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

gulp.task('uglify-js', function () {
  return gulp.src(products)
    .pipe(uglify())
    .pipe(rename({
      extname: ".min.js",
    }))
    .pipe(gulp.dest('build'));
});

gulp.task('karma', function (done) {
  new KarmaServer({
    configFile: __dirname + '/karma.conf.js',
    files: test,
    singleRun: true,
  }, done).start();
});

gulp.task('watch-karma', function() {
  return gulp.src(test)
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: 'watch',
    }));
});

gulp.task('watch-build-watch', function () {
  watch(source, function () {
    return gulp.start('build');
  });
});

// Main tasks

gulp.task('build', function (callback) {
  sequence('glsl', 'browserify', ['core', 'bundle', 'css'], callback);
})

gulp.task('default', function (callback) {
  sequence('build', 'uglify-js', callback);
});

gulp.task('docs', shell.task([
  'coffee src/docs/generate.coffee > docs/primitives.md',
]));

gulp.task('test', function (callback) {
  sequence('build', 'karma', callback);
});

gulp.task('watch-build', function (callback) {
  sequence('build', 'watch-build-watch', callback);
})

gulp.task('watch', function (callback) {
  sequence('watch-build', 'watch-karma', callback);
});
