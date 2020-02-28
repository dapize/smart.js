
const fs = require('fs');
const Terser = require('terser');

const sourceFolder = './src/';

// Libs
const libsFolder = sourceFolder + 'libs/';
const libsPath = [
  libsFolder + 'layouter.js',
  libsFolder + 'mustache.js',
  libsFolder + 'schema.js'
];

// Core
const core = [
  sourceFolder + 'utils.js',
  sourceFolder + 'constructor.js'
];

// Modules
const modulesFolder = sourceFolder + 'modules/';
const modulesPath = [
  modulesFolder + 'Events.js',
  modulesFolder + 'Component.js',
  modulesFolder + 'Module.js',
];


const readFile = filepath => fs.readFileSync(filepath);
const content = [].concat(libsPath, core, modulesPath)
                .map(readFile)
                .join('\n') + '\n';

if (!fs.existsSync('./dist')) fs.mkdirSync('./dist');

// Smart.js
const smartPath = './dist/smart.js';
const smartCode = `
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
fs.writeFileSync(smartPath, smartCode, 'utf8');

// min
const result = Terser.minify({ 'smart.js': smartCode }, {
  output: {
    comments: false
  }
});
let smartPathMin = smartPath.split('.');
smartPathMin.pop();
fs.writeFileSync('.' + smartPathMin.join('') + '.min.js', result.code, 'utf8');
if (result.error) console.log(result.error);
if (result.warnings) console.log(result.warnings);