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
  },
  actions: {},
  getters: {
    store(state) {
      return JSON.parse(JSON.stringify(state.store));
    },
  },
};

export default BaseReportClock;
