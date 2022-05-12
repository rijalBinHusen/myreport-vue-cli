const Problem = {
  namespaced: true,
  state: {
    lists: [],
    store: { store: "Problem" },
  },

  mutations: {
    // new data from localbase
    problem(state, value) {
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
    lists(state, getters, rootState, rootGetters) {
      // let rec =
      return JSON.parse(JSON.stringify(state.lists));
      // return rec.map((val) => {
      //   val.warehouseName = rootGetters["Warehouses/warehouseId"](
      //     val.warehouse
      //   ).name;
      //   return val;
      // });
    },
    problemId: (state, getters, rootState, rootGetters) => (id) => {
      let rec = JSON.parse(JSON.stringify(state.lists)).find(
        (val) => val.id === id
      );
      return rec;
      //  && rec.name
      //   ? Object.assign(rec, {
      //       warehouseName: rootGetters["Warehouses/warehouseId"](rec.warehouse)
      //         .name,
      //     })
      //   : {
      //       name: null,
      //       phone: null,
      //       warehouse: null,
      //       disabled: false,
      //     };
    },
  },
};

export default Problem;
