import { ymdTime, ddmmyyyy } from '@/composable/piece/dateFormat'
import { getSupervisorId } from '@/pages/Supervisors/Supervisors'
import { getHeadspvId } from '../Headspv/Headspv'
import { postData, deleteData as DeleteRecordOnServer, putData, getData as getDataOnServer } from "../../utils/requestToServer"
import { useIdb } from "@/utils/localforage"
import { progressMessage2 } from "../../components/parts/Loader/state";
import { ref } from 'vue'

let lists = ref([])
const storeName = "fieldproblem";
const db = useIdb(storeName);

const getFieldProblem = async () => {
    if(!lists.value.length) {
        // get all data from indexeddb
        // await getData({store: 'fieldproblem', limit: 50, desc: true, orderBy: 'id'})
        // .then((val) => lists = val)
        lists.value = await db.getItemsLimitDesc(50);
    }
    // delete data
}

export const addData = async (periode, supervisor, head, masalah, sumberMasalah, solusi, pic, dl) => {
    // add data
    // periode, supervisor, head, masalah, sumberMasalah, Solusi, PIC, dl
    let record = { 
        periode: ymdTime(periode),
        supervisor: supervisor,
        head: head,
        masalah: masalah, 
        sumberMasalah: sumberMasalah,
        solusi: solusi,
        pic: pic,
        dl: ymdTime(dl)
     };
     
     const insertedId = await db.createItem(record);

     if(insertedId === undefined) return;

     lists.value.unshift({ id: insertedId, ...record })
}

export const listsFieldProblem = async () => {
    await getFieldProblem()
    let result = []

    for (let list of lists.value) {
        let getSupervisor = await getSupervisorId(list.supervisor)
        let getHead = await getHeadspvId(list.head)
        result.push({
            ...list,
            supervisor: getSupervisor?.name,
            head: getHead?.name,
            periode: ddmmyyyy(list.periode, '-'),
            dl: ddmmyyyy(list.dl, '-')
        })
    }

    return result
}

export const getFieldProblemById = async (idFieldProblem) => {
    await getFieldProblem()
    return lists.value.find((rec) => rec.id === idFieldProblem)
}

export const updateData = async (idRecord, periode, supervisor, head, masalah, sumberMasalah, solusi, pic, dl) => {
    // add data
    // periode, supervisor, head, masalah, sumberMasalah, Solusi, PIC, dl
    let record = { 
        periode: ymdTime(periode),
        supervisor: supervisor,
        head: head,
        masalah: masalah, 
        sumberMasalah: sumberMasalah,
        solusi: solusi,
        pic: pic,
        dl: ymdTime(dl)
     };

    // update data
    await db.updateItem(idRecord, record);
    
    const findIndex = lists.value.findIndex((rec) => rec?.id === idRecord);

    if(findIndex > -1) lists.value[findIndex] = { id: idRecord, ...record  };
}

export const deleteData = async (idRecord) => {
    
    const findIndex = lists.value.findIndex((rec) => rec.id === idRecord)

    if(findIndex > -1) {
        lists.value.splice(findIndex, 1)
    }
    
    await db.removeItem(idRecord)
}

export async function syncFieldProblemToServer () {

    let allData = await db.getItems();

    if(allData.length === 0) return;
    // await getData({ store: storeName, withKey: true })
    
    // dl, head, id, masalah, periode, pic, solusi, sumberMasalah
    //    supervisor
    
  
    for(let [index, datum] of allData.entries()) {
  
        let dataToSend = {
            "id": datum?.id,
            "periode": datum?.periode || 0,
            "supervisor_id": datum?.supervisor || 0,
            "head_spv_id": datum?.head || 0,
            "masalah": datum?.masalah || 0,
            "sumber_masalah": datum?.sumberMasalah || 0,
            "solusi": datum?.solusi || 0,
            "pic": datum?.pic || 0,
            "dl": datum?.dl || 0
          }
  
      try {
        progressMessage2.value = `Mengirim data ${index} dari ${allData.length}`
        await postData('field_problem', dataToSend);
  
      } catch(err) {
        
        // alert(err); 
        console.log(err)
        // return false;
  
  
      }
    }
    return true
  }

export async function syncFieldProblemRecordToServer (idRecord, mode) {

    if(typeof idRecord !== 'string') {
        alert('Id record field problem must be a string');
        return;
    }

    let record = await db.getItem(idRecord);
    // await getDataByKey(storeName, idRecord);

    if(!record && mode != 'delete') {
        // dont do anything if record doesn't exist;
        return
    }

    // dl, head, id, masalah, periode, pic, solusi, sumberMasalah
    //    supervisor

    let dataToSend = {
        "id": idRecord,
        "periode": record?.periode || 0,
        "supervisor_id": record?.supervisor || 0,
        "head_spv_id": record?.head || 0,
        "masalah": record?.masalah || 0,
        "sumber_masalah": record?.sumberMasalah || 0,
        "solusi": record?.solusi || 0,
        "pic": record?.pic || 0,
        "dl": record?.dl || 0
        }

    try {

        if(mode === 'create') {

            await postData('field_problem', dataToSend);

        } 
        
        else if(mode === 'update') {

            await putData('field_problem/'+ idRecord, dataToSend)

        }

        else if (mode === 'delete') {

            await DeleteRecordOnServer('field_problem/'+ idRecord)
            
        }

    } catch(err) {

        const errorMessage = 'Failed to send field problem record id :' + idRecord +' with error message: ' + err;
        // alert(errorMessage); 
        console.log(errorMessage)
        return false;


    }

    return true
}


export async function checkAndsyncFieldProblemToServer(idRecord, mode) {

    if(typeof idRecord !== 'string') {
        alert("Id record field problem must be a string");
        return true
    }
  
    const isCreateMode = mode === 'create'; 
    const isUpdateMode = mode === 'update';
    const isDeleteMode = mode === 'delete';
  
    let isSynced = false;
  
    if(isDeleteMode) {
        // the server must be return 404
        const getOnServer = await getDataOnServer('field_problem/' + idRecord);
  
        const isExistsOnServer = getOnServer?.status === 200
  
        if(isExistsOnServer) {
            let syncing = await syncFieldProblemRecordToServer(idRecord, 'delete')
            isSynced = Boolean(syncing);
        } else {
            isSynced = true
        }
    }
  
    else if(isCreateMode || isUpdateMode) {
        const dbItem = useIdb(storeName);
        const getItemInLocal = await dbItem.getItem(idRecord);
        const getItemInServer = await getDataOnServer('field_problem/' + idRecord);
  
        const isLocalExists = Boolean(getItemInLocal?.id);
        const isServerExists = getItemInServer?.status === 200;
  
        if(isLocalExists && isServerExists) {
  
            const serverKeyValue = await getItemInServer.json();
            
            const isPeriodeNotSame = serverKeyValue["periode"] != getItemInLocal?.periode;
            const isSupervisorNotSame = serverKeyValue["supervisor_id"] != getItemInLocal?.supervisor;
            const isHeadSPVNotSame = serverKeyValue["head_spv_id"] != getItemInLocal?.head;
            const isMasalahNotSame = serverKeyValue["masalah"] != getItemInLocal?.masalah;
            const isSumberMasalahNotSame = serverKeyValue["sumber_masalah"] != getItemInLocal?.sumberMasalah;
            const isSolusiNotSame = serverKeyValue["solusi"] != getItemInLocal?.solusi;
            const isPICNotSame = serverKeyValue["pic"] != getItemInLocal?.pic;
            const isDLNotSame = serverKeyValue["dl"] != getItemInLocal?.dl;
  
            let isAnyValueToUpdate = isPeriodeNotSame 
                                    || isSupervisorNotSame
                                    || isHeadSPVNotSame
                                    || isMasalahNotSame
                                    || isSumberMasalahNotSame
                                    || isSolusiNotSame
                                    || isPICNotSame
                                    || isDLNotSame;
  
            if(isAnyValueToUpdate) {
  
              let syncing = await syncFieldProblemRecordToServer(idRecord, 'update')
              isSynced = Boolean(syncing);
  
            } else {

                isSynced = true
                
            }
  
        }
  
        else if(isLocalExists && !isServerExists) {
  
          let syncing = await syncFieldProblemRecordToServer(idRecord, 'create')
          isSynced = Boolean(syncing);
  
        }

        else {
          isSynced = true
        }
    }
  
    return isSynced
  }