const Uncollected = {
  namespaced: true,
  state: {
    lists: [],
    allData: false,
    uncollected: false,
    collected: false,
    approve: false,
  },

  mutations: {
    // new data from localbase
    document(state, value) {
      state.lists = value;
      state.allData = true
      state.uncollected = false
      state.collected = false
      state.approve = false
    },
    status(state, payload) {
      // value = uncollected
      state[payload] = true
      state.allData = false
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
    async append({dispatch}, payload) {
      // payload = {periode: "", warehouse: ""}
      await dispatch("append", {
        store: "Document",
        
        obj: Object.assign({ 
          collected: "false",
          approval: "false",
          status: 0,
          shared: "false", 
          finished: "false", 
          totaldo: "false", 
          totalkendaraan: "false", 
          totalwaktu: "false", 
          standartwaktu: "false", 
          basereportfile: "false", 
          isfinished: "false",
        }, payload)

      }, { root: true })
      // return a true value, so the promise would be resolved
      return "finished"
    },
    async getAllDocumentNotFinished({state, commit, dispatch}) {
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
      return "finished"
    },
    handleDocument({state, commit, dispatch, rootGetters}, payload) {
      // payload =  {action: 'approve', val: -1, rec: doc22050003}
      // payload =  {action: 'finished', val: { etc: etc from BaseFinishForm }, rec: doc22050003}
      // get record from uncollected the state
      let info = rootGetters["Document/getId"](payload.rec)
      // approve document
      if(payload.action === "approve") {
          info.approval = rootGetters["dateFormat"]({format: payload.val})
          info.status = 2
      }
      // uncollect documment
      else if(payload.action === "uncollect") {
          info.collected = "false"
          info.status = 0
      }
      // collect document
      else if(payload.action === "collect") {
          info.collected = rootGetters["dateFormat"]({format: payload.val})
          info.status = 1
      }
      // ijin
      else if(payload.action === "ijin") {
          info.collected = "Tidak masuk"
          info.approval = "Tidak masuk"
          info.shared = "Tidak masuk"
          info.status = 2
      }

      else if(payload.action === "share") {
        info.shared = rootGetters["dateFormat"]({format: "time"})
      }

      else if(payload.action === "unapprove") {
        info.approval = "false"
        info.status = 1
      }
      else if(payload.action === "finished") {
        delete info.isfinished
        delete info.finished
        delete info.baseReportFile
        delete info.totalDO
        delete info.totalKendaraan
        delete info.totalWaktu
        delete info.standartWaktu
        info = Object.assign(info, payload.val)
      }
          dispatch("updateOnly", { 
            store: "Document", 
            criteria: { id: payload.rec }, 
            obj: info
          }, { root: true })
          // update state
          commit("update", info)
    },
    async getDocumentByStatusFromDB({ state, commit, dispatch }, status) {
      // status = uncollected
      // jika sebelumnya belum diambil, atau sudah direplace ( state[statue] === false)
      if(state.allData) {
        commit("document", [])

      }
      if(!state[status]) { 
        let recordStatus;
        // uncollected
        if(status === "uncollected") {
          recordStatus = { status: 0 }
        }
        // collected
        else if(status === "collected") {
          recordStatus = { status: 1 }
        }
        // approval
        else if(status === "approval") {
          recordStatus = { status: 2, shared: false }
        }

        commit("status", status)
        await dispatch("getDataByCriteriaAppend", { store: "Document", criteria: recordStatus }, { root: true })
      }
      return "Finished"
    }
  },
  getters: {
    documentByPeriodeAndWarehouseAndShift: (state, getters, rootState, rootGetters) => (periode, warehouse, shift) => {
      //  (disini dapat nama karu, nomor telfon, nama gudang)
      let result = ""
      JSON.parse(JSON.stringify(state.lists)).forEach((val) => {
        if(val?.periode == periode && val?.warehouse == warehouse && val?.shift == shift) {
          result = rootGetters["Supervisors/spvId"](val?.name)
        }
      })
      return result
    },
    documentByStatus: (state, getters, rootState, rootGetters) => (status) => {
      return state.lists.length > 0
        ? JSON.parse(JSON.stringify(state)).lists.filter((val) => {
            if(val?.status == status) {
              let spvInfo = rootGetters["Supervisors/spvId"](val.name)
              val.spvName = spvInfo.name
              val.warehouseName = rootGetters["Warehouses/warehouseId"](val?.warehouse)?.name
              val.headName = rootGetters["Headspv/headId"](val.head).name
              val.periode2 = rootGetters["dateFormat"]({ format: "dateMonth", time: val.periode })
              val.collected2 = !isNaN(val.collected) ? rootGetters["dateFormat"]({ format: "dateMonth", time: val.collected }) : val.collected
              val.approval2 = !isNaN(val.approval) ? rootGetters["dateFormat"]({ format: "dateMonth", time: val.approval }) : val.approval
              return val
            }
        })
        : [];
    },
    periodeDocumentByStatusBySpv: (state, getters, rootState, rootGetters) => (status, spv) => {
      if(state.lists.length) {
        let result = []
        JSON.parse(JSON.stringify(state.lists)).forEach((val) => {
          if(val?.status == status && val?.name == spv) {
            
            val.periode2 = rootGetters["dateFormat"]({
              format: "dateMonth",
              time: val.periode,
            })

            result.push({ 
              id: val.id, 
              periode: val.periode, 
              periode2: val.periode2 ,
              warehouseName: rootGetters["Warehouses/warehouseId"](val?.warehouse)?.name
            })
          }
        })
        return result
      }
    },
    // all uncollected record
    documentBySpv: (state, getters, rootState, rootGetters) => (status) => {
      if (state.lists.length) {

        return rootGetters["Supervisors/enabled"].map((val) => {
            return Object.assign(val, { 
              documents: getters["periodeDocumentByStatusBySpv"](status, val?.id),
              warehouseName: rootGetters["Warehouses/warehouseNameBySpv"](val?.id)
            })
        })
        
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
      return JSON.parse(JSON.stringify(state.lists))
              .find((val) => val.id === id);;
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
