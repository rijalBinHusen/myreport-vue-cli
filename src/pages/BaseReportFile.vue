<template>
<div class="">
    <div class="w3-margin-top w3-container">
        <Button 
            class="w3-right" 
            primary 
            value="Set periode" 
            type="button" 
            @trig="pickPeriode" 
        />
    </div>
        <input
            class="w3-hide"
            @change.prevent="readExcel($event)"
            type="file"
            ref="importerBase"
            accept=".xls, .ods"
        />

            <Datatable
                :datanya="lists"
                :heads="['Periode', 'Gudang', 'Nama file', 'Shee stock', 'Sheet clock']"
                :keys="['periode2', 'warehouseName', 'fileName', 'stock', 'clock']"
                option
                id="tableImportBase"
                #default="{ prop }"
                v-if="renderTable"
            >

                <div v-if="!prop.imported">
                    <Button value="Import file" :datanya="prop.id" primary type="button" class="w3-tiny" @trig="launch($event)" />
                </div>
                <div v-else>
    				<Button 
                        v-if="!prop?.isRecordFinished" 
                        value="Delete imported" 
                        type="button" 
                        :datanya="prop.id" 
                        danger 
                        class="w3-tiny" 
                        @trig="remove($event)" 
                    />
                </div>

            </Datatable>
			
        </div>
</template>

<script>
import Input from "@/components/elements/Input.vue"
import Button from "@/components/elements/Button.vue"
import Datatable from "@/components/parts/Datatable.vue"
import readExcelFile from "@/composable/readExcel"
import { ref, onMounted } from 'vue'
import { getBaseReportFile, listsAllBaseReportFile, findBaseReportFile, updateBaseReport } from "@/composable/components/BaseReportFile"
import { subscribeMutation } from "@/composable/piece/subscribeMutation"
import { loader, modalClose } from "@/composable/piece/vuexModalLauncher"
import { dateMonth } from "@/composable/piece/dateFormat"
import { getWarehouseId } from "@/composable/components/Warehouses"
import { useStore } from "vuex"
import { removeClockByParent } from '@/composable/components/BaseReportClock' 
import { removeStockByParent } from '@/composable/components/BaseReportStock'
import { getProblemFromDB } from '@/composable/components/Problem'

export default {
    name: "Collect",
    components: {
        Input,
        Button,
        Datatable,
    },
    setup() {
        const importId = ref(null)
        const lists = ref([])
        const renderTable = ref(false)
        const importerBase = ref(null)
        const store = useStore()

        const pickPeriode = async () => { 
            let res = await subscribeMutation(
                'Pilih periode yang akan ditampilkan',
                'PeriodePicker',
                {},
                'Modal/tunnelMessage'
                )
            if(res) {
                store.commit('Modal/active', { judul: '', form: 'Loader' })
                await getBaseReportFile(res?.periode1, res?.periode2)
                renewLists()
                store.commit('Modal/active')
            }
        }

        const renewLists = async () => {
            lists.value = await listsAllBaseReportFile()
            if(lists.value) {
                renderTable.value = true
            }
        }

        onMounted(() => {
            getProblemFromDB()
            renewLists()
        })

        const launch = (ev) => {
            importerBase.value.click()
            importId.value = ev
        }
        // remove all data that was imported
        const remove = async (ev) => {
            let res = await subscribeMutation(
                '', 
                'Confirm', 
                { pesan: 'Semua data akan dihapus, apakah anda yakin?' },
                'Modal/tunnelMessage'
            )
            // let sure = confirm("Apakah anda yakin akan menghapusnya?")
            if(!res) { return; }
            loader()
                await removeStockByParent(ev)
                await removeClockByParent(ev)
                await updateBaseReport(ev, { 
                    fileName: false,
                    stock: false,
                    clock: false,
                    imported: false
                })
            modalClose()
            renewLists()
        }
        // read file and put to the state
        const readExcel = async (e) => {
            // info of record
            let infobase = findBaseReportFile(importId.value)
            // bring the loader up
            loader()
            let excel = await readExcelFile(e.target.files[0])
            let warehouseName = await getWarehouseId(infobase?.warehouse)
            let periode2 = dateMonth(infobase?.periode )

            let res = await subscribeMutation(
                warehouseName?.name + " " + periode2,
                'BaseReportFile',
                { base: importId.value, excel: excel },
                'Modal/tunnelMessage'
            )
            
            if(res) {
                renewLists()
            }
		}

        return {
            importId, pickPeriode, lists, renderTable, importerBase, launch,
            readExcel, remove
        }
    },
}
</script>