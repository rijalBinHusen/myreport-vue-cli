<template>
    <div>
        <AGGrid
            v-if="excelMode"
            :originColumn="originColumn"
            :rowData="lists"
            :tableName="tableName"
            @exit="excelMode = false"
            @save="save($event)"
            rowHeight="70"
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
                <!-- Date Base report -->
                <Select 
                  v-if="listsPeriode.length > 0"
                  class="w3-col s1 w3-margin-right"
                  :options="listsPeriode" 
                  value="periode"
                  text="periode2"
                  @selected="selectedPeriode = $event"
                  :inselect="selectedPeriode"
                  judul="periode"
                />

                <!-- Warehouse Base report -->
                <Select 
                  v-if="listsWarehouse.length > 0"
                  class="w3-col s2 w3-margin-right"
                  :options="listsWarehouse" 
                  value="warehouse"
                  text="warehouseName"
                  @selected="selectedWarehouse = $event"
                  :inselect="selectedWarehouse"
                  judul="gudang"
                />

                <!-- Sheet report -->
                <Select 
                v-if="listsWarehouse.length > 0"
                class="w3-col s1 w3-margin-right"
                :options='[
                    { id: "clock", title: "Clock" },
                    { id: "stock", title: "Stock" },
                ]'
                value="id"
                text="title"
                judul="sheet"
                :inselect="sheet"
                @selected="sheet = $event"
                />            
                <!-- Shift -->
                <Select 
                v-if="listsWarehouse.length > 0"
                class="w3-col s1 w3-margin-right"
                :options="[
                    { id:1, title: 'Shift 1'},
                    { id:2, title: 'Shift 2'},
                    { id:3, title: 'Shift 3'},
                ]" 
                judul="shift"
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
                    v-if="base && sheet === 'stock' && shift && lists.length > 0 && !lists[0]?.parentDocument"
                    class="w3-left w3-col s2 w3-margin-top" 
                    primary 
                    value="Mark as finished" 
                    type="button" 
                    @trig="BaseFinishForm = true"
                />
            </div>
        <Datatable
          :datanya="lists"
          :heads="sheet === 'clock' ? ['Nomor', 'Register', 'Start', 'Finish', 'Istirahat'] : ['Item', 'Selisih', 'Problem']"
          :keys="sheet === 'clock' ? ['noDo', 'reg', 'start', 'finish', 'rehat'] : ['itemName', 'selisih', 'problem2']"
          id="tableBaseReport"
          option
          #default="{ prop }"
        >

            <Dropdown
                v-if="prop.selisih !== 0 || prop.problem"
                value="Pesan"  
                :lists="[
                    { id: 1, isi: 'Apakah selisih baru'},
                    { id: 2, isi: 'Selisih tidak sama'},
                    { id: 3, isi: 'Selisih sudah selesai?'}
                ]"
                class="w3-small"
                listsKey="id"
                listsValue="isi"
                @trig="message($event, prop)"
            />

            <Dropdown
                v-if="prop.selisih !== 0 || prop.problem"
                value="Problem"  
                :lists="[
                    { id: 'delete', isi: 'Hapus'},
                    { id: 'edit', isi: 'Edit'},
                ]"
                class="w3-small"
                listsKey="id"
                listsValue="isi"
                @trig="handleProblem($event, prop)"
            />
            
            <Button 
                value="Delete" 
                type="button" 
                danger 
                small
                @trig="remove(prop.id)" 
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
import { mapState, mapGetters, mapActions } from "vuex"
import AGGrid from "../../components/parts/AGGrid.vue"
import BaseFinishForm from "./BaseFinishForm.vue"
import Dropdown from "../../components/elements/Dropdown.vue"

export default {
    components: {
        Dropdown,
        AGGrid,
        Button,
        Datatable,
        Select,
        PeriodePicker,
        BaseFinishForm,
    },
    data() {
        return {
            periode: "", 
            sheet: "",
            shift: "",
            excelMode: false,
            base: null,
            BaseFinishForm: null,
            totalDo: 0,
            totalKendaraan: 0,
            totalWaktu: 0,
            standartWaktu: 0,
            problem: {},
            unwatch: "",
            listsPeriode: "",
            listsWarehouse: "",
            lists: [],
            selectedPeriode: "",
            selectedWarehouse: "",
        }
    },
    methods: {
        ...mapActions({
            CLOCKBYPARENT: "BaseReportClock/getDataByParent",
            STOCKBYPARENT: "BaseReportStock/getDataByParent",
            GETALLITEM: "Baseitem/getAllItem",
            DELETEPROBLEMFROMSTOCK: "BaseReportStock/deleteProblem",
        }),
        message(ev, obj) {
            console.log(ev, obj)
        },
        handleProblem(ev, obj) {
            if(ev === "delete") {
                let confirm = window.confirm("Apakah anda yakin akan menghapus semua problem?")
                if(confirm) {
                    this.DELETEPROBLEMFROMSTOCK(obj.id)
                    this.renewLists()
                }
                return
            }
            // buka modal, dan kirim object yang dibutuhkan ke modal state (periode, warehouse, item, etc)
            // console.log(obj)
            this.$store.commit("Modal/active", {
                judul: "Edit problem", 
                form: "BaseProblemForm",
                obj: {
                    id: obj.id,
                    periode: this.base.periode,
                    warehouse: this.base.warehouse,
                    item: obj.item,
                    itemName: obj.itemName,
                    problem: obj.problem
                }
            });
        },
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
            // update document dengan data yang ada di ev
            await this.$store.dispatch("update", {
                store: "Document", 
                obj: ev,
                criteria: { id: ev.id }
            })

            // iterate baseReport stocklist dan tambahkan parent document ev.id
            for(let i =0; i < this.lists.length; i++) {
                let record = JSON.parse(JSON.stringify(this.lists[i]))
                delete record.itemName
                delete record.selisih
                delete record.problem2
                // tunggu sampai update selesai
                await this.$store.dispatch("update", {
                    store: "BaseReportStock", 
                    obj: Object.assign(record, {parentDocument: ev.id}),
                    criteria: { id: record.id }
                })
            }

            // tutup loader
            this.$store.commit("Modal/active");
        },
        save(ev) {
            // lempar ke dispatch
            this.$store.dispatch(
                    `BaseReport${this.sheet[0].toUpperCase() + this.sheet.slice(1)}/saveFromExcelMode`, 
                    ev)
            
        },
        remove(ev){
            let sure = confirm("Apakah anda yakin akan menghapusnya?")
            if(!sure) {
                return;
            }
            let store = this.sheet === "stock" ? 'BaseReportStock' : 'BaseReportClock'
            //delete from idb
                this.$store.dispatch("delete", { 
                    store: store, 
                    criteria: {id: ev}
                })
            this.renewLists()
        },
        pickPeriode() {
            this.$store.commit("Modal/active", { 
                judul: "Set record to show", 
                form: "PeriodePicker", 
                store: "BaseReportFile", 
                btnValue: "Show"
            });
        },
        detailsDocument() {
            // total waktu, total kendaraan, total do
            this.totalWaktu = 0;
            this.totalDo = 0
            this.totalKendaraan = 0
            if(this.shift && this.base && this.base.id) {
                this.standartWaktu = this.STANDARTWAKTU(this.shift, this.base.id)
                this.BASEREPORTCLOCKSHIFTANDPARENT(this.shift, this.base.id).forEach((val) => {
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
                })

            }
        },
        renewLists() {
          if(this.sheet === "stock") {
            this.lists = this.BASEREPORTSTOCKSHIFTANDPARENT(this.shift, this.base.id)
            return
          }

          if(this.sheet === "clock") {
           this.lists = this.BASEREPORTCLOCKSHIFTANDPARENT(this.shift, this.base.id)
          }
        }
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
            DATEBASEREPORT: "BaseReportFile/dateReport",
            WAREHOUSEBASEREPORT: "BaseReportFile/warehouseReport",
            BASEREPORTSTOCKSHIFTANDPARENT: "BaseReportStock/shiftAndParent",
            BASEREPORTCLOCKSHIFTANDPARENT: "BaseReportClock/shiftAndParent",
            STANDARTWAKTU: "BaseReportStock/standartWaktuByParentAndShift",
            BASEIDSELECTED: "BaseReportFile/getIdByPeriodeByWarehouse"
        }),
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
                    { headerName: "Nama Item", field: "itemName", editable: false, resizable: true, width: 300 },
                    { headerName: "Awal", field: "awal", editable: true, resizable: true, width: 100 }, 
                    { headerName: "Masuk", field: "in", editable: true, resizable: true, width: 100, filter: 'agNumberColumnFilter'}, 
                    { headerName: "Tanggal masuk", field: "dateIn", editable: true, resizable: true, width: 100, wrapText: true, autoHeight: true }, 
                    { headerName: "Keluar", field: "out", editable: true, resizable: true, width: 100 }, 
                    { headerName: "Tanggal keluar", field: "dateOut", editable: true, resizable: true, width: 100, wrapText: true, autoHeight: true }, 
                    { headerName: "Akhir", editable: false, resizable: true, valueGetter: '(+data.in) - (+data.out) + data.awal', width: 100 },
                    { headerName: "Real stock", field: "real", editable: true, resizable: true, width: 100 },
                    { headerName: "Tanggal terlama", field: "dateEnd", editable: true, resizable: true, width: 100, wrapText: true, autoHeight: true }, 
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
        shift(newVal, oldVal) {
          if(!this.selectedPeriode || !this.selectedWarehouse || !this.shift || !this.sheet) { return }
          this.detailsDocument()
          this.renewLists()
        },
        sheet(newVal, oldVal) {
          if(!this.selectedPeriode || !this.selectedWarehouse || !this.shift || !this.sheet) { return }
          this.detailsDocument()
          this.renewLists()
        },
        selectedPeriode(newVal, oldVal) {
            this.detailsDocument()
            this.listsWarehouse = this.WAREHOUSEBASEREPORT(newVal)
            this.sheet = ""
            this.shift = ""
            this.lists = []
        },
        selectedWarehouse(newVal, oldVal) {
            this.base = this.BASEIDSELECTED(this.selectedPeriode, this.selectedWarehouse)
        },
    },
    async mounted() {
        // getAllDocumentNotFinished
        await this.$store.dispatch("Document/getAllDocumentNotFinished")
        // this.$store.dispatch("getDataByCriteria", { store: "Baseitem", allData: true })
        this.listsPeriode = this.DATEBASEREPORT
        this.GETALLITEM()
        this.unwatch = this.$store.watch(
          (state, getters) => getters["Modal/obj"],
          (newValue, oldValue) => {
            // console.log(`Updating from ${JSON.stringify(oldValue?.form)} to ${JSON.stringify(newValue?.form)}`);

            // Do whatever makes sense now
            if (oldValue?.form === "BaseProblemForm" && newValue?.form === '') {
              this.renewLists()
            }
          },
        );
    },
    beforeUnmount() {
         this.unwatch();
    },
    name: "Base"
}
</script>