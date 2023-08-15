import { ref } from "vue"
import { useIdb } from "@/utils/localforage"
import { waitFor } from "@/utils/piece/waiting"

const error = ref('')
const storeName = "user";
const endPoint = "user/";

interface User {
    id: string
    password: string
    username: string
}

export interface Login {
    backup: boolean
    id: string
    time: number
    totalActivity: number
    username: string
}

const signIn = async (username: string, password: string) => {
    error.value = ''
    try {
        const db = useIdb(storeName);
        const dbLogin = useIdb('login');
        // cari user namenya]
        const user = await db.getItemsByKeyValue<User>('username', btoa(username));
        // func.findData({ store: , criteria: { username: btoa(username) }})
        // jika username tidak ada kembalikan error
        if (!user) {
            throw new Error("Username tidak ditemukan")
        }
        // jika user name ada, cocokkan password
        let isMatch = user[0]?.password === btoa(password)
        // jika password tidak cocok, kembalikan error
        if (!isMatch) {
            throw new Error("Username atau password salah")
        }
        // kembalikan success
        const insertedId = await dbLogin.createItem({
            username: user[0]?.username,
            time: new Date().getTime(),
            totalActivity: 0,
            backup: false,
        })

        await waitFor(600)

        if(insertedId === undefined) return;
        
        const loginStore = new LoginStorage();
        loginStore.loginStart(insertedId)

        return true
    } catch (err: any) {
        error.value = err
        return false
    }
}

export const userSignin = () => {
    return { error, signIn }
}

const createUser = async (username: string, password: string) => {
    error.value = ''
    // if the username form or password form empty
    try {
        const db = useIdb(storeName);
        if (!username || !password) {
            throw Error("Username or password can not be empty")
        }
        const user = await db.getItemsByKeyValue<User>('username', btoa(username));
        if (user.length > 0) {
            throw Error("Username exists");
        }
        await db.createItem({ username: btoa(username), password: btoa(password) })
        return true

    } catch (err: any) {
        error.value = err
        return false
    }
}

export const userCreate = () => {
    return { error, createUser }
}

export const signOut = () => {
    const loginStore = new LoginStorage();
    loginStore.loginEnd();
}

export class LoginStorage {

    loginId:string|null = '';
    logId = 'loginya'
    logAct = 'loginActivity'
    lastAct = 'lastActivity'


    constructor () {
        this.loginId = localStorage.getItem(this.logId);
    }
    
    loginStart (loginya: string) {
        this.loginId = loginya;
        localStorage.setItem(this.logId, loginya);
        localStorage.setItem(this.logAct, '0');
        this.updateLastActivity();
    }

    loginEnd () {
        if(this.isLoginNotOke()) return;
        localStorage.removeItem(this.logId)
        localStorage.removeItem(this.logAct)
        localStorage.removeItem(this.lastAct)
        location.reload()
    }

    updateLastActivity () {
        if(this.isLoginNotOke()) return;
        localStorage.setItem(this.lastAct, new Date().getTime() + 14400000 + '')
    }

    isLoginNotOke() {
        
        return !Boolean(this.loginId)

    }


}


import { progressMessage2 } from "../../components/parts/Loader/state";
import { postData, getData as getDataOnServer, putData, deleteData } from "@/utils/requestToServer"
export async function syncUsersToServer () {
    const db = useIdb(storeName);

    let allData = await db.getItems<User>();
  
    for(let [index, datum] of allData.entries()) {
  
        let dataToSend = {
            id: datum?.id,
            password: datum?.password,
            username: datum?.username
          }
  
      try {
        progressMessage2.value = `Mengirim data ${index} dari ${allData.length}`
        await postData(endPoint, dataToSend);
  
      } catch(err) {
        
        console.log(err)
        // return false;
  
  
      }
    }
    return true
  }


export async function syncUserRecordToServer (idRecord: string, mode: string) {

if(typeof idRecord !== 'string') {
    alert("Id record must be string");
    return;
}

const db = useIdb(storeName);

let record = await db.getItem<User>(idRecord);
// await getDataByKey(storeName, idRecord);

if(!record && mode != 'delete') {
    // dont do anything if record doesn't exist;
    return
}

let dataToSend = {
    id: record?.id || '',
    password: record?.password || '',
    username: record?.username || ''
  }

try {
    if(mode === 'create') {

        await postData(endPoint, dataToSend);

    } 
    
    else if(mode === 'update') {

        await putData(endPoint+ idRecord, dataToSend)

    }

    else if (mode === 'delete') {
        await deleteData(endPoint+ idRecord)
    }

} catch(err) {
    
    const errorMessage = 'Failed to send warehouse record id :' + idRecord +' with message: ' +err;
//   alert(errorMessage); 
    console.error(errorMessage);

    return false;
}

return true;
}

  export async function checkAndsyncUserToServer(idRecord: string, mode: string) {

    if(typeof idRecord !== 'string') {
        alert("Id record warehouse must be a string");
        return true
    }
  
    const isCreateMode = mode === 'create'; 
    const isUpdateMode = mode === 'update';
    const isDeleteMode = mode === 'delete';
  
    let isSynced = false;
  
    if(isDeleteMode) {
        // the server must be return 404
        const getOnServer = await getDataOnServer(endPoint + idRecord);
  
        const isExistsOnServer = getOnServer?.status === 200
  
        if(isExistsOnServer) {
            let syncing = await syncUserRecordToServer(idRecord, 'delete')
            isSynced = Boolean(syncing);
        } else {
            isSynced = true
        }
    }
  
    else if(isCreateMode || isUpdateMode) {
        const dbItem = useIdb(storeName);
        const getItemInLocal = await dbItem.getItem<User>(idRecord);
        const getItemInServer = await getDataOnServer(endPoint + idRecord);
  
        const isLocalExists = Boolean(getItemInLocal?.id);
        const isServerExists = getItemInServer?.status === 200;
  
        if(isLocalExists && isServerExists) {

            const waitingServerKeyValue = await getItemInServer.json();
            const serverKeyValue = waitingServerKeyValue?.data[0] as User;
            
            const isNameNotSame = serverKeyValue["username"] != getItemInLocal?.username;
            const isPasswordNotSame = serverKeyValue["password"] != getItemInLocal?.password;
  
            let isAnyValueToUpdate = isNameNotSame || isPasswordNotSame;
  
            if(isAnyValueToUpdate) {
  
              let syncing = await syncUserRecordToServer(idRecord, 'update')
              isSynced = Boolean(syncing);
  
            } else {

                isSynced = true
                
            }
  
        }
  
        else if(isLocalExists && !isServerExists) {
  
          let syncing = await syncUserRecordToServer(idRecord, 'create')
          isSynced = Boolean(syncing);
  
        }

        else {
          isSynced = true
        }
    }

    return isSynced

  }


  export async function implantUsersFromServer () {
    const fetchEndPoint = await getDataOnServer(`warehouses/`);
    const isFetchFailed = fetchEndPoint?.status != 200;
  
    if(isFetchFailed) return;
  
    const dbItem = useIdb(storeName);
  
    const waitingServerKeyValue = await fetchEndPoint.json();
    const items: User[] = waitingServerKeyValue?.data
  
    for(let [index, item] of items.entries()) {
        progressMessage2.value = `Menanamkan nama gudang, ${index + 1} dari ${items.length}`;
  
        let recordToSet:User = {
            id: item?.id || '',
            password: item?.password || '',
            username: item?.username || ''
          }
  
        await dbItem.setItem(item.id, recordToSet);
    }
  
    progressMessage2.value = ''
  }