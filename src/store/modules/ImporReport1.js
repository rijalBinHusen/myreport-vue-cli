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
    sheetNamesByFileName: (state) => (fileName) => {
      // console.log(fileName);
      let arrSheetNames = state.lists.find((val) => val.fileName);
      return arrSheetNames.sheetNames.map((val, ind) => {
        return {
          id: ind,
          value: val,
        };
      });
    },
    fileNames(state) {
      return state.lists.map((val) => val.fileName);
    },
  },
};

export default ImporReport1;
