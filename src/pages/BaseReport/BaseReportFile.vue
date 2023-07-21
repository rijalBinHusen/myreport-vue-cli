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
        
        <Button 
            class="w3-right" 
            primary 
            value="Add periode" 
            type="button" 
            @trig="handleAddPeriode" 
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
            >

                <div v-if="!prop.imported">
                    <Button value="Import file" :datanya="prop.id" primary type="button" class="w3-tiny" @trig="launch($event)" />
                    <Button value="Delete" :datanya="prop.id" danger type="button" class="w3-tiny" @trig="removeBase($event)" />
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
import readExcelFile from "@/utils/readExcel"
import { ref, onMounted } from 'vue'
import { BaseReportFile, lists } from "./BaseReportFile";
import { subscribeMutation } from "@/composable/piece/subscribeMutation"
import { loader, modalClose } from "@/composable/piece/vuexModalLauncher"
import { dateMonth } from "@/composable/piece/dateFormat"
import { getWarehouseById } from "@/pages/Warehouses/Warehouses"
import { useStore } from "vuex"
// import { getProblemFromDB } from '@/pages/Problems/Problem'

export default {
    name: "Collect",
    components: {
        Input,
        Button,
        Datatable,
    },
    setup() {
        const importId = ref(null)
        const importerBase = ref(null)
        const store = useStore()
        const { getBaseReportFile, findBaseReportFileById, addBaseReportFileManual, removeBaseReport, removeBaseReportChilds } = BaseReportFile();

        const removeBase = async (idBaseReport) => {
            let res = await subscribeMutation('', 'Confirm', {pesan: 'Apakah anda yakin akan menghapus record?'}, 'Modal/tunnelMessage')
            if(res) {
                await removeBaseReport(idBaseReport)
                
            }
        }

        const pickPeriode = async () => { 
            let res = await subscribeMutation(
                'Pilih periode yang akan ditampilkan',
                'PeriodePicker',
                {},
                'Modal/tunnelMessage'
                )
            if(res) {
                loader()
                await getBaseReportFile(res?.periode1, res?.periode2)
                modalClose()
            }
        }

        const handleAddPeriode = async () => {
            let res = await subscribeMutation(
                'Pilih periode yang akan ditampilkan',
                'PeriodePicker',
                {},
                'Modal/tunnelMessage'
                )
            if(res) {
                store.commit('Modal/active', { judul: '', form: 'Loader' })
                await addBaseReportFileManual(res?.periode1)
                
                store.commit('Modal/active')
            }
        }

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
            if(res) {
                loader()
                await removeBaseReportChilds(ev);
                modalClose()
            }
        }
        // read file and put to the state
        const readExcel = async (e) => {
            // info of record
            let infobase = await findBaseReportFileById(importId.value)
            // bring the loader up
            loader()
            let excel = await readExcelFile(e.target.files[0])
            let periode2 = dateMonth(infobase?.periode )

            await subscribeMutation(
                infobase.warehouseName + " " + periode2,
                'BaseReportFile',
                { base: importId, excel: excel },
                'Modal/tunnelMessage'
            )

            importerBase.value.value = ''
		}

        return {
            importId, pickPeriode, importerBase, launch,
            readExcel, remove, handleAddPeriode, removeBase, lists
        }
    },
}
</script>