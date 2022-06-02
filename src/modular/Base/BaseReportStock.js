const BaseReportStock = {
  namespaced: true,
  state: {
    lists: [],
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
    basereportstock(state, payload) {
      state.lists = payload;
    },
    // update data
    update(state, value) {
      state.lists = state.lists.map((val) => {
        return val.id === value.id ? value : val;
      });
    },
    delete(state, value) {
      // value = { parameter: "parent", value: "c038" }
      state.lists = state.lists.filter((val) => val.id !== value);
    },
    deleteByParam(state, value) {
      // value = { parameter: "parent", value: "c038" }
      state.lists = state.lists.filter(
        (val) => val[value.parameter] !== value.value
      );
    },
  },
  actions: {
    async getDataByParent({commit, dispatch, rootState}) {
      commit("basereportstock", [])
      let parent = rootState.BaseReportFile.lists
      for(let i = 0; i < parent.length; i++) {
          await dispatch("getDataByCriteriaAppend", { 
            store: "BaseReportStock", 
            criteria: {parent: parent[i].id} 
          }, { root: true })
      }
    }
  },
  getters: {
    shiftAndParent: (state, getters, rootState, rootGetters) => (shift, id) => {
      return  state.lists.length > 0 
        ? JSON.parse(
            JSON.stringify(state.lists.filter((val) => {
              if(val.shift == shift && val.parent == id) {
                return val
              }
            })
          ))
        : []
    },
    standartWaktuByParentAndShift: (state) => (shift, id) =>  {
      let filtered = JSON.parse(JSON.stringify(state.lists)).filter((val) => val.shift == shift && val.parent == id)
      let result = 0
       filtered.forEach((val) => {
        result += val.out
      })
       return result
    },
    exportData(state, getters, rootState, rootGetters) {
    // periode, [v]
    // gudang, [v]
    // parentdocument, [v]
    // problem
    // id, [v]
    // parent,[v] 
    // shift, [v]
    // item, [v]
    // namaitem, 
    // awal, [v]
    // in, [v]
    // datein, [v]
    // out, [v]
    // dateout, [v]
    // real, [v]
    // dateend, [v]
    return state.lists.map((val) => {
      let parentFile = rootGetters["BaseReportFile/baseId"](val.parent)
      val.periode = rootGetters["dateFormat"]({ format: "dateMonth", time: parentFile.periode })
      val.gudang = rootGetters["Warehouses/warehouseId"](parentFile.warehouse).name
      return val
    })

    }
  },
};

export default BaseReportStock;
