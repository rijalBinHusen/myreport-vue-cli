import Localbase from "localbase";
let db = new Localbase("myreport");
import func, { updateWithoutAddActivity } from "../myfunction"
import { full } from "./piece/dateFormat";
import { startExport } from "./piece/exportAsFile"
import { getJWTToken, setJWTToken } from "../utils/cookie";
import { syncClockToServer } from "../composable/components/BaseReportClock";
import { syncBaseFileToServer } from "../composable/components/BaseReportFile";
import { syncBaseStockToServer } from "../composable/components/BaseReportStock";
import { syncItemToServer } from "../composable/components/Baseitem";
import { syncCasesToServer } from "../composable/components/Cases";
import { syncComplainsToServer } from "../composable/components/Complains";
import { syncDocumentToServer } from "../composable/components/DocumentsPeriod";
import { syncFieldProblemToServer } from "../composable/components/FieldProblem";
import { syncHeadSpvToServer } from "../composable/components/Headspv";
import { syncProblemToServer } from "../composable/components/Problem";
import { syncSupervisorToServer } from "../composable/components/Supervisors";
import { syncWarehouseToServer } from "../composable/components/Warehouses";
import { modalClose, loader} from "./piece/vuexModalLauncher";
import { loaderMessage, progressMessage } from "../components/parts/Loader/state";
import { loginToServer } from "../utils/loginToServer"

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

export async function syncAllDataToServer() {
    const isTokenExists =  getJWTToken();

    if(isTokenExists == null) {
        const tryLogin = await login();

        if(tryLogin === false) {
            return
        }
    }

    const functionsToSync = [syncItemToServer, syncCasesToServer, syncComplainsToServer, syncDocumentToServer, syncFieldProblemToServer, syncHeadSpvToServer, syncProblemToServer, syncSupervisorToServer, syncWarehouseToServer, syncClockToServer, syncBaseFileToServer, syncBaseStockToServer];

    // launch modal
    loader();
    loaderMessage.value = "Mengirim data ke server";

    for(let [index, func] of functionsToSync.entries()) {
        progressMessage.value = `Sinkronisasi table ${index} dari ${functionsToSync.length}`;
        const isSynced = await func()
        if(!isSynced) {
            modalClose();
            return;
        }
    }

    // const isClockSynced = await syncClockToServer();

    // if(!isClockSynced) {
    //     return;
    // }

    // const isBaseFileSynced = await syncBaseFileToServer();

    // if(!isBaseFileSynced) {
    //     return;
    // }

    // const isBaseStockSynced = await syncBaseStockToServer();

    // if(!isBaseStockSynced) {
    //     return;
    // }

    // const isItemSynced = await syncItemToServer();

    // if(!isItemSynced) {
    //     return;
    // }

    // const isCasesSynced = await syncCasesToServer();

    // if(!isCasesSynced) {
    //     return;
    // }

    // const isComplainSynced = await syncComplainsToServer();

    // if(!isComplainSynced) {
    //     return;
    // }

    // const isDocumentSynced = await syncDocumentToServer();

    // if(!isDocumentSynced) {
    //     return;
    // }

    // const isFieldProblemSynced = await syncFieldProblemToServer();

    // if(!isFieldProblemSynced) {
    //     return;
    // }

    // const isHeadSpvSynced = await syncHeadSpvToServer();

    // if(!isHeadSpvSynced) {
    //     return;
    // }

    // const isProblemSynced = await syncProblemToServer();

    // if(!isProblemSynced) {
    //     return;
    // }

    // const isSupervisorSynced = await syncSupervisorToServer();

    // if(!isSupervisorSynced) {
    //     return;
    // }

    // const isWarehouseSynced = await syncWarehouseToServer();

    // if(!isWarehouseSynced) {
    //     return;
    // }

    alert("All document synced")
    modalClose();


}

async function login() {
    let email = window.prompt('Insert your email');
    let password = window.prompt('Insert your password');

    let reqLogin = await loginToServer(email, password);
    
    const resp = await reqLogin.json();

    if(reqLogin?.status === 200 && reqLogin?.ok === true) {
        setJWTToken(resp?.token);
        return true
    } else {
        alert(resp.message)
        return false
    }
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

