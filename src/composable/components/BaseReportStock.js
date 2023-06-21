import { append, deleteDocument, findData, update, getData, getDataByKey } from "@/myfunction";
import { findBaseReportFile } from "./BaseReportFile";
import { masalah, problemActive } from "./Problem";
import { getItemByKode } from './Baseitem'
import { postData, putData, deleteData } from "../../utils/sendDataToServer";

let lists = [];
const storeName = "basereportstock";

export const startImportStock = async (sheets, baseId) => {
  // dapatkan !ref
  let infoRowColStock = sheets["!ref"].split(":");
  // dapatkan length data stock
  let lengthRowStock = +infoRowColStock[1].match(/\d+/)[0];

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

export const appendData = async (
  parent,
  shift,
  item,
  awal,
  masuk,
  keluar,
  riil
) => {
  // because we need warehouse id
  let parentDetails = findBaseReportFile(parent);
  let getProblem = problemActive(parentDetails?.warehouse, item);
  await append({
    store: "BaseReportStock",
    obj: {
      parent,
      shift,
      item,
      awal,
      in: masuk,
      out: keluar,
      dateIn: "",
      dateOut: "",
      dateEnd: "",
      real: riil,
      problem: getProblem,
    },
  }).then((val) => {
    if (lists) {
      lists.push(val?.data);
    }
  });
  return;
};

export const removeStockByParent = async (parent) => {
  lists = lists.filter((rec) => rec.parent !== parent);
  await deleteDocument({ store: "basereportstock", criteria: { parent } });
  return;
};

export const getBaseStockByParentByShift = async (parent, shift) => {
  let findRecFirst = lists.find(
    (rec) => rec.parent == parent && rec.shift == shift
  );
  if (!findRecFirst) {
    await findData({
      store: "BaseReportStock",
      criteria: { parent, shift },
    }).then((res) => (lists = lists.concat(res)));
  }
};

export const baseReportStockLists = async (parent, shift) => {
  let result = [];
  for (let rec of lists ) {
    if (rec.parent == parent && rec.shift == shift) {
      const itemName = await getItemByKode(rec.item).then((res) => res ? res.name : 'Not found')
      result.push({
        ...rec,
        itemName,
        problem2: masalah(rec.problem),
        selisih:
          Number(rec.real) -
          (Number(rec.awal) + Number(rec.in) - Number(rec.out)),
        planOut: rec?.planOut || 0,
      });
    }
  };
  return result;
};

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
  // iterate the state
  for (let list of lists) {
    // if state?.shift == payload.shift && payload?.parent
    if (list?.shift == shift && list?.parent == parentBaseReportFile) {
      // jika parentDocument kosong
      if (!lists?.parentDocument) {
        // update recordnya
        await updateBaseStock(list.id, { parentDocument });
      }
      // jika sudah terisi
    }
  }
  return;
}

export const removeStock = async (id) => {
  lists = lists.filter((rec) => rec.id !== id);
  deleteDocument({ store: "basereportstock", criteria: { id } });
  return true;
};

import { progressMessage2 } from "../../components/parts/Loader/state";
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