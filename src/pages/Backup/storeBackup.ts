import { full } from "../../composable/piece/dateFormat";
import { startExport } from "../../composable/piece/exportAsFile"
import { getJWTToken, setJWTToken } from "../../utils/cookie";
import { syncClockToServer, syncClockRecordToServer } from "../BaseReport/BaseReportClock";
import { syncBaseFileToServer, syncBaseFileRecordToServer } from "../BaseReport/BaseReportFile";
import { syncBaseStockToServer, syncBaseStockRecordToServer } from "../BaseReport/BaseReportStock";
import { syncItemToServer, syncItemRecordToServer } from "../BaseItem/Baseitem";
import { syncCasesToServer, syncCaseRecordToServer } from "../Cases/Cases";
import { syncComplainsToServer, syncComplainRecordToServer } from "../Complains/Complains";
import { syncDocumentToServer, syncDocumentRecordToServer } from "../Documents/DocumentsPeriod";
import { syncFieldProblemToServer, syncFieldProblemRecordToServer } from "../FieldProblems/FieldProblem";
import { syncHeadSpvToServer, syncHeadSpvRecordToServer } from "../Headspv/Headspv";
import { syncProblemToServer, syncProblemRecordToServer } from "../Problems/Problem";
import { syncSupervisorToServer, syncSupervisorRecordToServer } from "../Supervisors/Supervisors";
import { syncWarehouseToServer, syncWarehouseRecordToServer } from "../Warehouses/Warehouses";
import { modalClose, loader } from "../../composable/piece/vuexModalLauncher";
import { loaderMessage, progressMessage } from "../../components/parts/Loader/state";
import { postData, deleteData, putData, errorDb } from "../../utils/sendDataToServer";
import { loginToServer } from "../../utils/loginToServer"
import { signOut, type Login } from "@/pages/Login/users";
import { useIdb, type Activity } from "@/utils/localforage"

export interface Backup {
    [key: string]: { [key: string]: string | number | boolean }[]
}

export const storeBackup = async (sendToCloud: boolean) => {
    // will store all document that we saved in idexeddb
    let allDocuments: Backup = {}
    // initiate documents, because activity store, not recorded in summary store
    const dbSummary = useIdb('summary');
    const summaryKeys = await dbSummary.getKeys();
    allDocuments['summary'] = [];

    let documents = ['activity']

    for (let store of summaryKeys) {
        const db = useIdb(store);

        const getItems = await db.getItems<{ [key: string]: string | number | boolean }>();
        const getSummary = await dbSummary.getItem<any>(store);

        allDocuments[store] = getItems;
        if (getSummary !== null) {
            allDocuments['summary'].push(getSummary);
        }
    }
    // export as file
    await startExport(allDocuments,
        `Backup myreport ${new Date().toISOString()}.json`,
        false
    )
}

export async function errorSyncResend() {
    const isTokenExists = getJWTToken();

    if (isTokenExists == null) {
        const tryLogin = await login();

        if (tryLogin === false) {
            alert('Email or password invalid');
            return
        }
    }

    loader();
    // get all record
    // const errorRecords = await db.collection('errorsync').get();
    const db = useIdb('errorsync');
    const errorRecords = await db.getItems<errorDb>();

    // send data to the server
    for (let [index, record] of errorRecords.entries()) {
        progressMessage.value = `Mengirim ulang ${index + 1} dari ${errorRecords.length}`;
        try {
            let isSuccess = false
            switch (record?.operation) {
                case 'POST':
                    isSuccess = await postData(record?.endpoint, record?.dataToSend);
                    break;
                case 'DELETE':
                    isSuccess = await deleteData(record?.endpoint)
                    break;
                case 'PUT':
                    isSuccess = await putData(record?.endpoint, record?.dataToSend);
                    break;
                default:
                    break;
            }

            if (isSuccess) {

                await db.removeItem(record.id)

            }

        } catch (err) {

            console.log(err);

        }
    }

    modalClose()
}

export async function syncAllDataToServer() {
    const isTokenExists = getJWTToken();

    if (isTokenExists == null) {
        const tryLogin = await login();

        if (tryLogin === false) {
            alert('Email or password invalid');
            return
        }
    }

    const functionsToSync = [syncItemToServer, syncCasesToServer, syncComplainsToServer, syncDocumentToServer, syncFieldProblemToServer, syncHeadSpvToServer, syncProblemToServer, syncSupervisorToServer, syncWarehouseToServer, syncClockToServer, syncBaseFileToServer, syncBaseStockToServer];

    // launch modal
    loader();
    loaderMessage.value = "Mengirim data ke server";

    for (let [index, func] of functionsToSync.entries()) {
        progressMessage.value = `Sinkronisasi table ${index} dari ${functionsToSync.length}`;
        const isSynced = await func();

        if (!isSynced) {
            modalClose();
            return;
        }

    }

    alert("All document synced");
    modalClose();

}

async function login() {
    let email = window.prompt('Insert your email');
    let password = window.prompt('Insert your password');

    let reqLogin = await loginToServer(email, password);

    const resp = await reqLogin.json();

    if (reqLogin?.status === 200 && reqLogin?.ok === true) {
        setJWTToken(resp?.token);
        return true
    } else {
        alert(resp.message)
        return false
    }
}

export async function syncBasedOnActivity() {
    const isTokenExists = getJWTToken();

    if (isTokenExists == null) {
        const tryLogin = await login();

        if (tryLogin === false) {
            alert('Email or password invalid');
            return
        }
    }
    // const storeToBackup = ['baseitem', 'basereportclock', 'basereportfile', 'basereportstock', 'cases', 'complains', 'document', 'fieldproblem', 'headspv', 'problem', 'supervisors', 'warehouses']
    loader();

    const dbLogin = useIdb('login');

    const loginRecords = await dbLogin.getItemsByKeyValue<Login>('backup', false)

    if (!loginRecords) {
        alert("All login is synced!");
        modalClose();
        return true
    }

    let recordSynced = <{ [key: string]: string[] }>{};

    let isSuccess = true;

    for (let [index, login] of loginRecords.entries()) {

        progressMessage.value = '';

        loaderMessage.value = `Syncing login ${index + 1} dari ${loginRecords.length}`;

        const dbActivity = useIdb('activity');

        const loginActivities = await dbActivity.getItemsByKeyValue<Activity>('idLogin', login.id);
        // func.findData({ store: 'activity', criteria: { idLogin: login?.id } })

        if (loginActivities) {

            const sortActivities = loginActivities.sort((recA, recB) => recA.time - recB.time);

            for (let [index, activity] of sortActivities.entries()) {

                progressMessage.value = `Syncing activity ${index + 1} dari ${loginActivities.length}`;

                // tidak di eksekusi
                // id record berada dalam record synced
                // id record berada dalam record synced tapi operation delete

                const isNotForExecute = recordSynced[activity.store] && recordSynced[activity.store].includes(activity.idRecord)

                if (isNotForExecute) {
                    // dont do anything
                    // console.warn(`Record ${activity.idRecord} exists, it should be doesn't send request to server`)
                    continue;
                }

                else {

                    try {

                        switch (activity.store) {
                            case 'baseitem':
                                await syncItemRecordToServer(activity.idRecord, activity.type);
                                break;
                            case 'basereportclock':
                                await syncClockRecordToServer(activity.idRecord, activity.type);
                                break;
                            case 'basereportfile':
                                await syncBaseFileRecordToServer(activity.idRecord, activity.type);
                                break;
                            case 'basereportstock':
                                await syncBaseStockRecordToServer(activity.idRecord, activity.type);
                                break;
                            case 'cases':
                                await syncCaseRecordToServer(activity.idRecord, activity.type);
                                break;
                            case 'complains':
                                await syncComplainRecordToServer(activity.idRecord, activity.type);
                                break;
                            case 'document':
                                await syncDocumentRecordToServer(activity.idRecord, activity.type);
                                break;
                            case 'fieldproblem':
                                await syncFieldProblemRecordToServer(activity.idRecord, activity.type);
                                break;
                            case 'headspv':
                                await syncHeadSpvRecordToServer(activity.idRecord, activity.type);
                                break;
                            case 'problem':
                                await syncProblemRecordToServer(activity.idRecord, activity.type);
                                break;
                            case 'supervisors':
                                await syncSupervisorRecordToServer(activity.idRecord, activity.type);
                                break;
                            case 'warehouses':
                                await syncWarehouseRecordToServer(activity.idRecord, activity.type);
                                break;
                            default:
                                break;
                        }

                    } catch (err) {
                        isSuccess = false;
                        console.log(err);
                    }


                    // record that synced
                    recordSynced.hasOwnProperty(activity.store)
                        ? recordSynced[activity.store].push(activity.idRecord)
                        : recordSynced[activity.store] = [activity.idRecord];

                }

            }
        }
        process.env.NODE_ENV === 'development' ? '' : await dbLogin.updateItem(login.id, { backup: true })
        // updateWithoutAddActivity('login', { id: login?.id }, { backup: true })
    }

    modalClose();

    if (isSuccess) {

        process.env.NODE_ENV === 'development' ? '' : signOut();

    }

}


// ask the user, how "many" user before would backup seperate
// backup all
// find all "many" user activity
// export const seperateUsers = async (sendToCloud: boolean) => {
//     const logins = await func.findData({ store: 'login', criteria: { backup: false } })

//     if (!logins) { return true }

//     let activities = logins.map(async (val) => {
//         if (val) {
//             await updateWithoutAddActivity('login', { id: val?.id }, { backup: true })
//             return func.findData({ store: 'activity', criteria: { idLogin: val?.id } })
//         }
//     })

//     await Promise.all(activities).then(async (allActivities) => {
//         for (let userActivity of allActivities) {
//             if (userActivity) {
//                 let record = {}
//                 let userActivities = userActivity
//                 for (let activity of userActivity) {

//                     record[activity?.store]
//                         ? false
//                         : record[activity?.store] = {}
//                     // jika activity.type === create or update dan belum pernah di lakukan pencarian sebelumnya
//                     if (['create', 'update'].includes(activity?.type) && activity?.idRecord && !record[activity?.store].hasOwnProperty(activity?.idRecord)) {
//                         // cari datanya pada store (activity.store) dengan id (activity.idRecord)
//                         let getRecord = await func.findData({ store: activity?.store, criteria: { id: activity?.idRecord } })
//                         // jika ditemukan masukkan ke record
//                         // periksa dulu apakah sudah ada storenya 
//                         // jika belum bikin 
//                         // jika sudah langsung push
//                         if (getRecord) {
//                             record[activity?.store][activity?.idRecord] = getRecord[0] || false
//                         }
//                         /**
//                          * record {
//                          *      nameOFStore: {
//                          *           idRecord: { contentOfrecord id: 12312,3 123;k123-098-20390912039813 }
//                          *          }
//                          * }
//                          */
//                     }
//                 }
//                 // waiting for exporting data as file
//                 if (record.hasOwnProperty(userActivities[0]?.store)) {
//                     // console.log(record)
//                     await startExport({
//                         activities: userActivities,
//                         record: record
//                     },
//                         full(userActivities[0]?.time) + '.json',
//                         sendToCloud
//                     )
//                 }
//             }
//         }
//     })
//     return true
// }
// find all record that user create or update
// and then push into object
// 
