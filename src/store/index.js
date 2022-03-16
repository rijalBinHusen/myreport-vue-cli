import { createStore } from "vuex";
import Localbase from "../Localbase";
import Navbar from "./modules/Navbar";
import Modal from "./modules/Modal";
import Collect from "./modules/Collect";
import Name from "./modules/Name.js";
import Uncollected from "./modules/Uncollected";
import Expor from "./modules/Expor";

export default createStore({
  state: {
    store: ["Name", "Uncollected"],
  },
  mutations: {},
  actions: {
    append({ commit }, value) {
      /* 
       value = {
         store: 'nameOfStore', 
         obj: {object: 'to append to indexeddb'}, 
         id: String,
         waktu: Boolean,
         split: "getTime() / 2022-03-22 / or antoher date format"
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
        let dbstore;
        // jika split maka store akan ditambah dengan 20223
        if (value.split) {
          dbstore =
            value.store + Localbase.dateFormat(["yearMonth", value.split]);
        }
        // jika tidak split
        else {
          dbstore = value.store;
        }
        Localbase.append(dbstore.toLowerCase(), value.obj);
        setTimeout(() => resolve(), 330);
      });
    },

    delete({ commit }, value) {
      // value = { store: "listsnames", doc: {id: 001 }, split: "202203"}
      let dbstore;
      // jika split maka store akan ditambah dengan 20223
      if (value.doc.id.length === 11 && value.split) {
        dbstore =
          value.store + Localbase.dateFormat(["yearMonth", value.split]);
      }
      // jika tidak split
      else {
        dbstore = value.store;
      }
      //delete from state
      commit(`${value.store}/delete`, value.doc.id, { root: true });

      // delete record from indexeddb and return as promise
      return new Promise((resolve) => {
        Localbase.deleteDocument(dbstore.toLowerCase(), value.doc);
        setTimeout(() => resolve(), 330);
      });
    },

    // to update record in indexeddb
    update({ commit }, value) {
      // value = {store: 'nameOfStore', obj: {id: idOfDocument, obj: {asd: 'to append to indexeddb'}, split: "202203" }
      // the first letter of value.store must be capital e.g 'Group'
      // console.log(value.split);
      // console.log(value.obj.id.length);
      let dbstore;
      // jika split maka store akan ditambah dengan 20223
      if (value.obj.id.length === 11 && value.split) {
        dbstore =
          value.store + Localbase.dateFormat(["yearMonth", value.split]);
      }
      // jika tidak split
      else {
        dbstore = value.store;
      }

      // send to indexeddb
      Localbase.update(
        value.store.toLowerCase(),
        { id: value.obj.id },
        value.obj
      );
      // send to module
      commit(`${value.store}/update`, value.obj, { root: true });
    },

    getStart({ commit, state }) {
      // iterate the store
      state.store.forEach((val) => {
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
    getAllData({ commit }, value) {
      return Localbase.getData({ store: value.toLowerCase(), withKey: true });
    },
  },
  getters: {
    dateFormat: (state) => (value) => {
      // value = { format: dateMonth, time: new Date().getTime() }
      return Localbase.dateFormat([value.format, value.time]);
    },
  },
  modules: {
    Navbar,
    Modal,
    Collect,
    Name,
    Uncollected,
    Expor,
  },
});
