const Problem = {
  namespaced: true,
  state: {
    lists: [],
    store: { store: "Problem" },
  },

  mutations: {
    // new data from localbase
    problem(state, value) {
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
  },

  actions: {},
  getters: {
    store(state) {
      return JSON.parse(JSON.stringify(state.store));
    },
    lists(state, getters, rootState, rootGetters) {
      // let rec =
      if (state.lists.length < 1) {
        return [];
      }
      return state.lists.map((val) => ({
        id: val.id,
        namaGudang: rootGetters["Warehouses/warehouseId"](val.warehouse).name,
        namaItem: rootGetters["Baseitem/baseItemKode"](val.item).name,
        masalah: val.masalah,
        tanggalMulai: rootGetters["dateFormat"]({
          format: "dateMonth",
          time: val.tanggalMulai,
        }),
        status: val.tanggalMulai == val.tanggalSelesai ? "Progress" : "Closed",
      }));
    },
    problemId: (state, getters, rootState, rootGetters) => (id) => {
      let rec = JSON.parse(JSON.stringify(state.lists)).find(
        (val) => val.id === id
      );
      return rec;
      //  && rec.name
      //   ? Object.assign(rec, {
      //       warehouseName: rootGetters["Warehouses/warehouseId"](rec.warehouse)
      //         .name,
      //     })
      //   : {
      //       name: null,
      //       phone: null,
      //       warehouse: null,
      //       disabled: false,
      //     };
    },
  },
};

export default Problem;