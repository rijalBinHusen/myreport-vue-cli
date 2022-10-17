import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { ref as vueRef } from 'vue'
import { storage } from "../../firebase/firebaseApp"


const uploadFile = async (file, fileName) => {
    const downloadURL = vueRef('')
    const error = vueRef('')
    const storageRef = ref(storage, 'myreport/'+fileName)
    try {
        const res = await uploadBytes(storageRef, file)
        downloadURL.value = await getDownloadURL(res.ref)
    } catch (err) {
        console.log(err.message)
        error.value = err.meesage
    }

    return { downloadURL, error }
}

export default uploadFile;
