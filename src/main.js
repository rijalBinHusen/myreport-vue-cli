import { createApp } from "vue";
import App from "./App.vue";
import "w3-css";
import store from "./store";

createApp(App).use(store).mount("#app");
