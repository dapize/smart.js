/**
 * Procesa una lista de nodos de forma recursiva
 * @param {Array} items Lista de nodos vivos HTML
 * @param {Function} fn Functión que se ejecutará por cada Nodo
 * @param {Function} cb Callback
 */
Smart.prototype.utils.forRecur = function (items, fn, cb) {
  const _this = this;
  const arrItems = Array.isArray(items) ? items : this.toArray(items);
  const item = arrItems.shift();
  fn(item, function () {
    if (arrItems.length) {
      _this.forRecur(arrItems, fn, cb)
    } else {
      if (cb) cb()
    }
  })
};
