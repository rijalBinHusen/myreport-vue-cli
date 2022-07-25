const FollowUp = {
  namespaced: true,
  state: {
    lists: [],
  },

  mutations: {
    // new data from localbase
    supervisors(state, value) {
      state.lists = value;
    },
    // add data to
    append(state, value) {
      state.lists.unshift(value);
    },
    // update data
    update(state, value) {
      state.lists = state.lists.map((val) => {
        return val.id === value.id ? value : val;
      });
    },
    // updateParam(state, payload) {
    //   // payload = { criteria: { id: stk22050003 }, obj: { problem: [] }}
    //   state.lists = state.lists.map((val) => {
    //     // val.id === stk22050003
    //     if (
    //       val[Object.keys(payload.criteria)] == Object.values(payload.criteria)
    //     ) {
    //       // val.problem = []
    //       val[Object.keys(payload.obj)[0]] = Object.values(payload.obj)[0];
    //     }
    //     return val;
    //   });
    // },
  },

  actions: {
    append({ dispatch }, payload) {
      //   payload = { pesan: pembuka+selisih+' sedangkan '+problem, tujuan: spvInfo.phone }
      dispatch(
        "append",
        {
          store: "FollowUp",
          obj: { ...payload, periode: new Date().getTime() },
        },
        { root: true }
      );
    },
    // update({ dispatch, commit }, payload) {
    //   // payload= { name: "", phone: "", id: ""}
    //   // state
    //   commit("update", payload);
    //   //idb
    //   dispatch(
    //     "updateOnly",
    //     {
    //       store: "Supervisors",
    //       criteria: { id: payload?.id },
    //       obj: { name: payload?.name, phone: payload?.phone },
    //     },
    //     { root: true }
    //   );
    // },
    // // append({ dispatch }, payload) {
    //   //payload = {name: odjfer, phone: 123123123}
    //   dispatch(
    //     "append",
    //     {
    //       store: "Supervisors",
    //       obj: payload,
    //     },
    //     { root: true }
    //   );
    // },
    // // updateParam({ commit, dispatch }, payload) {
    //   // payload ={ id: 123, param: { shift: 3 } }
    //   dispatch(
    //     "updateOnly",
    //     {
    //       store: "Supervisors",
    //       criteria: { id: payload?.id },
    //       obj: {
    //         [Object.keys(payload?.param)[0]]: Object.values(payload?.param)[0],
    //       },
    //     },
    //     { root: true }
    //   );
    //   // update state
    //   commit("updateParam", {
    //     criteria: { id: payload?.id },
    //     obj: {
    //       [Object.keys(payload?.param)[0]]: Object.values(payload?.param)[0],
    //     },
    //   });
    // },
  },
  //   getters: {},
};

export default FollowUp;
