/**
 * Callback del método createComponent.
 * @callback createCallBack
 * @param {?Object} node Primer nodo del template.
 * @param {?Object} data Propiedades del componente.
 * @param {?Function} fn Clase del componente.
 * @param {?Object} instance Instancia del componente.
 */

/**
 * Crea un Smart Component.
 * @param {String} name nombre del componente.
 * @param {Object} [props={}] Propiedades del componente a crear.
 * @param {createCallBack} [cb] Callback del método. Retorna 2 argumentos: Node, Data.
 * @returns {Object} Instancia del componente.
 */
Smart.prototype.createComponent = function (name, props, cb) {
  if (!props) props = {};
  if (!this.registered.has(name))
    return this.utils.regError("Componente Inexistente", 'No se puede crear el componente "' + name + '", porque no está registrado.');
  const _this = this;

  // Getting componente
  const component = this.registered.get(name);

  // Building Data (with the schema)
  let cData = null;
  if (component.schema) {
    if (!component.schema.validate(props)) {
      return this.utils.regError("Data inválida", 'No fué posible crear el componente "' + name + '", ya que su data es inválida.', {
        different: component.schema.different,
        missings: {
          required: component.schema.missings.required,
          optional: component.schema.missings.optional
        },
        errors: component.schema.errors
      });
    }
    cData = component.schema.compile(props);
  };

  // Building template
  if (!component.template) {
    let comptInstance;
    if (component.script) comptInstance = new component.script(_this, null, cData);

    // Notifier
    this.notifyComponent("created", component.instance, {
      name: name
    });
    if (cb) cb(null, cData, component.script, comptInstance);
    return component.instance;
  };

  // creating DOM Nodes
  const divTemp = document.createElement("div");
  divTemp.innerHTML = cData ? Sqrl.render(component.template, cData) : component.template;

  // Nodes Iteration
  const nodesInside = divTemp.querySelectorAll("*");
  if (nodesInside.length) {
    this.utils.forRecur(nodesInside, function (node, forCb) {
      let attrs = node.attributes;
      if (!attrs.length) return forCb();
      attrs = _this.utils.toArray(attrs);
      _this.utils.attrsCleaner(attrs, node, forCb);
    }, function () {
      // Executing the script with template
      let comptInstance;
      if (component.script) {
        let nodeComponent = divTemp.querySelector("[component]");
        if (nodeComponent) nodeComponent.removeAttribute("component");
        comptInstance = new component.script(_this, nodeComponent, cData);
        if (component.script.prototype.created) comptInstance.created();
      };

      // Notifier
      const firstNode = divTemp.children[0];
      _this.notifyComponent("created", component.instance, {
        name: name,
        node: firstNode
      });
      if (cb) cb(firstNode, cData, component.script, comptInstance);
    });

  } else {
    // Executing the script with template
    let comptInstance;
    if (component.script) {
      comptInstance = new component.script(this, null, cData);
      if (component.script.prototype.created) comptInstance.created();
    };

    // Notifier
    this.notifyComponent("created", component.instance, {
      name: name
    });
    if (cb) cb(null, cData, component.script, comptInstance);
  };

  // Return instance
  return component.instance;
};
