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
      if (Array.isArray(value) && value.length > 0) {
        value.forEach((val) => state.lists.push(val));
      } else {
        state.lists.unshift(value);
      }
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
    lists(state, getters, rootState, rootGetters) {
      if (state.lists.length > 0) {
        let rec = JSON.parse(JSON.stringify(state.lists));
        return rec.map((val) => {
          let spvInfo = rootGetters["Supervisors/spvId"](val.name);
          Object.assign(val, {
            spvName: spvInfo.name,
            spvWarehouse: spvInfo.warehouseName,
            periode2: rootGetters["dateFormat"](val.periode),
            collected2: rootGetters["dateFormat"](val.collected),
          });
        });
      }
      return [
        {
          spvName: "No record",
          spvWarehouse: "No record",
          periode2: "No record",
          collected2: "No record",
          shared: "No record",
        },
      ];
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
