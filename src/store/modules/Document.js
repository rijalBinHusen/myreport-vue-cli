const Uncollected = {
  namespaced: true,
  state: {
    lists: [],
  },

  mutations: {
    // new data from localbase
    document(state, value) {
      state.lists = value;
    },
    // add data to
    append(state, value) {
      if (Array.isArray(value)) {
        value.forEach((val) => state.lists.push(val));
        return;
      }
      state.lists.push(value);
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
    uncollected(state) {
      return state.lists.length > 0
        ? JSON.parse(JSON.stringify(state.lists)).filter(
            (val) => val.status === 0
          )
        : [];
    },
    collected(state) {
      return JSON.parse(JSON.stringify(state.lists)).filter(
        (val) => val.status === 1
      );
    },
    approval(state) {
      return JSON.parse(JSON.stringify(state.lists)).filter(
        (val) => val.status === 2
      );
    },
    // all uncollected record
    uncollectedBySpv(state, getters, rootState, rootGetters) {
      // {user1: [{id: 1, periode:1 }, {id:2, periode:2}]}
      if (state.lists.length > 0) {
        let result = {};
        // sort the lists
        let temp = rootGetters["Document/uncollected"].sort(
          (a, b) => a.periode < b.periode
        );
        // iterate the lists
        temp.forEach((val) => {
          val.periode = rootGetters["dateFormat"]({
            format: "dateMonth",
            time: val.periode,
          });
          result[val.name]
            ? result[val.name].push(val.periode)
            : (result[val.name] = [val.periode]);
        });
        return result;
      }
    },
    // mengembalikan tanggal terakhir yang sudah diinput
    lastDate(state) {
      let temp;
      if (state.lists.length > 0) {
        // extract all date
        let number = state.lists.map((val) => val.periode);
        // find the highest value of number
        temp = new Date(Math.max.apply(Math, number));
      } else {
        temp = new Date("2022-01-01");
      }
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
