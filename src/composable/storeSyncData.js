import { db } from "@/firebase/firebaseApp";
import { doc, getDoc } from "firebase/firestore"
import func from "../myfunction"
import syncProblem from "./piece/firebaseSyncProblem"
import addData from "./firebase/firebaseAddStore"
import syncCases from "./piece/firebaseSyncCases"

// the store that we're gonna sync
let stores = ['problem', 'cases', 'complains']

const startSyncingData = async () => {
  // ambil 30 login terakhir
  const loginHistory = await func.getData({ store: 'login', limit: 30, desc: true, orderBy: 'time'})
  // cek dulu apakah pernah di sync sebelumnya
  for(let store of stores) {
    const isSynced = await getDoc(doc(db, 'synced', store));
    // 	kalau ada, periksa tanggal berapa dia sync
    if(isSynced.data()) {
      const lastSynced = isSynced.data()
      // bandingkan login yang ada di store sync didatabase
      // jika ada time lebih besar
      if(loginHistory && loginHistory[0]?.time > lastSynced?.time) {    
        // ambil activity yang lebih besar dari lastSynced login
        const loginHistoryFiltered = loginHistory.filter((log) => log.id >= lastSynced.login)
        // iterate loginHistoryFiltered, 
        for(let log of loginHistoryFiltered ) {
          // cari aktivitas yang berkaitan dengan store, 
          const loginActivity = await func.findData({store: 'activity', criteria: { idLogin: log?.id, store: store }})
          // kalau ada aktivitas 
          if(loginActivity) {
            // iterate login activity
            for(let activity of loginActivity) {
              // update atau write, periksa apakah time di login history filtered > lastsynced time
              if(activity?.time > lastSynced?.time && ['create', 'update'].includes(activity?.type)) {
                // ambil dulu documentnya, lalu tulis ke firebase
                if(store === 'problem') {
                  await syncProblem(activity?.idRecord)
                } else {
                  console.log('masuk')
                  await syncCases(store, activity?.idRecord)
                }
              }
            }
          }
        }
        // record to synced document
        await syncedDocument(store)
      }
    } else {
      // ====================== Problem
      if(store === 'problem') {
        let docs = await func.findData({ store: store, criteria: { isFinished: false } })
        if(docs && docs?.length) {
          // iterate and insert to firebase
          for(let doc of docs) {
            // insert to firebase
            await syncProblem(doc?.id)
          }
        }
      }
      else {
        // =================== cases and complains
        let docs = await func.getData({store: store})
        for (let doc of docs) {
          await syncCases(store, doc?.id)
        }
        // console.log(docs)
        // the record we would show like:
        // periode | name spv | masalah
        //  the details would show:
        // | sumber masalah | solusi | pic | dl
      }
      // record to synced document
      await syncedDocument(store)
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

//       })
//     })
//   }

// ========
// berarti kita butuh document tersendiri berjudul sync
// yang berisi nama store dan tanggal terakhir dia sync dan id activity yang melakukan sync
}


// record in synced document
const syncedDocument = (nameStore) => {
  return addData('synced', nameStore, { login: localStorage.getItem('loginya'), time: new Date().getTime() })
}

export default startSyncingData