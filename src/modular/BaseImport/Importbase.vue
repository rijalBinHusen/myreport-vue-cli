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
    				<Button value="Delete imported" type="button" :datanya="prop.id" danger class="w3-tiny" @trig="remove($event)" />
                </div>

            </Datatable>
			
        </div>
</template>

<script>
import Input from "../../components/elements/Input.vue"
import Button from "../../components/elements/Button.vue"
import Datatable from "../../components/parts/Datatable.vue"
import { mapState, mapGetters} from "vuex"
import * as XLSX from "xlsx";

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
            this.$store.commit("Modal/active", { judul: "Set record to show", form: "PeriodePicker", store: "BaseReportFile", btnValue: "Show"});
        },
        launch(ev) {
            this.$refs.importerBase.click();
            this.importId = ev
        },
        // remove all data that was imported
        async remove(ev) {
            let sure = confirm("Apakah anda yakin akan menghapusnya?")
            if(!sure) {
                return;
            }

            this.$store.dispatch("BaseReportFile/emptyRecord", ev)
        },
        // read file and put to the state
        readExcel(e) {
            // info of record
            let infobase = this.BASEID(this.importId)
            // bring the loader up
            this.$store.commit("Modal/active", {judul: "", form: "Loader"});
			const file = e.target.files[0]
			let info = { fileName: file.name }
			
			const promise = new Promise ((resolve, reject) => {
				const fileReader = new FileReader();
				fileReader.readAsArrayBuffer(file);
				
				fileReader.onload = (e) => {
					const bufferArray = e.target.result;
					
					// const wb = XLSX.read(bufferArray, {type: "buffer"});
					const wb = XLSX.read(bufferArray);
					info.sheetNames = wb.SheetNames
					info.sheets = wb.Sheets
					
					resolve(info)
				};
				
				fileReader.onerror=((error) => { reject(error) })
			})
			
			promise.then((d) => {
                // send data excel to vuex
                this.$store.commit("BaseReportFile/importTemp", d)
                // bring the form up and send the baseid info to the modal state
                this.$store.commit("Modal/active", {
                    judul: infobase.warehouseName + " " + infobase.periode2, 
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
    async created() {
        // get all item name
        this.$store.dispatch("Baseitem/getAllItem")
        // get today
        let today = new Date()
        // get 3 days before
        let daybefore = this.$store.getters["dateFormat"]({format: -3})
        // get all 3 days before as array
        let days = this.$store.getters["getDaysArray"](daybefore, today)
        // get data all 3 days
        await this.$store.dispatch("findDataByDateArrays", { 
                store: "BaseReportFile", 
                date: days, 
                criteria: {} 
            })
    },
}
</script>