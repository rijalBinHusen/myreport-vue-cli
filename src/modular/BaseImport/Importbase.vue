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
            :datanya="lists"
            :heads="['Periode', 'Gudang', 'Nama file']"
            :keys="['periode2', 'warehouseName', 'fileName']"
            option
            id="tableImportBase"
            v-slot:default="slotProp"
            v-if="!periode"
            >

            <div v-if="!slotProp.prop.imported">
                <Button value="Import file" :datanya="slotProp.prop.id" primary type="button" small @trig="launch($event)" />
            </div>
            <div v-else>
				<Button value="Delete imported" type="button" :datanya="slotProp.prop.id" danger small @trig="remove($event)" />
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
        // // to show lists data
        // async show(periode1, periode2) {
        //     // bring up the loader
        //     this.$store.commit("Modal/active", {judul: "", form: "Loader"});
        //     // jika yang diminta total qty
        //     let dateCheck = periode1 === periode2 
        //                         ? [periode1.getTime()] 
        //                         : this.$store.getters["getDaysArray"](periode1, periode2)
        //     let objToSend = {
        //             store: "BaseReportFile", 
        //             date: dateCheck
        //         }
        //     await this.$store.dispatch("findDataByDateArrays", objToSend)
        //     this.$store.commit("Modal/active")
        //     this.periode = false
        // },
        // to launch file picker
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

            let infobase = this.BASEID(ev)

            // bring up the loader
            this.$store.commit("Modal/active", {judul: "", form: "Loader"});

            //delete from state
            this.$store.commit("BaseReportStock/deleteByParam", {
                parameter: "parent",
                value: ev
            })
            //delete from idb
            await this.$store.dispatch("deleteByParam", { 
                store: "BaseReportStock", 
                parameter: "parent", 
                value: ev,
                period: infobase.periode
            })
            //delete from state
            this.$store.commit("BaseReportClock/deleteByParam", {
                parameter: "parent",
                value: ev
            })
            //delete from idb
            await this.$store.dispatch("deleteByParam", { 
                store: "BaseReportClock", 
                parameter: "parent", 
                value: ev,
                period: infobase.periode
            })

            // update the baseReport file record
            infobase.fileName = false
            infobase.stock = false
            infobase.clock = false
            infobase.imported = false
            this.$store.dispatch("update", {
                store: "BaseReportFile", 
                obj: infobase,
                period: infobase.periode
            })

            
            // close the loader
            this.$store.commit("Modal/active");
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
					info.sheetNames = wb.SheetNames
					info.sheets = wb.Sheets
					
					resolve(info)
				};
				
				fileReader.onerror=((error) => { reject(error) })
			})
			
			promise.then((d) => {
                // send data excel to vuex
                this.$store.commit("BaseReportFile/importTemp", d)
                // bring the form up
                this.$store.commit("Modal/active", {judul: infobase.warehouseName + " " + infobase.periode2, form: "BaseReportFile"});
                //send id baseReport to vuex
                this.$store.commit("BaseReportFile/baseId", infobase.id)
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
    mounted(){
        this.$store.commit("BaseReportFile/basereportfile", [])
    },
}
</script>