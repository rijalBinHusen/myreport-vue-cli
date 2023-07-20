<template>
<div class="">
    <div class="w3-border w3-padding w3-container">
        <label >Set record to show : </label>
        <Button primary value="Set" type="button" @trig="pickPeriode" />
        <Button primary class="w3-right" value="Add" type="button" @trig="handleButton" />
    </div>
    <Datatable
        v-if="lists"
        :datanya="lists"
        :heads="['Nama', 'Gudang', 'Periode', 'Collected', 'Kabag', 'Approve']"
        :keys="['spvName', 'warehouseName', 'periode2', 'collected2', 'headName', 'approval2']"
        option
        id="tableEditDocument"
        v-slot:default="{ prop }"
    >
        <span>
            <Button 
                value="Edit" 
                type="button" 
                primary small 
                :datanya="prop.id"
                @trig="handleButton($event)" 
            />
            
            <Button 
                value="Delete" 
                type="button" 
                danger small 
                :datanya="prop.id"
                @trig="remove($event)" 
            />

        </span>
    </Datatable>
    <!-- </table> -->
			
</div>
</template>

<script>
import Button from "@/components/elements/Button.vue"
import Datatable from "@/components/parts/Datatable.vue"
import { lists as listsOfDocuments, Documents } from './Documents/DocumentsPeriod'
import { subscribeMutation } from '@/composable/piece/subscribeMutation'
import { ref } from '@vue/reactivity'
import { useStore } from 'vuex'
import { onMounted } from '@vue/runtime-core'

export default {
    setup() {
        const lists = ref([])
        const store = useStore()
        const { getDocuments, removeDocument } = Documents()

        const pickPeriode = async () => {
            let period = await subscribeMutation("Set periode to show", "PeriodePicker",  false, 'Modal/tunnelMessage')
            if(period) {
                //open the loader
                store.commit("Modal/active", {judul: "", form: "Loader"})
                // wait the process
                await getDocuments(period?.periode1, period?.periode2)
                //close the loader
                store.commit("Modal/active")
                renewLists()
            }
        }

        const handleButton = async (ev) => {
            let judul = ev ? 'Edit dokumen' : 'Tambahkan dokumen'
            let res = await subscribeMutation(judul, 'DocumentSingleForm', { idDocument: ev }, 'Modal/tunnelMessage')
            if(res) {
                renewLists()
            }
        }

        onMounted(() => {
            renewLists()
        })

        const renewLists = async () => {
            lists.value = await listsOfDocuments()
        }

        const remove = async (idDocument) => {
            let res = await subscribeMutation('', 'Confirm', {}, 'Modal/tunnelMessage')
            if(res) {
                await removeDocument(idDocument)
                renewLists()
            }
        }

        return { lists, pickPeriode, handleButton, remove }
    },
    components: {
        Button,
        Datatable,
    },
}
</script>@/pages/Documents/DocumentsPeriod