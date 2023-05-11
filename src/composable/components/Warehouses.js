import { getData, append, update } from '../../myfunction'
import { getSupervisorId } from './Supervisors'

export let lists = []

export const getWarehouses = async () => {
    lists = []
    lists = await getData({ store: 'Warehouses', orderBy: 'id', desc: true })
    return true
}

export const getWarehouseId = async (warehouseId) => {
    if(!lists.length) {
        await getWarehouses()
    }
    return lists.find((rec) => rec?.id === warehouseId)
}

export const addWarehouse = async (warehouseName) => {
    //payload = namagudang
    await append({ store: "Warehouses", obj: { name: warehouseName } })
            .then((val) => {
                if(lists.length) {
                    lists.concat(val)
                }
    })
    return true
}

export const updateSupervisors = async (idWarehouse, arraySupervisorId) => {
    // payload = {id: 123, supervisors: [] }
    await update({ 
        store: "Warehouses",  
        criteria: { id: idWarehouse }, 
        obj: { supervisors: arraySupervisorId } 
    })
    lists = lists.map((val) => {
        if(val.id == idWarehouse) {
            return { ...val, supervisors: arraySupervisorId }
        }
        return val
    })
    return true
}

export const updateHeadspv = async (idWarehouse, headId) => {
    // payload = {id: 123, supervisors: [] }
    await update({ 
        store: "Warehouses",  
        criteria: { id: idWarehouse }, 
        obj: { head: headId } 
    })
    lists = lists.map((val) => {
        if(val.id == idWarehouse) {
            return { ...val, head: headId }
        }
        return val
    })
    return true
}

export const warehouseNameBySpv = (spvId) => {
    let result = []
    lists.forEach((val) => {
        if(val.supervisors.includes(spvId)) {
            result.push(val?.name.replace('Gudang jadi ', ''))
        }
    })
    return result.join(" & ")
}

export const warehouseId = (id) => {
    let rec = lists.find((val) => val.id === id);
    return rec && rec.name
        ? rec
        : { id: "", name: "Not found" };
}

export const updateWarehouse = async (idWarehouse, warehouseName) => {
    await update({
        store: 'Warehouses',
        criteria: { id: idWarehouse },
        obj: { name: warehouseName }
    })
    lists = lists.map((val) => {
        if(val.id == idWarehouse) {
            return { ...val, name: warehouseName}
        }
        return val
    })
    return true
}

export const disableWarehouse = async (idWarehouse, bool) => {
    update({
        store: 'Warehouses',
        criteria: { id: idWarehouse },
        obj: { disabled: bool }
    })
    lists = lists.map((val) => {
        if(val.id == idWarehouse) {
            return { ...val, disabled: bool}
        }
        return val
    })
    return true
}

export const updateWarehouseVariable = async (idWarehouse, yourVariable) => {
    update({
        store: 'Warehouses',
        criteria: { id: idWarehouse },
        obj: yourVariable
    })
    lists = lists.map((val) => {
        if(val.id == idWarehouse) {
            return { ...val, ...yourVariable}
        }
        return val
    })
    return true
}

export const getSupervisorShift1ByWarehouse = async (idWarehouse) => {
    let warehouse = lists.find((rec) => rec.id == idWarehouse)
    let getSupervisor = warehouse['supervisors'].map( (spvId) => getSupervisorId(spvId) )
    let result = await Promise.all(getSupervisor).then((supervisors) => supervisors.find((spv) => !spv?.disabled && spv?.shift == 1))
    return result
}