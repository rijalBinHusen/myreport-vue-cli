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
                  v-if="listsPeriode.length"
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
            <span v-if="(prop.selisih || (prop.problem && prop.problem.length)) && sheet === 'stock'">
                <Dropdown
                    value="Pesan"  
                    :lists="[
                        { id: 'apaBaru', isi: 'Apakah selisih baru'},
                        { id: 'tidakSama', isi: 'Selisih tidak sama'},
                    ]"
                    class="w3-small"
                    listsKey="id"
                    listsValue="isi"
                    @trig="message($event, prop)"
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
                />
            </span>
            
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
            shift: "",
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
            let pesan;
            if(ev === "apaBaru") {
                pesan = `Assalamu alaikum pak ${spvInfo.name}%0a%0aMohon maaf menggangu,%0aDi laporan pak ${spvInfo.name} periode *${this.GETTIME({format: 'dateMonth', time: +this.selectedPeriode}) }*, shift ${obj.shift}, *${spvInfo.warehouseName}*, untuk item *${obj.itemName}* terdapat selisih sebanyak *${ (obj.awal + obj.in - obj.out) - obj.real }*, apakah itu selisih baru ya pak?%0aSoalnya dicatatan saya belum ada selisih untuk item tersebut.`
            } else if (ev === "tidakSama") {
                pesan =  `Assalamu alaikum pak ${spvInfo.name}%0a%0aMohon maaf menggangu,%0aDi laporan pak ${spvInfo.name} periode *${this.GETTIME({format: 'dateMonth', time: +this.selectedPeriode}) }*, shift ${obj.shift}, *${spvInfo.warehouseName}*, untuk item *${obj.itemName}* apakah ada selisih baru ya pak? %0a%0a Soalnya dicatatan saya untuk item tersebut ada selisih ${obj.problem2}, sedangkan dilaporan bapak selisihnya *${ (obj.awal + obj.in - obj.out) - obj.real }* Ctn.`
            }
            // console.log(spvInfo.phone)
            window.open(`https://wa.me/${spvInfo.phone}?text=${pesan}`)
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
                addOn: { parent: this.base.id, shift: this.shift},
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
            // tutup loader
            this.$store.commit("Modal/active");
        },
        save(ev) {
            // lempar ke dispatch
            // BaseReportClock/saveFromeExcel
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
        },
        pickPeriode() {
            this.$store.commit("Modal/active", { 
                judul: "Set record to show", 
                form: "PeriodePicker", 
                store: "BaseReportFile",
                criteria: { imported: true },
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
        renewLists() {
            if(this.shift && this.base) {
                // console.log("renew lists")
            this.detailsDocument()
              if(this.sheet === "stock") {
                this.lists = this.BASEREPORTSTOCKSHIFTANDPARENT(this.shift, this.base.id)
                return
              }

              if(this.sheet === "clock") {
               this.lists = this.BASEREPORTCLOCKSHIFTANDPARENT(this.shift, this.base.id)
              }
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
          if(!this.selectedPeriode || !this.selectedWarehouse || !this.shift || !this.sheet || !newVal) { return }
          this.renewLists()
        },
        sheet(newVal, oldVal) {
          if(!this.selectedPeriode || !this.selectedWarehouse || !this.shift || !this.sheet || !newVal) { return }
          this.renewLists()
        },
        selectedPeriode(newVal, oldVal) {
            this.listsWarehouse = this.WAREHOUSEBASEREPORT(newVal)
            this.sheet = ""
            this.shift = ""
            this.selectedWarehouse = ""
            this.lists = []
        },
        selectedWarehouse(newVal, oldVal) {
            this.base = this.BASEIDSELECTED(this.selectedPeriode, newVal)
            this.sheet = ""
            this.shift = ""
            this.lists = []
        },
    },
    async mounted() {
        // getAllDocumentNotFinished
        await this.$store.dispatch("Document/getBaseReportStarter")
        // this.$store.dispatch("getDataByCriteria", { store: "Baseitem", allData: true })
        this.listsPeriode = this.DATEBASEREPORT
        // subscribe the mutation,, and renew lists when data updated
        this.unsubscribe = this.$store.subscribe((mutation) => {
            // jika base report ada yang di update
            // console.log(mutation)
            if (mutation.type.includes('BaseReportStock')) {
                // console.log("Tunggu 1 detik")
                clearTimeout(this.timeOut)
                this.timeOut = setTimeout( () => {
                    this.renewLists()
                    this.listsPeriode = this.DATEBASEREPORT
                } , 600 )
                return
            }
            // jika cari berdasarkan periode
            if(mutation.type == "BaseReportFile/append") {
                clearTimeout(this.timeOut)
                this.timeOut = setTimeout(async () => {
                    // looping cari baseReportStock dengan criteria { parent: baseReportFile.id }
                    await this.$store.dispatch("BaseReportStock/getDataByParent");
                    // // looping cari baseReportClock dengan criteria { parent: baseReportFile.id }
                    await this.$store.dispatch("BaseReportClock/getDataByParent");
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