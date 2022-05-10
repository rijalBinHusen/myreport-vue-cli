const Baseitem = {
  namespaced: true,
  state: {
    lists: [],
    store: { store: "Baseitem" },
    edit: "",
  },

  mutations: {
    // new data from localbase
    baseitem(state, value) {
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
    delete(state, value) {
      state.lists = state.lists.filter((val) => val.id !== value);
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
            kode: "",
            name: "",
          };
    },
    store(state) {
      return JSON.parse(JSON.stringify(state.store));
    },
    baseItemKode: (state, getters, rootState, rootGetters) => (kode) => {
      let rec = JSON.parse(JSON.stringify(state.lists)).find(
        (val) => val.kode === kode
      );
      return rec && rec.name
        ? rec
        : {
            id: "",
            name: "No item name",
          };
    },
  },
};

export default Baseitem;
