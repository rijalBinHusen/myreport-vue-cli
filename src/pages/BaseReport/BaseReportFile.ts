import { useIdb } from "../../utils/localforage";
import { ref } from "vue";
import { dateMonth, ymdTime } from "../../composable/piece/dateFormat";
import { getWarehouseById, lists as warehouseLists } from "../Warehouses/Warehouses";
import { postData, deleteData, putData, getData as getDataOnServer } from "../../utils/requestToServer";
import { baseClock } from "./BaseReportClock";
import { baseReportStock } from "./BaseReportStock"

export interface BaseReportFileInterface {
    clock: string
    fileName: string
    id: string
    imported: boolean
    isRecordFinished: boolean
    periode: number
    stock: string
    warehouse: string
    warehouseName?: string
    periode2?: string
}

interface BaseReportFileInterfaceForUpdate {
    clock?: string
    fileName?: string
    imported?: boolean
    isRecordFinished?: boolean
    periode?: number
    stock?: string
    warehouse?: string
}

export interface WarehouseByDate {
    warehouse: string
    warehouseName: string
}

export const lists = ref<BaseReportFileInterface[]>([])
const storeName = "basereportfile";

export function BaseReportFile() {
    const db = useIdb(storeName);
    const { removeClockByParent } = baseClock();
    const { removeStockByParent } = baseReportStock();

    async function getBaseReportFile(periode1: number, periode2: number) {
        // empty state
        lists.value.length = 0

        const getData = await db.getItemsByKeyGreaterOrEqualThanAndLowerOrEqualThan<BaseReportFileInterface>('periode', periode1, periode2);
        if (getData.length) {
            for (let datum of getData) {

                let dataToMap: BaseReportFileInterface = {
                    id: typeof datum?.id === 'string' ? datum?.id : 'yourId',
                    periode: typeof datum?.periode === 'number' ? datum?.periode : 0,
                    fileName: typeof datum?.fileName === 'string' ? datum?.fileName : 'yourId',
                    clock: typeof datum?.clock === 'string' ? datum?.clock : 'yourId',
                    imported: typeof datum?.imported === 'boolean' ? datum?.imported : false,
                    isRecordFinished: typeof datum?.isRecordFinished === 'boolean' ? datum?.isRecordFinished : false,
                    stock: typeof datum?.stock === 'string' ? datum?.stock : 'yourId',
                    warehouse: typeof datum?.warehouse === 'string' ? datum?.warehouse : 'yourId',
                }

                const mapIt = await recordMapper(dataToMap);
                lists.value.push(mapIt);
            }
        }
    }

    async function recordMapper(record: BaseReportFileInterface) {

        const getWarehouse = await getWarehouseById(record?.warehouse);
        const periode2: string = typeof record.periode === 'string' ? record.periode : dateMonth(record.periode);

        return { ...record, warehouseName: getWarehouse?.name, periode2 }
    }


    function dateBaseReportFileImported() {
        let isPushed: number[] = []
        let result = []
        for (let doc of lists.value) {
            // if periode not pushed
            if (!isPushed.includes(doc?.periode) && doc?.imported) {
                result.push({
                    periode: doc?.periode,
                    periode2: doc?.periode2
                })
                isPushed.push(doc?.periode)
            }
        }
        return result
    }

    function warehouseByDate(periode: number): WarehouseByDate[] {

        const result = <WarehouseByDate[]>[];

        for (let val of lists.value) {
            if (val.periode == periode && val.imported) {
                result.push({
                    warehouse: val?.warehouse,
                    warehouseName: val?.warehouseName || 'false',
                });
            }
        };

        return result;
    }

    async function findBaseReportFileById(id: string) {
        const findIndex = lists.value.findIndex((val) => val.id == id)

        if (findIndex > -1) {
            return lists.value[findIndex];
        }

        const getRecord = await db.getItem<BaseReportFileInterface>(id);
        if (getRecord === null) {
            return {
                id: '',
                clock: '',
                fileName: '',
                imported: false,
                isRecordFinished: false,
                periode: 0,
                stock: '',
                warehouse: '',
                periode2: ''
            }
        };
        const mapRecord = await recordMapper(getRecord);

        lists.value.push(mapRecord);
        return mapRecord
    }

    async function updateBaseReport(id: string, obj: BaseReportFileInterfaceForUpdate) {
        const isNoValueToUpdate = Object.values(obj).length === 0;

        if (isNoValueToUpdate) return;

        const findIndex = lists.value.findIndex((rec) => rec?.id === id);

        if (findIndex > -1) {
            const record = lists.value[findIndex];
            delete record.warehouseName;
            delete record.periode2;

            const updateRecord = { ...record, ...obj };
            const mapUpdateRecord = await recordMapper(updateRecord)
            lists.value[findIndex] = mapUpdateRecord;
        }

        await db.updateItem(id, obj);
    }

    async function addBaseReportFile(periode: number, warehouse: string) {
        let record = {
            periode,
            warehouse,
            fileName: "Not imported",
            stock: "Not imported",
            clock: "Not imported",
            imported: false,
            isRecordFinished: false,
        }

        const IdInserted = await db.createItem(record);
        if (typeof IdInserted === 'undefined') return;
        const mappedRecord = await recordMapper({ id: IdInserted, ...record })

        lists.value.push(mappedRecord);
    }

    async function someRecordFinished(idRecord: string) {
        await updateBaseReport(idRecord, { isRecordFinished: true });
    }

    function getBaseFileByPeriodeAndWarehouse(periode: number, idWarehouse: string) {
        const find = lists.value.find((rec) => rec.periode == periode && rec.warehouse == idWarehouse && rec.imported)

        return find;
    }

    async function addBaseReportFileManual(periode: number) {
        for (let warehouse of warehouseLists.value) {
            await addBaseReportFile(ymdTime(periode), warehouse?.id)
        }
    }

    async function removeBaseReport(idBaseReport: string) {
        lists.value = lists.value.filter((rec) => rec.id !== idBaseReport);
        await db.removeItem(idBaseReport);
    }

    async function removeBaseReportChilds(idBaseReport: string) {
        await removeClockByParent(idBaseReport);
        await removeStockByParent(idBaseReport);
        await updateBaseReport(idBaseReport, { 
            fileName: "Not imported",
            stock: "Not imported",
            clock: "Not imported",
            imported: false
        })
    }

    return {
        getBaseReportFile,
        dateBaseReportFileImported,
        warehouseByDate,
        findBaseReportFileById,
        updateBaseReport,
        addBaseReportFile,
        someRecordFinished,
        getBaseFileByPeriodeAndWarehouse,
        addBaseReportFileManual,
        removeBaseReport,
        removeBaseReportChilds
    }

}

import { progressMessage2 } from "../../components/parts/Loader/state";
export async function syncBaseFileToServer() {

    const db = useIdb(storeName);
    let allData = await db.getItems<BaseReportFileInterface>();

    for (let [index, datum] of allData.entries()) {
        //   clock, fileName, id, imported, periode, stock, warehouse

        const warehouseToSend = typeof datum?.warehouse === 'object'
            ? "false"
            : datum?.warehouse;

        let dataToSend = {
            "id": datum?.id,
            "periode": datum?.periode || 0,
            "warehouse_id": warehouseToSend || 0,
            "file_name": datum?.fileName || 0,
            "stock_sheet": datum?.stock || 0,
            "clock_sheet": datum?.clock || 0,
            "is_imported": datum?.imported || 0
        }

        try {
            progressMessage2.value = `Mengirim data ${index} dari ${allData.length}`
            await postData('base_file', dataToSend);

        } catch (err) {

            //   alert(err); 
            console.log(err)
            //   return false;

        }
    }
    return true;
}


export async function syncBaseFileRecordToServer(idRecord: string, mode: string) {

    const db = useIdb(storeName);

    if (typeof idRecord !== 'string') {
        alert("Id record base report file must be a string");
        return;
    }

    let record = await db.getItem<BaseReportFileInterface>(idRecord);

    if (!record) {
        // dont do anything if record doesn't exist;
        return
    }

    //   clock, fileName, id, imported, periode, stock, warehouse

    const warehouseToSend = typeof record?.warehouse === 'object'
        ? "false"
        : record?.warehouse;

    let dataToSend = {
        "id": idRecord,
        "periode": record?.periode,
        "warehouse_id": warehouseToSend,
        "file_name": record?.fileName || "Not imported",
        "stock_sheet": record?.stock || "Not imported",
        "clock_sheet": record?.clock || "Not imported",
        "is_imported": record?.imported || false,
        "is_record_finished": record?.isRecordFinished || false
    }

    try {

        if (mode === 'create') {

            await postData('base_file', dataToSend);

        }

        else if (mode === 'update') {

            await putData('base_file/' + idRecord, dataToSend)

        }

        else if (mode === 'delete') {

            await deleteData('base_file/' + idRecord)

        }

    } catch (err) {

        const errorMessage = 'Failed to send base file record id :' + idRecord + ' with error message: ' + err;
        // alert(errorMessage);
        console.log(errorMessage)
        return false;

    }
    return true;
}

export async function checkAndsyncBaseFileToServer(idRecord: string, mode: string) {

    if(typeof idRecord !== 'string') {
        alert("Id record base report file must be a string");
        return false
    }
  
    const isCreateMode = mode === 'create'; 
    const isUpdateMode = mode === 'update';
    const isDeleteMode = mode === 'delete';
  
    let isSynced = false;
  
    if(isDeleteMode) {
        // the server must be return 404
        const getOnServer = await getDataOnServer('base_file/' + idRecord);
  
        const isExistsOnServer = getOnServer?.status === 200
  
        if(isExistsOnServer) {
            let syncing = await syncBaseFileRecordToServer(idRecord, 'delete')
            isSynced = Boolean(syncing);
        } else {
            isSynced = true
        }
    }
  
    else if(isCreateMode || isUpdateMode) {
        const dbItem = useIdb(storeName);
        const getItemInLocal = await dbItem.getItem<BaseReportFileInterface>(idRecord);
        const getItemInServer = await getDataOnServer('base_file/' + idRecord);
  
        const isLocalExists = Boolean(getItemInLocal?.id);
        const isServerExists = getItemInServer?.status === 200;
  
        if(isLocalExists && isServerExists) {
  
            const serverKeyValue = await getItemInServer.json();
                        
            const isPeriodeNotSame = serverKeyValue["periode"] != getItemInLocal?.periode
            const isWarehouseNotSame = serverKeyValue["warehouse_id"] != getItemInLocal?.warehouse
            const isFileNameNotSame = serverKeyValue["file_name"] != getItemInLocal?.fileName
            const isStockNotSame = serverKeyValue["stock_sheet"] != getItemInLocal?.stock
            const isClockNotSame = serverKeyValue["clock_sheet"] != getItemInLocal?.clock
            const isImportedNotSame = serverKeyValue["is_imported"] != getItemInLocal?.imported  

            let isAnyValueToUpdate = isPeriodeNotSame
                                    || isWarehouseNotSame
                                    || isFileNameNotSame
                                    || isStockNotSame
                                    || isClockNotSame
                                    || isImportedNotSame
  
            if(isAnyValueToUpdate) {
  
              let syncing = await syncBaseFileRecordToServer(idRecord, 'update')
              isSynced = Boolean(syncing);
  
            }
  
        }
  
        else if(isLocalExists && !isServerExists) {
  
          let syncing = await syncBaseFileRecordToServer(idRecord, 'create')
          isSynced = Boolean(syncing);
  
        }
    }
  
    if(isSynced) {
  
        return true
  
    }
  
    return false
  }