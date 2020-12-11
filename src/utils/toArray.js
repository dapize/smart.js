/**
 * Convierte un arrayLiked en un array real.
 * @param {NodeList} list Lista arrayLiked
 * @return {Array}
 */
Smart.prototype.utils.toArray = function (list) {
  return Array.prototype.map.call(list, function (node) {
    return node;
  });
};
