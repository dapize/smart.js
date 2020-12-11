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
