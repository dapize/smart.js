// Utils for buildComponent
const uBc = function (App, name, node, cb) {
  this.App = App;

  this.name = name;

  this.gross = node;
  this.constructed = null;

  this.cb = cb;

  this.instance = null;
  this.data = null;
  this.constr = null;
};

uBc.prototype.saveData = function (node) {
  const props = this.App.utils.getProps(node);
  if (props && props.hasOwnProperty('id') && !this.App.data.has(props.id)) {
    this.App.data.set(props.id, {
      innerHTML: node.innerHTML.trim(),
      outerHTML: node.outerHTML.trim(),
      props: props
    })
  }
  return props;
};

uBc.prototype.created = function (node, props, constr, instance) {
  const _this = this;

  // caching elements getted
  this.constructed = node;
  this.props = props;
  this.constr = constr;
  this.instance = instance;

  // returning if...
  if (!node) return this.builded(); // ... the component haven't body (withouth node HTML)

  // Content Node
  const contentNode = node.hasAttribute('content') ? node : node.querySelector('[content]');

  // Searching if exists node in the template of the component construyed
  const compsInside = this.App.searchComponents(node);
  if (!compsInside.length) {
    this.haveChildren(this.gross, function (childs) {
      childs.length ? _this.childrens(childs, contentNode) : _this.builded();
    });
    return false;
  };

  // Processing components inside
  this.App.utils.forRecur(compsInside, function (compNode, forCB) {
    _this.App.buildComponent(compNode, function (obj) {
      if (obj.node) {
        _this.App.mountComponent({
          gross: compNode,
          builded: obj.node,
          props: obj.props
        }, forCB);
      } else {
        forCB();
      }
    })
  }, function () {
    _this.haveChildren(_this.gross, function (childs) {
      childs.length ? _this.childrens(childs, contentNode) : _this.builded();
    });
  })
};

uBc.prototype.builded = function () {
  const detail = {
    node: this.constructed,
    props: this.props
  };

  // Saving the Node builded
  this.App.builded.set(this.gross, {
    node: this.constructed,
    props: this.props
  });

  // Event Builded

  // ...by Node
  if (this.gross) {
    this.gross.dispatchEvent(new CustomEvent('builded', {
      detail: detail
    }));
  };

  // ... by App
  this.App.notifyComponent('builded', false, Object.assign({
    name: this.name
  }, detail));

  if (this.constr && this.constr.prototype['builded']) this.instance['builded'](detail);

  // FN Callback, if exists of course
  if (this.cb) this.cb({
    node: this.constructed,
    props: this.props
  });
};

uBc.prototype.haveChildren = function (node, cb) {
  let childs = node.childNodes;
  if (!childs.length) return cb([]);
  const arrNodes = [];
  this.App.utils.forRecur(childs, function (child, fCb) {
    if (child.nodeType === 3) {
      if (child.textContent.trim()) arrNodes.push(child);
    } else {
      arrNodes.push(child);
    }
    fCb();
  }, function () {
    cb(arrNodes);
  });
};

uBc.prototype.childrens = function (childs, contentNode) {
  const _this = this;
  if (!contentNode) return this.App.utils.regError('Falta Nodo contenedor', 'El componente ' + node.outerHTML + ' tiene nodos hijos pero no se a determinado el nodo que los contendrá.');
  this.App.utils.forRecur(childs, function (child, cb) {
    contentNode.appendChild(child);
    cb();
  }, function () {
    _this.builded();
  })
};

/**
 * Callback de método BuildComponent
 * @callback buildCallBack
 * @param {?Object} node Nodo HTML en estado bruto del componente
 * @param {?Object} component Nodo HTML yá construido del componente
 * @param {?Object} props Propiedades del componente. OJO: son propiedades, no atributos.
 */

/**
 * Construye un componente o componentes que este nodo contiene.
 * @param {Object} node Nodo HTML tipo componente
 * @param {buildCallBack} [cb] Function callback.
 */
Smart.prototype.buildComponent = function (node, cb) {
  // check if the node passed if a component
  const name = this.utils.isComponent(node); // return a 'Truthy value' (name of the component)
  if (!name) return this.utils.regError('Componente inválido', 'El Nodo pasado NO es un componente, no se puede procesar');

  // The component is builded already.
  if (this.builded.has(node)) return this.utils.regError('Ya construido', 'El Componente yá a sido construido.');

  // Instance Builded
  const instUbc = new uBc(this, name, node, cb);

  // getting the props of the componente
  const props = instUbc.saveData(node);

  // Procesing...
  if (!this.registered.has(name)) return this.utils.regError('Sin registrar', 'El componente "' + name + '" no puede ser construido porque no a sido registrado previamente.');
  this.createComponent(name, props, instUbc.created.bind(instUbc)); // if is registered already
};
