import { full } from "../../composable/piece/dateFormat";
import { startExport } from "../../composable/piece/exportAsFile"
import { getJWTToken, setJWTToken } from "../../utils/cookie";
import { syncClockToServer, syncClockRecordToServer, checkAndsyncBaseClockToServer } from "../BaseReport/BaseReportClock";
import { syncBaseFileToServer, syncBaseFileRecordToServer, checkAndsyncBaseFileToServer } from "../BaseReport/BaseReportFile";
import { syncBaseStockToServer, syncBaseStockRecordToServer, checkAndsyncBaseStockToServer } from "../BaseReport/BaseReportStock";
import { syncItemToServer, syncItemRecordToServer, checkAndsyncItemToServer } from "../BaseItem/Baseitem";
import { syncCasesToServer, syncCaseRecordToServer, checkAndsyncCaseRecordToServer } from "../Cases/Cases";
import { syncComplainsToServer, syncComplainRecordToServer, checkAndSyncComplainRecordToServer } from "../Complains/Complains";
import { syncDocumentToServer, syncDocumentRecordToServer, checkAndsyncDocumentToServer } from "../Documents/DocumentsPeriod";
import { syncFieldProblemToServer, syncFieldProblemRecordToServer, checkAndsyncFieldProblemToServer } from "../FieldProblems/FieldProblem";
import { syncHeadSpvToServer, syncHeadSpvRecordToServer, checkAndsyncHeadSpvToServer } from "../Headspv/Headspv";
import { syncProblemToServer, syncProblemRecordToServer, checkAndsyncProblemToServer } from "../Problems/Problem";
import { syncSupervisorToServer, syncSupervisorRecordToServer, checkAndsyncSupervisorToServer } from "../Supervisors/Supervisors";
import { syncWarehouseToServer, syncWarehouseRecordToServer, checkAndsyncWarehouseToServer } from "../Warehouses/Warehouses";
import { modalClose, loader } from "../../composable/piece/vuexModalLauncher";
import { loaderMessage, progressMessage } from "../../components/parts/Loader/state";
import { postData, deleteData, putData, errorDb } from "../../utils/requestToServer";
import { loginToServer } from "../../utils/loginToServer"
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
    };

    loader();
    // get all record
    // const errorRecords = await db.collection('errorsync').get();
    const db = useIdb('errorsync');
    const errorRecords = await db.getItems<errorDb>();

    // send data to the server
    for (let [index, record] of errorRecords.entries()) {
        progressMessage.value = `Mengirim ulang ${index + 1} dari ${errorRecords.length}`;

        const storeName = record?.endpoint.split("/")[0];
        const idRecord = record?.dataToSend?.id + '';
        const isNotOkeToContinue = record?.operation == 'GET' && typeof idRecord != 'string';

        function activityType (operation: string): string {

            let operationMode = ''

            switch (operation) {
                case 'DELETE':
                    operationMode = 'delete';
                    break;
                case 'PUT':
                    operationMode = 'update';
                    break;
                default:
                    operationMode = 'create';
            }
            
            return operationMode;
        }
        
        if(isNotOkeToContinue) {
            console.log(record?.operation, idRecord)
            continue
        }

        else {

            let isSuccess = true;
    
            try {
    
                switch (storeName) {
                    case 'baseitem':
                        isSuccess = await checkAndsyncItemToServer(idRecord, activityType(record?.operation));
                        break;
                    case 'basereportclock':
                        isSuccess = await checkAndsyncBaseClockToServer(idRecord, activityType(record?.operation));
                        break;
                    case 'basereportfile':
                        isSuccess = await checkAndsyncBaseFileToServer(idRecord, activityType(record?.operation));
                        break;
                    case 'basereportstock':
                        isSuccess = await checkAndsyncBaseStockToServer(idRecord, activityType(record?.operation));
                        break;
                    case 'case':
                        isSuccess = await checkAndsyncCaseRecordToServer(idRecord, activityType(record?.operation));
                        break;
                    case 'complain':
                        isSuccess = await checkAndSyncComplainRecordToServer(idRecord, activityType(record?.operation));
                        break;
                    case 'document':
                        isSuccess = await checkAndsyncDocumentToServer(idRecord, activityType(record?.operation));
                        break;
                    case 'fieldproblem':
                        isSuccess = await checkAndsyncFieldProblemToServer(idRecord, activityType(record?.operation));
                        break;
                    case 'headspv':
                        isSuccess = await checkAndsyncHeadSpvToServer(idRecord, activityType(record?.operation));
                        break;
                    case 'problem':
                        isSuccess = await checkAndsyncProblemToServer(idRecord, activityType(record?.operation));
                        break;
                    case 'supervisor':
                        isSuccess = await checkAndsyncSupervisorToServer(idRecord, activityType(record?.operation));
                        break;
                    case 'warehouse':
                        isSuccess = await checkAndsyncWarehouseToServer(idRecord, activityType(record?.operation));
                        break;
                    default:
                        break;
                }
    
                } catch (err) {
                    isSuccess = false;
                    console.log(err);
                }

                if(isSuccess) {
                    await db.removeItem(record?.id, true);
                }
            }

        }
        

    modalClose()
}

export async function syncAllDataToServer(storeName: string[]) {
    const isTokenExists = getJWTToken();

    if (isTokenExists == null) {
        const tryLogin = await login();

        if (tryLogin === false) {
            alert('Email or password invalid');
            return
        }
    }

    // launch modal
    loader();
    loaderMessage.value = "Mengirim data ke server";

    let isSynced = true;

    for (let [index, store] of storeName.entries()) {

        isSynced = false;

        progressMessage.value = `Sinkronisasi table ${index} dari ${storeName.length}`;
        
        try {

            switch (store) {
                case 'baseitem':
                    isSynced = await syncItemToServer();
                    break;
                case 'basereportclock':
                    isSynced = await syncClockToServer()
                    break;
                case 'basereportfile':
                    isSynced = await syncBaseFileToServer();
                    break;
                case 'basereportstock':
                    isSynced = await syncBaseStockToServer();
                    break;
                case 'cases':
                    isSynced = await syncCasesToServer();
                    break;
                case 'complains':
                    isSynced = await syncComplainsToServer();
                    break;
                case 'document':
                    isSynced = await syncDocumentToServer();
                    break;
                case 'fieldproblem':
                    isSynced = await syncFieldProblemToServer();
                    break;
                case 'headspv':
                    isSynced = await syncHeadSpvToServer();
                    break;
                case 'problem':
                    isSynced = await syncProblemToServer();
                    break;
                case 'supervisors':
                    isSynced = await syncSupervisorToServer();
                    break;
                case 'warehouses':
                    isSynced = await syncWarehouseToServer();
                    break;
                default:
                    break;
            }

        } catch (err) {
            isSynced = false;
            console.log(err);
        }
        
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

    let recordSynced = <{ [key: string]: string[] }>{};

    let isSuccess = true;

    const dbActivity = useIdb('activity');

    const activities = await dbActivity.getItems<Activity>();
    // func.findData({ store: 'activity', criteria: { idLogin: login?.id } })

    if (activities.length) {

        isSuccess = true;

        const sortActivities = activities.sort((recA, recB) => recA.time - recB.time);

        
        for (let [index, activity] of sortActivities.entries()) {

            loaderMessage.value = `Syncing activity ${activities.length - (index + 1)}`;

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

            if(isSuccess) {

                await dbActivity.removeItem(activity.id, true);

            }

        }
    }

    modalClose();

}

export async function getSummaryData () {
    const dbSummary = useIdb("summary");

    let getAllKeys = await dbSummary.getKeys()

    console.log(getAllKeys);
}

export async function createDummyActivity () {

    loader();

    const dbSummary = useIdb('summary');

    const storeNames = await dbSummary.getKeys();

    const activityDb = useIdb("activity");

    for(let [index, storeName] of storeNames.entries()) {

        loaderMessage.value = `Membuat activity dummy ${index} dari ${storeNames.length} nama table`
        
        const dbItem = useIdb(storeName);
        const itemKeys = await dbItem.getKeys();


        for(let [index, idRecord] of itemKeys.entries()) {
            progressMessage.value = `Menanamkan activity ${itemKeys.length - index +1}`

            let time = new Date();

            let recordToSet = <Activity>{
                id: time.getTime() + index + '',
                idRecord,
                store: storeName,
                time: time.getTime(),
                time2: time.toISOString(),
                type: 'create'
            }

            await activityDb.setItem(recordToSet.id, recordToSet);
        }
    }
    

    modalClose();

}