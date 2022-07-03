const Cases = {
  namespaced: true,
  state: {
    lists: [],
    dataStarter: false,
  },
  mutations: {
    // add data to
    append(state, value) {
      if (Array.isArray(value) && value.length > 0) {
        value.forEach((val) => state.lists.push(val));
      } else {
        state.lists.unshift(value);
      }
    },
    // data starter status
    dataStarter(state) {
      state.dataStarter = true;
    },
    // update data
    update(state, value) {
      state.lists = state.lists.map((val) => {
        return val.id === value.id ? value : val;
      });
    },
    cases(state, payload) {
      state.lists = payload;
    },
    delete(state, value) {
      // value = { parameter: "parent", value: "c038" }
      state.lists = state.lists.filter((val) => val.id !== value);
    },
  },
  actions: {
    async append({ dispatch }, payload) {
      //  update base imported record to inserted true
      await dispatch(
        "updateOnly",
        {
          store: "Cases",
          criteria: { id: payload.parent },
          obj: { inserted: true },
        },
        { root: true }
      );
      // append to idb
      await dispatch(
        "append",
        {
          store: "Cases",
          obj: payload,
        },
        { root: true }
      );
    },
  },
  getters: {
    imported(state) {
      return state.lists.filter((val) => val.import);
    },
  },
};

export default Cases;
