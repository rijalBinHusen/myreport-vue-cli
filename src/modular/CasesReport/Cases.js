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
    updateParam(state, payload) {
      // payload = { criteria: { id: stk22050003 }, obj: { problem: [] }}
      state.lists = state.lists.map((val) => {
        // val.id === stk22050003
        if (
          val[Object.keys(payload.criteria)] == Object.values(payload.criteria)
        ) {
          // val.problem = []
          val[Object.keys(payload.obj)[0]] = Object.values(payload.obj)[0];
        }
        return val;
      });
    },
  },
  actions: {
    async append({ dispatch, commit }, payload) {
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
      // update state
      commit("updateParam", {
        criteria: { id: payload.parent },
        obj: { inserted: true },
      });
    },
  },
  getters: {
    imported(state) {
      return state.lists.filter((val) => val.import);
    },
    inserted(state, rootState, getters, rootGetters) {
      return state.lists.filter((val) => {
        if (val.insert) {
          val.periode2 = rootGetters["dateFormat"]({
            format: "dateMonth",
            time: val.periode,
          });
          val.spvName = rootGetters["Supervisors/spvId"](val?.name)?.name;
          val.headName = rootGetters["Headspv/headId"](val?.head)?.name;
          return val;
        }
      });
    },
    caseId: (state) => (id) => {
      return JSON.parse(JSON.stringify(state.lists)).find(
        (val) => val.id == id
      );
    },
  },
};

export default Cases;
