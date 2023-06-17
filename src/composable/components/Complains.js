import { getSupervisorId } from "@/composable/components/Supervisors";
import { getHeadspvId } from "@/composable/components/Headspv";
import { dateMonth } from "@/composable/piece/dateFormat";
import { append, getData, update, deleteDocument } from "@/myfunction";
import { postData } from "../../utils/sendDataToServer";

let lists = [];
const storeName = "Complains";

export async function addComplain(
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
  await append({ store: "Complains", obj: rec }).then((res) => {
      lists.unshift(res.data);
  });
  return;
}

export async function addComplainImport(
  customer,
  Do,
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
  await append({ store: "Complains", obj: rec }).then((res) => {
      lists.unshift(res.data);
  });
  return;
}

export async function getComplains() {
  if (lists.length) {
    return;
  }
  await getData({
    store: "Complains",
    limit: 200,
    orderBy: "id",
    desc: true,
  }).then((result) => {
    if (result) {
      lists = result;
    }
  });
}

export async function listsComplain(isInsert) {
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
        selisih: (Number(list?.real) || 1) - (Number(list?.do) || 1)
      });
    }
  }
  return result;
}

export function getComplainId(idComplain) {
  return lists.find((rec) => rec.id == idComplain);
}

export async function updateComplain(idComplain, objToUpdate) {
  lists = lists.map((val) => {
    if (val.id == idComplain) {
      return { ...val, ...objToUpdate };
    }
    return val;
  });
  await update({
    store: "Complains",
    criteria: { id: idComplain },
    obj: objToUpdate,
  });
  return;
}

export const removeComplain = async (idComplain) => {
  lists = lists.filter((rec) => rec.id !== idComplain);
  await deleteDocument({ store: "Complains", criteria: { id: idComplain } });
  return;
};


import { progressMessage2 } from "../../components/parts/Loader/state";
export async function syncComplainsToServer () {

  let allData = await getData({ store: storeName })

  for(let [index, datum] of allData.entries()) {

    // customer, do, gudang, id, import, inserted, item
    // kabag, nomorSJ, nopol, real, row, spv, tally, tanggalBongkar
    // tanggalInfo, tanggalKomplain, tanggalSuratJalan, type

    let dataToSend;
    let endPoint;

    if(datum?.import) {

      dataToSend = {
        "id": datum?.id,
        "customer": datum?.customer,
        "do_": datum?.do,
        "gudang": datum?.gudang,
        "item": datum?.item,
        "kabag": datum?.kabag,
        "nomor_SJ": datum?.nomorSJ,
        "nopol": datum?.nopol,
        "real_": datum?.real,
        "row_": datum?.row,
        "spv": datum?.spv,
        "tally": datum?.tally,
        "tanggal_bongkar": datum?.tanggalBongkar,
        "tanggal_info": datum?.tanggalInfo,
        "tanggal_komplain": datum?.tanggalKomplain,
        "tanggal_SJ": datum?.tanggalSuratJalan,
        "type_": datum?.type
      }

      endPoint = "complain_import";

    } 

    // complain
    // dl, head, id, insert, insert2, masalah, name, parent
    // periode, pic, solusi, status, sumberMasalah, type
    else {

      dataToSend = {
        "id": datum?.id,
        "periode": datum?.periode,
        "head_spv_id": datum?.head,
        "dl": datum?.dl,
        "inserted": datum?.insert,
        "masalah": datum?.masalah,
        "supervisor_id": datum?.name,
        "parent": datum?.parent,
        "pic": datum?.pic,
        "solusi": datum?.solusi,
        "is_status_done": datum?.status,
        "sumber_masalah": datum?.sumberMasalah,
        "type": datum?.type,
        "is_count": datum?.isCount
      }

      endPoint = "complain";

    }

    try {
      progressMessage2.value = `Mengirim data ${index} dari ${allData.length}`
      await postData(endPoint, dataToSend);

    } catch(err) {
        
      alert(err); 
      return false;


    }
  }
  return true
}
