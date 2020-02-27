/**
 * Utilidad para retornar errores.
 * @param {String} type Tipo de error a mostrar
 * @param {String} message Descripción del error
 */
const regError = function (name, message) {
  const err = new Error();
  err.name = name;
  err.message = message;
  console.log(err);
  return err;
};
