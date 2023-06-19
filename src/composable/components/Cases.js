import { getSupervisorId } from "@/composable/components/Supervisors";
import { getHeadspvId } from "@/composable/components/Headspv";
import { dateMonth } from "@/composable/piece/dateFormat";
import { append, getData, update, deleteDocument } from "@/myfunction";

let lists = [];
const storeName = "Cases";

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
import { postData } from "../../utils/sendDataToServer";
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

    if(datum?.import) {

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
