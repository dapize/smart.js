
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Sqrl = {}));
}(this, (function (exports) { 'use strict';

  function setPrototypeOf(obj, proto) {
      if (Object.setPrototypeOf) {
          Object.setPrototypeOf(obj, proto);
      }
      else {
          obj.__proto__ = proto;
      }
  }
  function SqrlErr(message) {
      var err = new Error(message);
      setPrototypeOf(err, SqrlErr.prototype);
      return err;
  }
  SqrlErr.prototype = Object.create(Error.prototype, {
      name: { value: 'Squirrelly Error', enumerable: false }
  });
  // TODO: Class transpilation adds a lot to the bundle size
  function ParseErr(message, str, indx) {
      var whitespace = str.slice(0, indx).split(/\n/);
      var lineNo = whitespace.length;
      var colNo = whitespace[lineNo - 1].length + 1;
      message +=
          ' at line ' +
              lineNo +
              ' col ' +
              colNo +
              ':\n\n' +
              '  ' +
              str.split(/\n/)[lineNo - 1] +
              '\n' +
              '  ' +
              Array(colNo).join(' ') +
              '^';
      throw SqrlErr(message);
  }

  // TODO: allow '-' to trim up until newline. Use [^\S\n\r] instead of \s
  // TODO: only include trimLeft polyfill if not in ES6
  /* END TYPES */
  var promiseImpl = new Function('return this')().Promise;
  var asyncFunc = false;
  try {
      asyncFunc = new Function('return (async function(){}).constructor')();
  }
  catch (e) {
      // We shouldn't actually ever have any other errors, but...
      if (!(e instanceof SyntaxError)) {
          throw e;
      }
  }
  function hasOwnProp(obj, prop) {
      return Object.prototype.hasOwnProperty.call(obj, prop);
  }
  function copyProps(toObj, fromObj, notConfig) {
      for (var key in fromObj) {
          if (hasOwnProp(fromObj, key)) {
              if (fromObj[key] != null &&
                  typeof fromObj[key] == 'object' &&
                  (key === 'storage' || key === 'prefixes') &&
                  !notConfig // not called from Cache.load
              ) {
                  // plugins or storage
                  // Note: this doesn't merge from initial config!
                  // Deep clone instead of assigning
                  // TODO: run checks on this
                  toObj[key] = copyProps(/*toObj[key] ||*/ {}, fromObj[key]);
              }
              else {
                  toObj[key] = fromObj[key];
              }
          }
      }
      return toObj;
  }
  function trimWS(str, env, wsLeft, wsRight) {
      var leftTrim;
      var rightTrim;
      if (typeof env.autoTrim === 'string') {
          leftTrim = rightTrim = env.autoTrim;
          // Don't need to check if env.autoTrim is false
          // Because leftTrim, rightTrim are initialized as falsy
      }
      else if (Array.isArray(env.autoTrim)) {
          // kinda confusing
          // but _}} will trim the left side of the following string
          leftTrim = env.autoTrim[1];
          rightTrim = env.autoTrim[0];
      }
      if (wsLeft || wsLeft === false) {
          leftTrim = wsLeft;
      }
      if (wsRight || wsRight === false) {
          rightTrim = wsRight;
      }
      if (leftTrim === 'slurp' && rightTrim === 'slurp') {
          return str.trim();
      }
      if (leftTrim === '_' || leftTrim === 'slurp') {
          // console.log('trimming left' + leftTrim)
          // full slurp
          // eslint-disable-next-line no-extra-boolean-cast
          if (!!String.prototype.trimLeft) {
              str = str.trimLeft();
          }
          else {
              str = str.replace(/^[\s\uFEFF\xA0]+/, '');
          }
      }
      else if (leftTrim === '-' || leftTrim === 'nl') {
          // console.log('trimming left nl' + leftTrim)
          // nl trim
          str = str.replace(/^(?:\n|\r|\r\n)/, '');
      }
      if (rightTrim === '_' || rightTrim === 'slurp') {
          // console.log('trimming right' + rightTrim)
          // full slurp
          // eslint-disable-next-line no-extra-boolean-cast
          if (!!String.prototype.trimRight) {
              str = str.trimRight();
          }
          else {
              str = str.replace(/[\s\uFEFF\xA0]+$/, '');
          }
      }
      else if (rightTrim === '-' || rightTrim === 'nl') {
          // console.log('trimming right nl' + rightTrim)
          // nl trim
          str = str.replace(/(?:\n|\r|\r\n)$/, ''); // TODO: make sure this gets \r\n
      }
      return str;
  }

  /* END TYPES */
  var asyncRegExp = /^async +/;
  var templateLitReg = /`(?:\\[\s\S]|\${(?:[^{}]|{(?:[^{}]|{[^}]*})*})*}|(?!\${)[^\\`])*`/g;
  var singleQuoteReg = /'(?:\\[\s\w"'\\`]|[^\n\r'\\])*?'/g;
  var doubleQuoteReg = /"(?:\\[\s\w"'\\`]|[^\n\r"\\])*?"/g;
  var specialCharsReg = /[.*+\-?^${}()|[\]\\]/g;
  function escapeRegExp(string) {
      // From MDN
      return specialCharsReg.test(string)
          ? string.replace(specialCharsReg, '\\$&') // $& means the whole matched string
          : string;
  }
  function parse(str, env) {
      /* Adding for EJS compatibility */
      if (env.rmWhitespace) {
          // Code taken directly from EJS
          // Have to use two separate replaces here as `^` and `$` operators don't
          // work well with `\r` and empty lines don't work well with the `m` flag.
          // Essentially, this replaces the whitespace at the beginning and end of
          // each line and removes multiple newlines.
          str = str.replace(/[\r\n]+/g, '\n').replace(/^\s+|\s+$/gm, '');
      }
      /* End rmWhitespace option */
      templateLitReg.lastIndex = 0;
      singleQuoteReg.lastIndex = 0;
      doubleQuoteReg.lastIndex = 0;
      var envPrefixes = env.prefixes;
      var prefixes = [
          envPrefixes.h,
          envPrefixes.b,
          envPrefixes.i,
          envPrefixes.r,
          envPrefixes.c,
          envPrefixes.e
      ].reduce(function (accumulator, prefix) {
          if (accumulator && prefix) {
              return accumulator + '|' + escapeRegExp(prefix);
          }
          else if (prefix) {
              // accumulator is empty
              return escapeRegExp(prefix);
          }
          else {
              // prefix and accumulator are both empty strings
              return accumulator;
          }
      }, '');
      var parseCloseReg = new RegExp('([|()]|=>)|' + // powerchars
          '(\'|"|`|\\/\\*)|\\s*((\\/)?(-|_)?' + // comments, strings
          escapeRegExp(env.tags[1]) +
          ')', 'g');
      var tagOpenReg = new RegExp('([^]*?)' + escapeRegExp(env.tags[0]) + '(-|_)?\\s*(' + prefixes + ')?\\s*', 'g');
      var startInd = 0;
      var trimNextLeftWs = false;
      function parseTag(tagOpenIndex, currentType) {
          var currentObj = { f: [] };
          var numParens = 0;
          var currentAttribute = 'c'; // default - Valid values: 'c'=content, 'f'=filter, 'fp'=filter params, 'p'=param, 'n'=name
          if (currentType === 'h' || currentType === 'b' || currentType === 'c') {
              currentAttribute = 'n';
          }
          else if (currentType === 'r') {
              currentObj.raw = true;
              currentType = 'i';
          }
          function addAttrValue(indx) {
              var valUnprocessed = str.slice(startInd, indx);
              // console.log(valUnprocessed)
              var val = valUnprocessed.trim();
              if (currentAttribute === 'f') {
                  if (val === 'safe') {
                      currentObj.raw = true;
                  }
                  else {
                      if (env.async && asyncRegExp.test(val)) {
                          val = val.replace(asyncRegExp, '');
                          currentObj.f.push([val, '', true]);
                      }
                      else {
                          currentObj.f.push([val, '']);
                      }
                  }
              }
              else if (currentAttribute === 'fp') {
                  currentObj.f[currentObj.f.length - 1][1] += val;
              }
              else if (currentAttribute === 'err') {
                  if (val) {
                      var found = valUnprocessed.search(/\S/);
                      ParseErr('invalid syntax', str, startInd + found);
                  }
              }
              else {
                  // if (currentObj[currentAttribute]) { // TODO make sure no errs
                  //   currentObj[currentAttribute] += val
                  // } else {
                  currentObj[currentAttribute] = val;
                  // }
              }
              startInd = indx + 1;
          }
          parseCloseReg.lastIndex = startInd;
          var m;
          // tslint:disable-next-line:no-conditional-assignment
          while ((m = parseCloseReg.exec(str)) !== null) {
              var char = m[1];
              var punctuator = m[2];
              var tagClose = m[3];
              var slash = m[4];
              var wsControl = m[5];
              var i = m.index;
              if (char) {
                  // Power character
                  if (char === '(') {
                      if (numParens === 0) {
                          if (currentAttribute === 'n') {
                              addAttrValue(i);
                              currentAttribute = 'p';
                          }
                          else if (currentAttribute === 'f') {
                              addAttrValue(i);
                              currentAttribute = 'fp';
                          }
                      }
                      numParens++;
                  }
                  else if (char === ')') {
                      numParens--;
                      if (numParens === 0 && currentAttribute !== 'c') {
                          // Then it's closing a filter, block, or helper
                          addAttrValue(i);
                          currentAttribute = 'err'; // Reset the current attribute
                      }
                  }
                  else if (numParens === 0 && char === '|') {
                      addAttrValue(i); // this should actually always be whitespace or empty
                      currentAttribute = 'f';
                  }
                  else if (char === '=>') {
                      addAttrValue(i);
                      startInd += 1; // this is 2 chars
                      currentAttribute = 'res';
                  }
              }
              else if (punctuator) {
                  if (punctuator === '/*') {
                      var commentCloseInd = str.indexOf('*/', parseCloseReg.lastIndex);
                      if (commentCloseInd === -1) {
                          ParseErr('unclosed comment', str, m.index);
                      }
                      parseCloseReg.lastIndex = commentCloseInd + 2; // since */ is 2 characters, and we're using indexOf rather than a RegExp
                  }
                  else if (punctuator === "'") {
                      singleQuoteReg.lastIndex = m.index;
                      var singleQuoteMatch = singleQuoteReg.exec(str);
                      if (singleQuoteMatch) {
                          parseCloseReg.lastIndex = singleQuoteReg.lastIndex;
                      }
                      else {
                          ParseErr('unclosed string', str, m.index);
                      }
                  }
                  else if (punctuator === '"') {
                      doubleQuoteReg.lastIndex = m.index;
                      var doubleQuoteMatch = doubleQuoteReg.exec(str);
                      if (doubleQuoteMatch) {
                          parseCloseReg.lastIndex = doubleQuoteReg.lastIndex;
                      }
                      else {
                          ParseErr('unclosed string', str, m.index);
                      }
                  }
                  else if (punctuator === '`') {
                      templateLitReg.lastIndex = m.index;
                      var templateLitMatch = templateLitReg.exec(str);
                      if (templateLitMatch) {
                          parseCloseReg.lastIndex = templateLitReg.lastIndex;
                      }
                      else {
                          ParseErr('unclosed string', str, m.index);
                      }
                  }
              }
              else if (tagClose) {
                  addAttrValue(i);
                  startInd = i + m[0].length;
                  tagOpenReg.lastIndex = startInd;
                  // console.log('tagClose: ' + startInd)
                  trimNextLeftWs = wsControl;
                  if (slash && currentType === 'h') {
                      currentType = 's';
                  } // TODO throw err
                  currentObj.t = currentType;
                  return currentObj;
              }
          }
          ParseErr('unclosed tag', str, tagOpenIndex);
          return currentObj; // To prevent TypeScript from erroring
      }
      function parseContext(parentObj, firstParse) {
          parentObj.b = []; // assume there will be blocks // TODO: perf optimize this
          parentObj.d = [];
          var lastBlock = false;
          var buffer = [];
          function pushString(strng, shouldTrimRightOfString) {
              if (strng) {
                  // if string is truthy it must be of type 'string'
                  // TODO: benchmark replace( /(\\|')/g, '\\$1')
                  strng = trimWS(strng, env, trimNextLeftWs, // this will only be false on the first str, the next ones will be null or undefined
                  shouldTrimRightOfString);
                  if (strng) {
                      // replace \ with \\, ' with \'
                      strng = strng.replace(/\\|'/g, '\\$&').replace(/\r\n|\n|\r/g, '\\n');
                      // we're going to convert all CRLF to LF so it doesn't take more than one replace
                      buffer.push(strng);
                  }
              }
          }
          // Random TODO: parentObj.b doesn't need to have t: #
          var tagOpenMatch;
          // tslint:disable-next-line:no-conditional-assignment
          while ((tagOpenMatch = tagOpenReg.exec(str)) !== null) {
              var precedingString = tagOpenMatch[1];
              var shouldTrimRightPrecedingString = tagOpenMatch[2];
              var prefix = tagOpenMatch[3] || '';
              var prefixType;
              for (var key in envPrefixes) {
                  if (envPrefixes[key] === prefix) {
                      prefixType = key;
                      break;
                  }
              }
              pushString(precedingString, shouldTrimRightPrecedingString);
              startInd = tagOpenMatch.index + tagOpenMatch[0].length;
              if (!prefixType) {
                  ParseErr('unrecognized tag type: ' + prefix, str, startInd);
              }
              var currentObj = parseTag(tagOpenMatch.index, prefixType);
              // ===== NOW ADD THE OBJECT TO OUR BUFFER =====
              var currentType = currentObj.t;
              if (currentType === 'h') {
                  var hName = currentObj.n || '';
                  if (env.async && asyncRegExp.test(hName)) {
                      currentObj.a = true;
                      currentObj.n = hName.replace(asyncRegExp, '');
                  }
                  currentObj = parseContext(currentObj); // currentObj is the parent object
                  buffer.push(currentObj);
              }
              else if (currentType === 'c') {
                  // tag close
                  if (parentObj.n === currentObj.n) {
                      if (lastBlock) {
                          // If there's a previous block
                          lastBlock.d = buffer;
                          parentObj.b.push(lastBlock);
                      }
                      else {
                          parentObj.d = buffer;
                      }
                      // console.log('parentObj: ' + JSON.stringify(parentObj))
                      return parentObj;
                  }
                  else {
                      ParseErr("Helper start and end don't match", str, tagOpenMatch.index + tagOpenMatch[0].length);
                  }
              }
              else if (currentType === 'b') {
                  // block
                  // TODO: make sure async stuff inside blocks are recognized
                  if (lastBlock) {
                      // If there's a previous block
                      lastBlock.d = buffer;
                      parentObj.b.push(lastBlock);
                  }
                  else {
                      parentObj.d = buffer;
                  }
                  var blockName = currentObj.n || '';
                  if (env.async && asyncRegExp.test(blockName)) {
                      currentObj.a = true;
                      currentObj.n = blockName.replace(asyncRegExp, '');
                  }
                  lastBlock = currentObj; // Set the 'lastBlock' object to the value of the current block
                  buffer = [];
              }
              else if (currentType === 's') {
                  var selfClosingHName = currentObj.n || '';
                  if (env.async && asyncRegExp.test(selfClosingHName)) {
                      currentObj.a = true;
                      currentObj.n = selfClosingHName.replace(asyncRegExp, '');
                  }
                  buffer.push(currentObj);
              }
              else {
                  buffer.push(currentObj);
              }
              // ===== DONE ADDING OBJECT TO BUFFER =====
          }
          if (firstParse) {
              pushString(str.slice(startInd, str.length), false);
              parentObj.d = buffer;
          }
          else {
              throw SqrlErr('unclosed helper "' + parentObj.n + '"');
              // It should have returned by now
          }
          return parentObj;
      }
      var parseResult = parseContext({ f: [] }, true);
      // console.log(JSON.stringify(parseResult))
      if (env.plugins) {
          for (var i = 0; i < env.plugins.length; i++) {
              var plugin = env.plugins[i];
              if (plugin.processAST) {
                  parseResult.d = plugin.processAST(parseResult.d, env);
              }
          }
      }
      return parseResult.d; // Parse the very outside context
  }

  // import SqrlErr from './err'
  /* END TYPES */
  function compileToString(str, env) {
      var buffer = parse(str, env);
      var res = "var tR='';" +
          (env.useWith ? 'with(' + env.varName + '||{}){' : '') +
          compileScope(buffer, env) +
          'if(cb){cb(null,tR)} return tR' +
          (env.useWith ? '}' : '');
      if (env.plugins) {
          for (var i = 0; i < env.plugins.length; i++) {
              var plugin = env.plugins[i];
              if (plugin.processFnString) {
                  res = plugin.processFnString(res, env);
              }
          }
      }
      return res;
      // TODO: is `return cb()` necessary, or could we just do `cb()`
  }
  function filter(str, filters) {
      for (var i = 0; i < filters.length; i++) {
          var name = filters[i][0];
          var params = filters[i][1];
          var isFilterAsync = filters[i][2];
          // if (isFilterAsync && !env.async) {
          //   throw SqrlErr("Async filter '" + name + "' in non-async env")
          // }
          // Let the JS compiler do this, compile() will catch it
          str = (isFilterAsync ? 'await ' : '') + "c.l('F','" + name + "')(" + str;
          if (params) {
              str += ',' + params;
          }
          str += ')';
      }
      return str;
  }
  // TODO: Use type intersections for TemplateObject, etc.
  // so I don't have to make properties mandatory
  function compileHelper(env, res, descendants, params, isAsync, name) {
      var ret = '{exec:' +
          (isAsync ? 'async ' : '') +
          compileScopeIntoFunction(descendants, res, env) +
          ',params:[' +
          params +
          ']';
      if (name) {
          ret += ",name:'" + name + "'";
      }
      if (isAsync) {
          ret += ',async:true';
      }
      ret += '}';
      return ret;
  }
  function compileBlocks(blocks, env) {
      var ret = '[';
      for (var i = 0; i < blocks.length; i++) {
          var block = blocks[i];
          ret += compileHelper(env, block.res || '', block.d, block.p || '', block.a, block.n);
          if (i < blocks.length) {
              ret += ',';
          }
      }
      ret += ']';
      return ret;
  }
  function compileScopeIntoFunction(buff, res, env) {
      return 'function(' + res + "){var tR='';" + compileScope(buff, env) + 'return tR}';
  }
  function compileScope(buff, env) {
      var i = 0;
      var buffLength = buff.length;
      var returnStr = '';
      for (i; i < buffLength; i++) {
          var currentBlock = buff[i];
          if (typeof currentBlock === 'string') {
              var str = currentBlock;
              // we know string exists
              returnStr += "tR+='" + str + "';";
          }
          else {
              var type = currentBlock.t; // h, s, e, i
              var content = currentBlock.c || '';
              var filters = currentBlock.f;
              var name = currentBlock.n || '';
              var params = currentBlock.p || '';
              var res = currentBlock.res || '';
              var blocks = currentBlock.b;
              var isAsync = !!currentBlock.a; // !! is to booleanize it
              // if (isAsync && !env.async) {
              //   throw SqrlErr("Async block or helper '" + name + "' in non-async env")
              // }
              // Let compiler do this
              if (type === 'i') {
                  if (env.defaultFilter) {
                      content = "c.l('F','" + env.defaultFilter + "')(" + content + ')';
                  }
                  var filtered = filter(content, filters);
                  if (!currentBlock.raw && env.autoEscape) {
                      filtered = "c.l('F','e')(" + filtered + ')';
                  }
                  returnStr += 'tR+=' + filtered + ';';
                  // reference
              }
              else if (type === 'h') {
                  // helper
                  if (env.storage.nativeHelpers.get(name)) {
                      returnStr += env.storage.nativeHelpers.get(name)(currentBlock, env);
                  }
                  else {
                      var helperReturn = (isAsync ? 'await ' : '') +
                          "c.l('H','" +
                          name +
                          "')(" +
                          compileHelper(env, res, currentBlock.d, params, isAsync);
                      if (blocks) {
                          helperReturn += ',' + compileBlocks(blocks, env);
                      }
                      else {
                          helperReturn += ',[]';
                      }
                      helperReturn += ',c)';
                      returnStr += 'tR+=' + filter(helperReturn, filters) + ';';
                  }
              }
              else if (type === 's') {
                  // self-closing helper
                  returnStr +=
                      'tR+=' +
                          filter((isAsync ? 'await ' : '') + "c.l('H','" + name + "')({params:[" + params + ']},[],c)', filters) +
                          ';';
              }
              else if (type === 'e') {
                  // execute
                  returnStr += content + '\n';
              }
          }
      }
      return returnStr;
  }

  /* END TYPES */
  var Cacher = /** @class */ (function () {
      function Cacher(cache) {
          this.cache = cache;
      }
      Cacher.prototype.define = function (key, val) {
          this.cache[key] = val;
      };
      Cacher.prototype.get = function (key) {
          // string | array.
          // TODO: allow array of keys to look down
          // TODO: create plugin to allow referencing helpers, filters with dot notation
          return this.cache[key];
      };
      Cacher.prototype.remove = function (key) {
          delete this.cache[key];
      };
      Cacher.prototype.reset = function () {
          this.cache = {};
      };
      Cacher.prototype.load = function (cacheObj) {
          // TODO: this will err with deep objects and `storage` or `plugins` keys.
          // Update Feb 26: EDITED so it shouldn't err
          copyProps(this.cache, cacheObj, true);
      };
      return Cacher;
  }());

  function errWithBlocksOrFilters(name, blocks, // false means don't check
  filters, native) {
      if (blocks && blocks.length > 0) {
          throw SqrlErr((native ? 'Native' : '') + "Helper '" + name + "' doesn't accept blocks");
      }
      if (filters && filters.length > 0) {
          throw SqrlErr((native ? 'Native' : '') + "Helper '" + name + "' doesn't accept filters");
      }
  }
  /* ASYNC LOOP FNs */
  function asyncArrLoop(arr, index, fn, res, cb) {
      fn(arr[index], index).then(function (val) {
          res += val;
          if (index === arr.length - 1) {
              cb(res);
          }
          else {
              asyncArrLoop(arr, index + 1, fn, res, cb);
          }
      });
  }
  function asyncObjLoop(obj, keys, index, fn, res, cb) {
      fn(keys[index], obj[keys[index]]).then(function (val) {
          res += val;
          if (index === keys.length - 1) {
              cb(res);
          }
          else {
              asyncObjLoop(obj, keys, index + 1, fn, res, cb);
          }
      });
  }
  var escMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
  };
  function replaceChar(s) {
      return escMap[s];
  }
  function XMLEscape(str) {
      // To deal with XSS. Based on Escape implementations of Mustache.JS and Marko, then customized.
      var newStr = String(str);
      if (/[&<>"']/.test(newStr)) {
          return newStr.replace(/[&<>"']/g, replaceChar);
      }
      else {
          return newStr;
      }
  }

  /* END TYPES */
  var templates = new Cacher({});
  /* ASYNC LOOP FNs */
  var helpers = new Cacher({
      each: function (content, blocks) {
          var res = '';
          var arr = content.params[0];
          errWithBlocksOrFilters('each', blocks, false);
          if (content.async) {
              return new Promise(function (resolve) {
                  asyncArrLoop(arr, 0, content.exec, res, resolve);
              });
          }
          else {
              for (var i = 0; i < arr.length; i++) {
                  res += content.exec(arr[i], i);
              }
              return res;
          }
      },
      foreach: function (content, blocks) {
          var obj = content.params[0];
          errWithBlocksOrFilters('foreach', blocks, false);
          if (content.async) {
              return new Promise(function (resolve) {
                  asyncObjLoop(obj, Object.keys(obj), 0, content.exec, '', resolve);
              });
          }
          else {
              var res = '';
              for (var key in obj) {
                  if (!hasOwnProp(obj, key))
                      continue;
                  res += content.exec(key, obj[key]); // todo: check on order
              }
              return res;
          }
      },
      include: function (content, blocks, config) {
          errWithBlocksOrFilters('include', blocks, false);
          var template = config.storage.templates.get(content.params[0]);
          if (!template) {
              throw SqrlErr('Could not fetch template "' + content.params[0] + '"');
          }
          return template(content.params[1], config);
      },
      extends: function (content, blocks, config) {
          var data = content.params[1] || {};
          data.content = content.exec();
          for (var i = 0; i < blocks.length; i++) {
              var currentBlock = blocks[i];
              data[currentBlock.name] = currentBlock.exec();
          }
          var template = config.storage.templates.get(content.params[0]);
          if (!template) {
              throw SqrlErr('Could not fetch template "' + content.params[0] + '"');
          }
          return template(data, config);
      },
      useScope: function (content, blocks) {
          errWithBlocksOrFilters('useScope', blocks, false);
          return content.exec(content.params[0]);
      }
  });
  var nativeHelpers = new Cacher({
      if: function (buffer, env) {
          errWithBlocksOrFilters('if', false, buffer.f, true);
          var returnStr = 'if(' + buffer.p + '){' + compileScope(buffer.d, env) + '}';
          if (buffer.b) {
              for (var i = 0; i < buffer.b.length; i++) {
                  var currentBlock = buffer.b[i];
                  if (currentBlock.n === 'else') {
                      returnStr += 'else{' + compileScope(currentBlock.d, env) + '}';
                  }
                  else if (currentBlock.n === 'elif') {
                      returnStr += 'else if(' + currentBlock.p + '){' + compileScope(currentBlock.d, env) + '}';
                  }
              }
          }
          return returnStr;
      },
      try: function (buffer, env) {
          errWithBlocksOrFilters('try', false, buffer.f, true);
          if (!buffer.b || buffer.b.length !== 1 || buffer.b[0].n !== 'catch') {
              throw SqrlErr("native helper 'try' only accepts 1 block, 'catch'");
          }
          var returnStr = 'try{' + compileScope(buffer.d, env) + '}';
          var currentBlock = buffer.b[0];
          returnStr +=
              'catch' +
                  (currentBlock.res ? '(' + currentBlock.res + ')' : '') +
                  '{' +
                  compileScope(currentBlock.d, env) +
                  '}';
          return returnStr;
      },
      block: function (buffer, env) {
          errWithBlocksOrFilters('block', buffer.b, buffer.f, true);
          var returnStr = 'if(!' +
              env.varName +
              '[' +
              buffer.p +
              ']){tR+=(' +
              compileScopeIntoFunction(buffer.d, '', env) +
              ')()}else{tR+=' +
              env.varName +
              '[' +
              buffer.p +
              ']}';
          return returnStr;
      }
  });
  var filters = new Cacher({ e: XMLEscape });

  /* END TYPES */
  var defaultConfig = {
      varName: 'it',
      autoTrim: [false, 'nl'],
      autoEscape: true,
      defaultFilter: false,
      tags: ['{{', '}}'],
      l: function (container, name) {
          if (container === 'H') {
              var hRet = this.storage.helpers.get(name);
              if (hRet) {
                  return hRet;
              }
              else {
                  throw SqrlErr("Can't find helper '" + name + "'");
              }
          }
          else if (container === 'F') {
              var fRet = this.storage.filters.get(name);
              if (fRet) {
                  return fRet;
              }
              else {
                  throw SqrlErr("Can't find filter '" + name + "'");
              }
          }
      },
      async: false,
      storage: {
          helpers: helpers,
          nativeHelpers: nativeHelpers,
          filters: filters,
          templates: templates
      },
      prefixes: {
          h: '@',
          b: '#',
          i: '',
          r: '*',
          c: '/',
          e: '!'
      },
      cache: false,
      plugins: [],
      useWith: false
  };
  defaultConfig.l.bind(defaultConfig);
  function getConfig(override, baseConfig) {
      // TODO: run more tests on this
      var res = {}; // Linked
      copyProps(res, defaultConfig); // Creates deep clone of res, 1 layer deep
      if (baseConfig) {
          copyProps(res, baseConfig);
      }
      if (override) {
          copyProps(res, override);
      }
      res.l.bind(res);
      return res;
  }

  /* END TYPES */
  function compile(str, env) {
      var options = getConfig(env || {});
      var ctor = Function; // constructor
      /* ASYNC HANDLING */
      // The below code is modified from mde/ejs. All credit should go to them.
      if (options.async) {
          // Have to use generated function for this, since in envs without support,
          // it breaks in parsing
          if (asyncFunc) {
              ctor = asyncFunc;
          }
          else {
              throw SqrlErr("This environment doesn't support async/await");
          }
      }
      /* END ASYNC HANDLING */
      try {
          return new ctor(options.varName, 'c', // SqrlConfig
          'cb', // optional callback
          compileToString(str, options)); // eslint-disable-line no-new-func
      }
      catch (e) {
          if (e instanceof SyntaxError) {
              throw SqrlErr('Bad template syntax\n\n' +
                  e.message +
                  '\n' +
                  Array(e.message.length + 1).join('=') +
                  '\n' +
                  compileToString(str, options));
          }
          else {
              throw e;
          }
      }
  }

  /* END TYPES */
  function handleCache(template, options) {
      var templateFunc;
      if (options.cache && options.name && options.storage.templates.get(options.name)) {
          return options.storage.templates.get(options.name);
      }
      if (typeof template === 'function') {
          templateFunc = template;
      }
      else {
          templateFunc = compile(template, options);
      }
      if (options.cache && options.name) {
          options.storage.templates.define(options.name, templateFunc);
      }
      return templateFunc;
  }
  function render(template, data, env, cb) {
      var options = getConfig(env || {});
      if (options.async) {
          var result;
          if (!cb) {
              // No callback, try returning a promise
              if (typeof promiseImpl === 'function') {
                  return new promiseImpl(function (resolve, reject) {
                      try {
                          result = handleCache(template, options)(data, options);
                          resolve(result);
                      }
                      catch (err) {
                          reject(err);
                      }
                  });
              }
              else {
                  throw SqrlErr("Please provide a callback function, this env doesn't support Promises");
              }
          }
          else {
              try {
                  handleCache(template, options)(data, options, cb);
              }
              catch (err) {
                  return cb(err);
              }
          }
      }
      else {
          return handleCache(template, options)(data, options);
      }
  }

  exports.compile = compile;
  exports.compileScope = compileScope;
  exports.compileScopeIntoFunction = compileScopeIntoFunction;
  exports.compileToString = compileToString;
  exports.defaultConfig = defaultConfig;
  exports.filters = filters;
  exports.getConfig = getConfig;
  exports.helpers = helpers;
  exports.nativeHelpers = nativeHelpers;
  exports.parse = parse;
  exports.render = render;
  exports.templates = templates;

  Object.defineProperty(exports, '__esModule', { value: true });

})));

(function (root) {
  'use strict';
    /**
   * Utilidades varias
   * @namespace uSchema
   * @property {Array} typesAccepted Lista de tipos aceptados para ser procesados.
   */
  const uSchema = {
    /**
     * Setea los valores por defecto del constructor
     * @param {Function} _this Constructor
     */
    initValues: function (_this) {
      _this.missings = {
        required: [],
        optional: []
      };
      _this.different = {};
      _this.errors = [];
      _this.compiled = {};
    },

    /**
     * Verifica si lo pasado es un objeto literal o no
     * @memberof uSchema
     * @param {Object} obj Objeto a ser verificado
     * @returns {Boolean}
     * @example
     * uSchema.objLiteral({});
     * => true
     * @example
     * uSchema.objLiteral('obj');
     * => false
     */
    objLiteral: function (obj) {
      return Object.prototype.toString.call(obj).toLowerCase() === '[object object]'
    },

    typesAccepted: ['string', 'number', 'boolean', 'array', 'object'],

    /**
     * Devuelve el tipo de dato de una propiedad en un ojeto
     * @memberof uSchema
     * @namespace getType
     */
    getType: {
      /**
       * Devuelve el tipo de dato de una propiedad de un objeto comun y corriente.
       * @memberof uSchema.getType
       * @param {*} value Valor de la propiedad del objeto a obtener su tipo.
       * @returns {String} 'string', 'number', 'boolean', 'array' u 'object
       */
      obj: function (value) {
        return Array.isArray(value) ? 'array' : typeof value;
      },

      /**
       * Devuelve el tipo de dato de una propiedad de un objeto schema.
       * @memberof uSchema.getType
       * @param {*} value Valor de la propiedad del objeto a obtener su tipo.
       * @returns {String} 'string', 'number', 'boolean', 'array' u 'object
       */
      schema: function (value) {
        let retorno;
        if (Array.isArray(value)) {
          retorno = 'mixed';
        } else {
          if (uSchema.objLiteral(value)) {
            retorno = value.hasOwnProperty('type') ? this.schema(value.type) : 'object';
          } else {
            const typeOfVal = typeof value;
            if (typeOfVal === 'string') {
              retorno = (uSchema.typesAccepted.indexOf(value) !== -1) ? value : typeOfVal;
            } else {
              retorno = typeOfVal
            }
          }
        }
        return retorno;
      }
    },

    /**
     * Registra incidentes dentro de un objeto, para que sirva de log o para el compilado.
     * @memberof uSchema
     * @param {Array|Object} target Lista y objeto destino.
     * @param {Object|String} data Objeto que contendrá información de la propiedad faltante o tambien el string que será agregado al array.
     * @param {String=} propName Nombre de la propiedad a crear dentro del objeto.
     * @returns {Boolean} Registro exitoso: true. Intento de registro duplicado: false
     */
    reg: function (target, data, propName) {
      let retorno = false;
      if (propName) { // if exists this argument the target is a 'object'...
        if (!target.hasOwnProperty(propName)) {
          target[propName] = data;
          retorno = true;
        }
      } else { // ... is not is a 'array'
        target.push(data);
        retorno = true;
      }
      return retorno;
    },

    /**
     * Realiza un merge de los registros obtenidos por el tratado de un subschema.
     * @memberof uSchema
     * @param {Object} target Objeto destino en donde se realizará el merge de las propiedades.
     * @param {Object} schema Objeto que contiene los registros (missings, errors, different)
     * @param {String} parentProp Nombre de la propiedad padre de los registros
     * @returns {Object}
     */
    mergeProps: function (target, schema, parentProp) {
      // ERRORS
      const itemReg = schema.errors;
      if (itemReg.length) target.errors = target.errors.concat(itemReg);

      // MISSINGS
      let missing;
      ['required', 'optional'].forEach(function (item) {
        missing = schema.missings[item];
        if (missing.length) target.missings[item] = target.missings[item].concat(missing);
      });

      // DIFFERENT AND COMPILED
      let currentSchema;
      ['different', 'compiled'].forEach(function (objName) {
        currentSchema = schema[objName];
        if (Object.keys(currentSchema).length) {
          if (!target[objName].hasOwnProperty(parentProp)) target[objName][parentProp] = {};
          target[objName][parentProp] = currentSchema;
        };
      });
    }
  };
  /**
   * Constructor del schema.
   * @constructor
   * @param {Object} obj Configuraciones iniciales del schema
   * @example
   * const mySchema = {
   *  name: 'string',
   *  age: 'number',
   *  email: {
   *    type: 'string',
   *    required: true
   *  }
   * }
   * const card = new Schema(schema);
   */
  function Schema (obj) {
    if (!obj) return console.log('Object missing ', obj);
    this.schema = Object.assign({}, obj);
    uSchema.initValues(this);
  };

  /**
   * Muestra la versión actual de la librería.
   */
  Schema.version = '1.0.2Beta';
  /**
   * Fusiona el objeto pasado con el schema creado
   * @param {Object} [obj] Objeto que se necesita compilar con el squema creado.
   * @returns {Object} El objeto fusionado con los valores por defecto en el esquema (si es que existen claro).
   */
  Schema.prototype.compile = function (obj) {
    if (obj) this.validate(obj);
    return this.missings.required.length ? false : this.compiled;
  };
  /**
   * Valida si un objeto cumple con el schema designado.
   * @param {Object} response Objeto que comunmente se obtiene de un 'response' en una solicitud ajax
   * @returns {Boolean} Indica si el objeto pasado es válido o no con el schema.
   */
  Schema.prototype.validate = function (response) {
    // resetting previus values
    uSchema.initValues(this);

    // init
    const schema = this.schema,
          _this = this;
    let retorno = true; // by default, is valid :)

    Object.keys(schema).forEach(function (property) {
      // Data form schema
      const valPropSchema = schema[property];
      const getTypeValSchema = uSchema.getType.schema(valPropSchema);

      if (response.hasOwnProperty(property)) {
        // Data from response
        const valPropObj = response[property];
        const getTypeValObj = uSchema.getType.obj(valPropObj);

        switch (getTypeValSchema) {
          case 'string':
          case 'number':
          case 'boolean':
          case 'array':
            if (getTypeValSchema !== getTypeValObj) {
              if (valPropSchema.required) retorno = false;
              uSchema.reg(_this.different, {
                current: getTypeValObj,
                expected: getTypeValSchema,
                value: valPropObj
              }, property);
            } else {
              uSchema.reg(_this.compiled, valPropObj, property)
            }
            break;

          case 'object':
            if (getTypeValObj === 'object') {
              if (valPropSchema.hasOwnProperty('properties')) {
                const propertiesSchema = new Schema(valPropSchema.properties);
                if (!propertiesSchema.validate(valPropObj)) retorno = false;
                uSchema.mergeProps(_this, propertiesSchema, property);
              } else {
                uSchema.reg(_this.compiled, valPropObj, property);
              }
            } else {
              if (valPropSchema.required) {
                retorno = false;
                uSchema.reg(_this.different, {
                  current: getTypeValObj,
                  expected: getTypeValSchema,
                  value: valPropObj
                }, property);
              }
            }
            break;

          case 'mixed':
            const arrTypes = Array.isArray(valPropSchema) ? valPropSchema : valPropSchema.type;
            const typesValid = arrTypes.filter(function (type) {
              return type === getTypeValObj;
            });
            // no body match with any types items.
            if (!typesValid.length && valPropSchema.required) {
              retorno = false;
              uSchema.reg(_this.different, {
                current: getTypeValObj,
                expected: valPropSchema,
                value: valPropObj
              }, property);
            } else {
              uSchema.reg(_this.compiled, valPropObj, property)
            }
            break;

          default:
            console.log('format type dont accepted: ' + getTypeValSchema);
            retorno = false;
        }
      } else {
        let missing;
        if (valPropSchema.required) {
          retorno = false;
          missing = 'required';
        } else {
          missing = 'optional';
        }
        uSchema.reg(_this.missings[missing], property);
        if (valPropSchema.hasOwnProperty('default')) _this.compiled[property] = valPropSchema.default;
      }
    });

    // Returning
    return retorno;
  };

  // EXPORTING
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      module.exports = Schema;
    }
    exports.Schema = Schema;
  } else {
    root.Schema = Schema;
  }
}(this));


(function (root) {
  'use strict';
/**
 * Creador de un 'Smart Event'.
 * @constructor
 */
function SmartEvents () {
  this.events = null;
  this.version = '1.1';
};

function SmartEvent (name, obj) {
  this.name = name;
  this.detail = obj && obj.detail ? obj.detail : null;
  this.constant = obj && obj.constant ? obj.constant : false;
};

window.SmartEvent = SmartEvent;

/**
 * Se suscribe a un evento
 * @param {String} name Nombre del evento a suscribirce.
 * @param {Function} cb Callback del evento.
 * @param {Object} obj Objeto de parametros de configuración.
 */
SmartEvents.prototype.addEventListener = function (name, cb, obj){
  if (!this.events) this.events = {};

  // Obj base
  const theObj = {
    cb: cb,
    options: Object.assign({
      once: false
    }, obj || {})
  };

  // Event Vault
  const eventContent = this.events[name];

  // Don't exists, I need create it
  if (!eventContent) {
    const fns = new Map();
    fns.set(theObj.cb, theObj);
    this.events[name] = {
      fns: fns
    };

  // Executing or adding the cb.
  } else {
    if (eventContent.executed) {
      if (eventContent.constant) {
        cb(theObj.options)
      } else {
        eventContent.executed = false;
        eventContent.fns.set(cb, theObj)
      }
    } else {
      eventContent.fns.set(cb, theObj)
    }
  }
};

/**
 * Elimina un evento suscrito. Si no se determina una función en el segundo parametro, todos las funciones suscritas al evento serán removidas.
 * @param {String} name Nombre del evento a desuscribirce.
 * @param {Function} [cb] Function a desuscribir del evento.
 */
SmartEvents.prototype.removeEventListener = function (name, cb) {
  if (!this.events || !this.events[name]) return false;
  if (cb === undefined) {
    delete this.events[name];
  } else {
    this.events[name].fns.delete(cb);
    if (!this.events[name].fns.size && !this.events[name].constant) delete this.events[name];
  }
  // Nuleamos si no hay ningún evento.
  if (!Object.keys(this.events).length) this.events = null;
};

/**
 * Dispara las funciones anidadas a un evento determinado adjunto.
 * @param {Object} obj Nombre del evento
 */
SmartEvents.prototype.dispatchEvent = function (obj) {
  if (!this.events || !this.events[obj.name]) return false;
  const _this = this;
  this.events[obj.name].executed = true;
  if (obj.constant) this.events[obj.name].constant = true;
  this.events[obj.name].fns.forEach(function (fnObj, fn) {
    fn.call(_this, obj);
    if (fnObj.options.once) _this.removeEventListener(obj.name, fn);
  })
};

/**
 * Crea la instancia principal del 'Smart'
 * @constructor
 * @param {obj} [obj] Objeto con configuraciones
 * @returns {Object} Instancia del constructor 'Smart'
 */
function Smart(obj) {
  // Events
  SmartEvents.call(this);

  // Components registered
  this.registered = new Map();

  // Components builded
  this.builded = new Map();

  // Components Mounted
  this.mounted = new Map();

  // Data of components
  this.data = new Map();

  // Constructor variables
  if (obj) {
    const _this = this;
    Object.keys(obj).forEach(function (item) {
      _this[item] = obj[item];
    })
  }
};
Smart.prototype = Object.create(SmartEvents.prototype);
Smart.prototype.constructor = Smart;
Smart.prototype.version = '1.0.0'
Smart.prototype.utils = {};

/**
 * Procesa los atributos opcionales de un nodo de forma recursiva
 * @param {Array} attrs Lista de atributos del nodo
 * @param {Object} node Nodo vivo HTML
 * @param {Function} cb Callback
 */
Smart.prototype.utils.attrsCleaner = function (attrs, node, cb) {
  const attr = attrs.shift();
  if (attr.value.trim() === "[]") {
    if (attr.name === 'value') node.value = ''; // fallback para IE
    node.removeAttribute(attr.name);
  } else {
    const lengthVal = attr.value.length;
    if (attr.value.substring(0, 1) === '[' && attr.value.substring(lengthVal - 1) === ']') {
      node.setAttribute(attr.name, attr.value.substring(1, lengthVal - 1));
    }
  }
  if (!attrs.length) return cb();
  this.attrsCleaner(attrs, node, cb);
};

/**
 * Procesa una lista de nodos de forma recursiva
 * @param {Array} items Lista de nodos vivos HTML
 * @param {Function} fn Functión que se ejecutará por cada Nodo
 * @param {Function} cb Callback
 */
Smart.prototype.utils.forRecur = function (items, fn, cb) {
  const _this = this;
  const arrItems = Array.isArray(items) ? items : this.toArray(items);
  const item = arrItems.shift();
  fn(item, function () {
    if (arrItems.length) {
      _this.forRecur(arrItems, fn, cb)
    } else {
      if (cb) cb()
    }
  })
};

/**
 * Obtiene los atributos de un nodo HTML, convirtiendo cada valor en su equivalente más fiel.
 * @param {Object} Node Nodo HTML de donde obtener los atributos
 * @returns {Object} Objeto de las propiedades capturadas.
 */
Smart.prototype.utils.getProps = function (Node) {
  const _this = this;
  const attrs = Node.attributes;
  if (!attrs.length) return false;
  const props = {};
  let firstCharacter, attrVal, attrValLength;
  const passDirect = ['placeholder', 'value'];
  Array.prototype.forEach.call(attrs, function (attr) {
    attrVal = attr.value.trim();
    if (passDirect.indexOf(attr.name) !== -1) {
      props[attr.name] = attrVal;
    } else {
      if (!isNaN(attrVal)) { // can be a array or a string
        props[attr.name] = attrVal === '' ? true : Number(attrVal); // the empty value means it's a worthless attribute
      } else {
        firstCharacter = attrVal.substring(0, 1);
        if (firstCharacter === '[' || firstCharacter === '{') { // is a object or a array
          if (attr.name !== 'pattern' && attr.name !== 'regex') {
            try {
              props[attr.name] = JSON.parse(attrVal);
            } catch (e) {
              _this.regError('Error de parseo de data (attr : ' + attr.name + ')', Node.outerHTML.replace(/&quot;/g, '"'))
            }
          } else {
            props[attr.name] = (attrVal === 'true' || attrVal === 'false') ? JSON.parse(attrVal) : attrVal;
          }
        } else { // is...
          // ... a boolean param or .. a simple string
          attrValLength = attrVal.length;
          if (firstCharacter === '/' && attrVal.substring(attrValLength - 1) === '/') {
            props[attr.name] = JSON.parse(attrVal.substring(1, attrValLength - 1));
          } else {
            props[attr.name] = (attrVal === 'true' || attrVal === 'false') ? JSON.parse(attrVal) : attrVal;
          }
        }
      }
    }
  });
  return props;
};

/**
 * Identifica si un Node es componente o no.
 * @param {Object} Node Nodo HTML a verificar.
 * @returns {(Boolean|String)} Name of the component, or false if is not a component.
 */
Smart.prototype.utils.isComponent = function (Node) {
  const nodeName = Node.nodeName.toLowerCase();
  const prefix = nodeName.substring(0, 2);
  return prefix === 'c-' ? nodeName.substring(2) : false;
};

/**
 * Utilidad para retornar errores.
 * @param {String} type Tipo de error a mostrar
 * @param {String} message Descripción del error
 */
Smart.prototype.utils.regError = function (name, message, extraArg) {
  const err = new Error();
  err.name = name;
  err.message = message;
  console.error(err);
  if (extraArg) console.log(extraArg);
  return err;
};

/**
 * Convierte un arrayLiked en un array real.
 * @param {NodeList} list Lista arrayLiked
 * @return {Array}
 */
Smart.prototype.utils.toArray = function (list) {
  return Array.prototype.map.call(list, function (node) {
    return node;
  });
};

/**
 * Sirve para notificar de forma local y global algunos eventos para los componentes, como cuando se registran, crean, construyen, etc.
 * @param {String} eventName Nombre del evento a desplegar
 * @param {Object} compInstance Instancia del componente
 * @param {Object} detail Detail del evento a notificar.
 */
Smart.prototype.notifyComponent = function (eventName, compInstance, detail) {
  // Noti global
  this.dispatchEvent(new SmartEvent('component:' + eventName, {
    detail: detail
  }));

  // Noti local
  if (compInstance) {
    setTimeout(function () {
      compInstance.dispatchEvent(new SmartEvent(eventName, {
        detail: detail
      }));
    }, 0);
  }
};

/**
 * Busca los componentes existentes dentro de un Nodo html
 * @param {Object} [mainNode] Nodo HTML desde donde buscar, si no se pone tomará el declarado en el objeto maestro de configuración.
 * @returns {Array} Lista de nodos denominados como componentes, si no encuentra ninguno devuelve un array vacío.
 */
Smart.prototype.searchComponents = function (mainNode) {
  const Nodes = mainNode.querySelectorAll('*');
  const nNodes = Nodes.length;
  if (!nNodes) return [];
  const _this = this;
  return Array.prototype.filter.call(Nodes, function (Node) {
    return _this.utils.isComponent(Node)
  });
};

/**
 * Registra un Smart Componente
 * @param {String} name Nombre del elemento.
 * @param {Object} [obj={}] Objeto de opciones del elemento.
 * @param {Object} [obj.schema] Schema del componente
 * @param {String} [obj.template] HTML String del componente
 * @param {Function} [obj.script] Clase del componente
 * @returns {Object} Instancia del componente.
 */
Smart.prototype.registerComponent = function (name, obj) {
  if (this.registered.has(name))
    return this.utils.regError(
      "Componente Duplicado",
      'Ya se había registrado el componente "' + name + '".'
    );
  if (!obj) obj = {};

  // Creating constructor
  function CompInstace() {
    SmartEvents.call(this, name);
  }
  CompInstace.prototype = Object.create(SmartEvents.prototype);
  CompInstace.prototype.constructor = CompInstace;

  // Saving in vault
  const componentOpts = {
    schema: obj.schema ? new Schema(obj.schema) : null,
    styles: obj.styles || null,
    template: obj.template || null,
    script: obj.script || null,
    constructor: CompInstace,
    instance: new CompInstace(),
  };
  this.registered.set(name, componentOpts);

  // Notifier
  const notiData = Object.assign({}, componentOpts);
  delete notiData.constructor;
  delete notiData.instance;
  this.notifyComponent("registered", componentOpts.instance, {
    name: name,
    data: notiData
  });
  return componentOpts.instance;
};

/**
 * Callback del método createComponent.
 * @callback createCallBack
 * @param {?Object} node Primer nodo del template.
 * @param {?Object} data Propiedades del componente.
 * @param {?Function} fn Clase del componente.
 * @param {?Object} instance Instancia del componente.
 */

/**
 * Crea un Smart Component.
 * @param {String} name nombre del componente.
 * @param {Object} [props={}] Propiedades del componente a crear.
 * @param {createCallBack} [cb] Callback del método. Retorna 2 argumentos: Node, Data.
 * @returns {Object} Instancia del componente.
 */
Smart.prototype.createComponent = function (name, props, cb) {
  if (!props) props = {};
  if (!this.registered.has(name))
    return this.utils.regError("Componente Inexistente", 'No se puede crear el componente "' + name + '", porque no está registrado.');
  const _this = this;

  // Getting componente
  const component = this.registered.get(name);

  // Building Data (with the schema)
  let cData = null;
  if (component.schema) {
    if (!component.schema.validate(props)) {
      return this.utils.regError("Data inválida", 'No fué posible crear el componente "' + name + '", ya que su data es inválida.', {
        different: component.schema.different,
        missings: {
          required: component.schema.missings.required,
          optional: component.schema.missings.optional
        },
        errors: component.schema.errors
      });
    }
    cData = component.schema.compile(props);
  };

  // Building template
  if (!component.template) {
    let comptInstance;
    if (component.script) comptInstance = new component.script(_this, null, cData);

    // Notifier
    this.notifyComponent("created", component.instance, {
      name: name
    });
    if (cb) cb(null, cData, component.script, comptInstance);
    return component.instance;
  };

  // creating DOM Nodes
  const divTemp = document.createElement("div");
  divTemp.innerHTML = cData ? Sqrl.render(component.template, cData) : component.template;

  // Nodes Iteration
  const nodesInside = divTemp.querySelectorAll("*");
  if (nodesInside.length) {
    this.utils.forRecur(nodesInside, function (node, forCb) {
      let attrs = node.attributes;
      if (!attrs.length) return forCb();
      attrs = _this.utils.toArray(attrs);
      _this.utils.attrsCleaner(attrs, node, forCb);
    }, function () {
      // Executing the script with template
      let comptInstance;
      if (component.script) {
        let nodeComponent = divTemp.querySelector("[component]");
        if (nodeComponent) nodeComponent.removeAttribute("component");
        comptInstance = new component.script(_this, nodeComponent, cData);
        if (component.script.prototype.created) comptInstance.created();
      };

      // Notifier
      const firstNode = divTemp.children[0];
      _this.notifyComponent("created", component.instance, {
        name: name,
        node: firstNode
      });
      if (cb) cb(firstNode, cData, component.script, comptInstance);
    });

  } else {
    // Executing the script with template
    let comptInstance;
    if (component.script) {
      comptInstance = new component.script(this, null, cData);
      if (component.script.prototype.created) comptInstance.created();
    };

    // Notifier
    this.notifyComponent("created", component.instance, {
      name: name
    });
    if (cb) cb(null, cData, component.script, comptInstance);
  };

  // Return instance
  return component.instance;
};

// Utils for buildComponent
const uBc = function (App, name, node, cb) {
  this.App = App;

  this.name = name;

  this.gross = node;
  this.constructed = null;

  this.cb = cb;

  this.instance = null;
  this.data = null;
  this.constr = null;
};

uBc.prototype.saveData = function (node) {
  const props = this.App.utils.getProps(node);
  if (props && props.hasOwnProperty('id') && !this.App.data.has(props.id)) {
    this.App.data.set(props.id, {
      innerHTML: node.innerHTML.trim(),
      outerHTML: node.outerHTML.trim(),
      props: props
    })
  }
  return props;
};

uBc.prototype.created = function (node, props, constr, instance) {
  const _this = this;

  // caching elements getted
  this.constructed = node;
  this.props = props;
  this.constr = constr;
  this.instance = instance;

  // returning if...
  if (!node) return this.builded(); // ... the component haven't body (withouth node HTML)

  // Content Node
  const contentNode = node.hasAttribute('content') ? node : node.querySelector('[content]');

  // Searching if exists node in the template of the component construyed
  const compsInside = this.App.searchComponents(node);
  if (!compsInside.length) {
    this.haveChildren(this.gross, function (childs) {
      childs.length ? _this.childrens(childs, contentNode) : _this.builded();
    });
    return false;
  };

  // Processing components inside
  this.App.utils.forRecur(compsInside, function (compNode, forCB) {
    _this.App.buildComponent(compNode, function (obj) {
      if (obj.node) {
        _this.App.mountComponent({
          gross: compNode,
          builded: obj.node,
          props: obj.props
        });
      }
      forCB();
    })
  }, function () {
    _this.haveChildren(_this.gross, function (childs) {
      childs.length ? _this.childrens(childs, contentNode) : _this.builded();
    });
  })
};

uBc.prototype.builded = function () {
  const detail = {
    node: this.constructed,
    props: this.props
  };

  // Saving the Node builded
  this.App.builded.set(this.gross, {
    node: this.constructed,
    props: this.props
  });

  // Event Builded

  // ...by Node
  if (this.gross) {
    this.gross.dispatchEvent(new CustomEvent('builded', {
      detail: detail
    }));
  };

  // ... by App
  this.App.notifyComponent('builded', false, Object.assign({
    name: this.name
  }, detail));

  if (this.constr && this.constr.prototype['builded']) this.instance['builded'](detail);

  // FN Callback, if exists of course
  if (this.cb) this.cb({
    node: this.constructed,
    props: this.props
  });
};

uBc.prototype.haveChildren = function (node, cb) {
  let childs = node.childNodes;
  if (!childs.length) return cb([]);
  const arrNodes = [];
  this.App.utils.forRecur(childs, function (child, fCb) {
    if (child.nodeType === 3) {
      if (child.textContent.trim()) arrNodes.push(child);
    } else {
      arrNodes.push(child);
    }
    fCb();
  }, function () {
    cb(arrNodes);
  });
};

uBc.prototype.childrens = function (childs, contentNode) {
  const _this = this;
  if (!contentNode) return this.App.utils.regError('Falta Nodo contenedor', 'El componente ' + node.outerHTML + ' tiene nodos hijos pero no se a determinado el nodo que los contendrá.');
  this.App.utils.forRecur(childs, function (child, cb) {
    contentNode.appendChild(child);
    cb();
  }, function () {
    _this.builded();
  })
};

/**
 * Callback de método BuildComponent
 * @callback buildCallBack
 * @param {?Object} node Nodo HTML en estado bruto del componente
 * @param {?Object} component Nodo HTML yá construido del componente
 * @param {?Object} props Propiedades del componente. OJO: son propiedades, no atributos.
 */

/**
 * Construye un componente o componentes que este nodo contiene.
 * @param {Object} node Nodo HTML tipo componente
 * @param {buildCallBack} [cb] Function callback.
 */
Smart.prototype.buildComponent = function (node, cb) {
  const _this = this;

  // check if the node passed if a component
  const name = this.utils.isComponent(node); // return a 'Truthy value' (name of the component)
  if (!name) return this.utils.regError('Componente inválido', 'El Nodo pasado NO es un componente, no se puede procesar');

  // The component is builded already.
  if (this.builded.has(node)) return this.utils.regError('Ya construido', 'El Componente yá a sido construido.');

  // Instance Builded
  const instUbc = new uBc(this, name, node, cb);

  // getting the props of the componente
  const props = instUbc.saveData(node);

  // Procesing...
  if (!this.registered.has(name)) return this.utils.regError('Sin registrar', 'El componente no puede ser construido porque no a sido registrado previamente.');
  this.createComponent(name, props, instUbc.created.bind(instUbc)); // if is registered already
};

/**
 * Monta un componente
 * @param {Object} obj Objeto contenedor con nodos y propiedades.
 * @param {Object} [obj.name] Nombre del componente a montar.
 * @param {Object} obj.gross Nodo HTML en estado bruto.
 * @param {Object} obj.builded Nodo HTML del componente yá construido.
 * @param {Object} [obj.props] Propiedades del componente.
 * @param {Object} [obj.instance] Instancia del componente
 * @param {Function} [cb] Callback
 */

Smart.prototype.mountComponent = function (obj, cb) {
  if (this.mounted.has(obj.gross)) return this.utils.regError('Ya montado', 'El componente yá fué montado con anterioridad: ', obj.gross);

  // Mounting
  let grossParent = obj.gross.parentNode;
  if (grossParent) {
    // Inserting styles, if have styles of course
    const name = this.utils.isComponent(obj.gross);
    const objComp = this.registered.get(name);
    if (objComp.styles && !document.getElementById(name)) {
      const tagStyle = document.createElement("style");
      tagStyle.type = "text/css";
      tagStyle.innerHTML = objComp.styles;
      tagStyle.id = name;
      document.body.appendChild(tagStyle);
    };

    // Reemplazing node
    grossParent.replaceChild(obj.builded, obj.gross);
    this.mounted.set(obj.gross, {
      builded: obj.builded,
      props: obj.props
    });

    // Notify && CB
    const detail = {
      name: name,
      gross: obj.gross,
      builded: obj.builded,
      props: obj.props
    };
    this.notifyComponent("mounted", obj.instance, detail);
    if (cb) cb(detail);
  }
};


  // Export SmartJS
  if (window) window.Smart = Smart;
  if (typeof module === "object" && module.exports) {
    module.exports = Smart;
  } else {
    root.Smart = Smart;
  }
})(this);
