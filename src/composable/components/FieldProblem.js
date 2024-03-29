import { append, getData, update, findData, deleteDocument } from '@/myfunction'
import { ymdTime, ddmmyyyy } from '@/composable/piece/dateFormat'
import { getSupervisorId } from '@/composable/components/Supervisors'
import { getHeadspvId } from './Headspv'

let lists = []

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