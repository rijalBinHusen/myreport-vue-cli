const Cases = {
  namespaced: true,
  state: {
    lists: [],
    importTemp: null,
    dataStarter: false,
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
    // data starter status
    dataStarter(state) {
      state.dataStarter = true;
    },
    // update data
    update(state, value) {
      state.lists = state.lists.map((val) => {
        return val.id === value.id ? value : val;
      });
    },
    cases(state, payload) {
      state.lists = payload;
    },
    importTemp(state, payload) {
      state.importTemp = payload;
    },
  },
  actions: {},
  getters: {},
};

export default Cases;
