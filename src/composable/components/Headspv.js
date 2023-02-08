import { ref } from "vue"
import { getData, update, append } from '../../myfunction'

export let lists = ref([])
// name of store/table in database
const store = 'Headspv'

export const getHeadspv = async () => {
    // check is state empty
    if(lists.length) {
        return
    }
    // empty state
    lists.value.length = 0
    // get head spv order by id
    lists.value = await getData({ store, orderBy: 'id', desc: true })
    // return
    return true
}

export const getHeadspvId = async (headId) => {
    if(!lists.value.length) {
        await getHeadspv()
    }
    return lists.value.find((rec) => rec?.id === headId)
}

export const updateHeadspv = async (idHeadspv, objectToUpdate) =>{
  //idb
  await update({ store, criteria: { id: idHeadspv}, obj : objectToUpdate })
  lists.value = lists.value.map((val) => {
    if(val.id == idHeadspv) {
        return { ...val, ...objectToUpdate }
    }
    return val
  })
  return true
}

export const addHeadspv = async (name, phone) => {
    await append({ store, obj: { name, phone, disabled: true, shift: 1 }})
            .then((val) => {
                if(lists.value.length) {
                    lists.value = lists.value.concat(val.data)
                }
            })
    return;
}

export const headspvEnabled = () => {
    return lists.value.filter((val) => !val.disabled);
}

export const headspvByShift = (shift) => {
let rec = lists.value.find((val) => val.shift == shift);
    return rec && rec.name && !rec?.disabled
        ? rec
        : {
            name: "Vacant",
            phone: "Not found",
        };
}
  