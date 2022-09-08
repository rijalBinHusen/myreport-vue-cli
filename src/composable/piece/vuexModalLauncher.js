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
<<<<<<< HEAD
=======
>>>>>>> df2374f (Select supervisor in field problem form)
=======
>>>>>>> 196a663 (update field problem and renew lists)
}