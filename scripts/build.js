const fs = require('fs');
const Terser = require('terser');

// paths
const sourceFolder = './src/';
const libsFolder = sourceFolder + 'libs/';
const modulesFolder = sourceFolder + 'modules/';

// utils
const readFile = filepath => fs.readFileSync(filepath);
const joiner = function (arr) {
  return arr.map(readFile).join('\n') + '\n';
};
const minifer = function (code) {
  const mini = Terser.minify({ 'name.js': code }, {
    output: {
      comments: false
    }
  });
  if (mini.error) console.log(mini.error);
  if (mini.warnings) console.log(mini.warnings);
  return mini.code;
};

// Libs
const allLibs = [
  libsFolder + 'mustache.js',
  libsFolder + 'schema.js',
  libsFolder + 'layouter.js'
];
const libs = joiner(allLibs);

// Core
const files = [
  modulesFolder + 'events.js',
  sourceFolder + 'constructor.js',
  sourceFolder + 'utils.js',
  modulesFolder + 'component.js',
];
if (!fs.existsSync('./dist')) fs.mkdirSync('./dist');

// Smart.js
const content = joiner(files);
const smartCode = `
${libs}
(function (root) {
  'use strict';

${content}

  // Export SmartJS
  if (typeof module === "object" && module.exports) {
    module.exports = Smart;
  } else {
    root.Smart = Smart;
  }
})(this);`
const smartPath = './dist/smart.js';
fs.writeFileSync(smartPath, smartCode, 'utf8');

let smartPathMin = smartPath.split('.');
smartPathMin.pop();
fs.writeFileSync('.' + smartPathMin.join('') + '.min.js', minifer(smartCode), 'utf8');
