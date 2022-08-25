import Localbase from "localbase";

// initiate new db
let db = new Localbase("myreport");

let summary = {};
let storeToUpdate = []; //store that would to update
let timeOut;
// login activity, if the localstorage null, so the value is 0
let loginActivity = localStorage.getItem("loginActivity") || 0;
let timeoutActivity;

function getWeekNumber() {
  // get today
  let currentdate = new Date();
  // get the 1 january day
  var oneJan = new Date(currentdate.getFullYear(), 0, 1);
  // get the number of today (currentdate - oneJan) would be epoch number and divide 1 day epoch number
  var numberOfDays = Math.floor((currentdate - oneJan) / (24 * 60 * 60 * 1000));
  // get the number of day + 1 + number of days and divide 1 week ( 170 / 7)
  return Math.ceil((currentdate.getDay() + 1 + numberOfDays) / 7);
}

function generateId(store) {
  // ambil last id dari summary  // kalau tidak ada bikin baru
  let lastId = summary[store]
    ? summary[store].lastId
    : store.slice(0, 3) + "22050000";

  let id = lastId.slice(0, 3);
  // masukkan increment
  // ambil 4 string e.g 0000 akan menjadi 0001
  let increment = Number(lastId.slice(-4)) + 1 + "";
  // 2022
  let fullYear = new Date().getFullYear() + "";
  // 5
  let weekNow = getWeekNumber();
  // 22
  let year = lastId.slice(3, 5); //21
  // 05
  let week = lastId.slice(5, 7); //08
  //if the week same
  if (weekNow === Number(week)) {
    id += year + week;
  }
  //if the week not same
  else {
    // if the week 9 change to 09
    weekNow = weekNow < 9 ? "0" + weekNow : weekNow;
    id += fullYear.slice(2) + weekNow;
    increment = "0";
  }
  //0000
  let result = id + "0000".slice(increment.length) + increment;

  // Update summary
  summary[store] ? false : (summary[store] = {});
  summary[store] = {
    lastId: result,
    total: summary[store].total ? summary[store].total + 1 : 1,
  };

  // rekam store untuk diupdate
  storeToUpdate.includes(store) ? "" : storeToUpdate.push(store);

  // write("summary", store, summary[store]);
  updateSummary();
  // kembalikan
  return result;
}

function updateSummary() {
  // clear timeOut
  clearTimeout(timeOut);

  // wait 2000ms and update summary
  timeOut = setTimeout(async () => {
    for (let i = 0; i < storeToUpdate.length; i++) {
      await write("summary", storeToUpdate[i], summary[storeToUpdate[i]]);
    }

    // empty store to update
    storeToUpdate = [];
  }, 2000);
}

function write(store, document, value) {
  //store = namastore, document = "namaKey" value: { obj: toInput } }
  // db.collection(value.store.toLowerCase()).add(value.obj);
  return db.collection(store.toLowerCase()).doc(document).set(value);
}

function getStoreWithKey(store) {
  return db.collection(store).get({ keys: true });
}

function updateActivity() {
  // clear timeOut
  clearTimeout(timeoutActivity);
  // get id login
  let idLogin = localStorage.getItem('loginya')
  // update activity
  timeoutActivity = setTimeout(() => {
    db.collection("login")
    .doc(idLogin)
    .update({ totalActivity: loginActivity });
    // update loginActivity in localStorage
    localStorage.setItem("loginActivity", loginActivity)
    localStorage.setItem("lastActivity", new Date().getTime() + 14400000)
  }, 2000)
}

async function addActivity(obj) {
  // obj = { type: create, store: nameStore, idRecord: string }
  // get id login
  let idLogin = localStorage.getItem('loginya')
  // jika tidak ada loginya
  if(!idLogin) { 
    idLogin = "starter"
    await write("login", "starter", { id: "starter", time: new Date().getTime() })
    localStorage.setItem('loginya', 'starter')
  }
  // increment login activity
  loginActivity++
  // id activity e.g = log22240001_1
  let idActivity = idLogin+'_'+loginActivity
  // tambahkan activity ke idb
  await write('activity', idActivity, {...obj, id: idActivity, time: new Date().getTime(), idLogin: idLogin})
  updateActivity()
  return {...obj, id: idActivity, time: new Date().getTime()}
}

// ketika aplikasi load, jalankan fungsi ambil summary
getStoreWithKey("summary").then((result) => {
  if (result) {
    result.forEach((val) => {
      summary[val.key] = val.data;
    });
  }
});

function reWriteStoreWithKey(value) {
  // value = {store: nameOfStore: obj: [Array would to wrote]}
  db.collection(value.store).set(value.obj, { keys: true });
}

async function update (value) {
  // { criteria: {id: 001}, obj: { obj: objtoupdate } }
  await addActivity({ type: "update", store: value.store.toLowerCase(), idRecord: value?.criteria?.id })
  db.collection(value.store.toLowerCase())
    .doc(value.criteria)
    .update(value.obj);
}

export default {
  append: async function (value) {
    //{store: "namastore", obj: {obj: toInput } }
    let id = value?.obj?.id ? value?.obj?.id : generateId(value.store.toLowerCase());
    // let result = await
    if(value?.store !== 'login') {
      await addActivity({ type: "create", store: value.store.toLowerCase(), idRecord: id })
    }
    return db
      .collection(value.store.toLowerCase())
      .doc(id)
      .set(Object.assign({ id: id }, value.obj));
  },
  update: update,
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
  reWriteStoreWithKey: reWriteStoreWithKey,
  getData: function (deData) {
    let store = deData.store;

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
    return db.collection(value.store.toLowerCase()).doc(value.criteria).get();
  },
  deleteCollection: function (value) {
    db.collection(value).delete();
  },
  deleteDb: function () {
    db.delete();
  },
  emptyStore: function (value) {
    db.collection(value).set([{}]);
  },
  deleteDocument: async function (value) {
    await addActivity({ type: "delete", store: value.store.toLowerCase(), idRecord: value?.criteria?.id })
    db.collection(value.store.toLowerCase()).doc(value.criteria).delete();
  },
  deleteDocumentByParam: function (value) {
    /*value = {
	store: "nameStore", 
	split: "tahun/bulan/false",
	period: "202203/time()",
	parameter: "parent",
  value: "c08"
    } */
    //keyword = {key: value}
    db.collection(value.store.toLowerCase())
      .doc({ [value.parameter]: value.value })
      .delete();
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
    } // 1 hari sebelumnya time
    else if (a[0] == "-2") {
      a001.setDate(a002 - 2);
      return a001.getTime();
    } // 2 hari sebelumnya time
    else if (a[0] == "-3") {
      a001.setDate(a002 - 3);
      return a001.getTime();
    } // 3 hari sebelumnya time
    else if (a[0] == "0") {
      return a001.getTime() - 25200000;
    } // hari yang tersebut pada jam 00:00
    else if (a[0] == "dateMonth") {
      return (a002 > 9 ? a002 : "0" + a002) + "-" + a007[a003];
    } //dapatkan tanggal bulan dd-mmm
    else if (a[0] === "yearMonth") {
      return a004 + (a003 + 1 > 9 ? a003 : "0" + (a003 + 1));
    } //dapatkan tahun bulan, yyyym
    else if (a[0] === "ymdTime") {
      return new Date(a004 + "/" + (a003 + 1) + "/" + a002).getTime();
    } else if (a[0] === "ymdexcel") {
      return (
        a004 + "/" + (a003 + 1 > 9 ? a003 + 1 : "0" + (a003 + 1)) + "/" + a002
      );
      //dapatkan waktu penuh yyyy/mm/dd
    } else if (a[0] === "ddmmyyyy") {
      return (
        (a002 > 9 ? a002 : "0" + a002) +
        "/" +
        (a003 + 1 > 9 ? a003 + 1 : "0" + (a003 + 1)) +
        "/" +
        a004
      );
    } //dapatkan waktu penuh dd/mm/yyyy
  },
  addActivity
};
