import func from "../../myfunction"
import getDatesArray from "../piece/getDaysArray"
import { dateMonth } from '../piece/dateFormat'
import { getHeadspvId } from './Headspv'
import { getSupervisorId } from './Supervisors'
import { getWarehouseId } from './Warehouses'
import store from '@/store'
import { list } from "@firebase/storage"

let lists = []

// get all documents by periode
export const getDocuments = async (periode1, periode2) => {
    lists = []
    let datesArray = getDatesArray(periode1, periode2)
    let bunchOfPromise = datesArray
                            .map((date) => func.findData({ store: "Document", criteria: { periode: date } }) )
    let result = await Promise.all(bunchOfPromise)
    // result.filter((res) => res).fla
    lists = result.filter((val) => val).flat()
    return true
}

export const listsOfDocuments = () => {
    // await getDocuments()
    if(!lists.length) { return [] }
    return documentsMapper(lists)
}

// update document
export const updateDocument = async (idDocument, objToUpdate) => {
    await func.update({ 
        store: 'Document', 
        criteria: { id: idDocument }, 
        obj: objToUpdate 
    })
    
    lists = lists.map((val) => {
        return val?.id === idDocument
            ? { ...val, ...objToUpdate }
            : val
    })
}
// finished document
export const finishedDocument = async () => {
    if(lists.length) {
        let filtered = lists.filter((rec) => rec?.isfinished)
        return await documentsMapper(filtered)
    }
}
// unfinished document
export const unFinishedDocument = async () => {
    if(lists.length) {
        let filtered = lists.filter((rec) => !rec?.isfinished)
        return await documentsMapper(filtered)
    }
}

const documentsMapper = async (docs) => {
    let result = []
    if(docs) {
        for (let rec of docs) {
            let getName = [
                // find name supervisor
                getSupervisorId(rec.name),
                // find name head
                getHeadspvId(rec.head),
                // find name warehouse
                getWarehouseId(rec.warehouse)
            ]
            await Promise.all(getName).then((res) => {
                result.push({ 
                    ...rec, 
                    spvName: res[0][0]?.name, 
                    headName: res[1][0]?.name, 
                    warehouseName: res[2][0]?.name,
                    periode2: isNaN(rec.periode) ? rec.periode : dateMonth(rec.periode),
                    collected2: isNaN(rec.collected) ? rec.collected : dateMonth(rec.collected),
                    approval2: isNaN(rec.approval) ? rec.approval : dateMonth(rec.approval),
                    finished2: isNaN(rec.finished) ? rec.finished : dateMonth(rec.finished),
                })
            })
        }
    }
    return result
}


// append document
export const addData = async (name, periode, shift, head, warehouse) => {
    let newRecord = {
        collected: false,
        approval: false,
        status: 0,
        shared: false,
        finished: false,
        totalDo: false,
        totalKendaraan: false,
        totalWaktu: false,
        baseReportFile: false,
        isfinished: false,
        name,
        periode,
        shift,
        head,
        warehouse,
    }
    // add data
    await func.append({ store: "Document", obj: newRecord })
        .then((val) => {
            lists.unshift(val?.data)
            store.commit('Document/append', val.data)
        })
    return
}

export const isGenerateDocument = (idDocument, val) => {
    func.update({
        store: 'Document',
        criteria: {id: idDocument},
        obj: { isGenerate: val }
    })
}

export const removeDocument = async (idDocument) => {
    await func.deleteDocument({ store: 'document', criteria: { id: idDocument }})
    lists = lists.filter((list) => list.id != idDocument)
    return
}

export const findDocument = (idDocument) => {
    return lists.find((rec) => rec.id == idDocument)
}