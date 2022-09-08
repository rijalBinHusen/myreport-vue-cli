import store from '@/store'

const modalLauncher = (title, formName) => {
    store.commit("Modal/active", {judul: title, form: formName});
}

export const modalClose = () => {
    store.commit("Modal/active")
}

export const fieldProblem = () => {
    modalLauncher('Tambahkan kendala lapangan', 'FieldProblemVue')
}

export const loader = () => {
    store.commit("Modal/active", {judul: "", form: "Loader"});
}