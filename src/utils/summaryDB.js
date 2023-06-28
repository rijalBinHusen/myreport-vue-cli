import { CrudLocalbase } from "./localbase"

let summaryState = {};

export const summaryDb = {
    
    async getInstance() {
        const isEmpty = Object.keys(summaryState).length === 0;
        if(isEmpty) {
            const sumDb = new CrudLocalbase('summary');
            await sumDb.getAllDataWithKey().then((result) => {
                if (result) {
                  result.forEach((val) => {
                    summaryState[val.key] = val.data;
                  });
                }
              });
        }
        return;
    },

    getLastId(storeName) {
        return summaryState[storeName]
            ? summaryState[storeName].lastId
            : storeName + '22300000';
    }
}