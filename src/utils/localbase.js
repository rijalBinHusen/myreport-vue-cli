import Localbase from "localbase";

export const useLocalbase = (databaseName) => {
    let db = new Localbase(databaseName)

    function write(store, document, value) {
        //store = namastore, document = "namaKey" value: { obj: toInput } }
        // db.collection(value.store.toLowerCase()).add(value.obj);
        return db.collection(store).doc(document).set(value);
    }

    function updateRecordById (storeName, id, keyValueToUpdate) {
        return db
          .collection(storeName)
          .doc(id)
          .update(keyValueToUpdate);
    };

    function getData (storeName) {
        return db.collection(storeName).get()
    }

    function getDataById(store, id) {
        return db.collection(store).doc(id).get()
    }

    function getStoreWithKey(store) {
        return db.collection(store).get({ keys: true });
      }
    
    function getDataOrderByKey(store, key) {
        return db.collection(store).orderBy(key).get()
    }

    function removeDataById(store, id) {
        return db.collection(store).doc(id).delete()
    }
    
    function removeDatabase() {
        return db.delete()
    }

    return { write, updateRecordById, getData, getDataById, getStoreWithKey, getDataOrderByKey, removeDataById, removeDatabase }
}