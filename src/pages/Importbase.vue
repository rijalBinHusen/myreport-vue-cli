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
import { ref } from 'vue'
import { getBaseReportFile, listsAllBaseReportFile, findBaseReportFile } from "@/composable/components/BaseReportFile"
import { subscribeMutation } from "@/composable/piece/subscribeMutation"
import { loader } from "@/composable/piece/vuexModalLauncher"
import { dateMonth } from "@/composable/piece/dateFormat"
import { getWarehouseId } from "@/composable/components/Warehouses"
import { useStore } from "vuex"

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
                await getBaseReportFile(res?.periode1, res?.periode2)
                renewLists()
            }
        }

        const renewLists = async () => {
            lists.value = await listsAllBaseReportFile()
            renderTable.value = true
        }

        const launch = (ev) => {
            importerBase.value.click()
            importId.value = ev
        }
        // remove all data that was imported
        const remove = async (ev) => {
            // let sure = confirm("Apakah anda yakin akan menghapusnya?")
            // if(!sure) { return; }
            // this.$store.dispatch("BaseReportFile/emptyRecord", ev)
        }
        // read file and put to the state
        const readExcel = (e) => {
            // info of record
            let infobase = findBaseReportFile(importId.value)
            // bring the loader up
            loader()
            readExcelFile(e.target.files[0]).then( async (d) => {
                let warehouseName = await getWarehouseId(infobase?.warehouse)
                let periode2 = dateMonth(infobase?.periode )
                // bring the form up and send the baseid info to the modal state
                // send data excel
                store.commit("Modal/active", {
                    judul: warehouseName?.name + " " + periode2, 
                    form: "BaseReportFile",
                    obj: {
                        base: importId.value,
                        excel: d
                    }
                });
			})
		}

        return {
            importId, pickPeriode, lists, renderTable, importerBase, launch,
            readExcel, remove
        }
    },
}
</script>