<template>
    <div class="w3-margin-top w3-container">
    <Button 
        v-if="!periode"
        class="w3-left" 
        primary 
        value="Set periode" 
        type="button" 
        @trig="periode = true" 
    />
    <PeriodePicker v-else @show="showData($event[0], $event[1])" />
        <div id="set-periode" class="w3-row w3-center">
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
            class="w3-col s3 w3-margin-right"
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
            class="w3-col s3"
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
        </div>
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
        async find(ev) {
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
            console.log(baseReport.periode)
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
        }),
        ...mapGetters({
            WAREHOUSE_ID: "Warehouses/warehouseId",
            DATEFORMAT: "dateFormat",
            BASEID: "BaseReportFile/baseId",
            CLOCKSHIFT: "BaseReportClock/shift",
            STOCKSHIFT: "BaseReportStock/shift",
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
            if(!this.sheet || !this.shift) {
                return []
            }

            // jika stock
            if(this.sheet === "stock") {
                return this.STOCKSHIFT(this.shift)
            }

            // jika clock
            return this.CLOCKSHIFT(this.shift)
        }
    },
    name: "Base"
}
</script>