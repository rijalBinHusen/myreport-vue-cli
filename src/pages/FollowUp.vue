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
import Datatable from "@/components/parts/Datatable.vue"
import { unFinished, deleteData } from "@/composable/components/followUp"
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
            console.log('asdfasdf')
        })

        const remove = async (idRecord) => {
            let confirm = await subscribeMutation('', 'Confirm', false, 'Modal/tunnelMessage')
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
                let prom = await subscribeMutation(
                                'Tandai sudah selesai', 
                                'FollowUpFinished', 
                                obj, 
                                'Modal/tunnelMessage'
                            )
                
                if(prom) { renewLists() }
            }
        }

        return { lists, handleButton, remove }
    }
}
</script>


<style>

</style>