<template>
    <div>
        <AGGrid
            v-if="excelMode"
            :originColumn="originColumn"
            :rowData="lists"
            :tableName="tableName"
            @exit="excelMode = false"
            @save="save($event)"
        />
    <div v-else class="w3-margin-top w3-container">
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
                :inselect="base ? base.id : null"
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
                :inselect="sheet"
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
                :inselect="shift"
                @selected="shift = $event"
                />
                <!-- oPEN IN EXCEL MODE -->
                <Button 
                    class="w3-left w3-col s2 w3-margin-top" 
                    primary 
                    value="Excel mode" 
                    type="button" 
                    @trig="excelMode = true" 
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
    </div>
</template>

<script>
import Button from "../../components/elements/Button.vue"
import Datatable from "../../components/parts/Datatable.vue"
import PeriodePicker from "../../components/parts/PeriodePicker.vue"
import Select from "../../components/elements/Select.vue"
import { mapState, mapGetters } from "vuex"
import AGGrid from "../../components/parts/AGGrid.vue"

export default {
    components: {
        AGGrid,
        Button,
        Datatable,
        Select,
        PeriodePicker,
    },
    data() {
        return {
            periode: false, 
            sheet: null,
            shift: null,
            excelMode: false,
            originColumn: this.sheet === "clock"
                            ? [
                                { headerName: "Nomor", field: "noDo" },
                                { headerName: "Register", field: "reg", },
                                { headerName: "Start", field: "start", },
                                { headerName: "Finish", field: "finish", },
                                { headerName: "istirahat", field: "break", editable: true },
                            ]
                            : [
                                { headerName: "Nama Item", field: "item", editable: true, resizable: true },
                                { headerName: "Stock awal", field: "awal", editable: true, resizable: true, type: 'valueColumn' }, 
                                { headerName: "Masuk", field: "in", editable: true, resizable: true, type: 'valueColumn' }, 
                                { headerName: "Tanggal masuk", field: "dateIn", editable: true, resizable: true }, 
                                { headerName: "Keluar", field: "out", editable: true, resizable: true, type: 'valueColumn' }, 
                                { headerName: "Tanggal keluar", field: "dateOut", editable: true, resizable: true }, 
                                { headerName: "Akhir", editable: false, resizable: true, valueGetter: '(+data.in) - (+data.out) + data.awal' },
                                { headerName: "Real stock", field: "akhir", editable: true, resizable: true },
                                { headerName: "Tanggal terlama", field: "dateEnd", editable: true, resizable: true }, 
                            ],
            tableName: this.sheet === "clock" ? "ExcelClock" : "excelStock",
            base: null
        }
    },
    methods: {
        save(ev) {
            // tampilkan loader
            this.$store.commit("Modal/active", {judul: "", form: "Loader"});
            ev.forEach((val) => {
                // jika keluar ada tanggalnya dan end date kosong dan akhir > 0 maka end date dikasi tanggal
                if(val.dateOut && !val.dateEnd && val.akhir > 0) {
                    val.dateEnd = val.dateOut
                } 
                // jika keluar ada tanggalnya dan akhir == 0
                else if (val.dateOut && val.akhir == 0) {
                    val.dateEnd = "-"
                }
                this.$store.dispatch("update",  { 
                store: `BaseReport${this.sheet[0].toUpperCase() + this.sheet.slice(1)}`, 
                obj: val,
                period: this.base.periode
                })
            })
            // tutup loader
            this.$store.commit("Modal/active")

        },
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
            this.base = this.BASEID(ev)
            console.log(this.base)
            // store
            let store = ["BaseReportClock", "BaseReportStock"]
            // buka loader
            this.$store.commit("Modal/active", {judul: "", form: "Loader"});
            // tunggu mendapatkan base report clock, report stock
            for(let i = 0; i < store.length; i++) {
                await this.$store.dispatch("findDataByDateArrays", {
                    store: store[i],
                    date: [this.base.periode],
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