import { update, append, getData, deleteDocument, findData } from '@/myfunction'

export let lists = []

const store = 'baseitem'

export const addItem = async (kode, name) => {
    await append({
        store,
        obj: { kode, name }
    }).then((res) => {
        if(lists.length) {
            lists.unshift(res.data)
            console.log(lists)
        }
    })
    return
}

export const updateItem = async (id, objToUpdate) => {
    lists = lists.map((list) => {
        if(list.id == id) {
            return { id, ...objToUpdate}
        }
        return list
    })
    await update({ store: 'baseitem', criteria: { id }, obj: objToUpdate})
}

export const getItemById = (id) => {
    return lists.find((list) => list.id == id)
}

export const getItemByKode = async (kode) => {
    await getAllItems()
    return lists.find(list => list.kode == kode)
}

export const getAllItems = async () => {
    if(lists.length < 21) {
        await getData({ store, orderBy: 'id', desc: true }).then((res) => {
            lists = res
        })
    }
    return
}

export const removeItem = async (id) => {
    lists = lists.filter((list) => list.id !== id)
    await deleteDocument({ store, criteria: { id } })
    return
}

export const get20Item = async () => {
    if(!lists.length) {
        await getData({ store, orderBy: 'id', desc: true, limit: 20 }).then((res) => {
            lists = res
        })
    }
    return
}