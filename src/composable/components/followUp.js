import { computed, reactive, ref } from "vue"
import func from "../../myfunction"
import { ymdTime } from "../piece/dateFormat"

let lists = reactive([])

const followUp = () => {
    // console.log(lists?.value)
    if(!lists?.value) {
        // get all data from indexeddb
        func.getData({store: 'followup', limit: 100, desc: true, orderBy: 'id'})
        .then((val) => lists.value = val)
    }
    
    // update data
    // delete data
    return { lists, addData }
}

const addData = (payload) => {
    // add data
    let record = { ...payload, periode: ymdTime() };
    func.append({
          store: "FollowUp",
          obj: record,
        }
      ).then((val) => lists.value.unshift(val?.data))
}

export default followUp