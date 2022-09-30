<template>
    <div>
        <AGGrid
            v-if="isExcelMode"
            :originColumn="table?.excelColumn"
            :rowData="lists"
            :tableName="table?.excelId"
            @exit="mode = 'Main'"
            @save="save($event)"
            rowHeight="70"
        >   
            <template #button>
                <Button class="w3-bar-item" small primary value="Add data" @trig="launchForm" type="button" />
            </template>
            <template #text>
                {{ excelLabel }}
                <!-- {{ $store.getters["dateFormat"]({format: "dateMonth", time: Number(selectedPeriode) })
                    + ", " +
                    $store.getters["Warehouses/warehouseId"](selectedWarehouse)?.name
                    + ", Shift: " +
                     shift 
                }} -->
            </template>
        </AGGrid>
        <div v-if="isMainMode" class="w3-margin-top w3-container">
            <!-- Panel base report -->
            <BasePanelVue @baseReportChanged="renewLists" @mode="lists.length ? mode = $event : ''" />
            <!-- Panel base report -->
            <div>
            <Datatable
                v-if="renderTable"
                :datanya="lists"
                :heads="table?.heads"
                :keys="table?.keys"
                :id="table?.idTable"
                option
                #default="{ prop }"
            >   
                <!-- When there is a problem in base report stock -->
                <span v-if="(prop.selisih || (prop.problem && prop.problem.length)) && isStockSheet">
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
                    v-if="isClockSheet"
                    value="Duplicate" 
                    type="button" 
                    primary
                    small
                    @trig="duplicateRecord(prop)" 
                />

            </Datatable>
            </div>
        </div>
        <BaseFinishForm 
            v-if="isBaseFinishedForm"
            :base="baseId" 
            :shift="nowShift"
            @exit="mode = 'Main'"
            @finished="markAsFinished($event)"
        />
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
import { getBaseClockByParentByShift, baseReportClockLists, updateBaseClock, markClockFinished } from '@/composable/components/BaseReportClock'
import { getBaseStockByParentByShift, baseReportStockLists, markStockFinished } from '@/composable/components/BaseReportStock'
import { ref, computed, watch } from "vue"
import { useStore } from "vuex"
import { subscribeMutation } from "@/composable/piece/subscribeMutation"
import { markDocumentFinished } from '@/composable/components/DocumentsPeriod'
import { someRecordFinished } from '@/composable/components/BaseReportFile'

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
        const store = useStore()
        const mode = ref('Main')
        const baseId = ref(null)
        const nowSheet = ref(null)
        const isMainMode = computed(() => mode.value == 'Main')
        const isExcelMode = computed(() => mode.value == 'Excel')
        const isBaseFinishedForm = computed(() => mode.value == 'BaseFinishedForm')
        const isClockSheet = computed(() => nowSheet.value == 'clock')
        const isStockSheet = computed(() => nowSheet.value == 'stock')
        const lists = ref([])
        const renderTable = ref(false)
        const excelLabel = ref(null)
        const nowShift = ref(null)
        
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
        // add data ( trigger from excel mode )
        const launchForm = async () => {
            // mode.value = ev
            // // jika clock jika stock
            let form = isClockSheet.value ? "BaseClockForm" : "BaseStockForm"
            // // launch modal dan form
            let res = await subscribeMutation(
                `Tambah record ${nowSheet.value}`,
                form,
                { parent: baseId.value, shift: nowShift.value },
                'Modal/tunnelMessage'
            )
            // if the new record coming
            if(res) {
                renewLists({ baseReportFile: baseId.value, shift: nowShift.value})
            }
        }

        const markAsFinished = async (ev) => {
            // console.log(ev)
            // buka loader
            store.commit("Modal/active", {judul: "", form: "Loader"});
            // iterate baseReport stocklist dan tambahkan parent document ev.id
            // lemparkan ke state saja biar gak bingung
            // tambahkan parent document pada basereportclock
            await markClockFinished(baseId.value, nowShift.value, ev.parentDocument)
            // tambahkan parent document pada basereportstock
            await markStockFinished(baseId.value, nowShift.value, ev.parentDocument)
            // update details document  totalDO, totalKendaraan, totalWaktu, standartWaktu
            await markDocumentFinished(baseId.value, ev.parentDocument, false)
            await someRecordFinished(baseId.value)
            // close the base finish form
            mode.value = 'Main'
            // tutup loader
            store.commit("Modal/active");
        }
        const save = async (records) => {
            for(let record of records) {
                if(isClockSheet.value) {
                    await updateBaseClock(record.id, record.changed)
                }
            }
            // console.log(ev)
            // if(isClockSheet.value) {
            //     updateBaseClock()
            // }
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
            
            if(ev.baseReportFile && ev.shift) {
                renderTable.value = false
                await getBaseClockByParentByShift(ev.baseReportFile, Number(ev.shift))
                await getBaseStockByParentByShift(ev.baseReportFile, Number(ev.shift))
                if(ev.sheet == 'stock') {
                    lists.value = baseReportStockLists(ev.baseReportFile, Number(ev.shift))
                    nowSheet.value = 'stock'
                } else {
                    lists.value = baseReportClockLists(ev.baseReportFile, Number(ev.shift))
                    nowSheet.value = 'clock'
                }
                nowShift.value = ev.shift
                excelLabel.value = ev.title
                baseId.value = ev.baseReportFile
                renderTable.value = true
            }
                
        }

        const table = computed(() => {
            if(nowSheet.value == 'clock') {
                return {
                    heads: ['Nomor', 'Register', 'Start', 'Finish', 'Istirahat', 'Total'],
                    excelId: 'excelClock',
                    keys: ['noDo', 'reg', 'start', 'finish', 'rehat', 'totalTime'],
                    idTable: 'BaseReportStockTable',
                    excelColumn: [
                        { headerName: "Nomor", field: "noDo", width: 100 },
                        { headerName: "Register", field: "reg", width: 100 },
                        { headerName: "Start", field: "start", width: 100, editable: true },
                        { headerName: "Finish", field: "finish", width: 100, editable: true },
                        { headerName: "Istirahat", field: "rehat", editable: true, width: 100 },
                        { headerName: "Total", field: "totalTime", editable: false, width: 100 },
                    ]
                }
            } else {
                return {
                    heads: ['Item', 'Selisih', 'Problem'],
                    excelId: 'excelStock',
                    keys: ['itemName', 'selisih', 'problem2'],
                    idTable: 'BaseReportStockTable',
                    excelColumn: [
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
                    ]
                }
            }
        })

        const fromAdd = () => {
            return "clock" 
            // this.sheet === 
            // ? "BaseReportClockForm" : "BaseReportStockForm";
        }
        
        return {
            isMainMode, isExcelMode, lists, renderTable, message, duplicateRecord,
            handleProblem, launchForm, markAsFinished, save, remove, fromAdd,
            renewLists, isBaseFinishedForm, baseId, table, isStockSheet, isClockSheet,
            excelLabel, nowShift , mode,
        }
    }
}
</script>