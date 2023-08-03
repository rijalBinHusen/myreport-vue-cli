// import { getData, update, append, getDataByKey } from '../../myfunction'
import { postData, deleteData, putData, getData as getDataOnServer } from "../../utils/requestToServer"
import { progressMessage2 } from "../../components/parts/Loader/state"
import { useIdb } from "@/utils/localforage";
import { ref } from "vue";

export interface Supervisor {
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
    if(lists.value.length) return;
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
  
  const isNoValueToUpdate = Object.values(obj).length === 0;

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

let timerUpdateShift: ReturnType<typeof setTimeout>;
let idSpvUpdateShift = '';

export function updateShiftSupervisor(supervisorId: string, shift: number) {
  const isNotOkeToUpdate = typeof supervisorId !== 'string' || shift < 1 || shift > 3;

  if(isNotOkeToUpdate) return;

  clearTimeout(timerUpdateShift);

  idSpvUpdateShift = supervisorId;

  timerUpdateShift = setTimeout(() => {

    updateSupervisor(supervisorId, { shift });
    idSpvUpdateShift = ''

  }, 500)

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
      // alert(errorMessage); 
      console.log(errorMessage);
      return false;

  }

  return true;
}


export async function checkAndsyncSupervisorToServer(idRecord: string, mode: string) {

  if(typeof idRecord !== 'string') {
      alert("Id record supervisor must be a string");
      return
  }

  const isCreateMode = mode === 'create'; 
  const isUpdateMode = mode === 'update';
  const isDeleteMode = mode === 'delete';

  let isSynced = false;

  if(isDeleteMode) {
      // the server must be return 404
      const getOnServer = await getDataOnServer('supervisor/' + idRecord);

      const isExistsOnServer = getOnServer?.status === 200

      if(isExistsOnServer) {
          let syncing = await syncSupervisorRecordToServer(idRecord, 'delete')
          isSynced = Boolean(syncing);
      } else {
          isSynced = true
      }
  }

  else if(isCreateMode || isUpdateMode) {
      const dbItem = useIdb(storeName);
      const getItemInLocal = await dbItem.getItem<Supervisor>(idRecord);
      const getItemInServer = await getDataOnServer('supervisor/' + idRecord);

      const isLocalExists = Boolean(getItemInLocal?.id);
      const isServerExists = getItemInServer?.status === 200;

      if(isLocalExists && isServerExists) {

          const serverKeyValue = await getItemInServer.json();
          
          const isNameNotSame = serverKeyValue["supervisor_name"] != getItemInLocal?.name;
          const isPhoneNotSame = serverKeyValue["supervisor_phone"] != getItemInLocal?.phone;
          const isShiftNotSame = serverKeyValue["supervisor_shift"] != getItemInLocal?.shift;
          const isIsDisabledNotSame = serverKeyValue["is_disabled"] != getItemInLocal?.disabled;

          let isAnyValueToUpdate = isNameNotSame 
                                  || isPhoneNotSame
                                  || isShiftNotSame
                                  || isIsDisabledNotSame;

          if(isAnyValueToUpdate) {

            let syncing = await syncSupervisorRecordToServer(idRecord, 'update')
            isSynced = Boolean(syncing);

          }

      }

      else if(isLocalExists && !isServerExists) {

        let syncing = await syncSupervisorRecordToServer(idRecord, 'create')
        isSynced = Boolean(syncing);

      }
  }

  if(isSynced) {

      return true

  }

  return false
}