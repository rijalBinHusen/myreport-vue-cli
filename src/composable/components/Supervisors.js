import { getData, update, append } from '../../myfunction'

export let lists = []

export const getSupervisors = async () => {
    lists = []
    lists = await getData({ store: 'Supervisors', orderBy: 'id', desc: true })
    return true
}

export const getSupervisorId = async (supervisorId) => {
    if(!lists.length) {
        await getSupervisors()
    }
    return lists.find((rec) => rec?.id === supervisorId)
}

export const updateSupervisor = async (idSupervisor, objectToUpdate) => {
  // objectToUpdate = { name : "", phone : "" }
  //idb
  await update({
    store: "Supervisors",
    criteria: { id: idSupervisor},
    obj : objectToUpdate
  })

  lists = lists.map((val) => {
    if(val.id == idSupervisor) {
        return { ...val, ...objectToUpdate }
    }
    return val
  })

  return true
}

export const addSupervisor = async (nameSupervisor, phone) => {
  await append({ store: "Supervisors", obj: { name: nameSupervisor, phone } })
        .then((val) => {
          console.log(val)
            if(lists.length) {
                lists.unshift(val.data)
            }
        })
        return true
}

export const supervisorsEnabled = () => {
  return lists.filter((val) => val.disabled === false)
}