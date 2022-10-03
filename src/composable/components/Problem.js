import { findData, append, update } from "@/myfunction";
import { dateMonth } from "../piece/dateFormat";
import { getSupervisorId } from "./Supervisors";
import { getWarehouseId } from "./Warehouses";
import store from "@/store";
import getDaysArray from "../piece/getDaysArray";

let lists = [];
let isProblemFinishedFalse = false;

export const getProblemBetweenPeriode = async (periode1, periode2) => {
  isProblemFinishedFalse = false;
  lists = [];
  let datesArray = getDaysArray(periode1, periode2);
  for (let date of datesArray) {
    let records = await findData({
      store: "problem",
      criteria: { periode: date },
    });
    if (records) {
      lists = lists.concat(records);
    }
  }
  return true;
};

export const getProblemFromDB = async () => {
  if (!isProblemFinishedFalse) {
    await findData({ store: "Problem", criteria: { isFinished: false } }).then(
      (val) => {
        if (val) {
          lists = val;
        }
      }
    );
    isProblemFinishedFalse = true;
  }
  return;
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
  return result.sort((a, b) => {
    let fa = a.id.toLowerCase(),
      fb = b.id.toLowerCase();

    if (fa > fb) {
      return -1;
    }
    if (fa < fb) {
      return 1;
    }
    return 0;
  });
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

export const problemId = (id) => {
  return lists.find((val) => val.id == id);
};

export const problemActiveBySpvAndPeriode = (spv, periode) => {
  return lists.filter((val) => val?.nameSpv === spv && val?.periode == periode);
};

export const problemByItem = (warehouse, item) => {
  // this.$store.getters["Problem/problemActive"](new Date().getTime())
  /* expected result = [itemId, itemId] */
  return lists.filter((val) => val.warehouse == warehouse && val.item == item);
};

export const addProblem = async (
  warehouse,
  nameSpv,
  nameHeadSpv,
  item,
  periode,
  shiftMulai,
  pic,
  dl,
  masalah,
  sumberMasalah,
  solusi,
  solusiPanjang,
  dlPanjang,
  picPanjang,
  tanggalSelesai
) => {
  let rec = {
    warehouse,
    nameSpv,
    nameHeadSpv,
    item,
    periode,
    shiftMulai,
    pic,
    dl,
    masalah,
    sumberMasalah,
    solusi,
    solusiPanjang,
    dlPanjang,
    picPanjang,
    tanggalSelesai,
    isFinished: false,
  };
  await append({
    store: "Problem",
    obj: rec,
  }).then((res) => {
    lists.unshift(res.data);
  });
  return;
};

export const updateBaseReport = async (id, obj) => {
  lists = lists.map((val) => {
    if (val.id == id) {
      return { ...val, ...obj };
    }
    return val;
  });
  await update({ store: "problem", criteria: { id: id }, obj: obj });
  return true;
};

export const duplicate = async (idRecord) => {
  let rec = lists.find((rec) => rec.id == idRecord);
  await addProblem(
    rec?.warehouse,
    rec?.nameSpv,
    rec?.nameHeadSpv,
    rec?.item,
    new Date().getTime(),
    rec?.shiftMulai,
    rec?.pic,
    rec?.dl,
    rec?.masalah,
    rec?.sumberMasalah,
    rec?.solusi,
    rec?.solusiPanjang,
    rec?.dlPanjang,
    rec?.picPanjang,
    rec?.tanggalSelesai
  );
  return;
};
