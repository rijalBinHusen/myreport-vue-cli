import store from '@/store'

export const modalLauncher = (title, formName) => {
    store.commit("Modal/active", {judul: title, form: formName});
}

export const modalClose = () => {
    store.commit("Modal/active")
}