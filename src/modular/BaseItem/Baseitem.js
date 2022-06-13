const Baseitem = {
  namespaced: true,
  state: {
    lists: [],
  },

  mutations: {
    // new data from localbase
    baseitem(state, value) {
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
    delete(state, value) {
      state.lists = state.lists.filter(
        (val) => val?.id !== value
      );
    },
  },

  actions: {
    getAllItem({state, dispatch}) {
      if(state.lists.length <= 200) {
        dispatch("getDataByCriteria", { store: "Baseitem", allData: true }, {root: true})
      }
    },
    update({dispatch, commit}, payload){
      // payload= { name: "", phone: "", id: ""}
      // state
      commit("update", payload)
      
      //idb
      dispatch("updateOnly",{
        store: "Baseitem",
        criteria: { id: payload?.id},
        obj : { kode: payload?.kode, name: payload?.name }
      }, { root: true })
    },
    append({dispatch}, payload) {
      //payload = {name: odjfer, phone: 123123123}
      dispatch("append", {
              store: "Baseitem",
              obj: payload
            }, {root: true})
    },
  },
  getters: {
    baseItemId: (state, getters, rootState, rootGetters) => (id) => {
      return [...state.lists].find((val) => val.id === id);
    },
    baseItemKode: (state, getters, rootState, rootGetters) => (kode) => {
      let rec = [...state.lists].find((val) => val.kode === kode);
      return rec && rec.name
        ? rec
        : {
            id: "",
            name: "No item name",
          };
    },
  },
};

export default Baseitem;
