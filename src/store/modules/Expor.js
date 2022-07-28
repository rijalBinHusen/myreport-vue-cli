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
      // get the summary information
      let storeName = await dispatch("getAllData", "Summary", { root: true })
      // console.log(storeName)
      commit("append", { store: "summary", obj: storeName });
      // get the activiy store
      dispatch("getAllData", "activity", {root: true}).then((val) => {
        if(val) {
          commit("append", { store: "activity", obj: val})
        }
      })
      // get the login store
      dispatch("getAllData", "login", {root: true}).then((val) => {
        if(val) {
          commit("append", { store: "login", obj: val})
        }
      })
      // iterate, push to variable and waiting
      for (let i = 0; i < storeName.length; i++) {
        // wait until data commit to state
        let result = await dispatch("getAllData", storeName[i]?.key, { root: true })
        // if result > 0
        if(result?.length) {
          // append to state this state
          commit("append", { store: storeName[i]?.key, obj: result });
        }
      }
    //   // create a download file
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
