const BaseReportStock = {
  namespaced: true,
  state: {
    lists: [],
    store: { store: "BaseReportStock", split: "bulan" },
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
    getDataByParent({commit, dispatch, rootState}, parent) {
      commit("basereportstock", [])
      rootState.BaseReportFile.lists.forEach((val) => {
        dispatch("getDataByCriteriaAppend", { 
          store: "BaseReportStock", 
          criteria: {parent: val.id} 
        }, { root: true })
      })
    }
  },
  getters: {
    store(state) {
      return JSON.parse(JSON.stringify(state.store));
    },
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
  },
};

export default BaseReportStock;
