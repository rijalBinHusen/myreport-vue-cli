import { createStore } from "vuex";
import Localbase from "../Localbase";
import Navbar from "./modules/Navbar";
import Modal from "./modules/Modal";
import Collect from "./modules/Collect";
import Name from "./modules/Name.js";
import Uncollected from "./modules/Uncollected";

export default createStore({
  state: {},
  mutations: {},
  actions: {
    append({ commit }, value) {
      /* 
       value = {
         store: 'nameOfStore', 
         obj: {object: 'to append to indexeddb'}, 
         id: String,
         waktu: Boolean
        } 
       the first letter of value.store must be capital e.g 'Group'
       */

      // create id to the record
      if (value.id) {
        if (value.waktu) {
          value.obj.id = Localbase.generateId(value.id, true);
        } else value.obj.id = Localbase.generateId(value.id);
      }
      // commit to module e.g 'Group/append
      commit(`${value.store}/append`, value.obj, { root: true });

      // insert record to indexeddb and return as promise
      return new Promise((resolve) => {
        Localbase.append(value.store.toLowerCase(), value.obj);
        setTimeout(() => resolve(), 330);
      });
    },

    delete({ commit }, value) {
      // value = { store: "listsnames", doc: {id: 001 }}

      //delete from state
      commit(`${value.store}/delete`, value.doc.id, { root: true });

      // delete record from indexeddb and return as promise
      return new Promise((resolve) => {
        Localbase.deleteDocument(value.store.toLowerCase(), value.doc);
        setTimeout(() => resolve(), 330);
      });
    },

    // to update record in indexeddb
    update({ commit }, value) {
      // value = {store: 'nameOfStore', obj: {id: idOfDocument, object: 'to append to indexeddb'} }
      // the first letter of value.store must be capital e.g 'Group'

      // send to indexeddb
      Localbase.update(
        value.store.toLowerCase(),
        { id: value.obj.id },
        value.obj
      );
      // send to module
      commit(`${value.store}/update`, value.obj, { root: true });
    },

    getStart({ commit }) {
      // list of store
      let store = ["Name", "Uncollected", "Collect"];
      // iterate the store
      store.forEach((val) => {
        // call the get data functions
        Localbase.getData({
          store: val.toLowerCase(),
          orderBy: "id",
          desc: true,
        }).then((result) =>
          commit(`${val}/${val.toLowerCase()}`, result, { root: true })
        );
      });
    },
  },
  getters: {
	  dateFormat: (state) => (value) => {
		  // value = { format: dateMonth, time: new Date().getTime() }
		  return Localbase.dateFormat([value.format, value.time])
	  }
  },
  modules: {
    Navbar,
    Modal,
    Collect,
    Name,
    Uncollected,
  },
});
