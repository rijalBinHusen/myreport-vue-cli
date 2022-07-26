import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "w3-css";
import store from "./store";
import { auth } from "./firebase/firebaseApp";

let app;

auth.onAuthStateChanged(() => {
  if (!app) {
    app = createApp(App).use(store).use(router).mount("#app");
  }
});
