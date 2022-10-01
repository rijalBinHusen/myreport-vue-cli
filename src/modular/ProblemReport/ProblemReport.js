import { getSupervisorId } from "@/composable/components/Supervisors";
import { getWarehouseId } from "@/composable/components/Warehouses";
import { dateMonth } from "@/composable/piece/dateFormat";

const Problem = {
  namespaced: true,
  state: {
    lists: [],
  },

  mutations: {
    // new data from localbase
    problem(state, value) {
      // sort from newest to oldest
      state.lists = value.sort((a, b) => a.id < b.id ? 1 : -1);
    },
    // add data to
    append(state, value) {
      if (Array.isArray(value)) {
        value.forEach((val) => state.lists.push(val));
        return;
      }
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
        ? state.lists.map(async(val) => ({
            id: val.id,
            namaGudang: await getWarehouseId(val.warehouse).then((res) => res.name),
            namaItem: rootGetters["Baseitem/baseItemKode"](val.item).name,
            masalah: val.masalah,
            periode: dateMonth(val.periode),
            supervisor: await getSupervisorId(val.nameSpv).then(res => res?.name),
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
    masalah: (state, getters, rootState, rootGetters) => (arrayOfProblemId) => {
      let result = [];
      if (arrayOfProblemId.length > 0) {
        state.lists.forEach((val) => {
          if (arrayOfProblemId.includes(val.id)) {
            result.push(`${val.masalah} ${rootGetters['dateFormat']({format: 'dateMonth', time: val.periode})}`);
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
