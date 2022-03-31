const ImporReport1 = {
  namespaced: true,
  state: {
    lists: [],
    setted: [],
  },
  mutations: {
    impor(state, payload) {
      state.lists.push(payload);
    },
    set(state, payload) {
      state.setted = payload;
    },
  },
  actions: {},
  getters: {
    sheetNames: (state) => (index) => {
      return state.lists[index].sheetNames.map((val, ind) => {
        return {
          id: ind,
          value: val,
        };
      });
    },
  },
};

export default ImporReport1;
