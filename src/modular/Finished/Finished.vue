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
        :datanya="$store.getters['Document/finished']"
        :heads="['Periode', 'Nama', 'Gudang', 'Shift', 'Finished']"
        :keys="['periode2', 'spvName', 'warehouseName', 'shift', 'finished2']"
        option
        id="tableFinished"
        #default="{ prop }"
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
            this.$store.commit("Modal/active", { judul: "Set record to show", form: "PeriodePicker", store: "Document", btnValue: "Show", criteria: {isfinished: true}});
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
    mounted() {
        this.$store.dispatch(
          "getDataByCriteria",
          { store: "Document", criteria: { isfinished: true } },
          { root: true }
        );
    }
}
</script>