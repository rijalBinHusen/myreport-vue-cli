import { getData, update, append } from '../../myfunction'

export let lists = []

export const getHeadspv = async () => {
    lists = []
    lists = await getData({ store: 'Headspv', orderBy: 'id', desc: true })
    return true
}

export const getHeadspvId = async (headId) => {
    if(!lists.length) {
        await getHeadspv()
    }
    return lists.find((rec) => rec?.id === headId)
}

export const updateHeadspv = async (idHeadspv, objectToUpdate) =>{
  //idb
  await update({ store: "Headspv", criteria: { id: idHeadspv}, obj : objectToUpdate })
  lists = lists.map((val) => {
    if(val.id == idHeadspv) {
        return { ...val, ...objectToUpdate }
    }
    return val
  })
  return true
}

export const addHeadspv = async (name, phone) => {
    await append({ store: 'Headspv', obj: { name, phone, disabled: true, shift: 1 }})
            .then((val) => {
                if(lists.length) {
                    lists = lists.concat(val.data)
                }
            })
    return;
}

export const headspvEnabled = () => {
    return lists.filter((val) => !val.disabled);
}

export const headspvByShift = (shift) => {
let rec = lists.find((val) => val.shift == shift);
    return rec && rec.name && !rec?.disabled
        ? rec
        : {
            name: "Vacant",
            phone: "Not found",
        };
}
  