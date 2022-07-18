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
            <textarea v-model="caseInput.masalah" rows="6" id="masalah" style="width:100%;"></textarea>
            
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

            <label for="pic">PIC</label>
            <textarea id="pic" v-model="caseInput.pic" placeholder="Name PIC" style="width:100%;"></textarea>

            <label for="status">Status done?</label>
            <input type="checkbox" v-model="caseInput.status" />

            <Button primary v-if="caseInput.id" value="Update" class="w3-right" type="button" @trig="updateCase"/>
            <Button primary v-else value="Submit" class="w3-right" type="button" @trig="appendCase"/>
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
        },
        updateCase() {
            this.$store.dispatch("update",
                { 
                    store: "Cases", 
                    obj: { ...this.caseInput }, 
                    criteria: { id: this.caseInput.id }
                }
            )
            this.$store.commit("Modal/active")
        }
    },
    watch: {
        periodeModel(newVal, oldVal) {
            this.caseInput.periode = this.$store.getters["dateFormat"]({format: "ymdTime", time: newVal})
            this.dlModel = newVal
        },
        dlModel(newVal, oldVal) {
            this.caseInput.dl = this.$store.getters["dateFormat"]({format: "ymdTime", time: newVal})
        },
    },
    created() {
        let obj = this.$store.getters["Modal/obj"].obj
        if(obj?.edit) {
            // delete unneeded keys
            const {
                periode2,
                spvName,
                headName,
                edit,
                ...details
            } = obj;
            // put to the caseinput
            this.caseInput = details
            this.periodeModel = new Date(obj?.periode)
            this.dlModel = new Date(obj?.dl)
            // get the parent record
            let base = this.$store.getters["Cases/caseId"](obj.parent)
            // show to the left view editor
            this.baseData = Object.keys(base).map((val) => `${val}:<br> ${base[val]}`).join(`<hr/>`)
            return
        }
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