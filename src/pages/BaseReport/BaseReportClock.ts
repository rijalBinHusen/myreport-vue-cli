import { totalTime } from "../../composable/piece/totalTimeAsMinute";
import { postData, deleteData, putData } from "../../utils/sendDataToServer"
import { loaderMessage, progressMessage2 } from "../../components/parts/Loader/state";
import { useIdb } from "../../utils/localforage"
import { type resultExcelRead } from "../../utils/readExcel"

interface BaseClock {
  id: string;
  parent: string;
  shift: number;
  noDo: number;
  reg: string;
  start: string;
  finish: string;
  rehat: number
}

interface unknownObject {
  [key: string|number]: string
}

export let lists = <BaseClock[]>[];
let storeName = "basereportclock";

export function baseClock() {
  const db = useIdb(storeName);

  const appendData = async ( parent: string, shift: number, noDo: number, reg: string, start: string, finish: string, rehat: number) => {

    const objToInsert = {
      parent,
      shift: shift < 3 ? shift : 3,
      noDo,
      reg,
      start,
      finish,
      rehat,
    }

    const insertedId = await db.createItem(objToInsert);

    if(typeof insertedId !== 'undefined') {

      lists.push({ id : insertedId, ...objToInsert })

    } else {
      
      alert("Gagal memasukkan report clock");

    }
    
  };
  

  const startImportClock = async (sheets: unknownObject, parentId: string) => {
    // dapatkan ref
    let infoRowColClock = sheets["!ref"].split(":");
    const isRowClockNotOke = infoRowColClock === null || infoRowColClock.length === 0;
    if(isRowClockNotOke) return;
    // dapatkan length data clock
    let lengthRowClock = +infoRowColClock[1].match(/\d+/)[0] || 10;
  
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
          parentId,
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

  const removeClockByParent = async (parent) => {
    lists = lists.filter((rec) => {
      if(rec.parent !== parent) {
        
        return rec

      } else {

        db.removeItem(rec.id)

      }
    });
  };

  const getBaseClockByParentByShift = async (parent, shift) => {
    let findRecFirst = lists.findIndex(
      (rec) => rec.parent == parent && rec.shift == shift
    );

    if (findRecFirst < 0) {
      const getData = await db.getItemByTwoKeyValue('parent', parent, 'shift', shift);

      lists = lists.concat(getData);
    }
  };

  

}

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
  let markFinished = 0;
  // iterate the state
  for (let [index, list] of lists.entries()) {
    loaderMessage.value = `Memindai ${ index + 1 } dari ${lists.length}.`;
    // if state?.shift == payload.shift && payload?.parent
    if (list?.shift == shift && list?.parent == parentBaseReportFile) {
      // jika parentDocument kosong
      if (!lists?.parentDocument) {
        progressMessage2.value = `Total ${markFinished} record sudah ditandai.`
        // update recordnya
        await updateBaseClock(list.id, { parentDocument });
        markFinished++
      }
      // jika sudah terisi
    }
  }
  loaderMessage.value = '';
  progressMessage2.value = '';
  return;
}

export const removeClock = async (id) => {
  lists = lists.filter((rec) => rec.id !== id);
  deleteDocument({ store: "basereportclock", criteria: { id } });
  return true;
};

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


export async function syncClockRecordToServer (idRecord, mode) {

  if(typeof idRecord !== 'string') {
    alert("Id record base report clock must be a string");
    return;
  }

  let record = await getDataByKey(storeName, idRecord);

  if(!record) {
      // dont do anything if record doesn't exist;
      return
  }

    let dataToSend = {
      "id": idRecord,
      "parent": record?.parent,
      "shift": record?.shift || 1,
      "no_do": record?.noDo || 1,
      "reg": record?.reg || "00:00",
      "start": record?.start || "00:00",
      "finish": record?.finish || "00:00",
      "rehat": record?.rehat || 0
    }

    try {

      if(mode === 'create') {
  
        await postData('base_clock', dataToSend);
  
      } 
    
      else if(mode === 'update') {
  
          await putData('base_clock/'+ idRecord, dataToSend)
  
      }

      else if (mode === 'delete') {

          await deleteData('base_clock/'+ idRecord)
          
      }

    } catch(err) {

      const errorMessage = 'Failed to send base report clock record id :' + idRecord +' to server with error message: ' + err;
        alert(errorMessage); 
        console.log(errorMessage);
        return false;

    }
  return true
}