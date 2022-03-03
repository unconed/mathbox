const gulp = require("gulp");
const eslint = require("gulp-eslint");
const concat = require("gulp-concat");
const compiler = require("webpack");
const webpack = require("webpack-stream");
const watch = require("gulp-watch");
const shell = require("gulp-shell");
const jsify = require("./vendor/gulp-jsify");

const webpackConfig = require("./config/webpack.config.js");

const builds = {
  bundle: "build/mathbox.js",
  css: "build/mathbox.css",
};

const css = ["node_modules/shadergraph/build/*.css", "src/**/*.css"];

const glsls = ["src/shaders/glsl/**/*.glsl"];

const files = ["src/**/*.js"];

const source = files.concat(glsls).concat(css);

gulp.task("glsl", function () {
  return gulp
    .src(glsls)
    .pipe(jsify("shaders.js", "module.exports"))
    .pipe(gulp.dest("./build/"));
});

gulp.task("pack", function () {
  return webpack(webpackConfig, compiler, function (_err, _stats) {
    /* Use stats to do more things if needed */
  }).pipe(gulp.dest("build/"));
});

gulp.task("css", function () {
  return gulp.src(css).pipe(concat(builds.css)).pipe(gulp.dest("./"));
});

gulp.task("lint", function () {
  return (
    gulp
      // Define the source files
      .src("src/**/*.js")
      .pipe(eslint({}))
      // Output the results in the console
      .pipe(eslint.format())
  );
});

gulp.task("watch-build-watch", function () {
  watch(source, gulp.series("build"));
});

// Main tasks

const buildTask = gulp.series("glsl", "pack", "css");

gulp.task("default", buildTask);

gulp.task("build", buildTask);

// TODO fix!
gulp.task(
  "docs",
  shell.task(["node src/docs/generate.js > docs/primitives.md"])
);

gulp.task("watch-build", gulp.series("build", "watch-build-watch"));
