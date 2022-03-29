const ImporReport1 = {
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

export default ImporReport1;
