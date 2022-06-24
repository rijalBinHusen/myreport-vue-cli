const Backup = {
  namespaced: true,
  state: {
    lists: [
      {
        id: "BUP22050001",
        time: "",
        setup: "hours",
        nextBackup: new Date().getTime() + 3600000,
      },
    ],
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
    async append({ dispatch, commit, state, rootGetters }, payload) {
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
      await dispatch(
        "append",
        {
          store: "Backup",
          obj: {
            time: new Date().getTime(),
            nextBackup: now.getTime(),
            setup: value,
          },
        },
        { root: true }
      );
      // if lists length > 25 delete it
      if (state.lists.length > 25) {
        await dispatch(
          "delete",
          { store: "Backup", criteria: { id: state.lists.slice(-1)[0].id } },
          { root: true }
        );
      }
      commit("Impor/impor", true, { root: true });
      return dispatch("Expor/expor", {}, { root: true });
    },
    check({ dispatch, state, commit }) {
      let now = new Date().getTime();
      let nextBackup = state.lists.length > 0 ? state.lists[0].nextBackup : now;
      if (now > nextBackup) {
        return dispatch("append");
      }
      commit("Impor/impor", false, { root: true });
    },
  },
  getters: {},
};

export default Backup;
