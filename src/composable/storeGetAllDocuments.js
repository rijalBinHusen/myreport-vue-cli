import Localbase from "localbase";
let db = new Localbase("myreport");

import { ref } from "vue";

const getCollection = (collection, limit, orderBy, isDesc) => {
  const documents = ref(null);
  const error = ref(null);
  let promise;

  //limit order desc
  if (limit && orderBy && isDesc) {
    promise = db
      .collection(collection)
      .orderBy(orderBy, "desc")
      .limit(limit)
      .get();
  }
  //limit order
  else if (limit && orderBy) {
    promise = db.collection(collection).orderBy(orderBy).limit(limit).get();
  }
  //limit
  else if (limit) {
    promise = db.collection(collection).limit(limit).get();
  }
  //   //order desc
  else if (orderBy && isDesc) {
    promise = db.collection(collection).orderBy(orderBy, "desc").get();
  }
  //   //order
  else if (orderBy) {
    promise = db.collection(collection).orderBy(orderBy).get();
  }
  //   all data without key
  else {
    promise = db.collection(collection).get();
  }

  promise.then((val) => (documents.value = val));

  return { documents, error };
};

export default getCollection;

// function (deData) {
//     let collection = collection;

//   },
