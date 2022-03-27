const Impor = {
  namespaced: true,
  state: {
    lists: [],
  },
  mutations: {
    impor(state, payload) {
      state.lists = payload;
    },
  },
  actions: {},
  getters: {},
};

export default Impor;
