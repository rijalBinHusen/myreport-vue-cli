const Collect = {
  namespaced: true,
  state: {
    lists: [],
  },
  mutations: {
    // new data from localbase
    collect(state, value) {
      state.lists = value;
    },
    // add data to
    append(state, value) {
      state.lists.unshift(value);
    },
    delete(state, value) {
      console.log(value);
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
  getters: {},
};

export default Collect;
