<template>
    <div>
        <AGGrid
            v-if="isExcelMode"
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
        <div v-if="isMainMode" class="w3-margin-top w3-container">
            <!-- Panel base report -->
            <BasePanelVue @baseReportChanged="renewLists" />
            <!-- Panel base report -->
            <div v-if="isBaseFinishedForm">
            <Datatable
            v-if="renderTable"
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
            <!-- <BaseFinishForm 
                v-else 
                :base="baseId" 
                :shift="shift"
                :detailsClock="detailsClock"
                :detailsStock="detailsStock"
                @exit="BaseFinishForm = false"
                @finished="markAsFinished($event)"
            /> -->
        </div>
    </div>
</template>

<script>
import Button from "../../components/elements/Button.vue"
import Datatable from "../../components/parts/Datatable.vue"
import PeriodePicker from "../../components/parts/PeriodePicker.vue"
import Select from "../../components/elements/Select.vue"
import AGGrid from "../../components/parts/AGGrid.vue"
import BaseFinishForm from "./BaseFinishForm.vue"
import Dropdown from "../../components/elements/Dropdown.vue"
import { addData } from "../../composable/components/followUp"
import BasePanelVue from './BasePanel.vue'
import { getBaseClockByParentByShift } from '@/composable/components/BaseReportClock'
import { getBaseStockByParentByShift } from '@/composable/components/BaseReportStock'
import { ref, computed } from "vue"
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
        BasePanelVue,
    },
    setup() {
        const mode = ref('Main')
        const baseId = ref(null)
        const isMainMode = computed(() => mode.value == 'Main')
        const isExcelMode = computed(() => mode.value == 'Excel')
        const isBaseFinishedForm = computed(() => mode.value == 'BaseFinishedForm')
        const timeout = ref(null)
        const lists = ref([])
        const renderTable = ref(false)
        
        const message = (ev, obj) => {
            console.log('message', ev, obj)
            // // ev = jenis pesan, obj=lengtka
            // //   "id": "unc22060042020006",
            // //   "parent": "unc22060042",
            // //   "shift": 2,
            // //   "item": "1TOMGCVANBC-4--",
            // //   "awal": 5084,
            // //   "in": 0,
            // //   "out": 118,
            // //   "dateIn": "",
            // //   "dateOut": "",
            // //   "dateEnd": "",
            // //   "real": 4966,
            // //   "problem": [
            // //     "a2722060000",
            // //     "a2722060001"
            // //   ],
            // //   "itemName": "GORIORIO MAGIC LOKAL",
            // //   "selisih": 0,
            // //   "problem2": "+ 1 Indikasi kurang muat maseh, +3 Indikasi kurang muat maseh",
            // //   "planOut": ""
            // // dapatkan nomor telfon dulu
            // let spvInfo = this.$store.getters["Document/spvByPeriodeAndWarehouseAndShift"](this.selectedPeriode, this.selectedWarehouse, this.shift)
            // let warehouseName = this.$store.getters["Warehouses/warehouseId"](this.selectedWarehouse)?.name
            // let pesan;
            // let salam = `Assalamu alaikum pak ${spvInfo.name}%0a%0a`
            // let pembuka = `Mohon maaf menggangu,%0aDi laporan pak ${spvInfo.name} periode *${this.GETTIME({format: 'dateMonth', time: +this.selectedPeriode}) }*, shift ${obj.shift} ${warehouseName}, untuk item ${obj.itemName}`
            // let selisih = `terdapat selisih sebanyak *${ +obj.real - ((+obj.in) - (+obj.out) + (+obj.awal))}* Ctn`
            // let problem = `Dicatatan saya untuk item tersebut masih ada selisih ${obj.problem2.replace('.', ',')}`
            
            // if(ev === "apaBaru") {
            //     pesan = salam+pembuka+' '+selisih+`%0a%0aapakah itu selisih baru ya pak?%0aSoalnya dicatatan saya belum ada selisih untuk item tersebut.`
            // } else if (ev === "tidakSama") {
            //     pesan =  salam+pembuka+` apakah ada selisih baru ya pak? %0a%0a${problem} sedangkan dilaporan bapak `+selisih
            // } else if (ev === "selesai") {
            //     pesan =  salam+pembuka+' '+selisih+`%0a%0aApakah ada selisih stock yang sudah tersolusikan? %0a${problem}`
            // }
            // addData({ pesan: pembuka+' '+selisih+' sedangkan '+problem, tujuan: spvInfo.phone })
            // // console.log(pesan)
            // // save to the followup
            // window.open(`https://wa.me/${spvInfo.phone}?text=${pesan}`)
            // // shell.openExternal(`https://wa.me/${spvInfo.phone}?text=${pesan}`)
        }
        
        const duplicateRecord = (ev) => {
            console.log('duplicateRecord')
            // const { id, ...record } = ev
            // this.$store.dispatch("append", { store: "BaseReportClock", obj: record })
        }

        const handleProblem = (ev, obj) => {
            console.log('hanlde problem')
            // if(ev === "delete") {
            //     let confirm = window.confirm("Apakah anda yakin akan menghapus semua problem?")
            //     if(confirm) {
            //         this.DELETEPROBLEMFROMSTOCK(obj.id)
            //     }
            //     return
            // }
            // // buka modal, dan kirim object yang dibutuhkan ke modal state (periode, warehouse, item, etc)
            // // console.log(obj)
            // this.$store.commit("Modal/active", {
            //     judul: "Edit problem", 
            //     form: "BaseProblemForm",
            //     obj: {
            //         id: obj.id,
            //         periode: this.base.periode,
            //         warehouse: this.base.warehouse,
            //         item: obj.item,
            //         itemName: obj.itemName,
            //         problem: obj.problem
            //     }
            // });
        }

        const launchForm = () => {
            console.log('launch form')
            // // jika clock jika stock
            // let form = this.sheet === "clock" ? "BaseClockForm" : "BaseStockForm"
            // // launch modal dan form
            // this.$store.commit("Modal/active", {
            //     judul: `Tambah record ${this.sheet}`, 
            //     form: form,
            //     addOn: { parent: this.base.id, shift: +this.shift},
            // });
        }

        const markAsFinished = async (ev) => {
            console.log(ev)
            // // buka loader
            // this.$store.commit("Modal/active", {judul: "", form: "Loader"});
            // // iterate baseReport stocklist dan tambahkan parent document ev.id
            // // lemparkan ke state saja biar gak bingung
            // // lempar data yang dibutuhkan, parent
            // let criteria = Object.assign(ev, {
            //     shift: this.shift,
            //     parent: this.base?.id
            // })
            // // tambahkan parent document pada basereportclock
            // await this.$store.dispatch("BaseReportClock/markAsFinished", criteria)
            // // tambahkan parent document pada basereportstock
            // await this.$store.dispatch("BaseReportStock/markAsFinished", criteria)
            // // update details document  totalDO, totalKendaraan, totalWaktu, standartWaktu
            // await this.$store.dispatch("Document/handleDocument",
            //     {
            //         action: "finished",
            //         val: Object.assign({baseReportFile: this.base.id}, ev),
            //         rec: ev?.parentDocument
            //     }
            // )
            // await this.$store.dispatch("BaseReportFile/someRecordFinished", this.base.id)
            // // close the base finish form
            // this.BaseFinishForm = false
            // // tutup loader
            // this.$store.commit("Modal/active");
        }
        const save = async (ev) => {
            console.log(ev)
            // lempar ke dispatch
            // BaseReportClock/saveFromeExcel and renew the lists
            // await this.$store.dispatch(
            //         `BaseReport${this.sheet[0].toUpperCase() + this.sheet.slice(1)}/saveFromExcelMode`, 
            //         ev)
            // this.renewLists()
            
        }
        const remove = async (ev) => {
            console.log(ev)
            // let sure = confirm("Apakah anda yakin akan menghapusnya?")
            // if(sure) {
            //     //delete from idb
            //     await this.$store.dispatch("delete", {  
            //         store: `BaseReport${this.sheet[0].toUpperCase() + this.sheet.slice(1)}`, 
            //         criteria: {id: ev} 
            //     })
            //     this.renewLists()
            // }
        }
        const detailsDocument = () => {
            console.log('details dcouc')
            // total waktu, total kendaraan, total do
            // if(this.shift && this.base && this.base.id) {
            //     this.detailsStock = this.$store.getters["BaseReportStock/detailsByShiftAndParent"](this.shift, this.base.id)
            //     this.detailsClock = this.$store.getters["BaseReportClock/detailsByShiftAndParent"](this.shift, this.base.id)
            // }
        }
        const renewLists = async (ev) => {
            console.log('renewLists', ev)
            // //  || !this.shift || !this.sheet) { return }
            // this.base = this.BASEIDSELECTED(this.selectedPeriode, this.selectedWarehouse)
            // // console.log(this.base)
            
                if(ev.baseReportFile && ev.shift) {
                    await getBaseClockByParentByShift(ev.baseReportFile, Number(ev.shift))
                    await getBaseStockByParentByShift(ev.baseReportFile, Number(ev.shift))
                    // this.detailsDocument()
                    // renewthe lists using function BASEREPORTSTOCKSHIFTANDPARENT: "BaseReportStock/shiftAndParent",
                    // lists.value = 
                    return
                }
            //     // // jika tidak exists
            //     this.$store.commit("Modal/active", {judul: "", form: "Loader"});
            //     // looping cari baseReportStock dengan criteria { parent: baseReportFile.id }
            //     await this.$store.dispatch("BaseReportStock/getDataByParentAndShift", { parent: this.base.id, shift: +this.shift });
            //     // // looping cari baseReportClock dengan criteria { parent: baseReportFile.id }
            //     await this.$store.dispatch("BaseReportClock/getDataByParentAndShift", { parent: this.base.id, shift: +this.shift });
            //     this.$store.commit("Modal/active");
            //     this.renewLists()
            // }
        }

        const originColumn = computed(() => {
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
            })

        const tableName = () => {
            return "clock"
            // this.sheet === 
            //  ? "ExcelClock" : "excelStock";
        }

        const fromAdd = () => {
            return "clock" 
            // this.sheet === 
            // ? "BaseReportClockForm" : "BaseReportStockForm";
        }
        
        return {
            isMainMode, isExcelMode, lists, renderTable, message, duplicateRecord,
            handleProblem, launchForm, markAsFinished, save, remove, tableName, fromAdd,
            renewLists, isBaseFinishedForm, baseId
        }
    }
}
</script>