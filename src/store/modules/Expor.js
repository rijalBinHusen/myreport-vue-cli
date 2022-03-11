const Expor = {
  namespaced: true,
  state: {
    lists: "ini adalah test",
  },
  mutations: {},
  actions: {
    //   expor all data
    expor({ commit, rootState, dispatch }) {
      // get all store from state
      let store = JSON.parse(JSON.stringify(rootState.store));
      //   // temprorary variable
      let result = {};
      // iterate, push to variable and waiting
      for (let i = 0; i < store.length; i++) {
        dispatch("getAllData", store[i], { root: true }).then(
          //   result.store = {a: asd, blablabla}
          (val) => {
            result[store[i]] = Object.assign({}, val);
            // console.log(result);
          }
        );
      }
      // return the variable
      return result;
    },
  },
  getters: {},
};

export default Expor;
