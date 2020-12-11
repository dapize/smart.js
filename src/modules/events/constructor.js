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
