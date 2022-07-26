import func from "../myfunction"

const syncData = async () => {
  // dapatkan store activity
  let activity = await func.getData({store: "activity"})
  let allStores = []
  
  // jika store activity di indexeddb tidak ada
  if(!activity.length) {
    
    // maka ambil store summary,
    let summary = await func.getData({store: "summary", withKey: true})
    // iterate untuk ambil nama store
    summary.forEach((val) => {
      // setelah dapat nama store, ambil semua data di indexeddb atas nama store tersebut
      allStores.push(func.getData({store: val?.key}).then((res) => {
        return {
          store: val?.key,
          data: res
        }
      }))
    })
  }
  console.log(await Promise.all(allStores))
  // kirim ke firebase
  
  // jika ditemukan store activity
  // periksa activity terakhir
  // bandingkan dengan activity store yang ada difirebase
  // jika lebih baru yang difirebase, ambil data dari firebase, simpan ke indexeddb
  // jika lebih baru yang di indexeddb, ambil data dari indexeddb, kirim ke firebase
  
};
export default syncData;
