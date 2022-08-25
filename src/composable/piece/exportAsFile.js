import { uploadFile } from "./firebaseStorageUpload"


export const startExport = async (records, fileName) => {
    // create a download file
    var a = window.document.createElement("a");
    // new blob data
    var file = new Blob([JSON.stringify(records)], { type: "text/plain" });
    // upload to firebase
    uploadFile(file, fileName)
    // append file
    a.href = URL.createObjectURL(file);
    // file name
    a.download = fileName;
    //  click download link
    a.click();
    return
}