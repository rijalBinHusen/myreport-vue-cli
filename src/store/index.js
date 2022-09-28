import { createStore } from "vuex";
import myfunction from "../myfunction";
import Navbar from "./modules/Navbar";
import Modal from "./modules/Modal";
import BaseReportFile from "../modular/BaseImport/BaseReportFile";
import BaseReportClock from "../modular/Base/BaseReportClock";
import BaseReportStock from "../modular/Base/BaseReportStock";
import Baseitem from "../modular/BaseItem/Baseitem";
import Problem from "../modular/ProblemReport/ProblemReport";
import Document from "./modules/Document";
import Cases from "../modular/CasesReport/Cases";
import Complains from "../modular/ComplainReport/Complains";

export default createStore({
  modules: {
    Complains,
    Cases,
    Problem,
    Document,
    Baseitem,
    Navbar,
    Modal,
    BaseReportFile,
    BaseReportClock,
    BaseReportStock,
  },
  state: {
    store: [
      "Baseitem",
      "Cases",
      "Complains",
    ],
  },
  mutations: {},
  actions: {
    updateAndGetRecordFromDB({ commit }, value) {
      /* 
        value = { 
          store: nameOfStore, 
          criteria: { id: 1 }, 
          obj: { key: value, key: value } 
        } 
      */
      let update = myfunction.update(value)
      const { obj, ...record } = value
      update.then(async () => {
        let newRec = await myfunction.findData(record)
        commit(`${value.store}/update`, newRec[0], { root: true });
      })
    },
    append({ commit, rootGetters, dispatch }, value) {
      // check auto backup
      // await dispatch("Backup/check", {}, { root: true });

      // insert record to indexeddb and return as promise
      return myfunction.append(value).then((result) => {
        // commit to module e.g 'Group/append
        commit(`${value.store}/append`, result.data, { root: true });
      });
      //return promise 130 ms and then resolve
    },

    appendWoutGenerateId({}, value) {
      return myfunction.append(value);
    },

    delete({ commit, rootGetters }, value) {
      commit(`${value.store}/delete`, value.criteria.id, { root: true });
      // delete record from indexeddb and return as promise
      myfunction.deleteDocument(value);
      return myfunction.tunggu(330);
    },
    // deelete by parameter
    deleteByParam({}, value) {
      // value = { store: "BaseReportFile", parameter: "parent", value: "c038"}
      // ^ would delete all record that contain parent: c038 in BaseReportFile collection

      // delete record from indexeddb and return as promise
      return new Promise((resolve) => {
        myfunction.deleteDocumentByParam(value);
        setTimeout(() => resolve(), 2330);
      });
    },

    // to update record in indexeddb
    update({ commit, rootGetters }, value) {
      // update indexeddb
      myfunction.update(value);
      // send to module
      commit(
        `${value.store}/update`,
        { ...value.obj, id: value?.criteria?.id },
        { root: true }
      );
      // tunggu 130 ms
      return myfunction.tunggu(130);
    },

    updateOnly({}, payload) {
      // payload = {store: "BaseReportStock", criteria: { id: stk22050003 }, obj: { problem: [] }}
      myfunction.update(payload);
      return myfunction.tunggu(130);
    },

    getStart({ commit, state, rootGetters }) {
      // iterate the store
      state.store.forEach((val) => {
        myfunction
          .getData({
            store: val.toLowerCase(),
            limit: 200,
            orderBy: "id",
            desc: true,
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
    getDataByCriteria({ commit, rootGetters }, value) {
      // the first letter of value.store must be capital e.g 'Group'
      /*value = { 
            store: "nameOfStore",
            criteria: { status: 0 }
            allData: false,
            append: true
          }
    	} */

      // if get all data, not by criteria
      if (value.allData) {
        return myfunction
          .getData({ store: value.store.toLowerCase() })
          .then((result) => {
            if (result?.length > 0) {
              commit(`${value.store}/${value.store.toLowerCase()}`, result, {
                root: true,
              });
            }
          });
      } else {
        // call the get data functions
        return myfunction.findData(value).then((result) => {
          commit(
            `${value.store}/${value.store.toLowerCase()}`,
            result ? result : [],
            {
              root: true,
            }
          );
        });
      }
    },
    getDataByCriteriaAppend({ commit, rootGetters }, value) {
      // the first letter of value.store must be capital e.g 'Group'
      /*value = { 
            store: "nameOfStore",
            criteria: { status: 0 }
          }
      } */
      return myfunction.findData(value).then((result) => {
        if (result) {
          commit(`${value.store}/append`, result, { root: true });
        }
      });
    },
    async findDataByDateArrays({ commit, rootGetters }, value) {
      // value = {store: document, criteria: {status: 0} }
      //empty the store
      commit(`${value.store}/${value.store.toLowerCase()}`, []);

      if (Array.isArray(value.date)) {
        // return as promise
        for (let i = 0; i < value.date.length; i++) {
          let criteria = Object.assign({}, value);
          delete criteria.date;
          delete criteria.dateNotCriteria;

          value.dateNotCriteria
            ? false
            : (criteria.criteria.periode = value.date[i]);

          let res = await myfunction.findData(criteria);
          // commit to module e.g 'Group/append
          if (res) {
            commit(`${value.store}/append`, res, { root: true });
          }
        }
      }
    },
    async rewriteStore({}, payload) {
      //payload = {store: nameOfStore: obj: [Array would to wrote]}
      await myfunction.reWriteStoreWithKey(payload);
      console.log('sudah selesaai')
      return myfunction.tunggu(90);
    },
    async emptyStore({}, payload) {
      await myfunction.deleteCollection(payload.toLowerCase());
      // setelah store dihapus biar nunggu 4 detik, agar browser tidak freez
      console.log('selesai di hapus')
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
