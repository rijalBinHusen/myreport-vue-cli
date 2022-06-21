<template>
<div class="">
    <input
            class="w3-hide"
            @change.prevent="readExcel($event)"
            type="file"
            ref="importerBase"
            accept=".xls, .ods"
        />
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
        <Button v-if="prop?.status === 2" @trig="share" value="Share" type="button" primary small/>
        
        
    </Datatable>
    <!-- </table> -->
			
</div>
</template>

<script>
import Button from "../../components/elements/Button.vue"
import Datatable from "../../components/parts/Datatable.vue"
import exportDailyReport from "../../excelReport/exportDailyReport";

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
            this.$store.commit("Modal/active", { judul: "Set record to show", form: "FinishedForm", data: ev});
		},
        share(ev){
            this.$refs.importerBase.click();
            // // console.log(ev)
            // let record = this.$store.getters["Document/getId"](ev)
            // //set shared to true with date
            // record.shared = this.$store.getters["dateFormat"]({format: "time"})
            // // value = {store: 'nameOfStore', obj: {id: idOfDocument, object: 'to append to indexeddb'} }
            // this.$store.dispatch("update", {
            //                 store: "Document",
            //                 obj: record,
            //                 criteria: { id: ev }
            //             })
        },
        readExcel(e) {
			const file = e.target.files[0]
            exportDailyReport(file)
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