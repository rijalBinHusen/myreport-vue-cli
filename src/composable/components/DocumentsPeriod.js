import { ref } from "vue"
import func from "../../myfunction"
import getDatesArray from "../piece/getDaysArray"

let lists = ref([])

// get all documents by periode
export const getDocuments = async (periode1, periode2) => {
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
}

// append document

// update document

// 