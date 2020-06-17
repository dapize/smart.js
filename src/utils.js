const utils = {};

/**
 * Utilidad para retornar errores.
 * @param {String} type Tipo de error a mostrar
 * @param {String} message Descripción del error
 */
utils.regError = function (name, message) {
  const err = new Error();
  err.name = name;
  err.message = message;
  console.log(err);
  return err;
};

/**
 * Convierte un arrayLiked en un array real.
 * @param {NodeList} list Lista arrayLiked
 * @return {Array}
 */
utils.toArray = function (list) {
  return Array.prototype.map.call(list, function (node) {
    return node;
  });
};

/**
 * Procesa los atributos de un nodo de forma recursiva.
 * @param {Array} attrs Lista de atributos del nodo
 * @param {Object} node Nodo vivo HTML
 * @param {Function} cb Callback
 */
utils.attrsCleaner = function (attrs, node, cb) {
  const attr = attrs.shift();
  if (attr.value === '[]') node.removeAttribute(attr.name);
  if (!attrs.length) return cb();
  this.attrsCleaner(attrs, node, cb);
};

/**
 * Procesa una lista de nodos
 * @param {Array} nodes Lista de nodos vivos HTML
 * @param {Function} cb Callback
 */
utils.nodeCleaner = function (nodes, cb) {
  const _this = this;
  const node = nodes.shift();
  let attrs = node.attributes;
  if (!attrs.length) return cb();
  attrs = this.toArray(attrs);
  this.attrsCleaner(attrs, node, function () {
    if (!nodes.length) return cb();
    _this.nodeCleaner(nodes, cb);
  });
};

/**
 * Procesa una lista de nodos
 * @param {Object} instance Instancia del Layouter
 * @param {Node} node Nodo HTML
 * @param {Function} cb Callback
 */
utils.layouter = function (instance, node, cb) {
  const nodes = node.querySelectorAll('[cols], [pad], [padt], [padr], [padb], [padl], [mar], [mart], [marr], [marb], [marl], [flex]');
  if (!nodes.length) return cb();
  const setNodes = new Set();
  Array.prototype.forEach.call(nodes, function (iNode) {
    if (iNode.nodeName.toLowerCase().substring(0, 2) !== 'c-') setNodes.add(iNode);
  });
  setNodes.forEach(function (div) {
    instance.set(div)
  });
  cb();
};

/**
 * Notifica de forma local o global
 * @param {Object} _this Instancia Smart.
 * @param {Object} componentInstance Instancia del componente
 * @param {String} eventName Nombre del evento
 * @param {String} componentName Nombre del componente
 * @param {Object|Node} data Data del componente o Nodo HTML
 */
utils.notify = function (_this, componentInstance, eventName, componentName, data) {
  // Noti global
  _this.dispatchEvent('component:' + eventName, componentName, data);

  // Noti local
  setTimeout(function () {
    componentInstance.dispatchEvent(eventName, data);
  }, 0);
};

Smart.prototype.utils = utils;