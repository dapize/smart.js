(function (root) {

  // Init APP
  root.Smart = new Smart({
    layouter: {
      
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
    Smart.addEventListener('component:created', function (cName, node) {
      console.timeEnd('empieza');
      document.body.appendChild(node);
    });

    Smart.createComponent('info-card', {
      image: '../../assets/images/premio.png',
      title: 'Costo Cero',
      description: 'Sin cobro de mantenimiento ni gasto por operaciones'
    });
  });

  console.time('empieza');
  Smart.registerComponent('info-card', {

    template: `<div class="lh-content__slider__item-wrap" component>
        <div class="lh-content__slider__item">
          <img src="{{image}}" title="[{{image-title}}]" alt="[{{image-alt}}]" class="lh-content__slider__image">
          <div class="lh-content__slider__text">
            <{{title-tag}} class="lh-content__slider__title lh-typo__commontitle lh-typo__commontitle--1">{{title}}</{{title-tag}}>
            <p class="lh-typo__p3 lh-content__slider__description">{{description}}</p>
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
      description: {
        type: 'string',
        required: true
      }
    },

    script: function (component, data) {
      console.log('script ejhecutado');
      const paragraph = component.querySelector('.lh-typo__p3');
      paragraph.classList.add('red');
    }
  });

}(this));
