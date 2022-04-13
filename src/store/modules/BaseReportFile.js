const BaseReportFile = {
  namespaced: true,
  state: {
    status: false,
    lists: [],
    store: { store: "BaseReportFile", split: "bulan" },
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
    baseReportFile(state, payload) {
      state.lists = payload;
    },
  },
  actions: {},
  getters: {
    store(state) {
      return JSON.parse(JSON.stringify(state.store));
    },
  },
};

export default BaseReportFile;
