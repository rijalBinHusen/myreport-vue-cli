import { useIdb } from "../../utils/localforage";
import { ref } from "vue";
import { dateMonth, ymdTime } from "../../composable/piece/dateFormat";
import { getWarehouseId, lists as warehouseLists } from "../Warehouses/Warehouses";
import { postData, deleteData, putData } from "../../utils/sendDataToServer";

interface BaseReportFileInterface {
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

export const lists = ref<BaseReportFileInterface[]>([])
const storeName = "basereportfile";

export function BaseReportFile () {
    const db = useIdb(storeName);

    async function getBaseReportFile(periode1: number, periode2: number) {
        const getData = await db.getItemsByKeyGreaterOrEqualThanAndLowerOrEqualThan('periode', periode1, periode2);

        if(getData) {
            for (let datum of getData) {

                let dataToMap:BaseReportFileInterface = {
                    id: typeof datum?.id === 'string' ? datum?.id : 'yourId',
                    periode:  typeof datum?.periode === 'number' ? datum?.periode : 0,
                    fileName:  typeof datum?.fileName === 'string' ? datum?.fileName : 'yourId',
                    clock:  typeof datum?.clock === 'string' ? datum?.clock : 'yourId',
                    imported:  typeof datum?.imported === 'boolean' ? datum?.imported : false,
                    isRecordFinished:  typeof datum?.isRecordFinished === 'boolean' ? datum?.isRecordFinished : false,
                    stock:  typeof datum?.stock === 'string' ? datum?.stock : 'yourId',
                    warehouse:  typeof datum?.warehouse === 'string' ? datum?.warehouse : 'yourId',
                }

                const mapIt = await recordMapper(dataToMap);
                lists.value.push(mapIt);
            }
        }
    }

    async function recordMapper(record: BaseReportFileInterface) {

        const getWarehouse = await getWarehouseId(record?.warehouse);
        const periode2: string = typeof record.periode === 'string' ? record.periode : dateMonth(record.periode);

        return { ...record, warehouseName: getWarehouse?.name, periode2 }
    }

    
    function dateBaseReportFileImported () {
        let isPushed: number[] = []
        let result = []
        for(let doc of lists.value) {
            // if periode not pushed
            if(!isPushed.includes(doc?.periode) && doc?.imported) {
                result.push({
                    periode: doc?.periode,
                    periode2: doc?.periode2
                })
                isPushed.push(doc?.periode)
            }
        }
        return result
    }

    async function warehouseByDate (periode: number) {
        let result = [];
    
        for(let val of lists.value) {
          if (val.periode == periode && val.imported) {
            result.push({
              warehouse: val?.warehouse,
              warehouseName: val?.warehouseName,
            });
          }
        };

        return result;
    }

    async function findBaseReportFileById (id: string) {
        const findIndex = lists.value.findIndex((val) => val.id == id)
        
        if(findIndex > -1) {
            return lists.value[findIndex];
        }

        const getRecord = await db.getItem(id);
        const mapRecord = await recordMapper(getRecord);

        lists.value.push(mapRecord);
        return mapRecord
    }

    async function updateBaseReport (id: string, obj: BaseReportFileInterfaceForUpdate) { 
        const isNoValueToUpdate = Object.values(obj).length > 0;

        if(isNoValueToUpdate) return;

        const findIndex = lists.value.findIndex((rec) => rec?.id === id);

        if(findIndex > -1) {
            const record = lists.value[findIndex];
            delete record.warehouseName;
            delete record.periode2;
            
            const updateRecord = { ...record, ...obj };
            const mapUpdateRecord = await recordMapper(updateRecord)
            lists.value[findIndex] = mapUpdateRecord;
        }
        
        await db.updateItem(id, obj);
    }

    async function addBaseReportFile  (periode: number, warehouse: string) {
        let record = { periode, 
                        warehouse,
                        fileName: "",
                        stock: "",
                        clock: "",
                        imported: false,
                        isRecordFinished: false,
                    }

        const IdInserted = await db.createItem(record);
        if(typeof IdInserted === 'undefined') return;
        const mappedRecord = await recordMapper({ id: IdInserted, ...record})

        lists.value.push(mappedRecord);
    }

    async function someRecordFinished (idRecord: string) {
        await updateBaseReport(idRecord, { isRecordFinished: true });
    }

    function isRecordExistsByPeriodeAndWarehouse (periode: number, idWarehouse: string) {
        const findIndex = lists.value.findIndex((rec) => rec.periode == periode && rec.warehouse == idWarehouse && rec.imported)

        return findIndex > -1;
    }

    async function addBaseReportFileManual (periode: number) {
        for(let warehouse of warehouseLists) {
            await addBaseReportFile( ymdTime(periode), warehouse?.id )
        }
    }

    async function removeBaseReport (idBaseReport: string) {
        lists.value = lists.value.filter((rec) => rec.id !== idBaseReport);
        await db.removeItem(idBaseReport);
    }

    return {
        getBaseReportFile,
        dateBaseReportFileImported,
        warehouseByDate,
        findBaseReportFileById,
        updateBaseReport,
        addBaseReportFile,
        someRecordFinished,
        isRecordExistsByPeriodeAndWarehouse,
        addBaseReportFileManual,
        removeBaseReport
    }

}

import { progressMessage2 } from "../../components/parts/Loader/state";
export async function syncBaseFileToServer () {

    const db = useIdb(storeName);
    let allData = await db.getItems();
  
    for(let [index, datum] of allData.entries()) {
    //   clock, fileName, id, imported, periode, stock, warehouse

    const warehouseToSend = typeof datum?.warehouse === 'object' 
                                ? "false"
                                : datum?.warehouse;

      let dataToSend = {
        "id": datum?.key,
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
  
      } catch(err) {
  
        //   alert(err); 
        console.log(err)
        //   return false;
  
      }
    }
    return true;
  }

  
export async function syncBaseFileRecordToServer (idRecord: string, mode: string) {

    const db = useIdb(storeName);

    if(typeof idRecord !== 'string') {
        alert("Id record base report file must be a string");
        return;
    }

    let record = await db.getItem(idRecord);

    if(!record) {
        // dont do anything if record doesn't exist;
        return
    }

    //   clock, fileName, id, imported, periode, stock, warehouse

    const warehouseToSend = typeof record?.warehouse === 'object' 
                                ? record?.warehouse.id
                                : record?.warehouse;

    let dataToSend = {
        "id": idRecord,
        "periode": record?.periode || 0,
        "warehouse_id": warehouseToSend || 0,
        "file_name": record?.fileName || 0,
        "stock_sheet": record?.stock || 0,
        "clock_sheet": record?.clock || 0,
        "is_imported": record?.imported || 0,
        "is_record_finished": record?.isRecordFinished || false
    }

    try {

        if(mode === 'create') {
    
          await postData('base_file', dataToSend);
    
        } 
      
        else if(mode === 'update') {
    
            await putData('base_file/'+ idRecord, dataToSend)
    
        }

        else if (mode === 'delete') {

            await deleteData('base_file/'+ idRecord)
            
        }

    } catch(err) {

        const errorMessage = 'Failed to send base file record id :' + idRecord +' with error message: ' + err;
        alert(errorMessage); 
        console.log(errorMessage)
        return false;

    }
    return true;
  }