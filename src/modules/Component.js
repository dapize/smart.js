/**
 * Constructor de un 'Smart Element'
 * @constructor
 * @param {String} name Nombre del elemento.
 * @param {Object} [obj] Objeto de opciones del elemento.
 */
Smart.prototype.registerComponent = function (name, obj) {
  if (typeof name !== 'string') return regError('Nombre Inadecuado', 'No se declaró correctamente el nombre del componente a registrar.');
  if (this.components.has(name)) return regError('Componente Duplicado', 'Ya se había registrado el componente ' + name);
  if (!obj) obj = {};

  // Creating constructor
  function SmartRegisterComponent () {
    SmartEvents.call(this, name);
  };
  SmartRegisterComponent.prototype = Object.create(SmartEvents.prototype);
  SmartRegisterComponent.prototype.constructor = SmartRegisterComponent;


  // Saving in vault
  const componentsOptions = {
    styles: obj.styles || null,
    schema: obj.schema || null,
    template: obj.template || null,
    constructor: SmartRegisterComponent,
    instance: new SmartRegisterComponent()
  };
  this.components.set(name, componentsOptions);

  // Notifier
  const notiData = Object.assign({
    name: name,
  }, componentsOptions);
  delete notiData.constructor;
  delete notiData.instance;

  // Noti global
  this.dispatchEvent('component:registered', notiData);

  // Noti local
  setTimeout(function () {
    let dataLocal = Object.assign({}, notiData);
    delete dataLocal.name;
    componentsOptions.instance.dispatchEvent('registered', dataLocal);
  }, 0);
  
  return componentsOptions.instance;
};


/**
 * Crea un 'Smart Node' tipo elemento.
 * @param {String} name nombre del 'Smart Node' a crear.
 */
Smart.prototype.createComponent = function (name, obj) {
  if (!this.components.has(name)) return regError('Componente Inexistente', 'No se puede crear un componente no registrado.');
  const objData = obj || {};

  // Getting componente
  const component = this.components.get(name);


  // Notifier
  component.instance.dispatchEvent('created', objData);
  this.dispatchEvent('component:created', Object.assign({name: name}, objData));
  
  // Return instance
  return new fnConstructor(name);
};
