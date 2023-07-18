import localforage from 'localforage';
import { generateId } from './generatorId';
import { ref } from "vue"

interface SummaryRecord { total: number, lastId: string }

interface Summary {
  [key: string]: SummaryRecord
}

interface unknownObject {
  [key: string|number]: string|number
}

interface unknownObjectNumber {
  [key: string|number]: number
}

const stateSummary = ref(<Summary>{});
let timer:ReturnType<typeof setTimeout>;

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

  const createItem = async <T>(yourObject: T): Promise<string|undefined> => {
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
      return nextId;

    } catch (err) {

        alert('Terjadi kesalahan ketika memasukkan data');
        console.log(err);
    }
  };

  const setItem = async (key: string, value: any) => {
    return store.setItem(key, value);
  };

  const getItem = <T>(key: string): Promise<T|null> => {
    return store.getItem(key);
  };

  const getItemsLimit = async (limit: number) => {
    const result:unknownObject[] = [];
    return store
      .iterate(function (value: unknownObject, key, iterationNumber) {
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
    return store.iterate(function (value: unknownObject) {
      // Resulting key/value pair -- this callback
      // will be executed for every item in the
      // database.
      if (value[keySearch] == valueSearch) {
        // save to result
        return value;
      }
    });
  };

  const getItems = async <T>(): Promise<T[]> => {
    const result:T[] = [];
    await store.iterate(function (value:any, key) {
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
      const item = await getItem<unknownObject>(key);
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

  const getItemsByKeyValue = async <T>(keySearch: string, valueSearch: string|number):Promise<T[]> => {
    let result:T[] = [];
    await store
      .iterate(function (value:any) {
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

      return result;
  };

  const getItemsByKeyGreaterThan = async (keySearch: string, greaterThanValue: string) => {
    let result:unknownObject[] = [];
    return store
      .iterate(function (value:unknownObject) {
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

  const getItemsByTwoKeyValue = async <T>(
    key1Search: string|number,
    value1Search: string|number,
    key2Search: string|number,
    value2Search: string|number
  ):Promise<T[]> => {
    let result:T[] = [];
    await store
      .iterate(function (value:any) {
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

    return result;
  };

  const getItemsByKeyGreaterOrEqualThanAndLowerOrEqualThan = async (
    keySearch: string|number,
    greaterOrEqualThanValue: string|number,
    LowerOrEqualThanValue: string|number
  ) => {
    let result:unknownObject[] = [];
    return store
      .iterate(function (value:unknownObject) {
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
    const result:unknownObject[] = [];
    return store
      .iterate(function (value:unknownObject, key, iterationNumber) {
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

  const getItemsGreatEqualLowEqual = async <T>(key1: string|number, greaterValue1: number, key2: string|number, lowerValue2: number): Promise<T[]|undefined> => {
    let result:T[] = [];
    await store
      .iterate(function (value: any) {
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

      return result;
  }

  function sortItem (items: any[], keyToSort: string, isAsc:boolean) {

    items.sort(function (a, b) {
      let x = a[keyToSort];
      let y = b[keyToSort];

      if (typeof a[keyToSort] === 'string') {
        x = a[keyToSort].toString().toLowerCase();
        y = b[keyToSort].toString().toLowerCase();
      }

      if (isAsc) {
        if (x < y) {
          return -1;
        }
        if (x > y) {
          return 1;
        }
      } else {
        if (x > y) {
          return -1;
        }
        if (x < y) {
          return 1;
        }
      }
      return 0;
    });

    return items;
  }  

  const getItemsLimitDesc = async <T>(limit: number):Promise<T[]> => {
    const result:T[] = [];
    const getAll = await getItems<T>();
    
    const sortItems = sortItem(getAll, 'id', false);

    return sortItems.slice(0, limit)
  };

  const getItemsByThreeKeyValue = async <T>(
    key1Search: string|number,
    value1Search: string|number,
    key2Search: string|number,
    value2Search: string|number,
    key3Search: string|number,
    value3Search: string|number
  ):Promise<T[]> => {
    let result:T[] = [];
    await store
      .iterate(function (value:any) {
        // Resulting key/value pair -- this callback
        // will be executed for every item in the
        // database.
        const condition = value[key1Search] == value1Search 
                          && value[key2Search] == value2Search
                          && value[key3Search] == value3Search

        if (condition) {
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

    return result;
  };

  return {
    setItem,
    getItem,
    getItems,
    removeItem,
    findOneItemByKeyValue,
    getItemsLimit,
    getItemsLimitDesc,
    updateItem,
    getItemsByKeyValue,
    getItemsByKeyGreaterThan,
    getItemsByTwoKeyValue,
    getItemsByKeyGreaterOrEqualThanAndLowerOrEqualThan,
    getItemsThatValueIncludes,
    createItem,
    getItemsGreatEqualLowEqual,
    getItemsByThreeKeyValue
  };
};
