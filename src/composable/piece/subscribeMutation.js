import store from '@/store'

export const subscribeMutation = async (judul, form, obj, subscribeMtation) => {
    let unsubscribe;
    // create a promise to waiting the update process, and listen to the tunnel message
    const prom = new Promise(resolve => {
            // luncurkan dialog
            store.commit('Modal/active', { judul: judul,  form: form,  obj: obj })
            // subscribe untuk tanggkap confirm dialog apakah yes atau tidak
            unsubscribe = store.subscribe(mutation => {
                // if the confirmation button clicked whatever yes or no
                if(mutation?.type == subscribeMtation) {
                    // resolve the messaage, true or false
                    resolve(mutation?.payload)
                }
            })
        })
        // jika oke kirim pesan
    return prom.then((res) => {
        unsubscribe()
        store.commit('Modal/active')
        return res
    })
}