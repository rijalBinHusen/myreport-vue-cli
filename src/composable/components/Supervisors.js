import { ref } from 'vue'
import func from '../../myfunction'

const lists = ref([])

export const getSupervisors = async () => {
    lists.value = []
    lists.value = await func.getData({ store: 'Supervisors', orderBy: 'id', desc: true })
    return true
}

export const getSupervisorId = async (supervisorId) => {
    if(!lists.value.length) {
        await getSupervisors()
    }
    return lists.value.filter((rec) => rec?.id === supervisorId)
}