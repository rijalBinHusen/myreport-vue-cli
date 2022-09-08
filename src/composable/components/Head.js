import { ref } from "firebase/storage";
import { getData } from '@/myfunction'


const lists = ref([])

const getHeads = async () => {
    if(!lists?.value) {
        // get all data from indexeddb
        await getData({store: 'headspv', desc: true, orderBy: 'id'})
        .then((val) => lists.value = val)
    }
    // delete data
    return
}

export const getHeadById = async (idHead) => {
    await getHeads()
    return lists.value.find((spv) => spv.id === idHead)
}