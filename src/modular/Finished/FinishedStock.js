const FinishedStock = {
  namespaced: true,
  state: {
    lists: [],
    store: { store: "FinishedStock", split: "bulan" },
  },

  mutations: {
    // new data from localbase
    finishedstock(state, value) {
      state.lists = value;
    },
    // add data to
    append(state, value) {
      state.lists.unshift(value);
    },
    // update data
    update(state, value) {
      state.lists = state.lists.map((val) => {
        return val.id === value.id ? value : val;
      });
    },
    delete(state, value) {
      state.lists = state.lists.filter((val) => val.id !== value);
    },
  },

  actions: {},
  getters: {
    store(state) {
      return JSON.parse(JSON.stringify(state.store));
    },
  },
};

export default FinishedStock;
