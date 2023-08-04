import { postData, deleteData, putData, getData as getDataOnServer } from "../../utils/requestToServer"
import { useIdb } from '@/utils/localforage';
import { progressMessage2 } from "../../components/parts/Loader/state";
import { ref } from "vue";

export let lists = ref([])
const storeName = "headspv";
const db = useIdb(storeName)

// interface HeadSpv {
//   disabled: boolean
//   id: string
//   name: string
//   phone: string
//   shift: number
// }

export const getHeadspv = async () => {
    if(lists.value.length) return;
    lists.value = await db.getItems();
    // getData({ store: 'Headspv', orderBy: 'id', desc: true })
}

export const getHeadspvId = async (headId) => {
    await getHeadspv()
    const findIndex = lists.value.findIndex((rec) => rec?.id === headId)

    if(findIndex > -1) return lists.value[findIndex];

    return { name: 'Not found', phone: 'Not found' }
}

export const updateHeadspv = async (idHeadspv, objectToUpdate) =>{
  //idb
  await db.updateItem(idHeadspv, objectToUpdate)
//   await update({ store: "Headspv", criteria: { id: idHeadspv}, obj : objectToUpdate })
  lists.value = lists.value.map((val) => {
    if(val.id == idHeadspv) {
        return { ...val, ...objectToUpdate }
    }
    return val
  })
}



let timerUpdateShift;
let idHeadSpvUpdateShift = '';

export function updateShiftHeadSupervisor(headSpvId, shift) {
  const isNotOkeToUpdate = typeof headSpvId !== 'string' || shift < 1 || shift > 3;

  if(isNotOkeToUpdate) return;

  clearTimeout(timerUpdateShift);

  idHeadSpvUpdateShift = headSpvId;

  timerUpdateShift = setTimeout(() => {

    updateHeadspv(headSpvId, { shift });
    idHeadSpvUpdateShift = ''

  }, 500)

}

export const addHeadspv = async (name, phone) => {
    let record = { name, phone, disabled: true, shift: 1 };
    const insertedId  = await db.createItem(record);

    if(insertedId !== null);

    lists.value.unshift({id: insertedId, ...record})
}

export const headspvEnabled = () => {
    return lists.value.filter((val) => !val.disabled);
}

export const headspvByShift = (shift) => {
let rec = lists.value.find((val) => val.shift == shift && !val.disabled);
    return rec && rec.name
        ? rec
        : {
            id: 'False',
            name: "Vacant",
            phone: "Not found",
        };
}
  

export async function syncHeadSpvToServer () {

    let allData = await db.getItems();
    // await getData({ store: storeName, withKey: true })
    
    //disabled, id, name, phone, shift
    
  
    for(let [index, datum] of allData.entries()) {
  
        let dataToSend = {
            "id": datum?.id,
            "head_name": datum?.name || 0,
            "head_phone": datum?.phone || 0,
            "head_shift": datum?.shift || 0,
            "is_disabled": datum?.disabled || 0
          }
  
      try {
        progressMessage2.value = `Mengirim data ${index} dari ${allData.length}`
        await postData('head_spv', dataToSend);
  
      } catch(err) {
        
        //   alert(err); 
        console.log(err)
        //   return false;
  
      }
    }

    return true
  }

export async function syncHeadSpvRecordToServer (idRecord, mode) {

    if(typeof idRecord !== 'string') {
        alert('Id record head supervisor must be a string')
        return;
    }

    let record = await db.getItem(idRecord);
    // getDataByKey(storeName, idRecord)

    if(!record) {
        // dont do anything if record doesn't exist;
        return
    }
    
    //disabled, id, name, phone, shift
  
    let dataToSend = {
        "id": idRecord,
        "head_name": record?.name || 0,
        "head_phone": record?.phone || 0,
        "head_shift": record?.shift || 0,
        "is_disabled": record?.disabled || 0
        }

    try {

        if(mode === 'create') {
    
          await postData('head_spv', dataToSend);
    
        } 
      
        else if(mode === 'update') {
    
            await putData('head_spv/'+ idRecord, dataToSend)
    
        }

        else if (mode === 'delete') {

            await deleteData('head_spv/'+ idRecord)
            
        }
        

    } catch(err) {
    
        const errorMessage = 'Failed to send record head supervisor id :' + idRecord +' with error message: ' + err;
        // alert(errorMessage); 
        console.log(errorMessage)
        return false;

    }

    return true
  }


export async function checkAndsyncHeadSpvToServer(idRecord, mode) {

    if(typeof idRecord !== 'string') {
        alert("Id record head spv must be a string");
        return false
    }

    const isCreateMode = mode === 'create'; 
    const isUpdateMode = mode === 'update';
    const isDeleteMode = mode === 'delete';

    let isSynced = false;

    if(isDeleteMode) {
        // the server must be return 404
        const getOnServer = await getDataOnServer('head_spv/' + idRecord);

        const isExistsOnServer = getOnServer?.status === 200

        if(isExistsOnServer) {
            isSynced = await syncHeadSpvRecordToServer(idRecord, 'delete')
        } else {
            isSynced = true
        }
    }

    else if(isCreateMode || isUpdateMode) {
        const dbItem = useIdb(storeName);
        const getItemInLocal = await dbItem.getItem(idRecord);
        const getItemInServer = await getDataOnServer('head_spv/' + idRecord);

        const isLocalExists = Boolean(getItemInLocal?.id);
        const isServerExists = getItemInServer?.status === 200;

        if(isLocalExists && isServerExists) {

            const serverKeyValue = await getItemInServer.json();

            const isNameNotSame = serverKeyValue["head_name"] != getItemInLocal?.name;
            const isPhoneNotSame = serverKeyValue["head_phone"] != getItemInLocal?.phone;
            const isShiftNotSame = serverKeyValue["head_shift"] != getItemInLocal?.shift;
            const isDisabledNotSame = serverKeyValue["is_disabled"] != getItemInLocal?.disabled;

            let isAnyValueToUpdate = isNameNotSame || isPhoneNotSame || isShiftNotSame || isDisabledNotSame;

            if(isAnyValueToUpdate) {
                isSynced = await syncHeadSpvRecordToServer(idRecord, 'update')
            }

        }

        else if(isLocalExists && !isServerExists) {

            isSynced = await syncHeadSpvRecordToServer(idRecord, 'create');

        }
    }

    if(isSynced) {

        return true

    }

    return false
}