import { createStore } from "vuex";
import myfunction from "../myfunction";
import Navbar from "./modules/Navbar";
import Modal from "./modules/Modal";
import Collected from "../modular/Collected/Collected";
import Uncollected from "../modular/Uncollected/Uncollected";
import Expor from "./modules/Expor";
import Impor from "../modular/ImportData/Impor";
import Warehouses from "../modular/Warehouses/Warehouses";
import Supervisors from "../modular/Supervisors/Supervisors.js";
import Backup from "../modular/Backup/Backup.js";
import BaseReportFile from "../modular/BaseImport/BaseReportFile";
import BaseReportClock from "../modular/Base/BaseReportClock";
import BaseReportStock from "../modular/Base/BaseReportStock";
import Baseitem from "../modular/BaseItem/Baseitem";
import Headspv from "../modular/Headspv/Headspv";
import Finished from "../modular/Finished/Finished";
import FinishedStock from "../modular/Finished/FinishedStock";
import Problem from "../modular/ProblemReport/ProblemReport";

export default createStore({
  modules: {
    Problem,
    Finished,
    FinishedStock,
    Headspv,
    Baseitem,
    Navbar,
    Modal,
    Collected,
    Uncollected,
    Expor,
    Impor,
    Warehouses,
    Supervisors,
    Backup,
    BaseReportFile,
    BaseReportClock,
    BaseReportStock,
  },
  state: {
    store: ["Warehouses", "Backup", "Supervisors"],
  },
  mutations: {},
  actions: {
    async append({ commit, rootGetters, dispatch }, value) {
      // check auto backup
      // await dispatch("Backup/check", {}, { root: true });

      // create id to the record
      if (value.obj.id) {
        value.obj.id = myfunction.generateId(value.obj.id, true);
      }
      // commit to module e.g 'Group/append
      commit(`${value.store}/append`, value.obj, { root: true });

      // insert record to indexeddb and return as promise
      myfunction.append(value);
      //return promise 130 ms and then resolve
      return myfunction.tunggu(130);
    },

    delete({ commit, rootGetters }, value) {
      // value = { store: "listsnames", id: 001 }

      let objToSend = Object.assign(rootGetters[`${value.store}/store`], {
        id: value.id,
      });

      // check the periode
      if (objToSend.split) {
        if (!value.period) {
          console.error("We need the period criteria");
          return;
        }
      }

      //delete from state
      commit(`${value.store}/delete`, value.id, { root: true });
      // delete record from indexeddb and return as promise
      return new Promise((resolve) => {
        myfunction.deleteDocument(objToSend);
        setTimeout(() => resolve(), 330);
      });
    },
    // deelete by parameter
    deleteByParam({ rootGetters }, value) {
      // value = { store: "BaseReportFile", parameter: "parent", value: "c038", period: "periodeOfrecord" }
      // ^ would delete all record that contain parent: c038 in BaseReportFile collection

      // set obj before send
      let objToSend = Object.assign(rootGetters[`${value.store}/store`], value);

      // check the periode
      if (objToSend.split) {
        if (!value.period) {
          console.error("We need the period criteria");
          return;
        }
      }
      // console.log(objToSend);
      // delete record from indexeddb and return as promise
      return new Promise((resolve) => {
        myfunction.deleteDocumentByParam(objToSend);
        setTimeout(() => resolve(), 2330);
      });
    },

    // to update record in indexeddb
    update({ commit, rootGetters }, value) {
      // update indexeddb
      myfunction.update(value);
      // send to module
      commit(`${value.store}/update`, value.obj, { root: true });
    },

    getStart({ commit, state, rootGetters }) {
      // iterate the store
      state.store.forEach((val) => {
        myfunction
          .getData({
            store: val.toLowerCase(),
            orderBy: "id",
            desc: true,
            limit: 200,
          })
          .then((result) => {
            if (result.length > 0) {
              commit(`${val}/${val.toLowerCase()}`, result, { root: true });
            }
          });
      });
    },
    getAllData({}, value) {
      return myfunction.getData({ store: value.toLowerCase(), withKey: true });
    },
    getData({ commit, rootGetters }, value) {
      // the first letter of value.store must be capital e.g 'Group'
      /*value = { 
            store: "nameOfStore",
          }
    	} */

      //empty the store
      commit(`${value.store}/${value.store.toLowerCase()}`, []);

      // call the get data functions
      myfunction.getData(rootGetters[`${value.store}/store`]).then((result) =>
        commit(`${value.store}/${value.store.toLowerCase()}`, result, {
          root: true,
        })
      );
    },
    findDataByDateArrays({ commit, rootGetters }, value) {
      /* value = { 
        store: nameOfStore, 
        date: ["array", "of", "date"], 
        criteria: {name: "abc", shared: false} 
        dateNotCriteria: true
      }
      */

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
                  obj: value.dateNotCriteria
                    ? value.criteria
                    : Object.assign(
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
        arr.push(myfunction.dateFormat(["ymdTime", dt]));
      }
      return arr;
      // toISOString().slice(0, 10));
    },
  },
});
