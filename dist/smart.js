
(function (root) {
  'use strict';


/**
 * Utilidades de layouter
 */
const uLayouter = {
  /**
   * Obtiene el width y las columnas de los breakpoints.
   * @param {Object} objBps Objeto de los breakPoints
   * @param {String} propName Nombre de la propiedad
   */
  getNums: function (objBps, propName) {
    const sizes = {};
    Object.keys(objBps).forEach(function (bp) {
      sizes[bp] = propName === 'width' && objBps[bp].direct ? 0 : objBps[bp][propName];
    });
    return sizes;
  },

  /**
   * Determina si el parametro tiene o no un breakpoint designado
   * @param {String} param Parametro
   */
  haveBreakPoint: function (param) {
    return param.indexOf('@') !== -1 ? true : false;
  },

  /**
   * Prepara el parametro de un método especificado. (EJM: cols, pad, etc)
   * @param {String} param Parametro de configuración sobre el método.
   */
  prepareParam: function (param) {
    let bp;
    const haveBp = this.haveBreakPoint(param);
    if (haveBp) {
      const bpSplited = param.split('@');
      param = bpSplited[0];
      bp = bpSplited[1];
    } else {
      bp = 'xs';
    }
    return {
      widthBp: haveBp,
      numbers: param,
      breakPoints: bp
    }
  },

  /**
   * Convierte un string a un número
   * @param {String} n El string que se vá a convertir a número
   * @returns {Number}
   */
  stringToNumber: function (n) {
    return typeof n === 'string' ? parseFloat(n) : n;
  },

  /**
   * Calcula el porcentaje de un número :V
   * @param {Number} n1 Numero de donde se sacará el porcentaje
   * @param {Number} n2 Número de valor máximo
   */
  calPercentage: function (n1, n2) {
    return (n1 * 100) / n2 + '%'
  },

  /**
   * Procesa un número, si es porcentual, lo calcula, sino, lo devuelve tal cual
   * @param {String} n Número a procesar
   */
  processedNumber: function (n) {
    let nProcessed;
    if (n.indexOf('/') !== -1) {
      nProcessed = n.split('/');
      nProcessed = this.calPercentage(this.stringToNumber(nProcessed[0]), this.stringToNumber(nProcessed[1]))
    } else {
      nProcessed = n === 'auto' ? 'auto' : n + 'px';
    }
    return nProcessed;
  },

  /**
   * Utilidad para retornar errores.
   * @param {String} name Título del Error
   * @param {String} message Descripción del error
   */
  regError: function (name, message) {
    const err = new Error();
    err.name = name;
    err.message = message;
    console.error(err);
    return err;
  },

  /**
   * Lista de procesadores disponibles, junto a su método y regla css
   */
  processors: {
    cols: {
      method: 'setCols',
      ruleCss: 'width'
    },
    pad: {
      method: 'setPads',
      ruleCss: 'padding'
    },
    mar: {
      method: 'setMars',
      ruleCss: 'margin'
    },
    flex: {
      method: 'setFlex',
      ruleCss: 'display: flex'
    }
  },

  /**
   * Equivalencias de las propiedades y valores de flexbox
   */
  flexpv: {
    jc: 'justify-content',
    ai: 'align-items',
    ce: 'center',
    fs: 'flex-start',
    fe: 'flex-end',
    sb: 'space-between',
    sa: 'space-around',
    fw: 'flex-wrap',
    nw: 'nowrap',
    w: 'wrap',
    wr: 'wrap-reverse',
    fd: 'flex-direction',
    r: 'row',
    rr: 'row-reverse',
    co: 'column',
    cor: 'column-reverse'
  },
  
  /**
   * Crea una lista de estilos CSS apartir de breakpoints y propiedades.
   * @param {String} type Tipo de estilos a dar: 'cols', 'pad', 'mar' o 'flex'
   * @param {Object} bps Objeto de breakpoints registrados
   * @param {Object} instance La instancia creada, el objeto mismo.
   */
  createStyles: function (type, bps, instance) {
    const sizes = instance.sizes;
    const prefix = instance.prefix;
    const prop = uLayouter.processors[type].ruleCss;
    const styles = {};
    let rule, bpSplited, bp1, bp2, direct = false, nameClass, propAndVal;
    Object.keys(bps).forEach(function (bp, index) {
      // preparing the className
      nameClass = prefix + type + '-' + bps[bp].name;
      nameClass = nameClass.replace(/\//g, '\\/').replace(/:/g, '\\:').replace('@', '\\@');

      // Property and value
      if (prop.indexOf(':') !== -1) { // cuando se define una propiedad inicial (Ejm: display:flex)
        propAndVal = bps[bp].value;
        if (!index) styles[prefix + type + '-' + type] = '.' + prefix + type + '-' + type + '{' + prop + '}';
      } else {
        propAndVal = prop +  ':' + bps[bp].value;
      }

      rule = '@media screen and ';
      if (bp.indexOf('-') === -1) { // no tiene unti
        if (sizes[bp]) {
          rule += '(min-width: ' + sizes[bp] + 'px)';
        } else {
          rule = '.' + nameClass + '{' + propAndVal + '}';
          direct = true;
        }
      } else { 
        bpSplited = bp.split('-');
        bp1 = bpSplited[0];
        if (bp1) rule += '(min-width: ' + sizes[bp1] + 'px) and ';
        bp2 = bpSplited[1];
        rule += '(max-width: ' + (sizes[bp2] - 1) + 'px)';
      }

      if (!direct) rule += '{.' + nameClass + '{' + propAndVal + '}}';
      direct = false;
      styles[nameClass] = rule;
    });
    return styles;
  },

  /**
   * Crea el scope de la hoja de estilos que se usará para designar los estilos que se crean al vuelo.
   */
  createScopeStyles: function () {
    const stylesScope = document.createElement('style');
    stylesScope.appendChild(document.createTextNode(''));
    document.body.appendChild(stylesScope);
    stylesScope.id = 'layouter'
    return stylesScope.sheet;
  },

  /**
   * Agrega las reglas CSS para darle estilos a los nodos
   * @param {Array} rules Lista de reglas CSS a agregar
   */
  insertRules: function (objStyles, instance) {
    const nodeScope = instance.scope;
    const prefix = instance.prefix;
    Object.keys(objStyles).forEach(function (className) {
      if (!instance.styles.hasOwnProperty(prefix + className)) {
        nodeScope.insertRule(objStyles[className], nodeScope.rules.length);
        instance.styles[prefix + className] = objStyles[className];
      }
    });
  },

  /**
   * Lista de caracteres a reemplazar para el nombre de las clases
   */
  replaceList: [
    ['\/', ''],
    ['\\', '/'],
    ['/:', ':'],
    ['\\:', ':'],
    ['\\@', '@'],
    ['/@', '@']
  ],

  /**
   * Asignador de nombre de clases a un nodo.
   * @param {Object} Node Nodo a donde agregar las clases
   * @param {Array} classesNames Lista de nombres de las clases
   */
  adClasses: function (classesNames, Node) {
    const _this = this
    classesNames.forEach(function (name) {
      _this.replaceList.forEach(function (reItem) {
        name = name.replace(reItem[0], reItem[1])
      });
      Node.classList.add(name);
    });
  },

  /**
   * Crea e inserta los estilos calculandolos, y tambien adiciona las clases respectivas al nodo
   * @param {Object} data Lista de data para el procesamiento del CSS
   */
  settingCss: function (data) {
    // creating the styles
    const objStyles = this.createStyles(data.type, data.bps, data.instance);

    // Inserting CSS rules
    this.insertRules(objStyles, data.instance);
  
    // Adding classes
    this.adClasses(Object.keys(objStyles), data.node)
  },
  
  /**
   * Setea los paddings y margenes
   */
  padsAndMargs: function (Node, type, instance) {
    if (!Node) return uLayouter.regError('Non-existent Node', "Don't exists the Node for processing.");
    const params = instance.getParameters(Node);
    const _this = this;
    if (!params.hasOwnProperty(type)) return uLayouter.regError('Parameter Missing', "Don't exists the param '" + type + "' determined");

    const bpCals = {};
    let paramProcessed, numbersPures, propValue, bps;
    params[type].forEach(function (param) {

      paramProcessed = uLayouter.prepareParam(param);
      numbersPures = paramProcessed.numbers;
      bps = paramProcessed.breakPoints;

      // processing number values
      propValue = numbersPures
        .split('-')
        .map(function (n) {
          return _this.processedNumber(n);
        })
        .join(' ');
      if (bpCals.hasOwnProperty(bps)) {
        bpCals[bps].value += ';' + propValue
      } else {
        bpCals[bps] = {
          name: param,
          value: propValue
        };
      }
    });

    // Creating, inserting, and adding classNames of rules in Node.
    this.settingCss({
      type: type,
      bps: bpCals,
      instance: instance,
      node: Node
    });

    // removing param
    Node.removeAttribute(type);
  }
};

/**
 * Construtor maestro del sistema.
 * @constructor
 * @param {Object} config Objecto contenedor de las configuraciones.
 */
function Layouter (config) {
  // validation
  if (!config.hasOwnProperty('breakPoints')) return uLayouter.regError('Configuration Missing', '¡configuration missing! :V');

  // configs
  this.prefix = config.prefix ? config.prefix + '-' : ''

  // init setterss
  const bps = config.breakPoints;
  this.breakPoints = Object.keys(bps);
  this.sizes = uLayouter.getNums(bps, 'width');
  this.cols = uLayouter.getNums(bps, 'cols');
  this.scope = uLayouter.createScopeStyles();
  this.styles = {};
};
const lytProto = Layouter.prototype;

Layouter.version = '1.0Beta';

/**
 * Obtiene los parametros disponibles para procesar
 * @param {Object} Nodo Nodo de donde obtener los parametros.
 * @returns {Object}
 */
lytProto.getParameters = function (Node) {
  const params = {};
  const attrs = Node.attributes;
  const paramNames = Object.keys(uLayouter.processors);
  Array.prototype.forEach.call(attrs, function (attr) {
    if (paramNames.indexOf(attr.name) !== -1) {
      if (attr.value !== '') params[attr.name] = attr.value.split(' ');
    }
  });
  return params;
};

/**
 * Asigna los estilos necesarios a un nodo referentes a las columnas determinadas
 * @param {Object} Node Nodo a donde asignar los estilos
 */
lytProto.setCols = function (Node) {
  if (!Node) return uLayouter.regError('Non-existent Node', "Don't exists the Node for processing.");
  const _this = this;
  const params = this.getParameters(Node);
  if (!params.hasOwnProperty('cols')) return uLayouter.regError('Parameter Missing', "Don't exists 'cols' determined");
  let cols, bp, bpCals = {};

  // Getting numbers
  let selectorName, propValue, paramPrepared;
  params.cols.forEach(function (param) {
    selectorName = param;

    paramPrepared = uLayouter.prepareParam(param);
    bp = paramPrepared.breakPoints;
    param = paramPrepared.numbers;

    if (param.indexOf('/') !== -1) {
      cols = param.split('/');
    } else {
      if (paramPrepared.widthBp) {
        if (bp.indexOf('-') === -1) {
          cols = [param, _this.cols[bp]];
        } else {
          uLayouter.regError('SyntaxError', "You can't determine a 'until breakpoint' when use the explicit columns max");
        }
      } else {
        cols = [param, _this.cols.xs];
      }
    }
    propValue = uLayouter.calPercentage(cols[0], cols[1]);

    bpCals[bp] = {
      name: selectorName,
      value: propValue
    };
  });
  // Creating, inserting, and adding classNames of rules in Node.
  uLayouter.settingCss({
    type: 'cols',
    bps: bpCals,
    instance: this,
    node: Node
  });

  // removing param
  Node.removeAttribute('cols');
};

/**
 * Setea los paddings necesarios para un Nodo.
 * @param {String} Node Nodo vivo del DOM a asignarle el CSS
 */
lytProto.setPads = function (Node) {
  uLayouter.padsAndMargs(Node, 'pad', this);
};

/**
 * Setea los margins necesarios para un Nodo.
 * @param {String} Node Nodo vivo del DOM a asignarle el CSS
 */
lytProto.setMars = function (Node) {
  uLayouter.padsAndMargs(Node, 'mar', this);
};

/**
 * Setea la propiedad Flex y las reglas designadas
 * @param {Object} Node Nodo vivo del DOM a asignarle el CSS
 */
lytProto.setFlex = function (Node) {
  if (!Node) return uLayouter.regError('Non-existent Node', "Don't exists the Node for processing.");
  const params = this.getParameters(Node);
  if (!params.hasOwnProperty('flex')) return uLayouter.regError('Parameter Missing', "Don't exists 'flex' determinated.");
  let bpNameS, bpCals = {};

  // Getting numbers
  let selectorName, paramPrepared, flexSplited,  propVal, nameProp, valProp;
  params.flex.forEach(function (param) {
    selectorName = param;

    paramPrepared = uLayouter.prepareParam(param);
    bpNameS = paramPrepared.breakPoints;
    param = paramPrepared.numbers;

    flexSplited = param.split(':');
    nameProp = flexSplited[0];
    if (uLayouter.flexpv.hasOwnProperty(nameProp)) {
      valProp = flexSplited[1];
      if (uLayouter.flexpv.hasOwnProperty(valProp)) {
        propVal = uLayouter.flexpv[nameProp] + ':' + uLayouter.flexpv[flexSplited[1]]
      } else {
        return uLayouter.regError('Non-existent Alias', "Don't exists the alias '" + valProp + "' in Flex vault.");
      }
    } else {
      return uLayouter.regError('Non-existent Alias', "Don't exists the alias '" + nameProp + "' in Flex vault.");
    }

    if (bpCals.hasOwnProperty(bpNameS)) {
      if (selectorName.indexOf('@') !== 1) selectorName = selectorName.split('@')[0];
      bpCals[bpNameS].name = bpCals[bpNameS].name.split('@')[0] + '-' + selectorName + '@' + bpNameS;
      bpCals[bpNameS].value += ';' + propVal;
    } else {
      bpCals[bpNameS] = {
        name: selectorName,
        value: propVal
      };
    }
  });

  // Creating Styles, inserting, and adding classNames of rules in Node.
  uLayouter.settingCss({
    type: 'flex',
    bps: bpCals,
    instance: this,
    node: Node
  });

  // removing param
  Node.removeAttribute('flex');
};

/**
 * Procesa todos los atributos de procesamiento que se tenga disponible
 * @param {Object} Nodo Nodo vivo del DOM a asignarle el CSS
 */
lytProto.build = function (Node) {
  if (!Node) return uLayouter.regError('Non-existent Node', "Don't exists the Node for processing.");
  const params = this.getParameters(Node);
  const proNames = Object.keys(params);
  const _this = this;
  if (proNames.length) {
    proNames.forEach(function (processorName) {
      _this[uLayouter.processors[processorName].method](Node);
    });
  } else {
    uLayouter.regError('Parameter Missing', "don't exists any parameter to process")
  }
};
(function (root) {
  /*!
  * mustache.js - Logic-less {{mustache}} templates with JavaScript
  * http://github.com/janl/mustache.js
  */

  var objectToString = Object.prototype.toString;
  var isArray = Array.isArray || function isArrayPolyfill (object) {
    return objectToString.call(object) === '[object Array]';
  };

  function isFunction (object) {
    return typeof object === 'function';
  }

  /**
   * More correct typeof string handling array
   * which normally returns typeof 'object'
   */
  function typeStr (obj) {
    return isArray(obj) ? 'array' : typeof obj;
  }

  function escapeRegExp (string) {
    return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
  }

  /**
   * Null safe way of checking whether or not an object,
   * including its prototype, has a given property
   */
  function hasProperty (obj, propName) {
    return obj != null && typeof obj === 'object' && (propName in obj);
  }

  /**
   * Safe way of detecting whether or not the given thing is a primitive and
   * whether it has the given property
   */
  function primitiveHasOwnProperty (primitive, propName) {
    return (
      primitive != null
      && typeof primitive !== 'object'
      && primitive.hasOwnProperty
      && primitive.hasOwnProperty(propName)
    );
  }

  // Workaround for https://issues.apache.org/jira/browse/COUCHDB-577
  // See https://github.com/janl/mustache.js/issues/189
  var regExpTest = RegExp.prototype.test;
  function testRegExp (re, string) {
    return regExpTest.call(re, string);
  }

  var nonSpaceRe = /\S/;
  function isWhitespace (string) {
    return !testRegExp(nonSpaceRe, string);
  }

  var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };

  function escapeHtml (string) {
    return String(string).replace(/[&<>"'`=\/]/g, function fromEntityMap (s) {
      return entityMap[s];
    });
  }

  var whiteRe = /\s*/;
  var spaceRe = /\s+/;
  var equalsRe = /\s*=/;
  var curlyRe = /\s*\}/;
  var tagRe = /#|\^|\/|>|\{|&|=|!/;

  /**
   * Breaks up the given `template` string into a tree of tokens. If the `tags`
   * argument is given here it must be an array with two string values: the
   * opening and closing tags used in the template (e.g. [ "<%", "%>" ]). Of
   * course, the default is to use mustaches (i.e. mustache.tags).
   *
   * A token is an array with at least 4 elements. The first element is the
   * mustache symbol that was used inside the tag, e.g. "#" or "&". If the tag
   * did not contain a symbol (i.e. {{myValue}}) this element is "name". For
   * all text that appears outside a symbol this element is "text".
   *
   * The second element of a token is its "value". For mustache tags this is
   * whatever else was inside the tag besides the opening symbol. For text tokens
   * this is the text itself.
   *
   * The third and fourth elements of the token are the start and end indices,
   * respectively, of the token in the original template.
   *
   * Tokens that are the root node of a subtree contain two more elements: 1) an
   * array of tokens in the subtree and 2) the index in the original template at
   * which the closing tag for that section begins.
   *
   * Tokens for partials also contain two more elements: 1) a string value of
   * indendation prior to that tag and 2) the index of that tag on that line -
   * eg a value of 2 indicates the partial is the third tag on this line.
   */
  function parseTemplate (template, tags) {
    if (!template)
      return [];
    var lineHasNonSpace = false;
    var sections = [];     // Stack to hold section tokens
    var tokens = [];       // Buffer to hold the tokens
    var spaces = [];       // Indices of whitespace tokens on the current line
    var hasTag = false;    // Is there a {{tag}} on the current line?
    var nonSpace = false;  // Is there a non-space char on the current line?
    var indentation = '';  // Tracks indentation for tags that use it
    var tagIndex = 0;      // Stores a count of number of tags encountered on a line

    // Strips all whitespace tokens array for the current line
    // if there was a {{#tag}} on it and otherwise only space.
    function stripSpace () {
      if (hasTag && !nonSpace) {
        while (spaces.length)
          delete tokens[spaces.pop()];
      } else {
        spaces = [];
      }

      hasTag = false;
      nonSpace = false;
    }

    var openingTagRe, closingTagRe, closingCurlyRe;
    function compileTags (tagsToCompile) {
      if (typeof tagsToCompile === 'string')
        tagsToCompile = tagsToCompile.split(spaceRe, 2);

      if (!isArray(tagsToCompile) || tagsToCompile.length !== 2)
        throw new Error('Invalid tags: ' + tagsToCompile);

      openingTagRe = new RegExp(escapeRegExp(tagsToCompile[0]) + '\\s*');
      closingTagRe = new RegExp('\\s*' + escapeRegExp(tagsToCompile[1]));
      closingCurlyRe = new RegExp('\\s*' + escapeRegExp('}' + tagsToCompile[1]));
    }

    compileTags(tags || mustache.tags);

    var scanner = new Scanner(template);

    var start, type, value, chr, token, openSection;
    while (!scanner.eos()) {
      start = scanner.pos;

      // Match any text between tags.
      value = scanner.scanUntil(openingTagRe);

      if (value) {
        for (var i = 0, valueLength = value.length; i < valueLength; ++i) {
          chr = value.charAt(i);

          if (isWhitespace(chr)) {
            spaces.push(tokens.length);
            indentation += chr;
          } else {
            nonSpace = true;
            lineHasNonSpace = true;
            indentation += ' ';
          }

          tokens.push([ 'text', chr, start, start + 1 ]);
          start += 1;

          // Check for whitespace on the current line.
          if (chr === '\n') {
            stripSpace();
            indentation = '';
            tagIndex = 0;
            lineHasNonSpace = false;
          }
        }
      }

      // Match the opening tag.
      if (!scanner.scan(openingTagRe))
        break;

      hasTag = true;

      // Get the tag type.
      type = scanner.scan(tagRe) || 'name';
      scanner.scan(whiteRe);

      // Get the tag value.
      if (type === '=') {
        value = scanner.scanUntil(equalsRe);
        scanner.scan(equalsRe);
        scanner.scanUntil(closingTagRe);
      } else if (type === '{') {
        value = scanner.scanUntil(closingCurlyRe);
        scanner.scan(curlyRe);
        scanner.scanUntil(closingTagRe);
        type = '&';
      } else {
        value = scanner.scanUntil(closingTagRe);
      }

      // Match the closing tag.
      if (!scanner.scan(closingTagRe))
        throw new Error('Unclosed tag at ' + scanner.pos);

      if (type == '>') {
        token = [ type, value, start, scanner.pos, indentation, tagIndex, lineHasNonSpace ];
      } else {
        token = [ type, value, start, scanner.pos ];
      }
      tagIndex++;
      tokens.push(token);

      if (type === '#' || type === '^') {
        sections.push(token);
      } else if (type === '/') {
        // Check section nesting.
        openSection = sections.pop();

        if (!openSection)
          throw new Error('Unopened section "' + value + '" at ' + start);

        if (openSection[1] !== value)
          throw new Error('Unclosed section "' + openSection[1] + '" at ' + start);
      } else if (type === 'name' || type === '{' || type === '&') {
        nonSpace = true;
      } else if (type === '=') {
        // Set the tags for the next time around.
        compileTags(value);
      }
    }

    stripSpace();

    // Make sure there are no open sections when we're done.
    openSection = sections.pop();

    if (openSection)
      throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos);

    return nestTokens(squashTokens(tokens));
  }

  /**
   * Combines the values of consecutive text tokens in the given `tokens` array
   * to a single token.
   */
  function squashTokens (tokens) {
    var squashedTokens = [];

    var token, lastToken;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      token = tokens[i];

      if (token) {
        if (token[0] === 'text' && lastToken && lastToken[0] === 'text') {
          lastToken[1] += token[1];
          lastToken[3] = token[3];
        } else {
          squashedTokens.push(token);
          lastToken = token;
        }
      }
    }

    return squashedTokens;
  }

  /**
   * Forms the given array of `tokens` into a nested tree structure where
   * tokens that represent a section have two additional items: 1) an array of
   * all tokens that appear in that section and 2) the index in the original
   * template that represents the end of that section.
   */
  function nestTokens (tokens) {
    var nestedTokens = [];
    var collector = nestedTokens;
    var sections = [];

    var token, section;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      token = tokens[i];

      switch (token[0]) {
        case '#':
        case '^':
          collector.push(token);
          sections.push(token);
          collector = token[4] = [];
          break;
        case '/':
          section = sections.pop();
          section[5] = token[2];
          collector = sections.length > 0 ? sections[sections.length - 1][4] : nestedTokens;
          break;
        default:
          collector.push(token);
      }
    }

    return nestedTokens;
  }

  /**
   * A simple string scanner that is used by the template parser to find
   * tokens in template strings.
   */
  function Scanner (string) {
    this.string = string;
    this.tail = string;
    this.pos = 0;
  }

  /**
   * Returns `true` if the tail is empty (end of string).
   */
  Scanner.prototype.eos = function eos () {
    return this.tail === '';
  };

  /**
   * Tries to match the given regular expression at the current position.
   * Returns the matched text if it can match, the empty string otherwise.
   */
  Scanner.prototype.scan = function scan (re) {
    var match = this.tail.match(re);

    if (!match || match.index !== 0)
      return '';

    var string = match[0];

    this.tail = this.tail.substring(string.length);
    this.pos += string.length;

    return string;
  };

  /**
   * Skips all text until the given regular expression can be matched. Returns
   * the skipped string, which is the entire tail if no match can be made.
   */
  Scanner.prototype.scanUntil = function scanUntil (re) {
    var index = this.tail.search(re), match;

    switch (index) {
      case -1:
        match = this.tail;
        this.tail = '';
        break;
      case 0:
        match = '';
        break;
      default:
        match = this.tail.substring(0, index);
        this.tail = this.tail.substring(index);
    }

    this.pos += match.length;

    return match;
  };

  /**
   * Represents a rendering context by wrapping a view object and
   * maintaining a reference to the parent context.
   */
  function Context (view, parentContext) {
    this.view = view;
    this.cache = { '.': this.view };
    this.parent = parentContext;
  }

  /**
   * Creates a new context using the given view with this context
   * as the parent.
   */
  Context.prototype.push = function push (view) {
    return new Context(view, this);
  };

  /**
   * Returns the value of the given name in this context, traversing
   * up the context hierarchy if the value is absent in this context's view.
   */
  Context.prototype.lookup = function lookup (name) {
    var cache = this.cache;

    var value;
    if (cache.hasOwnProperty(name)) {
      value = cache[name];
    } else {
      var context = this, intermediateValue, names, index, lookupHit = false;

      while (context) {
        if (name.indexOf('.') > 0) {
          intermediateValue = context.view;
          names = name.split('.');
          index = 0;

          /**
           * Using the dot notion path in `name`, we descend through the
           * nested objects.
           *
           * To be certain that the lookup has been successful, we have to
           * check if the last object in the path actually has the property
           * we are looking for. We store the result in `lookupHit`.
           *
           * This is specially necessary for when the value has been set to
           * `undefined` and we want to avoid looking up parent contexts.
           *
           * In the case where dot notation is used, we consider the lookup
           * to be successful even if the last "object" in the path is
           * not actually an object but a primitive (e.g., a string, or an
           * integer), because it is sometimes useful to access a property
           * of an autoboxed primitive, such as the length of a string.
           **/
          while (intermediateValue != null && index < names.length) {
            if (index === names.length - 1)
              lookupHit = (
                hasProperty(intermediateValue, names[index])
                || primitiveHasOwnProperty(intermediateValue, names[index])
              );

            intermediateValue = intermediateValue[names[index++]];
          }
        } else {
          intermediateValue = context.view[name];

          /**
           * Only checking against `hasProperty`, which always returns `false` if
           * `context.view` is not an object. Deliberately omitting the check
           * against `primitiveHasOwnProperty` if dot notation is not used.
           *
           * Consider this example:
           * ```
           * Mustache.render("The length of a football field is {{#length}}{{length}}{{/length}}.", {length: "100 yards"})
           * ```
           *
           * If we were to check also against `primitiveHasOwnProperty`, as we do
           * in the dot notation case, then render call would return:
           *
           * "The length of a football field is 9."
           *
           * rather than the expected:
           *
           * "The length of a football field is 100 yards."
           **/
          lookupHit = hasProperty(context.view, name);
        }

        if (lookupHit) {
          value = intermediateValue;
          break;
        }

        context = context.parent;
      }

      cache[name] = value;
    }

    if (isFunction(value))
      value = value.call(this.view);

    return value;
  };

  /**
   * A Writer knows how to take a stream of tokens and render them to a
   * string, given a context. It also maintains a cache of templates to
   * avoid the need to parse the same template twice.
   */
  function Writer () {
    this.templateCache = {
      _cache: {},
      set: function set (key, value) {
        this._cache[key] = value;
      },
      get: function get (key) {
        return this._cache[key];
      },
      clear: function clear () {
        this._cache = {};
      }
    };
  }

  /**
   * Clears all cached templates in this writer.
   */
  Writer.prototype.clearCache = function clearCache () {
    if (typeof this.templateCache !== 'undefined') {
      this.templateCache.clear();
    }
  };

  /**
   * Parses and caches the given `template` according to the given `tags` or
   * `mustache.tags` if `tags` is omitted,  and returns the array of tokens
   * that is generated from the parse.
   */
  Writer.prototype.parse = function parse (template, tags) {
    var cache = this.templateCache;
    var cacheKey = template + ':' + (tags || mustache.tags).join(':');
    var isCacheEnabled = typeof cache !== 'undefined';
    var tokens = isCacheEnabled ? cache.get(cacheKey) : undefined;

    if (tokens == undefined) {
      tokens = parseTemplate(template, tags);
      isCacheEnabled && cache.set(cacheKey, tokens);
    }
    return tokens;
  };

  /**
   * High-level method that is used to render the given `template` with
   * the given `view`.
   *
   * The optional `partials` argument may be an object that contains the
   * names and templates of partials that are used in the template. It may
   * also be a function that is used to load partial templates on the fly
   * that takes a single argument: the name of the partial.
   *
   * If the optional `tags` argument is given here it must be an array with two
   * string values: the opening and closing tags used in the template (e.g.
   * [ "<%", "%>" ]). The default is to mustache.tags.
   */
  Writer.prototype.render = function render (template, view, partials, tags) {
    var tokens = this.parse(template, tags);
    var context = (view instanceof Context) ? view : new Context(view, undefined);
    return this.renderTokens(tokens, context, partials, template, tags);
  };

  /**
   * Low-level method that renders the given array of `tokens` using
   * the given `context` and `partials`.
   *
   * Note: The `originalTemplate` is only ever used to extract the portion
   * of the original template that was contained in a higher-order section.
   * If the template doesn't use higher-order sections, this argument may
   * be omitted.
   */
  Writer.prototype.renderTokens = function renderTokens (tokens, context, partials, originalTemplate, tags) {
    var buffer = '';

    var token, symbol, value;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      value = undefined;
      token = tokens[i];
      symbol = token[0];

      if (symbol === '#') value = this.renderSection(token, context, partials, originalTemplate);
      else if (symbol === '^') value = this.renderInverted(token, context, partials, originalTemplate);
      else if (symbol === '>') value = this.renderPartial(token, context, partials, tags);
      else if (symbol === '&') value = this.unescapedValue(token, context);
      else if (symbol === 'name') value = this.escapedValue(token, context);
      else if (symbol === 'text') value = this.rawValue(token);

      if (value !== undefined)
        buffer += value;
    }

    return buffer;
  };

  Writer.prototype.renderSection = function renderSection (token, context, partials, originalTemplate) {
    var self = this;
    var buffer = '';
    var value = context.lookup(token[1]);

    // This function is used to render an arbitrary template
    // in the current context by higher-order sections.
    function subRender (template) {
      return self.render(template, context, partials);
    }

    if (!value) return;

    if (isArray(value)) {
      for (var j = 0, valueLength = value.length; j < valueLength; ++j) {
        buffer += this.renderTokens(token[4], context.push(value[j]), partials, originalTemplate);
      }
    } else if (typeof value === 'object' || typeof value === 'string' || typeof value === 'number') {
      buffer += this.renderTokens(token[4], context.push(value), partials, originalTemplate);
    } else if (isFunction(value)) {
      if (typeof originalTemplate !== 'string')
        throw new Error('Cannot use higher-order sections without the original template');

      // Extract the portion of the original template that the section contains.
      value = value.call(context.view, originalTemplate.slice(token[3], token[5]), subRender);

      if (value != null)
        buffer += value;
    } else {
      buffer += this.renderTokens(token[4], context, partials, originalTemplate);
    }
    return buffer;
  };

  Writer.prototype.renderInverted = function renderInverted (token, context, partials, originalTemplate) {
    var value = context.lookup(token[1]);

    // Use JavaScript's definition of falsy. Include empty arrays.
    // See https://github.com/janl/mustache.js/issues/186
    if (!value || (isArray(value) && value.length === 0))
      return this.renderTokens(token[4], context, partials, originalTemplate);
  };

  Writer.prototype.indentPartial = function indentPartial (partial, indentation, lineHasNonSpace) {
    var filteredIndentation = indentation.replace(/[^ \t]/g, '');
    var partialByNl = partial.split('\n');
    for (var i = 0; i < partialByNl.length; i++) {
      if (partialByNl[i].length && (i > 0 || !lineHasNonSpace)) {
        partialByNl[i] = filteredIndentation + partialByNl[i];
      }
    }
    return partialByNl.join('\n');
  };

  Writer.prototype.renderPartial = function renderPartial (token, context, partials, tags) {
    if (!partials) return;

    var value = isFunction(partials) ? partials(token[1]) : partials[token[1]];
    if (value != null) {
      var lineHasNonSpace = token[6];
      var tagIndex = token[5];
      var indentation = token[4];
      var indentedValue = value;
      if (tagIndex == 0 && indentation) {
        indentedValue = this.indentPartial(value, indentation, lineHasNonSpace);
      }
      return this.renderTokens(this.parse(indentedValue, tags), context, partials, indentedValue);
    }
  };

  Writer.prototype.unescapedValue = function unescapedValue (token, context) {
    var value = context.lookup(token[1]);
    if (value != null)
      return value;
  };

  Writer.prototype.escapedValue = function escapedValue (token, context) {
    var value = context.lookup(token[1]);
    if (value != null)
      return mustache.escape(value);
  };

  Writer.prototype.rawValue = function rawValue (token) {
    return token[1];
  };

  var mustache = {
    name: 'mustache.js',
    version: '4.0.0',
    tags: [ '{{', '}}' ],
    clearCache: undefined,
    escape: undefined,
    parse: undefined,
    render: undefined,
    Scanner: undefined,
    Context: undefined,
    Writer: undefined,
    /**
     * Allows a user to override the default caching strategy, by providing an
     * object with set, get and clear methods. This can also be used to disable
     * the cache by setting it to the literal `undefined`.
     */
    set templateCache (cache) {
      defaultWriter.templateCache = cache;
    },
    /**
     * Gets the default or overridden caching object from the default writer.
     */
    get templateCache () {
      return defaultWriter.templateCache;
    }
  };

  // All high-level mustache.* functions use this writer.
  var defaultWriter = new Writer();

  /**
   * Clears all cached templates in the default writer.
   */
  mustache.clearCache = function clearCache () {
    return defaultWriter.clearCache();
  };

  /**
   * Parses and caches the given template in the default writer and returns the
   * array of tokens it contains. Doing this ahead of time avoids the need to
   * parse templates on the fly as they are rendered.
   */
  mustache.parse = function parse (template, tags) {
    return defaultWriter.parse(template, tags);
  };

  /**
   * Renders the `template` with the given `view` and `partials` using the
   * default writer. If the optional `tags` argument is given here it must be an
   * array with two string values: the opening and closing tags used in the
   * template (e.g. [ "<%", "%>" ]). The default is to mustache.tags.
   */
  mustache.render = function render (template, view, partials, tags) {
    if (typeof template !== 'string') {
      throw new TypeError('Invalid template! Template should be a "string" ' +
                          'but "' + typeStr(template) + '" was given as the first ' +
                          'argument for mustache#render(template, view, partials)');
    }

    return defaultWriter.render(template, view, partials, tags);
  };

  // Export the escaping function so that the user may override it.
  // See https://github.com/janl/mustache.js/issues/244
  mustache.escape = escapeHtml;

  // Export these mainly for testing, but also for advanced usage.
  mustache.Scanner = Scanner;
  mustache.Context = Context;
  mustache.Writer = Writer;

  // EXPORTING
  root.Schema = mustache;
}(this));
/**
 * Utilidades varias
 * @namespace uSchema
 * @property {Array} typesAccepted Lista de tipos aceptados para ser procesados.
 */
const uSchema = {

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
          retorno = value.hasOwnProperty('type') ? value.type : 'object';
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
  this.schema = Object.assign({}, obj);
  this.missings = {
    required: [],
    optional: []
  };
  this.different = {};
  this.errors = [];
  this.compiled = {};
};

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
          const typesValid = valPropSchema.filter(function (type) {
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
      if (valPropSchema.default) _this.compiled[property] = valPropSchema.default;
    }
  });

  // Returning
  return retorno;
};

/**
 * Utilidad para retornar errores.
 * @param {String} type Tipo de error a mostrar
 * @param {String} message Descripción del error
 */
const regError = function (name, message) {
  const err = new Error();
  err.name = name;
  err.message = message;
  console.log(err);
  return err;
};

/**
 * Crea la instancia principal del 'Smart'
 * @constructor
 * @param {obj} obj Objeto con configuraciones
 * @returns {Smart} Instancia del constructor 'Smart'
 */
function Smart(obj) {
  if (!obj) obj = {};
  SmartEvents.call(this);
  this.components = new Map();
  this.modules = new Map();
};
Smart.prototype = Object.create(SmartEvents.prototype);
Smart.prototype.constructor = Smart;

/**
 * Creador de un 'Smart Event'.
 * @constructor
 */
function SmartEvents () {
  this.events = null;
};

/**
 * Se suscribe a un evento
 * @param {String} name Nombre del evento a suscribirce.
 * @param {Function} cb Callback del evento.
 */
SmartEvents.prototype.addEventListener = function (name, cb){
  if (!this.events) this.events = {};
  (this.events[name]) ? this.events[name].push(cb) : this.events[name] = [cb];
};

/**
 * Dispara las funciones anidadas a un evento determinado adjunto.
 * @param {String} name Nombre del evento
 * @param {*} [data1] Data arbitraria pasada en el disparo del evento.
 * @param {*} [data2] Data arbitraria pasada en el disparo del evento.
 */
SmartEvents.prototype.dispatchEvent = function (name, data1, data2) {
  if (this.events && this.events[name]) {
    const _this = this
    this.events[name].forEach(function (cb) {
      cb.call(_this, data1, data2);
    })
  }
};

/**
 * Elimina un evento suscrito. Si no se determina una función en el segundo parametro, todos las funciones suscritas al evento serán removidas.
 * @param {String} name Nombre del evento a desuscribirce.
 * @param {Function} [cb] Function a desuscribir del evento.
 */
SmartEvents.prototype.removeEventListener = function (name, cb) {
  if (this.events && this.events[name]) {
    const event = this.events[name];
    if (event) {
      if (cb === undefined) {
        delete this.events[name];
      } else {
        const nEvents = event.length;
        let e;
        for (e = 0; e < nEvents; e++) {
          if (event[e] === cb) {
            this.events[name].splice(e, 1);
            if (!this.events[name].length) delete this.events[name];
            break;
          }
        }
      }
      // Nuleamos si no hay ningún evento.
      if (!Object.keys(this.events).length) this.events = null;
    }
  }
};

/**
 * Constructor de un 'Smart Element'
 * @constructor
 * @param {String} name Nombre del elemento.
 * @param {Object} [obj] Objeto de opciones del elemento.
 */
Smart.prototype.registerComponent = function (name, obj) {
  if (typeof name !== 'string') return regError('Nombre Inadecuado', 'No se declaró correctamente el nombre del componente a registrar.');
  if (this.components.has(name)) return regError('Componente Duplicado', 'Ya se había registrado el componente "' + name + '".');
  if (!obj) obj = {};

  // Creating constructor
  function SmartRegisterComponent () {
    SmartEvents.call(this, name);
  };
  SmartRegisterComponent.prototype = Object.create(SmartEvents.prototype);
  SmartRegisterComponent.prototype.constructor = SmartRegisterComponent;


  // Saving in vault
  const componentsOptions = {
    styles: obj.styles || null,
    schema: obj.schema || null,
    template: obj.template || null,
    constructor: SmartRegisterComponent,
    instance: new SmartRegisterComponent()
  };
  this.components.set(name, componentsOptions);

  // Notifier
  const notiData = Object.assign({}, componentsOptions);
  delete notiData.constructor;
  delete notiData.instance;

  // Noti global
  this.dispatchEvent('component:registered', name, notiData);

  // Noti local
  setTimeout(function () {
    componentsOptions.instance.dispatchEvent('registered', notiData);
  }, 0);
  
  return componentsOptions.instance;
};


/**
 * Crea un 'Smart Node' tipo elemento.
 * @param {String} name nombre del 'Smart Node' a crear.
 */
Smart.prototype.createComponent = function (name, obj) {
  if (!obj) obj = {};
  if (!this.components.has(name)) return regError('Componente Inexistente', 'No se puede crear el componente "' + name + '", porque no está registrado.');

  // Getting componente
  const component = this.components.get(name);

  // Building Data (with the schema)
  let cData = null;
  if (component.hasOwnProperty('schema')) {
    const cSchema = new Schema(component.schema);
    if (!cSchema.validate(obj)) return regError('Data inválida', 'No fué posible crear el componente "' + name + '", ya que su data es inválida.');
    cData = cSchema.compile();
  };

  // Building template
  let cTemplate = null;
  if (component.hasOwnProperty('template')) {
    // creating DOM Nodes
    const divTemp = document.createElement('div');
    divTemp.innerHTML = Mustache.render(component.template, cData);
    cTemplate = divTemp.firstChild;
  };

  // Executing the script
  if (component.hasOwnProperty('script')) {
    const _this = this;
    if (cTemplate) {
      const ctargets = cTemplate.querySelectorAll('[component]');
      if (ctargets.length) {
        Array.prototype.forEach.call(ctargets, function (target) {
          component.script.call(_this, target, cData);
        });
      }
    } else {
      component.script.call(_this, null, cData);
    }
  };

  // Inserting styles, if have styles
  if (component.hasOwnProperty('styles')) {
    const tagStyle = document.createElement('style');
    tagStyle.type = 'text/css';
    tagStyle.innerHTML = component.styles;
    tagStyle.id = name;
    document.body.appendChild(tagStyle);
  };

  // Noti global
  this.dispatchEvent('component:registered', name, cTemplate);

  // Noti local
  setTimeout(function () {
    component.instance.dispatchEvent('created', cTemplate);
  }, 0);

  // Return instance
  return component.instance;
};




  // Export SmartJS
  if (typeof module === "object" && module.exports) {
    module.exports = Smart;
  } else {
    root.Smart = Smart;
  }
})(this);