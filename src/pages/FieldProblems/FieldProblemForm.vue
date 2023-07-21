<template>
    <form @submit.prevent="handleSubmit">
        <div class="w3-row w3-padding">
            <!-- Periode -->
            <div class="w3-col s4">
                <label for="periode" class="w3-margin-bottom">Periode:</label>
                <datepicker 
                    id="periode" 
                    class="w3-margin-top w3-border w3-input w3-round-large w3-padding" 
                    v-model="periode">
                </datepicker>
            </div>

            <!-- Supervisor -->
            <SelectSupervisorsVue 
                @selectedSpv="supervisor = $event"
                class="w3-col s4 w3-padding"
                :inSelectSpv="supervisor"
                :spvEnabled="true"
            />
            
            <!-- Head supervisors -->
            <SelectHeadVue 
                @selectedHead="head = $event"
                class="w3-col s4 w3-padding" 
                :inSelectHead="head"
            />
        </div>

        <div class="w3-row">
            <!-- Masalah -->
            <div class="w3-col s4 w3-padding">  
                <label for="masalah">Masalah: </label>
                <label for="masalah">Max length(255) {{ masalah.length }} </label><br>
                <textarea 
                    v-model="masalah" 
                    rows="5" 
                    id="masalah" 
                    style="width:100%;">
                </textarea>
            </div>
            
            <div class="w3-col s4 w3-padding">  
                <label for="sumberMasalah">Sumber masalah: </label>
                <textarea 
                    v-model="sumberMasalah" 
                    id="sumberMasalah" 
                    style="width:100%;"
                    rows="5" 
                >
                </textarea>
            </div>
            
            <div class="w3-col s4 w3-padding">  
                <label for="sumberMasalah">solusi: </label>
                <textarea 
                    v-model="solusi" 
                    id="sumberMasalah" 
                    style="width:100%;"
                    rows="5" 
                >
                </textarea>
            </div>
        </div>

        <div class="w3-row w3-padding">
            <input-vue
                label="PIC" 
                placeholder="PIC" 
                class="w3-col s4 w3-margin-right" 
                @inp="pic = $event"
                :value="pic"
                type="text"
            />

            <!-- Deadline -->
            <div class="w3-col s4">
                <label for="periode" class="w3-margin-bottom">Deadline:</label>
                <datepicker 
                    id="Deadline" 
                    class="w3-border w3-input w3-round-large w3-padding" 
                    v-model="dl">
                </datepicker>
            </div>
        </div>
        <ButtonVue primary :value="idFieldProblem ? 'Update' : 'Tambah'" class="w3-right" type="button"/>
        
        </form>
</template>

<script>
import datepicker from "vue3-datepicker"
import SelectVue from "@/components/elements/Select.vue"
import ButtonVue from "@/components/elements/Button.vue"
import SelectSupervisorsVue from '@/pages/Supervisors/SelectSupervisors.vue'
import SelectHeadVue from "@/pages/Headspv/SelectHead.vue"
import InputVue from "@/components/elements/Input.vue"
import { ref } from '@vue/reactivity'
import { addData, updateData } from './FieldProblem'
import { onMounted, watchEffect } from '@vue/runtime-core'
import { getSupervisorId } from '@/pages/Supervisors/Supervisors'
import { loader, modalClose } from '@/composable/piece/vuexModalLauncher'
import { useStore } from 'vuex'
import { getFieldProblemById } from './FieldProblem'

export default {
    setup() {
        // periode, supervisor, head, masalah, sumberMasalah, Solusi, PIC, dl
        const idFieldProblem = ref(null)
        const periode = ref(new Date())
        const supervisor = ref('-')
        const head = ref('-')
        const masalah = ref('-')
        const sumberMasalah = ref('-')
        const solusi = ref('-')
        const pic = ref('-')
        const dl = ref(new Date())
        const store = useStore()

        watchEffect(async () => {
            supervisor: {
                let res = await getSupervisorId(supervisor.value)
                pic.value = res?.name
            }
        })

        const handleSubmit = async () => {
            // send a message to subscribe mutation
            loader()
            if(idFieldProblem.value) {
                await updateData(
                    idFieldProblem.value,
                    periode.value, 
                    supervisor.value, 
                    head.value,
                    masalah.value, 
                    sumberMasalah.value, 
                    solusi.value, 
                    pic.value, 
                    dl.value
                )
            } else {
                await addData(
                    periode.value, 
                    supervisor.value, 
                    head.value,
                    masalah.value, 
                    sumberMasalah.value, 
                    solusi.value, 
                    pic.value, 
                    dl.value
                )
            }
            store.commit('Modal/tunnelMessage', true)
            modalClose()
        }

        onMounted(async () => {
            // check the modal obj, if is there obj key exists, the mode is edit
            idFieldProblem.value = store.getters['Modal/obj']?.obj
            if(idFieldProblem.value) {
                // get problem first
                const fieldProblem = await getFieldProblemById(idFieldProblem.value)
                // fill the form with value
                periode.value = new Date(fieldProblem.periode)
                supervisor.value = fieldProblem.supervisor
                head.value = fieldProblem.head
                masalah.value = fieldProblem.masalah
                sumberMasalah.value = fieldProblem.sumberMasalah
                solusi.value = fieldProblem.solusi
                pic.value = fieldProblem.pic
                dl.value = new Date(fieldProblem.dl)
            }
        })

        return { 
            periode,
            supervisor, 
            head, 
            masalah, 
            sumberMasalah, 
            solusi, 
            pic, 
            dl, 
            handleSubmit,
            idFieldProblem
        }
    },
    components: {
        datepicker, 
        SelectVue, 
        ButtonVue,
        SelectSupervisorsVue,
        SelectHeadVue,
        InputVue
    },
}
</script>