import { update, append, getData, deleteDocument, updateWithoutAddActivity } from '@/myfunction'
import { ymdTime } from '../piece/dateFormat'

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
    let res =  lists.find(list => list.kode == kode)
    if(res) {
        if(!res?.lastUsed || res?.lastUsed < ymdTime()) {
            await updateWithoutAddActivity('baseitem', { id: res.id }, { lastUsed: ymdTime() })
            lists = lists.map((rec) => rec?.id == res?.id ? { ...rec, lastUsed: ymdTime() } : rec)
        }
    }
    return res
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