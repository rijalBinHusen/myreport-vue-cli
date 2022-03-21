<template>
    <div>
        <div v-if="!name" >
            <label>Tampilkan record</label>
            <Select 
            :options="totalQty" 
            value="id"
            text="name"
            @selected="total = $event"
            />
        </div>
        <div v-if="!total" >
            <label>Masukkan nama</label>
            <Select 
            :options="names" 
            value="id"
            text="name"
            v-if="!Number(total)"
            @selected="name = $event"
            />

            <label class="w3-margin-top">Dari tanggal</label>
            <datepicker class="w3-margin-top w3-border w3-input" v-model="periode1"></datepicker>

            <label class="w3-margin-top">Sampai tanggal</label>
            <datepicker class="w3-margin-top w3-border w3-input" v-model="periode2"></datepicker>
        </div>
        <Button v-if="total || name" primary value="Show"  class="w3-margin-top" type="button" @trig="show" />
    </div>
</template>

<script>

import Select from "../elements/Select.vue"
import Input from "../elements/Input.vue"
import datepicker from "vue3-datepicker"
import Button from "../elements/Button.vue"

export default {
    name: "CollectedForm",
    data() {
        return {
            totalQty: [
                {id: "", name: "Tampilkan total record"},
                {id: 15, name: "15 Record"},
                {id: 30, name: "30 Record"},
                {id: 50, name: "50 Record"},
                {id: 70, name: "70 Record"},
                {id: 100, name: "100 Record"},
            ],
            total: 0,
            periode1: new Date(),
            periode2: new Date(),
            name: 0,
        }
    },
    methods: {
        show() {
            // jika yang diminta total qty
            if(this.total) {
                this.$store.dispatch("getData", {  store: "Collected", 'limit': Number(this.total), })
            }

            // jika yang diminta nama dan periode
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
            let options = Array.from(this.$store.state.Name.lists)
            // tambahkan option lain
            options.unshift({id: "semua", name: "Semua SPV" })
            options.unshift({id: "", name: "Pilih nama" })
            // kembalikan agar tidak reactive
            return JSON.parse(JSON.stringify(options))
        }
    }
}
</script>