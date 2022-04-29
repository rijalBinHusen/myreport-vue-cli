const Finished = {
  namespaced: true,
  state: {
    lists: [],
    store: { store: "Finished", split: "bulan" },
  },

  mutations: {
    // new data from localbase
    finished(state, value) {
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
  },

  actions: {},
  getters: {
    store(state) {
      return JSON.parse(JSON.stringify(state.store));
    },
  },
};

export default Finished;
