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
import { getBaseClockByParentByShift, baseReportClockLists, updateBaseClock, removeClock, appendData as appendClockRecord } from '@/composable/components/BaseReportClock'
import { getBaseStockByParentByShift, baseReportStockLists, markStockFinished, updateBaseStock, removeStock } from '@/composable/components/BaseReportStock'
import { ref, computed } from "vue"
import { useStore } from "vuex"
import { subscribeMutation } from "@/composable/piece/subscribeMutation"
import { markDocumentFinished, getDocumentByPeriodeByWarehouseByShiftFromDb } from '@/composable/components/DocumentsPeriod'
import { BaseReportFile } from '@/pages/BaseReportFile/BaseReportFile'
import { sheet as nowSheet, shift as nowShift, selectedWarehouse, selectedPeriode } from '@/composable/components/BaseReportPanel'
import { getWarehouseId } from "@/composable/components/Warehouses"
import { getSupervisorId } from "@/composable/components/Supervisors"
import { dateMonth } from "@/composable/piece/dateFormat"
import AGDateEditorVue from "@/components/parts/AGDateEditor.vue"
import { loaderMessage } from "../../components/parts/Loader/state";

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
        const { someRecordFinished } = new BaseReportFile()
        const mode = ref('Main')
        const baseId = ref(null)
        const isMainMode = computed(() => mode.value == 'Main')
        const isExcelMode = computed(() => mode.value == 'Excel')
        const isBaseFinishedForm = computed(() => mode.value == 'BaseFinishedForm')
        const isClockSheet = computed(() => nowSheet.value == 'clock')
        const isStockSheet = computed(() => nowSheet.value == 'stock')
        const lists = ref([])
        const renderTable = ref(false)
        const excelLabel = ref(null)
        
        const message = async (ev, obj) => {
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
            let theDocument = await getDocumentByPeriodeByWarehouseByShiftFromDb(Number(+selectedPeriode.value), selectedWarehouse.value, nowShift.value)
            let spvInfo = await getSupervisorId(theDocument.name)
            let warehouseName = await getWarehouseId(selectedWarehouse.value).then((res) => res.name)
            let pesan;
            let salam = `Assalamu alaikum pak ${spvInfo.name}%0a%0a`
            let pembuka = `Mohon maaf menggangu,%0aDi laporan pak ${spvInfo.name} periode *${dateMonth(+selectedPeriode.value) }*, shift ${nowShift.value} ${warehouseName}, untuk item ${obj.itemName}`
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
        }
        
        const duplicateRecord = async (ev) => {
            // console.log('duplicateRecord', ev)
            await appendClockRecord(ev.parent, ev.shift, +ev.noDo++, ev.reg, ev.start, ev.finish, ev.rehat)
            renewLists()
        }

        const handleProblem = async (ev, obj) => {
            if(ev === "delete") {
                let confirm = await subscribeMutation('', 'Confirm', { pesan: 'Semua problem akan dihapus!'}, 'Modal/tunnelMessage')
                if(confirm) {
                    await updateBaseStock(obj.id, { problem: [] })
                } else {
                    return
                }
            } else {
                let edit =  await subscribeMutation(
                        'Edit problem', 
                        'BaseProblemForm', 
                        { 
                            id: obj.id, 
                            periode: +selectedPeriode.value, 
                            warehouse: selectedWarehouse.value, 
                            item: obj.item,
                            itemName: obj.itemName,
                            problem: obj.problem
                        }, 
                        'Modal/tunnelMessage'
                    )
                    if(!edit) {
                        return
                    }
            }
            renewLists()
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
                renewLists()
            }
        }

        const markAsFinished = async (ev) => {
            // buka loader
            store.commit("Modal/active", {judul: "", form: "Loader"});
            // iterate baseReport stocklist dan tambahkan parent document ev.id
            // lemparkan ke state saja biar gak bingung
            // tambahkan parent document pada basereportclock
            // ternyata kita tidak perlu melakukanya pada clock, kayak gaada gunanya gitu
            // await markClockFinished(baseId.value, nowShift.value, ev.parentDocument)
            // tambahkan parent document pada basereportstock
            await markStockFinished(baseId.value, nowShift.value, ev.parentDocument)
            // update details document  totalDO, totalKendaraan, totalWaktu, standartWaktu
            const { parentDocument, ...details } = ev
            await markDocumentFinished(ev.parentDocument, false, { ...details, baseReportFile: baseId.value})
            await someRecordFinished(baseId.value)
            // close the base finish form
            mode.value = 'Main'
            // tutup loader
            store.commit("Modal/active");
        }
        const save = async (records) => {
            store.commit("Modal/active", {judul: "", form: "Loader"});
            for(let [index, record] of records.entries()) {
                loaderMessage.value = `Menyimpan record ${index + 1} dari ${records.length}`;
                if(isClockSheet.value) {
                    await updateBaseClock(record.id, record.changed)
                } else {
                    await updateBaseStock(record.id, record.changed)
                }
            }
            loaderMessage.value = '';
            await renewLists()
            store.commit("Modal/active");
        }
        const remove = async (idRecord) => {
            // console.log(ev)
            let sure = await subscribeMutation('', 'Confirm', {}, 'Modal/tunnelMessage')
            if(sure) {
                //delete from idb
                if(isClockSheet.value) {
                    await removeClock(idRecord)
                } else {
                    await removeStock(idRecord)
                }
                renewLists()
            }
        }
        const renewLists = async (ev) => {
            baseId.value = ev?.baseReportFile || baseId.value
            
            if(baseId.value && nowShift.value) {
                renderTable.value = false
                await getBaseClockByParentByShift(baseId.value, Number(nowShift.value))
                await getBaseStockByParentByShift(baseId.value, Number(nowShift.value))
                if(isStockSheet.value) {
                    lists.value = await baseReportStockLists(baseId.value, Number(nowShift.value))
                    nowSheet.value = 'stock'
                } else {
                    lists.value = baseReportClockLists(baseId.value, Number(nowShift.value))
                    nowSheet.value = 'clock'
                }
                excelLabel.value = ev?.title || excelLabel.value
                renderTable.value = true
            }
                
        }

        const table = computed(() => {
            if(nowSheet.value == 'clock') {
                return {
                    heads: ['Nomor', 'Register', 'Start', 'Finish', 'Istirahat', 'Total'],
                    excelId: 'excelClock',
                    keys: ['noDo', 'reg', 'start', 'finish', 'rehat', 'totalTime'],
                    idTable: 'BaseReportClockTable',
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
                        { headerName: "Awal", field: "awal", editable: true, resizable: true, width: 100, valueParser: params => Number(params.newValue) }, 
                        { headerName: "Masuk", field: "in", editable: true, resizable: true, width: 100, filter: 'agNumberColumnFilter', valueParser: params => Number(params.newValue) }, 
                        { headerName: "Tanggal masuk", field: "dateIn", editable: true, resizable: true, maxWidth: 120, wrapText: true, autoHeight: true, cellEditor: AGDateEditorVue }, 
                        { headerName: "Coret DO", field: "planOut", editable: true, resizable: true, width: 100, valueParser: params => Number(params.newValue)  }, 
                        { headerName: "Keluar", field: "out", editable: true, resizable: true, width: 100, filter: 'agNumberColumnFilter', valueParser: params => Number(params.newValue)  }, 
                        { headerName: "Tanggal keluar", field: "dateOut", editable: true, resizable: true, maxWidth: 120, wrapText: true, autoHeight: true, cellEditor: AGDateEditorVue}, 
                        { headerName: "Akhir", editable: false, resizable: true, valueGetter: '(+data.in) - (+data.out) + data.awal', width: 100 },
                        { headerName: "Real stock", field: "real", editable: true, resizable: true, width: 100, valueParser: params => Number(params.newValue)  },
                        { headerName: "Tanggal terlama", field: "dateEnd", editable: true, resizable: true, maxWidth: 120, wrapText: true, autoHeight: true, cellEditor: AGDateEditorVue }, 
                        { headerName: "Selisih", editable: false, width:80, valueGetter: 'data.real - ((+data.in) - (+data.out) + (+data.awal))'}, 
                    ]
                }
            }
        })
        
        return {
            isMainMode, isExcelMode, lists, renderTable, message, duplicateRecord,
            handleProblem, launchForm, markAsFinished, save, remove,
            renewLists, isBaseFinishedForm, baseId, table, isStockSheet, isClockSheet,
            excelLabel, nowShift , mode,
        }
    }
}
</script>@/pages/BaseReport/BaseReportFile@/pages/BaseReport/BaseReportClock@/pages/BaseReport/BaseReportStock@/pages/BaseReport/BaseReportPanel@/pages/Documents/DocumentsPeriod