import { getSupervisorId } from "@/pages/Supervisors/Supervisors";
import { getHeadspvId } from "@/pages/Headspv/Headspv";
import { dateMonth } from "../../composable/piece/dateFormat";
import { useIdb } from "../../utils/localforage";

interface Case {
  id: string,
  dl: number,
  head: string,
  insert: boolean,
  masalah: string,
  name: string,
  parent: string,
  periode: number,
  pic: string,
  solusi: string,
  status: boolean,
  sumberMasalah: string,
  periode2?: string,
  spvName?: string,
  headName?: string,
  insert2?: string,
}

interface CaseImport {
  id:string
  bagian:string
  divisi:string
  fokus:string
  import:boolean
  inserted:boolean
  kabag:string
  karu:string
  keterangan1:string
  keterangan2:string
  periode:string
  temuan:string
}

type Partial<T> = {
  [P in keyof T]?: T[P];
};

type CaseImportUpdate = Partial<CaseImport>;
type CaseUpdate = Partial<Case>

let lists = <Case[]>[];
let listsCaseImport = <CaseImport[]>[]
const storeName = "cases";

export function Cases() {
  const db = useIdb(storeName);

  async function addCase(
    periode: number,
    head: string,
    dl: number,
    insert: boolean,
    masalah: string,
    name: string,
    parent: string,
    pic: string,
    solusi: string,
    status: boolean,
    sumberMasalah: string
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
    };
  
    const insertedId = await db.createItem(rec);

    if(typeof insertedId === 'undefined') return;
      const interpretIt = await interpretCaseRecord({ id: insertedId, ...rec})
      lists.unshift(interpretIt)
    
  }
  
  async function addCaseImport(
    bagian: string,
    divisi: string,
    fokus: string,
    kabag: string,
    karu: string,
    keterangan1: string,
    keterangan2: string,
    periode: string,
    temuan: string
  ) {
    let rec = {
      bagian,
      divisi,
      fokus,
      kabag,
      karu,
      keterangan1,
      keterangan2,
      periode,
      temuan,
      import: true,
      inserted: false,
    };

    const insertedId = await db.createItem(rec);
    
    if(insertedId) {
      listsCaseImport.unshift({ id: insertedId, ...rec });
    }
  }
  
  async function getCases() {

    const getData = await db.getItemsLimitDesc<Case&CaseImport>(200);

    if(getData) {

      for(let datum of getData) {

        if(datum?.import) {

          listsCaseImport.push({
            bagian: datum?.bagian,
            divisi: datum?.divisi,
            fokus: datum?.fokus,
            id: datum?.id,
            import: datum?.import,
            inserted: datum?.inserted,
            kabag: datum?.kabag,
            karu: datum?.karu,
            keterangan1: datum?.keterangan1,
            keterangan2: datum?.keterangan2,
            periode: datum?.periode,
            temuan: datum?.temuan,
          });

        } else {
          
          const interpretIt = await interpretCaseRecord({
            dl: Number(datum?.dl),
            head: datum?.head,
            id: datum?.id,
            insert: Boolean(datum?.insert),
            masalah: datum?.masalah,
            name: datum?.name,
            parent: datum?.parent,
            periode: Number(datum?.periode),
            pic: datum?.pic,
            solusi: datum?.solusi,
            status: Boolean(datum?.status),
            sumberMasalah: datum?.sumberMasalah
          });

          lists.push(interpretIt);

        }

      }
    }

  }

  async function interpretCaseRecord(obj: Case) {
    const spvName = await getSupervisorId(obj.name);
    const headName = await getHeadspvId(obj.head);

    return {
      ...obj,
      periode2: dateMonth(obj.periode),
      spvName,
      headName,
      insert2: dateMonth(obj?.insert),
    };

  }
  
  async function getCaseById(idCase: string): Promise<Case|undefined> {
    const findIndex = lists.findIndex((rec) => rec.id == idCase);

    if(findIndex > -1) {
      return lists[findIndex];
    }

    let getRecord = await db.getItem<Case>(idCase);

    if(getRecord === null) return;

    if(getRecord?.insert) {
      getRecord = await interpretCaseRecord(getRecord);
    }

    lists.push(getRecord);
    return getRecord;
  } 
  
  async function getCaseImportById(idCase: string): Promise<CaseImport|undefined> {
    const findIndex = listsCaseImport.findIndex((rec) => rec.id == idCase);

    if(findIndex > -1) {
      return listsCaseImport[findIndex];
    }

    let getRecord = await db.getItem<CaseImport>(idCase);

    if(getRecord === null) return;

    if(getRecord.import) {

      listsCaseImport.push(getRecord);
      return getRecord;
      
    }

  } 
  
  async function updateCase(idCase: string, obj: CaseUpdate) {
    const isNoValueToUpdate = Object.values(obj).length > 0;

        if(isNoValueToUpdate) return;

        const findIndex = lists.findIndex((rec) => rec?.id === idCase);

        if(findIndex > -1) {
            const record = lists[findIndex];
            delete record.headName;
            delete record.insert2;
            delete record.periode2;
            delete record.spvName;
            
            const updateRecord = { ...record, ...obj };
            const mapUpdateRecord = await interpretCaseRecord(updateRecord)
            lists[findIndex] = mapUpdateRecord;
        }
        
        await db.updateItem(idCase, obj);
  }
  
  async function updateCaseImport(idCase: string, obj: CaseImportUpdate) {
    const isNoValueToUpdate = Object.values(obj).length > 0;

        if(isNoValueToUpdate) return;

        const findIndex = listsCaseImport.findIndex((rec) => rec?.id === idCase);

        if(findIndex > -1) {
            const record = listsCaseImport[findIndex];
            
            const updateRecord = { ...record, ...obj };
            listsCaseImport[findIndex] = updateRecord;
        }
        
        await db.updateItem(idCase, obj);
  }
  
  const removeCase = async (id: string) => {
    lists = lists.filter((rec) => rec.id !== id);
    await db.removeItem(id);
  };

  return {
    addCase,
    addCaseImport,
    getCases,
    getCaseById,
    getCaseImportById,
    updateCase,
    updateCaseImport,
    removeCase
  }
    
}

import { progressMessage2 } from "../../components/parts/Loader/state";
import { postData, putData, deleteData } from "../../utils/sendDataToServer";

export async function syncCasesToServer () {

  const db = useIdb(storeName);

  let allData = await db.getItems<Case&CaseImport>();
  // getData({ store: storeName, withKey: true })

  for(let [index, datum] of allData.entries()) {
    // awal, dateEnd, dateIn, dateOut, id, in, item, 
    //out, parent, parentDocument, planOut
    //  problem, real, shift

    // case import
    // bagian, divisi, fokus, id, import, inserted, kabag, karu
    // keterangan1, keterangan2, periode, temuan
    let dataToSend;
    let endPoint;

    if(datum?.import) {

      dataToSend = {
        "id": datum?.id || 0,
        "bagian": datum?.bagian || 0,
        "divisi": datum?.divisi || 0,
        "fokus": datum?.fokus || 0,
        "kabag": datum?.kabag || 0,
        "karu": datum?.karu || 0,
        "keterangan1": datum?.keterangan1 || 0,
        "keterangan2": datum?.keterangan2 || 0,
        "periode": datum?.periode || 0,
        "temuan": datum?.temuan || 0
      }

      endPoint = "case_import";

    } 

    // case
    // dl || 0, head || 0, id || 0, insert || 0, masalah || 0, name || 0, parent || 0, periode || 0, pic
    // solusi || 0, status || 0, sumberMasalah
    else {

      dataToSend = {
        "id": datum?.id,
        "periode": datum?.periode || 0,
        "head_spv_id": datum?.head || 0,
        "dl": datum?.dl || 0,
        "masalah": datum?.masalah || 0,
        "supervisor_id": datum?.name || 0,
        "parent": datum?.parent || 0,
        "pic": datum?.pic || 0,
        "solusi": datum?.solusi || 0,
        "status": datum?.status || 0,
        "sumber_masalah": datum?.sumberMasalah || 0
      }

      endPoint = "case";

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


export async function syncCaseRecordToServer (idRecord: string, mode: string) {

  if(typeof idRecord !== 'string') {
    alert("Id record case must be a string");
    return;
  }

  const db = useIdb(storeName);

  let record = await db.getItem<Case&CaseImport>(idRecord);

  if(!record) {
      // dont do anything if record doesn't exist;
      return
  }

  // awal, dateEnd, dateIn, dateOut, id, in, item, 
  //out, parent, parentDocument, planOut
  //  problem, real, shift

  // case import
  // bagian, divisi, fokus, id, import, inserted, kabag, karu
  // keterangan1, keterangan2, periode, temuan
  let dataToSend;
  let endPoint;

  if(record?.import) {

    dataToSend = {
      "id": idRecord,
      "bagian": record?.bagian || 0,
      "divisi": record?.divisi || 0,
      "fokus": record?.fokus || 0,
      "kabag": record?.kabag || 0,
      "karu": record?.karu || 0,
      "keterangan1": record?.keterangan1 || 0,
      "keterangan2": record?.keterangan2 || 0,
      "periode": record?.periode || 0,
      "temuan": record?.temuan || 0
    }

    endPoint = "case_import/";

  } 

  // case
  // dl || 0, head || 0, id || 0, insert || 0, masalah || 0, name || 0, parent || 0, periode || 0, pic
  // solusi || 0, status || 0, sumberMasalah
  else {

    dataToSend = {
      "id": idRecord,
      "periode": record?.periode || 0,
      "head_spv_id": record?.head || 0,
      "dl": record?.dl || 0,
      "masalah": record?.masalah || 0,
      "supervisor_id": record?.name || 0,
      "parent": record?.parent || 0,
      "pic": record?.pic || 0,
      "solusi": record?.solusi || 0,
      "status": record?.status || 0,
      "sumber_masalah": record?.sumberMasalah || 0
    }

    endPoint = "case/";

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

    const errorMessage = 'Failed to send case record id :' + idRecord +' to server with error message: ' + err;
    alert(errorMessage);
    console.log(errorMessage)
    return false;

  }
  return true
}
