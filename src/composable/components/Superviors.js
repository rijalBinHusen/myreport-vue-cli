import { ref } from "firebase/storage";
import { getData } from '@/myfunction'


const lists = ref([])

const getSupervisors = async () => {
    if(!lists?.value) {
        // get all data from indexeddb
        await getData({store: 'supervisors', desc: true, orderBy: 'id'})
        .then((val) => lists.value = val)
    }
    // delete data
    return
}

export const getSupervisorById = async (idSupervisor) => {
    await getSupervisors()
    return lists.value.find((spv) => spv.id === idSupervisor)
}