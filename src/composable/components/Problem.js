import { findData } from "@/myfunction";
import { dateMonth } from "../piece/dateFormat";
import { getSupervisorId } from "./Supervisors";
import { getWarehouseId } from "./Warehouses";
import store from "@/store";

let lists = [];

export const getProblemFromDB = async () => {
  await findData({ store: "Problem", criteria: { isFinished: false } }).then(
    (val) => {
      if (val) {
        lists = val;
      }
    }
  );
};

export const listsProblem = async () => {
  if (!lists.length) {
    await getProblemFromDB();
  }
  let result = [];

  for (let list of lists) {
    let getInfo = [
      getWarehouseId(list.warehouse).then((res) => res.name),
      getSupervisorId(list.nameSpv).then((res) => res.name),
      store.getters["Baseitem/baseItemKode"](list.item).name,
    ];

    await Promise.all(getInfo).then((val) => {
      result.push({
        id: list.id,
        namaGudang: val[0],
        namaItem: val[2],
        masalah: list.masalah,
        periode: dateMonth(list.periode),
        supervisor: val[1],
        status: list?.isFinished ? "Closed" : "Progress",
      });
    });
  }
  return result;
};

export const problemId = (id) => {
  return lists.find((val) => val.id == id);
};

export const masalah = (arrayOfProblemId) => {
  let result = [];
  if (arrayOfProblemId.length > 0) {
    lists.forEach((val) => {
      if (arrayOfProblemId.includes(val.id)) {
        result.push(val.masalah + " " + dateMonth(val.periode));
      }
    });
  }
  return result.join(", ");
};

export const problemActiveBySpvAndPeriode = (spv, periode) => {
  return lists.filter((val) => val?.nameSpv === spv && val?.periode == periode);
};

export const problemByItem = (warehouse, item) => {
  // this.$store.getters["Problem/problemActive"](new Date().getTime())
  /* expected result = [itemId, itemId] */
  return lists.filter((val) => val.warehouse == warehouse && val.item == item);
};

export const problemActive = (warehouse, item) => {
  // this.$store.getters["Problem/problemActive"](new Date().getTime())
  /* expected result = [itemId, itemId] */
  let result = [];
  lists.forEach((val) => {
    if (!val.isFinished && val.warehouse == warehouse && val.item == item) {
      result.push(val.id);
    }
  });
  return result;
};
