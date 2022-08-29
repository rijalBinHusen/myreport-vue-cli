import { ref } from 'vue'
import func from '../../myfunction'

const lists = ref([])

export const getWarehouses = async () => {
    lists.value = []
    lists.value = await func.getData({ store: 'Warehouses', orderBy: 'id', desc: true })
    return true
}

export const getWarehouseId = async (warehouseId) => {
    if(!lists.value.length) {
        await getWarehouses()
    }
    return lists.value.filter((rec) => rec?.id === warehouseId)
}