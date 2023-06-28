import localforage from 'localforage';
import { generateId } from './generatorId';
import { ref } from "vue"

const stateSummary = ref({});
let timer = null;

export const useIdb = (storeName) => {
  // create instance
  const store = localforage.createInstance({ name: 'myreport', storeName });
  const summaryDb = localforage.createInstance({ name: 'myreport',  storeName: 'summary'});

  async function getSummary () { 
    //check is summary exists on state
    const isExists = stateSummary.value.hasOwnProperty(storeName);
    // if exists
    if(!isExists) {

        const summaryItem = await summaryDb.getItem(storeName)
        let lastId = null;
        let total = 0;

        if(summaryItem) {
            lastId = summaryItem?.lastId;
            total = summaryItem?.total;
        } else {
            lastId = storeName + '_23040000';
        }

        stateSummary.value[storeName] = { lastId, total }
    }

    return stateSummary.value[storeName]
  }

  async function updateSummary (yourLastId) {
    clearTimeout(timer);

    let lastId = yourLastId;
    let total = stateSummary.value[storeName]?.total + 1;

    stateSummary.value[storeName] = { lastId, total }

    timer = setTimeout(() => {
        
        summaryDb.setItem(storeName, { lastId, total });
        
    }, 3000);
  }

  const createItem = async (value) => {
    // get summary
    const sum = await getSummary();
    // generateID
    const nextId = generateId(sum?.lastId);

    const incrementId = sum?.total + 1 + '';
    // record to set
    const record = { ...value, id: incrementId, uid: nextId, created: new Date().getTime() };
    try {
        // setItem
        await setItem(incrementId, record);
        // update summary
        updateSummary(nextId);
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
    addLog(storeName, 'remove', key, { id: key });
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
      // record to log
      const isNotDuplicate = await addLog(storeName, 'update', key, {
        ...keyValueToUpdate,
      });
      // then set item
      if (isNotDuplicate) {
        await setItem(key, newItem);
      }
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
