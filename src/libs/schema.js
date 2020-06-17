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
    if (!obj) return console.log('Object missing ', obj);
    this.schema = Object.assign({}, obj);
    uSchema.initValues(this);
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