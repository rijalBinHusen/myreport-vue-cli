<template>
<div>
    <div class="w3-row">  
        <label for="periode">Periode:</label>
        <datepicker id="periode" class="w3-margin-bottom w3-border w3-input" v-model="periodeModel"></datepicker>
        <div class="w3-col s3">
            <label for="name">Supervisor:</label>
            <Select 
                id="name"
                :options="$store.getters['Supervisors/enabled']" 
                judul="Supervisor"
                value="id"
                text="name"
                @selected="name = $event"
            />
        </div>
        
        <div class="w3-col s3" style="padding: 0 16px 0 16px;">
            <label for="head">Kabag:</label>
            <Select 
                id="head"
                judul="kabag"
                :options="$store.state.Headspv.lists" 
                value="id"
                text="name"
                @selected="head = $event"
            />
        </div>

        <div class="w3-col s3" style="padding: 0 16px 0 16px;">
            <label for="shift">Shift:</label>
            <Select 
                id="shift"
                judul="shift"
                :options="[
                    { id:1, title: 'Shift 1'},
                    { id:2, title: 'Shift 2'},
                    { id:3, title: 'Shift 3'},
                ]" 
                value="id"
                text="title"
                @selected="shift = $event"
            />
        </div>

        <div class="w3-col s3">
            <label for="warehouse">Gudang:</label>
            <Select 
                id="warehouse"
                judul="gudang"
                :options="$store.state.Warehouses.lists" 
                value="id"
                text="name"
                @selected="warehouse = $event"
            />
        </div>
    </div>
    <Button primary value="Submit" class="w3-right" type="button" @trig="send"/>
</div>
</template>


<script>

import Select from "../../components/elements/Select.vue"
import Input from "../../components/elements/Input.vue"
import Button from "../../components/elements/Button.vue"
import Datepicker from "vue3-datepicker"
import { addData } from "@/composable/components/DocumentsPeriod"


export default {
    data() {
        return {
            name: "",
            periodeModel: new Date(),
            shift: "",
            head: "",
            warehouse: "",
            periodeTime: "",
        }
    },
    methods: {
        async send() {
            // console.log("simpan")
            await addData(this.name, this.periodeTime, this.shift, this.head, this.warehouse)
            this.$store.commit('Modal/tunnelMessage', true)
            this.$store.commit("Modal/active")
        }

    },    
    watch: {
        periodeModel(newVal) {
            this.periodeTime = this.$store.getters["dateFormat"]({format: "ymdTime", time: newVal})
        }
    },
    components: {
        Input, Select, Button, Datepicker
    },
}
</script>