<template>
<div class="">
    <div class="w3-border w3-padding w3-container">
        <label for="periode">Set record to show : </label>
        <Button id="periode" primary value="Set" type="button" @trig="pickPeriode" />
        <Button primary class="w3-right" value="Add" type="button" @trig="addDocument" />
    </div>
    <Datatable
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
import { computed } from '@vue/runtime-core'
import Button from "../../components/elements/Button.vue"
import Datatable from "../../components/parts/Datatable.vue"
import { getDocuments } from '../../composable/components/DocumentsPeriod'
import { listsOfDocuments } from '../../composable/components/DocumentsPeriod'

export default {
    name: "Collect",
    data() {
        return {
            lists: [],
            unsubscribe: "",
            timeOut: "",
        };
    },
    components: {
        Button,
        Datatable,
    },
    methods: {
        pickPeriode() {
            let unsubscribe;
            this.$store.commit("Modal/active", { 
                judul: "Set periode to show", 
                form: "PeriodePicker", 
                store: false, 
                btnValue: "Show",
                tunnelMessage: true,
            });

            const promise = new Promise (resolve => {
                unsubscribe = this.$store.subscribe(mutation => {
                    if (mutation.type === 'Modal/tunnelMessage') {
                        //get the payload that send to tunnel message
                    resolve(mutation?.payload)
                    }
                })
            })
            
            promise.then(async val => {
                //open the loader
                this.$store.commit("Modal/active", {judul: "", form: "Loader"})
                // wait the process
                await getDocuments(val?.periode1, val?.periode2)
                //unsubscribe the mutation
                unsubscribe()
                //close the loader
                this.$store.commit("Modal/active")
                this.renewLists()
            })
        },

        edit(ev) {
            // EV =  {action: 'approve', val: -1, rec: doc22050003}
            this.$store.commit("Modal/active", { 
                judul: "Edit document", 
                form: "EditDocumentForm",
                obj: ev,
            });
        },
        addDocument() {
            this.$store.commit("Modal/active", {  judul: "Add document",  form: "AddDocumentForm", });
        },
        async renewLists() {
            this.lists = await listsOfDocuments()
        },
    },
    async mounted() {
        // subscribe the mutation,, and renew lists when data updated
        this.unsubscribe = this.$store.subscribe((mutation) => {
            // jika document ada yang di update
            if (["Modal/tunnelMessage"].includes(mutation.type)) {
                clearTimeout(this.timeOut)
                this.timeOut = setTimeout( () => {
                    this.renewLists()
                } , 300 )
            }
        });
    },
    beforeUnmount() {
        this.unsubscribe();
    },
}
</script>