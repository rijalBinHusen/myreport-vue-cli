import { append, getData, update, findData, deleteDocument, getDataByKey} from '@/myfunction'
import { ymdTime, ddmmyyyy } from '@/composable/piece/dateFormat'
import { getSupervisorId } from '@/pages/Supervisors/Supervisors'
import { getHeadspvId } from '../Headspv/Headspv'
import { postData, deleteData as DeleteRecordOnServer, putData } from "../../utils/sendDataToServer"

let lists = []
const storeName = "fieldproblem";

const getFieldProblem = async () => {
    if(!lists.length) {
        // get all data from indexeddb
        await getData({store: 'fieldproblem', limit: 50, desc: true, orderBy: 'id'})
        .then((val) => lists = val)
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

    await append({ store: "fieldProblem", obj: record })
    .then((val) => {
        if(lists) {
            lists.unshift(val?.data)
        }
      })
    return
}

export const listsFieldProblem = async () => {
    await getFieldProblem()
    let result = []

    for (let list of lists) {
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
    return lists.find((rec) => rec.id === idFieldProblem)
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
    await update({ store: "fieldProblem", criteria: { id: idRecord }, obj: record })
    // find Data
    await findData({ store: "fieldProblem", criteria: { id: idRecord } }).then((res) => {
        lists = lists.map((rec) => {
            if(rec.id === idRecord) {
                return res[0]
            }
            return rec
        })
    })
    return
}
export const deleteData = (idRecord) => {
    
    lists = lists.filter((rec) => rec.id !== idRecord)
    
    return deleteDocument({ store: 'fieldproblem', criteria: { id: idRecord} })
}


import { progressMessage2 } from "../../components/parts/Loader/state";
export async function syncFieldProblemToServer () {

    let allData = await getData({ store: storeName, withKey: true })
    
    // dl, head, id, masalah, periode, pic, solusi, sumberMasalah
    //    supervisor
    
  
    for(let [index, datum] of allData.entries()) {
  
        let dataToSend = {
            "id": datum?.key,
            "periode": datum?.data?.periode || 0,
            "supervisor_id": datum?.data?.supervisor || 0,
            "head_spv_id": datum?.data?.head || 0,
            "masalah": datum?.data?.masalah || 0,
            "sumber_masalah": datum?.data?.sumberMasalah || 0,
            "solusi": datum?.data?.solusi || 0,
            "pic": datum?.data?.pic || 0,
            "dl": datum?.data?.dl || 0
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

    let record = await getDataByKey(storeName, idRecord);

    if(!record) {
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
        alert(errorMessage); 
        console.log(errorMessage)
        return false;


    }
    return true
  }