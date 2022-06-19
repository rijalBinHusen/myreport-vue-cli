const BaseReportFile = {
  namespaced: true,
  state: {
    baseId: null,
    lists: [],
    importTemp: null,
  },
  mutations: {
    // add data to
    append(state, value) {
      if (Array.isArray(value) && value.length > 0) {
        value.forEach((val) => state.lists.push(val));
      } else {
        state.lists.unshift(value);
      }
    },
    // update data
    update(state, value) {
      state.lists = state.lists.map((val) => {
        return val.id === value.id ? value : val;
      });
    },
    basereportfile(state, payload) {
      state.lists = payload;
    },
    importTemp(state, payload) {
      state.importTemp = payload;
    },
    baseId(state, payload) {
      state.baseId = payload;
    },
  },
  actions: {
    async getDataByState({commit, rootGetters, dispatch}) {
      commit("basereportfile", [])
      // looping cari baseReportFile dengan criteria { periode: document.periode, imported: true }
      let documen = rootGetters["Document/dateDocument"]
        for(let i = 0; i < documen.length; i++ ) {
          await dispatch("getDataByCriteriaAppend", {store: "BaseReportFile", criteria: { periode: documen[i].periode, imported: true } }, { root: true })
        }
    },
    async append({dispatch}, payload) {
      // payload = {periode: "", warehouse: ""}
      await dispatch("append", {
        store: "BaseReportFile",
        obj: Object.assign({ fileName: "false", stock: "false", clock: "false", imported: false }, payload)
      }, { root: true })
      // return a true value, so the promise would be resolved
      return "finished"
    },
    async emptyRecord({ commit, dispatch }, payload) {
      // payload = idBaseReportFile
      // bring up the loader
      commit("Modal/active", {judul: "", form: "Loader"}, { root: true });
      // delete base report stock
      await dispatch("BaseReportStock/deleteRecordByParent", payload, { root: true })
      // delete base repost clock
      await dispatch("BaseReportStock/deleteRecordByParent", payload, { root: true })
      // update the baseReport file record
      await dispatch("update", {
          store: "BaseReportFile", 
          obj: {
                fileName: "false",
                stock: "false",
                clock: "false",
                imported: false
              },
          criteria: { id: payload }
      }, { root: true })

      
      // close the loader
      commit("Modal/active", false, { root: true });
    }
  },
  getters: {
    lists(state, getters, rootState, rootGetters) {
      return state.lists.length
        ? JSON.parse(JSON.stringify(state.lists)).map((val) => {
              val.warehouseName = rootGetters["Warehouses/warehouseId"](val?.warehouse)?.name
              val.periode2= rootGetters["dateFormat"]({ format: "dateMonth", time: val.periode})
              return val
            })
        : []
    },
    infoByParentAndShift: (state, getters, rootState, rootGetters) => (parentId, shift) => {
      // return yang dibutuhkan: periode, shift, Nama karu, nomor telfon, nama gudang
      // cari periode + warehouse (disini dapat periode)
      let parent = getters["baseId"](parentId)
      // cari basedocument by periode, warehouse, shift (disini dapat nama karu, nomor telfon, nama gudang)
      let spvInfo = rootGetters["Document/documentByPeriodeAndWarehouseAndShift"](parent?.periode, parent?.warehouse, shift)
      return Object.assign({ periode: parent?.periode }, spvInfo)
    },
    baseId: (state) => (id) => {
      return JSON.parse(
        JSON.stringify(state.lists.find((val) => val.id === id))
      );
    },
    // return unique date of report 
    dateReport(state, getters, rootState, rootGetters) {
      // get the uniquee date
      let uniquee = [ ...new Set ( JSON.parse(JSON.stringify(state.lists)).map((val) => val.periode) ) ]
      //return as object
      return uniquee.length > 0 
        ? uniquee.map((val) => {
            return {
              periode: val,
              periode2: rootGetters["dateFormat"]({format: "dateMonth", time: val})
            }
          })
        : []
    },
    // return unique date of report 
    warehouseReport: (state, getters, rootState, rootGetters) => (periode) => {
      // get the uniquee date
      let result = []
      state.lists.forEach((val) => {
        if(val.periode == periode) {
          result.push ({
              warehouse: val?.warehouse,
              warehouseName: rootGetters["Warehouses/warehouseId"](val?.warehouse).name
            })
        }
      })
      return result
    },
    getIdByPeriodeByWarehouse: (state) => (periode, warehouse) => {
      return JSON.parse(JSON.stringify(state.lists)).find((val) => val.periode == periode && val.warehouse == warehouse )
    }
  },
};

export default BaseReportFile;
