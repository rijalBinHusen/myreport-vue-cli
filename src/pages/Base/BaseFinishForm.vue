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

<script lang="ts" setup>
import Button from "../../components/elements/Button.vue"
import { selectedPeriode, selectedWarehouse, shift } from "./BaseReportPanel"
import { onMounted, onUnmounted, ref, watch, computed } from "vue"
import { dateMonth } from "@/composable/piece/dateFormat"
import { subscribeMutation } from "@/composable/piece/subscribeMutation"
import { problemActiveBySpvAndPeriode, updateProblem } from '@/pages/Problems/Problem'
import { getDocumentDetails, type DocumentDetails } from "./BaseFinishForm"


    const props = defineProps({
        base: {
            required: true,
            type: String,
        }
    });

    const infoDocs = ref(<DocumentDetails>{})
    
    const supervisor = ref(null)
    const headSpv = ref(null)
    const warehouseName = ref(null)
    const details = ref(null)
    const generateReport = ref(false)
    const timeout = ref(null)
    const freezePage = ref(null)
    const document = ref({})
    const keyPress = ref(<{[key: string]: boolean}>{})
    // const selisih

    onMounted(async () => {
        
        infoDocs.value = await getDocumentDetails(props.base, selectedPeriode.value, selectedWarehouse.value, shift.value)
        // event listener
        window.addEventListener("keydown", pressKey)
        window.addEventListener("keyup", releaseKey)
    })

    onUnmounted(() => {
    //remove listen event
        window.removeEventListener("keydown", pressKey)
        window.removeEventListener("keyup", releaseKey)
    })

    const releaseKey = (event: KeyboardEvent) => {
        delete keyPress.value[event.key]
    }
    function pressKey(event: KeyboardEvent) {
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

    watch([generateReport, document], (newVal, oldVal) => {
        if(newVal[0] !== oldVal[0]) {
            clearTimeout(timeout.value)
            freezePage.value = true
            timeout.value = setTimeout(() => {
                freezePage.value = false
                isGenerateDocument(document.value.id, newVal[0])
            }, 600)
        }
    })
    const emit = defineEmits(["exit", "finished"]);

    const inputs = computed(() => [
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
        )
</script>