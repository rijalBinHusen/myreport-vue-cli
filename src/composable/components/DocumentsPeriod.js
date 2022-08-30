import { ref } from "vue"
import func from "../../myfunction"
import getDatesArray from "../piece/getDaysArray"
import { dateMonth } from '../piece/dateFormat'
import { getHeadspvId } from './Headspv'
import { getSupervisorId } from './Supervisors'
import { getWarehouseId } from './Warehouses'

let lists = ref([])

// get all documents by periode
export const getDocuments = async (periode1, periode2) => {
    lists.value = []
    let datesArray = getDatesArray(periode1, periode2)
    for(let date of datesArray) {
        let records = await func.findData({
            store: "Document",
            criteria: { periode: date }
        })
        if(records) {
            lists.value = lists.value.concat(records)
        }
    }
    return true
}

export const listsOfDocuments = async () => {
    let result = []
    if(lists.value.length) {
        for (let rec of lists.value) {
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

// update document
export const updateDocument = async (idDocument, objToUpdate) => {
    await func.update({ 
        store: 'Document', 
        criteria: {id: idDocument }, 
        obj: objToUpdate 
    })
    
    lists.value = lists.value.map((val) => {
        return val?.id === idDocument
            ? { ...val, ...objToUpdate }
            : val
    })
}
// finished document
export const finishedDocument = async () => {
    return lists.value.length
        ? lists.value.filter((rec) => rec.finished)
        : []
}
// unfinished document