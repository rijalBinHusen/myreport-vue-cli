import { uploadFile } from "./firebaseStorageUpload"
import addDocument from "../firebaseAddStore";

export const startExport = async (records, fileName, sendToCloud) => {
    // create a download file
    var a = window.document.createElement("a");
    // new blob data
    var file = new Blob([JSON.stringify(records)], { type: "text/plain" });
    console.log(sendToCloud)
    if(sendToCloud) {
        // upload to firebase
        uploadFile(file, fileName)
        // record document that saved to firebase
        addDocument('activitySaved', fileName, true)
    }
    // append file
    a.href = URL.createObjectURL(file);
    // file name
    a.download = fileName;
    //  click download link
    a.click();
    return
}