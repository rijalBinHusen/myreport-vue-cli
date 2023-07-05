import { getData, update, append, getDataByKey } from '../../myfunction'
import { postData, deleteData, putData } from "../../utils/sendDataToServer"

export let lists = []
const storeName = "headspv";

export const getHeadspv = async () => {
    lists = []
    lists = await getData({ store: 'Headspv', orderBy: 'id', desc: true })
    return true
}

export const getHeadspvId = async (headId) => {
    if(!lists.length) {
        await getHeadspv()
    }
    return lists.find((rec) => rec?.id === headId)
}

export const updateHeadspv = async (idHeadspv, objectToUpdate) =>{
  //idb
  await update({ store: "Headspv", criteria: { id: idHeadspv}, obj : objectToUpdate })
  lists = lists.map((val) => {
    if(val.id == idHeadspv) {
        return { ...val, ...objectToUpdate }
    }
    return val
  })
  return true
}

export const addHeadspv = async (name, phone) => {
    await append({ store: 'Headspv', obj: { name, phone, disabled: true, shift: 1 }})
            .then((val) => {
                if(lists.length) {
                    lists = lists.concat(val.data)
                }
            })
    return;
}

export const headspvEnabled = () => {
    return lists.filter((val) => !val.disabled);
}

export const headspvByShift = (shift) => {
let rec = lists.find((val) => val.shift == shift);
    return rec && rec.name && !rec?.disabled
        ? rec
        : {
            name: "Vacant",
            phone: "Not found",
        };
}
  

import { progressMessage2 } from "../../components/parts/Loader/state";
export async function syncHeadSpvToServer () {

    let allData = await getData({ store: storeName, withKey: true })
    
    //disabled, id, name, phone, shift
    
  
    for(let [index, datum] of allData.entries()) {
  
        let dataToSend = {
            "id": datum?.key,
            "head_name": datum?.data?.name || 0,
            "head_phone": datum?.data?.phone || 0,
            "head_shift": datum?.data?.shift || 0,
            "is_disabled": datum?.data?.disabled || 0
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

    let record = await getDataByKey(storeName, idRecord)

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
        alert(errorMessage); 
        console.log(errorMessage)
        return false;

    }

    return true
  }