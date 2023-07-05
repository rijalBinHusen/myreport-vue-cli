import { getSupervisorId } from "@/composable/components/Supervisors";
import { getHeadspvId } from "@/pages/Headspv/Headspv";
import { dateMonth } from "@/composable/piece/dateFormat";
import { append, getData, update, deleteDocument, getDataByKey } from "@/myfunction";

let lists = [];
const storeName = "cases";

export async function addCase(
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
  sumberMasalah
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
  await append({ store: "Cases", obj: rec }).then((res) => {
      lists.unshift(res.data);
  });
  return;
}

export async function addCaseImport(
  bagian,
  divisi,
  fokus,
  kabag,
  karu,
  keterangan1,
  keterangan2,
  periode,
  temuan
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
  await append({ store: "Cases", obj: rec }).then((res) => {
      lists.unshift(res.data);
  });
  return;
}

export async function getCases() {
  await getData({
    store: "cases",
    limit: 200,
    orderBy: "id",
    desc: true,
  }).then((result) => {
    if (result) {
      lists = result;
    }
  });
}

export async function listsCase(isInsert) {
  let result = [];
  let category = isInsert ? "insert" : "import";
  for (let list of lists) {
    if (list[category]) {
      result.push({
        ...list,
        periode2: dateMonth(list.periode),
        spvName: await getSupervisorId(list?.name).then((res) => res?.name),
        headName: await getHeadspvId(list?.head).then((res) => res?.name),
        insert2: dateMonth(list?.insert),
      });
    }
  }
  return result;
}

export function getCaseId(idCase) {
  return lists.find((rec) => rec.id == idCase);
}

export async function updateCase(idCase, objToUpdate) {
  lists = lists.map((val) => {
    if (val.id == idCase) {
      return { ...val, ...objToUpdate };
    }
    return val;
  });
  await update({
    store: "Cases",
    criteria: { id: idCase },
    obj: objToUpdate,
  });
  return;
}


export const removeCase = async (id) => {
  lists = lists.filter((rec) => rec.id !== id);
  deleteDocument({ store: "Cases", criteria: { id } });
  return true;
};

import { progressMessage2 } from "../../components/parts/Loader/state";
import { postData, putData, deleteData } from "../../utils/sendDataToServer";
export async function syncCasesToServer () {

  let allData = await getData({ store: storeName, withKey: true })

  for(let [index, datum] of allData.entries()) {
    // awal, dateEnd, dateIn, dateOut, id, in, item, 
    //out, parent, parentDocument, planOut
    //  problem, real, shift

    // case import
    // bagian, divisi, fokus, id, import, inserted, kabag, karu
    // keterangan1, keterangan2, periode, temuan
    let dataToSend;
    let endPoint;

    if(datum?.data?.import) {

      dataToSend = {
        "id": datum?.key || 0,
        "bagian": datum?.data?.bagian || 0,
        "divisi": datum?.data?.divisi || 0,
        "fokus": datum?.data?.fokus || 0,
        "kabag": datum?.data?.kabag || 0,
        "karu": datum?.data?.karu || 0,
        "keterangan1": datum?.data?.keterangan1 || 0,
        "keterangan2": datum?.data?.keterangan2 || 0,
        "periode": datum?.data?.periode || 0,
        "temuan": datum?.data?.temuan || 0
      }

      endPoint = "case_import";

    } 

    // case
    // dl || 0, head || 0, id || 0, insert || 0, masalah || 0, name || 0, parent || 0, periode || 0, pic
    // solusi || 0, status || 0, sumberMasalah
    else {

      dataToSend = {
        "id": datum?.key,
        "periode": datum?.data?.periode || 0,
        "head_spv_id": datum?.data?.head || 0,
        "dl": datum?.data?.dl || 0,
        "masalah": datum?.data?.masalah || 0,
        "supervisor_id": datum?.data?.name || 0,
        "parent": datum?.data?.parent || 0,
        "pic": datum?.data?.pic || 0,
        "solusi": datum?.data?.solusi || 0,
        "status": datum?.data?.status || 0,
        "sumber_masalah": datum?.data?.sumberMasalah || 0
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


export async function syncCaseRecordToServer (idRecord, mode) {

  if(typeof idRecord !== 'string') {
    alert("Id record case must be a string");
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
