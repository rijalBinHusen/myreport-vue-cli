import { ref, getMetadata } from "firebase/storage";
import { storage } from '@/firebase/firebaseApp'

// Create a reference to the file whose metadata we want to retrieve

export const getMetadataByPath = async (path) => {

    // Get metadata properties
    return getMetadata(ref(storage, path))
    .then((metadata) => {
        // Metadata now contains the metadata for 'images/forest.jpg'
        return metadata
    })
    .catch((error) => {
        // Uh-oh, an error occurred!
        console.log(error)
        return error
    });
}