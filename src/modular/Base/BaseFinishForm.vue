<template>
    <div>
        <label class="w3-margin-top">Nama gudang</label>
        <input type="text" class="w3-input w3-margin-top w3-margin-bottom" 
        :value="dateMonth(document.periode) + ' ' + warehouseName + ' / Shift ' + document.shift" 
        disabled />
        <!-- Supervisors -->
        <label>Nama supervisors</label>
        <input type="text" class="w3-input w3-margin-top w3-margin-bottom" 
        :value="supervisor" 
        disabled />
        <!-- Head spv -->
        <label>Nama kabag</label>
        <input type="text" class="w3-input w3-margin-top w3-margin-bottom" 
        :value="headSpv" 
        disabled />
        <div class="w3-row" v-if="details">
            <div v-for="inp in inputs" :key="inp.label" class="w3-col s2 w3-padding-small">
                <label class="w3-margin-top">{{ inp.label }}</label>
                <input 
                    class="w3-input w3-margin-top w3-margin-bottom"
                    type="number"
                    :disabled="!inp.editable"
                    v-model="details[inp.valueFrom]" 
                    />
                    <!-- value="1" -->
                <!-- <input class="w3-input w3-margin-top w3-margin-bottom" :value="details[inp.valueFrom]" /> -->

            </div>
        </div>
        <Button 
            value="Exit" 
            class="w3-right"
            type="button" 
            danger 
            small
            @trig="$emit('exit')" 
        />
        <Button 
        v-if="document.collected && !document.isfinished"
            value="Save" 
            class="w3-right"
            type="button" 
            primary
            small
            @trig="save" 
        />
        <div 
        v-if="document?.collected && !document.isfinished" 
        class="w3-right w3-large w3-margin-right">
            <label for="generate">Generate report </label>
            <input type="checkbox" id="generate" v-model="generateReport" />
        </div>
    </div>
</template>

<script>
import Select from "../../components/elements/Select.vue"
import Button from "../../components/elements/Button.vue"
import { isGenerateDocument, getDocumentByPeriodeByWarehouseByShiftFromDb as getDocument } from '@/composable/components/DocumentsPeriod'
import { selectedPeriode, selectedWarehouse, shift } from "@/composable/components/BaseReportPanel"
import { onMounted, onUnmounted, ref, watch } from "vue"
import { getHeadspvId } from "@/composable/components/Headspv"
import { getSupervisorId } from "@/composable/components/Supervisors"
import { dateMonth } from "@/composable/piece/dateFormat"
import { getWarehouseId } from "@/composable/components/Warehouses"
import { clockDetails } from '@/composable/components/BaseReportClock'
import { stockDetails } from '@/composable/components/BaseReportStock'



export default {
    components: {
        Select,
        Button,
    },
    props: {
        base: {
            required: true,
            type: String,
        }
    },
    setup(props, { emit }) {
        const supervisor = ref(null)
        const headSpv = ref(null)
        const warehouseName = ref(null)
        const details = ref(null)
        const generateReport = ref(false)
        const timeout = ref(null)
        const freezePage = ref(null)
        const document = ref({})
        const keyPress = ref({})

        onMounted(async () => {
            // find the document first
            document.value = await getDocument(Number(selectedPeriode.value), selectedWarehouse.value, shift.value)
            supervisor.value = await getSupervisorId(document.value.name).then((res) => res.name)
            headSpv.value = await getHeadspvId(document.value.head).then((res) => res.name)
            warehouseName.value = await getWarehouseId(document.value.warehouse).then((res) => res.name)
            // if isFinished document
            if(document.value?.isfinished) {
                alert('Document finished')
                details.value = document.value
            } else {
                details.value = { ... clockDetails(props.base, document.value.shift), ...stockDetails(props.base, document.value.shift) }
            }
            // event listener
            window.addEventListener("keydown", pressKey)
            window.addEventListener("keyup", releaseKey)
        })

        onUnmounted(() => {
        //remove listen event
            window.removeEventListener("keydown", pressKey)
            window.removeEventListener("keyup", releaseKey)
        })

        const releaseKey = (event) => {
            delete keyPress.value[event.key]
        }
        function pressKey(event) {
            if(event.keyCode === 27) {
                // console.log('esc')
                emit('exit')
                return
            }
            keyPress.value[event.key] = true
            // if the control button still pressed
            if(keyPress.value['Control']) {
                // if the S (83) button pressed ( CTRL + S )
                if(event.keyCode === 83) {
                // prevent dialog save as to launch
                event.preventDefault()
                // if any record edited
                    if(document.value.collected && !document.value.isfinished) {
                        // save the canged record
                        save()
                        // console.log('ctrl + s')
                    }
                }
            }
            
        }

        const save = () => {
            // dont do anything when the page freeze
            if(freezePage.value) { return }
            // console.log(this.document)
            emit("finished", Object.assign({
                parentDocument: document.value.id,
                generateReport: generateReport.value,
            }, details.value ))
        }

        watch([generateReport], (newVal) => {
            clearTimeout(timeout.value)
            freezePage.value = true
            timeout.value = setTimeout(() => {
                freezePage.value = false
                isGenerateDocument(document.value.id, newVal[0])
            }, 600)
        })

        return {
            supervisor, headSpv, warehouseName, document, dateMonth, 
            details, generateReport, save
        }
        
    },
    emits: ["exit", "finished"],
    computed: {
        inputs() {
            return [
                { label: "Total produk keluar", valueFrom: "totalQTYOut", editable: false },
                { label: "Total item bergerak", valueFrom: "totalItemMoving", editable: false },
                { label: "Total produk masuk", valueFrom: "totalQTYIn", editable: false },
                { label: "Coret DO", valueFrom: "planOut", editable: false },
                { label: "Jumlah item keluar", valueFrom: "totalItemKeluar", editable: false },
                { label: "Total DO", valueFrom: "totalDo", editable: true },
                { label: "Total waktu", valueFrom: "totalWaktu", editable: true },
                { label: "Total kendaraan", valueFrom: "totalKendaraan", editable: true },
                { label: "Produk tidak FIFO",  valueFrom: "totalProductNotFIFO", editable: true},
                { label: "Produk variance", valueFrom: "itemVariance", editable: true },
            ]
        }
    },
}
</script>