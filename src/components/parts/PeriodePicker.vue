<template>
<div class="w3-container">
        <br /> <br />
        <div>
            <label class="w3-margin-top">Dari tanggal</label>
            <datepicker class="w3-margin-top w3-border w3-input" :upperLimit="periode2" v-model="periode1"></datepicker>

            <label class="w3-margin-top">Sampai tanggal</label>
            <datepicker class="w3-margin-top w3-border w3-input" :lowerLimit="periode1" v-model="periode2"></datepicker>
        </div>
        <Button primary @trig="send" :value="obj.btnValue" class="w3-margin-top" type="button" />
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
            obj: {},
        }
    },
    methods: {
        async send() {
            // get name of store from the modal state, that set when user hit the button to launch this periode picker
            // let store = this.obj.store
            // open the modal with loader
            this.$store.commit("Modal/active", {judul: "", form: "Loader", periode: [this.periode1, this.periode2], mode: "PeriodePicker"});
            // search dokumen in the database
            let dateCheck = this.periode1 === this.periode2 
                    ? [this.periode1] 
                    : this.$store.getters["getDaysArray"](this.periode1, this.periode2)
            // cari data, tunggu sampai selesai
            if(Array.isArray(this.obj?.store)) { 
                for(let store of this.obj.store) {
                    await this.$store.dispatch("findDataByDateArrays", { 
                        store: store?.storeName, 
                        date: dateCheck, 
                        criteria: store?.criteria ? store?.criteria : {} 
                     })
                }
            } else {
                await this.$store.dispatch("findDataByDateArrays", { 
                    store: this.obj.store, 
                    date: dateCheck, 
                    criteria: this.obj.criteria ? this.obj.criteria : {} 
                })
            }
                
            this.$store.commit("Modal/active")
        },
    },
    mounted() {
        this.obj = this.$store.getters["Modal/obj"]
    }
}
</script>