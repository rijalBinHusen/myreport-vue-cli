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
import Datatable from "../../components/parts/Datatable.vue"
import Button from "../../components/elements/Button.vue"
import ProblemReportForm from "./ProblemReportForm.vue"
import Dropdown from '../../components/elements/Dropdown.vue'
import { problem } from '../../composable/periodePickerProps'
import { useStore } from 'vuex'
import { onMounted, ref } from "vue"

export default {
    setup() {
        
        const form = ref(false)
        const editId =  ref(null)
        const store = useStore()
        const lists = ref([])

        const handleButton = (action, id) => {
            if(action === 'edit') {
                editId.value = id
                form.value = true
                return
            }
            duplicate(id)
        }

        
        const pickPeriode = () => {
            store.commit("Modal/active", problem);
        }
        

        const duplicate = (ev) =>{
            let confirm = window.confirm("Apakah anda yakin akan menduplikat record tersebut?")
            if(!confirm) { return }

            const { id, periode, ...record } = store.getters["Problem/problemId"](ev)

            store.dispatch("append",
            {
                store: "Problem",
                obj: Object.assign(record, { periode: new Date().getTime() })
            })
        }

        onMounted( async () => {
            await store.dispatch("Baseitem/getAllItem");
            await store.dispatch("Problem/getProblemFromDB");
            lists.value = await Promise.all(store.getters['Problem/lists']).then(res => res)
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
