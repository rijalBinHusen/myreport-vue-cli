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
    docBySpv: (state, getters, rootState, rootGetters) => (status) => {
      // {user1: [{id: 1, periode:1 }, {id:2, periode:2}]}
      if (state.lists.length > 0) {
        let result = {};
        // iterate the lists
        rootGetters[`Document/${status}`].forEach((val) => {
          val.periode2 = rootGetters["dateFormat"]({
            format: "dateMonth",
            time: val.periode,
          });
          result[val.name]
            ? result[val.name].push(
                Object.assign(val, { periode2: val.periode2 })
              )
            : (result[val.name] = [
                Object.assign(val, { periode2: val.periode2 }),
              ]);
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
    lastId(state) {
      return state.lists.sort((a, b) => a.id < b.id)[0];
    },
    exportData(state, getters, rootState, rootGetters) {
      return state.lists.map((val) => {
        let spvInfo = rootGetters["Supervisors/spvId"](val.name);
        val.name = spvInfo.name;
        val.warehouse = spvInfo.warehouseName;
        (val.head = rootGetters["Headspv/headId"](val.head).name),
          (val.periode = rootGetters["dateFormat"]({
            format: "ymdexcel",
            time: val.periode,
          }));

        val.collected = !isNaN(val.collected)
          ? rootGetters["dateFormat"]({
              format: "ymdexcel",
              time: val.collected,
            })
          : val.collected;

        val.approval = !isNaN(val.approval)
          ? rootGetters["dateFormat"]({
              format: "ymdexcel",
              time: val.approval,
            })
          : val.approval;

        val.shared = !isNaN(val.shared)
          ? rootGetters["dateFormat"]({ format: "ymdexcel", time: val.shared })
          : val.shared;

        delete val.id;
        delete val.status;

        return val;
      });
    },
  },
};

export default Uncollected;
