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
