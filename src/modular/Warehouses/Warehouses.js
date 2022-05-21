const Warehouses = {
  namespaced: true,
  state: {
    lists: [],
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
    warehouseId: (state) => (id) => {
      return JSON.parse(JSON.stringify(state.lists)).find(
        (val) => val.id === id
      );
    },
  },
};

export default Warehouses;
