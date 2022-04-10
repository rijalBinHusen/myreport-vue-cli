const Impor = {
  namespaced: true,
  state: {
    status: false,
  },
  mutations: {
    impor(state, payload) {
      state.status = payload;
    },
  },
  actions: {},
  getters: {},
};

export default Impor;
