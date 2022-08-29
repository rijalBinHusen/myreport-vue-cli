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
import Button from "../../components/elements/Button.vue"
import Datatable from "../../components/parts/Datatable.vue"

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
            this.$store.commit("Modal/active", { 
                judul: "Set record to show", 
                form: "PeriodePicker", 
                store: "Document",
                btnValue: "Show"
            });
        },

        edit(ev) {
            // EV =  {action: 'approve', val: -1, rec: doc22050003}
            // this.$store.dispatch("Document/handleDocument", ev)
            this.$store.commit("Modal/active", { 
                judul: "Edit document", 
                form: "EditDocumentForm",
                obj: ev,
            });
        },
        addDocument(ev) {
            // EV =  {action: 'approve', val: -1, rec: doc22050003}
            // this.$store.dispatch("Document/handleDocument", ev)
            this.$store.commit("Modal/active", { 
                judul: "Add document", 
                form: "AddDocumentForm",
            });
        },
        renewLists() {
                this.lists = this.$store.getters["Document/allDocument"]
        },
    },
    async mounted() {
        await await this.$store.dispatch("Document/getDocumentByStatusFromDB", "approval")
        this.renewLists()
    // subscribe the mutation,, and renew lists when data updated
        this.unsubscribe = this.$store.subscribe((mutation) => {
            // jika document ada yang di update
            if (['Document/append', 'Document/update'].includes(mutation.type)) {
                clearTimeout(this.timeOut)
                this.timeOut = setTimeout( () => {
                    this.renewLists()
                    console.log('baru')
                } , 300 )
            }
        });
    },
    beforeUnmount() {
        this.unsubscribe();
    },
}
</script>