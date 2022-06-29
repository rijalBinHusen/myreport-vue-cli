const Problem = {
  namespaced: true,
  state: {
    lists: [],
    unFinished: false,
  },

  mutations: {
    // new data from localbase
    problem(state, value) {
      state.lists = value;
    },
    // add data to
    append(state, value) {
      state.unFinished = true;
      state.lists.unshift(value);
    },
    // update data
    update(state, value) {
      state.lists = state.lists.map((val) => {
        return val.id === value.id ? value : val;
      });
    },
  },

  actions: {
    async getProblemFromDB({ state, commit, dispatch }) {
      // status = uncollected
      // jika sebelumnya belum diambil, atau sudah direplace ( state[statue] === false)
      if (state.unFinished) {
        commit("document", []);
        await dispatch(
          "getDataByCriteriaAppend",
          { store: "Problem", criteria: { isFinished: false } },
          { root: true }
        );
      }
      return "Finished";
    },
  },
  getters: {
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
        status: val?.isfinished ? "Closed" : "Progress",
      }));
    },
    problemId: (state, getters, rootState, rootGetters) => (id) => {
      let rec = JSON.parse(JSON.stringify(state.lists)).find(
        (val) => val.id === id
      );
      return rec && rec.id ? rec : "";
    },
    problemActive: (state) => (time, warehouse, item) => {
      // this.$store.getters["Problem/problemActive"](new Date().getTime())
      let result = [];
      JSON.parse(JSON.stringify(state.lists)).forEach((val) => {
        /* object yang diharapkan
          {
            kodeItem: problemId
          }
          */
        if (
          (time >= val.tanggalMulai || time <= val.tanggalSelesai) &&
          val.warehouse == warehouse &&
          val.item == item
        ) {
          result.push(val.id);
        }
      });
      return result;
    },
    masalah: (state) => (arrayOfProblemId) => {
      let result = [];
      if (arrayOfProblemId.length > 0) {
        state.lists.forEach((val) => {
          if (arrayOfProblemId.includes(val.id)) {
            result.push(val.masalah);
          }
        });
      }
      return result.join(", ");
    },
    problemActiveBySpvAndPeriode:
      (state, getters, rootState, rootGetters) => (spv, periode) => {
        return [...state.lists].filter(
          (val) => val?.nameSpv === spv && val?.tanggalMulai == periode
        );
      },
  },
};

export default Problem;
