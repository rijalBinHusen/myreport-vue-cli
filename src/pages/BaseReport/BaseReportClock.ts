import { totalTime } from "../../composable/piece/totalTimeAsMinute";
import { postData, deleteData, putData } from "../../utils/sendDataToServer"
import { loaderMessage, progressMessage2 } from "../../components/parts/Loader/state";
import { useIdb } from "../../utils/localforage"
import { type Sheet } from "../../utils/xlsx.type"

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

interface BaseClockMapped extends BaseClock {
  totalTime: number
}

interface BaseClockForUpdate {
  parent?: string;
  shift?: number;
  noDo?: number;
  reg?: string;
  start?: string;
  finish?: string;
  rehat?: number
}

interface unknownObject {
  [key: string|number]: string
}

export let lists = <BaseClockMapped[]>[];
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

      const interpretIt = interpretRecord({ id : insertedId, ...objToInsert })

      lists.unshift(interpretIt)

    } else {
      
      alert("Gagal memasukkan report clock");

    }
    
  };

  const interpretRecord = (record: BaseClock): BaseClockMapped => {
    const countTime = totalTime(record.start, record.finish) - record.rehat * 60;
    return {
      ...record,
      totalTime: countTime
    }
  }
  
  const startImportClock = async (sheets: Sheet, parentId: string) => {
    // dapatkan ref
    if(sheets["!ref"] == undefined) return;
    let infoRowColClock = sheets["!ref"].split(":");
    
    const isRowClockNotOke = infoRowColClock[1] == null || infoRowColClock[0] == null;
    if(isRowClockNotOke) return;

    let lengthRow = infoRowColClock[1].match(/\d+/);
    if(!lengthRow || lengthRow.length == 0 || lengthRow[0] == null ) return;

    // dapatkan length data clock
    let lengthRowClock = +lengthRow[0];
    
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

  const removeClockByParent = async (parent: string) => {

    for(let [index, record] of lists.entries()) {
      loaderMessage.value = `Memindai dan mengahapus ${index} dari ${lists.length} record`;
      if(record.parent === parent) {

        await db.removeItem(record.id)
        
      }
    }

  };

  const getBaseClockByParentByShift = async (parent: string, shift: number): Promise<BaseClockMapped[]> => {

    let filterRec = lists.filter((rec) => rec.parent == parent && rec.shift == shift);

    if (filterRec.length === 0) {
      const records = await db.getItemsByTwoKeyValue<BaseClock>('parent', parent, 'shift', shift);

      if(records.length == 0) {
        await appendData(parent, shift, 100, '12:00', '12:00', '01:00', 0);
        // getBaseClockByParentByShift(parent, shift);
        return [lists[lists.length - 1]];
      };

      for(let record of records) {
        const interpretIt = interpretRecord(record);
        filterRec.push(interpretIt);
        lists.push(interpretIt);
      }

    }

    return filterRec
  };

  const updateBaseClock = async (id: string, objtToUpdate: BaseClockForUpdate) => {
    lists = lists.map((val) => {
      if (val.id == id) {
        return { ...val, ...objtToUpdate };
      }
      return val;
    });

    await db.updateItem(id, objtToUpdate);
    
    return true;
  };   

  const clockDetails = (parent: string, shift: number) => {
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
  
  async function markClockFinished(parentBaseReportFile: string, shift: number, parentDocument: string) {
    let markFinished = 0;
    // iterate the state
    for (let [index, list] of lists.entries()) {
      loaderMessage.value = `Memindai jam muat, ${ index + 1 } dari ${lists.length}.`;
      // if state?.shift == payload.shift && payload?.parent
      if (list?.shift == shift && list?.parent == parentBaseReportFile) {
        // jika parentDocument kosong
        if (!list?.parent) {
          progressMessage2.value = `Total ${markFinished} record sudah ditandai.`
          // update recordnya
          await updateBaseClock(list.id, { parent: parentDocument });
          markFinished++
        }
        // jika sudah terisi
      }
    }
    loaderMessage.value = '';
    progressMessage2.value = '';
    return;
  }
  
  const removeClock = async (id: string) => {
    lists = lists.filter((rec) => rec.id !== id);
    await db.removeItem(id);
    return true;
  };
  
  return {
    appendData, startImportClock, removeClockByParent, getBaseClockByParentByShift, updateBaseClock, clockDetails, markClockFinished, removeClock
  }
  
}

export async function syncClockToServer () {
  let db = useIdb(storeName);

  let allData = await db.getItems<BaseClock>();

  for(let [index, datum] of allData.entries()) {

    let dataToSend = {
      "id": datum?.id,
      "parent": datum?.parent,
      "shift": datum?.shift || 1,
      "no_do": datum?.noDo || 1,
      "reg": datum?.reg || "00:00",
      "start": datum?.start || "00:00",
      "finish": datum?.finish || "00:00",
      "rehat": datum?.rehat || 0
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


export async function syncClockRecordToServer (idRecord: string, mode: string) {

  let db = useIdb(storeName);

  if(typeof idRecord !== 'string') {
    alert("Id record base report clock must be a string");
    return;
  }

  let record = await db.getItem<BaseClock>(idRecord);

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
        // alert(errorMessage); 
        console.log(errorMessage);
        return false;

    }
  return true
}