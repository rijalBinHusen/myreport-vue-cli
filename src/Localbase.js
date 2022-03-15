import Localbase from "localbase";

let db = new Localbase("myreport");

export default {
  append: function (store, val) {
    //(nameStore, {key: 'value', key: 'value'})
    db.collection(store).add(val);
  },
  update: function (store, id, val) {
    //(nameStore, {id: idData}, {keyToUpdate: 'new value update'})
    db.collection(store).doc(id).update(val);
  },
  reWrite: function (store, val) {
    //(nameStore, [{id: idData}, {key: 'new value'}])
    //write data
    db.collection(store).set(val);
  },
  getData: function (deData) {
    //deData = {'store': nameOfStoreData, 'orderBy': keyData, 'desc': Boolean, 'limit': number, withKey: true}
    //limit order desc
    if (deData.limit && deData.orderBy && deData.desc) {
      return db
        .collection(deData.store)
        .orderBy(deData.orderBy, "desc")
        .limit(deData.limit)
        .get();
    }
    //limit order
    if (deData.limit && deData.orderBy) {
      return db
        .collection(deData.store)
        .orderBy(deData.orderBy)
        .limit(deData.limit)
        .get();
    }
    //limit
    if (deData.limit) {
      return db.collection(deData.store).limit(deData.limit).get();
    }
    //order desc
    if (deData.orderBy && deData.desc) {
      return db.collection(deData.store).orderBy(deData.orderBy, "desc").get();
    }
    //order
    if (deData.orderBy) {
      return db.collection(deData.store).orderBy(deData.orderBy).get();
    }

    // if get all data withKey
    if (deData.withKey) {
      return db.collection(deData.store).get({ keys: true });
    }
    //   all data without key
    return db.collection(deData.store).get();
  },
  findData: function (store, keyword) {
    // keyword = {key: value}
    return db.collection(store).doc(keyword).get();
  },
  deleteCollection: function (store) {
    db.collection(store).delete();
  },
  deleteDb: function () {
    db.delete();
  },
  emptyStore: function (store) {
    db.collection(store).set([]);
  },
  deleteDocument: function (store, keyword) {
    //keyword = {key: value}
    db.collection(store).doc(keyword).delete();
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
      return a001.getTime() - 25200000 - 86400000;
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
