import getCollection from "./storeGetAllDocuments";

const syncData = () => {
  // dapatkan store activity
  const { error, documents } = getCollection("activity");

  console.log(documents);
};

// jika store activity di indexeddb tidak ada
// maka ambil store summary,
// iterate untuk ambil nama store
// setelah dapat nama store, ambil semua data di indexeddb atas nama store tersebut
// kirim ke firebase

// jika ditemukan store activity
// periksa activity terakhir
// bandingkan dengan activity store yang ada difirebase
// jika lebih baru yang difirebase, ambil data dari firebase, simpan ke indexeddb
// jika lebih baru yang di indexeddb, ambil data dari indexeddb, kirim ke firebase

export default syncData;
