import { ref } from "vue"
import func from "../../myfunction"
import getDatesArray from "../piece/getDaysArray"
import { dateMonth } from '../piece/dateFormat'

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
                func.findData({ store: 'Supervisors', criteria: { id: rec.name } }),
                // find name head
                func.findData({ store: 'Headspv', criteria: { id: rec.head } }),
                // find name warehouse
                func.findData({ store: 'Warehouses', criteria: { id: rec.warehouse } })
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
                })
            })
        }
    }
    return result
}

// append document

// update document

// 