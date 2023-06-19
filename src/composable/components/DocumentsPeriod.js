import { findData, update, append, deleteDocument, getData } from "../../myfunction"
import getDatesArray from "../piece/getDaysArray"
import { dateMonth, dayPlus1, ymdTime, dayPlusOrMinus } from '../piece/dateFormat'
import { getHeadspvId } from './Headspv'
import { getSupervisorId } from './Supervisors'
import { getWarehouseId, warehouseNameBySpv } from './Warehouses'
import { postData } from "../../utils/sendDataToServer";

let lists = []
const storeName = "Document";

// get all documents by periode
export const getDocuments = async (periode1, periode2) => {
    lists = []
    let datesArray = getDatesArray(periode1, periode2)
    let bunchOfPromise = datesArray
                            .map((date) => findData({ store: "Document", criteria: { periode: date } }) )
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
    
    lists = lists.map((val) => {
        return val?.id === idDocument
            ? { ...val, ...objToUpdate }
            : val
    })
    
    await update({ 
        store: 'Document', 
        criteria: { id: idDocument }, 
        obj: objToUpdate 
    })
}
// finished document
export const finishedDocument = async () => {
    if(lists.length) {
        let filtered = lists.filter((rec) => rec?.isfinished)
        return documentsMapper(filtered)
    }
}
// unfinished document
export const unFinishedDocument = async () => {
    if(lists.length) {
        let filtered = lists.filter((rec) => !rec?.isfinished)
        return documentsMapper(filtered)
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
                    spvName: res[0]?.name, 
                    headName: res[1]?.name, 
                    warehouseName: res[2]?.name,
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
    await append({ store: "Document", obj: newRecord })
        .then((val) => {
            lists.unshift(val?.data)
        })
    return
}

export const isGenerateDocument = (idDocument, val) => {
    update({
        store: 'Document',
        criteria: {id: idDocument},
        obj: { isGenerate: val }
    })
}

export const removeDocument = async (idDocument) => {
    removeFromState(idDocument)
    await deleteDocument({ store: 'document', criteria: { id: idDocument }})
    return
}

export const findDocument = (idDocument) => {
    return lists.find((rec) => rec.id == idDocument)
}

export const getUncollectedDocuments = async () => {
    lists = await findData({ store: "Document", criteria: { status: 0 }})
    return true
}

export const getCollectedDocuments = async () => {
    lists = await findData({ store: "Document", criteria: { status: 1 }})
    return true
}

export const getApprovedDocuments = async () => {
    lists = await findData({ store: "Document", criteria: { status: 2, shared: false }})
    return true
}
export const getLastDate = () => {
    let res = lists.reduce(function(prev, current) {
        return (prev.periode > current.periode) ? prev.periode : current.periode
    })
    return dayPlus1(res)
}

export const documentsBySupervisor = async () => {
    /*expected result [
        {
        spvId: '',
        warehouseName: '', 
        spvName: '', 
        documents: [ id: '', title: 'warehousename 12-Sept' ],
        }
    ] */
    let result = []
    for(let list of lists) {
        // find index first, it may pushed before
        let findRes = result.findIndex((res) => res.spvId == list.name)
        // date in date month format
        let periode2 = dateMonth(list.periode)
        // get warehouse name by spv
        let warehouseNameSpv = warehouseNameBySpv(list.name)
        // get warehouse name
        let warehouseName = await getWarehouseId(list.warehouse).then((res) => res.name.replace('Gudang jadi ', ''))
        // get supervisor name
        let spv = await getSupervisorId(list.name)
        // if the spv id exists in result
        if(findRes > -1) {
            result[findRes].documents.push({ id: list.id, periode: list.periode, periode2: periode2, warehouseName, shift: list.shift })
        } 
        // if not
        else {
            result.push({
                spvId: list.name,
                spvName: spv?.name,
                warehouseName: warehouseNameSpv,
                phone: spv?.phone,
                documents: [{ id: list.id, periode: list.periode, periode2: periode2, warehouseName, shift: list.shift }]
            })
        }
    }
    return result.sort((a, b) => {
        let fa = a.spvId.toLowerCase(),
        fb = b.spvId.toLowerCase();

        if (fa < fb) {
            return -1;
        }
        if (fa > fb) {
            return 1;
        }
        return 0;
    })
}

export const documentMore2DaysBySpv = async (spvId) => {
    let docsBySupervisor = await documentsBySupervisor()
    let result = ""
    docsBySupervisor.forEach((val) => {
        if(val.documents && val.spvId == spvId) {
        // daftar laporan yang melebihi H+2 dari sekarang
        let sekarang = new Date().getTime()
        let listLaporan = []
        val.documents.forEach((val2) => {
            if(sekarang - val2.periode >= 172800000 ) {
                listLaporan.push(`${val2.periode2} Shift ${val2.shift} | Gudang ${val2?.warehouseName}%0a`)
            }
        })
        if(listLaporan.length > 0)
            result += `*${val.spvName} (${listLaporan.length} Dokumen)* :%0a${ listLaporan.join("") }%0a`
        }
    })
  return result;
}

export const allDocumentMore2Days = async () => {
    let docsBySupervisor = await documentsBySupervisor()
    let result = ""
    docsBySupervisor.forEach((val) => {
        if(val.documents) {
        // daftar laporan yang melebihi H+2 dari sekarang
        let sekarang = new Date().getTime()
        let listLaporan = []
        val.documents.forEach((val2) => {
            if(sekarang - val2.periode >= 172800000 ) {
                listLaporan.push(`${val2.periode2} Shift ${val2.shift} | Gudang ${val2?.warehouseName}%0a`)
            }
        })
        if(listLaporan.length > 0)
            result += `*${val.spvName} (${listLaporan.length} Dokumen)* :%0a${ listLaporan.join("") }%0a`
        }
    })
    return result
}

const removeFromState = (idDocument) => {
    lists = lists.filter((list) => list.id != idDocument)
}

export const collectDocument = async (idDocument, day) => {
    let time;
    if(day < 0) {
        time = ymdTime(dayPlusOrMinus('', day))
    } else {
        time = ymdTime()
    }
    removeFromState(idDocument)
    await updateDocument(idDocument, { collected: time, status: 1 })
    return
}

export const approveDocument = async (idDocument, day) => {
    let time;
    if(day < 0) {
        time = dayPlusOrMinus('', day)
    } else {
        time = ymdTime()
    }
    removeFromState(idDocument)
    await updateDocument(idDocument, { approval: time, status: 2 })
    return
}

export const unCollectDocument = async (idDocument) => {
    removeFromState(idDocument)
    await updateDocument(idDocument, { collected: false, status: 0 })
    return
}

export const ijinDocument = async (idDocument) => {
    removeFromState(idDocument)
    await updateDocument(idDocument, { 
        collected: 'Tidak masuk', 
        status: 2,
        shared: false,
        approval: 'Tidak masuk'
    })
    return
}

export const kosongDocument = async (idDocument) => {
    removeFromState(idDocument)
    await updateDocument(idDocument, { 
        collected: 'Laporan tidak ada', 
        status: 2,
        approval: 'Laporan tidak ada',
        shared: false,
    })
    return
}

export const shareDocument = async (idDocument) => {
    removeFromState(idDocument)
    await updateDocument(idDocument, { shared: ymdTime() })
    return
}

export const unApproveDocument = async (idDocument) => {
    removeFromState(idDocument)
    await updateDocument(idDocument, { approval: false, status: 1 })
    return
}

export const markDocumentFinished = async (idDocument, day, details) => {
    let time;
    if(day < 0) {
        time = dayPlusOrMinus('', day)
    } else {
        time = ymdTime()
    }
    removeFromState(idDocument)
    await updateDocument(idDocument, { ...details, finished: time, isfinished: true })
    return
}

export const getDocumentByPeriodeByWarehouseByShiftFromDb = (periode, warehouse, shift) => {
    return findData({ store: "Document", criteria: { periode, warehouse, shift} }).then((res) => res[0])
}

import { progressMessage2 } from "../../components/parts/Loader/state";
export async function syncDocumentToServer () {

    let allData = await getData({ store: storeName, withKey: true })

    // (v)approval, (v)baseReportFile, (v)collected, (v)finished, (v)generateReport
    // (v)head, (v)id, (v)isfinished, itemVariance, (v)name, parent, parentDocument
    // (v)periode, planOut, (v)shared, (v)shift, (v)status, (v)totalDo, totalItemKeluar
    // totalItemMoving, (v)totalKendaraan, totalProductNotFIFO, totalQTYIn
    // totalQTYOut, (v)totalWaktu, (v)warehouse
  
    for(let [index, datum] of allData.entries()) {
  
        let dataToSend = {
            "id": datum?.key,
            "collected": datum?.data?.collected || 0,
            "approval": datum?.data?.approval || 0,
            "status": datum?.data?.status || 0,
            "shared": datum?.data?.shared || 0,
            "finished": datum?.data?.finished || 0,
            "total_do": datum?.data?.totalDo || 0,
            "total_kendaraan": datum?.data?.totalKendaraan || 0,
            "total_waktu": datum?.data?.totalWaktu || 0,
            "base_report_file": datum?.data?.baseReportFile || 0,
            "is_finished": datum?.data?.isfinished || 0,
            "supervisor_id": datum?.data?.name || 0,
            "periode": datum?.data?.periode || 0,
            "shift": datum?.data?.shift || 0,
            "head_spv_id": datum?.data?.head || 0,
            "warehouse_id": datum?.data?.warehouse || 0,
            "is_generated_document": datum?.data?.generateReport || 0,
            "item_variance": datum?.data?.itemVariance || 0,
            "parent": datum?.data?.parent || 0,
            "parent_document": datum?.data?.parentDocument || 0,
            "plan_out": datum?.data?.planOut || 0,
            "total_item_keluar": datum?.data?.totalItemKeluar || 0,
            "total_item_moving": datum?.data?.totalItemMoving || 0,
            "total_product_not_FIFO": datum?.data?.totalProductNotFIFO || 0,
            "total_qty_in": datum?.data?.totalQTYIn || 0,
            "total_qty_out": datum?.data?.totalQTYOut || 0,
          }
  
      try {
        progressMessage2.value = `Mengirim data ${index} dari ${allData.length}`
        await postData('document', dataToSend);
  
      } catch(err) {
        
        // alert(err); 
        console.log(err)
        // return false;
  
  
      }
    }
    return true
  }