import { append, deleteDocument, findData, update, getData, getDataByKey } from "@/myfunction";
import { BaseReportFile } from "@/pages/BaseReport/BaseReportFile";
import { masalah, masalah, problemActive } from "../Problems/Problem";
import { baseItem } from '@/pages/BaseItem/Baseitem'
import { postData, putData, deleteData } from "../../utils/sendDataToServer";
import { progressMessage2, loaderMessage } from "../../components/parts/Loader/state";
import { useIdb } from "../../utils/localforage";
import { type Sheet } from "../../utils/xlsx.type"

interface BaseStock {
  awal: number;
  dateEnd: string;
  dateIn: string;
  dateOut: string;
  id: string;
  in: number;
  item: string;
  out: number;
  parent: string;
  parentDocument: string;
  planOut: number;
  problem: string[];
  real: number;
  shift: number;
}

interface BaseStockMapped extends BaseStock {
  
  itemName?: string,
  problem2?: string,
  selisih?: number

}


interface BaseStockUpdate {
  awal?: number;
  dateEnd?: string;
  dateIn?: string;
  dateOut?: string;
  id?: string;
  in?: number;
  item?: string;
  out?: number;
  parent?: string;
  parentDocument?: string;
  planOut?: number;
  problem?: string[];
  real?: number;
  shift?: number;
}

let lists = <BaseStockMapped[]>[];

const storeName = "basereportstock";

export function baseReportStock () {
  const db = useIdb(storeName);
  const { getItemBykode } = baseItem();

  const appendData = async ( parent: string, shift: number, item: string, awal: number, masuk: number, keluar: number, riil: number) => {
    // because we need warehouse id
    const { findBaseReportFileById } = BaseReportFile();

    let parentDetails = await findBaseReportFileById(parent);
    let getProblem = problemActive(parentDetails?.warehouse, item);

    const recordToSet = {
      awal,
      dateEnd: "",
      dateIn: "",
      dateOut: "",
      in: masuk,
      item,
      out: keluar,
      parent,
      parentDocument: '',
      planOut: 0,
      problem: getProblem,
      real: riil,
      shift,
    }

    const insertedId = await db.createItem(recordToSet)

    if(insertedId) {
      const interpretIt = await interpretRecord({ id: insertedId, ...recordToSet });
      lists.push(interpretIt);
    }
    
  };
  
  const startImportStock = async (sheets: Sheet, baseId: string) => {
    // dapatkan !ref
    if(sheets["!ref"] == undefined) return;
    let infoRowColStock = sheets["!ref"].split(":");
    
    const isRowClockNotOke = infoRowColStock[1] == null || infoRowColStock[0] == null;
    if(isRowClockNotOke) return;

    let lengthRow = infoRowColStock[1].match(/\d+/);
    if(!lengthRow || lengthRow.length == 0 || lengthRow[0] == null ) return;

    // dapatkan length data clock
    let lengthRowStock = +lengthRow[0];
  
    for (let i = 1; i <= lengthRowStock; i++) {
      /* 
              #STOCK 
              shift 1 jika E5.v > 0 atau F5.v > 0 , A+i !== false
              masukkan ke idb
          */
      //    Checker stock shift 1
      let in1st = sheets["E" + i] ? sheets["E" + i].v : 0;
      let out1st = sheets["F" + i] ? sheets["F" + i].v : 0;
      if (in1st > 0 || out1st > 0) {
        await appendData(
          baseId,
          1,
          sheets["A" + i] ? sheets["A" + i].v : "No item",
          sheets["D" + i] ? sheets["D" + i].v : 0,
          in1st,
          out1st,
          sheets["G" + i] ? sheets["G" + i].v : 0
        );
      }
      /*
              shift 2 jika H5.v > 0 atau I5.v > 0 , A+i !== false
              masukkan ke idb
          */
      //    Checker stock shift 2
      let in2nd = sheets["H" + i] ? sheets["H" + i].v : 0;
      let out2nd = sheets["I" + i] ? sheets["I" + i].v : 0;
      if (in2nd > 0 || out2nd > 0) {
        await appendData(
          baseId,
          2,
          sheets["A" + i] ? sheets["A" + i].v : "No item",
          sheets["G" + i] ? sheets["G" + i].v : 0,
          in2nd,
          out2nd,
          sheets["J" + i] ? sheets["J" + i].v : 0
        );
      }
  
      /*
              shift 3 jika K5.v > 0 atau L5.v > 0  atau M5.v > 0  atau O5.v > 0 
              A+i !== false
              masukkan ke idb 
          */
      // number checker
      let in1 = sheets["K" + i] ? +sheets["K" + i].v : 0;
      let in2 = sheets["O" + i] ? +sheets["O" + i].v : 0;
      let totalIn = in1 == in2 ? in1 : in1 + in2;
      let out1 = sheets["L" + i] ? +sheets["L" + i].v : 0;
      let out2 = sheets["M" + i] ? +sheets["M" + i].v : 0;
      let totalOut = out1 + out2;
  
      if ((in1 || out1 || out2 || in2) && i > 3 && sheets["A" + i]) {
        await appendData(
          baseId,
          3,
          sheets["A" + i] ? sheets["A" + i].v : "No item",
          sheets["J" + i] ? sheets["J" + i].v : 0,
          totalIn,
          totalOut,
          sheets["P" + i] ? sheets["P" + i].v : 0
        );
      }
    }
  };
  
  const removeStock = async (id: string) => {
    lists = lists.filter((rec) => rec.id !== id);
    await db.removeItem(id);
  };

  const removeStockByParent = async (parent: string) => {
    for(let [index, record] of lists.entries()) {

      loaderMessage.value = `Memindai dan menghapus ${index} dari ${lists.length}`;

      if(record.parent == parent) {
        await removeStock(record.id);
      }

    }
    
  };

  const getBaseStockByParentByShift = async (parent: string, shift: number): Promise<BaseStock|undefined> => {
    
    let findRec = lists.find(
      (rec) => rec.parent == parent && rec.shift == shift
    );

    if (typeof findRec === 'undefined') {
      const getRecord = await db.getItemsByTwoKeyValue('parent', parent, 'shift', shift);
      
      if(getRecord && getRecord.length) {
        findRec = {
          awal: getRecord[0]?.awal,
          dateEnd: getRecord[0]?.dateEnd,
          dateIn: getRecord[0]?.dateIn,
          dateOut: getRecord[0]?.dateOut,
          id: getRecord[0]?.id,
          in: getRecord[0]?.in,
          item: getRecord[0]?.item,
          out: getRecord[0]?.outd,
          parent: getRecord[0]?.parent,
          parentDocument: getRecord[0]?.parentDocument,
          planOut: getRecord[0]?.planOut,
          problem: getRecord[0]?.problem,
          real: getRecord[0]?.real,
          shift: getRecord[0]?.shift,
        }
      }
    }

    return findRec;
  };

  async function interpretRecord (record: BaseStock): Promise<BaseStockMapped> {
    const itemName = await getItemBykode(record.item);
    const problem2 = await masalah(record.problem);
    const selisih = Number(record.real) - (Number(record.awal) + Number(record.in) - Number(record.out));
    const planOut = record?.planOut || 0 

    return { ...record, itemName, problem2, selisih, planOut }

  }
  
  const baseReportStockLists = async (parent: string, shift: number): Promise<BaseStock[]|undefined> => {

    let result = lists.filter((rec) => rec?.parent === parent && rec?.shift === shift);
    
    if(!result.length) {
      const retrieveFromDb = await db.getItemsByTwoKeyValue('parent', parent, 'shift', shift);

      if(typeof retrieveFromDb === 'undefined') return;
      
      for (let record of retrieveFromDb) {
        const interpretIt = await interpretRecord(record);

        lists.push(interpretIt);
        result.push(interpretIt);
        
      }

    }

    return result;
  };
    
  
}

export const stockDetails = (parent, shift) => {
  /*
     expected result = {
        totalIn: Number, 
        totalItemMoving: Number, 
        totalQtyOut: Number, 
        totalProductNotFifo: Number 
    }
    */
  let result = {
    totalItemMoving: 0,
    totalQTYIn: 0,
    totalQTYOut: 0,
    totalProductNotFIFO: 0,
    planOut: 0,
    totalItemKeluar: 0,
    itemVariance: 0,
  };
  lists.forEach((val) => {
    if (val.shift == shift && val.parent == parent) {
      if (Number(val.out)) {
        result["totalItemKeluar"]++;
      }
      result["totalItemMoving"]++;
      result["totalQTYIn"] = result["totalQTYIn"] + Number(val.in);
      result["totalQTYOut"] = result["totalQTYOut"] + Number(val.out);
      result["planOut"] = result["planOut"] += val?.planOut
        ? Number(val?.planOut)
        : 0;
    }
  });

  return result;
};

export const updateBaseStock = async (id, objtToUpdate) => {
  lists = lists.map((val) => {
    if (val.id == id) {
      return { ...val, ...objtToUpdate };
    }
    return val;
  });
  await update({
    store: "BaseReportStock",
    criteria: { id: id },
    obj: objtToUpdate,
  });
  return true;
};

export async function markStockFinished(
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
        await updateBaseStock(list.id, { parentDocument });
        markFinished++
      }
      // jika sudah terisi
    }
  }
  loaderMessage.value = '';
  progressMessage2.value = '';
  return;
}

export async function syncBaseStockToServer () {

  let allData = await getData({ store: storeName, withKey: true })

  for(let [index, datum] of allData.entries()) {
  // awal, dateEnd, dateIn, dateOut, id, in, item, 
  //out, parent, parentDocument, planOut
//  problem, real, shift

    let dataToSend = {
      "id": datum?.key,
      "parent": datum?.data?.parent || 0,
      "shift": datum?.data?.shift || 0,
      "item": datum?.data?.item || 0,
      "awal": datum?.data?.awal || 0,
      "in_stock": datum?.data?.in || 0,
      "out_stock": datum?.data?.out || 0,
      "date_in": datum?.data?.dateIn || 0,
      "plan_out": datum?.data?.planOut || 0,
      "date_out": datum?.data?.dateOut || 0,
      "date_end": datum?.data?.dateEnd || 0,
      "real_stock": datum?.data?.real || 0,
      "problem": datum?.data?.problem.toString()  || 0
    }

    try {
      progressMessage2.value = `Mengirim data ${index} dari ${allData.length}`
      await postData('base_stock', dataToSend);

    } catch(err) {

        // alert(err); 
        console.log(err)
        // return false;

    }
  }
  return true;
}

export async function syncBaseStockRecordToServer (idRecord, mode) {

  if(typeof idRecord !== 'string') {
    alert("Id record base report stock must be a string");
    return;
  }

  let record = await getDataByKey(storeName, idRecord);

  if(!record) {
      // dont do anything if record doesn't exist;
      return
  }
  // awal, dateEnd, dateIn, dateOut, id, in, item, 
  //out, parent, parentDocument, planOut
//  problem, real, shift

  let dataToSend = {
    "id": idRecord,
    "parent": record?.parent || 0,
    "shift": record?.shift || 0,
    "item": record?.item || 0,
    "awal": record?.awal || 0,
    "in_stock": record?.in || 0,
    "out_stock": record?.out || 0,
    "date_in": record?.dateIn || 0,
    "plan_out": record?.planOut || 0,
    "date_out": record?.dateOut || 0,
    "date_end": record?.dateEnd || 0,
    "real_stock": record?.real || 0,
    "problem": record?.problem.toString()  || 0
  }

  try {

    if(mode === 'create') {

      await postData('base_stock', dataToSend);

    } 
  
    else if(mode === 'update') {

        await putData('base_stock/'+ idRecord, dataToSend)

    }

    else if (mode === 'delete') {

        await deleteData('base_stock/'+ idRecord)
        
    }

  } catch(err) {

    const errorMessage = 'Failed to send base stock record id :' + idRecord +' to server with error message: ' + err;
    alert(errorMessage); 
    console.log(errorMessage)
    return false;

  }
  return true;
}