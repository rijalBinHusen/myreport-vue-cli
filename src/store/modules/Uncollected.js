const Uncollected = {
  namespaced: true,
  state: {
    lists: [],
    store: { store: "Uncollected" },
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
      state.lists = state.lists.filter((val) => val.id !== value);
    },
  },
  actions: {},
  getters: {
    // all uncollected record
    uncollected(state, getters, rootState, rootGetters) {
      // {user1: [{id: 1, periode:1 }, {id:2, periode:2}]}
      let result = {};
      JSON.parse(JSON.stringify(state.lists)).forEach((val) => {
        val.periode = rootGetters["dateFormat"]({
          format: "dateMonth",
          time: val.periode,
        });
        result[val.name]
          ? result[val.name].push(val)
          : (result[val.name] = [val]);
      });
      return result;
    },
    // mengembalikan info store
    store(state) {
      return JSON.parse(JSON.stringify(state.store));
    },
    // mengembalikan tanggal terakhir yang sudah diinput
    lastDate(state) {
      let temp =
        state.lists.length > 0
          ? new Date(JSON.parse(JSON.stringify(state.lists[0].periode)))
          : new Date("2022-01-01");
      temp.setDate(temp.getDate() + 1);
      return temp;
    },
    //mengembalikan record sesuai id
    getId: (state) => (id) => {
      let lists = JSON.parse(JSON.stringify(state.lists));
      return lists.find((val) => val.id === id);
    },
  },
};

export default Uncollected;
