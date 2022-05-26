<template>
<div class="">
    <Button 
        class="w3-left w3-col s2 w3-margin-top w3-right" 
        primary 
        value="Set periode" 
        type="button" 
        @trig="pickPeriode" 
    />

    <Datatable
        :datanya="finished"
        :heads="['Periode', 'Nama', 'Gudang', 'Shift', 'Finished']"
        :keys="['periode2', 'spvName', 'spvWarehouse', 'shift', 'finished2']"
        option
        id="tableApproval"
        v-slot:default="{ prop }"
    >
    <!-- lihat info detail -->
    <Button value="Details" type="button" secondary small @trig="details(prop)"/>
    <!-- edit in excel mode -->
    <Button value="Edit" type="button" secondary small/>
    <!-- share detail -->
    <Button value="Share" type="button" primary small/>
        
        
    </Datatable>
    <!-- </table> -->
			
</div>
</template>

<script>
import Button from "../../components/elements/Button.vue"
import Datatable from "../../components/parts/Datatable.vue"

export default {
    name: "Finished",
    data() {
        return {};
    },
    components: {
        Button,
        Datatable,
    },
    methods: {
        pickPeriode() {
            this.$store.commit("Modal/active", { judul: "Set record to show", form: "PeriodePicker", store: "Document", btnValue: "Show", criteria: {isFinished: true}});
        },
		details(ev) {
            console.log(ev)
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
        }
    },
    computed: {
        finished() {
			let record = JSON.parse(JSON.stringify(this.$store.state.Document.lists))
			return record.map((val) => {
                let spvInfo = this.$store.getters["Supervisors/spvId"](val.name)
                    val.spvName = spvInfo.name
                    val.spvWarehouse = spvInfo.warehouseName
                    val.periode2 = this.$store.getters["dateFormat"]({ format: "dateMonth", time: val.periode })
                    val.finished2 = this.$store.getters["dateFormat"]({ format: "dateMonth", time: val.finished })
                    // val.approval2 = this.$store.getters["dateFormat"]({ format: "dateMonth", time: val.approval })
                    // val.headName = this.$store.getters["Headspv/headId"](val.head)["name"]
                    return val
            })
        },
    },
}
</script>