import { ref } from "vue"
import func from "../myfunction"

const error = ref(null)

const signIn = async (username, password) => {
    error.value = null
    try {
        // cari user namenya]
        const user = await func.findData({ store: 'user', criteria: { username: btoa(username) }})
        // jika username tidak ada kembalikan error
        if(!user) {
            throw new Error("Username tidak ditemukan")
        }
        // jika user name ada, cocokkan password
        let isMatch = user[0]?.password === btoa(password)
        // jika password tidak cocok, kembalikan error
        if(!isMatch) {
            throw new Error("Password salah")
        }
        // kembalikan success
        func.append({ store: 'login', obj: { username: user[0]?.username, time: new Date().getTime(), totalActivity: 0 }}).then((val) => {
            localStorage.setItem('loginya', val?.data?.id)
            localStorage.setItem('loginActivity', 0)
            localStorage.setItem('lastActivity', new Date().getTime() + 14400000)
        })
        await func.tunggu(2500)
        return true
    } catch(err) {
        error.value = err
        return
    }
}

const userSignin = () => {
    return { error, signIn }
}

export default userSignin