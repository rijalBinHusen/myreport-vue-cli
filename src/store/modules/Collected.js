const Collect = {
  namespaced: true,
  state: {
    lists: [],
    store: { store: "Collected", split: "bulan" },
  },
  mutations: {
    // new data from localbase
    collected(state, value) {
      state.lists = value;
    },
    // add data to
    append(state, value) {
      state.lists.unshift(value);
    },
    //delete lists
    delete(state, value) {
      state.lists = state.lists.filter((val) => val.id !== value);
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
    lists(state) {
      return JSON.parse(JSON.stringify(state.lists));
    },
    listsId: (state, getters, rootState, rootGetters) => (id) => {
      return JSON.parse(
        JSON.stringify(state.lists.find((val) => val.id === id))
      );
    },
    // mengembalikan info store
    store(state) {
      return JSON.parse(JSON.stringify(state.store));
    },
  },
};

export default Collect;
