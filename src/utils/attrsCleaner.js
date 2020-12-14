/**
 * Procesa los atributos opcionales de un nodo de forma recursiva
 * @param {Array} attrs Lista de atributos del nodo
 * @param {Object} node Nodo vivo HTML
 * @param {Function} cb Callback
 */
Smart.prototype.utils.attrsCleaner = function (attrs, node, cb) {
  const attr = attrs.shift();
  const valueTrim = attr.value.trim();
  if (valueTrim === "[]" || valueTrim === "[undefined]" || valueTrim === "undefined") {
    if (attr.name === 'value') node.value = ''; // fallback para IE
    node.removeAttribute(attr.name);
  } else {
    const lengthVal = attr.value.length;
    if (attr.value.substring(0, 1) === '[' && attr.value.substring(lengthVal - 1) === ']') {
      node.setAttribute(attr.name, attr.value.substring(1, lengthVal - 1));
    }
  }
  if (!attrs.length) return cb();
  this.attrsCleaner(attrs, node, cb);
};
