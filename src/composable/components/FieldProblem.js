import { append } from '@/myfunction'
import { reactive } from 'vue';

const lists = reactive([])

export const addData = (payload) => {
    // add data
    let record = { ...payload, periode: ymdTime() };
    append({ store: "FollowUp", obj: record })
    .then((val) => {
        if(lists.value) {
            lists.value.unshift(val?.data)
        }
      })
}
