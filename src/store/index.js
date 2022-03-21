import { createStore } from "vuex";
import myfunction from "../myfunction";
import Navbar from "./modules/Navbar";
import Modal from "./modules/Modal";
import Collected from "./modules/Collected";
import Name from "./modules/Name.js";
import Uncollected from "./modules/Uncollected";
import Expor from "./modules/Expor";

export default createStore({
  state: {
    store: ["Name", "Uncollected"],
  },
  mutations: {},
  actions: {
    append({ commit, rootGetters }, value) {
      /* value = { 
            store: "nameOfStore",
            obj: { key: 'value', obj: 'to input to store' },
            id: "id" //optional,
		        period: "202203/time()"
          } 
       the first letter of value.store must be capital e.g 'Group'
       */

      let objToSend = Object.assign(rootGetters[`${value.store}/store`], {
        obj: value.obj,
      });

      // create id to the record
      if (value.id) {
        objToSend.obj.id = myfunction.generateId(value.id, true);
      }
      // commit to module e.g 'Group/append
      commit(`${value.store}/append`, value.obj, { root: true });

      // insert record to indexeddb and return as promise
      return new Promise((resolve) => {
        myfunction.append(objToSend);
        setTimeout(() => resolve(), 330);
      });
    },

    delete({ commit, rootGetters }, value) {
      // value = { store: "listsnames", id: 001 }

      let objToSend = Object.assign(rootGetters[`${value.store}/store`], {
        id: value.id,
      });
      //delete from state
      commit(`${value.store}/delete`, value.id, { root: true });
      // if the store is split
      if (objToSend.split) {
        objToSend.period =
          value.id.slice(3, 7) + "-" + value.id.slice(7, 9) + "-01";
      }
      // delete record from indexeddb and return as promise
      return new Promise((resolve) => {
        myfunction.deleteDocument(objToSend);
        setTimeout(() => resolve(), 330);
      });
    },

    // to update record in indexeddb
    update({ commit, rootGetters }, value) {
      // value = {store: 'nameOfStore', obj: {id: idOfDocument, obj: {asd: 'to append to indexeddb'} }
      // the first letter of value.store must be capital e.g 'Group'

      /*value = {
        store: "nameStore",
        split: "tahun/bulan/false",
        period: "202203/time()"
        obj: {id: 'iddata', key: 'value', obj: 'value to update'}, 
    } */

      let objToSend = Object.assign(rootGetters[`${value.store}/store`], {
        obj: value.obj,
      });
      console.log(value);
      if (objToSend.split) {
        objToSend.period =
          "20" +
          value.obj.id.slice(3, 5) +
          "-" +
          value.obj.id.slice(5, 7) +
          "-01";
      }

      // send to indexeddb
      myfunction.update(objToSend);
      // send to module
      commit(`${value.store}/update`, value.obj, { root: true });
    },

    getStart({ commit, state, rootGetters }) {
      /*deData = {
        store: "nameStore", 
        split: "tahun/bulan/false",
        period: "202203/time()"
        'orderBy': keyData, 
        'desc': Boolean, 
        'limit': number,
    	} */
      // iterate the store
      state.store.forEach((val) => {
        // call the get data functions
        myfunction
          .getData(
            Object.assign(rootGetters[`${val}/store`], {
              orderBy: "id",
              desc: true,
              limit: 100,
            })
          )
          .then((result) =>
            commit(`${val}/${val.toLowerCase()}`, result, { root: true })
          );
      });
    },
    getAllData({ commit }, value) {
      return myfunction.getData({ store: value.toLowerCase(), withKey: true });
    },
    getData({ commit, rootGetters }, value) {
      // the first letter of value.store must be capital e.g 'Group'
      /*value = { 
            store: "nameOfStore",
            'limit': number,
          }
    	} */
      // call the get data functions
      myfunction
        .getData(
          Object.assign(
            rootGetters[`${value.store}/store`],
            {
              orderBy: "id",
              desc: true,
            },
            { limit: value.limit }
          )
        )
        .then((result) =>
          commit(`${value.store}/${value.store.toLowerCase()}`, result, {
            root: true,
          })
        );
    },
  },
  getters: {
    dateFormat: () => (value) => {
      // value = { format: dateMonth, time: new Date().getTime() }
      return myfunction.dateFormat([value.format, value.time]);
    },
  },
  modules: {
    Navbar,
    Modal,
    Collected,
    Name,
    Uncollected,
    Expor,
  },
});
