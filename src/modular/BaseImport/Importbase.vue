<template>
<div class="">
    <div class="w3-margin-top w3-container">
        <Button 
            v-if="!periode"
            class="w3-right" 
            primary 
            value="Set periode" 
            type="button" 
            @trig="pickPeriode" 
        />
    </div>
        <input
            class="w3-hide"
            @change.prevent="readExcel($event)"
            type="file"
            ref="importerBase"
            accept=".xls, .ods"
        />

            <Datatable
                :datanya="$store.getters['BaseReportFile/lists']"
                :heads="['Periode', 'Gudang', 'Nama file', 'Shee stock', 'Sheet clock']"
                :keys="['periode2', 'warehouseName', 'fileName', 'stock', 'clock']"
                option
                id="tableImportBase"
                #default="{ prop }"
                v-if="!periode"
            >

                <div v-if="!prop.imported">
                    <Button value="Import file" :datanya="prop.id" primary type="button" class="w3-tiny" @trig="launch($event)" />
                </div>
                <div v-else>
    				<Button v-if="!prop?.isRecordFinished" value="Delete imported" type="button" :datanya="prop.id" danger class="w3-tiny" @trig="remove($event)" />
                </div>

            </Datatable>
			
        </div>
</template>

<script>
import Input from "../../components/elements/Input.vue"
import Button from "../../components/elements/Button.vue"
import Datatable from "../../components/parts/Datatable.vue"
import { mapGetters} from "vuex"
import periodePickerProps from "../../composable/periodePickerProps"
import readExcelFile from "../../composable/readExcel"

export default {
    name: "Collect",
    data() {
        return {
            importId: null,
            periode: false,
        };
    },
    components: {
        Input,
        Button,
        Datatable,
    },
    methods: {
        pickPeriode() {
            this.$store.commit("Modal/active", periodePickerProps('BaseReportFile'));
        },
        launch(ev) {
            this.$refs.importerBase.click();
            this.importId = ev
        },
        // remove all data that was imported
        async remove(ev) {
            let sure = confirm("Apakah anda yakin akan menghapusnya?")
            if(!sure) { return; }
            this.$store.dispatch("BaseReportFile/emptyRecord", ev)
        },
        // read file and put to the state
        readExcel(e) {
            // if(!e.target.files[0]) {
            //     return
            // }
            // info of record
            let infobase = this.BASEID(this.importId)
            // bring the loader up
            this.$store.commit("Modal/active", {judul: "", form: "Loader"});
            readExcelFile(e.target.files[0]).then((d) => {
                let warehouseName = this.$store.getters["Warehouses/warehouseId"](infobase?.warehouse)?.name
                let periode2 = this.$store.getters["dateFormat"]({ format: "dateMonth", time: infobase?.periode })
                // send data excel to vuex
                this.$store.commit("BaseReportFile/importTemp", d)
                // bring the form up and send the baseid info to the modal state
                this.$store.commit("Modal/active", {
                    judul: warehouseName + " " + periode2, 
                    form: "BaseReportFile",
                    obj: infobase,
                });
			})
		}
    },
    computed: {
        ...mapGetters({
            BASEID: "BaseReportFile/baseId"
        }),
    },
    async mounted() {
        // get all item name
        await this.$store.dispatch("Baseitem/getAllItem")
        // get the 3 days before today basereportfile record
        await this.$store.dispatch("BaseReportFile/recordStarter")
        // get all problem guys
        await this.$store.dispatch("Problem/getProblemFromDB");
    },
}
</script>