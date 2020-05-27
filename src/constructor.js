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
};
Smart.prototype = Object.create(SmartEvents.prototype);
Smart.prototype.constructor = Smart;
