import store from '@/store'
import { loaderMessage, progressMessage, progressMessage2 } from "../../components/parts/Loader/state"

export const modalLauncher = (title, formName) => {
    store.commit("Modal/active", {judul: title, form: formName});
}

export const modalClose = () => {
    store.commit("Modal/active")
    loaderMessage.value = '';
    progressMessage.value = '';
    progressMessage2.value = '';
}

export const fieldProblem = () => {
    modalLauncher('Tambahkan kendala lapangan', 'FieldProblemForm')
}

export const loader = () => {
    store.commit("Modal/active", {judul: "", form: "Loader"});
}

export function tunnelMessageTrue () {
    store.commit('Modal/tunnelMessage', true)
}