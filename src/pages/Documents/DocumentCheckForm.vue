<template>
    <div>
        <div>
            <Input label="Periode:" 
                placeholder="Periode" 
                class="w3-margin-bottom" 
                :value="date" 
                disabled 
                type="text"
            />
            
            <div class="w3-row">
                <!-- Supervisor -->
                <div class="w3-col s3">
                    <SelectSupervisors 
                        :inSelectSpv="supervisor"
                        :disabled="!isEdit"
                        @selectedSpv="supervisor = $event"
                        />
                </div>
                <!-- Kabag -->
                <div class="w3-col s3" style="padding: 0 16px 0 16px;">
                    <SelectHead 
                        :inSelectHead="head"
                        :disabled="!isEdit"
                        @selectedHead="head = $event"
                        :enabledHeadOnly="true"
                        />
                </div>
                <!-- shift -->
                <div class="w3-col s3" style="padding: 0 16px 0 16px;">
                    <SelectShift 
                        :disabled="!isEdit"
                        :inSelectShift="shift + ''"
                        :showLable="true"
                        @selectedShift="shift = $event"
                        />
                </div>
                <!-- warehouse -->
                <div class="w3-col s3">
                    <SelectWarehouse 
                        :disabled="!isEdit"
                        :inSelectWarehouse="warehouse"
                        @selectedWarehouse="warehouse = $event"
                        />
                </div>

            </div>
        </div>
        <Button primary value="Save" v-if="isEdit"  class="w3-margin-top" type="button" @trig="save" />
    </div>
</template>

<script lang="ts">

import Select from "@/components/elements/Select.vue"
import Input from "@/components/elements/Input.vue"
import Button from "@/components/elements/Button.vue"
import SelectShift from "@/components/parts/SelectShift.vue"
import SelectSupervisors from "@/pages/Supervisors/SelectSupervisors.vue"
import SelectHead from "@/pages/Headspv/SelectHead.vue"
import SelectWarehouse from "@/pages/Warehouses/SelectWarehouse.vue"
import { onMounted, ref, watch } from "vue"
import { useStore } from "vuex"
import { Documents, type  DocumentsMapped, type DocumentUpdate} from "./DocumentsPeriod"
import { dateMonth  } from "@/composable/piece/dateFormat"

export default {
    setup() {
        const store = useStore()
        let record = <DocumentsMapped>{}
        const date = ref('')
        const supervisor = ref('')
        const head = ref('')
        const shift = ref(0)
        const warehouse = ref('')
        const isEdit = ref(false)
        const changed = <DocumentUpdate>{};
        const timeCollected = ref(0)
        const { findDocument, updateDocument, collectDocument } = Documents();

        watch([date, supervisor, head, shift, warehouse], (newVal) => {
            if(isEdit.value) {
                // supervisor 
                if(record.name != newVal[1]) {
                    changed['name'] = newVal[1]
                }
                // head
                if(record['head'] != newVal[2]) {
                    changed['head'] = newVal[2]
                }
                // shift
                if(record.shift != newVal[3]) {
                    changed['shift'] = Number(newVal[3])
                }
                // warehouse
                if(record['warehouse'] != newVal[4]) {
                    changed['warehouse'] = newVal[4]
                }
            }
        })

        onMounted( async () => {
            let obj = store.getters['Modal/obj']?.obj
            // console.log(obj)
            const getRecord = await findDocument(obj.id)
            if(typeof getRecord === 'undefined') {
                return;
            }
            record = getRecord
            date.value = dateMonth(record.periode)
            supervisor.value = record.name
            head.value = record.head
            shift.value = record.shift
            warehouse.value = record.warehouse
            timeCollected.value = Number(obj.time)
            setTimeout(() => {
                isEdit.value = obj.mode === 'edit'
            }, 90)
        })

        const save = async () => {
            // if the record changed
            if(Object.keys(changed).length) {
                await updateDocument(record.id, changed)
            } 
            if(timeCollected.value < 1) {
                await collectDocument(record.id, timeCollected.value)
            }
            store.commit('Modal/tunnelMessage', true)
            //close the modal
            store.commit("Modal/active")
        }

        return { record, isEdit, date, supervisor, head, shift, warehouse, save }
    },
    components: {
        Input,
        Select,
        Button,
        SelectShift,
        SelectSupervisors,
        SelectHead,
        SelectWarehouse
    },
}
</script>