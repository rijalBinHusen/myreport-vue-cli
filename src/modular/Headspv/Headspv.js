const Headspv = {
  namespaced: true,
  state: {
    lists: [],
    store: { store: "Headspv" },
    edit: "",
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
    // id record to edit
    edit(state, value) {
      state.edit = value;
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
    edit(state) {
      let rec = JSON.parse(JSON.stringify(state.lists)).find(
        (val) => val.id === state.edit
      );
      return rec && rec.name
        ? rec
        : {
            name: null,
            phone: null,
          };
    },
    store(state) {
      return JSON.parse(JSON.stringify(state.store));
    },
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
            name: null,
            phone: null,
          };
    },
  },
};

export default Headspv;
