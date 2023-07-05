import { useIdb } from "../../utils/localforage";
import { ref } from "vue";
import { dateMonth, ymdTime } from "../../composable/piece/dateFormat";
import { getWarehouseId, lists as warehouseLists } from "../../composable/components/Warehouses";
import { postData, deleteData, putData } from "../../utils/sendDataToServer";

export const lists = ref([])
const storeName = "basereportfile";

export class BaseReportFile {
    db = useIdb(storeName);

    async getBaseReportFile(periode1, periode2) {
        const getData = await this.db.getItemsByKeyGreaterOrEqualThanAndLowerOrEqualThan('periode', periode1, periode2);

        if(getData) {
            for (let datum of getData) {
                const mapIt = await this.recordMapper(datum);
                lists.value.push(mapIt);
            }
        }
    }

    async recordMapper(record) {
        const getWarehouse = await getWarehouseId(record?.warehouse);
        const periode2 = isNaN(doc.periode) ? doc.periode : dateMonth(doc.periode);

        return { ...record, warehouseName: getWarehouse?.name, periode2 }
    }

    
    dateBaseReportFileImported () {
        let isPushed = []
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

    async warehouseByDate (periode) {
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

    findBaseReportFileById = (id) => {
        return lists.value.find((val) => val.id == id)
    }

    async updateBaseReport (id, obj) { 
        const findIndex = lists.value.findIndex((rec) => rec?.id === id);

        if(findIndex > -1) {
            const record = lists.value[findIndex];
            lists.value[findIndex] = { ...record, ...obj }
        }
        
        await this.db.updateItem(id, obj)
    }

    async addBaseReportFile  (periode, warehouse) {
        let record = { periode, 
                        warehouse,
                        fileName: false,
                        stock: false,
                        clock: false,
                        imported: false,
                    }

        const recordInserted = await this.db.createItem(record);

        lists.value.push(recordInserted);
    }

    async someRecordFinished (idRecord) {
        await this.db.updateItem(idRecord, { isRecordFinished: true })
    }

    isRecordExistsByPeriodeAndWarehouse (periode, idWarehouse) {
        const findIndex = lists.value.findIndex((rec) => rec.periode == periode && rec.warehouse == idWarehouse && rec.imported)

        return findIndex > -1;
    }

    async addBaseReportFileManual (periode) {
        for(let warehouse of warehouseLists) {
            await this.addBaseReportFile( ymdTime(periode), warehouse?.id )
        }
    }

    async removeBaseReport (idBaseReport) {
        lists.value = lists.value.filter((rec) => rec.id !== idBaseReport);
        await this.db.removeItem(idBaseReport);
    }

}

import { progressMessage2 } from "../../components/parts/Loader/state";
export async function syncBaseFileToServer () {

    let allData = await getData({ store: storeName, withKey: true })
  
    for(let [index, datum] of allData.entries()) {
    //   clock, fileName, id, imported, periode, stock, warehouse

    const warehouseToSend = typeof datum?.data?.warehouse === 'object' 
                                ? datum?.data?.warehouse.id
                                : datum?.data?.warehouse;

      let dataToSend = {
        "id": datum?.key,
        "periode": datum?.data?.periode || 0,
        "warehouse_id": warehouseToSend || 0,
        "file_name": datum?.data?.fileName || 0,
        "stock_sheet": datum?.data?.stock || 0,
        "clock_sheet": datum?.data?.clock || 0,
        "is_imported": datum?.data?.imported || 0
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

  
export async function syncBaseFileRecordToServer (idRecord, mode) {

    if(typeof idRecord !== 'string') {
        alert("Id record base report file must be a string");
        return;
    }

    let record = await getDataByKey(storeName, idRecord);

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