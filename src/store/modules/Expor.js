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
      let store = JSON.parse(JSON.stringify(rootState.store));
      // iterate, push to variable and waiting
      for (let i = 0; i < store.length; i++) {
        // wait until data commit to state
        await dispatch("getAllData", store[i].nameOfStore, { root: true }).then(
          (val) => {
            // append to state
            commit("append", { store: store[i].nameOfStore, obj: val });
            if (i === store.length - 1) {
              // create a download file
              var a = document.createElement("a");
              var file = new Blob([JSON.stringify(state.lists)], {
                type: "text/plain",
              });
              a.href = URL.createObjectURL(file);
              a.download =
                "Backup myreport " +
                rootGetters["dateFormat"]({ format: "full" });
              setTimeout(() => {
                a.click();
                commit("Modal/active", null, { root: true });
                commit("replace", {});
              }, 3500);
            }
          }
        );
      }
    },
  },
  getters: {},
};

export default Expor;
