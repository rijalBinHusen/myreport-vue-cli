const Baseitem = {
  namespaced: true,
  state: {
    lists: [],
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
    // update data
    update(state, value) {
      state.lists = state.lists.map((val) => {
        return val.id === value.id ? value : val;
      });
    },
    delete(state, value) {
      let keyCriteria = Object.keys(value.criteria)[0];
      let valueCriteria = Object.values(value.criteria)[0];
      state.lists = state.lists.filter(
        (val) => val[keyCriteria] !== valueCriteria
      );
    },
  },

  actions: {},
  getters: {
    baseItemId: (state, getters, rootState, rootGetters) => (id) => {
      return [...state.lists].find((val) => val.id === id);
    },
    baseItemKode: (state, getters, rootState, rootGetters) => (kode) => {
      let rec = [...state.lists].find((val) => val.kode === kode);
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
