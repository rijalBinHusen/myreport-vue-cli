import { db } from "@/firebase/firebaseApp";
import { collection, getDocs } from "firebase/firestore"
import func from "../myfunction"
import addData from "./firebaseAddStore"

// the store that we're gonna sync
let store = ['problem']

import getStore from "./firebaseGetAllDocument";
// cek dulu apakah pernah di sync sebelumnya
const startSyncingData = async () => {
  const querySnapshot = await getDocs(collection(db, 'sync'));
  // 	kalau ada, periksa tanggal berapa dia sync
  // 	ambil activitas store terakhir
  // 	periksa tanggal sync firebase dengan aktivitas terakhir
  // 	jika lebih besar aktivitas terakhir sync ke firebase
// 	catat tanggal sync difirebase

// jika tidak pernah ada sync sebelumnya
  if(querySnapshot?.empty) {
    store.forEach(async (store) => {
      // 	get semua data yang ada distore
      await func.findData({ store: store, criteria: { isFinished: false }}).then(async (docs) => {
        // 	push semua data ke firebase
        for (let doc of docs) {
          await addData(store, doc?.id, doc)
        }

      addData('synced', store, { login: localStorage.getItem('loginya'), time: new Date().getTime() })
      })
    })
  }

// ========
// berarti kita butuh document tersendiri berjudul sync
// yang berisi nama store dan tanggal terakhir dia sync dan id activity yang melakukan sync
}

export default startSyncingData