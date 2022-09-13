import { ref, uploadBytes } from "firebase/storage"
import { storage } from "../../firebase/firebaseApp"


export const uploadFile = async (file, fileName) => {
    const storageRef = ref(storage, 'myreport/'+fileName)
    await uploadBytes(storageRef, file)
}