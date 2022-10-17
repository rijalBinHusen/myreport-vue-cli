import { db } from "@/firebase/firebaseApp";
import { doc, setDoc } from "firebase/firestore";

const addDocument = (nameStore, keyStore, data) => {
  return setDoc(doc(db, nameStore, keyStore), { ...data, time: new Date().getTime() });
};

export default addDocument;
