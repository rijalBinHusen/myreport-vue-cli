const Warehouses = {
  namespaced: true,
  state: {
    lists: [],
    store: { store: "Warehouses" },
  },

  mutations: {
    // new data from localbase
    warehouses(state, value) {
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
      return JSON.parse(
        JSON.stringify(
          state.edit
            ? state.lists.find((val) => val.id === state.edit)
            : { id: null, name: null }
        )
      );
    },
    store(state) {
      return JSON.parse(JSON.stringify(state.store));
    },
    warehouseId: (state) => (id) => {
      return JSON.parse(
        JSON.stringify(state.lists.find((val) => val.id === id))
      );
    },
  },
};

export default Warehouses;
