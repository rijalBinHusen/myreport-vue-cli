const Supervisors = {
  namespaced: true,
  state: {
    lists: [],
    store: { store: "Supervisors" },
    edit: "",
  },

  mutations: {
    // new data from localbase
    supervisors(state, value) {
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
      let rec = state.lists.find((val) => val.id === state.edit);
      return rec && rec.name
        ? rec
        : {
            name: null,
            phone: null,
            warehouse: null,
            disabled: false,
          };
    },
    store(state) {
      return JSON.parse(JSON.stringify(state.store));
    },
    lists(state, getters, rootState, rootGetters) {
      let rec = JSON.parse(JSON.stringify(state.lists));
      return rec.map((val) => {
        val.warehouseName = rootGetters["Warehouses/warehouseId"](
          val.warehouse
        ).name;
        return val;
      });
    },
  },
};

export default Supervisors;
