const gulp = require("gulp");
const concat = require("gulp-concat");

const builds = {
  css: "build/mathbox.css",
};

const css = ["node_modules/shadergraph/build/*.css", "src/**/*.css"];

gulp.task("css", function () {
  return gulp.src(css).pipe(concat(builds.css)).pipe(gulp.dest("./"));
});
