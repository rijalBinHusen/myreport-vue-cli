import { getSupervisorId } from "@/composable/components/Supervisors";
import { getHeadspvId } from "@/pages/Headspv/Headspv";
import { dateMonth } from "@/composable/piece/dateFormat";
import { append, getData, update, deleteDocument, getDataByKey } from "@/myfunction";
import { postData, deleteData, putData } from "../../utils/sendDataToServer";

let lists = [];
const storeName = "complains";

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

  let allData = await getData({ store: storeName, withKey: true })

  for(let [index, datum] of allData.entries()) {

    // customer, do, gudang, id, import, inserted, item
    // kabag, nomorSJ, nopol, real, row, spv, tally, tanggalBongkar
    // tanggalInfo, tanggalKomplain, tanggalSuratJalan, type

    let dataToSend;
    let endPoint;

    if(datum?.data?.import) {

      dataToSend = {
        "id": datum?.key,
        "customer": datum?.data?.customer || 0,
        "do_": datum?.data?.do || 0,
        "gudang": datum?.data?.gudang || 0,
        "item": datum?.data?.item || 0,
        "kabag": datum?.data?.kabag || 0,
        "nomor_SJ": datum?.data?.nomorSJ || 0,
        "nopol": datum?.data?.nopol || 0,
        "real_": datum?.data?.real || 0,
        "row_": datum?.data?.row || 0,
        "spv": datum?.data?.spv || 0,
        "tally": datum?.data?.tally || 0,
        "tanggal_bongkar": datum?.data?.tanggalBongkar || 0,
        "tanggal_info": datum?.data?.tanggalInfo || 0,
        "tanggal_komplain": datum?.data?.tanggalKomplain || 0,
        "tanggal_SJ": datum?.data?.tanggalSuratJalan || 0,
        "type_": datum?.data?.type || 0
      }

      endPoint = "complain_import";

    } 

    // complain
    // dl || 0, head || 0, id || 0, insert || 0, insert2 || 0, masalah || 0, name || 0, parent
    // periode || 0, pic || 0, solusi || 0, status || 0, sumberMasalah || 0, type
    else {

      dataToSend = {
        "id": datum?.key || 0,
        "periode": datum?.data?.periode || 0,
        "head_spv_id": datum?.data?.head || 0,
        "dl": datum?.data?.dl || 0,
        "inserted": datum?.data?.insert || 0,
        "masalah": datum?.data?.masalah || 0,
        "supervisor_id": datum?.data?.name || 0,
        "parent": datum?.data?.parent || 0,
        "pic": datum?.data?.pic || 0,
        "solusi": datum?.data?.solusi || 0,
        "is_status_done": datum?.data?.status || 0,
        "sumber_masalah": datum?.data?.sumberMasalah || 0,
        "type": datum?.data?.type || 0,
        "is_count": datum?.data?.isCount || 0
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

export async function syncComplainRecordToServer (idRecord, mode) {

  if(typeof idRecord !== 'string') {
    alert("Id record complain must be a string");
    return;
  }

  let record = await getDataByKey(storeName, idRecord);

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
      alert(errorMessage); 
      console.log(errorMessage)
      return false;


    }
  
  return true
}