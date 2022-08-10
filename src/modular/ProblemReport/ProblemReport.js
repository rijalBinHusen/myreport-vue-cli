const Problem = {
  namespaced: true,
  state: {
    lists: [],
  },

  mutations: {
    // new data from localbase
    problem(state, value) {
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

  actions: {
    getProblemFromDB({ state, commit, dispatch }) {
      // status = uncollected
      // jika sebelumnya belum diambil, atau sudah direplace ( state[statue] === false)
      if (!state.lists.length) {
        return dispatch(
          "getDataByCriteria",
          { store: "Problem", criteria: { isFinished: false } },
          { root: true }
        );
      }
    },
  },
  getters: {
    lists(state, getters, rootState, rootGetters) {
      // let rec =
      return state.lists.length
        ? state.lists.map((val) => ({
            id: val.id,
            namaGudang: rootGetters["Warehouses/warehouseId"](val.warehouse)
              .name,
            namaItem: rootGetters["Baseitem/baseItemKode"](val.item).name,
            masalah: val.masalah,
            periode: rootGetters["dateFormat"]({
              format: "dateMonth",
              time: val.periode,
            }),
            status: val?.isFinished ? "Closed" : "Progress",
          }))
        : [];
    },
    problemId: (state, getters, rootState, rootGetters) => (id) => {
      let rec = JSON.parse(JSON.stringify(state.lists)).find(
        (val) => val.id === id
      );
      return rec && rec.id ? rec : "";
    },
    problemActive: (state) => (time, warehouse, item) => {
      // this.$store.getters["Problem/problemActive"](new Date().getTime())
      /* expected result = [itemId, itemId] */
      let result = [];
      JSON.parse(JSON.stringify(state.lists)).forEach((val) => {
        if (!val.isFinished && val.warehouse == warehouse && val.item == item) {
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
          (val) => val?.nameSpv === spv && val?.periode == periode
        );
      },
    problemByItem: (state) => (warehouse, item) => {
      // this.$store.getters["Problem/problemActive"](new Date().getTime())
      /* expected result = [itemId, itemId] */
      return JSON.parse(JSON.stringify(state.lists)).filter((val) => val.warehouse == warehouse && val.item == item);
    },
  },
};

export default Problem;
