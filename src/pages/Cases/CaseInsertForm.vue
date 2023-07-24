<template>
    <div class="w3-row">
        <div class="w3-col s6 w3-padding-large" v-html="baseCase" style="overflow: auto; height: 400px;">
        </div>
        <div class="w3-col s6 w3-padding-large" style="overflow: auto; height: 400px;">
            <!-- Head spv -->
            <SelectHead 
                :inSelectHead="head"
                @selectedHead="head = $event"
            />
            
            <!-- Supervisor -->
            <SelectSupervisors 
                @selectedSpv="name = $event; picName($event)"
                :inSelectSpv="name"
            
            />

            <label for="sumberMasalah">Sumber masalah: </label><br>
            <textarea v-model="sumberMasalah" id="sumberMasalah" style="width:100%; height:60px;"></textarea>

            <label for="solusi">solusi: </label><br>
            <textarea v-model="solusi" id="solusi" style="width:100%; height:60px;"></textarea>

            
            <!-- Periode -->
            <label for="periode">Periode:</label>
            <datepicker id="periode" class="w3-margin-bottom w3-border w3-input" v-model="periodeModel"></datepicker>

            <label for="dl">Dead line:</label>
            <datepicker id="dl" class="w3-margin-bottom w3-border w3-input" v-model="dlModel"></datepicker>
            <!-- Masalah -->
            <label for="masalah">Masalah: </label><br>
            <label for="masalah">Max length(255) {{ masalah.length }} </label><br>
            <textarea v-model="masalah" rows="6" id="masalah" style="width:100%;"></textarea><label for="pic">PIC</label>
            <textarea id="pic" v-model="pic" placeholder="Name PIC" style="width:100%;"></textarea>

            <label for="status">Status done?</label>
            <input type="checkbox" v-model="status" />

            <Button primary :value=" id ? 'Update' : 'Tambah' " class="w3-right" type="button" @trig="send"/>
        </div>
    </div>
</template>

<script lang="ts" setup>
import datepicker from "vue3-datepicker"
import Select from "@/components/elements/Select.vue"
import Button from "@/components/elements/Button.vue"
import { ymdTime } from "@/composable/piece/dateFormat"
import { getSupervisorId } from "@/pages/Supervisors/Supervisors"
import { Cases, type CaseUpdate, type CaseImport, type Case } from "@/pages/Cases/Cases"
import SelectSupervisors from "@/pages/Supervisors/SelectSupervisors.vue"
import SelectHead from "@/pages/Headspv/SelectHead.vue"
import { useStore } from "vuex";
import { ref } from "vue"

const store = useStore();

const { addCase, updateCase, getCaseById, getCaseImportById, updateCaseImport } = Cases();

    const baseCase  = ref(<CaseImport>{})
    const caseInserted = ref(<Case>{});
    const periodeModel = ref(new Date())
    const dlModel = ref(new Date());
    const changed = ref(<CaseUpdate>{})

    async function picName(name: string) {
        pic.value = await getSupervisorId(name).then((res) => res?.name)
        id.value ? changed.value.pic = pic.value : false
    }

    async function send() {
        if(id.value) {

            await updateCase(id.value, changed.value)

        } else {

            await addCase(periode.value, head.value, dl.value, ymdTime(), masalah.value, name.value, parent.value, pic.value, solusi.value, status.value, sumberMasalah.value)
            await updateCaseImport(parent.value, { inserted: true })

        }

        store.commit("Modal/tunnelMessage", true)
        store.commit("Modal/active")
    }

    watch: {
        periodeModel(newVal, oldVal) {
            this.periode = ymdTime(newVal)
            this.dlModel = newVal
            this.id ? this.changed['periode'] = newVal : false
        },
        dlModel(newVal, oldVal) {
            this.dl = ymdTime(newVal)
            this.id ? this.changed['dl'] = newVal : false
        },
        name(newVal) {
            this.id ? this.changed['name'] = newVal : false
        },
        head(newVal) {
            this.id ? this.changed['head'] = newVal : false
        },
        masalah(newVal) {
            this.id ? this.changed['masalah'] = newVal : false
        },
        sumberMasalah(newVal) {
            this.id ? this.changed['sumberMasalah'] = newVal : false
        },
        solusi(newVal) {
            this.id ? this.changed['solusi'] = newVal : false
        },
        status(newVal) {
            this.id ? this.changed['status'] = newVal : false
        },
    },
    async created() {
        let obj = store.getters["Modal/obj"].obj
        
        let getCase = await getCaseById(obj?.id)
        if(typeof getCase === 'undefined') return;
        // get the base record
        let base = await getCaseImportById(getCase?.parent)
        if(typeof base === 'undefined') return;

        if(obj?.edit) {

            this.baseCase = Object.keys(base).join('-');
            // let keyOfBase = 
            // let addBreakTag = keyOfBase.map((val) => `${val}:<br> ${base[val]}`)
            // .map((val) => `${val}:<br> ${base[val]}`).join(`<hr/>`)

            this.parent = getCase?.parent
            this.periodeModel = new Date(getCase?.periode)
            this.name = getCase?.name
            this.head = getCase?.head
            this.masalah = getCase?.masalah
            this.sumberMasalah = getCase?.sumberMasalah
            this.solusi = getCase?.solusi
            this.pic = getCase?.pic
            this.dlModel = new Date(getCase?.dl)
            this.status = getCase?.status
            setTimeout(() => {
                this.id = obj?.id
            })

        } else {

            this.periodeModel = new Date()
            this.dlModel = new Date()
            this.parent = obj?.parent

        }
        
    },
}
</script>