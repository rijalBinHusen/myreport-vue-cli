import { db } from "@/firebase/firebaseApp";
import { collection, getDocs } from "firebase/firestore"
import { ref } from "vue";

export const result = ref([])
const nowStore = ref('')

export const getStore = async (store, key) => {
    nowStore.value = store
    if(nowStore.value == store && result.value.length) { return }
    const querySnapshot = await getDocs(collection(db, store));
    if(!querySnapshot?.empty){
        querySnapshot.forEach((doc) => {
            result.value.push({ id: doc.id, ...doc.data() })
        })
    }
}