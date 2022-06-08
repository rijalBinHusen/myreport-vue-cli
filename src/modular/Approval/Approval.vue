<template>
<div class="">
    <div class="w3-border w3-padding w3-container">
        <label>Set record to show : </label>
        <Button primary value="Set" type="button" @trig="approvalForm" />
    </div>

            <Datatable
                :datanya="lists"
                :heads="['Nama', 'Gudang', 'Periode', 'Collected', 'Kabag', 'Approve']"
                :keys="['spvName', 'spvWarehouse', 'periode2', 'collected2', 'headName', 'approval2']"
                option
                id="tableApproval"
                v-slot:default="{ prop }"
            >
				<span v-if="!prop.shared">
                    <Button 
                        value="Batal" 
                        type="button" 
                        danger small 
                        @trig="handleAction({ action: 'unapprove', rec: prop.id })" 
                    />
                    
                    <Button 
                        value="Share" 
                        type="button" 
                        primary small 
                        @trig="handleAction({ action: 'share', rec: prop.id })" 
                    />

                </span>
                <span v-else>
                    Shared at {{
                    !isNaN(prop.shared)
                     ? this.$store.getters["dateFormat"](
                         { 
                            format: "dateMonth", 
                            time: prop.shared 
                         }) 
                    : prop.shared
                 }}
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
        };
    },
    components: {
        Button,
        Datatable,
    },
    methods: {
        approvalForm() {
            this.$store.commit("Modal/active", { 
                judul: "Set record to show", 
                form: "ApprovalForm"
            });
        },

        handleAction(ev) {
            // EV =  {action: 'approve', val: -1, rec: doc22050003}
            this.$store.dispatch("Document/handleDocument", ev)
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
            if (mutation.type === 'Document/update') {
                this.renewLists()
            }
        });
    },
    beforeUnmount() {
        this.unsubscribe();
    },
}
</script>