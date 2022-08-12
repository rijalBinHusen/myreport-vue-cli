import { computed, reactive, ref } from "vue"
import func from "../../myfunction"

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
    // add data
    return { lists }
}

export default followUp