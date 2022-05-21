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
        await dispatch("getAllData", storeName[i], { root: true }).then(
          (val) => {
            // append to state this state
            commit("append", { store: storeName[i], obj: val });
            if (i === storeName.length - 1) {
              // create a download file
              var a = document.createElement("a");
              var file = new Blob([JSON.stringify(state.lists)], {
                type: "text/plain",
              });
              a.href = URL.createObjectURL(file);
              a.download =
                "Backup myreport " +
                rootGetters["dateFormat"]({ format: "full" }) +
                ".js";
              return new Promise((resolve) => {
                setTimeout(() => {
                  a.click();
                  // /close the loader
                  commit("Modal/active", null, { root: true });
                  commit("replace", {});
                  resolve();
                }, 3500);
              });
            }
          }
        );
      }
    },
  },
  getters: {},
};

export default Expor;
