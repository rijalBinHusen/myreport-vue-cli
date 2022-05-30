const BaseReportClock = {
  namespaced: true,
  state: {
    lists: [],
    store: { store: "BaseReportClock", split: "bulan" },
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
    delete(state, value) {
      // value = { parameter: "parent", value: "c038" }
      state.lists = state.lists.filter((val) => val.id !== value);
    },
    basereportclock(state, payload) {
      state.lists = payload;
    },
    deleteByParam(state, value) {
      // value = { parameter: "parent", value: "c038" }
      state.lists = state.lists.filter(
        (val) => val[value.parameter] !== value.value
      );
    },
  },
  actions: {
    getDataByParent({commit, dispatch}, parent) {
      if(Array.isArray(parent)) {
        let promise = []
        for (let i = 0; i < parent.length; i++) {
          promise.push(dispatch("getDataByCriteria", { 
            store: "BaseReportClock",
            criteria: { parent: parent[i] },
            allData: false,
            append: true,
           }, { root: true })
          )
        }
        return Promise.allSettled(promise)
      }
      dispatch("getDataByCriteria", { 
        store: "BaseReportClock",
        criteria: { parent: parent },
        allData: false,
        append: true,
       }, {root: true})
    }
  },
  getters: {
    shiftAndPeriode: (state) => (shift, id) => {
      return JSON.parse(
        JSON.stringify(state.lists.filter((val) => val.shift == shift && val.parent == id)
      ));
    },
  },
};

export default BaseReportClock;
