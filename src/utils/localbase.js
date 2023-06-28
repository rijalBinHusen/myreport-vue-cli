import Localbase from "localbase";

export class CrudLocalbase {
    storeName = null;
    db = new Localbase('myreport');
    constructor(storeName) {
        if(typeof storeName !== 'string') {
            alert('Store name must be string');
            return;
        };
        this.storeName = storeName;
    }

    async updateByKey(yourKey, objToUpdate) {
        if(typeof yourKey !== 'string') {
            alert('Key of record must be string');
            console.error('Key of record must be string')
            return false;
        }
        if(typeof objToUpdate !== 'object') {
            console.error('Object to update must be string')
            alert('Object to update must be string');
            return false;
        }
        await this.db.collection(this.storeName).doc(yourKey).update(objToUpdate);
        return true;
    }

    async writeData(yourKey, objToWrite) {
        if(typeof yourKey !== 'string') {
            alert('Key of record must be string');
            console.error('Key of record must be string')
            return false;
        }
        if(typeof objToWrite !== 'object') {
            console.error('Object to update must be string')
            alert('Object to update must be string');
            return false;
        }
        await this.db.collection(this.storeName).doc(yourKey).set(objToWrite);
        return true;

    }

    getAllDataWithKey() {
        return this.db.collection(this.storeName).get({ keys: true });
    }
}