const Supervisors = {
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
    updateWarehouses({ commit, dispatch}, payload) {
      // console.log(payload)
      // payload = {id: 123, supervisors: [] }
      dispatch("updateOnly", { 
        store: "Supervisors", 
        criteria: { id: payload?.id }, 
        obj: { warehouses: payload?.warehouses }
      }, { root: true })
      // update state
      commit("updateParam", { 
        criteria: { id: payload?.id }, 
        obj: { warehouses: payload?.warehouses } 
      })
    },
  },
  getters: {
    lists(state, getters, rootState, rootGetters) {
      // let rec = JSON.parse(JSON.stringify(state.lists));
      return JSON.parse(JSON.stringify(state)).lists.map((val) => {
        val.warehouseName = rootGetters["Warehouses/warehouseId"](
          val.warehouse
        ).name;
        return val;
      });
    },
    enabled(state) {
      return JSON.parse(
        JSON.stringify(state.lists.filter((val) => val.disabled === false))
      );
    },
    spvId: (state, getters, rootState, rootGetters) => (id) => {
      let rec = JSON.parse(JSON.stringify(state.lists)).find((val) => val.id === id);
      return rec && rec.name
        ? Object.assign(rec, {
            warehouseName: rootGetters["Warehouses/warehouseId"](rec.warehouse)
              .name,
          })
        : {
            name: null,
            phone: null,
            warehouse: null,
            disabled: false,
          };
    },
  },
};

export default Supervisors;
