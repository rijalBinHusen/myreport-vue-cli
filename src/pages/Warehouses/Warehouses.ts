import { getSupervisorId } from '../Supervisors/Supervisors'
import { useIdb } from '@/utils/localforage';
import { progressMessage2 } from "../../components/parts/Loader/state";
import { postData, putData, deleteData, getData as getDataOnServer } from "../../utils/requestToServer";
import { ref } from 'vue';

interface Warehouse {
    disabled: boolean
    group: string
    id: string
    isGrouped: boolean
    name: string
    supervisors: string[]
}

interface WarehouseFromServer {
    id: string
    warehouse_name: string
    warehouse_group: string
    warehouse_supervisors: string
    is_warehouse_disabled: string
}

type Partial<T> = {
    [P in keyof T]?: T[P]
}

type WarehouseUpdate = Partial<Warehouse>;

export let lists = ref(<Warehouse[]>[])
const storeName = "warehouses";
const endPoint = "warehouse/";
const db = useIdb(storeName);

export const getWarehouses = async () => {
    if(lists.value.length > 0) return;
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
        let updateRecord = { ...record, ...objToUpdate};
        lists.value[findIndex] = updateRecord;
    }
    
    await db.updateItem(idWarehouse, objToUpdate)
}

export const warehouseNameBySpv = async (spvId: string) => {
   await getWarehouses()
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
        await postData(endPoint, dataToSend);
  
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

    if(!record && mode != 'delete') {
        // dont do anything if record doesn't exist;
        return
    }
    //group, id, isGrouped, name, supervisors
  
    let dataToSend = {
        "id": record?.id || '',
        "warehouse_name": record?.name || 0,
        "warehouse_group": record?.group || 0,
        "warehouse_supervisors": record?.supervisors.toString() || ''
    }
  
    try {
        if(mode === 'create') {

            await postData(endPoint, dataToSend);

        } 
        
        else if(mode === 'update') {

            await putData(endPoint+ idRecord, dataToSend)

        }

        else if (mode === 'delete') {
            await deleteData(endPoint+ idRecord)
        }

    } catch(err) {
        
      const errorMessage = 'Failed to send warehouse record id :' + idRecord +' with message: ' +err;
    //   alert(errorMessage); 
      console.error(errorMessage);

      return false;
    }

    return true;
  }

  import { type Supervisor } from "@/pages/Supervisors/Supervisors"

  export interface WarehouseAndTheSupervisors extends Warehouse {
    supervisorsAndDetail: Supervisor[]
  }

  export async function getWarehouseNotGroupedAndTheSupervisors(): Promise<WarehouseAndTheSupervisors[]> {
    await getWarehouses();

    let result = <WarehouseAndTheSupervisors[]>[];

    // const uniqueeWarehouses = lists.value.filter((rec) => !rec.isGrouped);

    for(let warehouse of lists.value) {
        const isGrouped = warehouse.isGrouped;
        let isWarehousePushed = false;

        if(isGrouped) {
            let findIndex = result.findIndex((rec) => rec.id === warehouse.group);
            isWarehousePushed = findIndex > -1;
        }

        if(!isWarehousePushed && warehouse.supervisors.length && !warehouse.disabled){

            let supervisors = <Supervisor[]>[]

            for(let supervisorId of warehouse.supervisors) {
                const supervisorInfo = await getSupervisorId(supervisorId);

                if(supervisorInfo.disabled) {
                    
                    continue;

                } else {

                    supervisors.push(supervisorInfo);

                }
            }

            result.push({ ...warehouse, supervisorsAndDetail: supervisors })

        }

    }

    return result;
  }

export async function checkAndsyncWarehouseToServer(idRecord: string, mode: string) {

    if(typeof idRecord !== 'string') {
        alert("Id record warehouse must be a string");
        return true
    }
  
    const isCreateMode = mode === 'create'; 
    const isUpdateMode = mode === 'update';
    const isDeleteMode = mode === 'delete';
  
    let isSynced = false;
  
    if(isDeleteMode) {
        // the server must be return 404
        const getOnServer = await getDataOnServer(endPoint + idRecord);
  
        const isExistsOnServer = getOnServer?.status === 200
  
        if(isExistsOnServer) {
            let syncing = await syncWarehouseRecordToServer(idRecord, 'delete')
            isSynced = Boolean(syncing);
        } else {
            isSynced = true
        }
    }
  
    else if(isCreateMode || isUpdateMode) {
        const dbItem = useIdb(storeName);
        const getItemInLocal = await dbItem.getItem<Warehouse>(idRecord);
        const getItemInServer = await getDataOnServer(endPoint + idRecord);
  
        const isLocalExists = Boolean(getItemInLocal?.id);
        const isServerExists = getItemInServer?.status === 200;
  
        if(isLocalExists && isServerExists) {

            const waitingServerKeyValue = await getItemInServer.json();
            const serverKeyValue = waitingServerKeyValue?.data[0]
            
            const isNameNotSame = serverKeyValue["warehouse_name"] != getItemInLocal?.name;
            const isGroupNotSame = serverKeyValue["warehouse_group"] != getItemInLocal?.group;
            const isSPVNotSame = serverKeyValue["warehouse_supervisors"] != getItemInLocal?.supervisors.toString();
  
            let isAnyValueToUpdate = isNameNotSame 
                                    || isGroupNotSame
                                    || isSPVNotSame;
  
            if(isAnyValueToUpdate) {
  
              let syncing = await syncWarehouseRecordToServer(idRecord, 'update')
              isSynced = Boolean(syncing);
  
            } else {

                isSynced = true
                
            }
  
        }
  
        else if(isLocalExists && !isServerExists) {
  
          let syncing = await syncWarehouseRecordToServer(idRecord, 'create')
          isSynced = Boolean(syncing);
  
        }

        else {
          isSynced = true
        }
    }

    return isSynced

  }


  export async function implantWarehouseFromServer () {
    const fetchEndPoint = await getDataOnServer(`warehouses/`);
    const isFetchFailed = fetchEndPoint?.status != 200;
  
    if(isFetchFailed) return;
  
    const dbItem = useIdb(storeName);
  
    const waitingServerKeyValue = await fetchEndPoint.json();
    const items: WarehouseFromServer[] = waitingServerKeyValue?.data
  
    for(let [index, item] of items.entries()) {
        progressMessage2.value = `Menanamkan nama gudang, ${index + 1} dari ${items.length}`;
  
        let recordToSet:Warehouse = {
            id: item.id,
            group: item?.warehouse_group,
            name: item?.warehouse_name,
            supervisors: item?.warehouse_supervisors.split(','),
            isGrouped: item?.warehouse_group != '0',
            disabled: Boolean(Number(item?.is_warehouse_disabled))
        }
  
        await dbItem.setItem(item.id, recordToSet);
    }
  
    progressMessage2.value = ''
  }