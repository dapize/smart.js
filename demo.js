// Init the App
const App = new Smart();


// Registering a simple componente
App.registerComponent('message', {

  template: `
    <main class="c-message" component>
      <p class="text" content></p>
      <span class="autor">{{it.by}}</span>
    </main>
  `,

  styles: `
    .text {
      font-size: 31px;
      cursor: pointer;
    }

    .text--bold {
      font-weight: bold
    }

    .autor {
      text-weight: bold;
    }
  `,

  schema: {
    by: {
      type: "string",
      default: "By Smart.js"
    }
  },

  script: class {
    constructor (App, Node, props) {
      this.App = App;
      this.component = Node;
      this.props = props;
    }

    builded () {
      const text = this.component.querySelector('.text');
      text.addEventListener('click', () => {
        text.classList.toggle('text--bold')
      })
    }
  }

});


// Building that simple componente registered
const message = document.body.querySelector('c-message');

App.buildComponent(message, data => {
  App.mountComponent({
    gross: message,
    builded: data.node
  })
});


