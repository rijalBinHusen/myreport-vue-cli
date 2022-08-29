import { ref } from 'vue'
import func from '../../myfunction'

const lists = ref([])

export const getHeadspv = async () => {
    lists.value = []
    lists.value = await func.getData({ store: 'Headspv', orderBy: 'id', desc: true })
    return true
}

export const getHeadspvId = async (headId) => {
    if(!lists.value.length) {
        await getHeadspv()
    }
    return lists.value.filter((rec) => rec?.id === headId)
}