import { createStore } from "vuex";
import Navbar from "./modules/Navbar";
import Modal from "./modules/Modal";
import Document from "./modules/Document";

export default createStore({
  modules: {
    Document,
    Navbar,
    Modal,
  },
  mutations: {},
  actions: {},
  getters: {},
});
