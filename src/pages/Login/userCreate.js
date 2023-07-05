import { ref } from "vue"
import func from "../../myfunction"

const error = ref(null)

const createUser = async (username, password) => {
    error.value = null
    // if the username form or password form empty
    func.getData({store: 'user'})
    try {
        if(!username || !password) {
            throw Error("Username or password can not be empty")
        }
        const user = await func.findData({ store: 'user', criteria: { username: btoa(username) }})
        if(!user) {
            func.append({store: 'user', obj: { username: btoa(username), password: btoa(password) }})
        }
        return "true"
    } catch(err) {
        error.value = err
    }
}

const userCreate = () => {
    return { error, createUser }
}

export default userCreate