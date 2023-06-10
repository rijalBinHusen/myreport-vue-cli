import Localbase from "localbase";
let db = new Localbase("myreport");
import func, { updateWithoutAddActivity } from "../myfunction"
import { full } from "./piece/dateFormat";
import { startExport } from "./piece/exportAsFile"

const backendURL = "http://localhost/rest-php/myreport/";

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

export async function syncToServer () {
    const stores = ["baseitem", "basereportclock", "basereportfile", "basereportstock", "cases", "complains", "document", "fieldproblem", "headspv", "problem", "supervisors", "warehouses"]

    for(let store of stores) {
        const records = await getDocument(store);
        for(let record of records) {

        }
    }
}

async function sendWarehouse(warehouseRecord) {
    const data = {
        "warehouse_name": warehouseRecord?.name,
        "warehouse_group": warehouseRecord?.group || "",
        "warehouse_supervisors": warehouseRecord?.supervisors.toString()
      };
    
    await postData(data, 'warehouse');
}

async function postData (data, endPoint) {
    
    let headersList = {
        "Accept": "application/json",
        "JWT-Authorization": "",
        "Content-Type": "application/json"
       }
       
       let bodyContent = JSON.stringify(data);
       
       let response = await fetch(backendURL + endPoint, { 
         method: "POST",
         body: bodyContent,
         headers: headersList
       });
}

export async function syncToServerByActivity() {

}

/**
 * 
 * 
 * base_clock, 
base_item, 
base_report_file, 
base_stock, 
cases, 
case_import, 
complains, 
complain_improt, 
document, 
field_problem, 
head_spv, 
problem, 
supervisor, 
warehouse
 */

function getDocument (store) {
    return db.collection(store).get({ keys: true });
}


// ask the user, how "many" user before would backup seperate
// backup all
// find all "many" user activity
export const seperateUsers = async (sendToCloud) => {
    const logins = await func.findData({ store: 'login', criteria: { backup: false }})
    
    if(!logins) {  return true }
    
    let activities = logins.map( async (val) => {
        if(val) {
            await updateWithoutAddActivity('login', { id: val?.id }, { backup: true })
            return func.findData({ store: 'activity', criteria: { idLogin: val?.id }})
        }
    })
    
    await Promise.all(activities).then(async (allActivities) => {
        for (let userActivity of allActivities) {
            if(userActivity) {
                let record = {}
                let userActivities = userActivity
                for(let activity of userActivity) {

                    record[activity?.store]
                        ? false 
                        : record[activity?.store] = {  }
                    // jika activity.type === create or update dan belum pernah di lakukan pencarian sebelumnya
                    if(['create', 'update'].includes(activity?.type) && activity?.idRecord && !record[activity?.store].hasOwnProperty(activity?.idRecord)) {
                        // cari datanya pada store (activity.store) dengan id (activity.idRecord)
                        let getRecord = await func.findData({ store: activity?.store, criteria: { id: activity?.idRecord} })
                        // jika ditemukan masukkan ke record
                        // periksa dulu apakah sudah ada storenya 
                        // jika belum bikin 
                        // jika sudah langsung push
                        if(getRecord) {
                            record[activity?.store][activity?.idRecord] = getRecord[0] || false
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
                    // console.log(record)
                    await startExport({
                        activities: userActivities,
                        record: record
                    },
                    full(userActivities[0]?.time) +'.json', 
                    sendToCloud                    
                    )
                }
            }
        }
    })
    return true
}
// find all record that user create or update
// and then push into object
// 

