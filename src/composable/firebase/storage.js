import { ref, uploadBytes, getDownloadURL, getStorage, deleteObject } from "firebase/storage"
import { ref as vueRef } from 'vue'
import { storage } from "../../firebase/firebaseApp"


export const uploadFile = async (file, fileName) => {
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

export const deleteFile = async (path) => {
    // storage
    const storage = getStorage();
    // Create a reference to the file to delete
    const fileRef = ref(storage, path);

    // Delete the file
    return deleteObject(fileRef)
            .then(() => true )
            .catch((error) => {
                // Uh-oh, an error occurred!
                console.log(error)
                return false
            });
};