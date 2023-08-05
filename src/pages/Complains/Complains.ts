import { getSupervisorId } from "@/pages/Supervisors/Supervisors";
import { getHeadspvId } from "@/pages/Headspv/Headspv";
import { dateMonth } from "@/composable/piece/dateFormat";
import { postData, deleteData, putData, getData as getDataOnServer } from "../../utils/requestToServer";

interface Complain {
  dl: number
  head: string
  id: string
  insert: number
  isCount: boolean
  masalah: string
  name: string
  parent: string
  periode: number
  pic: string
  solusi: string
  status: boolean
  sumberMasalah: string
  type: string
}

interface ComplainMapped extends Complain {
  periode2?: string
  spvName?: string
  headName?: string
  insert2?: string
}

interface ComplainImport {
  customer: string
  do: number
  gudang: string
  id: string
  import: boolean
  inserted: boolean
  item: string
  kabag: string
  nomorSJ: string
  nopol: string
  real: number
  row: string
  spv: string
  tally: string
  tanggalBongkar: string
  tanggalInfo: string
  tanggalKomplain: string
  tanggalSuratJalan: string
  type: string
}

interface ComplainImportMapped extends ComplainImport {
  selisih?: number
}


type Partial<T> = {
  [P in keyof T]?: T[P];
};

type ComplainUpdate = Partial<Complain>;
type ComplainImportUpdate = Partial<ComplainImport>;

export let lists = ref(<ComplainMapped[]>[]);
export let listsComplainImport = ref(<ComplainImportMapped[]>[]);

const storeName = "complains";

export function Complains () {
  const db = useIdb(storeName);

  async function addComplain(
    periode: number,
    head: string,
    dl: number,
    insert: number,
    masalah: string,
    name: string,
    parent: string,
    pic: string,
    solusi: string,
    status: boolean,
    sumberMasalah: string,
    type: string,
    isCount: boolean,
  ) {

    let rec = {
      periode,
      head,
      dl,
      insert,
      masalah,
      name,
      parent,
      pic,
      solusi,
      status,
      sumberMasalah,
      type,
      isCount,
    };

    const insertedId = await db.createItem(rec);

    if(typeof insertedId === 'undefined') return;

    const interpretIt = await interpretComplain({ id: insertedId, ...rec})
    lists.value.unshift(interpretIt)
  }

  async function addComplainImport(
    customer: string,
    Do: number,
    gudang: string,
    item: string,
    kabag: string,
    nomorSJ: string,
    nopol: string,
    real: number,
    row: string,
    spv: string,
    tally: string,
    tanggalBongkar: string,
    tanggalInfo: string,
    tanggalKomplain: string,
    tanggalSuratJalan: string,
    type: string,
  ) {
    let rec = {
      customer,
      do: Do,
      gudang,
      item,
      kabag,
      nomorSJ,
      nopol,
      real,
      row,
      spv,
      tally,
      tanggalBongkar,
      tanggalInfo,
      tanggalKomplain,
      tanggalSuratJalan,
      type,
      import: true,
      inserted: false,
    };
    
    const insertedId = await db.createItem(rec);

    if(typeof insertedId === 'undefined') return;

    const interpretIt = interpretComplainImport({ id: insertedId, ...rec})
    listsComplainImport.value.unshift(interpretIt)

  }
  
  async function interpretComplain (obj: Complain): Promise<ComplainMapped> {

    let periode2 = dateMonth(obj.periode);
    let spvName = await getSupervisorId(obj?.name).then((res) => res?.name);
    let headName = await getHeadspvId(obj?.head).then((res) => res?.name);
    let insert2 = dateMonth(obj?.insert);
    
    return { ...obj, periode2, spvName, headName, insert2};

  }

  function interpretComplainImport (obj: ComplainImport): ComplainImportMapped {

    let selisih = (Number(obj?.real) || 1) - (Number(obj?.do) || 1);
    
    return { ...obj, selisih};

  }

  async function getComplains() {
    const getData = await db.getItemsLimitDesc<Complain&ComplainImport>(200);

    if(typeof getData !== 'undefined') {
      for(let datum of getData) {

        if(datum?.insert) {
          let interpretRecord = await interpretComplain(datum);
          lists.value.push(interpretRecord);
        }
        
        else if(datum?.import) {
          let interpretRecord = interpretComplainImport(datum);

          listsComplainImport.value.push(interpretRecord);
        }
      }
    }

  }
  
  async function getComplainById(id: string): Promise<Complain|undefined> {
    const findIndex = lists.value.findIndex((rec) => rec.id == id);

    if(findIndex > -1) {
      return lists.value[findIndex];
    }

    let getRecord = await db.getItem<Complain>(id);

    if(getRecord ===null) return;

    if(getRecord?.parent) {
      const rec = await interpretComplain(getRecord);
      lists.value.push(rec);
      return rec
    } 

  }
  
  async function getComplainImportById(id: string): Promise<ComplainImport|undefined> {
    const findIndex = listsComplainImport.value.findIndex((rec) => rec.id == id);

    if(findIndex > -1) {
      return listsComplainImport.value[findIndex];
    }

    let getRecord = await db.getItem<ComplainImport>(id);

    if(getRecord ===null) return;

    if(getRecord?.import) {
      const rec = interpretComplainImport(getRecord);
      listsComplainImport.value.push(rec);
      return rec
    } 
    
    else if(getRecord?.import) {
      const rec = interpretComplainImport(getRecord);
      listsComplainImport.value.push(rec);
      return rec
    }

  }
  
  async function updateComplain(idCase: string, obj: ComplainUpdate) {
    const isNoValueToUpdate = Object.values(obj).length === 0;

        if(isNoValueToUpdate) return;

        const findIndex = lists.value.findIndex((rec) => rec?.id === idCase);

        if(findIndex > -1) {
            const record = lists.value[findIndex];
            delete record.periode2;
            delete record.spvName;
            delete record.headName;
            delete record.insert2;
            
            const updateRecord = { ...record, ...obj };
            const mapUpdateRecord = await interpretComplain(updateRecord)
            lists.value[findIndex] = mapUpdateRecord;
        }
        
        await db.updateItem(idCase, obj);
  }
  
  async function updateComplainImport(id: string, obj: ComplainImportUpdate): Promise<void|undefined> {
    const isNoValueToUpdate = Object.values(obj).length === 0;

        if(isNoValueToUpdate) return;

        const findIndex = listsComplainImport.value.findIndex((rec) => rec?.id === id);

        if(findIndex > -1) {
            const record = listsComplainImport.value[findIndex];
            delete record.selisih;
            
            const updateRecord = { ...record, ...obj };
            listsComplainImport.value[findIndex] = updateRecord;
        }
        
        await db.updateItem(id, obj);
  }
  
  const removeComplain = async (id: string) => {
    const findIndex = lists.value.findIndex((rec) => rec.id === id)
    const findIndexImport = listsComplainImport.value.findIndex((rec) => rec.id === id)
    
    if(findIndex > -1) {
      lists.value.splice(findIndex, 1);
    } 
    
    else if(findIndexImport > -1) {
      listsComplainImport.value.splice(findIndexImport, 1);
    }

    await db.removeItem(id);
  };
    
  return {
    addComplain,
    addComplainImport,
    getComplains,
    getComplainById,
    updateComplain,
    updateComplainImport,
    removeComplain,
    getComplainImportById
  }
  
  
}

import { progressMessage2 } from "../../components/parts/Loader/state";
import { useIdb } from "@/utils/localforage";
import { ref } from "vue";
export async function syncComplainsToServer () {
  const db = useIdb(storeName);

  const allData = await db.getItems<Complain&ComplainImport>();

  for(let [index, datum] of allData.entries()) {

    // customer, do, gudang, id, import, inserted, item
    // kabag, nomorSJ, nopol, real, row, spv, tally, tanggalBongkar
    // tanggalInfo, tanggalKomplain, tanggalSuratJalan, type

    let dataToSend;
    let endPoint;

    if(datum?.import) {

      dataToSend = {
        "id": datum?.id,
        "customer": datum?.customer || 0,
        "do_": datum?.do || 0,
        "gudang": datum?.gudang || 0,
        "item": datum?.item || 0,
        "kabag": datum?.kabag || 0,
        "nomor_SJ": datum?.nomorSJ || 0,
        "nopol": datum?.nopol || 0,
        "real_": datum?.real || 0,
        "row_": datum?.row || 0,
        "spv": datum?.spv || 0,
        "tally": datum?.tally || 0,
        "tanggal_bongkar": datum?.tanggalBongkar || 0,
        "tanggal_info": datum?.tanggalInfo || 0,
        "tanggal_komplain": datum?.tanggalKomplain || 0,
        "tanggal_SJ": datum?.tanggalSuratJalan || 0,
        "type_": datum?.type || 0
      }

      endPoint = "complain_import";

    } 

    // complain
    // dl || 0, head || 0, id || 0, insert || 0, insert2 || 0, masalah || 0, name || 0, parent
    // periode || 0, pic || 0, solusi || 0, status || 0, sumberMasalah || 0, type
    else {

      dataToSend = {
        "id": datum?.id || 0,
        "periode": datum?.periode || 0,
        "head_spv_id": datum?.head || 0,
        "dl": datum?.dl || 0,
        "inserted": datum?.insert || 0,
        "masalah": datum?.masalah || 0,
        "supervisor_id": datum?.name || 0,
        "parent": datum?.parent || 0,
        "pic": datum?.pic || 0,
        "solusi": datum?.solusi || 0,
        "is_status_done": datum?.status || 0,
        "sumber_masalah": datum?.sumberMasalah || 0,
        "type": datum?.type || 0,
        "is_count": datum?.isCount || 0
      }

      endPoint = "complain";

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

export async function syncComplainRecordToServer (idRecord: string, mode: string) {

  if(typeof idRecord !== 'string') {
    alert("Id record complain must be a string");
    return;
  }

  const db = useIdb(storeName);

  const record = await db.getItem<Complain&ComplainImport>(idRecord);

  if(!record) {
      // dont do anything if record doesn't exist;
      return
  }

    // customer, do, gudang, id, import, inserted, item
    // kabag, nomorSJ, nopol, real, row, spv, tally, tanggalBongkar
    // tanggalInfo, tanggalKomplain, tanggalSuratJalan, type

    let dataToSend;
    let endPoint;

    if(record?.import) {

      dataToSend = {
        "id": idRecord,
        "customer": record?.customer || 0,
        "do_": record?.do || 0,
        "gudang": record?.gudang || 0,
        "item": record?.item || 0,
        "kabag": record?.kabag || 0,
        "nomor_SJ": record?.nomorSJ || 0,
        "nopol": record?.nopol || 0,
        "real_": record?.real || 0,
        "row_": record?.row || 0,
        "spv": record?.spv || 0,
        "tally": record?.tally || 0,
        "tanggal_bongkar": record?.tanggalBongkar || 0,
        "tanggal_info": record?.tanggalInfo || 0,
        "tanggal_komplain": record?.tanggalKomplain || 0,
        "tanggal_SJ": record?.tanggalSuratJalan || 0,
        "type_": record?.type || 0
      }

      endPoint = "complain_import/";

    } 

    // complain
    // dl || 0, head || 0, id || 0, insert || 0, insert2 || 0, masalah || 0, name || 0, parent
    // periode || 0, pic || 0, solusi || 0, status || 0, sumberMasalah || 0, type
    else {

      dataToSend = {
        "id": idRecord,
        "periode": record?.periode || 0,
        "head_spv_id": record?.head || 0,
        "dl": record?.dl || 0,
        "inserted": record?.insert || 0,
        "masalah": record?.masalah || 0,
        "supervisor_id": record?.name || 0,
        "parent": record?.parent || 0,
        "pic": record?.pic || 0,
        "solusi": record?.solusi || 0,
        "is_status_done": record?.status || 0,
        "sumber_masalah": record?.sumberMasalah || 0,
        "type": record?.type || 0,
        "is_count": record?.isCount || 0
      }

      endPoint = "complain/";

    }

    try {

      if(mode === 'create') {
  
        await postData(endPoint, dataToSend);
  
      } 
    
      else if(mode === 'update') {
  
          await putData(endPoint + idRecord, dataToSend)
  
      }

      else if (mode === 'delete') {

          await deleteData(endPoint + idRecord)
          
      }

    } catch(err) {
      
      const errorMessage = 'Failed to send complain record id :' + idRecord +' to server with error message: '+ err;
      // alert(errorMessage); 
      console.log(errorMessage)
      return false;


    }
  
  return true
}

export async function checkAndSyncComplainRecordToServer (idRecord: string, mode: string): Promise<boolean> {

  if(typeof idRecord !== 'string') {
    alert("Id record complain must be a string");
    return true;
  }

  const db = useIdb(storeName);

  const record = await db.getItem<Complain&ComplainImport>(idRecord);

  if(!record) {
      // dont do anything if record doesn't exist;
      return true;
  }

    // customer, do, gudang, id, import, inserted, item
    // kabag, nomorSJ, nopol, real, row, spv, tally, tanggalBongkar
    // tanggalInfo, tanggalKomplain, tanggalSuratJalan, type

    let dataToSend;
    let endPoint;

    if(record?.import) {

      dataToSend = {
        "id": idRecord,
        "customer": record?.customer || 0,
        "do_": record?.do || 0,
        "gudang": record?.gudang || 0,
        "item": record?.item || 0,
        "kabag": record?.kabag || 0,
        "nomor_SJ": record?.nomorSJ || 0,
        "nopol": record?.nopol || 0,
        "real_": record?.real || 0,
        "row_": record?.row || 0,
        "spv": record?.spv || 0,
        "tally": record?.tally || 0,
        "tanggal_bongkar": record?.tanggalBongkar || 0,
        "tanggal_info": record?.tanggalInfo || 0,
        "tanggal_komplain": record?.tanggalKomplain || 0,
        "tanggal_SJ": record?.tanggalSuratJalan || 0,
        "type_": record?.type || 0
      }

      endPoint = "complain_import/";

    } 

    // complain
    // dl || 0, head || 0, id || 0, insert || 0, insert2 || 0, masalah || 0, name || 0, parent
    // periode || 0, pic || 0, solusi || 0, status || 0, sumberMasalah || 0, type
    else {

      dataToSend = {
        "id": idRecord,
        "periode": record?.periode || 0,
        "head_spv_id": record?.head || 0,
        "dl": record?.dl || 0,
        "inserted": record?.insert || 0,
        "masalah": record?.masalah || 0,
        "supervisor_id": record?.name || 0,
        "parent": record?.parent || 0,
        "pic": record?.pic || 0,
        "solusi": record?.solusi || 0,
        "is_status_done": record?.status || 0,
        "sumber_masalah": record?.sumberMasalah || 0,
        "type": record?.type || 0,
        "is_count": record?.isCount || 0
      }

      endPoint = "complain/";

    }

    try {

      if(mode === 'create') {
  

        const getServerData = await getDataOnServer(endPoint + idRecord);
        const isDataNotExists = getServerData?.status === 404;
  
        if(isDataNotExists) {
  
          await postData(endPoint, dataToSend);
  
        }
  
      } 
    
      else if(mode === 'update') {
      
        const getServerData = await getDataOnServer(endPoint + idRecord);
        const isDataNotExists = getServerData?.status === 404;
  
        if(isDataNotExists) {
  
          await postData(endPoint, dataToSend);
  
        } 
        
        else if(!isDataNotExists) {
          const keyValueServerData = await getServerData?.json();
  
          const isAnyValueToUpdate = isValueNotSame(record, keyValueServerData)
  
          if(isAnyValueToUpdate) {
  
            await putData(endPoint + idRecord, dataToSend)
  
          }
  
  
        }
  
      }

      else if (mode === 'delete') {

        const getServerData = await getDataOnServer(endPoint + idRecord);
        const isDataExists = getServerData?.status === 200;
  
        if(isDataExists) {
  
          await deleteData(endPoint + idRecord)
  
        }
          
      }

    } catch(err) {
      
      const errorMessage = 'Failed to send complain record id :' + idRecord +' to server with error message: '+ err;
      // alert(errorMessage); 
      console.log(errorMessage)
      return false;


    }
  
  return true
}


function isValueNotSame(localData: Complain|ComplainImport, serverData: any): boolean {

  const isCaseImport = localData.hasOwnProperty('import');

  if(isCaseImport) {

    const localDataAsComplainImport = localData as ComplainImport;

    const isCustomerNotSame = serverData["customer"] != localDataAsComplainImport?.customer;
    const isdoNotSame = serverData["do_"] != localDataAsComplainImport?.do;
    const isgudangNotSame = serverData[ "gudang"] != localDataAsComplainImport?.gudang;
    const isitemNotSame = serverData["item"] != localDataAsComplainImport?.item;
    const isKabagNotSame = serverData["kabag"] != localDataAsComplainImport?.kabag;
    const isNomorSJNotSame = serverData["nomor_SJ"] != localDataAsComplainImport?.nomorSJ;
    const isNopolNotSame = serverData["nopol"] != localDataAsComplainImport?.nopol;
    const isRealNotSame = serverData["real_"] != localDataAsComplainImport?.real;
    const isRowNotSame = serverData["row_"] != localDataAsComplainImport?.row;
    const isSPVNotSame = serverData["spv"] != localDataAsComplainImport?.spv;
    const isTallyNotSame = serverData["tally"] != localDataAsComplainImport?.tally;
    const isTanggalBongkarNotSame = serverData["tanggal_bongkar"] != localDataAsComplainImport?.tanggalBongkar;
    const isTanggalInfoNotSame = serverData["tanggal_info"] != localDataAsComplainImport?.tanggalInfo;
    const isTanggalKomplainNotSame = serverData["tanggal_komplain"] != localDataAsComplainImport?.tanggalKomplain;
    const isTanggalSJNotSame = serverData["tanggal_SJ"] != localDataAsComplainImport?.tanggalSuratJalan;
    const isTypeNotSame = serverData["type_"] != localDataAsComplainImport?.type;

    const isAnyValueNotSame = isCustomerNotSame
                              || isdoNotSame
                              || isgudangNotSame
                              || isitemNotSame
                              || isKabagNotSame
                              || isNomorSJNotSame
                              || isNopolNotSame
                              || isRealNotSame
                              || isRowNotSame
                              || isSPVNotSame
                              || isTallyNotSame
                              || isTanggalBongkarNotSame
                              || isTanggalInfoNotSame
                              || isTanggalKomplainNotSame
                              || isTanggalSJNotSame
                              || isTypeNotSame;


    
    return isAnyValueNotSame

    }
    
    else {

      const localDataAsComplain = localData as Complain;

      const isPeriodeNotSame = serverData["periode"] != localDataAsComplain?.periode;
      const isHeadSPVIdNotSame = serverData["head_spv_id"] != localDataAsComplain?.head;
      const isDLNotSame = serverData["dl"] != localDataAsComplain?.dl;
      const isInsertedNotSame = serverData["inserted"] != localDataAsComplain?.insert;
      const isMasalahNotSame = serverData["masalah"] != localDataAsComplain?.masalah;
      const isSPVIdNotSame = serverData["supervisor_id"] != localDataAsComplain?.name;
      const isParentNotSame = serverData["parent"] != localDataAsComplain?.parent;
      const isPICNotSame = serverData["pic"] != localDataAsComplain?.pic;
      const isSolusiNotSame = serverData["solusi"] != localDataAsComplain?.solusi;
      const isIsDoneNotSame = serverData["is_status_done"] != localDataAsComplain?.status;
      const isSumberMasalahNotSame = serverData["sumber_masalah"] != localDataAsComplain?.sumberMasalah;
      const isTypeNotSame = serverData["type"] != localDataAsComplain?.type;
      const isisCountNotSame = serverData["is_count"] != localDataAsComplain?.isCount;
  
      const isAnyValueNotSame = isPeriodeNotSame
                                || isHeadSPVIdNotSame
                                || isDLNotSame
                                || isInsertedNotSame
                                || isMasalahNotSame
                                || isSPVIdNotSame
                                || isParentNotSame
                                || isPICNotSame
                                || isSolusiNotSame
                                || isIsDoneNotSame
                                || isSumberMasalahNotSame
                                || isTypeNotSame
                                || isisCountNotSame;
      return isAnyValueNotSame
    }
}