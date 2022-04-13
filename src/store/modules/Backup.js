const Backup = {
  namespaced: true,
  state: {
    lists: [],
    store: { store: "Backup" },
  },

  mutations: {
    append(state, value) {
      state.lists.unshift(value);
    },
    backup(state, value) {
      state.lists = value;
    },
    delete(state, value) {
      state.lists = state.lists.filter((val) => val.id !== value);
    },
  },

  actions: {
    append({ dispatch, commit, state, rootGetters }, payload) {
      let value = state.lists.length > 0 ? state.lists[0].setup : "hours";
      value = payload ? payload : value;

      let now = new Date();
      if (value == "hours") {
        now.setHours(now.getHours() + 1);
      }
      if (value == "day") {
        now.setDate(now.getDate() + 1);
      }
      if (value == "week") {
        now.setDate(now.getDate() + 7);
      }
      if (value == "month") {
        now.setDate(1);
        now.setMonth(now.getMonth() + 1);
      }
      dispatch(
        "append",
        {
          store: "Backup",
          obj: {
            id: rootGetters["dateFormat"]({ format: "time" }),
            nextBackup: now.getTime(),
            setup: value,
          },
        },
        { root: true }
      );
      // if lists length > 25 delete it
      if (state.lists.length > 25) {
        dispatch(
          "delete",
          { store: "Backup", id: state.lists.slice(-1)[0].id },
          { root: true }
        );
      }
      dispatch("Expor/expor", {}, { root: true });
      commit("Impor/impor", true, { root: true });
    },
    check({ dispatch, state, commit, rootState }) {
      let imporStatus = rootState.Impor.status;
      let now = new Date().getTime();
      let nextBackup = state.lists.length > 0 ? state.lists[0].nextBackup : now;
      if (now >= nextBackup && !imporStatus) {
        dispatch("append");
        return;
      }
      commit("Impor/impor", false, { root: true });
    },
  },
  getters: {
    store(state) {
      return JSON.parse(JSON.stringify(state.store));
    },
  },
};

export default Backup;
