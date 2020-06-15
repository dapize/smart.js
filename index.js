(function (root) {

  // Init APP
  root.Smart = new Smart({
    layouter: {
      breakPoints: {
        xs: {
          width: 320,
          cols: 15,
          direct: true
        },
        sm: {
          width: 768,
          cols: 31
        },
        md: {
          width: 1024,
          cols: 31
        },
        lg: {
          width: 1280,
          cols: 31
        }
      },
      bridge: false
    }
  });


  /*
    <c-info-card
      title="Costo Cero"
      image="../../assets/images/premio.png"
      description="Sin cobro de mantenimiento ni gasto por operaciones"
    ></c-info-card>
  */

  Smart.addEventListener('component:registered', function (name, data) {

    console.time('info-card')
    Smart.addEventListener('component:created', function (cName, node) {
      console.timeEnd('info-card');
      document.body.appendChild(node);
    });

    Smart.createComponent('info-card', {
      image: '../../assets/images/premio.png',
      title: 'Costo Cero',
      description: 'Esta es una descripción extraña'
    });

    /*
    Smart.createComponent('info-card', {
      image: '../../assets/images/premio2.png',
      title: 'Costo Cero 2',
      description: 'Esta es una descripción extraña 2'
    });
    */
  });

  Smart.registerComponent('info-card', {

    template: `<div class="lh-content__slider__item-wrap" component>
        <div class="lh-content__slider__item">
          <img src="{{image}}" title="[{{image-title}}]" alt="[{{image-alt}}]" class="lh-content__slider__image">
          <div class="lh-content__slider__text">
            <{{title-tag}} class="lh-content__slider__title lh-typo__commontitle lh-typo__commontitle--1">{{title}}</{{title-tag}}>
            {{#description}}
            <p cols="1/1" class="lh-typo__p3 lh-content__slider__description">{{description}}</p>
            {{/description}}
          </div>
        </div>
      </div>;`,

    styles: `.red {color: red !important;}`,

    schema: {
      image: {
        type: 'string',
        required: true
      },
      'image-alt': 'string',
      'image-title': 'string',
      title: {
        type: 'string',
        required: true
      },
      'title-tag': {
        type: 'string',
        default: 'h4'
      },
      description: 'string'
    },

    script: function (component, data) {
      const paragraph = component.querySelector('.lh-typo__p3');
      if (paragraph) {
        paragraph.classList.add('red');
      }
    }
  });


}(this));


(function (root) {
  /**
   * Devuelve un objeto de el array liked de atributos obtenidos de un nodo.
   * @param {Array} arr Array liked de atributos de un Nodo.
   * @param {Object} obj Objeto vacio contenedor de los atributos.
   * @return {Object}
   */
  const toObject = function (arr, obj) {
    const item = arr.shift();
    obj[item.name] = item.value;
    return arr.length ? toObject(arr, obj) : obj;
  };

  /**
   * Obtiene los atributos de un Nodo HTML como objeto.
   * @param {Object} Node Nodo HTML.
   * @return {Object}
   */
  const getAttributes = function (Node) {
    const attrs = Node.attributes;
    if (!attrs.length) {
      let childs = Node.children;
      if (!childs.length) return false;
      let attrName, obj;
      childs = Array.prototype.filter.call(childs, function (child) {
        attrName = child.nodeName.toLowerCase();
        if (attrName.substring(0, 3) === 'a-') {
          // getAttributes()
        } else {
          return false;
        }
      });
      return childs.length ? childs : false;
    } else {
      const arAttrs = Smart.utils.toArray(attrs);
      return toObject(arAttrs, {});
    }
  };

  const myInfoCard = document.querySelector('c-info-card');
  const myAttrs = getAttributes(myInfoCard);
  console.dir(myAttrs);

}(this));