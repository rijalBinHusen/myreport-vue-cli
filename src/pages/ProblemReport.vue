<template>
    <div>
        <div v-if="!form">
            <Button primary value="Tambah" class="w3-right w3-margin-top" type="button" @trig="form = true"/>
            <Button primary value="Set periode" class="w3-right w3-margin-top" type="button" @trig="pickPeriode" />
            <Datatable
                v-if="lists"
                :datanya="lists"
                :heads="['Gudang', 'Nama item', 'Masalah', 'Tanggal mulai', 'Karu', 'Status']"
                :keys="['namaGudang', 'namaItem', 'masalah', 'periode', 'supervisor', 'status']"
                option
                id="tableProblemReport"
                #default="{ prop }"
            >
                
                <Dropdown 
                    value="Opsi" 
                    :lists="[
                        { id: 'edit', content: 'Edit'}, 
                        { id: 'duplicate', content: 'Duplicate'}
                    ]"
                    listsKey="id"
                    listsValue="content"
                    @trig="handleButton($event, prop?.id)"
                    primary
                />
            </Datatable>
        </div>
        <ProblemReportForm :id="editId" v-else @exit="form = false; editId = ''" />
     </div>
</template>

<script>
import Datatable from "@/components/parts/Datatable.vue"
import Button from "@/components/elements/Button.vue"
import ProblemReportForm from "@/form/ProblemReportForm.vue"
import Dropdown from '@/components/elements/Dropdown.vue'
import { useStore } from 'vuex'
import { onMounted, ref, watch } from "vue"
import { getProblemFromDB, listsProblem, getProblemBetweenPeriode, duplicate } from '@/composable/components/Problem'
import { subscribeMutation } from '@/composable/piece/subscribeMutation'

export default {
    setup() {
        
        const form = ref(false)
        const editId =  ref(null)
        const store = useStore()
        const lists = ref([])

        const handleButton = async (action, id) => {
            if(action === 'edit') {
                editId.value = id
                form.value = true
                return
            }
            // THE ACTION is to duplicate record
            let res = await subscribeMutation(
                '',
                'Confirm',
                { pesan: 'Record akan di gandakan'},
                'Modal/tunnelMessage'
            )

            if(res) {
                await duplicate(id)
            }
            renewLists()
        }

        
        const pickPeriode = async () => {
            let res = await subscribeMutation(
                'Masukkan periode yang akan ditampikan',
                'PeriodePicker',
                {},
                'Modal/tunnelMessage'
            )

            if(res) {
                store.commit("Modal/active", {judul: "", form: "Loader"});
                await getProblemBetweenPeriode(res?.periode1, res?.periode2)
                store.commit("Modal/active");
            }
            renewLists()
        }
        
        watch([ form ], (newVal) => {
            newVal[0] == false
            ? renewLists()
            : ''
        })

        const renewLists = async () => {
            lists.value = await listsProblem()
        }

        onMounted( async () => {
            await store.dispatch("Baseitem/getAllItem");
            await getProblemFromDB()
            await renewLists()
        })

        return { handleButton, form, editId, pickPeriode, lists }
    },
    components: {
        Button,
        Datatable,
        ProblemReportForm,
        Dropdown
    },
    name: "ProblemReport",
}
</script>
