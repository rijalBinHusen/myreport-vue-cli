import { db } from "@/firebase/firebaseApp";
import { collection, getDocs } from "firebase/firestore"

const getStore = async (store, key) => {
    const querySnapshot = await getDocs(collection(db, "baseitem"));
    console.log(querySnapshot)
}

export default getStore