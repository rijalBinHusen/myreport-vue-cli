import { getSupervisorId } from '../Supervisors/Supervisors'
import { useIdb } from '@/utils/localforage';

interface Warehouse {
    disabled: boolean
    group: string
    id: string
    isGrouped: boolean
    name: string
    supervisors: string[]
}

type Partial<T> = {
    [P in keyof T]?: T[P]
}

type WarehouseUpdate = Partial<Warehouse>;

export let lists = ref(<Warehouse[]>[])
const storeName = "warehouses";
const db = useIdb(storeName);

export const getWarehouses = async () => {
    lists.value.length = 0
    lists.value = await db.getItems<Warehouse>();
}

export const getWarehouseById = async (warehouseId: string):Promise<Warehouse> => {
    const findIndex = lists.value.findIndex((rec) => rec.id == warehouseId)

    if(findIndex > -1) {
        return lists.value[findIndex];
    }

    const getData = await db.getItem<Warehouse>(warehouseId);

    if(getData !== null) {
        return getData
    }

    return { id: 'Not found', disabled: false, group: '', isGrouped: false, name: 'Not found', supervisors: [] };
    
}

export const addWarehouse = async (warehouseName: string) => {
    let record = {
        name: warehouseName,
        disabled: false,
        group: '',
        isGrouped: false,
        supervisors: []
    }
    const insertedId = await db.createItem(record)
    
    if(typeof insertedId !== 'undefined') {
        lists.value.push({ id: insertedId, ...record })
    }
}

export const updateWarehouse = async (idWarehouse: string, objToUpdate: WarehouseUpdate) => {
    // payload = {id: 123, supervisors: [] }
    const findIndex = lists.value.findIndex((rec) => rec?.id === idWarehouse);

    if(findIndex > -1) {
        let record = lists.value[findIndex];
        let updateRecord = { ...record, objToUpdate};
        lists.value[findIndex] = updateRecord;
    }
    
    await db.updateItem(idWarehouse, objToUpdate)
}

export const warehouseNameBySpv = (spvId: string) => {
    let result:string[] = []
    lists.value.forEach((val) => {
        if(val.supervisors.includes(spvId)) {
            result.push(val?.name.replace('Gudang jadi ', ''))
        }
    })
    return result.join(" & ")
}

export const disableWarehouse = async (idWarehouse: string, disabled: boolean) => {
    await updateWarehouse(idWarehouse, { disabled })
}

export const getSupervisorShift1ByWarehouse = async (idWarehouse: string) => {
    let warehouse = lists.value.find((rec) => rec.id == idWarehouse && rec);

    if(typeof warehouse === 'undefined') return;

    for(let spv of warehouse.supervisors) {
        const getSpv = await getSupervisorId(spv);
        if(getSpv && !getSpv.disabled && getSpv.shift == 1) {
            return getSpv;
        }
    }
}


import { progressMessage2 } from "../../components/parts/Loader/state";
import { postData, putData, deleteData } from "../../utils/sendDataToServer";
import { ref } from 'vue';
export async function syncWarehouseToServer () {

    let allData = await db.getItems<Warehouse>();
    // getData({ store: storeName, withKey: true })
    //group, id, isGrouped, name, supervisors
  
    for(let [index, datum] of allData.entries()) {
  
        let dataToSend = {
            "id": datum?.id,
            "warehouse_name": datum?.name || 0,
            "warehouse_group": datum?.group || 0,
            "warehouse_supervisors": datum?.supervisors.toString()
        }
  
      try {
        progressMessage2.value = `Mengirim data ${index} dari ${allData.length}`
        await postData('warehouse', dataToSend);
  
      } catch(err) {
  
        //   alert(err); 
        console.log(err)
        //   return false;
      }
    }

    return true;
  }


  export async function syncWarehouseRecordToServer (idRecord: string, mode: string) {

    if(typeof idRecord !== 'string') {
        alert("Id record must be string");
        return;
    }

    let record = await db.getItem<Warehouse>(idRecord);
    // await getDataByKey(storeName, idRecord);

    if(record === null) {
        // dont do anything if record doesn't exist;
        return
    }
    //group, id, isGrouped, name, supervisors
  
    let dataToSend = {
        "id": record?.id,
        "warehouse_name": record?.name || 0,
        "warehouse_group": record?.group || 0,
        "warehouse_supervisors": record?.supervisors.toString()
    }
  
    try {
        if(mode === 'create') {

            await postData('warehouse', dataToSend);

        } 
        
        else if(mode === 'update') {

            await putData('warehouse/'+ idRecord, dataToSend)

        }

        else if (mode === 'delete') {
            await deleteData('warehouse/'+ idRecord)
        }

    } catch(err) {
        
      const errorMessage = 'Failed to send warehouse record id :' + idRecord +' with message: ' +err;
      alert(errorMessage); 
      console.error(errorMessage);

      return false;
    }

    return true;
  }