import { append, deleteDocument, findData, update, getData } from "@/myfunction";
import { totalTime } from "../piece/totalTimeAsMinute";
import { postData } from "../../utils/sendDataToServer"

export let lists = [];
let storeName = "BaseReportClock";

export const startImportClock = async (sheets, baseId) => {
  // dapatkan ref
  let infoRowColClock = sheets["!ref"].split(":");
  // dapatkan length data clock
  let lengthRowClock = +infoRowColClock[1].match(/\d+/)[0];

  for (let i = 1; i <= lengthRowClock; i++) {
    /* 
            #CLOCK jika B5.v > 0 dan D5.v !== D4.v
            maka masukkan ke idb 
        */
    //    CLOCK CHECKER
    // nomor do
    let clockNo = sheets["D" + i] ? sheets["D" + i].v : 0;
    // nomor do sebelumnya (atasnya)
    let clockNoBefore = sheets["D" + (i - 1)] ? sheets["D" + (i - 1)].v : false;
    // shift
    let shift = sheets["B" + i]?.v > 0
    // status untuk diimport true or false
    let clockStatus = shift && clockNo > 0 && (clockNoBefore !== clockNo)

    if (i > 5 && clockStatus) {
      await appendData(
        baseId,
        sheets["B" + i] ? sheets["B" + i].v : 3,
        sheets["D" + i] ? sheets["D" + i].v : 0,
        sheets["F" + i] ? sheets["F" + i].w : 0,
        sheets["G" + i] ? sheets["G" + i].w : 0,
        sheets["H" + i] ? sheets["H" + i].w : 0,
        0
      );
    }
  }
  return true;
};

export const appendData = async (
  parent,
  shift,
  noDo,
  reg,
  start,
  finish,
  rehat
) => {
  1;
  await append({
    store: "BaseReportClock",
    obj: {
      parent,
      shift: shift < 3 ? shift : 3,
      noDo,
      reg,
      start,
      finish,
      rehat,
    },
  }).then((val) => {
    if (lists) {
      lists.push(val?.data);
    }
  });
};

export const removeClockByParent = async (parent) => {
  lists = lists.filter((rec) => rec.parent !== parent);
  await deleteDocument({ store: "basereportclock", criteria: { parent } });
  return;
};

export const getBaseClockByParentByShift = async (parent, shift) => {
  let findRecFirst = lists.find(
    (rec) => rec.parent == parent && rec.shift == shift
  );
  if (!findRecFirst) {
    await findData({
      store: "BaseReportClock",
      criteria: { parent, shift },
    }).then((res) => (lists = lists.concat(res)));
  }
  return;
};

export const baseReportClockLists = (parent, shift) => {
  let result = [];
  lists.forEach((rec) => {
    if (rec.parent == parent && rec.shift == shift) {
      result.push({
        ...rec,
        totalTime: totalTime(rec?.start, rec?.finish) - rec.rehat * 60,
      });
    }
  });
  return result;
};

export const updateBaseClock = async (id, objtToUpdate) => {
  lists = lists.map((val) => {
    if (val.id == id) {
      return { ...val, ...objtToUpdate };
    }
    return val;
  });
  await update({
    store: "BaseReportClock",
    criteria: { id: id },
    obj: objtToUpdate,
  });
  return true;
};

export const clockDetails = (parent, shift) => {
  let totalDo = 0;
  let totalKendaraan = 0;
  let totalWaktu = 0;
  lists.forEach((val) => {
    if (
      val.shift == shift &&
      val.parent == parent &&
      val?.start &&
      val?.finish &&
      val.start.length == 5 &&
      val.finish.length == 5
    ) {
      totalDo += 1;
      totalKendaraan += 1;
      // jaddikan menit, masukan total waktu - rehat
      totalWaktu += totalTime(val?.start, val?.finish) - val.rehat * 60;
    }
  });
  return {
    totalDo: totalDo,
    totalKendaraan: totalKendaraan,
    totalWaktu: totalWaktu,
  };
};

export async function markClockFinished(
  parentBaseReportFile,
  shift,
  parentDocument
) {
  // iterate the state
  for (let list of lists) {
    // if state?.shift == payload.shift && payload?.parent
    if (list?.shift == shift && list?.parent == parentBaseReportFile) {
      // jika parentDocument kosong
      if (!lists?.parentDocument) {
        // update recordnya
        await updateBaseClock(list.id, { parentDocument });
      }
      // jika sudah terisi
    }
  }
  return;
}

export const removeClock = async (id) => {
  lists = lists.filter((rec) => rec.id !== id);
  deleteDocument({ store: "basereportclock", criteria: { id } });
  return true;
};


import { progressMessage2 } from "../../components/parts/Loader/state";
export async function syncClockToServer () {

  let allData = await getData({ store: storeName, withKey: true })

  for(let [index, datum] of allData.entries()) {

    let dataToSend = {
      "id": datum?.key,
      "parent": datum?.data?.parent,
      "shift": datum?.data?.shift || 1,
      "no_do": datum?.data?.noDo || 1,
      "reg": datum?.data?.reg || "00:00",
      "start": datum?.data?.start || "00:00",
      "finish": datum?.data?.finish || "00:00",
      "rehat": datum?.data?.rehat || 0
    }

    try {
      progressMessage2.value = `Mengirim data ${index} dari ${allData.length}`
      await postData('base_clock', dataToSend);

    } catch(err) {

        // alert(err); 
        console.log(err)
        // return false;

    }
  }
  return true
}