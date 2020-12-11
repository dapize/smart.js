/**
 * Obtiene los atributos de un nodo HTML, convirtiendo cada valor en su equivalente más fiel.
 * @param {Object} Node Nodo HTML de donde obtener los atributos
 * @returns {Object} Objeto de las propiedades capturadas.
 */
Smart.prototype.utils.getProps = function (Node) {
  const _this = this;
  const attrs = Node.attributes;
  if (!attrs.length) return false;
  const props = {};
  let firstCharacter, attrVal, attrValLength;
  const passDirect = ['placeholder', 'value'];
  Array.prototype.forEach.call(attrs, function (attr) {
    attrVal = attr.value.trim();
    if (passDirect.indexOf(attr.name) !== -1) {
      props[attr.name] = attrVal;
    } else {
      if (!isNaN(attrVal)) { // can be a array or a string
        props[attr.name] = attrVal === '' ? true : Number(attrVal); // the empty value means it's a worthless attribute
      } else {
        firstCharacter = attrVal.substring(0, 1);
        if (firstCharacter === '[' || firstCharacter === '{') { // is a object or a array
          if (attr.name !== 'pattern' && attr.name !== 'regex') {
            try {
              props[attr.name] = JSON.parse(attrVal);
            } catch (e) {
              _this.regError('Error de parseo de data (attr : ' + attr.name + ')', Node.outerHTML.replace(/&quot;/g, '"'))
            }
          } else {
            props[attr.name] = (attrVal === 'true' || attrVal === 'false') ? JSON.parse(attrVal) : attrVal;
          }
        } else { // is...
          // ... a boolean param or .. a simple string
          attrValLength = attrVal.length;
          if (firstCharacter === '/' && attrVal.substring(attrValLength - 1) === '/') {
            props[attr.name] = JSON.parse(attrVal.substring(1, attrValLength - 1));
          } else {
            props[attr.name] = (attrVal === 'true' || attrVal === 'false') ? JSON.parse(attrVal) : attrVal;
          }
        }
      }
    }
  });
  return props;
};
