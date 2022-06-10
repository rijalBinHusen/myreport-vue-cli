const Warehouses = {
  namespaced: true,
  state: {
    lists: [],
  },

  mutations: {
    // new data from localbase
    warehouses(state, value) {
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
    }
  },

  actions: {
    updateSupervisors({ commit, dispatch}, payload) {
      // console.log(payload)
      // payload = {id: 123, supervisors: [] }
      dispatch("updateOnly", { 
        store: "Warehouses", 
        criteria: { id: payload?.id }, 
        obj: { supervisors: payload?.supervisors }
      }, { root: true })
      // update state
      commit("updateParam", { 
        criteria: { id: payload?.id }, 
        obj: { supervisors: payload?.supervisors } 
      })
    },
  },
  getters: {
    warehouseId: (state) => (id) => {
      let rec = JSON.parse(JSON.stringify(state.lists)).find(
        (val) => val.id === id
      );
      return rec && rec.name
        ? rec
        : {
            id: "",
            name: "Not found",
          };
    },
  },
};

export default Warehouses;
