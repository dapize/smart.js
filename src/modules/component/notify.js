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
