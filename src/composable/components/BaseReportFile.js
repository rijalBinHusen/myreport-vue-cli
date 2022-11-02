import { findData, update, append, deleteDocument } from "@/myfunction";
import { ref } from "vue";
import { dateMonth, ymdTime } from "../piece/dateFormat";
import getDaysArray from "../piece/getDaysArray";
import { getWarehouseId, lists as warehouseLists } from "./Warehouses";

export const lists = ref([])

export const getBaseReportFile = async (periode1, periode2) => {
    lists.value = []
    let datesArray = getDaysArray(periode1, periode2)
    for(let date of datesArray) {
        let records = await findData({
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
    if(lists.value) {
        return documentsMapper(lists.value)
    }
    return []
}

const documentsMapper = async (docs) => {
    let result = []
    if(docs) {
        for(let doc of docs) {
            let warehouseName = await getWarehouseId(doc.warehouse).then((res) => res.name)
            result.push({
                ...doc,
                warehouseName,
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
          warehouseName: getWarehouseName?.name,
        });
      }
    };
    return result;
}

export const findBaseReportFile = (id) => {
    return lists.value.find((val) => val.id == id)
}

export const updateBaseReport = async (id, obj) => {
    lists.value = lists.value.map((val) => {
        if(val.id == id) {
            return { ...val, ...obj}
        }
        return val
    })
    await update({ store: 'basereportfile', criteria: { id: id }, obj: obj })
    return true
}

export const addBaseReportFile = async (periode, warehouse) => {
    let record = { periode, 
                    warehouse,
                    fileName: false,
                    stock: false,
                    clock: false,
                    imported: false,
                }
    await append({ store: "BaseReportFile", obj: record })
            .then((val) => {
                lists.value.unshift(val?.data)
            })
    return
}

export const someRecordFinished = async (idRecord) => {
    await updateBaseReport(idRecord, { isRecordFinished: true })
    return
}

export const isRecordExistsByPeriodeAndWarehouse = (periode, idWarehouse) => {
    return lists.value.find((rec) => rec.periode == periode && rec.warehouse == idWarehouse && rec.imported)
}

export const addBaseReportFileManual = async (periode) => {
    for(let warehouse of warehouseLists) {
        await addBaseReportFile(ymdTime(periode), warehouse?.id)
    }
    return
}

export const removeBaseReport = async (idBaseReport) => {
    lists.value = lists.value.filter((rec) => rec.id !== idBaseReport)
    await deleteDocument({ store: 'BaseReportFile', criteria: { id: idBaseReport }})
    return
}