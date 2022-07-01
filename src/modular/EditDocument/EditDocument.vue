<template>
<div class="">
    <div class="w3-border w3-padding w3-container">
        <label>Set record to show : </label>
        <Button primary value="Set" type="button" @trig="pickPeriode" />
    </div>

            <Datatable
                :datanya="lists"
                :heads="['Nama', 'Gudang', 'Periode', 'Collected', 'Kabag', 'Approve']"
                :keys="['spvName', 'warehouseName', 'periode2', 'collected2', 'headName', 'approval2']"
                option
                id="tableApproval"
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
        renewLists() {
                this.lists = this.$store.getters["Document/documentByStatus"](2)
        },
    },
    async mounted() {
        await await this.$store.dispatch("Document/getDocumentByStatusFromDB", "approval")
        this.renewLists()
    // subscribe the mutation,, and renew lists when data updated
        this.unsubscribe = this.$store.subscribe((mutation) => {
            // jika document ada yang di update
            if (mutation.type === 'Document/append') {
                clearTimeout(this.timeOut)
                this.timeOut = setTimeout( () => {
                    this.renewLists()
                } , 1500 )
            }
            else if (mutation.type === 'Document/update') {
                this.renewLists()
            }
        });
    },
    beforeUnmount() {
        this.unsubscribe();
    },
}
</script>