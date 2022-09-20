import func from "@/myfunction";
import { ref } from "vue";
import { dateMonth } from "../piece/dateFormat";
import getDaysArray from "../piece/getDaysArray";
import { getWarehouseId } from "./Warehouses";

const lists = ref([])

export const getBaseReportFile = async (periode1, periode2) => {
    lists.value = []
    let datesArray = getDaysArray(periode1, periode2)
    for(let date of datesArray) {
        let records = await func.findData({
            store: "BaseReportFile",
            criteria: { periode: date }
        })
        if(records) {
            lists.value = lists.value.concat(records)
        }
    }
    return true
}

export const listsAllBaseReportFile = async () => {
    return documentsMapper(lists.value)
}

const documentsMapper = async (docs) => {
    let result = []
    if(docs) {
        for(let doc of docs) {
            let getWarehouseName = await getWarehouseId(doc.warehouse)
            result.push({
                ...doc,
                warehouseName: getWarehouseName[0]?.name,
                periode2: isNaN(doc.periode) ? doc.periode : dateMonth(doc.periode),
            })
        }
    }
    return result
}

export const dateBaseReportFileImported = () => {
    let isPushed = []
    let result = []
    for(let doc of lists.value) {
        // if periode not pushed
        if(!isPushed.includes(doc?.periode) && doc?.imported) {
            result.push({
                periode: doc?.periode,
                periode2: dateMonth(doc?.periode)
            })
            isPushed.push(doc?.periode)
        }
    }
    return result
}

export const warehouseByDate = async (periode) => {
    let result = [];

    for(let val of lists.value) {
      if (val.periode == periode && val.imported) {

        let getWarehouseName = await getWarehouseId(val.warehouse)
        result.push({
          warehouse: val?.warehouse,
          warehouseName: getWarehouseName[0]?.name,
        });
      }
    };
    return result;
}