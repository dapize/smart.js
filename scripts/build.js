const fs = require('fs');
const Terser = require('terser');

// paths
const sourceFolder = './src/';
const libsFolder = sourceFolder + 'libs/';
const modulesFolder = sourceFolder + 'modules/';
const eventsFolder = modulesFolder + 'events/';
const utilsFolder = sourceFolder + 'utils/';
const componentFolder = modulesFolder + 'component/';

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
  libsFolder + 'squirrelly.js',
  libsFolder + 'schema.js'
];
const libs = joiner(allLibs);


// Core
const files = [
  // Events
  eventsFolder + 'constructor.js',
  eventsFolder + 'addEventListener.js',
  eventsFolder + 'removeEventListener.js',
  eventsFolder + 'dispatchEvent.js',

  // Base
  sourceFolder + 'main.js',

  // Utils
  utilsFolder + 'attrsCleaner.js',
  utilsFolder + 'forRecur.js',
  utilsFolder + 'getProps.js',
  utilsFolder + 'isComponent.js',
  utilsFolder + 'regError.js',
  utilsFolder + 'toArray.js',

  // Component
  componentFolder + 'notify.js',
  componentFolder + 'search.js',
  componentFolder + 'register.js',
  componentFolder + 'create.js',
  componentFolder + 'build.js',
  componentFolder + 'mount.js',
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
  if (window) window.Smart = Smart;
  if (typeof module === "object" && module.exports) {
    module.exports = Smart;
  } else {
    root.Smart = Smart;
  }
})(this);
`;

const args = process.argv;
if (args.length >= 3) {
  if (args.includes('-dev')) fs.writeFileSync('./dist/smart.dev.js', smartCode, 'utf8');
} else {
  fs.writeFileSync('./dist/smart.js', minifer(smartCode), 'utf8');
}
