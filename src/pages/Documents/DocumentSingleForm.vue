<template>
<div>
    <div class="w3-row">  
        <label for="periode">Periode:</label>
        <datepicker id="periode" class="w3-margin-bottom w3-border w3-input" v-model="periodeModel"></datepicker>
        <div class="w3-col s3">
            <SelectSupervisors :inSelectSpv="supervisor" @selectedSpv="supervisor = $event" />
        </div>
        
        <div class="w3-col s3" style="padding: 0 16px 0 16px;">
            <SelectHead :inSelectHead="head" @selectedHead="head = $event"  />
        </div>

        <div class="w3-col s3" style="padding: 0 16px 0 16px;">
            <SelectShift :showLable="true" :inSelectShift="shift" @selectedShift="shift = $event"  />
        </div>

        <div class="w3-col s3">
            <SelectWarehouse :inSelectWarehouse="warehouse" @selectedWarehouse="warehouse = $event"  />
        </div>
        <div v-if="idDocument" class="w3-row">
            <div class="w3-col s6"  style="padding: 0 16px 0 0px;">
                <label for="periode">Dikumpulkan:</label>
                <datepicker id="periode" class="w3-margin-bottom w3-border w3-input" v-model="collectedModel"></datepicker>
            </div>
            <div class="w3-col s6" style="padding: 0 0px 0 16px;">
                <label for="periode">Diparaf:</label>
                <datepicker id="periode" class="w3-margin-bottom w3-border w3-input" v-model="approvalModel"></datepicker>
            </div>
        </div>
    </div>
    <Button primary value="Submit" class="w3-right" type="button" @trig="send"/>
</div>
</template>


<script>

import Button from "@/components/elements/Button.vue"
import Datepicker from "vue3-datepicker"
import { Documents } from "./DocumentsPeriod"
import SelectSupervisors from "@/pages/Supervisors/SelectSupervisors.vue"
import SelectHead from "@/components/parts/SelectHead.vue"
import SelectShift from "@/components/parts/SelectShift.vue"
import SelectWarehouse from "@/components/parts/SelectWarehouse.vue"
import { useStore } from "vuex"
import { ref, watch, onMounted } from "vue"
import { ymdTime } from "@/composable/piece/dateFormat"


export default {
    setup() {
        const supervisor = ref('')
        const periodeModel = ref(new Date())
        const shift = ref('')
        const head = ref('')
        const warehouse = ref('')
        const periodeTime = ref('')
        // isEditMode conditional using idDocument
        const idDocument = ref(false)
        const changed = {}
        const collectedModel = ref(new Date())
        const approvalModel = ref(new Date())
        const { addData, updateDocument, findDocument } = Documents();

        const store = useStore()

        watch([periodeModel, supervisor, shift, head, warehouse, collectedModel, approvalModel], (newVal) => {
            // periode model 
            if(newVal[0]) {
                periodeTime.value = ymdTime(newVal[0])
            }
            // if mode edit
            if(idDocument.value) {
                // periodeModel
                if(newVal[0]) { changed['periode'] = ymdTime(newVal[0]) }
                // supervisor
                if(newVal[1]) { changed['name'] = newVal[1] }
                // shift]
                if(newVal[2]) { changed['shift'] = newVal[2] }
                // head
                if(newVal[3]) { changed['head'] = newVal[3] }
                // warehouse
                if(newVal[4]) { changed['warehouse'] = newVal[4] }
                // collectedModel
                if(newVal[5]) { changed['collected'] = ymdTime(newVal[5]) }
                // approvalModel
                if(newVal[6]) { changed['approval'] = ymdTime(newVal[6]) }
            }
        })

        const send = async () => {
            if(idDocument.value) {
                await updateDocument(idDocument.value, changed)
            } else {
                await addData (
                    supervisor.value,
                    periodeTime.value,
                    shift.value, 
                    head.value, 
                    warehouse.value
                    )
            }
            store.commit('Modal/tunnelMessage', true)
            store.commit("Modal/active")
        }

        onMounted(() => {
            let obj = store.getters['Modal/obj']?.obj
            if(obj) {
                // get the document
                let doc = findDocument(obj?.idDocument)
                supervisor.value = doc?.name
                periodeModel.value = new Date(doc?.periode)
                shift.value = doc?.shift
                head.value = doc?.head
                warehouse.value = doc?.warehouse
                // fill the idDocument, so the form in the edit mode
                collectedModel.value = new Date(doc?.collected)
                approvalModel.value = new Date(doc?.approval)
                idDocument.value = doc?.id
            }
        })

        return { supervisor, periodeModel, shift, head, warehouse, send, idDocument, approvalModel, collectedModel }
    }, 
    components: {
        Button,
        Datepicker,
        SelectSupervisors,
        SelectHead,
        SelectShift,
        SelectWarehouse
    },
}
</script>@/pages/Documents/DocumentsPeriod