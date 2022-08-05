import { ref } from "vue"
import func from "../myfunction"

const error = ref(null)

const signIn = async (username, password) => {
    error.value = null
    try {
        // cari user namenya]
        const user = func.findData({ store: user, criteria: { username: btoa(username) }})
        console.log(user)
        // jika username tidak ada kembalikan error
        if(!user) {
            throw new Error("Username tidak ditemukan")
        }
        // jika user name ada, cocokkan password
        let isMatch = user?.password === btoa(password)
        // jika password tidak cocok, kembalikan error
        if(!isMatch) {
            throw new Error("Password salah")
        }
        // kembalikan success
        return user
    } catch(err) {
        error.value = err
        return
    }
}

const userSignin = () => {
    return { error, signIn }
}

export default userSignin