(function (root) {

  // Init APP
  root.Smart = new Smart({
    layouter: {
      
    }
  });

  const Smart = root.Smart;

  //#region register
  const c = {
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
    template: `
      <div class="lh-content__slider__item-wrap" component>
        <div class="lh-content__slider__item">
          <img src="{{image}}" {{#image-title}}title="{{image-title}}"{{/image-title}} {{#image-alt}}alt="{{image-alt}}"{{/image-alt}} class="lh-content__slider__image">
          <div class="lh-content__slider__text">
            <{{title-tag}} class="lh-content__slider__title lh-typo__commontitle lh-typo__commontitle--1">{{title}}</{{title-tag}}>
            <p class="lh-typo__p3 lh-content__slider__description">{{description}}</p>
          </div>
        </div>
      </div>;`,
    styles: `.red {color: red !important;}`,
    script: function (component, data) {
      const paragraph = component.querySelector('.lh-typo__p3');
      console.log(paragraph.textContent);
      paragraph.classList.add('red');
    }
  };

  // componente completo
  Smart.registerComponent('info-card', {
    template: c.template,
    styles: c.styles,
    schema: c.schema,
    script: c.script
  });

  // componente de presentación
  Smart.registerComponent('block-left', {
    template: c.template,
    styles: c.styles
  });

  // componente de funcionalidad con data
  Smart.registerComponent('resizer-slider', {
    schema: c.schema,
    script: c.script
  });

  // componente de funcionalidad sin data
  Smart.registerComponent('resizer-slider', {
    script: c.script
  });


  //#endregion register
  
  //#region create

  //#region web-component-example
    /*
      <c-info-card
        title="Costo Cero"
        image="../../assets/images/premio.png"
        description="Sin cobro de mantenimiento ni gasto por operaciones"
      ></c-info-card>
    */
  //#endregion web-component-example

  Smart.addEventListener('component:registered', function (name, data) {

    Smart.addEventListener('component:created', function (name, node) {
      
    });

    Smart.createComponent(data.name, {
      image: '../../assets/images/premio.png',
      title: 'Costo Cero',
      description: 'Sin cobro de mantenimiento ni gasto por operaciones'
    });

  });

  //#endregion create

}(this));
