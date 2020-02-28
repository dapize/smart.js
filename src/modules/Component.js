/**
 * Constructor de un 'Smart Element'
 * @constructor
 * @param {String} name Nombre del elemento.
 * @param {Object} [obj] Objeto de opciones del elemento.
 */
Smart.prototype.registerComponent = function (name, obj) {
  if (typeof name !== 'string') return regError('Nombre Inadecuado', 'No se declaró correctamente el nombre del componente a registrar.');
  if (this.components.has(name)) return regError('Componente Duplicado', 'Ya se había registrado el componente "' + name + '".');
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
    script: obj.script || null,
    constructor: SmartRegisterComponent,
    instance: new SmartRegisterComponent()
  };
  this.components.set(name, componentsOptions);

  // Notifier
  const notiData = Object.assign({}, componentsOptions);
  delete notiData.constructor;
  delete notiData.instance;

  // Noti global
  this.dispatchEvent('component:registered', name, notiData);

  // Noti local
  setTimeout(function () {
    componentsOptions.instance.dispatchEvent('registered', notiData);
  }, 0);
  
  return componentsOptions.instance;
};


/**
 * Crea un 'Smart Node' tipo elemento.
 * @param {String} name nombre del 'Smart Node' a crear.
 */
Smart.prototype.createComponent = function (name, obj) {
  if (!obj) obj = {};
  if (!this.components.has(name)) return regError('Componente Inexistente', 'No se puede crear el componente "' + name + '", porque no está registrado.');

  // Getting componente
  const component = this.components.get(name);

  // Building Data (with the schema)
  let cData = null;
  if (component.hasOwnProperty('schema')) {
    const cSchema = new Schema(component.schema);
    if (!cSchema.validate(obj)) return regError('Data inválida', 'No fué posible crear el componente "' + name + '", ya que su data es inválida.');
    cData = cSchema.compile();
  };

  // Building template
  let cTemplate = null, divTemp = null;
  if (component.hasOwnProperty('template')) {
    // creating DOM Nodes
    divTemp = document.createElement('div');
    divTemp.innerHTML = Mustache.render(component.template, cData);
    // Cleaning options attributes
    let attrs;
    Array.prototype.forEach.call(divTemp.querySelectorAll('*'), function (node) {
      attrs = node.attributes;
      if (attrs.length) {
        Array.prototype.forEach.call(attrs, function (attr) {
          if (attr.value === '[]') setTimeout(function () { node.removeAttribute(attr.name) }, 0);
        });
      }
    });
    cTemplate = divTemp.firstChild;
  };

  // Executing the script
  if (component.hasOwnProperty('script')) {
    const _this = this;
    if (cTemplate) {
      const ctargets = divTemp.querySelectorAll('[component]');
      if (ctargets.length) {
        Array.prototype.forEach.call(ctargets, function (target) {
          component.script.call(_this, target, cData);
          target.removeAttribute('component');
        });
      }
    } else {
      component.script.call(_this, null, cData);
    }
  };

  // Inserting styles, if have styles
  if (component.hasOwnProperty('styles')) {
    const tagStyle = document.createElement('style');
    tagStyle.type = 'text/css';
    tagStyle.innerHTML = component.styles;
    tagStyle.id = name;
    document.body.appendChild(tagStyle);
  };

  // Noti global
  this.dispatchEvent('component:created', name, cTemplate);

  // Noti local
  setTimeout(function () {
    component.instance.dispatchEvent('created', cTemplate);
  }, 0);

  // Return instance
  return component.instance;
};
