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

    let recordSynced = <{ [key: string]: string[] }>{};

    let isSuccess = true;

    const dbActivity = useIdb('activity');

    const activities = await dbActivity.getItems<Activity>();
    // func.findData({ store: 'activity', criteria: { idLogin: login?.id } })

    if (activities.length) {

        const sortActivities = activities.sort((recA, recB) => recA.time - recB.time);

        
        for (let [index, activity] of sortActivities.entries()) {
         

            // dont sync when time < 1690383553857
            const isNotOkeToSync = activity?.time <= 1690383553857;

            loaderMessage.value = `Syncing activity ${activities.length - (index + 1)}`;

            // tidak di eksekusi
            // id record berada dalam record synced
            // id record berada dalam record synced tapi operation delete

            const isNotForExecute = recordSynced[activity.store] && recordSynced[activity.store].includes(activity.idRecord)

            if (isNotForExecute || isNotOkeToSync) {
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