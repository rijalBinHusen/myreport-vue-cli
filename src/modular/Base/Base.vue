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
            <template #button>
                <Button class="w3-bar-item" small primary value="Add data" @trig="launchForm" type="button" />
            </template>
            <template #text>
                {{ $store.getters["dateFormat"]({format: "dateMonth", time: Number(selectedPeriode) })
                    + ", " +
                    $store.getters["Warehouses/warehouseId"](selectedWarehouse)?.name
                    + ", Shift: " +
                     shift 
                }}
            </template>
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
                  class="w3-col s1 w3-margin-right"
                  :options="$store.getters['BaseReportFile/dateReport']" 
                  value="periode"
                  text="periode2"
                  @selected="selectedPeriode = $event"
                  :inselect="selectedPeriode"
                  judul="periode"
                />

                <!-- Warehouse Base report -->
                <Select 
                  v-if="listsWarehouse.length"
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
                    v-if="selectedWarehouse.length"
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
                    v-if="selectedWarehouse.length"
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
                    v-if="lists.length"
                    class="w3-left w3-col s1 w3-margin-top w3-padding " 
                    primary 
                    value="Excel" 
                    type="button" 
                    @trig="excelMode = true" 
                />
                <!-- MArk as finished -->
                <Button
                    v-if="lists.length"
                    class="w3-left w3-col s2 w3-margin-top" 
                    primary 
                    value="Mark as finished" 
                    type="button" 
                    @trig="BaseFinishForm = true"
                />
            </div>
        <Datatable
          :datanya="lists"
          :heads="sheet === 'clock' ? ['Nomor', 'Register', 'Start', 'Finish', 'Istirahat', 'Total'] : ['Item', 'Selisih', 'Problem']"
          :keys="sheet === 'clock' ? ['noDo', 'reg', 'start', 'finish', 'rehat', 'totalTime'] : ['itemName', 'selisih', 'problem2']"
          id="tableBaseReport"
          option
          #default="{ prop }"
        >   
            <!-- When there is a problem in base report stock -->
            <span v-if="(prop.selisih || (prop.problem && prop.problem.length)) && sheet === 'stock'">
                <Dropdown
                    value="Pesan"  
                    :lists="[
                        { id: 'apaBaru', isi: 'Apakah selisih baru'},
                        { id: 'tidakSama', isi: 'Selisih tidak sama'},
                        { id: 'selesai', isi: 'Sudah kosong'},
                    ]"
                    class="w3-small"
                    listsKey="id"
                    listsValue="isi"
                    @trig="message($event, prop)"
                    secondary
                />

                <Dropdown
                    value="Problem"  
                    :lists="[
                        { id: 'delete', isi: 'Hapus'},
                        { id: 'edit', isi: 'Edit'},
                    ]"
                    class="w3-small"
                    listsKey="id"
                    listsValue="isi"
                    @trig="handleProblem($event, prop)"
                    primary
                />
            </span>
            <!-- When there is a problem in base report stock -->
            
            <Button 
                value="Delete" 
                type="button" 
                danger 
                small
                @trig="remove(prop.id)" 
            />
            
            <Button 
                v-if="sheet === 'clock'"
                value="Duplicate" 
                type="button" 
                primary
                small
                @trig="duplicateRecord(prop)" 
            />

        </Datatable>
        </div>
        <BaseFinishForm 
            v-else 
            :base="base" 
            :shift="shift"
            :detailsClock="detailsClock"
            :detailsStock="detailsStock"
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
import { addData } from "../../composable/components/followUp"
// import { shell } from 'electron'

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
            sheet: "",
            shift: 0,
            excelMode: false,
            base: null,
            BaseFinishForm: null,
            // totalDO, totalKendaraan, totalWaktu,
            detailsClock: "",
            // end of totalDO, totalKendaraan, totalWaktu,
            detailsStock: "",
            problem: {},
            unsubscribe: "",
            timeOut: "",
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
            DELETEPROBLEMFROMSTOCK: "BaseReportStock/deleteProblem",
        }),
        message(ev, obj) {
            // ev = jenis pesan, obj=lengtka
            //   "id": "unc22060042020006",
            //   "parent": "unc22060042",
            //   "shift": 2,
            //   "item": "1TOMGCVANBC-4--",
            //   "awal": 5084,
            //   "in": 0,
            //   "out": 118,
            //   "dateIn": "",
            //   "dateOut": "",
            //   "dateEnd": "",
            //   "real": 4966,
            //   "problem": [
            //     "a2722060000",
            //     "a2722060001"
            //   ],
            //   "itemName": "GORIORIO MAGIC LOKAL",
            //   "selisih": 0,
            //   "problem2": "+ 1 Indikasi kurang muat maseh, +3 Indikasi kurang muat maseh",
            //   "planOut": ""
            // dapatkan nomor telfon dulu
            let spvInfo = this.$store.getters["Document/spvByPeriodeAndWarehouseAndShift"](this.selectedPeriode, this.selectedWarehouse, this.shift)
            let warehouseName = this.$store.getters["Warehouses/warehouseId"](this.selectedWarehouse)?.name
            let pesan;
            let salam = `Assalamu alaikum pak ${spvInfo.name}%0a%0a`
            let pembuka = `Mohon maaf menggangu,%0aDi laporan pak ${spvInfo.name} periode *${this.GETTIME({format: 'dateMonth', time: +this.selectedPeriode}) }*, shift ${obj.shift} ${warehouseName}, untuk item ${obj.itemName}`
            let selisih = `terdapat selisih sebanyak *${ +obj.real - ((+obj.in) - (+obj.out) + (+obj.awal))}* Ctn`
            let problem = `Dicatatan saya untuk item tersebut masih ada selisih ${obj.problem2.replace('.', ',')}`
            
            if(ev === "apaBaru") {
                pesan = salam+pembuka+' '+selisih+`%0a%0aapakah itu selisih baru ya pak?%0aSoalnya dicatatan saya belum ada selisih untuk item tersebut.`
            } else if (ev === "tidakSama") {
                pesan =  salam+pembuka+` apakah ada selisih baru ya pak? %0a%0a${problem} sedangkan dilaporan bapak `+selisih
            } else if (ev === "selesai") {
                pesan =  salam+pembuka+' '+selisih+`%0a%0aApakah ada selisih stock yang sudah tersolusikan? %0a${problem}`
            }
            addData({ pesan: pembuka+' '+selisih+' sedangkan '+problem, tujuan: spvInfo.phone })
            // console.log(pesan)
            // save to the followup
            window.open(`https://wa.me/${spvInfo.phone}?text=${pesan}`)
            // shell.openExternal(`https://wa.me/${spvInfo.phone}?text=${pesan}`)
        },
        duplicateRecord(ev) {
            const { id, ...record } = ev
            this.$store.dispatch("append", { store: "BaseReportClock", obj: record })
        },
        handleProblem(ev, obj) {
            if(ev === "delete") {
                let confirm = window.confirm("Apakah anda yakin akan menghapus semua problem?")
                if(confirm) {
                    this.DELETEPROBLEMFROMSTOCK(obj.id)
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
                judul: `Tambah record ${this.sheet}`, 
                form: form,
                addOn: { parent: this.base.id, shift: +this.shift},
            });
        },
        async markAsFinished(ev) {
            // console.log(ev)
            // buka loader
            this.$store.commit("Modal/active", {judul: "", form: "Loader"});
            // iterate baseReport stocklist dan tambahkan parent document ev.id
            // lemparkan ke state saja biar gak bingung
            // lempar data yang dibutuhkan, parent
            let criteria = Object.assign(ev, {
                shift: this.shift,
                parent: this.base?.id
            })
            // tambahkan parent document pada basereportclock
            await this.$store.dispatch("BaseReportClock/markAsFinished", criteria)
            // tambahkan parent document pada basereportstock
            await this.$store.dispatch("BaseReportStock/markAsFinished", criteria)
            // update details document  totalDO, totalKendaraan, totalWaktu, standartWaktu
            await this.$store.dispatch("Document/handleDocument",
                {
                    action: "finished",
                    val: Object.assign({baseReportFile: this.base.id}, ev),
                    rec: ev?.parentDocument
                }
            )
            await this.$store.dispatch("BaseReportFile/someRecordFinished", this.base.id)
            // close the base finish form
            this.BaseFinishForm = false
            // tutup loader
            this.$store.commit("Modal/active");
        },
        async save(ev) {
            // lempar ke dispatch
            // BaseReportClock/saveFromeExcel and renew the lists
            await this.$store.dispatch(
                    `BaseReport${this.sheet[0].toUpperCase() + this.sheet.slice(1)}/saveFromExcelMode`, 
                    ev)
            this.renewLists()
            
        },
        async remove(ev){
            let sure = confirm("Apakah anda yakin akan menghapusnya?")
            if(sure) {
                //delete from idb
                await this.$store.dispatch("delete", {  
                    store: `BaseReport${this.sheet[0].toUpperCase() + this.sheet.slice(1)}`, 
                    criteria: {id: ev} 
                })
                this.renewLists()
            }
        },
        pickPeriode() {
            this.$store.commit("Modal/active", { 
                judul: "Set record to show", 
                form: "PeriodePicker", 
                store: [ 
                    { storeName: "BaseReportFile" },
                    { storeName: "Document"}
                ],
                btnValue: "Show"
            });
        },
        detailsDocument() {
            // total waktu, total kendaraan, total do
            if(this.shift && this.base && this.base.id) {
                this.detailsStock = this.$store.getters["BaseReportStock/detailsByShiftAndParent"](this.shift, this.base.id)
                this.detailsClock = this.$store.getters["BaseReportClock/detailsByShiftAndParent"](this.shift, this.base.id)
            }
        },
        async renewLists() {
            //  || !this.shift || !this.sheet) { return }
            this.base = this.BASEIDSELECTED(this.selectedPeriode, this.selectedWarehouse)
            this.listsWarehouse = this.WAREHOUSEBASEREPORT(this.selectedPeriode)
            // console.log(this.base)
            
            if(this.selectedPeriode && this.selectedWarehouse && this.shift) {
                // check dulu apakah somerecord exists, 
                let isExists = 
                    this.ISCLOCKEXISTS(this.base.id, this.shift) 
                    && this.ISSTOCKEXISTS( this.base.id, this.shift)
                // jika exists
                if(isExists) {
                    this.detailsDocument()
                    // renewthe lists using function BASEREPORTSTOCKSHIFTANDPARENT: "BaseReportStock/shiftAndParent",
                    this.lists = this[`BASEREPORT${this.sheet.toUpperCase()}SHIFTANDPARENT`](this.shift, this.base.id)
                    return
                }
                // // jika tidak exists
                this.$store.commit("Modal/active", {judul: "", form: "Loader"});
                // looping cari baseReportStock dengan criteria { parent: baseReportFile.id }
                await this.$store.dispatch("BaseReportStock/getDataByParentAndShift", { parent: this.base.id, shift: +this.shift });
                // // looping cari baseReportClock dengan criteria { parent: baseReportFile.id }
                await this.$store.dispatch("BaseReportClock/getDataByParentAndShift", { parent: this.base.id, shift: +this.shift });
                this.$store.commit("Modal/active");
                this.renewLists()
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
            ISCLOCKEXISTS: "BaseReportClock/isRecordExistsByParentAndShift",
            ISSTOCKEXISTS: "BaseReportStock/isRecordExistsByParentAndShift",
            WAREHOUSE_ID: "Warehouses/warehouseId",
            DATEFORMAT: "dateFormat",
            BASEID: "BaseReportFile/baseId",
            BASEITEMKODE: "Baseitem/baseItemKode",
            GETTIME: "dateFormat",
            WAREHOUSEBASEREPORT: "BaseReportFile/warehouseReport",
            BASEREPORTSTOCKSHIFTANDPARENT: "BaseReportStock/shiftAndParent",
            BASEREPORTCLOCKSHIFTANDPARENT: "BaseReportClock/shiftAndParent",
            BASEIDSELECTED: "BaseReportFile/getIdByPeriodeByWarehouse"
        }),
        originColumn() {
            return this.sheet === "clock"
                ? [
                    { headerName: "Nomor", field: "noDo", width: 100 },
                    { headerName: "Register", field: "reg", width: 100 },
                    { headerName: "Start", field: "start", width: 100, editable: true },
                    { headerName: "Finish", field: "finish", width: 100, editable: true },
                    { headerName: "Istirahat", field: "rehat", editable: true, width: 100 },
                    { headerName: "Total", field: "totalTime", editable: false, width: 100 },
                ]
                : [
                    { headerName: "Kode Item", field: "item", editable: true, resizable: true },
                    { headerName: "Nama Item", field: "itemName", editable: false, resizable: true, width: 300 },
                    { headerName: "Awal", field: "awal", editable: true, resizable: true, width: 100 }, 
                    { headerName: "Masuk", field: "in", editable: true, resizable: true, width: 100, filter: 'agNumberColumnFilter'}, 
                    { headerName: "Tanggal masuk", field: "dateIn", editable: true, resizable: true, width: 100, wrapText: true, autoHeight: true }, 
                    { headerName: "Plan Out", field: "planOut", editable: true, resizable: true, width: 100 }, 
                    { headerName: "Keluar", field: "out", editable: true, resizable: true, width: 100, filter: 'agNumberColumnFilter' }, 
                    { headerName: "Tanggal keluar", field: "dateOut", editable: true, resizable: true, width: 100, wrapText: true, autoHeight: true }, 
                    { headerName: "Akhir", editable: false, resizable: true, valueGetter: '(+data.in) - (+data.out) + data.awal', width: 100 },
                    { headerName: "Real stock", field: "real", editable: true, resizable: true, width: 100 },
                    { headerName: "Tanggal terlama", field: "dateEnd", editable: true, resizable: true, width: 100, wrapText: true, autoHeight: true }, 
                    { headerName: "Selisih", editable: false, width:80, valueGetter: 'data.real - ((+data.in) - (+data.out) + (+data.awal))'}, 
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
          this.renewLists()
        },
        sheet(newVal, oldVal) {
          this.renewLists()
        },
        selectedPeriode(newVal, oldVal) {
            let isExists = this.BASEIDSELECTED(this.selectedPeriode, this.selectedWarehouse)
            if(!isExists?.imported) {
                //empty all
                this.sheet = ""
                this.shift = ""
                this.selectedWarehouse = ""
                this.lists = []
                    //end of empty all
            }
            this.renewLists()
        },
        selectedWarehouse(newVal, oldVal) {
            this.renewLists()
        },
    },
    async mounted() {
        // get all item
        await this.$store.dispatch("Baseitem/getAllItem");
        // get all problem
        await this.$store.dispatch("Problem/getProblemFromDB");
        // this.$store.dispatch("getDataByCriteria", { store: "Baseitem", allData: true })
        // subscribe the mutation,, and renew lists when data updated
        this.unsubscribe = this.$store.subscribe((mutation) => {
            if( [
                    "BaseReportStock/updateParam", 
                    "BaseReportStock/append", 
                    "BaseReportClock/append",
                ].includes(mutation.type)) {

                clearTimeout(this.timeOut)
                this.timeOut = setTimeout(async () => {
                    this.listsPeriode = this.renewLists()
                } , 600 )

            }
        });
    },
    beforeUnmount() {
         this.unsubscribe();
    },
    name: "Base"
}
</script>