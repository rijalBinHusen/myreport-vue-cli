const Headspv = {
  namespaced: true,
  state: {
    lists: [],
  },

  mutations: {
    // new data from localbase
    headspv(state, value) {
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
    enabled(state) {
      return state.lists.filter((val) => val.disabled === false);
    },
    headId: (state, getters, rootState, rootGetters) => (id) => {
      let rec = JSON.parse(JSON.stringify(state.lists)).find(
        (val) => val.id === id
      );
      return rec && rec.name
        ? rec
        : {
            name: "Not found",
            phone: "Not found",
          };
    },
  },
};

export default Headspv;
