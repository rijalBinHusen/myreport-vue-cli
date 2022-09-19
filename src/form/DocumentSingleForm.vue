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
            <SelectShift :inSelectShift="shift" @selectedShift="shift = $event"  />
        </div>

        <div class="w3-col s3">
            <SelectWarehouse :inSelectWarehouse="warehouse" @selectedWarehouse="warehouse = $event"  />
        </div>
    </div>
    <Button primary value="Submit" class="w3-right" type="button" @trig="send"/>
</div>
</template>


<script>

import Button from "@/components/elements/Button.vue"
import Datepicker from "vue3-datepicker"
import { addData, updateDocument } from "@/composable/components/DocumentsPeriod"
import SelectSupervisors from "@/components/parts/SelectSupervisors.vue"
import SelectHead from "@/components/parts/SelectHead.vue"
import SelectShift from "@/components/parts/SelectShift.vue"
import SelectWarehouse from "@/components/parts/SelectWarehouse.vue"
import { useStore } from "vuex"
import { ref, watch, onMounted } from "vue"


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
        const changed = ref({})

        const store = useStore()

        watch([periodeModel, supervisor, shift, head, warehouse], (newVal) => {
            if(idDocument.value) {
                // periodeModel
                if(newVal[0]) {
                    changed['periode'] = newVal[0].getTime()
                }
                // supervisor
                if(newVal[1]) {
                    changed['name'] = newVal[1]
                }
                // shift]
                if(newVal[2]) {
                    changed['shift'] = newVal[2]
                }
                // head
                if(newVal[3]) {
                    changed['head'] = newVal[3]
                }
                // warehouse
                if(newVal[4]) {
                    changed['warehouse'] = newVal[4]
                }
            }
        })

        const send = async () => {
            if(idDocument.value) {
                await updateDocument(idDocument, changed)
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
            console.log('singleForem')
        })

        return { supervisor, periodeModel, shift, head, warehouse, send }
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
</script>