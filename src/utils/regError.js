/**
 * Utilidad para retornar errores.
 * @param {String} type Tipo de error a mostrar
 * @param {String} message Descripción del error
 */
Smart.prototype.utils.regError = function (name, message, extraArg) {
  const err = new Error();
  err.name = name;
  err.message = message;
  console.error(err);
  if (extraArg) console.log(extraArg);
  return err;
};
