var gulp = require('gulp');
var gutil = require('gulp-util');
var rename = require("gulp-rename");
var jshint = require('gulp-jshint');
var gulpRollup = require('gulp-rollup');
var sourcemaps = require('gulp-sourcemaps');
var mocha = require('gulp-mocha');
var uglify = require('gulp-uglify');
var del = require('del');
var jsdoc = require("gulp-jsdoc3");
var concat = require("gulp-concat");
var watch = require('gulp-watch');
var batch = require('gulp-batch');
var rollup = require('rollup').rollup;
var string = require('rollup-plugin-string');
var glob = require('glob');
var commonjs = require('rollup-plugin-commonjs');
var nodeResolve = require('rollup-plugin-node-resolve');
var gutil = require('gulp-util');

function glsl () {
  return {
    transform: function( code, id ) {
      if ( !/\.(glsl|frag|vert)$/.test( id ) ) return;
      return 'export default ' + JSON.stringify(
        code
          .replace( /[ \t]*\/\/.*\n/g, '' )
          .replace( /[ \t]*\/\*[\s\S]*?\*\//g, '' )
          .replace( /\n{2,}/g, '\n' )
          .replace( /\t/g, ' ' )
          .replace( / {2,}/g, ' ' )
          .replace( / *\n */g, '\n' )
      ) + ';'
    }
  };
}

gulp.task ('dist-min', ['build-ngl', 'build-lib'], function () {
   return gulp.src ("./build/js/*.js")
    .pipe (concat("ngl.embedded.min.js"))
    .pipe (uglify ().on("error", gutil.log))
    .pipe (gulp.dest ("./dist/"))
   ;
});

gulp.task ('build-lib', function() {
    return gulp.src ("./lib/*.js")
        .pipe (concat('lib.js'))
        .pipe (gulp.dest ("./build/js/"))
    ;
});

gulp.task('build-ngl', function () {
  return rollup({
    entry: 'src/ngl.js',
    plugins: [
      glsl()
    ]
  }).then(function (bundle) {
    return bundle.write({
      format: 'umd',
      moduleName: 'NGL',
      dest: 'build/js/ngl.js'
    });
  });
});

gulp.task('build-test', function () {
  var promises = [];
  var dir = './test/src/';
  var out = './test/build/';
  glob(dir+'**/*.js',function (er, files) {
    files.forEach(function(name){
      var dest = out + name.substring(dir.length);
      promises.push(rollup({
        entry: name,
        plugins: [
          nodeResolve({
            jsnext: true,
            main: true,
            builtins: false,
            browser: true
          }),
          commonjs({
            namedExports: { 'chai': ['assert'] }
          }),
          string({
            extensions: ['.vert', '.frag', '.glsl', '.pdb', '.cif']
          })
        ]
      }).then(function (bundle) {
        return bundle.write({
          format: 'iife',
          dest: dest,
          external: [
            'buffer'
          ],
          globals: {
            buffer: 'Buffer'
          },
        });
      }));
    });
  });
  return Promise.all(promises);
});

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
      "destination": "./build/docs/api/",
      "tutorials": "./doc/tutorials/",
      "package": "./package.json"
    }
  }
  return gulp.src(['./doc/overview.md', './src/**/*.js'], {read: false})
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

gulp.task('test', ['build-test'], function () {
  return gulp.src('test/build/**/*.js', {read: false})
    // gulp-mocha needs filepaths so you can't have any plugins before it
    .pipe(mocha({
      require: 'assert',
      reporter: 'nyan'
    }));
});

gulp.task('concat', function() {
  return gulp.src(['./src/', './lib/file1.js', './lib/file2.js'])
    .pipe(concat('all.js'))
    .pipe(gulp.dest('./build/'));
});

gulp.task('compress', ['build-ngl'], function(){
  return gulp.src(['./build/js/*.js'])
    .pipe(uglify().pipe(uglify().on('error', gutil.log)))
    .pipe(gulp.dest('dist'));
});

gulp.task('build', ['build-ngl']);

gulp.task('watch', function () {
  gulp.start(['build']);
  watch(['./src/**/*.js', './test/src/**/*.js', './src/shader/**/*'], batch(function (events, done) {
    gulp.start(['build'], done);
  }));
});

gulp.task('scripts', ['compress']);

gulp.task('default', ['compress']);
