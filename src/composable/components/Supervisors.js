import func from '../../myfunction'

export let lists = []

export const getSupervisors = async () => {
    lists = []
    lists = await func.getData({ store: 'Supervisors', orderBy: 'id', desc: true })
    return true
}

export const getSupervisorId = async (supervisorId) => {
    if(!lists.length) {
        await getSupervisors()
    }
    return lists.find((rec) => rec?.id === supervisorId)
}