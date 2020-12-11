/**
 * Identifica si un Node es componente o no.
 * @param {Object} Node Nodo HTML a verificar.
 * @returns {(Boolean|String)} Name of the component, or false if is not a component.
 */
Smart.prototype.utils.isComponent = function (Node) {
  const nodeName = Node.nodeName.toLowerCase();
  const prefix = nodeName.substring(0, 2);
  return prefix === 'c-' ? nodeName.substring(2) : false;
};
