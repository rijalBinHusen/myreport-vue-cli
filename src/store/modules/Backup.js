const Backup = {
  namespaced: true,
  state: {
    lists: [],
    store: { store: "Backup" },
    backupExport: {},
    totalExport: 0,
  },

  mutations: {
    append(state, value) {
      state.lists.unshift(value);
    },
    backup(state, value) {
      state.lists = value;
    },
    backupExport(state, value) {
      if (!value) {
        state.backupExport = {};
        return;
      }
      state.backupExport[value.store] = value.obj;
    },
    totalExport(state, value) {
      if (!isNaN(value)) {
        state.totalExport += value;
      }
    },
  },

  actions: {
    //   expor all data
    backup({ commit, rootState, dispatch }) {
      commit("backupExport", null);
      // get all store from state
      let store = JSON.parse(JSON.stringify(rootState.store));
      // iterate, push to variable and waiting
      for (let i = 0; i < store.length; i++) {
        dispatch("getAllData", store[i].nameOfStore, { root: true }).then(
          (val) => {
            commit("backupExport", { store: store[i].nameOfStore, obj: val });
            commit("totalExport", val.length);
            if (i === store.length - 1) {
              // change status to true
              commit("backupExport", { store: "status", obj: true });
            }
          }
        );
      }
    },
  },
  getters: {
    store(state) {
      return JSON.parse(JSON.stringify(state.store));
    },
  },
};

export default Backup;
