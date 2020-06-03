/**
 * Constructor de un 'Smart Element'
 * @constructor
 * @param {String} name Nombre del elemento.
 * @param {Object} [obj] Objeto de opciones del elemento.
 */
Smart.prototype.registerComponent = function (name, obj) {
  if (typeof name !== 'string') return this.utils.regError('Nombre Inadecuado', 'No se declaró correctamente el nombre del componente a registrar.');
  if (this.components.has(name)) return this.utils.regError('Componente Duplicado', 'Ya se había registrado el componente "' + name + '".');
  if (!obj) obj = {};

  // Creating constructor
  function SmartRegisterComponent () {
    SmartEvents.call(this, name);
  };
  SmartRegisterComponent.prototype = Object.create(SmartEvents.prototype);
  SmartRegisterComponent.prototype.constructor = SmartRegisterComponent;


  // Saving in vault
  const componentOpts = {
    schema: obj.schema ? new Schema(obj.schema) : null,
    template: obj.template || null,
    script: obj.script || null,
    constructor: SmartRegisterComponent,
    instance: new SmartRegisterComponent()
  };
  this.components.set(name, componentOpts);

  // Inserting styles, if have styles
  if (obj.hasOwnProperty('styles')) {
    const tagStyle = document.createElement('style');
    tagStyle.type = 'text/css';
    tagStyle.innerHTML = obj.styles;
    tagStyle.id = name;
    document.body.appendChild(tagStyle);
  };

  // Notifier
  const notiData = Object.assign({}, componentOpts);
  delete notiData.constructor;
  delete notiData.instance;
  this.utils.notify(this, componentOpts.instance, 'registered', name, notiData);

  return componentOpts.instance;
};


/**
 * Crea un 'Smart Node' tipo elemento.
 * @param {String} name nombre del 'Smart Node' a crear.
 */
Smart.prototype.createComponent = function (name, obj) {
  if (!obj) obj = {};
  if (!this.components.has(name)) return this.utils.regError('Componente Inexistente', 'No se puede crear el componente "' + name + '", porque no está registrado.');
  const _this = this;

  // Getting componente
  const component = this.components.get(name);

  // Building Data (with the schema)
  let cData = null;
  if (component.hasOwnProperty('schema')) {
    if (!component.schema.validate(obj)) return this.utils.regError('Data inválida', 'No fué posible crear el componente "' + name + '", ya que su data es inválida.');
    console.log('la data a compilar es: ', obj);
    cData = component.schema.compile(obj);
    console.log('la data compilada es: ', cData);
  };

  // Building template
  if (component.hasOwnProperty('template')) {
    // creating DOM Nodes
    const divTemp = document.createElement('div');
    divTemp.innerHTML = cData ? Mustache.render(component.template, cData) : component.template;

    // Cleaning optionals attributes
    let allNodes = this.utils.toArray(divTemp.querySelectorAll('*'));
    this.utils.nodeCleaner(allNodes, function () {
      // layouter executing
      _this.utils.layouter(_this.layouter, divTemp, function () {

        // Executing the script with template
        const nodeComponent = divTemp.querySelector('[component]');
        if (nodeComponent) {
          component.script.call(_this, nodeComponent, cData);
          nodeComponent.removeAttribute('component');
        };

        // Notifier
        _this.utils.notify(_this, component.instance, 'created', name, divTemp.firstChild);
      });
    });
  } else {
    // Executing the script withouth template
    if (component.hasOwnProperty('script')) component.script.call(_this, null, cData);

    // Notifier
    this.utils.notify(this, component.instance, 'created', name, null);
  };
  
  // Return instance
  return component.instance;
};
