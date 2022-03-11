const Expor = {
  namespaced: true,
  state: {
    lists: {},
  },
  mutations: {
    append(state, value) {
      state.lists[value.store] = value.obj;
    },
  },
  actions: {
    //   expor all data
    expor({ commit, rootState, dispatch }) {
      // get all store from state
      let store = JSON.parse(JSON.stringify(rootState.store));
      // iterate, push to variable and waiting
      for (let i = 0; i < store.length; i++) {
        dispatch("getAllData", store[i], { root: true }).then((val) =>
          commit("append", { store: store[i], obj: val })
        );
      }
      // return the variable
      return new Promise((resolve) => {
        setTimeout(() => resolve(), 1500);
      });
    },
    // async exportDataCollect(state) {
    //     // set download indicator to false
    //     state.exportDataCollect.status = false;
    //     // find all store name in indexeddb
    //     let divisi = mydb.getData({ store: "divisi" });
    //     let bagian = mydb.getData({ store: "bagian" });
    //     let level = mydb.getData({ store: "level" });
    //     let karyawan = mydb.getData({ store: "karyawan" });
    //     let absen = mydb.getData({
    //       store: "absen",
    //       orderBy: "tanggal",
    //       desc: true,
    //     });
    //     let impor = mydb.getData({
    //       store: "import",
    //       orderBy: "time",
    //       desc: true,
    //       limit: 10,
    //     });
    //     let expor = mydb.getData({
    //       store: "export",
    //       orderBy: "time",
    //       desc: true,
    //       limit: 10,
    //     });
    //     state.exportDataCollect = await Promise.all([
    //       impor,
    //       expor,
    //       divisi,
    //       bagian,
    //       level,
    //       karyawan,
    //       absen,
    //     ]).then((val) => ({
    //       import: val[0],
    //       export: val[1],
    //       divisi: val[2],
    //       bagian: val[3],
    //       level: val[4],
    //       karyawan: val[5],
    //       absen: val[6],
    //       status: true,
    //     }));
    //     // state.statusExport = true;
    //   },
  },
  getters: {},
};

export default Expor;
