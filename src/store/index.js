import { createStore } from "vuex";
import myfunction from "../myfunction";
import Navbar from "./modules/Navbar";
import Modal from "./modules/Modal";
import Collected from "./modules/Collected";
import Uncollected from "./modules/Uncollected";
import Expor from "./modules/Expor";
import Impor from "./modules/Impor";
import ImporReport1 from "./modules/ImporReport1";
import Warehouses from "./modules/Warehouses";
import Supervisors from "./modules/Supervisors.js";
import Backup from "./modules/Backup.js";

export default createStore({
  modules: {
    Navbar,
    Modal,
    Collected,
    Uncollected,
    Expor,
    Impor,
    ImporReport1,
    Warehouses,
    Supervisors,
    Backup,
  },
  state: {
    store: localStorage.getItem("store")
      ? JSON.parse(localStorage.getItem("store"))
      : [],
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
        period: value.period,
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
          "20" + value.id.slice(3, 5) + "-" + value.id.slice(5, 7) + "-01";
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
      // console.log(value);
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
      let storeLists = JSON.parse(JSON.stringify(state.store));
      // iterate the store
      storeLists.forEach((val2) => {
        let val = val2.nameOfStore[0].toUpperCase() + val2.nameOfStore.slice(1);
        if (val2.starter) {
          // console.log(val);
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
        }
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

      //empty the store
      commit(`${value.store}/${value.store.toLowerCase()}`, []);

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
    findDataByDateArrays({ commit, rootGetters }, value) {
      // value = { store: nameOfStore, date: ["array", "of", "date"], criteria: {name: "abc", shared: false} }

      //empty the store
      commit(`${value.store}/${value.store.toLowerCase()}`, []);

      if (Array.isArray(value.date)) {
        // return as promise
        return new Promise((resolve) => {
          for (let i = 0; i < value.date.length; i++) {
            myfunction
              .findData(
                Object.assign(rootGetters[`${value.store}/store`], {
                  period: value.date[i],
                  obj: Object.assign(
                    {
                      periode: value.date[i],
                    },
                    value.criteria
                  ),
                })
              )
              .then((res) => {
                // commit to module e.g 'Group/append
                if (res) {
                  commit(`${value.store}/append`, res, { root: true });
                }
                //jika sudah selesai
                if (i === value.date.length - 1) {
                  resolve();
                }
              });
          }
        });
      }
    },
    rewriteStore({}, payload) {
      //payload = {store: nameOfStore: obj: [Array would to wrote]}
      myfunction.reWriteStoreWithKey(payload);
      return myfunction.tunggu(2000);
    },
    emptyStore({}, payload) {
      myfunction.deleteCollection(payload);
      return myfunction.tunggu(2000);
    },
  },
  getters: {
    dateFormat: () => (value) => {
      // value = { format: dateMonth, time: new Date().getTime() }
      return myfunction.dateFormat([value.format, value.time]);
    },
    getDaysArray: () => (start, end) => {
      let arr = [];
      for (
        let dt = new Date(start);
        dt <= new Date(end);
        dt.setDate(dt.getDate() + 1)
      ) {
        arr.push(new Date(dt).getTime());
      }
      return arr;
      // toISOString().slice(0, 10));
    },
  },
});
