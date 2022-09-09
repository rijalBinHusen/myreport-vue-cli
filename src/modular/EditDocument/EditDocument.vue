<template>
<div class="">
    <div class="w3-border w3-padding w3-container">
        <label for="periode">Set record to show : </label>
        <Button id="periode" primary value="Set" type="button" @trig="pickPeriode" />
        <Button primary class="w3-right" value="Add" type="button" @trig="addDocument" />
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
                @trig="edit(prop)" 
            />

        </span>
    </Datatable>
    <!-- </table> -->
			
</div>
</template>

<script>
import Button from "../../components/elements/Button.vue"
import Datatable from "../../components/parts/Datatable.vue"
import { getDocuments } from '../../composable/components/DocumentsPeriod'
import { listsOfDocuments } from '../../composable/components/DocumentsPeriod'
import { subscribeMutation } from '@/composable/piece/subscribeMutation'
import { ref } from '@vue/reactivity'
import { useStore } from 'vuex'

export default {
    setup() {
        const lists = ref([])
        const store = useStore()

        const pickPeriode = async () => {
            let period = await subscribeMutation("Set periode to show", "PeriodePicker",  false, 'Modal/tunnelMessage')
            //open the loader
            store.commit("Modal/active", {judul: "", form: "Loader"})
            // wait the process
            await getDocuments(period?.periode1, period?.periode2)
            //close the loader
            store.commit("Modal/active")
            renewLists()
        }

        const edit = (ev) => {
            // EV =  {action: 'approve', val: -1, rec: doc22050003}
            store.commit("Modal/active", { 
                judul: "Edit document", 
                form: "EditDocumentForm",
                obj: ev,
            });
        }

        const addDocument= () => {
            store.commit("Modal/active", {  judul: "Add document",  form: "AddDocumentForm", });
        }

        const renewLists = async () => {
            lists.value = await listsOfDocuments()
        }

        return { lists, pickPeriode, edit, addDocument }
    },
    components: {
        Button,
        Datatable,
    },
}
</script>