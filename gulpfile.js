const { src, watch, dest } = require('gulp');
const browserSync = require('browser-sync').create();
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const size = require('gulp-filesize');
const data = require('gulp-data');
const fm = require('front-matter');
const swig = require('gulp-swig');
const sourcemaps = require('gulp-sourcemaps');


const serve = function () {
   browserSync.init({
    server: {
      baseDir: "./"
    }
  });

  return watch(['./dist/smart.js', './index.js', './index.html'], function(cb) {
    build();
    cb();
  });
};

const template = function (content) {
return `(function (root) {
'use strict';
  ${content}

  // EXPORTING
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      module.exports = Smart;
    }
    exports.Smart = Smart;
  } else {
    root.Smart = Smart;
  }
}(this));`
};

const build = () => {
  return src([
    './src/libs/schema.js',
    './src/utils.js',
    './src/constructor.js',
    './src/modules/Events.js',
    './src/modules/Component.js'
    ])
    .pipe(concat('smart.js'))
    .pipe(data(function(file) {
      const content = fm(String(file._contents));
      file._contents = template(Buffer.from(content.body));
      return file._contents;
    }))
    .pipe(swig())
    .pipe(dest('./dist'))
    .pipe(size());
};

exports.serve = serve;
exports.build = build;