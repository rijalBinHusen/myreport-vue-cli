import store from '@/store'

<<<<<<< HEAD
const modalLauncher = (title, formName, obj) => {
    store.commit("Modal/active", { judul: title, form: formName, obj: obj });
=======
export const modalLauncher = (title, formName) => {
    store.commit("Modal/active", {judul: title, form: formName});
>>>>>>> df2374f (Select supervisor in field problem form)
}

export const modalClose = () => {
    store.commit("Modal/active")
<<<<<<< HEAD
}

export const fieldProblem = () => {
    modalLauncher('Tambahkan kendala lapangan', 'FieldProblemForm')
}

export const loader = () => {
    store.commit("Modal/active", {judul: "", form: "Loader"});
=======
>>>>>>> df2374f (Select supervisor in field problem form)
}