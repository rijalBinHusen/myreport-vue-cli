const BaseReportClock = {
  namespaced: true,
  state: {
    lists: [],
    store: { store: "BaseReportClock", split: "bulan" },
  },
  mutations: {
    // add data to
    append(state, value) {
      if (Array.isArray(value) && value.length > 0) {
        value.forEach((val) => state.lists.push(val));
      } else {
        state.lists.unshift(value);
      }
    },
    // update data
    update(state, value) {
      state.lists = state.lists.map((val) => {
        return val.id === value.id ? value : val;
      });
    },
    delete(state, value) {
      // value = { parameter: "parent", value: "c038" }
      state.lists = state.lists.filter((val) => val.id !== value);
    },
    basereportclock(state, payload) {
      state.lists = payload;
    },
    deleteByParam(state, value) {
      // value = { parameter: "parent", value: "c038" }
      state.lists = state.lists.filter(
        (val) => val[value.parameter] !== value.value
      );
    },
  },
  actions: {
    async markAsFinished({ dispatch, state }, payload) {
      //payload { parentDocument: ev, shift: this.shift, parent: this.base?.id }
      // iterate the state
      for (let i = 0; i < state.lists.length; i++) {
        // if state?.shift == payload.shift && payload?.parent
        if (
          state.lists[i]?.shift == payload?.shift &&
          state.lists[i]?.parent == payload?.parent
        ) {
          // jika parentDocument kosong
          if (!state.lists[i]?.parentDocument) {
            // update recordnya
            state.lists[i].parentDocument = payload?.parentDocument;
            await dispatch(
              "updateOnly",
              {
                store: "BaseReportClock",
                obj: { parentDocument: payload?.parentDocument },
                criteria: { id: state.lists[i]?.id },
              },
              { root: true }
            );
          }
          // jika sudah terisi
        }
      }
      return "Finished";
    },
    deleteRecordByParent({ dispatch, commit }, payload) {
      // payload = parentId
      //delete from state
      commit(
        "BaseReportClock/deleteByParam",
        { parameter: "parent", value: payload },
        { root: true }
      );
      //delete from idb
      return dispatch(
        "deleteByParam",
        {
          store: "BaseReportClock",
          parameter: "parent",
          value: payload,
        },
        { root: true }
      );
    },
    async getDataByParent({ commit, dispatch, rootState }) {
      commit("basereportclock", []);
      let parent = rootState.BaseReportFile.lists;
      for (let i = 0; i < parent.length; i++) {
        await dispatch(
          "getDataByCriteriaAppend",
          {
            store: "BaseReportClock",
            criteria: { parent: parent[i].id },
          },
          { root: true }
        );
      }
    },
    async saveFromExcelMode({ dispatch, commit }, arrayOfRecord) {
      // open loader
      commit("Modal/active", { judul: "", form: "Loader" }, { root: true });
      // iterate

      for (let i = 0; i < arrayOfRecord.length; i++) {
        commit("update", arrayOfRecord[i]);
        // let record = Object.assign({}, arrayOfRecord[i]);
        await dispatch(
          "update",
          {
            store: "BaseReportClock",
            criteria: { id: arrayOfRecord[i].id },
            obj: { ...arrayOfRecord[i] },
          },
          { root: true }
        );
      }
      // tutup loader
      commit("Modal/active", false, { root: true });
    },
  },
  getters: {
    shiftAndParent: (state) => (shift, id) => {
      return JSON.parse(
        JSON.stringify(
          state.lists.filter((val) => val.shift == shift && val.parent == id)
        )
      );
    },
    detailsByShiftAndParent:
      (state, getters, rootState, rootGetters) => (shift, id) => {
        let totalDo = 0;
        let totalKendaraan = 0;
        let totalWaktu = 0;
        [...state.lists].forEach((val) => {
          if (
            val.shift == shift &&
            val.parent == id &&
            val.start.length == 5 &&
            val.finish.length == 5
          ) {
            totalDo += 1;
            totalKendaraan += 1;
            // start
            let start = rootGetters["dateFormat"]({
              format: "time",
              time: `2022-03-03 ${val.start.slice(0, 2)}:${val.start.slice(
                3,
                5
              )}`,
            });
            //finish
            let finish = rootGetters["dateFormat"]({
              format: "time",
              time: `2022-03-03 ${val.finish.slice(0, 2)}:${val.finish.slice(
                3,
                5
              )}`,
            });
            // jika finish lebih kecil dari pada start, maka finish ditambah 24 jam guys (86400000)
            // finish - start
            let total =
              finish < start ? finish + 86400000 - start : finish - start;
            // jaddikan menit, masukan total waktu
            totalWaktu += total / 1000 / 60 - val.rehat * 60;
          }
        });
        return {
          totalDo: totalDo,
          totalKendaraan: totalKendaraan,
          totalWaktu: totalWaktu,
        };
      },
  },
};

export default BaseReportClock;
