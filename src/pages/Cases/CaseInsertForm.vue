<template>
    <div class="w3-row">
        <div class="w3-col s6 w3-padding-large" v-html="baseData" style="overflow: auto; height: 400px;">
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

<script>
import datepicker from "vue3-datepicker"
import Select from "@/components/elements/Select.vue"
import Button from "@/components/elements/Button.vue"
import { ymdTime } from "@/composable/piece/dateFormat"
import { getSupervisorId } from "@/pages/Supervisors/Supervisors"
import { addCase, updateCase, getCaseId } from "@/pages/Cases/Cases"
import SelectSupervisors from "@/components/parts/SelectSupervisors.vue"
import SelectHead from "@/components/parts/SelectHead.vue"

export default {
    components: {
        datepicker, Select, Button, SelectSupervisors, SelectHead
    },
    data() {
        return {
            baseData: "",
            periodeModel: "",
            dlModel: "",
            parent: "",
            periode: "",
            name: "",
            head: "",
            masalah: "",
            sumberMasalah: "",
            solusi: "",
            pic: "",
            dl: "",
            status: false,
            changed: {},
            id: null,
        }
    },
    methods: {
        async picName(name) {
            this.pic = await getSupervisorId(name).then((res) => res?.name)
            this.id ? this.changed['pic'] = this.pic : false
        },
        async send() {
            if(this.id) {
                await updateCase(this.id, this.changed)
            } else {
                await addCase(this.periode, this.head, this.dl, ymdTime(), this.masalah, this.name, this.parent, this.pic, this.solusi, this.status, this.sumberMasalah)
                await updateCase(this.parent, { inserted: true })
            }
            this.$store.commit("Modal/tunnelMessage", true)
            this.$store.commit("Modal/active")
        }
    },
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
    created() {
        let obj = this.$store.getters["Modal/obj"].obj
        let getCase = getCaseId(obj?.id)
        // get the base record
        let base = getCaseId(obj?.parent || getCase?.parent)
        
        if(obj?.edit) {
            let getCase = getCaseId(obj.id)
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
        this.baseData = Object.keys(base).map((val) => `${val}:<br> ${base[val]}`).join(`<hr/>`)
        
    },
}
</script>@/pages/Cases/Cases