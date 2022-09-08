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
            />
            
            <!-- Head supervisors -->
            <SelectHeadVue 
                @selectedHead="head = $event"
                class="w3-col s4 w3-padding" 
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
        <ButtonVue primary value="Tambah" class="w3-right" type="button"/>
            <!-- 
            <label for="solusi">solusi: </label><br>
            <textarea v-model="caseInput.solusi" id="solusi" style="width:100%; height:60px;"></textarea>


            <label for="status">Status done?</label>
            <input type="checkbox" v-model="caseInput.status" />

            <Button primary v-if="caseInput.id" value="Update" class="w3-right" type="button" @trig="updateCase"/>
            -->
        
        </form>
</template>

<script>
import datepicker from "vue3-datepicker"
import SelectVue from "@/components/elements/Select.vue"
import ButtonVue from "@/components/elements/Button.vue"
import { ymdTime } from "@/composable/piece/dateFormat"
import SelectSupervisorsVue from '@/components/parts/SelectSupervisors.vue'
import SelectHeadVue from "@/components/parts/SelectHead.vue"
import InputVue from "@/components/elements/Input.vue"
import { ref } from '@vue/reactivity'

export default {
    setup() {
        // periode, supervisor, head, masalah, sumberMasalah, Solusi, PIC, dl
        const periode = ref(new Date())
        const supervisor = ref('')
        const head = ref('')
        const masalah = ref('')
        const sumberMasalah = ref('')
        const solusi = ref('')
        const pic = ref('')
        const dl = ref(new Date())

        const handleSubmit = () => {
            console.log(periode.value, supervisor.value, head.value, masalah.value, sumberMasalah.value, solusi.value, pic.value, dl.value)
        }

        return { periode, supervisor, head, masalah, sumberMasalah, solusi, pic, dl, handleSubmit}
    },
    methods: {
        selectSpv(ev) {
            console.log(ev)
        }
        // picName(name) {
        //     this.caseInput.pic = this.$store.getters["Supervisors/spvId"](name)?.name
        // },
        // appendCase() {
        //     this.$store.dispatch("Cases/append", { ...this.caseInput, insert: ymdTime() })
        //     this.$store.commit("Modal/active")
        // },
        // updateCase() {
        //     this.$store.dispatch("update",
        //         { 
        //             store: "Cases", 
        //             obj: { ...this.caseInput }, 
        //             criteria: { id: this.caseInput.id }
        //         }
        //     )
        //     this.$store.commit("Modal/active")
        // }
    },
    // watch: {
    //     periodeModel(newVal, oldVal) {
    //         this.caseInput.periode = this.$store.getters["dateFormat"]({format: "ymdTime", time: newVal})
    //         this.dlModel = newVal
    //     },
    //     dlModel(newVal, oldVal) {
    //         this.caseInput.dl = this.$store.getters["dateFormat"]({format: "ymdTime", time: newVal})
    //     },
    // },
    // created() {
    //     let obj = this.$store.getters["Modal/obj"].obj
    //     if(obj?.edit) {
    //         // delete unneeded keys
    //         const {
    //             periode2,
    //             spvName,
    //             headName,
    //             edit,
    //             ...details
    //         } = obj;
    //         // put to the caseinput
    //         this.caseInput = details
    //         this.periodeModel = new Date(obj?.periode)
    //         this.dlModel = new Date(obj?.dl)
    //         // get the parent record
    //         let base = this.$store.getters["Cases/caseId"](obj.parent)
    //         // show to the left view editor
    //         this.baseData = Object.keys(base).map((val) => `${val}:<br> ${base[val]}`).join(`<hr/>`)
    //         return
    //     }
    //     this.caseInput.parent = obj?.id
    //     this.baseData = Object.keys(obj).map((val) => `${val}:<br> ${obj[val]}`).join(`<hr/>`)
    //     this.periodeModel = new Date()
    //     this.dlModel = new Date()
        
    // },
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