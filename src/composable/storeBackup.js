import Localbase from "localbase";
let db = new Localbase("myreport");


const storeBackup = async () => {
    // will store all document that we saved in idexeddb
    let allDocuments = {}
    // initiate documents, because activity store, not recorded in summary store
    let documents = ['activity']
    // get summary store
    await getDocument('summary').then((val) => {
        // push summary store to the allDocuments
        allDocuments['summary'] = val
        // push each nameStore to documents
        val.forEach((val) => {
            documents.push(val?.key)
        })
    })
    // iterate documents to get each database that recorded in summary
    for (let doc of documents) {
        // wait until the promise finished
        await getDocument(doc).then((res) => {
            // wehen finished, push to allDocuments
            allDocuments[doc] = res
        })
    }
     // create a download file
     var a = window.document.createElement("a");
     // new blob data
     var file = new Blob([JSON.stringify(allDocuments)], { type: "text/plain" });
     // append file
     a.href = URL.createObjectURL(file);
     // file name
     a.download = `Backup myreport ${new Date().toISOString()}.json`;
    //  click download link
    a.click();
}

function getDocument (store) {
    return db.collection(store).get({ keys: true });
}

export default storeBackup;