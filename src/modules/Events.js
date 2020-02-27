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
 * @param {Object} [data] Data arbitraria pasada en el disparo del evento.
 */
SmartEvents.prototype.dispatchEvent = function (name, data) {
  if (this.events && this.events[name]) {
    const _this = this
    this.events[name].forEach(function (cb) {
      cb.call(_this, data);
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
