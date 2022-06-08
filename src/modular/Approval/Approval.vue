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
                    <Button value="Batal" type="button" danger small @trig="unapprove(prop.id)" />
                    <Button value="Share" type="button" primary small @trig="share(prop.id)" />
                </span>
                <span v-else>
                    Shared at {{ this.$store.getters["dateFormat"]({ format: "dateMonth", time: prop.shared }) }}
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
            lists: []
        };
    },
    components: {
        Button,
        Datatable,
    },
    methods: {
        approvalForm() {
            this.$store.commit("Modal/active", { judul: "Set record to show", form: "ApprovalForm"});
        },
		unapprove(ev) {

            // get record from uncollected the state
            let info = this.$store.getters["Document/getId"](ev)
            info.approval = false
            info.status = 1
            // console.log(info)
            this.$store.dispatch("update", {
                            store: "Document",
                            obj: info,
                            criteria: { id: ev }
                        })
		},
        share(ev){
            // console.log(ev)
            let record = this.$store.getters["Document/getId"](ev)
            //set shared to true with date
            record.shared = this.$store.getters["dateFormat"]({format: "time"})
            // value = {store: 'nameOfStore', obj: {id: idOfDocument, object: 'to append to indexeddb'} }
            this.$store.dispatch("update", {
                            store: "Document",
                            obj: record,
                            criteria: { id: ev }
                        })
        },
        renewLists() {
                this.lists = this.$store.getters["Document/documentByStatus"](2)
        },
    },
    computed: {
        approval() {
			let collect = this.$store.getters["Document/approval"]
			let result = []
			collect.forEach((val) => {
                if(val) {
                let spvInfo = this.$store.getters["Supervisors/spvId"](val.name)
                    val.spvName = spvInfo.name
                    val.spvWarehouse = spvInfo.warehouseName
                    val.periode2 = this.$store.getters["dateFormat"]({ format: "dateMonth", time: val.periode })
                    val.collected2 = !isNaN(val.collected) ? this.$store.getters["dateFormat"]({ format: "dateMonth", time: val.collected }) : val.collected
                    val.approval2 = this.$store.getters["dateFormat"]({ format: "dateMonth", time: val.approval })
                    val.headName = this.$store.getters["Headspv/headId"](val.head)["name"]
                    result.push(val)
                }
			})
            return result
        },
    },
    async mounted() {
        await await this.$store.dispatch("Document/getDocumentByStatusFromDB", "approval")
        this.renewLists()
    }
}
</script>