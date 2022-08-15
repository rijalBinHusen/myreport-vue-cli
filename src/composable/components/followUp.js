import { computed, reactive, ref } from "vue"
import func from "../../myfunction"
import { ymdTime, dateMonth } from "../piece/dateFormat"

let lists = reactive([])

const getFollowUp = async () => {
    if(!lists?.value) {
        // get all data from indexeddb
        await func.getData({store: 'followup', limit: 100, desc: true, orderBy: 'id'})
        .then((val) => lists.value = val)
    }
    // delete data
}

// update data
export const markAsFinished = (idRecord) => {
    lists.value = lists.value.map((val) => {
        if (val?.id === idRecord) {
            return { ...val, finished: ymdTime()}
        }
        return val
    })
    func.update({ store: 'followup', criteria: idRecord, obj: {finished: ymdTime()}})
}

export const unFinished = async () => {
    await getFollowUp()
    let unfinish = [ ...lists.value].filter((val) => {
        if(!val?.finished) {
            return Object.assign(val, {periode2: dateMonth(val?.periode)})
        }
    })
    return unfinish
}

export const addData = (payload) => {
    // add data
    let record = { ...payload, periode: ymdTime() };
    func.append({
          store: "FollowUp",
          obj: record,
        }
      ).then((val) => lists.value.unshift(val?.data))
}