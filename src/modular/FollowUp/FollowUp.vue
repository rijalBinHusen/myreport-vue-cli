<template>
    <div>
        <Datatable
            :datanya="lists"
            :heads="['Periode', 'Pesan']"
            :keys="['periode2', 'pesan']"
            option
            id="followUp"
            #default="{ prop }"
        >
                <Dropdown
                    value="Opsi"  
                    :lists="[
                        { id: 'tanya', isi: 'Tanya lagi'},
                        { id: 'selesai', isi: 'Selesai'},
                    ]"
                    class="w3-small"
                    listsKey="id"
                    listsValue="isi"
                    @trig="handleButton($event, prop)"
                    primary
                />
                <Button 
                    value="Delete" 
                    :datanya="prop.id" 
                    danger 
                    type="button" 
                    class="w3-small" 
                    @trig="remove($event)"
                />
        </Datatable>
    </div>
</template>

<script>
import Button from '@/components/elements/Button.vue'
import Datatable from "../../components/parts/Datatable.vue"
import { unFinished, deleteData } from "../../composable/components/followUp"
import { onMounted, ref } from '@vue/runtime-core'
import Dropdown from '@/components/elements/Dropdown.vue'
import { useStore } from 'vuex'
import { subscribeMutation } from '@/composable/piece/subscribeMutation'

export default {
    components: { Datatable, Button, Dropdown },
    setup() {
        const lists  = ref([])
        const store = useStore()
        
        const renewLists = async () => {
            lists.value = await unFinished()
        }
        onMounted (() => {
            renewLists()
        })

        const remove = async (idRecord) => {
            let confirm = await subscribeMutation('Hapus record', 'Confirm', false, 'Modal/tunnelMessage')
            if(confirm) {
                await deleteData(idRecord)
                renewLists()
            }
        }

        const handleButton = async (ev, obj) => {
            if(ev == 'tanya') {
                let tanya = `Mohon maaf pak mengganggu,%0a%0aMohon saya diberi konfirmasinya pak, terkait pesan saya pada tanggal ${obj.periode}, %0ayang benar yang seperti apa, biar saya masukkan ke catatan saya.%0a%0aadapun pesan saya pada tanggal ${obj.periode} isinya kurang lebih seebagai berikut:%0a%0a${obj.pesan}`
                window.open(`https://wa.me/${obj.tujuan}?text=${tanya}`)
            } else if (ev === 'selesai') {
                let unsubscribe;
                // create a promise to waiting the update process, and listen to the tunnel message
                const prom = new Promise(resolve => {
                        // luncurkan dialog
                        store.commit('Modal/active', { 
                            judul: 'Mark as finish', 
                            form: 'FollowUpFinished', 
                            obj: obj 
                        })
                        // subscribe untuk tanggkap confirm dialog apakah yes atau tidak
                        unsubscribe = store.subscribe(mutation => {
                            // if the confirmation button clicked whatever yes or no
                            if(mutation?.type == 'Modal/active') {
                                // resolve the messaage, true or false
                                resolve()
                            }
                        })
                    })
                    // jika oke kirim pesan
                    await prom.then(() => {
                        unsubscribe()
                        renewLists()
                    })
            }
        }

        return { lists, handleButton, remove }
    }
}
</script>


<style>

</style>