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
                        :spvEnabled="true"
                        @selectedSpv="supervisor = $event"
                        />
                </div>
                <!-- Kabag -->
                <div class="w3-col s3" style="padding: 0 16px 0 16px;">
                    <SelectHead 
                        :inSelectHead="head"
                        :disabled="!isEdit"
                        @selectedHead="head = $event"
                        />
                </div>
                <!-- shift -->
                <div class="w3-col s3" style="padding: 0 16px 0 16px;">
                    <SelectShift 
                        :disabled="!isEdit"
                        :inSelectShift="shift"
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

<script>

import Select from "@/components/elements/Select.vue"
import Input from "@/components/elements/Input.vue"
import Button from "@/components/elements/Button.vue"
import SelectSupervisors from "@/components/parts/SelectSupervisors.vue"
import SelectHead from "@/components/parts/SelectHead.vue"
import SelectShift from "@/components/parts/SelectShift.vue"
import SelectWarehouse from "@/components/parts/SelectWarehouse.vue"
import { onMounted, ref, watch } from "vue"
import { useStore } from "vuex"
import { findDocument, updateDocument, collectDocument } from "@/composable/components/DocumentsPeriod"
import { dateMonth  } from "@/composable/piece/dateFormat"

export default {
    setup() {
        const store = useStore()
        let record = {}
        const date = ref('')
        const supervisor = ref('')
        const head = ref('')
        const shift = ref('')
        const warehouse = ref('')
        const isEdit = ref(false)
        const changed = ref({})
        const timeCollected = ref({})

        watch([date, supervisor, head, shift, warehouse], (newVal) => {
            if(isEdit.value) {
                // supervisor 
                if(record['supervisor'] != newVal[1]) {
                    changed.value['supervisor'] = newVal[1]
                }
                // head
                if(record['head'] != newVal[2]) {
                    changed.value['head'] = newVal[2]
                }
                // shift
                if(record['shift'] != newVal[3]) {
                    changed.value['shift'] = newVal[3]
                }
                // warehouse
                if(record['warehouse'] != newVal[4]) {
                    changed.value['warehouse'] = newVal[4]
                }
            }
        })

        onMounted(() => {
            let obj = store.getters['Modal/obj']?.obj
            record = findDocument(obj.id)
            date.value = dateMonth(record.periode)
            supervisor.value = record.name
            head.value = record.head
            shift.value = record.shift
            warehouse.value = record.warehouse
            timeCollected.value = Number(obj.time)
            setTimeout(() => {
                isEdit.value = obj.mode === 'edit'
            }, 300)
        })

        const save = async () => {
            // if the record changed
            console.log(record, changed.value)
            if(Object.keys(changed.value).length) {
                await updateDocument(record.id, changed.value)
            } 
            await collectDocument(record.id, timeCollected.value)
            store.commit('Modal/tunnelMessage', true)
            //close the modal
            store.commit("Modal/active")
        }

        return { record, isEdit, date, supervisor, head, shift, warehouse, save }
    },
    methods: {
    },
    computed: {
        names() {
            return this.$store.state.Supervisors.lists
        },
        heads() {
            return JSON.parse(JSON.stringify(this.$store.state.Headspv.lists))
        },
    },
    // mounted() {
    //     this.record = this.$store.getters["Document/getId"](this.$store.getters["Modal/obj"].id)
    //     this.more = this.$store.getters["Modal/obj"]

    // },
    components: {
    Input,
    Select,
    Button,
    SelectSupervisors,
    SelectHead,
    SelectShift,
    SelectWarehouse
},
    name: "UncollectedEditForm",
}
</script>