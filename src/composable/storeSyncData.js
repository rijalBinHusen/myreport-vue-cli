import func from "../myfunction";
import addDocument from "./storeAdd";

const syncData = async () => {
  // dapatkan store login
  let login = await func.getData({ store: "login" });
  // console.log(login)
  // bandingkan login terakhir dengan yang ada difirebase

  // jika ditemukan store activity
  // let activity = await func.findData({ store: "activity",  });
  // periksa activity terakhir
  // bandingkan dengan activity store yang ada difirebase
  // console.log(activity)

    // console.log(await Promise.all(allStores));
  //   return Promise.all(allStores).then(async (val) => {
  //     //   iterate name of store
  //     for (let rec of val) {
  //       // iterate data that contain in name of store
  //       for (let doc of rec?.data) {
  //         // kirim ke firebase
  //         // await addDocument(rec?.store, doc?.key, doc?.data);
  //         console.log(rec?.store, doc?.key, doc?.data)
  //       }
  //     }
  // });
  // jika lebih baru yang difirebase, ambil data dari firebase, simpan ke indexeddb
  // jika lebih baru yang di indexeddb, ambil data dari indexeddb, kirim ke firebase
};
export default syncData;
