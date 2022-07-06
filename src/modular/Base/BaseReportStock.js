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
    updateParam(state, payload) {
      // payload = { criteria: { id: stk22050003 }, obj: { problem: [] }}
      state.lists = state.lists.map((val) => {
        // val.id === stk22050003
        if (
          val[Object.keys(payload.criteria)] == Object.values(payload.criteria)
        ) {
          // val.problem = []
          val[Object.keys(payload.obj)[0]] = Object.values(payload.obj)[0];
        }
        return val;
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
                store: "BaseReportStock",
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
      //delete baseReportstock from state
      commit(
        "BaseReportStock/deleteByParam",
        { parameter: "parent", value: payload },
        { root: true }
      );
      //delete from idb
      return dispatch(
        "deleteByParam",
        {
          store: "BaseReportStock",
          parameter: "parent",
          value: payload,
        },
        { root: true }
      );
    },
    async getDataByParent({ commit, dispatch, rootState }) {
      commit("basereportstock", []);
      let parent = rootState.BaseReportFile.lists;
      for (let i = 0; i < parent.length; i++) {
        await dispatch(
          "getDataByCriteriaAppend",
          {
            store: "BaseReportStock",
            criteria: { parent: parent[i].id },
          },
          { root: true }
        );
      }
    },
    deleteProblem({ dispatch, commit }, payload) {
      // payload = id
      // update indexeddb
      dispatch(
        "updateOnly",
        {
          store: "BaseReportStock",
          criteria: { id: payload },
          obj: { problem: [] },
        },
        { root: true }
      );
      // update state
      commit("updateParam", {
        criteria: { id: payload },
        obj: { problem: [] },
      });
    },
    updateProblem({ dispatch, commit }, payload) {
      // payload = { id: id, problem: []}
      // update indexeddb
      // console.log(payload)
      dispatch(
        "updateOnly",
        {
          store: "BaseReportStock",
          criteria: { id: payload.id },
          obj: { problem: payload.problem },
        },
        { root: true }
      );
      // update state
      commit("updateParam", {
        criteria: { id: payload.id },
        obj: { problem: payload.problem },
      });
    },
    async saveFromExcelMode({ dispatch, commit }, arrayOfRecord) {
      // open loader
      commit("Modal/active", { judul: "", form: "Loader" }, { root: true });
      // iterate

      for (let i = 0; i < arrayOfRecord.length; i++) {
        // jika keluar ada tanggalnya dan end date kosong dan akhir > 0 maka end date dikasi tanggal
        if (
          arrayOfRecord[i].dateOut &&
          !arrayOfRecord[i].dateEnd &&
          +arrayOfRecord[i].real > 0
        ) {
          arrayOfRecord[i].dateEnd = arrayOfRecord[i].dateOut;
        }
        // jika keluar ada tanggalnya dan akhir == 0
        else if (arrayOfRecord[i].dateOut && +arrayOfRecord[i].real == 0) {
          arrayOfRecord[i].dateEnd = "-";
        }
        commit("update", arrayOfRecord[i]);
        let record = Object.assign({}, arrayOfRecord[i]);
        delete record.itemName;
        delete record.selisih;
        delete record.problem2;
        await dispatch(
          "updateOnly",
          {
            store: "BaseReportStock",
            criteria: { id: arrayOfRecord[i].id },
            obj: {
              item: record.item,
              awal: record.awal,
              in: record.in,
              planOut: record.planOut,
              out: record.out,
              real: record.real,
              dateIn: record.dateIn,
              dateOut: record.dateOut,
              dateEnd: record.dateEnd,
            },
          },
          { root: true }
        );
      }
      // tutup loader
      commit("Modal/active", false, { root: true });
    },
    async addItem({ dispatch, commit }, payload) {
      // open loader
      commit(
        "Modal/active",
        { judul: "", form: "Loader", before: "BaseStockForm" },
        { root: true }
      );
      // payload = [{item: 01}, {item:02}]
      for (let i = 0; i < payload.length; i++) {
        let obj = Object.assign(JSON.parse(JSON.stringify(payload[i])), {
          awal: "",
          in: "",
          out: "",
          dateIn: "",
          dateOut: "",
          dateEnd: "",
          real: "",
          problem: [],
        });
        if (obj.item) {
          commit("append", obj);
          // console.log(obj)
          await dispatch(
            "appendWoutGenerateId",
            { store: "BaseReportStock", obj: obj },
            { root: true }
          );
        }
      }
      // close loader
      commit("Modal/active", false, { root: true });
    },
    getDataToExportAsReport({ dispatch }, payload) {
      // payload = { parent: "", shift: "" }
      return dispatch(
        "getDataByCriteria",
        { store: "BaseReportStock", criteria: payload },
        { root: true }
      );
    },
  },
  getters: {
    shiftAndParent: (state, getters, rootState, rootGetters) => (shift, id) => {
      return state.lists.length > 0
        ? JSON.parse(
            JSON.stringify(
              state.lists.filter((val) => {
                if (val.shift == shift && val.parent == id) {
                  val.itemName = rootGetters["Baseitem/baseItemKode"](
                    val.item
                  ).name;
                  val.selisih =
                    Number(val.real) -
                    (Number(val.awal) + Number(val.in) - Number(val.out));
                  val.problem2 = rootGetters["Problem/masalah"](val.problem);
                  val.planOut = "";
                  return val;
                }
              })
            )
          )
        : [];
    },
    detailsByShiftAndParent: (state) => (shift, id) => {
      /*
       expected result = {
          totalIn: Number, 
          totalItemMoving: Number, 
          totalQtyOut: Number, 
          totalProductNotFifo: Number 
      }
      */
      let result = {
        totalItemMoving: 0,
        totalQTYIn: 0,
        totalQTYOut: 0,
        totalProductNotFIFO: 0,
        planOut: 0,
        totalItemKeluar: 0,
      };
      state.lists.forEach((val) => {
        if (val.shift == shift && val.parent == id) {
          if (Number(val.out)) {
            result["totalItemKeluar"]++;
          }
          result["totalItemMoving"]++;
          result["totalQTYIn"] = result["totalQTYIn"] + Number(val.in);
          result["totalQTYOut"] = result["totalQTYOut"] + Number(val.out);
          result["planOut"] = result["planOut"] + Number(val?.planOut);
        }
      });

      return result;
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
        let parentFile = rootGetters["BaseReportFile/baseId"](val.parent);
        return {
          id: val.id,
          parent: val.parent,
          parentDocument: "",
          periode: rootGetters["dateFormat"]({
            format: "dateMonth",
            time: parentFile.periode,
          }),
          gudang: rootGetters["Warehouses/warehouseId"](parentFile.warehouse)
            .name,
          shift: val.shift,
          item: val.item,
          namaItem: rootGetters["Baseitem/baseItemKode"](val.item).name,
          awal: val.awal,
          Masuk: val.in,
          TanggalMasuk: val.dateIn ? val.dateIn : "",
          planKeluar: "",
          Keluar: val.out,
          TanggalKeluar: val.dateOut ? val.dateOut : "",
          Akhir: "",
          real: val.real,
          TanggalAkhir: val.dateEnd ? val.dateEnd : "",
          selisih: "",
          isChanged: "",
        };
      });
    },
  },
};

export default BaseReportStock;
