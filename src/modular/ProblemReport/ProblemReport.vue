<template>
    <div>
        <div v-if="!form">
            <Button primary value="Tambah" class="w3-right w3-margin-top" type="button" @trig="form = true"/>
            <Button primary value="Set periode" class="w3-right w3-margin-top" type="button" @trig="pickPeriode" />
            <Datatable
                :datanya="$store.getters['Problem/lists']"
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
import { ref } from '@vue/reactivity'
import { useStore } from 'vuex'

export default {
    setup() {
        
        const form = ref(false)
        const editId =  ref(null)
        const store = useStore()

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

            const { id, periode, ...record } = this.$store.getters["Problem/problemId"](ev)

            store.dispatch("append",
            {
                store: "Problem",
                obj: Object.assign(record, { periode: new Date().getTime() })
            })
        }

        

        return { handleButton, form, editId, pickPeriode }
    },
    components: {
        Button,
        Datatable,
        ProblemReportForm,
        Dropdown
    },async mounted() {
        await this.$store.dispatch("Baseitem/getAllItem");
        await this.$store.dispatch("Problem/getProblemFromDB");
    },
    name: "ProblemReport",
}
</script>
