import localforage from 'localforage';
import { generateId } from './generatorId';
import { ref } from "vue"

const stateSummary = ref({});
let timer = null;

export const useIdb = (storeName) => {
  // create instance
  const store = localforage.createInstance({ name: 'myreport', storeName });
  const summaryDb = localforage.createInstance({ name: 'myreport',  storeName: 'summary'});
  const logging = localforage.createInstance({ name: 'myreport',  storeName: 'activity'});

  async function getSummary () { 
    //check is summary exists on state
    const isExists = stateSummary.value.hasOwnProperty(storeName);
    // if exists
    if(!isExists) {

        const summaryItem = await summaryDb.getItem(storeName)
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

  function updateSummary (yourLastId) {
    clearTimeout(timer);

    let lastId = yourLastId;
    let total = Number(stateSummary.value[storeName]?.total) + 1;

    stateSummary.value[storeName] = { lastId, total };

    timer = setTimeout(() => {
        
        summaryDb.setItem(storeName, { lastId, total });
        
    }, 3000);
  }

  async function addActivity (type, idRecord) {
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

  const createItem = async (value) => {
    // get summary
    const sum = await getSummary();
    // generateID
    const nextId = generateId(sum?.lastId);
    // record to set
    const record = { ...value, id: nextId };
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
        return false;
    }
  };

  const setItem = async (key, value) => {
    return store.setItem(key, value);
  };

  const getItem = (key) => {
    return store.getItem(key);
  };

  const getItemsLimit = async (limit) => {
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

  const removeItem = async (key) => {
    // add activity
    addActivity('delete', incrementId)
    await store.removeItem(key);
    return;
  };

  const findOneItemByKeyValue = (keySearch, valueSearch) => {
    // let result = {};
    return store.iterate(function (value, key, iterationNumber) {
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

  const updateItem = async (key, keyValueToUpdate) => {
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

  const getItemsByKeyValue = async (keySearch, valueSearch) => {
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

  const getItemsByKeyGreaterThan = async (keySearch, greaterThanValue) => {
    let result = [];
    return store
      .iterate(function (value, key, iterationNumber) {
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
    key1Search,
    value1Search,
    key2Search,
    value2Search
  ) => {
    let result = [];
    return store
      .iterate(function (value, key, iterationNumber) {
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
    keySearch,
    greaterOrEqualThanValue,
    LowerOrEqualThanValue
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

  const getItemsThatValueIncludes = async (yourString) => {
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

  const getItemsGreatEqualLowEqual = async (key1, greaterValue1, key2, lowerValue2) => {
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
