import { doc, setDoc } from "firebase/firestore";

const addDocument = (nameStore, idStore, data) => {
    return setDoc(doc(nameStore, idStore, data?.id), data)
}

export default addDocument