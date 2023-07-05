<template>
    <div>
        <label class="w3-margin-top">Dari tanggal</label>
        <datepicker class="w3-margin-top w3-border w3-input" :upperLimit="periode2" v-model="periode1"></datepicker>

        <label class="w3-margin-top">Sampai tanggal</label>
        <datepicker class="w3-margin-top w3-border w3-input" :lowerLimit="periode1" v-model="periode2"></datepicker>
        <br>
        <label class="w3-margin-top">Pilih report</label>
        <Select 
            :options="[
                {id: 1, name: 'Clock'},
                {id: 2, name: 'Stock'},
            ]" 
            value="id"
            text="name"
            @selected="supervisor.warehouse = $event"
        />
        <Button primary value="Show"  class="w3-margin-top" type="button" @trig="show" />
    </div>
</template>

<script>

import Select from "../../components/elements/Select.vue"
import Input from "../../components/elements/Input.vue"
import datepicker from "vue3-datepicker"
import Button from "../../components/elements/Button.vue"

export default {
    name: "CollectedForm",
    data() {
        return {
            periode1: new Date(),
            periode2: new Date(),
        }
    },
    methods: {
        async show() {
            // bring up the loader
            this.$store.commit("Modal/active", {judul: "", form: "Loader"});
            // jika yang diminta total qty
            if(this.total) {
                this.$store.dispatch("getData", {  store: "Collected", 'limit': Number(this.total), })
                
            }
            // jika yang diminta nama dan periode
            else if(this.name && this.periode2) {
                let dateCheck = this.periode1 === this.periode2 
                                    ? [this.periode1] 
                                    : this.$store.getters["getDaysArray"](this.periode1, this.periode2)
                let objToSend = {
                        store: "Collected", 
                        date: dateCheck
                    }
                if(this.name !== 'semua') {
                    if(this.name === "unshared") {
                        objToSend.criteria = { shared: false}
                    } else {
                        objToSend.criteria = { name: this.name }
                    }
                } 
                    await this.$store.dispatch("findDataByDateArrays", objToSend)
            }
            this.$store.commit("Modal/active")
        }
    },
    components: {
        Input,
        datepicker,
        Select,
        Button,
    },
    computed: {
        names() {
            // ambil semua nama dari state
            let options = Array.from(this.$store.state.Supervisors.lists)
            // tambahkan option lain
            options.unshift({id: "semua", name: "Semua SPV" })
            options.unshift({id: "", name: "Pilih nama" })
            options.push({id: "unshared", name: "Cari periode yang belu dishare"})
            // kembalikan agar tidak reactive
            return JSON.parse(JSON.stringify(options))
        }
    }
}
</script>