import { ref } from "vue";
import { ymdTime, dateMonth } from "../../composable/piece/dateFormat";
import { useIdb } from "../../utils/localforage"

let lists = ref([])
const storeName = 'followup';
const db = useIdb(storeName)

const getFollowUp = async () => {
    if(!lists?.value) {
        // get all data from indexeddb
        lists.value = await db.getItemsLimitDesc(100);
    }
    // delete data
}

// update data
export const markAsFinished = (idRecord, answer) => {
    lists.value = lists.value.map((val) => {
        if (val?.id === idRecord) {
            return { ...val, finished: ymdTime(), answer: answer}
        }
        return val
    })
    db.updateItem(idRecord, { finished: ymdTime(), answer: answer })
    // func.update({ store: 'followup', criteria: { id: idRecord }, obj: { finished: ymdTime(), answer: answer }})
}

export const unFinished = async () => {
    await getFollowUp()
    let unfinish = lists.value.filter((val) => {
        if(!val?.finished) {
            return Object.assign(val, {periode2: dateMonth(val?.periode)})
        }
    })
    return unfinish
}

export const addData = async (payload) => {
    // add data
    let record = { ...payload, periode: ymdTime() };
    let insertedId = await db.createItem(record);

    if(insertedId === undefined) return;

    lists.value.push({ id: insertedId, ...record })
}

export const deleteData = async (idRecord) => {
    
    lists.value = lists.value.filter((rec) => rec.id !== idRecord)
    
    await db.removeItem(idRecord)
}