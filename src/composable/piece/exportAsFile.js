import { uploadFile } from "../firebase/storage"
import { addDocument } from "../firebase/fireStore";

export const startExport = async (records, fileName, sendToCloud) => {
    // create a download file
    var a = window.document.createElement("a");
    // new blob data
    var file = new Blob([JSON.stringify(records)], { type: "text/plain" });
    
    if(sendToCloud) {
        // upload to firebase
        const { error, downloadURL } = await uploadFile(file, fileName)
        // record document that saved to firebase
        if(error.value) {
            console.log(error.value)
            alert('Something went wrong, check the console')
        }
        addDocument('activitySaved', fileName, { uploaded: true, downloadURL: downloadURL.value })
    }
    // append file
    a.href = URL.createObjectURL(file);
    // file name
    a.download = fileName;
    //  click download link
    a.click();
    return
}