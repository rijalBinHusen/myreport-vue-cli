const Headspv = {
  namespaced: true,
  state: {
    lists: [],
  },

  mutations: {
    // new data from localbase
    headspv(state, value) {
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
    updateParam(state, payload) {
      // payload = { criteria: { id: stk22050003 }, obj: { problem: [] }}
      state.lists = state.lists.map((val) => {
        // val.id === stk22050003
        if(val[Object.keys(payload.criteria)] == Object.values(payload.criteria)) {
          // val.problem = []
          val[Object.keys(payload.obj)[0]] = Object.values(payload.obj)[0]
        }
        return val
      })
    },
  },

  actions: {
    update({dispatch, commit}, payload){
      // payload= { name: "", phone: "", id: ""}// state
      commit("update", payload)
      
      //idb
      dispatch("updateOnly",{
        store: "Headspv",
        criteria: { id: payload?.id},
        obj : { name: payload?.name, phone: payload?.phone }
      }, { root: true })
    },
    append({dispatch}, payload) {
      //payload = {name: odjfer, phone: 123123123}
      dispatch("append", {
              store: "Headspv",
              obj: payload
            }, {root: true})
    },
    updateParam({commit, dispatch}, payload) {
      // payload ={ id: 123, param: { shift: 3 } }
      dispatch("updateOnly", { 
        store: "Headspv", 
        criteria: { id: payload?.id }, 
        obj: { [Object.keys(payload?.param)[0]]: Object.values(payload?.param)[0]}
      }, { root: true })
      // update state
      commit("updateParam", { 
        criteria: { id: payload?.id }, 
        obj: { [Object.keys(payload?.param)[0]]: Object.values(payload?.param)[0]}
      })
    },
  },
  getters: {
    enabled(state) {
      return state.lists.filter((val) => val.disabled === false);
    },
    headId: (state, getters, rootState, rootGetters) => (id) => {
      let rec = JSON.parse(JSON.stringify(state.lists)).find(
        (val) => val.id === id
      );
      return rec && rec.name
        ? rec
        : {
            name: "Not found",
            phone: "Not found",
          };
    },
    shift: (state, getters, rootState, rootGetters) => (shift) => {
      let rec = [...state.lists].find((val) => val.shift == shift);
      return rec && rec.name
        ? rec
        : {
            name: "Vacant",
            phone: "Not found",
          };
    },
  },
};

export default Headspv;
