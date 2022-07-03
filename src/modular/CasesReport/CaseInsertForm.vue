<template>
    <div class="w3-row">
        <div class="w3-col s6 w3-padding-large" v-html="baseData" style="overflow: auto; height: 400px;">
        </div>
        <div class="w3-col s6 w3-padding-large" style="overflow: auto; height: 400px;">
            <!-- Periode -->
            <label for="periode">Periode:</label>
            <datepicker id="periode" class="w3-margin-bottom w3-border w3-input" v-model="periodeModel"></datepicker>

            <label for="dl">Dead line:</label>
            <datepicker id="dl" class="w3-margin-bottom w3-border w3-input" v-model="dlModel"></datepicker>
            <!-- Masalah -->
            <label for="masalah">Masalah: </label><br>
            <textarea v-model="caseInput.masalah" id="masalah" style="width:100%; height:60px;"></textarea>
            <!-- Supervisor -->
            <label for="name">Supervisor:</label>
            <Select 
                id="name"
                :options="$store.state.Supervisors.lists" 
                judul="Supervisor"
                value="id"
                text="name"
                @selected="caseInput.name = $event"
                :inselect="caseInput.name"
            />
            <label for="head">Kabag:</label>
            <Select 
                id="head"
                :options="$store.state.Headspv.lists" 
                judul="Kabag"
                value="id"
                text="name"
                @selected="caseInput.head = $event"
                :inselect="caseInput.head"
            />

            <label for="sumberMasalah">Sumber masalah: </label><br>
            <textarea v-model="caseInput.sumberMasalah" id="sumberMasalah" style="width:100%; height:60px;"></textarea>

            <label for="solusi">solusi: </label><br>
            <textarea v-model="caseInput.solusi" id="solusi" style="width:100%; height:60px;"></textarea>

            <label for="status">Status done?</label>
            <input type="checkbox" v-model="caseInput.status" />

            <Button primary value="Submit" class="w3-right" type="button" @trig="appendCase"/>
        </div>
    </div>
</template>

<script>
import datepicker from "vue3-datepicker"
import Select from "../../components/elements/Select.vue"
import Button from "../../components/elements/Button.vue"

export default {
    // Tanggal[v], Masalah[v], Sumber Masalah, Solusi dan Tindakan, PIC, D/L, Status
    name: "CaseInsertForm",
    data() {
        return {
            baseData: "",
            periodeModel: "",
            dlModel: "",
            caseInput: {
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
                insert: true,
            }
        }
    },
    methods: {
        appendCase() {
            this.$store.dispatch("Cases/append", { ...this.caseInput })
            this.$store.commit("Modal/active")
        }
    },
    watch: {
        periodeModel(newVal, oldVal) {
            this.caseInput.periode = this.$store.getters["dateFormat"]({format: "ymdTime", time: newVal})
        },
        dlModel(newVal, oldVal) {
            this.caseInput.dl = this.$store.getters["dateFormat"]({format: "ymdTime", time: newVal})
        },
    },
    created() {
        let obj = this.$store.getters["Modal/obj"].obj
        this.caseInput.parent = obj?.id
        this.baseData = Object.keys(obj).map((val) => `${val}:<br> ${obj[val]}`).join(`<hr/>`)
        this.periodeModel = new Date()
        this.dlModel = new Date()
        
    },
    components: {
        datepicker, Select, Button
    },
}
</script>