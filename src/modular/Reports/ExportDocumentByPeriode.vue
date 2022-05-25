<template>
    <div class="w3-container">
        <br /> <br />
        <div>
            <label class="w3-margin-top">Dari tanggal</label>
            <datepicker class="w3-margin-top w3-border w3-input" :upperLimit="periode2" v-model="periode1"></datepicker>

            <label class="w3-margin-top">Sampai tanggal</label>
            <datepicker class="w3-margin-top w3-border w3-input" :lowerLimit="periode1" v-model="periode2"></datepicker>
        </div>
        <Button primary @trig="startExport" value="Export" class="w3-margin-top" type="button" />
    </div>
</template>

<script>
import Input from "../../components/elements/Input.vue"
import datepicker from "vue3-datepicker"
import Button from "../../components/elements/Button.vue"
import exportToXls from '../../exportToXls'

export default {
    name: "CollectedForm",
    data() {
        return {
            periode1: new Date(),
            periode2: new Date(),
            name: "",
        }
    },
    methods: {
        startExport() {
            let judul = `Pengumpulan dokumen periode ${this.$store.getters["dateFormat"]({format: "ymdexcel", time: this.periode1})} sampai dengan ${this.$store.getters["dateFormat"]({format: "ymdexcel", time: this.periode2})}`
            // bring up the loader
            this.$store.commit("Modal/active", {judul: "", form: "Loader", periode: [this.periode1, this.periode2]});
            // jika yang diminta nama dan periode
                let dateCheck = this.periode1 === this.periode2 
                                    ? [this.periode1] 
                                    : this.$store.getters["getDaysArray"](this.periode1, this.periode2)
            // cari data, tunggu sampai selesai
            this.$store.dispatch("findDataByDateArrays", { store: "Document", date: dateCheck, criteria: {} }).then(() => {
                // kalau sudah selesaai panggil dari getters
                // masukkan fungsi export to xls
                exportToXls(this.$store.getters["Document/exportData"], judul)
                
                //tutup modal
                this.$store.commit("Modal/active")
            })
        }
    },
    components: {
        Input,
        datepicker,
        Button,
    }
}
</script>