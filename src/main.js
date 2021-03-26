import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

import jQuery from "jquery";
global.jquery = jQuery;
global.$ = jQuery;
window.$ = window.jQuery = require("jquery");

import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
library.add(fas, fab, far);

// import BootstrapVue from "bootstrap-vue";

createApp(App)
  .use(store)
  .use(router)
  // .use(BootstrapVue)
  .component("fontAwesome", FontAwesomeIcon)
  .mount("#app");
