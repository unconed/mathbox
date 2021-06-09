const gulp        = require('gulp');
const uglify      = require('gulp-uglify');
const log         = require('fancy-log');
const concat      = require('gulp-concat');
const rename      = require("gulp-rename");
const browserify  = require('browserify');
const coffeeify   = require('coffeeify');
const watch       = require('gulp-watch');
const shell       = require('gulp-shell');
const jsify       = require('./vendor/gulp-jsify');
const vSource     = require('vinyl-source-stream');
const karma       = require('karma');

const parseConfig = karma.config.parseConfig;
const KarmaServer = karma.Server;

const builds = {
  core:   'build/mathbox-core.js',
  bundle: 'build/mathbox-bundle.js',
  css:    'build/mathbox.css',
};

const products = [
  builds.core,
  builds.bundle
];

const vendor = [
  'vendor/three.js',
  'vendor/threestrap/build/threestrap.js',
  'vendor/threestrap/vendor/renderers/VRRenderer.js',
  'vendor/threestrap/vendor/controls/VRControls.js',
  'vendor/threestrap/vendor/controls/OrbitControls.js',
  'vendor/threestrap/vendor/controls/DeviceOrientationControls.js',
  'vendor/threestrap/vendor/controls/TrackBallControls.js',
];

const css = [
  'vendor/shadergraph/build/*.css',
  'src/**/*.css',
];

const core = [
  '.tmp/index.js',
];

const glsls = [
  'src/shaders/glsl/**/*.glsl'
];

const coffees = [
  'src/**/*.coffee'
];

const source = coffees.concat(glsls).concat(vendor).concat(css);
const bundle = vendor.concat(core);

const test = bundle.concat([
  'test/**/*.spec.coffee',
]).filter(function (path) { return !path.match(/fix\.js/); });

gulp.task('glsl', function () {
  return gulp.src(glsls)
    .pipe(jsify("shaders.js", "module.exports"))
    .pipe(gulp.dest('./build/'));
});

gulp.task('browserify', function () {
  const b = browserify({
    debug: false,
    //detectGlobals: false,
    entries: 'src/index.coffee',
    extensions: ['.coffee'],
    bare: true,
    transform: [coffeeify]
  });

  return b.bundle()
    .pipe(vSource('index.js'))
    .pipe(gulp.dest('./.tmp/'));
});

gulp.task('css', function () {
  return gulp.src(css)
    .pipe(concat(builds.css))
    .pipe(gulp.dest('./'));
});

gulp.task('core', function () {
  return gulp.src(core)
    .pipe(concat(builds.core))
    .pipe(gulp.dest('./'));
});

gulp.task('bundle', function () {
  return gulp.src(bundle)
    .pipe(concat(builds.bundle))
    .pipe(gulp.dest('./'));
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
  parseConfig(
    __dirname + '/karma.conf.js',
    {files: test, singleRun: true},
    { promiseConfig: true, throwErrors: true}
  ).then(
    (karmaConfig) => {
      new KarmaServer(karmaConfig, done).start();
    },
    (rejectReason) => {}
  );
});

gulp.task('watch-karma', function() {
  return gulp.src(test)
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: 'watch',
    }));
});

gulp.task('watch-build-watch', function () {
  watch(source.concat([
    'vendor/shadergraph/src/**/*.coffee'
  ]), gulp.series('build'));
});

// Main tasks

gulp.task('build', gulp.series('glsl', 'browserify', ['core', 'bundle', 'css']));

gulp.task('default', gulp.series('build', 'uglify-js'));

gulp.task('docs', shell.task([
  'coffee src/docs/generate.coffee > docs/primitives.md',
]));

gulp.task('test', gulp.series('build', 'karma'));

gulp.task('watch-build', gulp.series('build', 'watch-build-watch'));

gulp.task('watch', gulp.series('watch-build', 'watch-karma'));
