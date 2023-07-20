<template>
    <div>
        <label class="w3-margin-top">Nama file</label>
        <input type="text" class="w3-input w3-margin-top w3-margin-bottom" :value="excel?.fileName" disabled />
        <label class="w3-margin-top">Clock Sheet</label>
        <Select 
            :options="sheetNames" 
            judul="Clock sheet"
            value="id"
            text="title"
            @selected="clock = $event"
        />
        <label class="w3-margin-top">Stock Sheet</label>
        <Select 
            :options="sheetNames" 
            judul="Stock sheet"
            value="id"
            text="title"
            @selected="stock = $event"
        />
        <Button
            primary 
            class="w3-margin-top w3-right" 
            value="Submit" 
            type="button"
            @trig="importBase"
        />
    </div>
</template>

<script>
import Select from "@/components/elements/Select.vue"
import Button from "@/components/elements/Button.vue"
import { useStore } from "vuex"
import { ref, onMounted } from "vue"
import { baseClock } from './BaseReportClock'
import { baseReportStock } from './BaseReportStock'
import { BaseReportFile } from './BaseReportFile'

const { startImportClock } = baseClock();
const { startImportStock } = baseReportStock();

export default {
    components: { Select, Button, },
    setup() {
        const { updateBaseReport } = new BaseReportFile();
        const clock = ref(null)
        const stock = ref(null)
        const infoBaseReport = ref(null)
        const store = useStore()
        const excel = ref(null)
        const baseId = ref(null)
        const sheetNames = ref([])

        onMounted(() => {
            let modalObj = store.getters['Modal/obj']?.obj
            baseId.value = modalObj?.base
            excel.value = modalObj?.excel
            sheetNames.value = excel.value.sheetNames.map((val) => ({
                id: val, title: val
            }))
        })

        const importBase = async () => {
            // jika clock dan stock tidak null
            if(!clock.value || !stock.value) {
                alert("Select sheet first!")
                return
            }
            // launch the loader
            store.commit("Modal/active", { judul: "", form: "Loader" })
            // waiting the base report clockk import
            await startImportClock(excel.value.sheets[clock.value], baseId.value)
            // waiting the base report stock import
            await startImportStock(excel.value.sheets[stock.value], baseId.value)
            // update the document base report file
            await updateBaseReport(baseId.value, { 
                fileName: excel.value.fileName,
                stock: stock.value,
                clock: clock.value,
                imported: true
            })
            // send to the tunnel message that we are did something
            store.commit("Modal/tunnelMessage", true)
            store.commit("Modal/active")
        }

        return {
            clock, stock, infoBaseReport, excel, importBase, sheetNames
        }
    },
}
</script>@/pages/BaseReportFile/BaseReportFile