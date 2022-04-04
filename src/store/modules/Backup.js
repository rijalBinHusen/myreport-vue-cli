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
  },

  actions: {
    append({ dispatch, state, rootGetters }, payload) {
      let value = payload ? payload : state.lists[0].setup;
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
      dispatch("Expor/expor", {}, { root: true });
    },
    check({ dispatch, state }) {
      let nextbackup = state.lists[0].nextBackup;
      let now = new Date().getTime();
      if (now > nextbackup) {
        dispatch("append");
      }
    },
  },
  getters: {
    store(state) {
      return JSON.parse(JSON.stringify(state.store));
    },
  },
};

export default Backup;
