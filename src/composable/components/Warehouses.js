import func from '../../myfunction'

let lists = []

export const getWarehouses = async () => {
    lists = []
    lists = await func.getData({ store: 'Warehouses', orderBy: 'id', desc: true })
    return true
}

export const getWarehouseId = async (warehouseId) => {
    if(!lists.length) {
        await getWarehouses()
    }
    return lists.find((rec) => rec?.id === warehouseId)
}