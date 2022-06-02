const BaseReportStock = {
  namespaced: true,
  state: {
    lists: [],
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
    basereportstock(state, payload) {
      state.lists = payload;
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
    deleteByParam(state, value) {
      // value = { parameter: "parent", value: "c038" }
      state.lists = state.lists.filter(
        (val) => val[value.parameter] !== value.value
      );
    },
  },
  actions: {
    async getDataByParent({commit, dispatch, rootState}) {
      commit("basereportstock", [])
      let parent = rootState.BaseReportFile.lists
      for(let i = 0; i < parent.length; i++) {
          await dispatch("getDataByCriteriaAppend", { 
            store: "BaseReportStock", 
            criteria: {parent: parent[i].id} 
          }, { root: true })
      }
    }
  },
  getters: {
    shiftAndParent: (state, getters, rootState, rootGetters) => (shift, id) => {
      return  state.lists.length > 0 
        ? JSON.parse(
            JSON.stringify(state.lists.filter((val) => {
              if(val.shift == shift && val.parent == id) {
                return val
              }
            })
          ))
        : []
    },
    standartWaktuByParentAndShift: (state) => (shift, id) =>  {
      let filtered = JSON.parse(JSON.stringify(state.lists)).filter((val) => val.shift == shift && val.parent == id)
      let result = 0
       filtered.forEach((val) => {
        result += val.out
      })
       return result
    },
    exportData(state, getters, rootState, rootGetters) {
    // id, [v]
    // parent,[v] 
    // parentdocument
    // periode, [v]
    // gudang, [v]
    // shift, [v]
    // item, [v]
    // namaitem, 
    // awal, [v]
    // in, [v]
    // datein, [v]
    // out, [v]
    // dateout, [v]
    // real, [v]
    // dateend, [v]
    // problem
    return state.lists.map((val) => {
      let parentFile = rootGetters["BaseReportFile/baseId"](val.parent)
      return {
        id: val.id,
        parent: val.parent,
        periode: rootGetters["dateFormat"]({ format: "dateMonth", time: parentFile.periode }),
        gudang: rootGetters["Warehouses/warehouseId"](parentFile.warehouse).name,
        shift: val.shift,
        item: val.item,
        namaItem: "",
        awal: val.awal,
        Masuk: val.in,
        TanggalMasuk: val.dateIn ? val.dateIn : "",
        Keluar: val.out,
        TanggalKeluar: val.dateOut ? val.dateOut : "" ,
        Akhir: "",
        real: val.real,
        TanggalAkhir: val.dateEnd ? val.dateEnd : "",
        selisih: "",
      }
    })

    }
  },
};

export default BaseReportStock;
