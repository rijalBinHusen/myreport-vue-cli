// import { findData, append, update, getData, getDataByKey } from "@/myfunction";
import { ddmmyyyy, dateMonth } from "../../composable/piece/dateFormat";
import { getSupervisorId } from "../Supervisors/Supervisors";
import { getWarehouseById } from "../Warehouses/Warehouses";
import { baseItem } from '@/pages/BaseItem/Baseitem'
import { postData, deleteData, putData, getData as getDataOnServer } from "../../utils/requestToServer"
import { useIdb } from "@/utils/localforage";

export interface Problem {
  dl:number
  dlPanjang:number
  periode:number
  tanggalSelesai:number
  shiftMulai: number
  shiftSelesai: number
  isFinished: boolean
  id: string
  item: string
  masalah: string
  nameHeadSpv: string
  nameSpv: string
  pic: string
  picPanjang: string
  solusi: string
  solusiPanjang: string
  sumberMasalah: string
  warehouse: string
  linkToDocument: boolean
}

interface ProblemMapped extends Problem {
  namaGudang?: string
  namaItem?: string
  supervisor?: string
  status?: string
  periode2?: string
}

type Partial<T> = {
  [P in keyof T]?: T[P];
};

type ProblemUpdate = Partial<Problem>;

export const lists = ref(<ProblemMapped[]>[]);
const storeName = "problem";
const endPoint = "problem/";
const db = useIdb(storeName);

export const getProblemBetweenPeriode = async (periode1: number, periode2: number) => {
  lists.value.length = 0;
  let getData = await db.getItemsByKeyGreaterOrEqualThanAndLowerOrEqualThan<Problem>('periode', periode1, periode2);

  if(getData.length === 0) return;
  
  for(let problem of getData) {
    const interpretIt = await interpretProblem(problem);

    lists.value.unshift(interpretIt);
  }
};

export const getProblemFromDB = async () => {

  if(lists.value.length > 0) return;

  const getData = await db.getItemsByKeyValue<Problem>('isFinished', false);
  
  if(getData.length === 0) return;
  
  for(let problem of getData) {
    const interpretIt = await interpretProblem(problem);

    lists.value.unshift(interpretIt);
  }
};

export const interpretProblem = async (problem: Problem): Promise<ProblemMapped> => {

  const { getItemBykode } = baseItem();
  const warehouse = await getWarehouseById(problem.warehouse);
  const supervisor = await getSupervisorId(problem.nameSpv);
  const item = await getItemBykode(problem.item);

  return {
      ...problem,
      warehouse: problem.warehouse,
      id: problem.id,
      namaGudang: warehouse.name,
      namaItem: item.name,
      masalah: problem.masalah,
      periode2: ddmmyyyy(problem.periode, '-'),
      supervisor: supervisor.name,
      status: problem?.isFinished ? "Closed" : "Progress",
    }
};

export const problemActive = (warehouse: string, item: string) => {
  // this.$store.getters["Problem/problemActive"](new Date().getTime())
  /* expected result = [itemId, itemId] */

  let result: string[] = [];
  lists.value.forEach((val) => {
    if (!val.isFinished && val.warehouse == warehouse && val.item == item) {
      result.push(val.id);
    }
  });

  return result;
};

export const masalah = (arrayOfProblemId: string[]) => {
  let result: string[] = [];
  if (arrayOfProblemId.length > 0) {
    lists.value.forEach((val) => {
      if (arrayOfProblemId.includes(val.id)) {
        result.push(val.masalah + " " + val.periode2);
      }
    });
  }
  // console.log(result)
  return result.join(", ");
};

export const problemId = (id: string) => {
  return lists.value.find((val) => val.id == id);
};

export const problemActiveBySpvAndPeriode = (spv: string, periode: number) => {
  return lists.value.filter((val) => val?.nameSpv === spv && val?.periode == periode);
};

export const problemByItem = (warehouse: string, item: string) => {
  // this.$store.getters["Problem/problemActive"](new Date().getTime())
  /* expected result = [itemId, itemId] */
  return lists.value.filter((val) => val.warehouse == warehouse && val.item == item);
};

export const addProblem = async (
  warehouse: string,
  nameSpv: string,
  nameHeadSpv: string,
  item: string,
  periode: number,
  shiftMulai: number,
  pic: string,
  dl: number,
  masalah: string,
  sumberMasalah: string,
  solusi: string,
  solusiPanjang: string,
  dlPanjang: number,
  picPanjang: string,
  tanggalSelesai: number
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
    shiftSelesai: 0,
    linkToDocument: false
  };
  
  const insertedId = await db.createItem(rec);

  if(typeof insertedId === 'undefined') return;
  const interpretIt = await interpretProblem({ id: insertedId, ...rec})
  lists.value.unshift(interpretIt)
  
};

export const updateProblem = async (id: string, obj: ProblemUpdate) => {
  const isNoValueToUpdate = Object.values(obj).length === 0;

  if(isNoValueToUpdate) return;

  const findIndex = lists.value.findIndex((rec) => rec?.id === id);

  if(findIndex > -1) {
      const record = lists.value[findIndex];
      delete record.namaGudang
      delete record.namaItem
      delete record.supervisor
      delete record.status
      
      const updateRecord = { ...record, ...obj };
      const mapUpdateRecord = await interpretProblem(updateRecord)
      lists.value[findIndex] = mapUpdateRecord;
  }
  
  await db.updateItem(id, obj);

};

export const duplicate = async (idRecord: string) => {
  let rec = lists.value.find((rec) => rec.id == idRecord);

  if(typeof rec === 'undefined') return;

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
};

import { progressMessage2 } from "../../components/parts/Loader/state"
import { ref } from "vue";
export async function syncProblemToServer () {

  let allData = await db.getItems<Problem>();
  // getData({ store: storeName, withKey: true })
  //dl dlPanjang, id, isFinished, item, masalah, nameHeadSpv, 
  // nameSpv, periode, pic, picPanjang, shiftMulai, shiftSelesai, 
  // solusi, solusiPanjang, sumberMasalah, tanggalSelesai, warehouse  

  for(let [index, datum] of allData.entries()) {

    let dataToSend = {
        "id": datum?.id,
        "warehouse_id": datum?.warehouse || 0,
        "supervisor_id": datum?.nameSpv || 0,
        "head_spv_id": datum?.nameHeadSpv || 0,
        "item_kode": datum?.item || 0,
        "tanggal_mulai": datum?.periode || 0,
        "shift_mulai": datum?.shiftMulai || 0,
        "pic": datum?.pic || 0,
        "dl": datum?.dl || 0,
        "masalah": datum?.masalah || 0,
        "sumber_masalah": datum?.sumberMasalah || 0,
        "solusi": datum?.solusi || 0,
        "solusi_panjang": datum?.solusiPanjang || 0,
        "dl_panjang": datum?.dlPanjang || 0,
        "pic_panjang": datum?.picPanjang || 0,
        "tanggal_selesai": datum?.tanggalSelesai || 0,
        "shift_selesai": datum?.shiftSelesai || 0,
        "is_finished": datum?.isFinished || 0
      }

    try {
      progressMessage2.value = `Mengirim data ${index} dari ${allData.length}`
      await postData(endPoint, dataToSend);

    } catch(err) {
              
      // alert(err); 
        console.log(err)
      // return false;

    }
  }
  return true
}


export async function syncProblemRecordToServer (idRecord: string, mode: string) {

  if(typeof idRecord !== 'string') return;

  let record = await db.getItem<Problem>(idRecord);
  // getDataByKey(storeName, idRecord);

  if(!record && mode != 'delete') {
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

      await postData(endPoint, dataToSend);

    } 
  
    else if(mode === 'update') {

        await putData(endPoint+ idRecord, dataToSend)

    }

    else if (mode === 'delete') {

        await deleteData(endPoint+ idRecord)
        
    }

  } catch(err) {

    const errorMessage = 'Failed to sync problem record id :' + idRecord +' with error message: ' + err;
    // alert(errorMessage); 
    console.log(errorMessage);
    return false;

  }

  return true
}



export async function checkAndsyncProblemToServer(idRecord: string, mode: string): Promise<boolean> {

  if(typeof idRecord !== 'string') {
      alert("Id record problem must be a string");
      return true
  }

  const isCreateMode = mode === 'create'; 
  const isUpdateMode = mode === 'update';
  const isDeleteMode = mode === 'delete';

  let isSynced = false;

  if(isDeleteMode) {
      // the server must be return 404
      const getOnServer = await getDataOnServer(endPoint + idRecord);

      const isExistsOnServer = getOnServer?.status === 200

      if(isExistsOnServer) {
          let syncing = await syncProblemRecordToServer(idRecord, 'delete')
          isSynced = Boolean(syncing);
      } else {
          isSynced = true
      }
  }

  else if(isCreateMode || isUpdateMode) {
      const dbItem = useIdb(storeName);
      const getItemInLocal = await dbItem.getItem<Problem>(idRecord);
      const getItemInServer = await getDataOnServer(endPoint + idRecord);

      const isLocalExists = Boolean(getItemInLocal?.id);
      const isServerExists = getItemInServer?.status === 200;

      if(isLocalExists && isServerExists) {

          const serverKeyValue = await getItemInServer.json();
          
          const isWarehouseNotSame = serverKeyValue["warehouse_id"] != getItemInLocal?.warehouse;
          const isSupervisorNotSame = serverKeyValue["supervisor_id"] != getItemInLocal?.nameSpv;
          const isHeadSPVNotSame = serverKeyValue["head_spv_id"] != getItemInLocal?.nameHeadSpv;
          const isItemNotSame = serverKeyValue["item_kode"] != getItemInLocal?.item;
          const isTanggalMulaiNotSame = serverKeyValue["tanggal_mulai"] != getItemInLocal?.periode;
          const isShiftMulaiNotSame = serverKeyValue["shift_mulai"] != getItemInLocal?.shiftMulai;
          const isPICNotSame = serverKeyValue["pic"] != getItemInLocal?.pic;
          const isDLNotSame = serverKeyValue["dl"] != getItemInLocal?.dl;
          const isMasalahNotSame = serverKeyValue["masalah"] != getItemInLocal?.masalah;
          const isSumberMasalahNotSame = serverKeyValue["sumber_masalah"] != getItemInLocal?.sumberMasalah;
          const isSolusiNotSame = serverKeyValue["solusi"] != getItemInLocal?.solusi;
          const isSolusiPanjangNotSame = serverKeyValue["solusi_panjang"] != getItemInLocal?.solusiPanjang;
          const isDLPanjangNotSame = serverKeyValue["dl_panjang"] != getItemInLocal?.dlPanjang;
          const isPICPanjangNotSame = serverKeyValue["pic_panjang"] != getItemInLocal?.picPanjang;
          const isTanggalSelesaiNotSame = serverKeyValue["tanggal_selesai"] != getItemInLocal?.tanggalSelesai;
          const isShiftSelesaiNotSame = serverKeyValue["shift_selesai"] != getItemInLocal?.shiftSelesai;
          const isIsFinishedNotSame = serverKeyValue["is_finished"] != getItemInLocal?.isFinished;

          let isAnyValueToUpdate = isWarehouseNotSame 
                                  || isSupervisorNotSame
                                  || isHeadSPVNotSame
                                  || isItemNotSame
                                  || isTanggalMulaiNotSame
                                  || isShiftMulaiNotSame
                                  || isPICNotSame
                                  || isDLNotSame
                                  || isMasalahNotSame
                                  || isSumberMasalahNotSame
                                  || isSolusiNotSame
                                  || isSolusiPanjangNotSame
                                  || isDLPanjangNotSame
                                  || isPICPanjangNotSame
                                  || isTanggalSelesaiNotSame
                                  || isShiftSelesaiNotSame
                                  || isIsFinishedNotSame;

          if(isAnyValueToUpdate) {

            let syncing = await syncProblemRecordToServer(idRecord, 'update')
            isSynced = Boolean(syncing);

          } else {

            isSynced = true
            
        }

      }

      else if(isLocalExists && !isServerExists) {

        let syncing = await syncProblemRecordToServer(idRecord, 'create')
        isSynced = Boolean(syncing);

      }

      else {
        isSynced = true
      }
  }

  return isSynced
}