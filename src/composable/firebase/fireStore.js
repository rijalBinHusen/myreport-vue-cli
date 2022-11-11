import { db } from "@/firebase/firebaseApp";
import { doc, setDoc, deleteDoc, getDocs, collection } from "firebase/firestore";
import { ref } from "vue";

export const result = ref([])
const nowStore = ref('')

export const addDocument = (nameStore, keyStore, data) => {
  return setDoc(doc(db, nameStore, keyStore), { ...data, time: new Date().getTime() });
};

export const deleteDocumentByKey = (nameStore, key) => {
  result.value = result.value.filter((res) => res.id !== key)
  return deleteDoc(doc(db, nameStore, key))
}

export const getStore = async (store) => {
  nowStore.value = store
  if(nowStore.value == store && result.value.length) { return }
  const querySnapshot = await getDocs(collection(db, store));
  if(!querySnapshot?.empty){
      querySnapshot.forEach((doc) => {
          result.value.push({ id: doc.id, ...doc.data() })
      })
  }
}