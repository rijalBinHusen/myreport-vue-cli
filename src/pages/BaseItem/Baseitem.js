import { ymdTime } from '../../composable/piece/dateFormat';
import { postData, putData, deleteData, getData as getDataOnServer } from "../../utils/requestToServer";
import { useIdb } from "../../utils/localforage";

export let lists = []

const store = 'baseitem'
const endPoint = 'base_item/'

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

            updateItem(findItem?.id, findItem?.kode, findItem?.name, ymdTime());
            return findItem;
        }


        return { id: 'Nothing', kode: 'Not found', name: 'Not found' }
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
    const dbItem = baseItem();
    await dbItem.getAllItems();

    for(let [index, list] of lists.entries()) {

        const dataToSend = {
            "id": list.id,
            "item_kode": list.kode || 0,
            "item_name": list.name || 0,
            "last_used": list.lastUsed || 0
        }

        try {
            progressMessage2.value = `Mengirim data ${index} dari ${lists.length}`
            await postData(endPoint, dataToSend);

        } catch(err) {

            alert(err);

        }

    }
    return true;
}


export async function syncItemRecordToServer(idRecord, mode) {

    if(typeof idRecord !== 'string') {
        alert("Id record base item must be a string");
        return false
    }
    const dbItem = useIdb(store);
    const record = await dbItem.getItem(idRecord);

    if(!record && mode != 'delete') {
        // dont do anything if record doesn't exist;
        return true
    }

    const dataToSend = {
        "id": idRecord,
        "item_kode": record.kode || 0,
        "item_name": record.name || 0,
        "last_used": record.lastUsed || 0
    }

    try {
        
        if(mode === 'create') {

            await postData(endPoint, dataToSend);

        } else if(mode === 'update') {

            await putData(endPoint+idRecord, dataToSend)

        }

        else if (mode === 'delete') {

            await deleteData(endPoint+ idRecord)
            
        }

    } catch(err) {

        const errorMessage = 'Failed to send base item record id :' + idRecord +' to server with error message: '+ err;
        // alert(errorMessage);
        console.log(errorMessage);
        return false

    }

    return true;
}

export async function checkAndsyncItemToServer(idRecord, mode) {

    if(typeof idRecord !== 'string') {
        alert("Id record base item must be a string");
        return true
    }

    const isCreateMode = mode === 'create'; 
    const isUpdateMode = mode === 'update';
    const isDeleteMode = mode === 'delete';

    let isSynced = false;

    if(isDeleteMode) {
        // the server must be return 404
        const getOnServer = await getDataOnServer(endPoint + idRecord);

        const isExistsOnServer = getOnServer?.status === 200

        if(isExistsOnServer) {
            isSynced = await syncItemRecordToServer(idRecord, 'delete')
        } 
        
        else {

            isSynced = true
        }
    }

    else if(isCreateMode || isUpdateMode) {
        const dbItem = useIdb('baseitem');
        const getItemInLocal = await dbItem.getItem(idRecord);
        const getItemInServer = await getDataOnServer(endPoint + idRecord);

        const isLocalExists = Boolean(getItemInLocal?.id);
        const isServerExists = getItemInServer?.status === 200;

        if(isLocalExists && isServerExists) {

            const waitingServerKeyValue = await getItemInServer.json();
            const serverKeyValue = waitingServerKeyValue?.data[0]

            const isItemKodeNotSame = serverKeyValue['item_kode'] != getItemInLocal['kode']
            const isItemNameNotSame = serverKeyValue['item_name'] != getItemInLocal['name']
            const isItemLastUsedNotSame = serverKeyValue['last_used'] != (getItemInLocal['lastUsed'] || 0)

            let isAnyValueNotSame = isItemKodeNotSame || isItemNameNotSame || isItemLastUsedNotSame

            if(isAnyValueNotSame) {

                isSynced = await syncItemRecordToServer(idRecord, 'update')

            }

            else {

                isSynced = true
                console.log('base item is nothing to change')
            }

        }

        else if(isLocalExists && !isServerExists) { 
            isSynced = await syncItemRecordToServer(idRecord, 'create');
        }

        else {
          isSynced = true
        }
    }

    if(isSynced) {

        return true

    }

    return false
}