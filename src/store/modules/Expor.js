const Expor = {
  namespaced: true,
  state: {
    lists: {},
  },
  mutations: {
    append(state, value) {
      state.lists[value.store] = value.obj;
    },
    replace(state, value) {
      state.lists = value;
    },
  },
  actions: {
    //   expor all data
    async expor({ state, commit, rootState, dispatch, rootGetters }) {
      commit("Modal/active", { judul: "", form: "Loader" }, { root: true });
      commit("replace", {});
      // get all store from state
      let storeName = JSON.parse(JSON.stringify(rootState.store));
      // iterate, push to variable and waiting
      for (let i = 0; i < storeName.length; i++) {
        // wait until data commit to state
        let result = await dispatch("getAllData", storeName[i], { root: true })
        // if result > 0
        if(result?.length) {
          // append to state this state
          commit("append", { store: storeName[i], obj: result });
        }
      }
      // create a download file
      var a = document.createElement("a");
      // new blob data
      var file = new Blob([JSON.stringify(state.lists)], { type: "text/plain" });
      // append file
      a.href = URL.createObjectURL(file);
      // file name
      a.download = "Backup myreport " + rootGetters["dateFormat"]({ format: "full" }) + ".js";
      setTimeout(() => {
          a.click();
          // /close the loader
          commit("Modal/active", null, { root: true });
          commit("replace", {});
        }, 3500);
    },
  },
  getters: {},
};

export default Expor;
