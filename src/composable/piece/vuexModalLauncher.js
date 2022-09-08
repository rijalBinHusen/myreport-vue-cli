import store from '@/store'

const modalLauncher = (title, formName, obj) => {
    store.commit("Modal/active", { judul: title, form: formName, obj: obj });
}

export const modalClose = () => {
    store.commit("Modal/active")
}

export const fieldProblem = () => {
    modalLauncher('Tambahkan kendala lapangan', 'FieldProblemForm')
}

export const loader = () => {
    store.commit("Modal/active", {judul: "", form: "Loader"});
}