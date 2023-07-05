import localforage from 'localforage';
import { generateId } from './generatorId';
import { ref } from "vue"

interface SummaryRecord { total: number, lastId: string }

interface Summary {
  storeName: SummaryRecord
}

const stateSummary = ref(<Summary>{});
let timer = null;

export const useIdb = (storeName: string) => {
  // create instance
  const store = localforage.createInstance({ name: 'myreport', storeName });
  const summaryDb = localforage.createInstance({ name: 'myreport',  storeName: 'summary'});
  const logging = localforage.createInstance({ name: 'myreport',  storeName: 'activity'});

  async function getSummary () { 
    //check is summary exists on state
    const isExists = stateSummary.value.hasOwnProperty(storeName);
    // if exists
    if(!isExists) {

        const summaryItem = await summaryDb.getItem(storeName) as SummaryRecord;
        let lastId = null;
        let total = 0;

        if(summaryItem && summaryItem?.lastId) {
            lastId = summaryItem?.lastId;
            total = summaryItem?.total;
        } else {
            lastId = storeName + '_23040000';
        }

        stateSummary.value[storeName] = { lastId, total }
    }

    return stateSummary.value[storeName]
  }

  function updateSummary (yourLastId: string) {
    clearTimeout(timer);

    let lastId = yourLastId;
    let total = Number(stateSummary.value[storeName]?.total) + 1;

    stateSummary.value[storeName] = { lastId, total };

    timer = setTimeout(() => {
        
        summaryDb.setItem(storeName, { lastId, total });
        
    }, 3000);
  }

  async function addActivity (type: string, idRecord: string) {
    const now = new Date();
    const utcOffset = 7 * 60 * 60 * 1000; // 7 hours in milliseconds
    const utcPlus7 = new Date(now.getTime() + utcOffset);

    const idLogger = stateSummary.value[storeName]?.total + new Date().getTime() + '';
    const recordToSet = {
      id: idLogger,
      idRecord,
      store: storeName,
      time: utcPlus7.toISOString(),
      type
    }

    await logging.setItem(idLogger, recordToSet)

  }

  const createItem = async <T>(yourObject: T): Promise<T> => {
    // get summary
    const sum = await getSummary();
    // generateID
    const nextId = generateId(sum?.lastId);
    // record to set
    const record = { ...yourObject, id: nextId };
    try {
      // setItem
      await setItem(nextId, record);
      // update summary
      updateSummary(nextId);
      // add activity
      addActivity('create', nextId)
      return record;

    } catch (err) {

        alert('Terjadi kesalahan ketika memasukkan data');
        console.log(err);
      
    }
  };

  const setItem = async (key: string, value: any) => {
    return store.setItem(key, value);
  };

  const getItem = (key: string): Promise<any|undefined> => {
    return store.getItem(key);
  };

  const getItemsLimit = async (limit: number) => {
    const result = [];
    return store
      .iterate(function (value, key, iterationNumber) {
        if (iterationNumber < limit && value && key) {
          result.push(value);
        }
        // return result;
      })
      .then(function () {
        // onsole.log("Iteration has completed, last iterated pair:");
        return result;
      })
      .catch(function (err) {
        // This code runs if there were any errors
        console.log(err);
      });
  };

  const removeItem = async (key: string) => {
    // add activity
    addActivity('delete', key);
    await store.removeItem(key);
    return;
  };

  const findOneItemByKeyValue = (keySearch: string, valueSearch: string) => {
    // let result = {};
    return store.iterate(function (value) {
      // Resulting key/value pair -- this callback
      // will be executed for every item in the
      // database.
      if (value[keySearch] == valueSearch) {
        // save to result
        return value;
      }
    });
  };

  const getItems = async () => {
    const result = [];
    await store.iterate(function (value, key) {
        if (value && key) {
          result.push(value);
        }
        // return result;
      })
      .then(function () {
        // onsole.log("Iteration has completed, last iterated pair:");
        return result;
      })
      .catch(function (err) {
        // This code runs if there were any errors
        console.log(err);
      });
    return result;
  };

  const updateItem = async (key: string, keyValueToUpdate: any): Promise<boolean> => {
    // onsole.log('local forage update item', key)
    try {
      // get item first
      const item = await getItem(key);
      // new item
      const newItem = { ...item, ...keyValueToUpdate };
      // then set item
      await setItem(key, newItem);
      // add activity
      addActivity('update', key)
      return true;
      
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const getItemsByKeyValue = async (keySearch: string, valueSearch: string) => {
    let result = [];
    return store
      .iterate(function (value, key, iterationNumber) {
        // Resulting key/value pair -- this callback
        // will be executed for every item in the
        // database.
        // onsole.log([key, value]);
        if (value[keySearch] == valueSearch) {
          // save to result
          result.push(value);
        }
      })
      .then(function () {
        // return result
        return result;
      })
      .catch(function (err) {
        // This code runs if there were any errors
        console.log(err);
      });
  };

  const getItemsByKeyGreaterThan = async (keySearch: string, greaterThanValue: string) => {
    let result = [];
    return store
      .iterate(function (value) {
        // Resulting key/value pair -- this callback
        // will be executed for every item in the
        // database.
        // onsole.log([key, value]);
        if (value[keySearch] > greaterThanValue) {
          // save to result
          result.push(value);
        }
      })
      .then(function () {
        // return result
        return result;
      })
      .catch(function (err) {
        // This code runs if there were any errors
        console.log(err);
      });
  };

  const getItemByTwoKeyValue = async (
    key1Search: string|number,
    value1Search: string|number,
    key2Search: string|number,
    value2Search: string|number
  ) => {
    let result = [];
    return store
      .iterate(function (value) {
        // Resulting key/value pair -- this callback
        // will be executed for every item in the
        // database.
        // onsole.log([key, value]);
        if (
          value[key1Search] == value1Search &&
          value[key2Search] == value2Search
        ) {
          // save to result
          result.push(value);
        }
      })
      .then(function () {
        // return result
        return result;
      })
      .catch(function (err) {
        // This code runs if there were any errors
        console.log(err);
      });
  };

  const getItemsByKeyGreaterOrEqualThanAndLowerOrEqualThan = async (
    keySearch: string|number,
    greaterOrEqualThanValue: string|number,
    LowerOrEqualThanValue: string|number
  ) => {
    let result = [];
    return store
      .iterate(function (value, key, iterationNumber) {
        // Resulting key/value pair -- this callback
        // will be executed for every item in the
        // database.
        // onsole.log([key, value]);
        if (
          value[keySearch] >= greaterOrEqualThanValue &&
          value[keySearch] <= LowerOrEqualThanValue
        ) {
          // save to result
          result.push(value);
        }
      })
      .then(function () {
        // return result
        return result;
      })
      .catch(function (err) {
        // This code runs if there were any errors
        console.log(err);
      });
  };

  const getItemsThatValueIncludes = async (yourString: string) => {
    const result = [];
    return store
      .iterate(function (value, key, iterationNumber) {
        if (Object.values(value).includes(yourString)) {
          result.push(value);
        }
        // return result;
      })
      .then(function () {
        // onsole.log("Iteration has completed, last iterated pair:");
        return result;
      })
      .catch(function (err) {
        // This code runs if there were any errors
        console.log(err);
      });
  };

  const getItemsGreatEqualLowEqual = async (key1: string|number, greaterValue1: number, key2: string|number, lowerValue2: number) => {
    let result = [];
    return store
      .iterate(function (value) {
        // Resulting key/value pair -- this callback
        // will be executed for every item in the
        // database.
        // onsole.log([key, value]);
        const isCondition = value[key1] >= greaterValue1 && value[key2] <= lowerValue2
        if (isCondition) {
          // save to result
          result.push(value);
        }
      })
      .then(function () {
        // return result
        return result;
      })
      .catch(function (err) {
        // This code runs if there were any errors
        console.log(err);
      });
  }

  return {
    setItem,
    getItem,
    getItems,
    removeItem,
    findOneItemByKeyValue,
    getItemsLimit,
    updateItem,
    getItemsByKeyValue,
    getItemsByKeyGreaterThan,
    getItemByTwoKeyValue,
    getItemsByKeyGreaterOrEqualThanAndLowerOrEqualThan,
    getItemsThatValueIncludes,
    createItem,
    getItemsGreatEqualLowEqual
  };
};
