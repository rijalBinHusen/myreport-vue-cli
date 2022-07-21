<template>
    <div v-if="documents">
        <Button primary value="Periode" type="button" @trig="handleButton" />
        <Datatable
            :datanya="documents"
            :heads="['Periode', 'Pesan']"
            :keys="['periode', 'pesan']"
            option
            id="followUp"
            #default="{ prop }"
        >
                <Dropdown
                    value="Problem"  
                    :lists="[
                        { id: 'tanya', isi: 'Tanya lagi'},
                        { id: 'pindah', isi: 'Selesai'},
                    ]"
                    class="w3-small"
                    listsKey="id"
                    listsValue="isi"
                    @trig="handleProblem($event, prop)"
                    primary
                />
        </Datatable>
    </div>
</template>

<script>
// terkait pesan saya pada tanggal 123, yang isinya kurang lebih seebagai berikut:
            // Mohon saya diberi konfirmasinya pak, yang benar yang seperti apa, biar saya masukkan ke catatan saya.
import Button from '@/components/elements/Button.vue'
import Datatable from "../../components/parts/Datatable.vue"
import getAllDocuments from "../../composable/storeGetAllDocuments"
import { onMounted } from '@vue/runtime-core'
import Dropdown from '@/components/elements/Dropdown.vue'

export default {
    components: { Datatable, Button, Dropdown },
    setup() {
        const { error, documents } = getAllDocuments('followup', 100, 'id', true)

        return { error, documents }
    }
}
</script>


<style>

</style>