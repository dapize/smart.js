/**
 * Registra un Smart Componente
 * @param {String} name Nombre del elemento.
 * @param {Object} [obj={}] Objeto de opciones del elemento.
 * @param {Object} [obj.schema] Schema del componente
 * @param {String} [obj.template] HTML String del componente
 * @param {Function} [obj.script] Clase del componente
 * @returns {Object} Instancia del componente.
 */
Smart.prototype.registerComponent = function (name, obj) {
  if (this.registered.has(name))
    return this.utils.regError(
      "Componente Duplicado",
      'Ya se había registrado el componente "' + name + '".'
    );
  if (!obj) obj = {};

  // Inserting styles, if have styles of course
  if (obj.styles) {
    const tagStyle = document.createElement("style");
    tagStyle.type = "text/css";
    tagStyle.innerHTML = obj.styles;
    tagStyle.id = name;
    document.body.appendChild(tagStyle);
  };

  // Creating constructor
  function CompInstace() {
    SmartEvents.call(this, name);
  }
  CompInstace.prototype = Object.create(SmartEvents.prototype);
  CompInstace.prototype.constructor = CompInstace;

  // Saving in vault
  const componentOpts = {
    schema: obj.schema ? new Schema(obj.schema) : null,
    styles: obj.styles || null,
    template: obj.template || null,
    script: obj.script || null,
    constructor: CompInstace,
    instance: new CompInstace(),
  };
  this.registered.set(name, componentOpts);

  // Notifier
  const notiData = Object.assign({}, componentOpts);
  delete notiData.constructor;
  delete notiData.instance;
  this.notifyComponent("registered", componentOpts.instance, {
    name: name,
    data: notiData
  });
  return componentOpts.instance;
};
