import { ref } from "vue";
import { useIdb } from "./localforage";
import { getJWTToken, setJWTToken } from "./cookie";
import { loginToServer } from "./loginToServer";
import { checkAndSyncComplainRecordToServer, syncComplainRecordToServer } from "@/pages/Complains/Complains";
import { checkAndsyncSupervisorToServer, syncSupervisorRecordToServer } from "@/pages/Supervisors/Supervisors";
import { checkAndsyncBaseClockToServer, syncClockRecordToServer } from "@/pages/BaseReport/BaseReportClock";
import { checkAndsyncBaseFileToServer, syncBaseFileRecordToServer } from "@/pages/BaseReport/BaseReportFile";
import { checkAndsyncItemToServer, syncItemRecordToServer } from "@/pages/BaseItem/Baseitem";
import { checkAndsyncBaseStockToServer, syncBaseStockRecordToServer } from "@/pages/BaseReport/BaseReportStock";
import { checkAndsyncCaseRecordToServer, syncCaseRecordToServer } from "@/pages/Cases/Cases";
import { checkAndsyncDocumentToServer, syncDocumentRecordToServer } from "@/pages/Documents/DocumentsPeriod";
import { checkAndsyncFieldProblemToServer, syncFieldProblemRecordToServer } from "@/pages/FieldProblems/FieldProblem";
import { checkAndsyncHeadSpvToServer, syncHeadSpvRecordToServer } from "@/pages/Headspv/Headspv";
import { checkAndsyncProblemToServer, syncProblemRecordToServer } from "@/pages/Problems/Problem";
import { checkAndsyncWarehouseToServer, syncWarehouseRecordToServer } from "@/pages/Warehouses/Warehouses";

export const isContinueBasedOnVariable = ref(true);
export const totalToSync = ref(0);
export const syncMode = ref(<'sync' | 'syncAndCheck' | ''>'syncAndCheck');
const timerOut = ref(6000)

let timer: ReturnType<typeof setTimeout>;
let lastActivity: string | null;

interface Activity {
    id: string
    idRecord: string
    time: number
    time2: string
    type: string
    store: string
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

async function startSyncIng() {

    const isTokenExists = getJWTToken();

    if (isTokenExists == null) {
        const tryLogin = await login();

        if (tryLogin !== true) {
            alert('Email or password invalid');
            return
        }
    }

    const activityDB = useIdb('activity');
    const activityKeys = await activityDB.getKeys();
    totalToSync.value = activityKeys.length;
    let recordSynced = <{ [key: string]: string[] }>{};

    if (totalToSync.value === 0) {
        pauseSyncing();
        return;
    }

    
    let isSuccess = false;
    //set timeout to default
    timerOut.value = 2000;
    
    // looping
    for (let key of activityKeys) {

        isSuccess = false;

        let isContinueBasedOnActivity = isContinueBasedOnLastActivity();
        if (!isContinueBasedOnActivity || !isContinueBasedOnVariable.value) {
            if (!isContinueBasedOnActivity) {
                pauseSyncing();
            }
            return;
        };

        const activity = await activityDB.getItem<Activity>(key);

        const isNotForExecute = activity && recordSynced.hasOwnProperty(activity?.store) && recordSynced[activity?.store].includes(activity?.idRecord)

        if (isNotForExecute) {

            isSuccess = true
            continue

        }

        else if (activity && !isNotForExecute) {
            let isSyncAndCheckMode = syncMode.value === 'syncAndCheck';
            let isSyncOnlyMode = syncMode.value === 'sync';

            if (isSyncAndCheckMode) {

                isSuccess = await syncAndCheck(activity?.store, activity.idRecord, activity.type)

            } else if (isSyncOnlyMode) {

                isSuccess = await syncOnly(activity?.store, activity.idRecord, activity.type)

            } else return;


            recordSynced.hasOwnProperty(activity?.store)
                ? recordSynced[activity?.store].push(activity?.idRecord)
                : recordSynced[activity?.store] = [activity?.idRecord];

        }

        if (activity && isSuccess) {

            await activityDB.removeItem(activity?.id, true);
            totalToSync.value--

        }


    }

    // if looping finished, pause sync again so the sync function will run in minute
    pauseSyncing();
}

export function pauseSyncing() {

    isContinueBasedOnVariable.value = false
    startSyncInMinute();
    const clock = new Date(new Date().getTime() + timerOut.value);
    console.log(`Sync will run at: ${clock.toLocaleTimeString()} ${timerOut.value} milisecond!`)

}

async function startSyncInMinute() {
    let isContinue = isContinueBasedOnLastActivity();

    clearTimeout(timer);

    timer = setTimeout(() => {
        if (isContinue && !isContinueBasedOnVariable.value) {

            isContinueBasedOnVariable.value = true;
            startSyncIng();

        } else {

            pauseSyncing();
            
        }
    }, timerOut.value)

    if(isContinue) {

        timerOut.value += 6000;

    }


}

export function incrementTotalSync() {
    totalToSync.value++
}

function isContinueBasedOnLastActivity() {
    const getLastActivity = localStorage.getItem('lastActivity');

    let isContinueBasedOnActivity = getLastActivity === lastActivity;


    lastActivity = getLastActivity;


    return isContinueBasedOnActivity;
}

async function syncAndCheck(storeName: string, idRecord: string, activityType: string): Promise<boolean> {

    let isSuccess = true;

    try {

        switch (storeName) {
            case 'baseitem':
                isSuccess = await checkAndsyncItemToServer(idRecord, activityType);
                break;
            case 'basereportclock':
                isSuccess = await checkAndsyncBaseClockToServer(idRecord, activityType);
                break;
            case 'basereportfile':
                isSuccess = await checkAndsyncBaseFileToServer(idRecord, activityType);
                break;
            case 'basereportstock':
                isSuccess = await checkAndsyncBaseStockToServer(idRecord, activityType);
                break;
            case 'cases':
                isSuccess = await checkAndsyncCaseRecordToServer(idRecord, activityType);
                break;
            case 'complains':
                isSuccess = await checkAndSyncComplainRecordToServer(idRecord, activityType);
                break;
            case 'document':
                isSuccess = await checkAndsyncDocumentToServer(idRecord, activityType);
                break;
            case 'fieldproblem':
                isSuccess = await checkAndsyncFieldProblemToServer(idRecord, activityType);
                break;
            case 'headspv':
                isSuccess = await checkAndsyncHeadSpvToServer(idRecord, activityType);
                break;
            case 'problem':
                isSuccess = await checkAndsyncProblemToServer(idRecord, activityType);
                break;
            case 'supervisors':
                isSuccess = await checkAndsyncSupervisorToServer(idRecord, activityType);
                break;
            case 'warehouses':
                isSuccess = await checkAndsyncWarehouseToServer(idRecord, activityType);
                break;
            default:
                break;
        }

    } catch (err) {
        isSuccess = false;
        console.log(err);
    }

    return isSuccess;
}

async function syncOnly(storeName: string, idRecord: string, activityType: string): Promise<boolean> {

    let isSuccess = true;

    try {

        switch (storeName) {
            case 'baseitem':
                await syncItemRecordToServer(idRecord, activityType);
                break;
            case 'basereportclock':
                await syncClockRecordToServer(idRecord, activityType);
                break;
            case 'basereportfile':
                await syncBaseFileRecordToServer(idRecord, activityType);
                break;
            case 'basereportstock':
                await syncBaseStockRecordToServer(idRecord, activityType);
                break;
            case 'cases':
                await syncCaseRecordToServer(idRecord, activityType);
                break;
            case 'complains':
                await syncComplainRecordToServer(idRecord, activityType);
                break;
            case 'document':
                await syncDocumentRecordToServer(idRecord, activityType);
                break;
            case 'fieldproblem':
                await syncFieldProblemRecordToServer(idRecord, activityType);
                break;
            case 'headspv':
                await syncHeadSpvRecordToServer(idRecord, activityType);
                break;
            case 'problem':
                await syncProblemRecordToServer(idRecord, activityType);
                break;
            case 'supervisors':
                await syncSupervisorRecordToServer(idRecord, activityType);
                break;
            case 'warehouses':
                await syncWarehouseRecordToServer(idRecord, activityType);
                break;
            default:
                break;
        }

    } catch (err) {
        isSuccess = false;
        console.log(err);
    }

    return isSuccess;
}