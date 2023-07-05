import { computed, reactive, ref } from "vue"
import func from "../../myfunction"
import { ymdTime, dateMonth } from "../../composable/piece/dateFormat"

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
export const markAsFinished = (idRecord, answer) => {
    lists.value = lists.value.map((val) => {
        if (val?.id === idRecord) {
            return { ...val, finished: ymdTime(), answer: answer}
        }
        return val
    })
    func.update({ store: 'followup', criteria: { id: idRecord }, obj: { finished: ymdTime(), answer: answer }})
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
      ).then((val) => {
        if(lists.value) {
            lists.value.unshift(val?.data)
        }
      })
}

export const deleteData = (idRecord) => {
    
    lists.value = lists.value.filter((rec) => rec.id !== idRecord)
    
    return func.deleteDocument({
        store: 'followup',
        criteria: { id: idRecord}
    })
}