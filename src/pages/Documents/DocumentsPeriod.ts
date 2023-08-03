import { ref } from 'vue'
import { dateMonth, dayPlus1, ymdTime, dayPlusOrMinus } from '@/composable/piece/dateFormat'
import { getHeadspvId, headspvByShift } from '@/pages/Headspv/Headspv'
import { getSupervisorId } from '@/pages/Supervisors/Supervisors'
import { getWarehouseById, warehouseNameBySpv, lists as warehouseLists } from '@/pages/Warehouses/Warehouses'
import { postData, deleteData, putData } from "@/utils/sendDataToServer";
import { useIdb } from "@/utils/localforage"
import { BaseReportFile } from "@/pages/BaseReport/BaseReportFile";

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
    approval: number|string
    collected: number|string
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

export type DocumentUpdate = Partial<Document>;

export interface DocumentsMapped extends Document {
    spvName?: string
    headName?: string
    warehouseName?: string
    periode2?: string
    collected2?: string
    approval2?: string
    finished2?: string
}

export let lists = ref(<DocumentsMapped[]>[])
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
            lists.value.push(mapIt);
        }
        
    }

    const documentsMapper = async (doc: Document): Promise<DocumentsMapped> => {
        const spv = await getSupervisorId(doc.name);
        const head = await getHeadspvId(doc.head);
        const warehouseiInfo = await getWarehouseById(doc.warehouse);
        const warehouseName = warehouseiInfo.name;
        const periode2 = dateMonth(doc.periode);
        const finished2 = dateMonth(doc.finished);
        const approval2 = typeof doc.approval === 'number' ? dateMonth(doc.approval) : doc.approval; 
        const collected2 = typeof doc.collected === 'number' ? dateMonth(doc.collected) : doc.collected;
        
        return { 
            ...doc, 
            spvName: spv.name, 
            headName: head.name, 
            warehouseName: warehouseName,
            periode2,
            collected2,
            approval2,
            finished2,
        }
    }

    const getDocuments = async (periode1: number, periode2: number) => {
        lists.value.length = 0;
        const getDocs = await db.getItemsGreatEqualLowEqual<Document>('periode', periode1, 'periode', periode2);

        if(typeof getDocs !== 'undefined') {
            for(let doc of getDocs) {

                const mapIt = await documentsMapper(doc);

                lists.value.push(mapIt)
            }
        }
    }

    const updateDocument = async (idDocument: string, objToUpdate: DocumentUpdate) => {

        const isNoValueToUpdate = Object.values(objToUpdate).length === 0;
    
        if(isNoValueToUpdate) return;

        const findIndex = lists.value.findIndex((rec) => rec?.id == idDocument);

        if(findIndex > -1) {
            const record = lists.value[findIndex];
            delete record.spvName;
            delete record.headName;
            delete record.warehouseName;
            delete record.periode2;
            delete record.collected2;
            delete record.approval2;
            delete record.finished2;

            const updateRecord = { ...record, ...objToUpdate };
            const mapUpdateRecord = await documentsMapper(updateRecord);
            lists.value[findIndex] = mapUpdateRecord

        }
        
        await db.updateItem(idDocument, objToUpdate);
    }

    const isGenerateDocument = async (idDocument: string, generateReport: boolean) => {
        await updateDocument(idDocument, { generateReport })
    }

    const removeDocument = async (idDocument: string) => {
        const findIndex = lists.value.findIndex((rec) => rec?.id === idDocument);

        if(findIndex > -1) {
            lists.value.splice(findIndex, 1);
        }
        
        await db.removeItem(idDocument);
    }

    const findDocument = async (idDocument: string): Promise<DocumentsMapped|undefined> => {
        const findIndex = lists.value.findIndex((rec) => rec.id == idDocument)

        if(findIndex > -1) {
            return lists.value[findIndex];
        }

        const getData = await db.getItem<Document>(idDocument);

        if(getData === null) return;

        const mapIt = await documentsMapper(getData);
        return mapIt

    }
    
    const getUncollectedDocuments = async () => {
        // empty state
        lists.value.length = 0;

        const getData = await db.getItemsByKeyValue<Document>('status', 0);

        if(getData.length === 0) return;

        for(let datum of getData) {
            const mapIt = await documentsMapper(datum);
            lists.value.push(mapIt)
        }
    }
    
    const getCollectedDocuments = async () => {
        // empty state
        lists.value.length = 0;

        const getData = await db.getItemsByKeyValue<Document>('status', 1);

        if(getData.length === 0) return;

        for(let datum of getData) {
            const mapIt = await documentsMapper(datum);
            lists.value.push(mapIt)
        }
    }
    
    const getApprovedDocuments = async () => {
        // empty state
        lists.value.length = 0;

        const getData = await db.getItemsByTwoKeyValue<Document>('status', 2, 'shared', 0);

        if(getData.length === 0) return;

        for(let datum of getData) {
            const mapIt = await documentsMapper(datum);
            lists.value.push(mapIt)
        }
    }

    const getLastDate = () => {
        let res = lists.value.reduce((n = 0, { periode }) =>  n > periode ? n : periode, 0)
        return dayPlus1(res)
    }

    const documentsBySupervisor = async () => {
        /*expected result [
            {
            spvId: '',
            warehouseName: '', 
            spvName: '', 
            documents: [ id: '', title: 'warehousename 12-Sept' ],
            }
        ] */
        let result = []

        for(let list of lists.value) {
            // find index first, it may pushed before
            let findRes = result.findIndex((res) => res.spvId == list.name)
            
            let spv = await getSupervisorId(list.name)
            let warehouseName = await warehouseNameBySpv(list.name);
            // if the spv id exists in result
            if(findRes > -1) {
                result[findRes].documents.push({ 
                    id: list.id, 
                    periode: list.periode, 
                    periode2: list.periode2,
                    warehouseName: list.warehouseName?.replace('Gudang jadi', ''), 
                    shift: list.shift 
                })
            } 
            // if not
            else {
                result.push({
                    spvId: list.name,
                    spvName: list.spvName,
                    warehouseName,
                    phone: spv?.phone,
                    documents: [{ 
                        id: list.id, 
                        periode: list.periode, 
                        periode2: list.periode2, 
                        warehouseName: list.warehouseName?.replace('Gudang jadi', ''), 
                        shift: list.shift 
                    }]
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

    const documentMore2DaysBySpv = async (spvId: string) => {
        let docsBySupervisor = await documentsBySupervisor()
        let result = ""
        docsBySupervisor.forEach((val) => {
            if(val.documents && val.spvId == spvId) {
            // daftar laporan yang melebihi H+2 dari sekarang
            let sekarang = new Date().getTime()
            let listLaporan: string[] = []
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

    const allDocumentMore2Days = async () => {
        let docsBySupervisor = await documentsBySupervisor()
        let result = ""
        docsBySupervisor.forEach((val) => {
            if(val.documents) {
            // daftar laporan yang melebihi H+2 dari sekarang
            let sekarang = new Date().getTime()
            let listLaporan: string[] = []
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

    const removeFromState = (idDocument: string) => {
        lists.value = lists.value.filter((list) => list.id != idDocument)
    }    

    const collectDocument = async (idDocument: string, day: number) => {
        let time;
        if(day < 0) {
            time = ymdTime(dayPlusOrMinus('', day))
        } else {
            time = ymdTime()
        }

        removeFromState(idDocument);

        await updateDocument(idDocument, { collected: time, status: 1 })
    }

    const approveDocument = async (idDocument: string, day: number) => {
        let time;
        if(day < 0) {
            time = dayPlusOrMinus('', day)
        } else {
            time = ymdTime()
        }

        removeFromState(idDocument)

        await updateDocument(idDocument, { approval: time, status: 2 })
    }

    const unCollectDocument = async (idDocument: string) => {

        removeFromState(idDocument)
        await updateDocument(idDocument, { collected: 0, status: 0 })
        
    }

    const ijinDocument = async (idDocument: string) => {
        
        removeFromState(idDocument)
        
        await updateDocument(idDocument, { 
            collected: 'Tidak masuk', 
            status: 2,
            shared: 0,
            approval: 'Tidak masuk'
        })
    }

    const kosongDocument = async (idDocument: string) => {
        removeFromState(idDocument)

        await updateDocument(idDocument, { 
            collected: 'Laporan tidak ada', 
            status: 2,
            approval: 'Laporan tidak ada',
            shared: 0,
        })
    }

    const shareDocument = async (idDocument: string) => {

        removeFromState(idDocument)
        await updateDocument(idDocument, { shared: ymdTime() })

    }

    const unApproveDocument = async (idDocument: string) => {

        removeFromState(idDocument)
        await updateDocument(idDocument, { approval: 0, status: 1 })

    }

    const markDocumentFinished = async (idDocument: string, day: number, details: DocumentUpdate) => {
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

    const getDocumentByPeriodeByWarehouseByShift = async (periode: number, warehouse: string, shift: 1|2|3): Promise<DocumentsMapped|undefined> => {
        let findRec = lists.value.find((rec) => rec.periode === periode && rec.warehouse === warehouse && rec.shift === shift);

        if(typeof findRec === 'undefined') {

            const getRecord = await db.getItemsByThreeKeyValue<Document>('periode', periode, 'warehouse', warehouse, 'shift', shift);
            if(getRecord.length === 0) return;
            const mapIt = await documentsMapper(getRecord[0]);
            findRec = mapIt;

        }

        return findRec;
    }

    const addDocumentsGroup = async (periode: number) => {
        const { addBaseReportFile } = BaseReportFile();

        for(let warehouse of warehouseLists.value) {
            if(!warehouse?.disabled) {
                await addBaseReportFile(periode, warehouse.id);

                for(let spvId of warehouse.supervisors) {
                    const spvInfo = await getSupervisorId(spvId)
                    const headSpv = headspvByShift(spvInfo.shift);
                    if(!spvInfo.disabled) {
                        await addData(spvId, periode, spvInfo.shift, headSpv.id, warehouse.id);
                    }
                }
            }
        }
    }
    
    return {
        addData,
        getDocuments,
        updateDocument,
        isGenerateDocument,
        removeDocument,
        findDocument,
        getUncollectedDocuments,
        getCollectedDocuments,
        getApprovedDocuments,
        getLastDate,
        documentsBySupervisor,
        documentMore2DaysBySpv,
        allDocumentMore2Days,
        collectDocument,
        approveDocument,
        unCollectDocument,
        ijinDocument,
        kosongDocument,
        shareDocument,
        unApproveDocument,
        markDocumentFinished,
        getDocumentByPeriodeByWarehouseByShift,
        addDocumentsGroup
    }
          
}

import { progressMessage2 } from "../../components/parts/Loader/state";
export async function syncDocumentToServer () {
    const db = useIdb(storeName);

    let allData = await db.getItems<Document>();

    // (v)approval, (v)baseReportFile, (v)collected, (v)finished, (v)generateReport
    // (v)head, (v)id, (v)isfinished, itemVariance, (v)name, parent, parentDocument
    // (v)periode, planOut, (v)shared, (v)shift, (v)status, (v)totalDo, totalItemKeluar
    // totalItemMoving, (v)totalKendaraan, totalProductNotFIFO, totalQTYIn
    // totalQTYOut, (v)totalWaktu, (v)warehouse
  
    for(let [index, datum] of allData.entries()) {
  
        let dataToSend = {
            "id": datum?.id,
            "collected": datum?.collected || 0,
            "approval": datum?.approval || 0,
            "status": datum?.status || 0,
            "shared": datum?.shared || 0,
            "finished": datum?.finished || 0,
            "total_do": datum?.totalDo || 0,
            "total_kendaraan": datum?.totalKendaraan || 0,
            "total_waktu": datum?.totalWaktu || 0,
            "base_report_file": datum?.baseReportFile || 0,
            "is_finished": datum?.isfinished || 0,
            "supervisor_id": datum?.name || 0,
            "periode": datum?.periode || 0,
            "shift": datum?.shift || 0,
            "head_spv_id": datum?.head || 0,
            "warehouse_id": datum?.warehouse || 0,
            "is_generated_document": datum?.generateReport || 0,
            "item_variance": datum?.itemVariance || 0,
            "parent": datum?.parent || 0,
            "parent_document": datum?.parentDocument || 0,
            "plan_out": datum?.planOut || 0,
            "total_item_keluar": datum?.totalItemKeluar || 0,
            "total_item_moving": datum?.totalItemMoving || 0,
            "total_product_not_FIFO": datum?.totalProductNotFIFO || 0,
            "total_qty_in": datum?.totalQTYIn || 0,
            "total_qty_out": datum?.totalQTYOut || 0,
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


  export async function syncDocumentRecordToServer (idRecord: string, mode: string) {

    if(typeof idRecord !== 'string') {
        alert("Id record document must be a string");
        return;
    }

    const db = useIdb(storeName);

    let record = await db.getItem<Document>(idRecord);
    // getDataByKey(storeName, idRecord);

    if(record === null) {
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
        // alert(errorMessage); 
        console.log(errorMessage)
        return false;


    }
    return true
  }