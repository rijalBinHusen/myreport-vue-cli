import { findData, append, update, getData, getDataByKey } from "@/myfunction";
import { ddmmyyyy, dateMonth } from "../piece/dateFormat";
import { getSupervisorId } from "./Supervisors";
import { getWarehouseId } from "./Warehouses";
import getDaysArray from "../piece/getDaysArray";
import { getItemByKode } from './Baseitem'
import { postData, deleteData, putData } from "../../utils/sendDataToServer"

let lists = [];
const storeName = "problem";
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
      getItemByKode(list.item).then((res) => res ? res.name : 'Not found'),
    ];

    await Promise.all(getInfo).then((val) => {
      result.push({
        warehouse: list.warehouse,
        id: list.id,
        namaGudang: val[0],
        namaItem: val[2],
        masalah: list.masalah,
        periode: ddmmyyyy(list.periode, '-'),
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

export const updateProblem = async (id, obj) => {
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

import { progressMessage2 } from "../../components/parts/Loader/state"
export async function syncProblemToServer () {

  let allData = await getData({ store: storeName, withKey: true })
  //dl dlPanjang, id, isFinished, item, masalah, nameHeadSpv, 
  // nameSpv, periode, pic, picPanjang, shiftMulai, shiftSelesai, 
  // solusi, solusiPanjang, sumberMasalah, tanggalSelesai, warehouse  

  for(let [index, datum] of allData.entries()) {

    let dataToSend = {
        "id": datum?.key,
        "warehouse_id": datum?.data?.warehouse || 0,
        "supervisor_id": datum?.data?.nameSpv || 0,
        "head_spv_id": datum?.data?.nameHeadSpv || 0,
        "item_kode": datum?.data?.item || 0,
        "tanggal_mulai": datum?.data?.periode || 0,
        "shift_mulai": datum?.data?.shiftMulai || 0,
        "pic": datum?.data?.pic || 0,
        "dl": datum?.data?.dl || 0,
        "masalah": datum?.data?.masalah || 0,
        "sumber_masalah": datum?.data?.sumberMasalah || 0,
        "solusi": datum?.data?.solusi || 0,
        "solusi_panjang": datum?.data?.solusiPanjang || 0,
        "dl_panjang": datum?.data?.dlPanjang || 0,
        "pic_panjang": datum?.data?.picPanjang || 0,
        "tanggal_selesai": datum?.data?.tanggalSelesai || 0,
        "shift_selesai": datum?.data?.shiftSelesai || 0,
        "is_finished": datum?.data?.isFinished || 0
      }

    try {
      progressMessage2.value = `Mengirim data ${index} dari ${allData.length}`
      await postData('problem', dataToSend);

    } catch(err) {
              
      // alert(err); 
        console.log(err)
      // return false;

    }
  }
  return true
}


export async function syncProblemRecordToServer (idRecord, mode) {

  if(typeof idRecord !== 'string') {
    alert('Id record problem must be a string');
    return;
  }

  let record = await getDataByKey(storeName, idRecord);

  if(!record) {
      // dont do anything if record doesn't exist;
      return
  }
  //dl dlPanjang, id, isFinished, item, masalah, nameHeadSpv, 
  // nameSpv, periode, pic, picPanjang, shiftMulai, shiftSelesai, 
  // solusi, solusiPanjang, sumberMasalah, tanggalSelesai, warehouse 

  let dataToSend = {
      "id": idRecord,
      "warehouse_id": record?.warehouse || 0,
      "supervisor_id": record?.nameSpv || 0,
      "head_spv_id": record?.nameHeadSpv || 0,
      "item_kode": record?.item || 0,
      "tanggal_mulai": record?.periode || 0,
      "shift_mulai": record?.shiftMulai || 0,
      "pic": record?.pic || 0,
      "dl": record?.dl || 0,
      "masalah": record?.masalah || 0,
      "sumber_masalah": record?.sumberMasalah || 0,
      "solusi": record?.solusi || 0,
      "solusi_panjang": record?.solusiPanjang || 0,
      "dl_panjang": record?.dlPanjang || 0,
      "pic_panjang": record?.picPanjang || 0,
      "tanggal_selesai": record?.tanggalSelesai || 0,
      "shift_selesai": record?.shiftSelesai || 0,
      "is_finished": record?.isFinished || 0
    }

  try {

    if(mode === 'create') {

      await postData('problem', dataToSend);

    } 
  
    else if(mode === 'update') {

        await putData('problem/'+ idRecord, dataToSend)

    }

    else if (mode === 'delete') {

        await deleteData('problem/'+ idRecord)
        
    }

  } catch(err) {

    const errorMessage = 'Failed to sync problem record id :' + idRecord +' with error message: ' + err;
    alert(errorMessage); 
    console.log(errorMessage);
    return false;

  }

  return true
}