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
    }
  },
  getters: {
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
    warehouseReport(state, getters, rootState, rootGetters) {
      // get the uniquee date
      let uniquee = [ ...new Set ( JSON.parse(JSON.stringify(state.lists)).map((val) => val.warehouse) ) ]
      //return as object
      return uniquee.length > 0 
        ? uniquee.map((val) => {
            return {
              warehouse: val,
              warehouseName: rootGetters["Warehouses/warehouseId"](val).name
            }
          })
        : []
    },
    getIdByPeriodeByWarehouse: (state) => (periode, warehouse) => {
      return JSON.parse(JSON.stringify(state.lists)).find((val) => val.periode == periode && val.warehouse == warehouse )
    }
  },
};

export default BaseReportFile;
