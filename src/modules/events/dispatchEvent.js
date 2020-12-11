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
