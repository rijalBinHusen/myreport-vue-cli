import { db } from "@/firebase/firebaseApp";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const addDocument = (nameStore, keyStore, data) => {
  return setDoc(doc(db, nameStore, keyStore), { ...data, time: serverTimestamp() });
};

export default addDocument;
