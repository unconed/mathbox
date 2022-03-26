const gulp = require("gulp");
const eslint = require("gulp-eslint");
const concat = require("gulp-concat");

const builds = {
  css: "build/mathbox.css",
};

const css = ["node_modules/shadergraph/build/*.css", "src/**/*.css"];

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
