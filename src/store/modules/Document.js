const Uncollected = {
  namespaced: true,
  state: {
    lists: [],
    allData: false,
  },

  mutations: {
    allData(state) {
      state.allData = !state.allData
    },
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
  actions: {
    async getAllDocumentNotFinished({state, commit, dispatch}) {
      if(state.allData) { return }
      commit("Modal/active", { judul: "", form: "Loader" }, { root: true })
      // cari document dengan criteria { isFinished: false }
      await dispatch("getDataByCriteria", {store: "Document", criteria: { isfinished: "false" } }, { root: true })
      // looping cari baseReportFile dengan criteria { periode: document.periode, imported: true }
      await dispatch("BaseReportFile/getDataByState", {}, { root: true })
      // looping cari baseReportStock dengan criteria { parent: baseReportFile.id }
      await dispatch("BaseReportStock/getDataByParent", {}, { root: true })
      // // looping cari baseReportClock dengan criteria { parent: baseReportFile.id }
      await dispatch("BaseReportClock/getDataByParent", {}, { root: true })
      // cari problem yang belum solve
      await dispatch("getDataByCriteria", {store: "Problem", criteria: { isfinished: false } }, { root: true })
      // 
      commit("Modal/active", false, { root: true })
      commit("allData")
      return "finished"
    },
  },
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

        val.finished = !isNaN(val.finished)
          ? rootGetters["dateFormat"]({ format: "ymdexcel", time: val.finished })
          : val.finished

        delete val.id;
        delete val.status;

        return val;
      });
    },
    dateDocument(state, getters, rootState, rootGetters) {
      // get the uniquee date
      let uniquee = [ ...new Set ( JSON.parse(JSON.stringify(state.lists)).map((val) => val.periode) ) ]
      //return as object
      return uniquee.length > 0 
        ? uniquee.map((val) => {
            return {
              periode: val,
              periode2: rootGetters["dateFormat"]({format: "dateMonth", time: val})
            }
          })
        : []
    },
    exportCompletely(state, getters, rootState, rootGetters) {
    // data expected like so
    // id: idrecord, [v]
    // name: spvrecord, [v] 
    // periode: perioderecord, [v]
    // shift: shiftrecord, [v]
    // head: headrecord, [v]
    // collected: collectedrecord, [v]
    // approval: approvalrecord, [v]
    // shared: false, [v]
    // finished: false, [v]
    // basereportfile: false, [v]
    // totaldo: false, [v]
    // totalkendaraan: false, [v]
    // totalwaktu: false, [v]
    // standartwaktu: false, [v]
    // isfinished: false, [v]
    let result = []
    state.lists.forEach((val) => {
        let spvInfo = rootGetters["Supervisors/spvId"](val.name);
        val.spv = spvInfo.name;
        val.warehouseName = spvInfo.warehouseName;
        val.headName = rootGetters["Headspv/headId"](val.head).name;
        // baseReportInfo
        let baseReportFile = rootGetters["BaseReportFile/getIdByPeriodeByWarehouse"](val.periode, spvInfo.warehouse)
        // baseReportFile
        if(baseReportFile) {
          val.baseReportFile = baseReportFile.id
          val.totalDo = rootGetters["BaseReportClock/detailsByShiftAndParent"](val.shift, val.baseReportFile).totalDo
          val.totalKendaraan = rootGetters["BaseReportClock/detailsByShiftAndParent"](val.shift, val.baseReportFile).totalKendaraan
          val.totalWaktu = rootGetters["BaseReportClock/detailsByShiftAndParent"](val.shift, val.baseReportFile).totalWaktu
          val.standartWaktu = rootGetters["BaseReportStock/standartWaktuByParentAndShift"](val.shift, val.baseReportFile)

          val.periode2 = rootGetters["dateFormat"]({
            format: "ymdexcel",
            time: val.periode,
          });

          val.collected2 = !isNaN(val.collected)
            ? rootGetters["dateFormat"]({
                format: "ymdexcel",
                time: val.collected,
              })
            : val.collected;

          val.approval2 = !isNaN(val.approval)
            ? rootGetters["dateFormat"]({
                format: "ymdexcel",
                time: val.approval,
              })
            : val.approval;

          val.shared2 = !isNaN(val.shared)
            ? rootGetters["dateFormat"]({ format: "ymdexcel", time: val.shared })
            : val.shared;

          val.finished2 = !isNaN(val.finished)
            ? rootGetters["dateFormat"]({ format: "ymdexcel", time: val.finished })
            : val.finished;

          delete val.status;

          result.push({
            id: val.id,
            periode: val.periode2,
            Gudang: val.warehouseName,
            shift: val.shift,
            spv: val.spv, 
            head: val.headName,
            collected: val.collected2,
            approval: val.approval2,
            shared: val.shared2,
            finished: val.finished2,
            basereportfile: val.baseReportFile,
            totaldo: val.totalDo,
            totalkendaraan: val.totalKendaraan,
            totalwaktu: val.totalWaktu,
            standartwaktu: val.standartWaktu,
            isfinished: val.isfinished,
          })
        }
      })
    return result
    }

  },
};

export default Uncollected;
