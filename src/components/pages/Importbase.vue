<template>
<div class="">
    <div class="w3-border w3-margin-top w3-row w3-padding w3-container">
        <label style="font-weight:bold;" class="w3-col s2 w3-margin-top">Set from date : </label>
        <Datepicker class="w3-col w3-input s2" v-model="periode1" />
        <label style="font-weight:bold;" class="w3-margin-left w3-col s1 w3-margin-top">To date : </label>
        <Datepicker class="w3-col w3-input s2" v-model="periode2" />
        <Button primary class="w3-margin-left" value="Show" type="button" @trig="show" />
    </div>

            <Datatable
            :datanya="lists"
            :heads="['Periode', 'Gudang', 'Nama file']"
            :keys="['periode2', 'warehouseName', 'fileName']"
            option
            id="tableImportBase"
            v-slot:default="slotProp"
            >

            <div v-if="slotProp.prop.fileName">
                <Button value="Import file" primary type="button" small @trig="launch" />
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

export default {
    name: "Collect",
    data() {
        return {
            periode1: new Date(),
            periode2: new Date(),
        };
    },
    components: {
        Input,
        Button,
        Datatable,
        Datepicker,
    },
    methods: {
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
        launch() {
            this.$store.commit("Modal/active", { judul: "Import file base report", form: "BaseReportFile"});
        }
    },
    computed: {
        ...mapState({
            _BASEREPORT: state => JSON.parse(JSON.stringify(state.BaseReportFile.lists)),
        }),
        ...mapGetters({
            WAREHOUSE_ID: "Warehouses/warehouseId",
            DATEFORMAT: "dateFormat"
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