var gulp = require("gulp");
var babel = require("gulp-babel");

gulp.task("bundle", (done) => {
  gulp
    .src("./src/carousel.js")
    .pipe(
      babel({
        presets: ["es2015"],
      })
    )
    .pipe(gulp.dest("./dist/js/"));

  gulp.src("./src/scss/*.scss").pipe(gulp.dest("./dist/scss/"));

  done();
});
