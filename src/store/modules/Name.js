const Name = {
  namespaced: true,
  state: {
    lists: [],
    edit: "",
  },

  mutations: {
    // new data from localbase
    name(state, value) {
      state.lists = value;
    },
    // add data to
    append(state, value) {
      state.lists.unshift(value);
    },
    // id record to edit
    edit(state, value) {
      state.edit = value;
    },
    // update data
    update(state, value) {
      state.lists = state.lists.map((val) => {
        return val.id === value.id ? value : val;
      });
    },
  },

  actions: {},
  getters: {
    edit(state) {
      return JSON.parse(
        JSON.stringify(state.lists.find((val) => val.id === state.edit))
      );
    },
    enabled(state) {
      return JSON.parse(
        JSON.stringify(state.lists.filter((val) => val.disabled === false))
      );
    },
	nameId: (state, getters, rootState, rootGetters) => (id) => {
	      return JSON.parse(
			JSON.stringify(state.lists.find((val) => val.id === id))
		  );
	    },
  },
};

export default Name;
