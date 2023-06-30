import { update, append, getData, deleteDocument, updateWithoutAddActivity, getDataByKey } from '@/myfunction'
import { ymdTime } from '../../composable/piece/dateFormat'
import { postData, putData, deleteData } from "../../utils/sendDataToServer";
import { useIdb } from "../../utils/localforage";

export let lists = []

const store = 'baseitem'

export class BaseItem {
    db = useIdb(store);

    async addItem(itemKode, itemName) {
        const inserted = await this.db.createItem({ kode: itemKode, name: itemName });

        if(inserted) {
            lists.push(inserted);
        }
    }

    async updateItem(id, itemKode, itemName, lastUsed) {
        const getItem = await this.getItemById(id)

        if(!getItem) return;

        let objToUpdate = {}

        if(itemKode !== getItem?.kode) {
            objToUpdate['kode'] = itemKode
        }

        if(itemName !== getItem?.name) {
            objToUpdate['name'] = itemName
        }

        if(lastUsed > getItem?.lastUsed) {
            objToUpdate['lastUsed'] = lastUsed
        }

        lists = lists.map((rec) => {
            if(rec?.id === id) {
                return { ...rec, ...objToUpdate }
            }
            return rec
        })

        await this.db.updateItem(id, objToUpdate);
    }

    async getItemById (itemId) {
        let findItem = lists.find((rec) => rec?.id === itemId)

        if(!findItem) {
            findItem = await this.db.getItem(itemId);
        }

        return findItem || { itemId, kode: 'Not found', name: 'Not found' }
    }

    async getItemBykode (itemKode) {
        let findItem = lists.find((rec) => rec?.kode === itemKode)

        if(!findItem) {
            findItem = await this.db.findOneItemByKeyValue('kode', itemKode);
        }

        this.updateItem(findItem?.id, false, false, ymdTime());

        return findItem || { itemId, kode: 'Not found', name: 'Not found' }
    }

    async removeItem(itemId) {
        lists = lists.filter((rec) => rec?.id !== itemId);

        await this.db.removeItem(itemId);
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

    const record = await getDataByKey('baseitem', idRecord);

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