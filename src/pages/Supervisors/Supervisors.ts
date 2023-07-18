// import { getData, update, append, getDataByKey } from '../../myfunction'
import { postData, deleteData, putData } from "../../utils/sendDataToServer"
import { progressMessage2 } from "../../components/parts/Loader/state"
import { useIdb } from "@/utils/localforage";
import { ref } from "vue";

interface Supervisor {
    disabled: boolean
    id: string
    name: string
    phone: string
    shift: number
}

type Partial<T> = {
  [P in keyof T]?: T[P];
};

type SupervisorUpdate = Partial<Supervisor>

export const lists = ref(<Supervisor[]>[])
const storeName = "supervisors";
const db = useIdb(storeName);

export const getSupervisors = async () => {
    lists.value.length = 0
    lists.value = await db.getItems<Supervisor>();
}

export const getSupervisorId = async (supervisorId: string) => {
  const findIndex = lists.value.findIndex((rec) => rec.id == supervisorId);

    if(findIndex > -1) {
      return lists.value[findIndex];
    }

    let getRecord = await db.getItem<Supervisor>(supervisorId);

    if(getRecord === null) {
      getRecord = {
        disabled: true,
        id: 'Not found',
        name: 'Supervisor not found',
        phone: '0',
        shift: 0
      }
    };

    lists.value.push(getRecord);
    return getRecord;
}

export const updateSupervisor = async (idSupervisor: string, obj: SupervisorUpdate) => {
  // objectToUpdate = { name : "", phone : "" }
  //idb
  
  const isNoValueToUpdate = Object.values(obj).length > 0;

  if(isNoValueToUpdate) return;

  const findIndex = lists.value.findIndex((rec) => rec?.id === idSupervisor);

  if(findIndex > -1) {
      const record = lists.value[findIndex];
      
      const updateRecord = { ...record, ...obj };
      lists.value[findIndex] = updateRecord;
  }
  
  await db.updateItem(idSupervisor, obj);

}

export const addSupervisor = async (nameSupervisor: string, phone: string) => {

  let record = {
    disabled: true,
    name: nameSupervisor,
    phone,
    shift: 0,
  }

  const insertedId = await db.createItem(record);
  
  if(typeof insertedId !== 'undefined') {
    lists.value.unshift({ id: insertedId, ...record })
  }
  
}

export const supervisorsEnabled = () => {
  return lists.value.filter((val) => val.disabled === false)
}


export async function syncSupervisorToServer () {

  let allData = await db.getItems<Supervisor>();
  // await getData({ store: storeName, withKey: true })
  //disabled, id, name, phone, shift, warehouse, warehouseName

  for(let [index, datum] of allData.entries()) {

    let dataToSend = {
      "id": datum?.id,
      "supervisor_name": datum?.name || 0,
      "supervisor_phone": datum?.phone || 0,
      "supervisor_warehouse": "No warehouse",
      "supervisor_shift": datum?.shift || 0,
      "is_disabled": datum?.disabled || 0
    }

    try {
      progressMessage2.value = `Mengirim data ${index} dari ${allData.length}`
      await postData('supervisor', dataToSend);

    } catch(err) {
        
        // alert(err); 
        console.log(err)
        // return false;

    }
  }

  return true;
}

export async function syncSupervisorRecordToServer (idRecord: string, mode: string) {

  if(typeof idRecord !== 'string') {
    alert('Id record supervisor must be string')
    return;
  }

  let record = await db.getItem<Supervisor>(idRecord);
  // getDataByKey(storeName, idRecord);
  //disabled, id, name, phone, shift, warehouse, warehouseName

    if(!record) {
      // dont do anything if record doesn't exist;
      return
  }

  let dataToSend = {
    "id": idRecord,
    "supervisor_name": record?.name || 0,
    "supervisor_phone": record?.phone || 0,
    "supervisor_warehouse": "No warehouse",
    "supervisor_shift": record?.shift || 0,
    "is_disabled": record?.disabled || 0
  }

  try {
      if(mode === 'create') {

        await postData('supervisor', dataToSend);

      } 
    
      else if(mode === 'update') {

          await putData('supervisor/'+ idRecord, dataToSend)

      }

      else if (mode === 'delete') {

          await deleteData('supervisor/'+ idRecord)
          
      }

  } catch(err) {
      
      const errorMessage = 'Failed to sync supervisor record id :' + idRecord +' to server with message: ' + err;
      alert(errorMessage); 
      console.log(errorMessage);
      return false;

  }

  return true;
}