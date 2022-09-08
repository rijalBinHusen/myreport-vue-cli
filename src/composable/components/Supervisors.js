import func from '../../myfunction'

let lists = []

export const getSupervisors = async () => {
    lists = []
    lists = await func.getData({ store: 'Supervisors', orderBy: 'id', desc: true })
    return true
}

export const getSupervisorId = async (supervisorId) => {
    if(!lists.length) {
        await getSupervisors()
    }
    return lists.filter((rec) => rec?.id === supervisorId)
}