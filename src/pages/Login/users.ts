import { ref } from "vue"
import { useIdb } from "@/utils/localforage"
import { waitFor } from "@/utils/piece/waiting"

const error = ref('')

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
        const db = useIdb('user');
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
        const db = useIdb('user');
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