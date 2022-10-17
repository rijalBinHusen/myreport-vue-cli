import { ref, listAll } from "firebase/storage";
import { storage } from '@/firebase/firebaseApp'
import { getMetadataByPath } from "./firebaseStorageMetaData";


export const listsFile = async () => {

    // Create a reference under which you want to list
    const listRef = ref(storage, '');
    
    // Find all the prefixes and items.
    listAll(listRef)
    .then((res) => {
    res.prefixes.forEach((folderRef) => {
        // All the prefixes under listRef.
        // You may call listAll() recursively on them.
    });
    res.items.forEach(async (itemRef) => {
        // All the items under listRef.
        console.log(await getMetadataByPath(itemRef.fullPath))
    });
  }).catch((error) => {
      // Uh-oh, an error occurred!
      console.log(error)
    });
}