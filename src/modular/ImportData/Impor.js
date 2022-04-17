const Impor = {
  namespaced: true,
  state: {
    status: false,
    lists: {},
  },
  mutations: {
    impor(state, payload) {
      state.status = payload;
    },
    lists(state, payload) {
      state.lists = payload;
    },
  },
  actions: {},
  getters: {},
};

export default Impor;
