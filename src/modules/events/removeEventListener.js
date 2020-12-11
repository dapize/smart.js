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
