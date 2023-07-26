import { ymdTime } from '../../composable/piece/dateFormat';
import { postData, putData, deleteData } from "../../utils/sendDataToServer";
import { useIdb } from "../../utils/localforage";

export let lists = []

const store = 'baseitem'

export function baseItem () {

    const db = useIdb(store);

    async function addItem(kode, name) {
        let record = { kode, name }
        const insertedId = await db.createItem(record);

        if(typeof insertedId === 'undefined') return;
        lists.unshift({id: insertedId, ...record });
    }

    async function updateItem(id, itemKode, itemName, lastUsed) {
        const getItem = await getItemById(id)

        if(!getItem) return;

        let objToUpdate = {}

        const isUpdateItemKode = Boolean(itemKode) && itemKode !== getItem?.kode;
        const isUpdateItemName = Boolean(itemName) && itemName !== getItem?.name;
        const isUpdateLastUsed = Boolean(lastUsed) && lastUsed > getItem?.lastUsed

        if(isUpdateItemKode) {
            objToUpdate['kode'] = itemKode
        }

        if(isUpdateItemName) {
            objToUpdate['name'] = itemName
        }

        if(isUpdateLastUsed) {
            objToUpdate['lastUsed'] = lastUsed
        }

        const isAnyValueToUpdate  = isUpdateItemKode || isUpdateItemName || isUpdateLastUsed

        if(!isAnyValueToUpdate) return;

        lists = lists.map((rec) => {
            if(rec?.id === id) {
                return { ...rec, ...objToUpdate }
            }
            return rec
        })

        await db.updateItem(id, objToUpdate);
    }

    async function getItemById (itemId) {
        let findItem = lists.find((rec) => rec?.id === itemId)

        if(!findItem) {
            findItem = await db.getItem(itemId);
        }

        return findItem || { itemId, kode: 'Not found', name: 'Not found' }
    }

    async function getItemBykode (itemKode) {
        let findItem = lists.find((rec) => rec?.kode === itemKode)

        if(!findItem) {
            findItem = await db.findOneItemByKeyValue('kode', itemKode);
        }

        if(findItem?.name) {

            updateItem(findItem?.id, false, false, ymdTime());
            
        }


        return findItem || { id: 'Nothing', kode: 'Not found', name: 'Not found' }
    }

    async function removeItem(itemId) {
        lists = lists.filter((rec) => rec?.id !== itemId);

        await db.removeItem(itemId);
    }

    async function getAllItems() {
        
        const getItems = await db.getItems();

        if(getItems) {
            lists = getItems;
        }
    }

    return {
        addItem, updateItem, getItemById, getItemBykode, removeItem, getAllItems
    }
}

import { progressMessage2 } from "../../components/parts/Loader/state";
export async function syncItemToServer() {
    await getAllItems();

    for(let [index, list] of lists.entries()) {

        const dataToSend = {
            "id": list.id,
            "item_kode": list.kode || 0,
            "item_name": list.name || 0,
            "last_used": list.lastUsed || 0
        }

        try {
            progressMessage2.value = `Mengirim data ${index} dari ${lists.length}`
            await postData('base_item',dataToSend);

        } catch(err) {

            alert(err);

        }

    }
    return true;
}


export async function syncItemRecordToServer(idRecord, mode) {

    if(typeof idRecord !== 'string') {
        alert("Id record base item must be a string");
        return
    }
    const dbItem = useIdb(store);
    const record = await dbItem.getItem(idRecord);

    if(!record) {
        // dont do anything if record doesn't exist;
        return
    }

    const dataToSend = {
        "id": idRecord,
        "item_kode": record.kode || 0,
        "item_name": record.name || 0,
        "last_used": record.lastUsed || 0
    }

    try {
        
        if(mode === 'create') {

            await postData('base_item', dataToSend);

        } else if(mode === 'update') {

            await putData('base_item/'+idRecord, dataToSend)

        }

        else if (mode === 'delete') {

            await deleteData('base_item/'+ idRecord)
            
        }

    } catch(err) {

        const errorMessage = 'Failed to send base item record id :' + idRecord +' to server with error message: '+ err;
        alert(errorMessage);
        console.log(errorMessage);
        return false

    }

    return true;
}