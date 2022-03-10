const Uncollected = {
  namespaced: true,
  state: {
    lists: [],
  },

  mutations: {
    // new data from localbase
    uncollected(state, value) {
      state.lists = value;
    },
    // add data to
    append(state, value) {
      state.lists.unshift(value);
    },
    delete(state, value) {
      console.log(value);
      state.lists = state.lists.filter((val) => val.id !== value);
    },
  },
  actions: {},
  getters: {
    uncollected(state) {
      // {user1: [{id: 1, periode:1 }, {id:2, periode:2}]}
      let result = {};
      state.lists.forEach((val) => {
        result[val.name]
          ? result[val.name].push(val)
          : (result[val.name] = [val]);
      });
      return JSON.parse(JSON.stringify(result));
    },
  },
};

export default Uncollected;
