<template>
<div class="w3-container">
        <br /> <br />
        <div>
            <label class="w3-margin-top">Dari tanggal</label>
            <datepicker class="w3-margin-top w3-border w3-input" :upperLimit="periode2" v-model="periode1"></datepicker>

            <label class="w3-margin-top">Sampai tanggal</label>
            <datepicker class="w3-margin-top w3-border w3-input" :lowerLimit="periode1" v-model="periode2"></datepicker>
        </div>
        <Button primary @trig="send" :value="btnValue" class="w3-margin-top" type="button" />
    </div>
</template>

<script>
import Datepicker from "vue3-datepicker"
import Button from "../elements/Button.vue"

export default {
    components: {
        Datepicker,
        Button
    },
    data() {
        return {
            periode1: new Date(),
            periode2: new Date(),
        }
    },
    methods: {
        send() {
            // get name of store from the modal state, that set when user hit the button to launch this periode picker
            let store = this.$store.getters["Modal/obj"].store
            // open the modal with loader
            this.$store.commit("Modal/active", {judul: "", form: "Loader", periode: [this.periode1, this.periode2]});
            // search dokumen in the database
            let dateCheck = this.periode1 === this.periode2 
                    ? [this.periode1] 
                    : this.$store.getters["getDaysArray"](this.periode1, this.periode2)
            // cari data, tunggu sampai selesai
            this.$store.dispatch("findDataByDateArrays", { store: store, date: dateCheck, criteria: {} }).then(() => {
                //tutup modal
                this.$store.commit("Modal/active")
            })
        },
    },
    computed: {
        btnValue() {
            return this.$store.state.Modal.more.btnValue
        }
    }
}
</script>