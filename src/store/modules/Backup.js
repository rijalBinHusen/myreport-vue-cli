const Backup = {
  namespaced: true,
  state: {
    lists: [],
    store: { store: "Backup" },
  },

  mutations: {
    append(state, value) {
      state.lists.unshift(value);
    },
    backup(state, value) {
      state.lists = value;
    },
  },

  actions: {},
  getters: {
    store(state) {
      return JSON.parse(JSON.stringify(state.store));
    },
  },
};

export default Backup;
