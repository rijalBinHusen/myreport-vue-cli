import { db } from "@/firebase/firebaseApp";
import { doc, setDoc, deleteDoc } from "firebase/firestore";

export const addDocument = (nameStore, keyStore, data) => {
  return setDoc(doc(db, nameStore, keyStore), { ...data, time: new Date().getTime() });
};

export const deleteDocumentByKey = (nameStore, key) => {
  return deleteDoc(doc(db, nameStore, key))
}