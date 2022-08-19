import { db } from "@/firebase/firebaseApp";
import Problem from "@/modular/ProblemReport/ProblemReport";
import { doc, getDoc } from "firebase/firestore"
import func from "../myfunction"
import addData from "./firebaseAddStore"

// the store that we're gonna sync
let stores = ['problem']

const startSyncingData = async () => {
  // cek dulu apakah pernah di sync sebelumnya
  for(let store of stores) {
    const isSynced = await getDoc(doc(db, 'synced', store));
    // 	kalau ada, periksa tanggal berapa dia sync
    if(isSynced.exists()) {
      const lastSynced = isSynced.data()
      // ambil 30 login terakhir
      const loginHistory = await func.getData({ store: 'login', limit: 30, desc: true, orderBy: 'id'})
      // bandingkan login yang ada di store sync didatabase
      // ambil activity yang lebih besar dari lastSynced login
      const loginHistoryFiltered = loginHistory.filter((log) => log.id >= lastSynced.login)
      // jika ada yang lebih besar
      if(loginHistoryFiltered && loginHistoryFiltered.length) {    
        // iterate loginHistoryFiltered, 
        for(let log of loginHistoryFiltered ) {
          // cari aktivitas yang berkaitan dengan store, 
          const loginActivity = await func.findData({store: 'activity', criteria: { idLogin: log?.id, store: store }})
          // kalau ada aktivitas 
          if(loginActivity) {
            // iterate login activity
            for(let activity of loginActivity) {
              // update atau write, periksa apakah time di login history filtered > lastsynced time
              if(activity?.time > lastSynced?.time) {
                let doc;
                // ambil dulu documentnya, lalu tulis ke firebase
                if(store === 'problem') {
                  doc = await func.findData({ store: 'problem', criteria: {id: activity?.idRecord}})
                                .then(async (doc) => {
                                  let item = await func.findData({store: 'baseitem', criteria: { kode: doc[0]?.item } })
                                  // console.log(item)
                                  return { ...doc[0], item: item[0]?.name}
                                })
                }
                console.log(doc)
                // await addData(store, doc?.id, doc)
              }
            }
          }
        }
      }
      // jika yes push datanya ke firebase
      // periksa tanggal sync firebase dengan aktivitas terakhir
      // jika lebih besar aktivitas terakhir sync ke firebase
      // catat tanggal sync difirebase
    }
  }
//   const querySnapshot = await getDocs(collection(db, 'synced'));

// // jika tidak pernah ada sync sebelumnya
//   if(querySnapshot?.empty) {
//     store.forEach(async (store) => {
//       // 	get semua data yang ada distore
//       await func.findData({ store: store, criteria: { isFinished: false }}).then(async (docs) => {
//         // 	push semua data ke firebase
//         for (let doc of docs) {
//           await addData(store, doc?.id, doc)
//         }

//       addData('synced', store, { login: localStorage.getItem('loginya'), time: new Date().getTime() })
//       })
//     })
//   }

// ========
// berarti kita butuh document tersendiri berjudul sync
// yang berisi nama store dan tanggal terakhir dia sync dan id activity yang melakukan sync
}

export default startSyncingData