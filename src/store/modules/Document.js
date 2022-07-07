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
      state.allData = true;
    },
    // add data to
    append(state, value) {
      state.allData = false;
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
    allData(state, value) {
      state.allData = value;
    },
  },
  actions: {
    async append({ dispatch }, payload) {
      // payload = {periode: "", warehouse: ""}
      await dispatch(
        "append",
        {
          store: "Document",

          obj: Object.assign(
            {
              collected: false,
              approval: false,
              status: 0,
              shared: false,
              finished: false,
              totalDo: false,
              totalKendaraan: false,
              totalWaktu: false,
              // standartWaktu: false,
              baseReportFile: false,
              isfinished: false,
            },
            payload
          ),
        },
        { root: true }
      );
      // return a true value, so the promise would be resolved
      return "finished";
    },
    async getBaseReportStarter({ state, commit, dispatch }) {
      if (state.allData) {
        return;
      }
      commit("Modal/active", { judul: "", form: "Loader" }, { root: true });
      // cari document dengan criteria { isFinished: false }
      // get all item
      await dispatch("Baseitem/getAllItem", false, { root: true });
      // cari problem yang belum solve
      await dispatch("Problem/getProblemFromDB", true, { root: true });
      commit("allData", true);
      // looping cari baseReportFile dengan criteria { periode: document.periode, imported: true }
      await dispatch("BaseReportFile/recordStarter", {}, { root: true });
      // looping cari baseReportStock dengan criteria { parent: baseReportFile.id }
      await dispatch("BaseReportStock/getDataByParent", {}, { root: true });
      // // looping cari baseReportClock dengan criteria { parent: baseReportFile.id }
      await dispatch("BaseReportClock/getDataByParent", {}, { root: true });

      //
      commit("Modal/active", false, { root: true });
      return "finished";
    },
    handleDocument({ state, commit, dispatch, rootGetters }, payload) {
      // payload =  {action: 'approve', val: -1, rec: doc22050003}
      // payload =  {action: 'finished', val: { etc: etc from BaseFinishForm }, rec: doc22050003}
      // get record from uncollected the state
      let info = rootGetters["Document/getId"](payload.rec);
      // approve document
      if (payload.action === "approve") {
        info.approval = rootGetters["dateFormat"]({ format: payload.val });
        info.status = 2;
      }
      // uncollect documment
      else if (payload.action === "uncollect") {
        info.collected = "false";
        info.status = 0;
      }
      // collect document
      else if (payload.action === "collect") {
        info.collected = rootGetters["dateFormat"]({ format: payload.val });
        info.status = 1;
      }
      // ijin
      else if (payload.action === "ijin") {
        info.collected = "Tidak masuk";
        info.approval = "Tidak masuk";
        info.shared = false;
        info.status = 2;
      }
      // laporan tidak ada
      else if (payload.action === "kosong") {
        info.collected = "Laporan tidak ada";
        info.approval = "Laporan tidak ada";
        info.shared = false;
        info.status = 2;
      } else if (payload.action === "share") {
        info.shared = rootGetters["dateFormat"]({ format: "time" });
      } else if (payload.action === "unapprove") {
        info.approval = "false";
        info.status = 1;
      } else if (payload.action === "finished") {
        info["isfinished"] = true;
        info["finished"] = new Date().getTime();
        delete info.periode2;
        delete info.spvName;
        delete info.warehouseName;
        delete info.shift;
        delete info.totalDO;
        delete info.totalKendaraan;
        delete info.totalWaktu;
        delete info.totalItemMoving;
        delete info.totalQTYIn;
        delete info.totalQTYOut;
        delete info.totalProductNotFIFO;
        delete info.itemVariance;

        info = Object.assign(info, payload.val);
      }
      // console.log(info);
      dispatch(
        "updateOnly",
        {
          store: "Document",
          criteria: { id: payload.rec },
          obj: info,
        },
        { root: true }
      );
      // update state
      commit("update", info);
    },
    async getDocumentByStatusFromDB({ state, commit, dispatch }) {
      // status = uncollected
      // jika sebelumnya belum diambil, atau sudah direplace ( state[statue] === false)
      if (state.allData || !state.lists.length) {
        commit("document", []);
        await dispatch(
          "getDataByCriteriaAppend",
          { store: "Document", criteria: { shared: "false" } },
          { root: true }
        );
        await dispatch(
          "getDataByCriteriaAppend",
          { store: "Document", criteria: { shared: false } },
          { root: true }
        );
      }
      return "Finished";
    },
  },
  getters: {
    allDocument(state, getters, rootState, rootGetters) {
      return state.lists.length
        ? [...state.lists].map((val) => {
            let spvInfo = rootGetters["Supervisors/spvId"](val.name);
            val.spvName = spvInfo.name;
            val.warehouseName = rootGetters["Warehouses/warehouseId"](
              val?.warehouse
            )?.name;
            val.headName = rootGetters["Headspv/headId"](val.head).name;
            val.periode2 = rootGetters["dateFormat"]({
              format: "dateMonth",
              time: val.periode,
            });
            val.collected2 = val.collected
              ? rootGetters["dateFormat"]({
                  format: "dateMonth",
                  time: val.collected,
                })
              : val.collected;
            val.approval2 = val.approval
              ? rootGetters["dateFormat"]({
                  format: "dateMonth",
                  time: val.approval,
                })
              : val.approval;
            return val;
          })
        : [];
    },
    documentNotApproval(state, getters, rootState, rootGetters) {
      // expected result =  { headId: { headName: nameHead, lists:["Tanggal nama gudang shift nama karu"], ..... } }
      // 21-Jun Gudang depan shift 2 karu eka resdian
      let result = {};
      if (state.lists.length) {
        let beforeToday = rootGetters["dateFormat"]({ format: "-2" });
        state.lists.forEach((val) => {
          if (val?.status == 1 && val.collected < beforeToday) {
            let tanggal = rootGetters["dateFormat"]({
              format: "dateMonth",
              time: val?.periode,
            });
            let namaKaru = rootGetters["Supervisors/spvId"](val?.name)?.name;
            let text = `${tanggal} Shift ${val?.shift} Karu ${namaKaru}`;
            // jika sudah exists diresult
            result[val?.head]
              ? result[val?.head].lists.push(text)
              : (result[val?.head] = {
                  headName: rootGetters["Headspv/headId"](val.head)["name"],
                  lists: [text],
                });
            // jika belum exists diresult
            // val.headName = this.$store.getters["Headspv/headId"](val.head)["name"]
          }
        });
      }
      return result;
    },
    finished(state, getters, rootState, rootGetters) {
      return JSON.parse(JSON.stringify(state.lists)).filter((val) => {
        if (val?.isfinished !== "false" && val?.baseReportFile !== "false") {
          let spvInfo = rootGetters["Supervisors/spvId"](val.name);
          val.spvName = spvInfo.name;
          val.headName = rootGetters["Headspv/headId"](val.head).name;
          val.warehouseName = rootGetters["Warehouses/warehouseId"](
            val?.warehouse
          )?.name;
          val.periode2 = rootGetters["dateFormat"]({
            format: "dateMonth",
            time: val.periode,
          });
          val.finished2 = rootGetters["dateFormat"]({
            format: "dateMonth",
            time: val.finished,
          });
          // val.approval2 = this.$store.getters["dateFormat"]({ format: "dateMonth", time: val.approval })
          // val.headName = this.$store.getters["Headspv/headId"](val.head)["name"]
          return val;
        }
      });
    },
    documentByPeriodeAndWarehouseAndShift:
      (state) => (periode, warehouse, shift) => {
        //  (disini dapat nama karu, nomor telfon, nama gudang)
        return JSON.parse(JSON.stringify(state.lists)).find(
          (val) =>
            val?.periode == periode &&
            val?.warehouse == warehouse &&
            val?.shift == shift
        );
      },
    spvByPeriodeAndWarehouseAndShift:
      (state, getters, rootState, rootGetters) =>
      (periode, warehouse, shift) => {
        //  (disini dapat nama karu, nomor telfon, nama gudang)
        let result = "";
        JSON.parse(JSON.stringify(state.lists)).forEach((val) => {
          if (
            val?.periode == periode &&
            val?.warehouse == warehouse &&
            val?.shift == shift
          ) {
            result = rootGetters["Supervisors/spvId"](val?.name);
          }
        });
        return result;
      },
    documentByStatus: (state, getters, rootState, rootGetters) => (status) => {
      return state.lists.length > 0
        ? JSON.parse(JSON.stringify(state)).lists.filter((val) => {
            if (val?.status == status) {
              let spvInfo = rootGetters["Supervisors/spvId"](val.name);
              val.spvName = spvInfo.name;
              val.warehouseName = rootGetters["Warehouses/warehouseId"](
                val?.warehouse
              )?.name;
              val.headName = rootGetters["Headspv/headId"](val.head).name;
              val.periode2 = rootGetters["dateFormat"]({
                format: "dateMonth",
                time: val.periode,
              });
              val.collected2 = !isNaN(val.collected)
                ? rootGetters["dateFormat"]({
                    format: "dateMonth",
                    time: val.collected,
                  })
                : val.collected;
              val.approval2 = !isNaN(val.approval)
                ? rootGetters["dateFormat"]({
                    format: "dateMonth",
                    time: val.approval,
                  })
                : val.approval;
              return val;
            }
          })
        : [];
    },
    periodeDocumentByStatusBySpv:
      (state, getters, rootState, rootGetters) => (status, spv) => {
        if (state.lists.length) {
          let result = [];
          JSON.parse(JSON.stringify(state.lists)).forEach((val) => {
            if (val?.status == status && val?.name == spv) {
              val.periode2 = rootGetters["dateFormat"]({
                format: "dateMonth",
                time: val.periode,
              });

              result.push({
                id: val.id,
                periode: val.periode,
                periode2: val.periode2,
                warehouseName: rootGetters["Warehouses/warehouseId"](
                  val?.warehouse
                )?.name,
              });
            }
          });
          return result;
        }
      },
    // all uncollected record
    documentBySpv: (state, getters, rootState, rootGetters) => (status) => {
      if (state.lists.length) {
        return rootGetters["Supervisors/enabled"].map((val) => {
          return Object.assign(val, {
            documents: getters["periodeDocumentByStatusBySpv"](status, val?.id),
            warehouseName: rootGetters["Warehouses/warehouseNameBySpv"](
              val?.id
            ),
          });
        });
      }
    },
    // Document more then 2 days, by spv id
    documentMore2DaysBySpv:
      (state, getters, rootState, rootGetters) => (spvId) => {
        // expected result { warehouseName: [ listOfDocument ] }
        let result = {};
        state.lists.forEach((val) => {
          // if val?.name (spvId) === spvId
          if (
            val?.name === spvId &&
            new Date().getTime() - val.periode >= 172800000 &&
            val?.status == 0
          ) {
            result[val?.warehouse]
              ? result[val?.warehouse].push(
                  "*" +
                    rootGetters["dateFormat"]({
                      format: "dateMonth",
                      time: val?.periode,
                    }) +
                    "* Shift (" +
                    val?.shift +
                    ")"
                )
              : (result[val?.warehouse] = [
                  "*" +
                    rootGetters["dateFormat"]({
                      format: "dateMonth",
                      time: val?.periode,
                    }) +
                    "* Shift (" +
                    val?.shift +
                    ")",
                ]);
          }
        });
        return result;
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
      return JSON.parse(JSON.stringify(state.lists)).find(
        (val) => val.id === id
      );
    },
    exportData(state, getters, rootState, rootGetters) {
      return [...state.lists].map((val) => {
        let spvInfo = rootGetters["Supervisors/spvId"](val.name);
        val.name = spvInfo.name;
        val.warehouseName = rootGetters["Warehouses/warehouseId"](
          val?.warehouse
        )?.name;
        (val.head = rootGetters["Headspv/headId"](val.head).name),
          (val.periode = rootGetters["dateFormat"]({
            format: "ymdexcel",
            time: val.periode,
          }));

        val.collected = !isNaN(val.collected + "")
          ? rootGetters["dateFormat"]({
              format: "ymdexcel",
              time: val.collected,
            })
          : val.collected;

        val.approval = !isNaN(val.approval + "")
          ? rootGetters["dateFormat"]({
              format: "ymdexcel",
              time: val.approval,
            })
          : val.approval;

        val.shared = !isNaN(val.shared + "")
          ? rootGetters["dateFormat"]({ format: "ymdexcel", time: val.shared })
          : val.shared;

        val.finished = !isNaN(val.finished + "")
          ? rootGetters["dateFormat"]({
              format: "ymdexcel",
              time: val.finished,
            })
          : val.finished;
        const {
          id,
          status,
          warehouse,
          totalDO,
          totalDo,
          totalKendaraan,
          totalWaktu,
          standartWaktu,
          baseReportFile,
          isFinished,
          parentDocument,
          itemVariance,
          totalItemMoving,
          totalQTYIn,
          totalQTYOut,
          totalProductNotFIFO,
          planOut,
          totalItemKeluar,
          isfinished,
          ...details
        } = val;

        return {
          Periode: details?.periode,
          Supervisor: details?.name,
          Bagian: details?.warehouseName,
          Kabag: details?.head,
          Shift: details?.shift,
          Dikumpulkan: details?.collected,
          Selesai: details?.finished,
          Diparaf: details?.approval,
          Share: details?.shared,
        };
      });
    },
    dateDocument(state, getters, rootState, rootGetters) {
      // get the uniquee date
      let uniquee = [
        ...new Set(
          JSON.parse(JSON.stringify(state.lists)).map((val) => val.periode)
        ),
      ];
      //return as object
      return uniquee.length > 0
        ? uniquee.map((val) => {
            return {
              periode: val,
              periode2: rootGetters["dateFormat"]({
                format: "dateMonth",
                time: val,
              }),
            };
          })
        : [];
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
      let result = [];
      state.lists.forEach((val) => {
        let spvInfo = rootGetters["Supervisors/spvId"](val.name);
        val.spv = spvInfo.name;
        val.warehouseName = spvInfo.warehouseName;
        val.headName = rootGetters["Headspv/headId"](val.head).name;
        // baseReportInfo
        let baseReportFile = rootGetters[
          "BaseReportFile/getIdByPeriodeByWarehouse"
        ](val.periode, spvInfo.warehouse);
        // baseReportFile
        if (baseReportFile) {
          val.baseReportFile = baseReportFile.id;
          val.totalDo = rootGetters["BaseReportClock/detailsByShiftAndParent"](
            val.shift,
            val.baseReportFile
          ).totalDo;
          val.totalKendaraan = rootGetters[
            "BaseReportClock/detailsByShiftAndParent"
          ](val.shift, val.baseReportFile).totalKendaraan;
          val.totalWaktu = rootGetters[
            "BaseReportClock/detailsByShiftAndParent"
          ](val.shift, val.baseReportFile).totalWaktu;
          // val.standartWaktu = rootGetters[
          //   "BaseReportStock/standartWaktuByParentAndShift"
          // ](val.shift, val.baseReportFile);

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
            ? rootGetters["dateFormat"]({
                format: "ymdexcel",
                time: val.shared,
              })
            : val.shared;

          val.finished2 = !isNaN(val.finished)
            ? rootGetters["dateFormat"]({
                format: "ymdexcel",
                time: val.finished,
              })
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
            // standartwaktu: val.standartWaktu,
            isfinished: val.isfinished,
          });
        }
      });
      return result;
    },
  },
};

export default Uncollected;
