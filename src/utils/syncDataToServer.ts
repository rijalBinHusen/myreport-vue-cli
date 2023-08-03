import { ref } from "vue";
import { useIdb } from "./localforage";
import { getJWTToken, setJWTToken } from "./cookie";
import { loginToServer } from "./loginToServer";
import { checkAndSyncComplainRecordToServer } from "@/pages/Complains/Complains";
import { checkAndsyncSupervisorToServer } from "@/pages/Supervisors/Supervisors";
import { checkAndsyncBaseClockToServer } from "@/pages/BaseReport/BaseReportClock";
import { checkAndsyncBaseFileToServer } from "@/pages/BaseReport/BaseReportFile";
import { checkAndsyncItemToServer } from "@/pages/BaseItem/Baseitem";
import { checkAndsyncBaseStockToServer } from "@/pages/BaseReport/BaseReportStock";
import { checkAndsyncCaseRecordToServer } from "@/pages/Cases/Cases";
import { checkAndsyncDocumentToServer } from "@/pages/Documents/DocumentsPeriod";
import { checkAndsyncFieldProblemToServer } from "@/pages/FieldProblems/FieldProblem";
import { checkAndsyncHeadSpvToServer } from "@/pages/Headspv/Headspv";
import { checkAndsyncProblemToServer } from "@/pages/Problems/Problem";
import { checkAndsyncWarehouseToServer } from "@/pages/Warehouses/Warehouses";

export const isContinue = ref(true);
export const totalToSync = ref(0);
let timer:ReturnType<typeof setTimeout>;
let lastActivity:string|null;

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

    // ifTheValue > 1000
    if(totalToSync.value > 1000) {
        activityKeys.splice(1000, totalToSync.value);
    }
    // else
    if(activityKeys.length === 0) return;

    // looping
    for(let key of activityKeys) {

        let isSuccess = true;

        let isContinue = checkLastActivity();
        if(!isContinue) {
            pauseSyncing();
            return;
        };
        
        const activity = await activityDB.getItem<Activity>(key);

        const isNotForExecute = activity && recordSynced.hasOwnProperty(activity?.store) && recordSynced[activity?.store].includes(activity?.idRecord)

        if (isNotForExecute) {
            
            continue

        }
        
        else if(activity && !isNotForExecute) {
            try {

                switch (activity.store) {
                    case 'baseitem':
                        await checkAndsyncItemToServer(activity.idRecord, activity.type);
                        break;
                    case 'basereportclock':
                        await checkAndsyncBaseClockToServer(activity.idRecord, activity.type);
                        break;
                    case 'basereportfile':
                        await checkAndsyncBaseFileToServer(activity.idRecord, activity.type);
                        break;
                    case 'basereportstock':
                        await checkAndsyncBaseStockToServer(activity.idRecord, activity.type);
                        break;
                    case 'cases':
                        await checkAndsyncCaseRecordToServer(activity.idRecord, activity.type);
                        break;
                    case 'complains':
                        await checkAndSyncComplainRecordToServer(activity.idRecord, activity.type);
                        break;
                    case 'document':
                        await checkAndsyncDocumentToServer(activity.idRecord, activity.type);
                        break;
                    case 'fieldproblem':
                        await checkAndsyncFieldProblemToServer(activity.idRecord, activity.type);
                        break;
                    case 'headspv':
                        await checkAndsyncHeadSpvToServer(activity.idRecord, activity.type);
                        break;
                    case 'problem':
                        await checkAndsyncProblemToServer(activity.idRecord, activity.type);
                        break;
                    case 'supervisors':
                        await checkAndsyncSupervisorToServer(activity.idRecord, activity.type);
                        break;
                    case 'warehouses':
                        await checkAndsyncWarehouseToServer(activity.idRecord, activity.type);
                        break;
                    default:
                        break;
                }

            } catch (err) {
                isSuccess = false;
                console.log(err);
            }

            recordSynced.hasOwnProperty(activity?.store)
                        ? recordSynced[activity?.store].push(activity?.idRecord)
                        : recordSynced[activity?.store] = [activity?.idRecord];
    
            if(isSuccess) {
    
                await activityDB.removeItem(activity?.id, true);
                totalToSync.value--
    
            }
        }


    }
    // ifIsCountinue == false
}

export function pauseSyncing () {

    isContinue.value = false
    startSyncInMinute();
}

async function startSyncInMinute() {
    let isContinue = checkLastActivity();

    console.log('start syncing: ',isContinue)

    clearTimeout(timer);

    timer = setTimeout(() => {
        if(isContinue) {

            startSyncIng();

        } else {
            
            startSyncInMinute()

        }
    }, 4000)
}

export function incrementTotalSync() {
    totalToSync.value++
}

function checkLastActivity () {
    const checkLastActivity = localStorage.getItem('lastActivity');

    isContinue.value = checkLastActivity == lastActivity;

    lastActivity = checkLastActivity;

    return isContinue.value;
}