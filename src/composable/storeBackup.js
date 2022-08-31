import Localbase from "localbase";
let db = new Localbase("myreport");
import func from "../myfunction"
import { startExport } from "./piece/exportAsFile"


export const storeBackup = async (sendToCloud) => {
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
    // export as file
    await startExport(allDocuments, 
        `Backup myreport ${new Date().toISOString()}.json`,
        sendToCloud
    )
}

function getDocument (store) {
    return db.collection(store).get({ keys: true });
}


// ask the user, how "many" user before would backup seperate
// backup all
// find all "many" user activity
export const seperateUsers = async (number, sendToCloud) => {
    const logins = await db
    .collection("login")
    .orderBy("time", "desc")
    .limit(number || 1)
    .get();
    

    let activities = logins.map((val) => 
        func.findData({ store: 'activity', criteria: {idLogin: val?.id}})
    )

    
    Promise.all(activities).then(async (allActivities) => {
        for (let userActivity of allActivities) {
            if(userActivity) {
                let record = {}
                let userActivities = userActivity
                for(let activity of userActivity) {
                    // jika activity.type === create or update
                    if(['create', 'update'].includes(activity?.type)) {
                        // cari datanya pada store (activity.store) dengan id (activity.idRecord)
                        let getRecord = await func.findData({ store: activity?.store, criteria: { id: activity?.idRecord} })
                        // jika ditemukan masukkan ke record
                        // periksa dulu apakah sudah ada storenya 
                        // jika belum bikin 
                        // jika sudah langsung push
                        record[activity?.store]
                            ? record[activity?.store][activity?.idRecord] = getRecord[0] || false
                            : record[activity?.store] = {
                                [activity?.idRecord]: { ...getRecord[0]  } || false
                            }
                        /**
                         * record {
                         *      nameOFStore: {
                         *           idRecord: { contentOfrecord id: 12312,3 123;k123-098-20390912039813 }
                         *          }
                         * }
                         */
                    }
                }
                // waiting for exporting data as file
                if(record.hasOwnProperty(userActivities[0]?.store)) {
                    await func.update({
                        store: 'login',
                        criteria: {id: userActivities[0]?.idLogin },
                        obj: { backup: true }
                    })
                    await startExport({
                        activities: userActivities,
                        record: record
                    }, 
                    userActivities[0]?.idLogin+'.json',
                    sendToCloud
                    )
                }
            }
        }
    })
}
// find all record that user create or update
// and then push into object
// 