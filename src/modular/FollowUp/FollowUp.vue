<template>
    <div v-if="listsFollowUp.length">
        <Button primary value="Periode" type="button"/>
        <Datatable
            :datanya="listsFollowUp"
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
                        { id: 'pindah', isi: 'Selesai'},
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
import stateFollowUp from "../../composable/components/followUp"
import { computed } from '@vue/runtime-core'
import Dropdown from '@/components/elements/Dropdown.vue'
import { useStore } from 'vuex'

export default {
    components: { Datatable, Button, Dropdown },
    setup() {
        const { lists } = stateFollowUp()
        const store = useStore()
        
        let listsFollowUp = computed(() => {
            if(lists?.value) {
                return lists.value.map((val) => ({
                    ...val, periode: store.getters.dateFormat({ format: 'dateMonth', time: val?.periode })
                })
                )
            }
            return []
        })

        const handleButton = (ev, obj) => {
            if(ev == 'tanya') {
                let tanya = `Mohon maaf pak mengganggu,%0a%0aMohon saya diberi konfirmasinya pak, terkait pesan saya pada tanggal ${obj.periode}, %0ayang benar yang seperti apa, biar saya masukkan ke catatan saya.%0a%0aadapun pesan saya pada tanggal ${obj.periode} isinya kurang lebih seebagai berikut:%0a%0a${obj.pesan}`
                window.open(`https://wa.me/${obj.tujuan}?text=${tanya}`)
                // console.log(process.env)
            //
            //
            }
            // console.log(ev, obj)
        }

        return { listsFollowUp, handleButton }
    }
}
</script>


<style>

</style>