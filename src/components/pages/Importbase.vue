<template>
<div class="">
    <div class="w3-border w3-margin-top w3-row w3-padding w3-container">
        <label style="font-weight:bold;" class="w3-col s2 w3-margin-top">Set from date : </label>
        <Datepicker class="w3-col w3-input s2" v-model="periode1" />
        <label style="font-weight:bold;" class="w3-margin-left w3-col s1 w3-margin-top">To date : </label>
        <Datepicker class="w3-col w3-input s2" v-model="periode2" />
        <Button primary class="w3-margin-left" value="Show" type="button" @trig="show" />
    </div>

        <input
            class="w3-hide"
            @change.prevent="readExcel($event)"
            type="file"
            ref="importerBase"
        />

            <Datatable
            :datanya="lists"
            :heads="['Periode', 'Gudang', 'Nama file']"
            :keys="['periode2', 'warehouseName', 'fileName']"
            option
            id="tableImportBase"
            v-slot:default="slotProp"
            >

            <div v-if="slotProp.prop.fileName">
                <Button value="Import file" :datanya="slotProp.prop.id" primary type="button" small @trig="launch($event)" />
            </div>
            <div v-else>
				<Button value="Delete" type="button" danger small @trig="unCollect(slotProp.prop.id)" />
            </div>
            </Datatable>
			
        </div>
</template>

<script>
import Input from "../elements/Input.vue"
import Button from "../elements/Button.vue"
import Datatable from "../parts/Datatable.vue"
import Datepicker from "vue3-datepicker"
import { mapState, mapGetters} from "vuex"
import * as XLSX from "xlsx";

export default {
    name: "Collect",
    data() {
        return {
            periode1: new Date(),
            periode2: new Date(),
            importId: null,
        };
    },
    components: {
        Input,
        Button,
        Datatable,
        Datepicker,
    },
    methods: {
        // to show lists data
        async show() {
            // bring up the loader
            this.$store.commit("Modal/active", {judul: "", form: "Loader"});
            // jika yang diminta total qty
            let dateCheck = this.periode1 === this.periode2 
                                ? [this.periode1.getTime()] 
                                : this.$store.getters["getDaysArray"](this.periode1, this.periode2)
            let objToSend = {
                    store: "BaseReportFile", 
                    date: dateCheck
                }
            await this.$store.dispatch("findDataByDateArrays", objToSend)
            this.$store.commit("Modal/active")
        },
        // to launch file picker
        launch(ev) {
            this.$refs.importerBase.click();
            this.importId = ev
        },
        // read file and put to the state
        readExcel(e) {
            // info of record
            let infobase = this.lists.find((val) => val.id === this.importId)
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
					info.sheetNames = wb.SheetNames.map((val, index) => {
                        return {
                            id: index,
                            title: val
                        }
                    })
					info.sheets = wb.Sheets
					
					resolve(info)
				};
				
				fileReader.onerror=((error) => { reject(error) })
			})
			
			promise.then((d) => {
                // send to vuex
                this.$store.commit("BaseReportFile/importTemp", d)
                // bring the form up
                this.$store.commit("Modal/active", {judul: `Setup base ${infobase.warehouseName} ${infobase.periode2}`, form: "BaseReportFile"});
			})
		}
    },
    computed: {
        ...mapState({
            _BASEREPORT: state => JSON.parse(JSON.stringify(state.BaseReportFile.lists)),
        }),
        ...mapGetters({
            WAREHOUSE_ID: "Warehouses/warehouseId",
            DATEFORMAT: "dateFormat",
            BASEID: "BaseReportFile/baseId"
        }),
        lists() {
			let result = []
			this._BASEREPORT.forEach((val) => {
                if(val) {
                    val.warehouseName = this.WAREHOUSE_ID(val.warehouse).name
                    val.periode2 = this.DATEFORMAT({ format: "dateMonth", time: val.periode})
                    val.fileName = val.fileName ? val.fileName : "Not imported yet"
                    result.push(val)
                }
			})
            return result
        },
    },
}
</script>