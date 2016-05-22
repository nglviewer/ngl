var gulp = require('gulp');
var gutil = require('gulp-util');
var rename = require("gulp-rename");
var jshint = require('gulp-jshint');
var gulpRollup = require('gulp-rollup');
var sourcemaps = require('gulp-sourcemaps');
var qunit = require('gulp-qunit');
var uglify = require('gulp-uglify');
var del = require('del');
var jsdoc = require("gulp-jsdoc3");
var concat = require("gulp-concat");

var rollup = require('rollup').rollup;
var commonjs = require('rollup-plugin-commonjs');
var string = require('rollup-plugin-string');
// var nodeResolve = require('rollup-plugin-node-resolve');

gulp.task('build-ngl', function () {
  return rollup({
    entry: 'src/ngl.js',
    plugins: [
      commonjs(),
      string({
        extensions: ['.vert', '.frag', '.glsl']
      })
    ]
  }).then(function (bundle) {
    return bundle.write({
      format: 'umd',
      moduleName: 'NGL',
      dest: 'build/js/ngl.js'
    });
  });
});

gulp.task('build-test', function(){
  return gulp.src('test/src/**/*.js', {read: false})
    .pipe(gulpRollup({
      format: 'iife'
    }))
    .pipe(gulp.dest('test/build'));
});

// gulp.task('build-test', function () {
//   gulpRollup({
//     entry: 'test/src/**/*.js',
//     plugins: [
//       commonjs(),
//       string({
//         extensions: ['.vert', '.frag', '.glsl']
//       })
//     ]
//   }).then(function (bundle) {
//     return bundle.write({
//       format: 'iife',
//       dest: 'test/build/'
//     });
//   });
// });

gulp.task('doc', function() {
  var config = {
    "templates": {
      "cleverLinks": false,
      "monospaceLinks": false,
      "default": {
        "outputSourceFiles": true
      },
      "path": "ink-bootstrap",
      "theme": "spacelab",
      "navType": "vertical",
      "linenums": true,
      "dateFormat": "MMMM Do YYYY, h:mm:ss a"
    },
    "opts": {
      "destination": "./docs/api/"
    }
  }
  return gulp.src(['./docs/api-overview.md', './src/*.js'], {read: false})
    .pipe(jsdoc(config));
});

gulp.task('clean', function() {
  del(['dist', 'build']);
});

gulp.task('lint', function() {
  return gulp.src('./src/**/*.js')
    .pipe(jshint({esversion: 6}))
    .pipe(jshint.reporter('default'));
});

gulp.task('test', ['build'], function() {
  return gulp.src('./test/unittests.html')
    .pipe(qunit());
});

gulp.task('concat', function() {
  return gulp.src(['./src/', './lib/file1.js', './lib/file2.js'])
    .pipe(concat('all.js'))
    .pipe(gulp.dest('./build/'));
});

gulp.task('compress', ['build-ngl'], function(){
  return gulp.src(['./build/js/*.js'])
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('build', ['build-ngl']);

gulp.task('scripts', ['compress']);

gulp.task('default', ['compress']);
