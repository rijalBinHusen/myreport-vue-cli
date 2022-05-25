<template>
    <div>
        <AGGrid
            v-if="excelMode"
            :originColumn="originColumn"
            :rowData="lists"
            :tableName="tableName"
            @exit="excelMode = false"
            @save="save($event)"
        >
            <Button class="w3-bar-item" small primary value="Add data" @trig="launchForm" type="button" />
        </AGGrid>
    <div v-else class="w3-margin-top w3-container">
        <div v-if="!BaseFinishForm">
            <div id="set-periode" class="w3-row w3-center">
            <Button 
                class="w3-left w3-col s2 w3-margin-top w3-margin-right" 
                primary 
                value="Set periode" 
                type="button" 
                @trig="pickPeriode" 
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
                class="w3-col s1 w3-margin-right"
                :options='[
                    { id: 0, title: "Pilih sheet" }, 
                    { id: "clock", title: "Clock" },
                    { id: "stock", title: "Stock" },
                ]'
                value="id"
                text="title"
                :inselect="sheet"
                @selected="sheet = $event"
                />            
                <!-- Shift -->
                <Select 
                v-if="baseReport.length > 1"
                class="w3-col s1 w3-margin-right"
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
                    v-if="lists.length > 0"
                    class="w3-left w3-col s2 w3-margin-top w3-margin-right " 
                    primary 
                    value="Excel mode" 
                    type="button" 
                    @trig="excelMode = true" 
                />
                <!-- MArk as finished -->
                <Button 
                    v-if="base && sheet === 'stock' && shift && lists.length > 0"
                    class="w3-left w3-col s2 w3-margin-top" 
                    primary 
                    value="Mark as finished" 
                    type="button" 
                    @trig="BaseFinishForm = true"
                />
            </div>
        <Datatable
          :datanya="lists"
          :heads="sheet === 'clock' ? ['Nomor', 'Register', 'Start', 'Finish', 'Istirahat'] : ['Item', 'Selisih']"
          :keys="sheet === 'clock' ? ['noDo', 'reg', 'start', 'finish', 'rehat'] : ['namaItem', 'selisih']"
          id="tableBaseReport"
          option
          v-slot:default="slotProp"
        >
            <Button 
                value="Delete" 
                type="button" 
                danger 
                small
                @trig="remove([slotProp.prop.id])" 
            />
        </Datatable>
        </div>
        <BaseFinishForm 
            v-else 
            :base="base" 
            :shift="shift"
            :totalDo="totalDo"
            :totalWaktu="totalWaktu"
            :totalKendaraan="totalKendaraan"
            :standartWaktu="standartWaktu"
            @exit="BaseFinishForm = false"
            @finished="markAsFinished($event)"
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
import AGGrid from "../../components/parts/AGGrid.vue"
import BaseFinishForm from "./BaseFinishForm.vue"

export default {
    components: {
        AGGrid,
        Button,
        Datatable,
        Select,
        PeriodePicker,
        BaseFinishForm,
    },
    data() {
        return {
            periode: false, 
            sheet: null,
            shift: null,
            excelMode: false,
            base: null,
            BaseFinishForm: null,
            totalDo: 0,
            totalKendaraan: 0,
            totalWaktu: 0,
            standartWaktu: 0,
        }
    },
    methods: {
        launchForm() {
            // jika clock jika stock
            let form = this.sheet === "clock" ? "BaseClockForm" : "BaseStockForm"
            // launch modal dan form
            this.$store.commit("Modal/active", {
                judul: `Tambah data report ${this.sheet}`, 
                form: form,
                addOn: { parent: this.base.id, shift: this.shift},
                period: this.base.periode
            });
        },
        async markAsFinished(ev) {
            // buka loader
            this.$store.commit("Modal/active", {judul: "", form: "Loader"});
            // baseReportStockLists
            let baseReportStockLists = this._BASESTOCK.filter((val) => val.shift == this.shift)
            // masukkan ke database finished report
            this.$store.dispatch("append", {
                store: "Finished",
                obj: ev,
                period: this.base.periode
            })
            // iterate lists
            for(let i =0; i < baseReportStockLists.length; i++) {
                // console.log(this.lists[i].id)
                // console.log(i)
                // tunggu pindah ke finishedStock
                let objStock = baseReportStockLists[i]
                delete objStock.shift
                delete objStock.parent
                objStock.parent = ev.id
                await this.$store.dispatch("append",{
                    store: "FinishedStock",
                    obj: objStock,
                    period: this.base.periode
                })
                // tunggu hapus dari baseReportStock
                await this.$store.dispatch("delete",{
                    store: "BaseReportStock",
                    id: baseReportStockLists[i].id,
                    period: this.base.periode
                })
            }
            // tutup loader
            this.$store.commit("Modal/active");
        },
        save(ev) {
            // tampilkan loader
            this.$store.commit("Modal/active", {judul: "", form: "Loader"});
            ev.forEach((val) => {
                // jika keluar ada tanggalnya dan end date kosong dan akhir > 0 maka end date dikasi tanggal
                if(this.sheet === "stock") {
                    if(val.dateOut && !val.dateEnd && +val.real > 0) {
                    val.dateEnd = val.dateOut
                    } 
                    // jika keluar ada tanggalnya dan akhir == 0
                    else if (val.dateOut && +val.real == 0) {
                        val.dateEnd = "-"
                    }
                delete val.namaItem
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
            let store = this.sheet === "stock" ? 'BaseReportStock' : 'BaseReportClock'
            //delete from idb
            ev.forEach((val) => {
                this.$store.dispatch("delete", { 
                    store: store, 
                    id: val
                })
            })
        },
        async find(ev) {    
            if(!ev) {
                this.base = ev
                return
            }
            // find detail about base report
            this.base = this.baseReport.find((val) => val.id === ev)
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
        pickPeriode() {
            this.$store.commit("Modal/active", { judul: "Set record to show", form: "PeriodePicker", store: "BaseReportFile", btnValue: "Show"});
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
            BASEITEMKODE: "Baseitem/baseItemKode",
            GETTIME: "dateFormat",
        }),
        baseReport() {
			let result = [{id: "", title: "Pilih base report"}]
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
                    this.standartWaktu = 0
                    // ['Item', 'Awal', 'In', 'Tanggal masuk', 'Out', 'Tanggal keluar', 'Akhir', 'Tanggal Akhir']
                    result = this._BASESTOCK.filter((val) => {
                        if(val.shift == this.shift) {   
                            this.standartWaktu += +val.out
                            val.namaItem = this.BASEITEMKODE(val.item).name
                            val.selisih = val.real - (val.awal + val.in - val.out)
                            return val
                        }
                    })
                }
                // jika clock
                if(this.sheet === "clock") {
                    result = this._BASECLOCK.filter((val) => val.shift == this.shift)
                }
            }

            return result
        },
        originColumn() {
            return this.sheet === "clock"
                            ? [
                                { headerName: "Nomor", field: "noDo", width: 100 },
                                { headerName: "Register", field: "reg", width: 100 },
                                { headerName: "Start", field: "start", width: 100 },
                                { headerName: "Finish", field: "finish", width: 100 },
                                { headerName: "istirahat", field: "rehat", editable: true, width: 100 },
                            ]
                            : [
                                { headerName: "Kode Item", field: "item", editable: true, resizable: true },
                                { headerName: "Nama Item", field: "namaItem", editable: false, resizable: true, width: 300 },
                                { headerName: "Awal", field: "awal", editable: true, resizable: true, width: 100 }, 
                                { headerName: "Masuk", field: "in", editable: true, resizable: true, width: 100}, 
                                { headerName: "Tanggal masuk", field: "dateIn", editable: true, resizable: true, width: 100 }, 
                                { headerName: "Keluar", field: "out", editable: true, resizable: true, width: 100 }, 
                                { headerName: "Tanggal keluar", field: "dateOut", editable: true, resizable: true, width: 100 }, 
                                { headerName: "Akhir", editable: false, resizable: true, valueGetter: '(+data.in) - (+data.out) + data.awal', width: 100 },
                                { headerName: "Real stock", field: "real", editable: true, resizable: true, width: 100 },
                                { headerName: "Tanggal terlama", field: "dateEnd", editable: true, resizable: true, width: 100 }, 
                                { headerName: "Selisih", editable: false, width:80, valueGetter: 'data.real - ((+data.in) - (+data.out) + data.awal)'}, 
                            ];
            },
        tableName() {
            return  this.sheet === "clock" ? "ExcelClock" : "excelStock";
        },
        fromAdd() {
            return this.sheet === "clock" ? "BaseReportClockForm" : "BaseReportStockForm";
        },
    },
    watch: {
        // total waktu, total kendaraan, total do
        shift(newVal, oldVal) {
            if(newVal === oldVal) {
                return
            }
            this.totalWaktu = 0;
            this.totalDo = 0
            this.totalKendaraan = 0
            this._BASECLOCK.filter((val) => {
                if(val.shift == this.shift){
                    this.totalDo += 1
                    this.totalKendaraan += 1
                    // start
                    let start = this.GETTIME({format: "time", time: `2022-03-03 ${val.start.slice(0,2)}:${val.start.slice(3,5)}` })
                    //finish
                    let finish = this.GETTIME({format: "time", time: `2022-03-03 ${val.finish.slice(0,2)}:${val.finish.slice(3,5)}` })
                    // jika finish lebih kecil dari pada start, maka finish ditambah 24 jam guys (86400000)
                    // finish - start
                    let total = finish < start ? (finish + 86400000) - start : finish - start
                    // jaddikan menit, masukan total waktu
                    this.totalWaktu += (total / 1000) / 60 - (val.rehat * 60 )
                }
            })
        },
    },
    mounted() {
        this.$store.dispatch("getDataByCriteria", { store: "Baseitem", allData: true })
    },
    name: "Base"
}
</script>