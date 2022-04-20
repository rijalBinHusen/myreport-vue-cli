<template>
    <div class="w3-margin-top w3-container">
        <div id="set-periode">
            <PeriodePicker v-if="periode" @show="showData($event[0], $event[1])" />
            <div v-else class="w3-row w3-center">
            <Button 
                class="w3-left w3-col s2 w3-margin-top" 
                primary 
                value="Set periode" 
                type="button" 
                @trig="periode = true" 
            />
                <!-- Base report -->
                <Select 
                class="w3-col s3 w3-margin-right"
                :options="baseReport" 
                value="id"
                text="title"
                @selected="find($event)"
                />            
                <!-- Sheet report -->
                <Select 
                v-if="baseReport.length > 1"
                class="w3-col s2 w3-margin-right"
                :options='[
                    { id: 0, title: "Pilih sheet" }, 
                    { id: "clock", title: "Sheet clock" },
                    { id: "stock", title: "Sheet stock" },
                ]'
                value="id"
                text="title"
                @selected="sheet = $event"
                />            
                <!-- Shift -->
                <Select 
                v-if="baseReport.length > 1"
                class="w3-col s2 w3-margin-right"
                :options="[
                    { id:0, title: 'Pilih shift' }, 
                    { id:1, title: 'Shift 1'},
                    { id:2, title: 'Shift 2'},
                    { id:3, title: 'Shift 3'},
                ]" 
                value="id"
                text="title"
                @selected="shift = $event"
                />
                <!-- oPEN IN EXCEL MODE -->
                <Button 
                    class="w3-left w3-col s2 w3-margin-top" 
                    primary 
                    value="Excel mode" 
                    type="button" 
                    @trig="periode = true" 
                />
            </div>
        </div>
        <Datatable
          :datanya="lists"
          :heads="sheet === 'clock' ? ['Nomor', 'Register', 'Start', 'Finish', 'Istirahat'] : ['Item', 'Awal', 'In', 'Tanggal masuk', 'Out', 'Tanggal keluar', 'Tanggal Akhir', 'Akhir']"
          :keys="sheet === 'clock' ? ['noDo', 'reg', 'start', 'finish', 'break'] : ['item', 'awal', 'in', 'dateIn', 'out', 'dateOut', 'dateEnd', 'akhir']"
          id="tableBaseReport"
          option
          v-slot:default="slotProp"
        >
            <Button 
                value="Delete" 
                type="button" 
                danger 
                small
                @trig="remove(slotProp.prop)" 
            />
        </Datatable>
    </div>
</template>

<script>
import Button from "../../components/elements/Button.vue"
import Datatable from "../../components/parts/Datatable.vue"
import PeriodePicker from "../../components/parts/PeriodePicker.vue"
import Select from "../../components/elements/Select.vue"
import { mapState, mapGetters } from "vuex"

export default {
    components: {
        Button,
        Datatable,
        Select,
        PeriodePicker,
    },
    data() {
        return {
            periode: false, 
            sheet: null,
            shift: null
        }
    },
    methods: {
        remove(ev){
            let sure = confirm("Apakah anda yakin akan menghapusnya?")
            if(!sure) {
                return;
            }

            let baseReport = this.baseReport.find((val) => val.id === ev.parent)
            let store = this.sheet === "stock" ? 'BaseReportStock' : 'BaseReportClock'
            //delete from idb
            this.$store.dispatch("deleteByParam", { 
                store: store, 
                parameter: "id", 
                value: ev.id,
                periode: baseReport.periode,
                period: baseReport.periode,
            })
            //delete from state
            this.$store.commit(`${store}/deleteByParam`, {
                parameter: "id",
                value: ev.id
            })
        },
        async find(ev) {
            // find detail about base report
            let baseReport = this.BASEID(ev)
            // store
            let store = ["BaseReportClock", "BaseReportStock"]
            // buka loader
            this.$store.commit("Modal/active", {judul: "", form: "Loader"});
            // tunggu mendapatkan base report clock, report stock
            for(let i = 0; i < store.length; i++) {
                await this.$store.dispatch("findDataByDateArrays", {
                    store: store[i],
                    date: [baseReport.periode],
                    criteria: { parent: ev },
                    dateNotCriteria: true,
                })
            }
            //tutup loader
            this.$store.commit("Modal/active")
            // catat base id, so all component can read it
            this.$store.commit("BaseReportFile/baseId", ev)
        },
        async showData(periode1, periode2) {
            // bring up the loader
            this.$store.commit("Modal/active", {judul: "", form: "Loader"});
            // jika yang diminta total qty
            let dateCheck = periode1 === periode2 
                                ? [periode1.getTime()] 
                                : this.$store.getters["getDaysArray"](periode1, periode2)
            let objToSend = {
                    store: "BaseReportFile", 
                    date: dateCheck
                }
            await this.$store.dispatch("findDataByDateArrays", objToSend)
            this.$store.commit("Modal/active")
            this.periode = false
        },
    },
    computed: {
        ...mapState({
            _BASEREPORT: state => JSON.parse(JSON.stringify(state.BaseReportFile.lists)),
            _BASECLOCK: state => JSON.parse(JSON.stringify(state.BaseReportClock.lists)),
            _BASESTOCK: state => JSON.parse(JSON.stringify(state.BaseReportStock.lists)),
            _BASEID: state => JSON.parse(JSON.stringify(state.BaseReportFile.baseId)),
        }),
        ...mapGetters({
            WAREHOUSE_ID: "Warehouses/warehouseId",
            DATEFORMAT: "dateFormat",
            BASEID: "BaseReportFile/baseId",
        }),
        baseReport() {
			let result = [{id: null, title: "Pilih base report"}]
			this._BASEREPORT.forEach((val) => {
                if(val.imported) {
                    val.title = this.DATEFORMAT({ format: "dateMonth", time: val.periode}) + " " +this.WAREHOUSE_ID(val.warehouse).name 
                    result.push(val)
                }
			})
            return result
        },
        lists() {
            let result = []
            
            if(this.shift) {
                // jika stock
                if(this.sheet === "stock") {
                    result = this._BASESTOCK.filter((val) => val.shift == this.shift)
                }
                // jika clock
                if(this.sheet === "clock") {
                    result = this._BASECLOCK.filter((val) => val.shift == this.shift)
                }
            }

            return result
        }
    },
    name: "Base"
}
</script>