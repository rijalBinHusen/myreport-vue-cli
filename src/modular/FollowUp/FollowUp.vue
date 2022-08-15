<template>
    <div>
        <Button primary value="Periode" type="button"/>
        <Datatable
            :datanya="lists"
            :heads="['Periode', 'Pesan']"
            :keys="['periode', 'pesan']"
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
        </Datatable>
    </div>
</template>

<script>
import Button from '@/components/elements/Button.vue'
import Datatable from "../../components/parts/Datatable.vue"
import { unFinished, markAsFinished } from "../../composable/components/followUp"
import { onMounted, ref } from '@vue/runtime-core'
import Dropdown from '@/components/elements/Dropdown.vue'

export default {
    components: { Datatable, Button, Dropdown },
    setup() {
        const lists  = ref([])
        
        const renewLists = async () => {
            lists.value = await unFinished()
        }
        onMounted (() => {
            renewLists()
        })
        
        const handleButton = (ev, obj) => {
            if(ev == 'tanya') {
                let tanya = `Mohon maaf pak mengganggu,%0a%0aMohon saya diberi konfirmasinya pak, terkait pesan saya pada tanggal ${obj.periode}, %0ayang benar yang seperti apa, biar saya masukkan ke catatan saya.%0a%0aadapun pesan saya pada tanggal ${obj.periode} isinya kurang lebih seebagai berikut:%0a%0a${obj.pesan}`
                window.open(`https://wa.me/${obj.tujuan}?text=${tanya}`)
            } else if (ev === 'selesai') {
                markAsFinished(obj?.id)
            }
        }

        return { lists, handleButton }
    }
}
</script>


<style>

</style>