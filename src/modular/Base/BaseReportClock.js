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
    getDataByParent({commit, dispatch, rootState}, parent) {
      commit("basereportclock", [])
      rootState.BaseReportFile.lists.forEach((val) => {
        dispatch("getDataByCriteriaAppend", { 
          store: "BaseReportClock", 
          criteria: {parent: val.id} 
        }, { root: true })
      })
    }
  },
  getters: {
    shiftAndParent: (state) => (shift, id) => {
      return JSON.parse(
        JSON.stringify(state.lists.filter((val) => val.shift == shift && val.parent == id)
      ));
    },
    detailsByShiftAndParent: (state, rootGetters) => (shift, id) => {
      let totalDo = 0;
      let totalKendaraan = 0;
      let totalWaktu = 0
      let filtered = JSON.parse(JSON.stringify(state.lists)).filter((val) => val.shift == shift && val.parent == id)
      filtered.forEach((val) => {
                totalDo += 1
                totalKendaraan += 1
                // start
                let start = rootGetters["dateFormat"]({format: "time", time: `2022-03-03 ${val.start.slice(0,2)}:${val.start.slice(3,5)}` })
                //finish
                let finish = rootGetters["dateFormat"]({format: "time", time: `2022-03-03 ${val.finish.slice(0,2)}:${val.finish.slice(3,5)}` })
                // jika finish lebih kecil dari pada start, maka finish ditambah 24 jam guys (86400000)
                // finish - start
                let total = finish < start ? (finish + 86400000) - start : finish - start
                // jaddikan menit, masukan total waktu
                totalWaktu += (total / 1000) / 60 - (val.rehat * 60 )
            })
      return {
          totalDo: totalDo,
          totalKendaraan: totalKendaraan,
          totalWaktu: totalWaktu
      }

    }
  },
};

export default BaseReportClock;
