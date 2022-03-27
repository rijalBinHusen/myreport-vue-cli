import Localbase from "localbase";

// initiate new db
let db = new Localbase("myreport");
// ---------------------- function to setup the store

function storenya(store, split, period) {
  //value = {store: "namastore", split: "tahun/bulan/false", period: "202203/time()"}
  let mainStore = localStorage.getItem("store")
    ? JSON.parse(localStorage.getItem("store"))
    : [];
  let newStore = store;
  //-----------------------------fungsi waktu splitter---------------
  //202203
  const a001 = period ? new Date(period) : new Date();
  const a003 = a001.getMonth();
  const a004 = a001.getFullYear();
  const splitter = a004 + (a003 + 1 > 8 ? a004 : "0" + (a003 + 1));

  //-----------------------------------------------------------
  //jika split
  if (split) {
    //jika pisah bulan
    if (split === "bulan") {
      newStore = store.toLowerCase() + splitter;
    }
    // jika pisah tahun
    else if (split === "tahun") {
      newStore = store.toLowerCase() + splitter.slice(0, 4);
    }
  }

  let isOldStore = mainStore.find(
    (val) => val.nameOfStore === newStore.toLowerCase()
  );
  if (!isOldStore) {
    mainStore.push({
      nameOfStore: newStore.toLowerCase(),
      starter: split ? false : true,
    });
    localStorage.setItem("store", JSON.stringify(mainStore));
  }
  // console.log(isOldStore);
  // console.log(mainStore);
  // console.log(mainStore);
  return newStore.toLowerCase();
}

// ---------------------- function to setup the store

// crud function to indexeddb

export default {
  append: function (value) {
    /*value = {
	store: "nameStore", 
	split: "tahun/bulan/false",
	period: "202203/time()"
	obj: {key: 'value', obj: 'to input to store'}, 
    } */

    //{store: "namastore", split: "tahun/bulan/false", period: "202203/time()"}
    db.collection(storenya(value.store, value.split, value.period)).add(
      value.obj
    );
  },
  update: function (value) {
    /*value = {
		store: "nameStore",
		split: "tahun/bulan/false",
		period: "202203/time()"
		obj: {id: 'iddata', key: 'value', obj: 'value to update'}, 
    } */
    db.collection(storenya(value.store, value.split, value.period))
      .doc({ id: value.obj.id })
      .update(value.obj);
  },
  reWrite: function (value) {
    /*value = {
	store: "nameStore",
	id: idData
	obj: [{key: 'value', obj: 'value to update'}], 
	split: "tahun/bulan/false",
	period: "202203/time()"
    	} */
    //(nameStore, [{id: idData}, {key: 'new value'}])
    //write data
    db.collection(storenya(value.store, value.split, value.period))
      .doc({ id: value.id })
      .set(value.obj);
  },
  reWriteStoreWithKey: function (value) {
    // console.log(value);
    // value = {store: nameOfStore: obj: [Array would to wrote]}
    db.collection(value.store).set(value.obj, { keys: true });
  },
  getData: function (deData) {
    /*deData = {
	store: "nameStore", 
	split: "tahun/bulan/false",
	period: "202203/time()"
	'orderBy': keyData, 
	'desc': Boolean, 
	'limit': number, 
	withKey: true
    	} */
    let store = storenya(deData.store, deData.split, deData.period);

    //limit order desc
    if (deData.limit && deData.orderBy && deData.desc) {
      return db
        .collection(store)
        .orderBy(deData.orderBy, "desc")
        .limit(deData.limit)
        .get();
    }
    //limit order
    if (deData.limit && deData.orderBy) {
      return db
        .collection(store)
        .orderBy(deData.orderBy)
        .limit(deData.limit)
        .get();
    }
    //limit
    if (deData.limit) {
      return db.collection(store).limit(deData.limit).get();
    }
    //order desc
    if (deData.orderBy && deData.desc) {
      return db.collection(store).orderBy(deData.orderBy, "desc").get();
    }
    //order
    if (deData.orderBy) {
      return db.collection(store).orderBy(deData.orderBy).get();
    }

    // if get all data withKey
    if (deData.withKey) {
      return db.collection(store).get({ keys: true });
    }
    //   all data without key
    return db.collection(store).get();
  },
  findData: function (value) {
    /*value = {
	store: "nameStore", 
	split: "tahun/bulan/false",
	period: "202203/time()"
	obj: {key: value}
    	} */
    return db
      .collection(storenya(value.store, value.split, value.period))
      .doc(value.obj)
      .get();
  },
  deleteCollection: function (value) {
    /*value = {
	store: "nameStore", 
	split: "tahun/bulan/false",
	period: "202203/time()"/
    	} */
    if (typeof value === "object") {
      db.collection(storenya(value.store, value.split, value.period)).delete();
    } else {
      db.collection(value).delete();
    }
  },
  deleteDb: function () {
    db.delete();
  },
  emptyStore: function (value) {
    /*value = {
	store: "nameStore", 
	split: "tahun/bulan/false",
	period: "202203/time()"
    	} */
    if (typeof value === "object") {
      db.collection(storenya(value.store, value.split, value.period)).set({});
    } else {
      db.collection(value).set([{}]);
    }
  },
  deleteDocument: function (value) {
    /*value = {
	store: "nameStore", 
	split: "tahun/bulan/false",
	period: "202203/time()"
	id: idData
    } */
    //keyword = {key: value}
    db.collection(storenya(value.store, value.split, value.period))
      .doc({ id: value.id })
      .delete();
  },
  generateId: function (id, waktu) {
    //DIV
    let masterId = id.slice(0, 3);
    //0003 as 3 on will be +1
    let increment = Number(id.slice(3)) + 1 + "";

    if (waktu) {
      //ABS21080001
      increment = Number(id.slice(-4)) + 1 + "";
      let fullYear = new Date().getFullYear() + "";
      let monthNow = new Date().getMonth() + 1;
      let year = id.slice(3, 5); //21
      let month = id.slice(5, 7); //08
      //if the month same
      if (monthNow === Number(month)) {
        masterId += year + month;
      }
      //if the month not same
      else {
        // if the month 9 change to 09
        monthNow = monthNow < 9 ? "0" + monthNow : monthNow;
        masterId += fullYear.slice(2) + monthNow;
        increment = "0";
      }
    }
    //0000
    let length = "0000".slice(increment.length);

    //DIV0001
    return masterId + length + increment;
  },
  tunggu: function (time) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), time);
    });
  },
  ribuan: function (a) {
    return a.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  },
  dateFormat: function (a) {
    // a = ["full", new Date()]
    const a001 = a[1] ? new Date(a[1]) : new Date();
    const a002 = a001.getDate();
    const a003 = a001.getMonth();
    const a004 = a001.getFullYear();
    const a005 = a001.getHours() > 9 ? a001.getHours() : "0" + a001.getHours();
    const a006 =
      a001.getMinutes() > 9 ? a001.getMinutes() : "0" + a001.getMinutes();
    const a007 = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Aug",
      "Sept",
      "Oct",
      "Nov",
      "Des",
    ];

    if (a[0] == "time") {
      return a001.getTime();
    } //dapatkan waktu dalam bentuk mili second
    else if (a[0] == "full") {
      return a002 + " " + a007[a003] + " " + a004 + " " + a005 + ":" + a006;
    } //dapatkan waktu penuh dd mmm yyyy hh:mm
    else if (a[0] == "+1") {
      return a001.getTime() - 25200000 + 86400000;
    } // hari selanjutnya pada jam 00:00
    else if (a[0] == "-1") {
      a001.setDate(a002 - 1);
      return a001.getTime();
    } // hari sebelumnya pada jam 00:00
    else if (a[0] == "0") {
      return a001.getTime() - 25200000;
    } // hari yang tersebut pada jam 00:00
    else if (a[0] == "dateMonth") {
      return a002 + "-" + a007[a003];
    } //dapatkan tanggal bulan dd-mmm
    else if (a[0] === "yearMonth") {
      return a004 + (a003 + 1 > 9 ? a003 : "0" + (a003 + 1));
    } //dapatkan tahun bulan, yyyym
  },
};
