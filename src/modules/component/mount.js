/**
 * Monta un componente
 * @param {Object} obj Objeto contenedor con nodos y propiedades.
 * @param {Object} obj.name Nombre del componente a montar.
 * @param {Object} obj.gross Nodo HTML en estado bruto.
 * @param {Object} obj.builded Nodo HTML del componente yá construido.
 * @param {Object} [obj.props] Propiedades del componente.
 * @param {Object} [obj.instance] Instancia del componente
 * @param {Function} [cb] Callback
 */

Smart.prototype.mountComponent = function (obj, cb) {
  if (this.mounted.has(obj.gross)) return this.utils.regError('Ya montado', 'El componente yá fué montado con anterioridad: ', obj.gross);

  // Mounting
  let grossParent = obj.gross.parentNode;
  if (grossParent) {
    // Reemplazing node
    grossParent.replaceChild(obj.builded, obj.gross);
    this.mounted.set(obj.gross, {
      builded: obj.builded,
      props: obj.props
    });

    // Notify && CB
    const detail = {
      name: obj.name,
      gross: obj.gross,
      builded: obj.builded,
      props: obj.props
    };
    this.notifyComponent("mounted", obj.instance, detail);
    if (cb) cb(detail);
  }
};
