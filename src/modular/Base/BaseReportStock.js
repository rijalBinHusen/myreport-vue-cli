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
    deleteByParam(state, value) {
      // value = { parameter: "parent", value: "c038" }
      state.lists = state.lists.filter(
        (val) => val[value.parameter] !== value.value
      );
    },
  },
  actions: {},
  getters: {
    store(state) {
      return JSON.parse(JSON.stringify(state.store));
    },
    shift: (state) => (shift) => {
      return JSON.parse(
        JSON.stringify(state.lists.filter((val) => val.shift === shift))
      );
    },
  },
};

export default BaseReportStock;
