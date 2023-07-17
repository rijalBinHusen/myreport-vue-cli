


import { dateMonth, dayPlus1, ymdTime, dayPlusOrMinus } from '@/composable/piece/dateFormat'
import { getHeadspvId } from '@/pages/Headspv/Headspv'
import { getSupervisorId } from '@/pages/Supervisors/Supervisors'
import { getWarehouseId, warehouseNameBySpv } from '@/pages/Warehouses/Warehouses'
import { postData, deleteData, putData } from "@/utils/sendDataToServer";
import { useIdb } from "@/utils/localforage"

interface Document {
    id: string
    baseReportFile: string
    generateReport: boolean
    head: string
    isfinished:boolean
    name: string
    parent: string
    parentDocument: string
    shift: number
    warehouse: string
    approval: number
    collected: number
    finished: number
    itemVariance: number
    periode: number
    planOut: number
    shared: number
    status: number
    totalDo: number
    totalItemKeluar: number
    totalItemMoving: number
    totalKendaraan: number
    totalProductNotFIFO: number
    totalQTYIn: number
    totalQTYOut: number
    totalWaktu: number
}

type Partial<T> = {
  [P in keyof T]?: T[P];
};

type DocumentUpdate = Partial<Document>;
interface DocumentsMapped extends Document {
    spvName?: string
    headName?: string
    warehouseName?: string
    periode2?: string
    collected2?: string
    approval2?: string
    finished2?: string
}

let lists = <DocumentsMapped[]>[]
const storeName = "document";


export function Documents () {
    const db = useIdb(storeName);

    const addData = async (name: string, periode: number, shift: number, head: string, warehouse: string) => {
        let newRecord = {
            collected: 0,
            approval: 0,
            status: 0,
            shared: 0,
            finished: 0,
            totalDo: 0,
            totalKendaraan: 0,
            totalWaktu: 0,
            baseReportFile: "",
            isfinished: false,
            name,
            periode,
            shift,
            head,
            warehouse,
            generateReport: false,
            itemVariance: 0,
            parent: "",
            parentDocument: "",
            planOut: 0,
            totalItemKeluar: 0,
            totalItemMoving: 0,
            totalProductNotFIFO: 0,
            totalQTYIn: 0,
            totalQTYOut: 0,
        }
        // add data
        const insertedId = await db.createItem(newRecord);

        if(typeof insertedId !== 'undefined') {
            const mapIt = await documentsMapper({ id: insertedId, ...newRecord })
            lists.push(mapIt);
        }
        
    }

    const documentsMapper = async (doc: Document): Promise<DocumentsMapped> => {
        const spvName = await getSupervisorId(doc.name);
        const headName = await getHeadspvId(doc.head);
        const warehouseName = await getWarehouseId(doc.warehouse);
        const periode2 = dateMonth(doc.periode);
        const collected2 = dateMonth(doc.collected);
        const approval2 = dateMonth(doc.approval);
        const finished2 = dateMonth(doc.finished);
        
        return { 
            ...doc, spvName, 
            headName, 
            warehouseName,
            periode2,
            collected2,
            approval2,
            finished2,
        }
    }

    const getDocuments = async (periode1: number, periode2: number) => {
        lists.length = 0;
        const getDocs = await db.getItemsGreatEqualLowEqual('periode', periode1, 'periode', periode2);

        if(typeof getDocs !== 'undefined') {
            for(let doc of getDocs) {

                const mapIt = await documentsMapper({
                    baseReportFile: doc?.baseReportFile.toString(),
                    head: doc?.head.toString(),
                    id: doc?.id.toString(),
                    name: doc?.name.toString(),
                    parent: doc?.parent.toString(),
                    parentDocument: doc?.parentDocument.toString(),
                    approval: Number(doc?.approval),
                    collected: Number(doc?.collected),
                    finished: Number(doc?.finished),
                    itemVariance: Number(doc?.itemVariance),
                    periode: Number(doc?.periode),
                    planOut: Number(doc?.planOut),
                    shared: Number(doc?.shared),
                    shift: Number(doc?.shift),
                    status: Number(doc?.status),
                    totalDo: Number(doc?.totalDo),
                    totalItemKeluar: Number(doc?.totalItemKeluar),
                    totalItemMoving: Number(doc?.totalItemMoving),
                    totalKendaraan: Number(doc?.totalKendaraan),
                    totalProductNotFIFO: Number(doc?.totalProductNotFIFO),
                    totalQTYIn: Number(doc?.totalQTYIn),
                    totalQTYOut: Number(doc?.totalQTYOut),
                    totalWaktu: Number(doc?.totalWaktu),
                    generateReport: Boolean(doc?.generateReport),
                    isfinished: Boolean(doc?.isfinished),
                    warehouse: doc?.warehouse.toString(),
                });

                lists.push(mapIt)
            }
        }
    }

    const updateDocument = async (idDocument: string, objToUpdate: DocumentUpdate) => {

        const isNoValueToUpdate = Object.values(objToUpdate).length > 0;
    
        if(isNoValueToUpdate) return;

        const findIndex = lists.findIndex((rec) => rec?.id == idDocument);

        if(findIndex > -1) {
            const record = lists[findIndex];
            delete record.spvName;
            delete record.headName;
            delete record.warehouseName;
            delete record?.periode2;
            delete record?.collected2;
            delete record?.approval2;
            delete record.finished2;

            const updateRecord = { ...record, ...objToUpdate };
            const mapUpdateRecord = await documentsMapper(updateRecord);
            lists[findIndex] = mapUpdateRecord

        }
        
        await db.updateItem(idDocument, objToUpdate);
    }
    
    
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

// append document
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


  export async function syncDocumentRecordToServer (idRecord, mode) {

    if(typeof idRecord !== 'string') {
        alert("Id record document must be a string");
        return;
    }

    let record = await getDataByKey(storeName, idRecord);

    if(!record) {
        // dont do anything if record doesn't exist;
        return
    }

    // (v)approval, (v)baseReportFile, (v)collected, (v)finished, (v)generateReport
    // (v)head, (v)id, (v)isfinished, itemVariance, (v)name, parent, parentDocument
    // (v)periode, planOut, (v)shared, (v)shift, (v)status, (v)totalDo, totalItemKeluar
    // totalItemMoving, (v)totalKendaraan, totalProductNotFIFO, totalQTYIn
    // totalQTYOut, (v)totalWaktu, (v)warehouse
  
    let dataToSend = {
        "id": idRecord,
        "collected": record?.collected || 0,
        "approval": record?.approval || 0,
        "status": record?.status || 0,
        "shared": record?.shared || 0,
        "finished": record?.finished || 0,
        "total_do": record?.totalDo || 0,
        "total_kendaraan": record?.totalKendaraan || 0,
        "total_waktu": record?.totalWaktu || 0,
        "base_report_file": record?.baseReportFile || 0,
        "is_finished": record?.isfinished || 0,
        "supervisor_id": record?.name || 0,
        "periode": record?.periode || 0,
        "shift": record?.shift || 0,
        "head_spv_id": record?.head || 0,
        "warehouse_id": record?.warehouse || 0,
        "is_generated_document": record?.generateReport || 0,
        "item_variance": record?.itemVariance || 0,
        "parent": record?.parent || 0,
        "parent_document": record?.parentDocument || 0,
        "plan_out": record?.planOut || 0,
        "total_item_keluar": record?.totalItemKeluar || 0,
        "total_item_moving": record?.totalItemMoving || 0,
        "total_product_not_FIFO": record?.totalProductNotFIFO || 0,
        "total_qty_in": record?.totalQTYIn || 0,
        "total_qty_out": record?.totalQTYOut || 0,
        }

    try {

        if(mode === 'create') {
    
          await postData('document', dataToSend);
    
        } 
      
        else if(mode === 'update') {
    
            await putData('document/'+ idRecord, dataToSend)
    
        }

        else if (mode === 'delete') {

            await deleteData('document/'+ idRecord)
            
        }

    } catch(err) {
    
        const errorMessage = 'Failed to send document record id :' + idRecord +' to server with error message: ' + err;
        alert(errorMessage); 
        console.log(errorMessage)
        return false;


    }
    return true
  }