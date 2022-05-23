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
      let rec = JSON.parse(JSON.stringify(state.lists)).find(
        (val) => val.id === id
      );
      return rec && rec.name
        ? rec
        : {
            id: "",
            name: "Not found",
          };
    },
  },
};

export default Warehouses;
