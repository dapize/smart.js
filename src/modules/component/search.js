/**
 * Busca los componentes existentes dentro de un Nodo html
 * @param {Object} [mainNode] Nodo HTML desde donde buscar, si no se pone tomará el declarado en el objeto maestro de configuración.
 * @returns {Array} Lista de nodos denominados como componentes, si no encuentra ninguno devuelve un array vacío.
 */
Smart.prototype.searchComponents = function (mainNode) {
  const Nodes = mainNode.querySelectorAll('*');
  const nNodes = Nodes.length;
  if (!nNodes) return [];
  const _this = this;
  return Array.prototype.filter.call(Nodes, function (Node) {
    return _this.utils.isComponent(Node)
  });
};
