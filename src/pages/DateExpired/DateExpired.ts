import { getSupervisorId } from "@/pages/Supervisors/Supervisors";
import { getHeadspvId } from "@/pages/Headspv/Headspv";
import { dateMonth } from "../../composable/piece/dateFormat";
import { useIdb } from "../../utils/localforage";
import { ref } from "vue"

export interface Case {
  id: string,
  dl: number,
  head: string,
  insert: number,
  masalah: string,
  name: string,
  parent: string,
  periode: number,
  pic: string,
  solusi: string,
  status: boolean,
  sumberMasalah: string,
}

interface CaseFromServer {
  id: string,
  periode: string,
  head_spv_id: string,
  dl: string,
  masalah: string,
  supervisor_id: string,
  parent: string,
  pic: string,
  solusi: string,
  status: string,
  sumber_masalah: string
}

interface CaseImportFromServer {
  id: string,
  bagian: string,
  divisi: string,
  fokus: string,
  kabag: string,
  karu: string,
  keterangan1: string,
  keterangan2: string,
  periode: string,
  temuan: string
  is_intered: string
}

interface CaseMapped extends Case {
  periode2?: string,
  spvName?: string,
  headName?: string,
  insert2?: string,
}

export interface CaseImport {
  id: string
  bagian: string
  divisi: string
  fokus: string
  import: boolean
  inserted: boolean
  kabag: string
  karu: string
  keterangan1: string
  keterangan2: string
  periode: string
  temuan: string
}

type Partial<T> = {
  [P in keyof T]?: T[P];
};


type CaseImportUpdate = Partial<CaseImport>;
export type CaseUpdate = Partial<Case>

export let lists = ref(<CaseMapped[]>[]);
export let listsCaseImport = ref(<CaseImport[]>[])
const storeName = "date-expired";

interface expiredDate {
  no_do: string,
  date_transaction: string,
  shift: number
  item_kode: string,
  item_name: string
  date_expired: string
  mulai_muat: string
  selesai_muat: string,
  gudang: string
  tally: string
  karu: string
  qty: number
  no_pol: string
  catatan: string
}

export function ExpiredDate() {
  const db = useIdb(storeName);

  async function addExpiredDate(
    no_do: string,
    date_transaction: string,
    shift: number,
    item_kode: string,
    item_name: string,
    date_expired: string,
    mulai_muat: string,
    selesai_muat: string,
    gudang: string,
    tally: string,
    karu: string,
    qty: number,
    no_pol: string,
    catatan: string
  ) {
    let rec = {
      no_do,
      date_transaction,
      shift,
      item_kode,
      item_name,
      date_expired,
      mulai_muat,
      selesai_muat,
      gudang,
      tally,
      karu,
      qty,
      no_pol,
      catatan
    };

    

    const insertedId = await db.createItem(rec);

    if (typeof insertedId === 'undefined') return;
    const interpretIt = await interpretCaseRecord({ id: insertedId, ...rec })
    lists.value.unshift(interpretIt)

  }

  async function getWarehouseByCustomMapped(yourWarehouse: string) {
    
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

    if (insertedId) {
      listsCaseImport.value.unshift({ id: insertedId, ...rec });
    }
  }

  async function getCases() {

    const getData = await db.getItemsLimitDesc<Case & CaseImport>(200);

    if (getData) {

      for (let datum of getData) {

        if (datum?.import) {

          listsCaseImport.value.push({
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
            insert: datum?.insert,
            masalah: datum?.masalah,
            name: datum?.name,
            parent: datum?.parent,
            periode: Number(datum?.periode),
            pic: datum?.pic,
            solusi: datum?.solusi,
            status: Boolean(datum?.status),
            sumberMasalah: datum?.sumberMasalah
          });

          lists.value.push(interpretIt);

        }

      }
    }

  }

  async function interpretCaseRecord(obj: Case): Promise<CaseMapped> {
    const spv = await getSupervisorId(obj.name);
    const head = await getHeadspvId(obj.head);

    return {
      ...obj,
      periode2: dateMonth(obj.periode),
      spvName: spv.name,
      headName: head.name,
      insert2: dateMonth(obj?.insert),
    };

  }

  async function getCaseById(idCase: string): Promise<Case | undefined> {
    const findIndex = lists.value.findIndex((rec) => rec.id == idCase);

    if (findIndex > -1) {
      return lists.value[findIndex];
    }

    let getRecord = await db.getItem<Case>(idCase);

    if (getRecord === null) return;

    if (getRecord?.insert) {
      getRecord = await interpretCaseRecord(getRecord);
    }

    lists.value.push(getRecord);
    return getRecord;
  }

  async function getCaseImportById(idCase: string): Promise<CaseImport | undefined> {
    const findIndex = listsCaseImport.value.findIndex((rec) => rec.id == idCase);

    if (findIndex > -1) {
      return listsCaseImport.value[findIndex];
    }

    let getRecord = await db.getItem<CaseImport>(idCase);

    if (getRecord === null) return;

    if (getRecord.import) {

      listsCaseImport.value.push(getRecord);
      return getRecord;

    }

  }

  async function updateCase(idCase: string, obj: CaseUpdate) {
    const isNoValueToUpdate = Object.values(obj).length === 0;

    if (isNoValueToUpdate) return;

    const findIndex = lists.value.findIndex((rec) => rec?.id === idCase);

    if (findIndex > -1) {
      const record = lists.value[findIndex];
      delete record.headName;
      delete record.insert2;
      delete record.periode2;
      delete record.spvName;

      const updateRecord = { ...record, ...obj };
      const mapUpdateRecord = await interpretCaseRecord(updateRecord)
      lists.value[findIndex] = mapUpdateRecord;
    }

    await db.updateItem(idCase, obj);
  }

  async function updateCaseImport(idCase: string, obj: CaseImportUpdate) {
    const isNoValueToUpdate = Object.values(obj).length === 0;

    if (isNoValueToUpdate) return;

    const findIndex = listsCaseImport.value.findIndex((rec) => rec?.id === idCase);

    if (findIndex > -1) {
      const record = listsCaseImport.value[findIndex];

      const updateRecord = { ...record, ...obj };
      listsCaseImport.value[findIndex] = updateRecord;
    }

    await db.updateItem(idCase, obj);
  }

  const removeCase = async (id: string) => {
    const findIndex = lists.value.findIndex((rec) => rec.id === id);
    const findIndexCaseImport = listsCaseImport.value.findIndex((rec) => rec.id === id);

    if (findIndex > -1) {
      lists.value.splice(findIndex, 1)
    }

    if (findIndexCaseImport > -1) {
      listsCaseImport.value.splice(findIndexCaseImport, 1)
    }

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
import { postData, putData, deleteData, getData as getDataOnServer } from "../../utils/requestToServer";

export async function syncCasesToServer() {

  const db = useIdb(storeName);

  let allData = await db.getItems<Case & CaseImport>();
  // getData({ store: storeName, withKey: true })

  for (let [index, datum] of allData.entries()) {
    // awal, dateEnd, dateIn, dateOut, id, in, item, 
    //out, parent, parentDocument, planOut
    //  problem, real, shift

    // case import
    // bagian, divisi, fokus, id, import, inserted, kabag, karu
    // keterangan1, keterangan2, periode, temuan
    let dataToSend;
    let endPoint;

    if (datum?.import) {

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
        "temuan": datum?.temuan || 0,
        "is_inserted": datum?.inserted
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

    } catch (err) {

      // alert(err);
      console.log(err)
      // return false;

    }
  }
  return true
}

export async function syncCaseRecordToServer(idRecord: string, mode: string) {

  if (typeof idRecord !== 'string') {
    alert("Id record case must be a string");
    return;
  }

  const db = useIdb(storeName);

  let record = await db.getItem<Case & CaseImport>(idRecord);

  if (!record && mode != 'delete') {
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

  if (record?.import) {

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
      "temuan": record?.temuan || 0,
      "is_inserted": record?.inserted
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

    if (mode === 'create') {

      await postData(endPoint, dataToSend);

    }

    else if (mode === 'update') {

      await putData(endPoint + idRecord, dataToSend)

    }

    else if (mode === 'delete') {

      await deleteData(endPoint + idRecord)

    }

  } catch (err) {

    const errorMessage = 'Failed to send case record id :' + idRecord + ' to server with error message: ' + err;
    // alert(errorMessage);
    console.log(errorMessage)
    return false;

  }
  return true
}


export async function checkAndsyncCaseRecordToServer(idRecord: string, mode: string) {

  if (typeof idRecord !== 'string') {
    alert("Id record case must be a string");
    return true;
  }

  const db = useIdb(storeName);

  let record = await db.getItem<Case & CaseImport>(idRecord);

  if (!record && mode != 'delete') {
    // dont do anything if record doesn't exist;
    return true
  }

  // awal, dateEnd, dateIn, dateOut, id, in, item, 
  //out, parent, parentDocument, planOut
  //  problem, real, shift

  // case import
  // bagian, divisi, fokus, id, import, inserted, kabag, karu
  // keterangan1, keterangan2, periode, temuan
  let dataToSend;
  let endPoint;

  if (record?.import) {

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
      "temuan": record?.temuan || 0,
      "is_inserted": record?.inserted
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

    if (mode === 'create') {

      const getServerData = await getDataOnServer(endPoint + idRecord);
      const isDataNotExists = getServerData?.status === 404;

      if (isDataNotExists) {

        await postData(endPoint, dataToSend);

      }


    }

    else if (mode === 'update') {

      const getServerData = await getDataOnServer(endPoint + idRecord);
      const isDataNotExists = getServerData?.status == 404;

      if (isDataNotExists) {

        await postData(endPoint, dataToSend);

      }

      else if (!isDataNotExists && record && getServerData?.json) {

        const waitingServerKeyValue = await getServerData.json();
        const keyValueServerData = waitingServerKeyValue?.data[0]

        const isAnyValueToUpdate = isValueNotSame(record, keyValueServerData)

        if (isAnyValueToUpdate) {

          await putData(endPoint + idRecord, dataToSend)

        }


      }


    }

    else if (mode === 'delete') {

      const getServerData = await getDataOnServer(endPoint + idRecord);
      const isDataExists = getServerData?.status === 200;

      if (isDataExists) {

        await deleteData(endPoint + idRecord)

      }

    }

  } catch (err) {

    const errorMessage = 'Failed to send case record id :' + idRecord + ' to server with error message: ' + err;
    // alert(errorMessage);
    console.log(errorMessage)
    return false;

  }
  return true
}

function isValueNotSame(localData: Case | CaseImport, serverData: any): boolean {

  const isCaseImport = localData.hasOwnProperty('import');

  if (isCaseImport) {

    const localDataAsCaseImport = localData as CaseImport;

    const isBagianNotSame = localDataAsCaseImport["bagian"] != serverData["bagian"]
    const isDivisiNotSame = localDataAsCaseImport["divisi"] != serverData["divisi"]
    const isFokusNotSame = localDataAsCaseImport["fokus"] != serverData["fokus"]
    const isKabagNotSame = localDataAsCaseImport["kabag"] != serverData["kabag"]
    const isKaruNotSame = localDataAsCaseImport["karu"] != serverData["karu"]
    const isKeterangan1NotSame = localDataAsCaseImport["keterangan1"] != serverData["keterangan1"]
    const isKeterangan2NotSame = localDataAsCaseImport["keterangan2"] != serverData["keterangan2"]
    const isPeriodeNotSame = localDataAsCaseImport["periode"] != serverData["periode"]
    const isTemuanNotSame = localDataAsCaseImport["temuan"] != serverData["temuan"]

    const isAnyValueNotSame = isBagianNotSame
      || isDivisiNotSame
      || isFokusNotSame
      || isKabagNotSame
      || isKaruNotSame
      || isKeterangan1NotSame
      || isKeterangan2NotSame
      || isPeriodeNotSame
      || isTemuanNotSame;


    return isAnyValueNotSame

  }

  else {

    const localDataAsCase = localData as Case;

    const isPeriodeNotSame = serverData["periode"] != localDataAsCase?.periode
    const isHeadNotSame = serverData["head_spv_id"] != localDataAsCase?.head
    const isDLNotSame = serverData["dl"] != localDataAsCase?.dl
    const isMasalahNotSame = serverData["masalah"] != localDataAsCase?.masalah
    const isSupervisorNotSame = serverData["supervisor_id"] != localDataAsCase?.name
    const isParetNotSame = serverData["parent"] != localDataAsCase?.parent
    const isPicNotSame = serverData["pic"] != localDataAsCase?.pic
    const isSolusiNotSame = serverData["solusi"] != localDataAsCase?.solusi
    const isStatusNotSame = serverData["status"] != localDataAsCase?.status
    const isSumberMasalahNotSame = serverData["sumber_masalah"] != localDataAsCase?.sumberMasalah

    const isAnyValueNotSame = isPeriodeNotSame
      || isHeadNotSame
      || isDLNotSame
      || isMasalahNotSame
      || isSupervisorNotSame
      || isParetNotSame
      || isPicNotSame
      || isSolusiNotSame
      || isStatusNotSame
      || isSumberMasalahNotSame;
    return isAnyValueNotSame
  }
}


async function implantCasesFromServer() {
  const fetchEndPoint = await getDataOnServer('cases?limit=' + 100);
  const isFetchFailed = fetchEndPoint?.status != 200;

  if (isFetchFailed) return;

  const dbBaseCase = useIdb(storeName);

  const waitingServerKeyValue = await fetchEndPoint.json();
  const cases: CaseFromServer[] = waitingServerKeyValue?.data

  for (let [index, item] of cases.entries()) {
    progressMessage2.value = `Menanamkan case ${index + 1} dari ${cases.length}`;

    let recordToSet: Case = {
      id: item.id,
      dl: Number(item.dl),
      head: item.head_spv_id,
      insert: new Date().getTime(),
      masalah: item.masalah,
      name: item.supervisor_id,
      parent: item.parent,
      periode: Number(item.periode),
      pic: item.pic,
      solusi: item.solusi,
      status: Boolean(item.status),
      sumberMasalah: item.sumber_masalah
    }

    await dbBaseCase.setItem(item.id, recordToSet);
  }

  progressMessage2.value = '';
}

async function implantCasesImportFromServer() {
  const fetchEndPoint = await getDataOnServer('cases_import?limit=' + 100);
  const isFetchFailed = fetchEndPoint?.status != 200;

  if (isFetchFailed) return;

  const dbBaseCase = useIdb(storeName);

  const waitingServerKeyValue = await fetchEndPoint.json();
  const casesImport: CaseImportFromServer[] = waitingServerKeyValue?.data

  for (let [index, item] of casesImport.entries()) {
    progressMessage2.value = `Menanamkan case import ${index + 1} dari ${casesImport.length}`;

    let recordToSet: CaseImport = {

      id: item.id,
      bagian: item.bagian,
      divisi: item.divisi,
      fokus: item.fokus,
      import: true,
      inserted: Boolean(Number(item?.is_intered)),
      kabag: item.kabag,
      karu: item.karu,
      keterangan1: item.keterangan1,
      keterangan2: item.keterangan2,
      periode: item.periode,
      temuan: item.temuan

    }

    await dbBaseCase.setItem(item.id, recordToSet);
  }

  progressMessage2.value = '';
}

export async function implantAllCasesFromServer() {
  await implantCasesImportFromServer();
  await implantCasesFromServer()
}