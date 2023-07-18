import { getSupervisorId } from "@/pages/Supervisors/Supervisors";
import { getHeadspvId } from "@/pages/Headspv/Headspv";
import { dateMonth } from "@/composable/piece/dateFormat";
import { postData, deleteData, putData } from "../../utils/sendDataToServer";

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

let lists = <ComplainMapped[]>[];
let listsComplainImport = <ComplainImportMapped[]>[];

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
    lists.unshift(interpretIt)
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
    listsComplainImport.unshift(interpretIt)

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
          let record = {
            id: datum?.id.toString(),
            dl: Number(datum?.dl),
            head: datum?.head.toString(),
            insert: Number(datum?.insert),
            isCount: Boolean(datum?.isCount),
            masalah: datum?.masalah.toString(),
            name: datum?.name.toString(),
            parent: datum?.parent.toString(),
            periode: Number(datum?.periode),
            pic: datum?.pic.toString(),
            solusi: datum?.solusi.toString(),
            status: Boolean(datum?.status),
            sumberMasalah: datum?.sumberMasalah.toString(),
            type: datum?.type.toString(),
          }
          let interpretRecord = await interpretComplain(record);
          lists.push(interpretRecord);
        }
        
        else if(datum?.import) {
          let record = {
            customer: datum?.customer.toString(),
            do: Number(datum?.do),
            gudang: datum?.gudang .toString(),
            id: datum?.id .toString(),
            import: Boolean(datum?.import),
            inserted: Boolean(datum?.inserted),
            item: datum?.item.toString(),
            kabag: datum?.kabag.toString(),
            nomorSJ: datum?.nomorSJ.toString(),
            nopol: datum?.nopol.toString(),
            real: Number(datum?.real),
            row: datum?.row .toString(),
            spv: datum?.spv .toString(),
            tally: datum?.tally .toString(),
            tanggalBongkar: datum?.tanggalBongkar .toString(),
            tanggalInfo: datum?.tanggalInfo .toString(),
            tanggalKomplain: datum?.tanggalKomplain .toString(),
            tanggalSuratJalan: datum?.tanggalSuratJalan .toString(),
            type: datum?.type.toString(),
          }
          let interpretRecord = interpretComplainImport(record);

          listsComplainImport.push(interpretRecord);
        }
      }
    }
  }
  
  async function getComplainById(id: string): Promise<Complain|undefined|ComplainImport> {
    const findIndex = lists.findIndex((rec) => rec.id == id);

    if(findIndex > -1) {
      return lists[findIndex];
    }

    let getRecord = await db.getItem<Complain&ComplainImport>(id);

    if(getRecord ===null) return;

    if(getRecord?.insert) {
      const rec = await interpretComplain(getRecord);
      lists.push(rec);
      return rec
    } 
    
    else if(getRecord?.import) {
      const rec = interpretComplainImport(getRecord);
      listsComplainImport.push(rec);
      return rec
    }

  }
  
  async function updateComplain(idCase: string, obj: ComplainUpdate) {
    const isNoValueToUpdate = Object.values(obj).length > 0;

        if(isNoValueToUpdate) return;

        const findIndex = lists.findIndex((rec) => rec?.id === idCase);

        if(findIndex > -1) {
            const record = lists[findIndex];
            delete record.periode2;
            delete record.spvName;
            delete record.headName;
            delete record.insert2;
            
            const updateRecord = { ...record, ...obj };
            const mapUpdateRecord = await interpretComplain(updateRecord)
            lists[findIndex] = mapUpdateRecord;
        }
        
        await db.updateItem(idCase, obj);
  }
  
  async function updateComplainImport(id: string, obj: ComplainImportUpdate): Promise<void|undefined> {
    const isNoValueToUpdate = Object.values(obj).length > 0;

        if(isNoValueToUpdate) return;

        const findIndex = listsComplainImport.findIndex((rec) => rec?.id === id);

        if(findIndex > -1) {
            const record = listsComplainImport[findIndex];
            delete record.selisih;
            
            const updateRecord = { ...record, ...obj };
            listsComplainImport[findIndex] = updateRecord;
        }
        
        await db.updateItem(id, obj);
  }
  
  const removeComplain = async (id: string) => {
    lists = lists.filter((rec) => rec.id !== id);
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
  }
  
  
}

import { progressMessage2 } from "../../components/parts/Loader/state";
import { useIdb } from "@/utils/localforage";
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
      alert(errorMessage); 
      console.log(errorMessage)
      return false;


    }
  
  return true
}