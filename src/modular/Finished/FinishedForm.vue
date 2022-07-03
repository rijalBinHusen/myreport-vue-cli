<template>
    <div class="w3-row">
        <!-- Periode laporan -->
        <div class="w3-col s3 w3-padding-small" v-for="dat in dataToShow" :key="dat.title">
            <Input :label="dat.title+':'" 
                :placeholder="dat.title" 
                class="w3-margin-bottom" 
                :value="more?.[dat.valueFrom]"
                @change="more[dat.valueFrom] = $event.target.value"
                :disabled="!edit || !dat?.editable"
                type="text"
            />
        </div>
        <Button primary :value="edit ?  'Update' : 'Edit'" class="w3-right" type="button" @trig="editButtonHandle"/>
    </div>
</template>

<script>

import Input from "../../components/elements/Input.vue"
import Button from "../../components/elements/Button.vue"

export default {
    methods: {
        editButtonHandle() {
            if(!this.edit) {
                this.edit = true
                return
            }
            this.$store.dispatch("Document/handleDocument",
                { action: "finished", val: this.more, rec: this.more?.id }
            )
            this.$store.commit("Modal/active");
        }
    },
    data() {
        return {
            more: "",
            edit: false,
            dataToShow: [
                { title: "Periode", valueFrom: "periode2", editable: false },
                { title: "Supervisor Name", valueFrom: "spvName", editable: false },
                { title: "Gudang", valueFrom: "warehouseName", editable: false },
                { title: "Shift", valueFrom: "shift", editable: false  },
                { title: "Total DO", valueFrom: "totalDo", editable: true},
                { title: "Total Kendaraan", valueFrom: "totalKendaraan", editable: true},
                { title: "Total Waktu", valueFrom: "totalWaktu", editable: true},
                { title: "Total item moving", valueFrom: "totalItemMoving", editable: true},
                { title: "Total product in", valueFrom: "totalQTYIn", editable: true},
                { title: "Total output", valueFrom: "totalQTYOut", editable: true},
                { title: "Total Not FIFO", valueFrom: "totalProductNotFIFO", editable: true},
                { title: "Total item variance", valueFrom: "itemVariance", editable: true}
            ],
        }
    },
    mounted() {
        this.more = this.$store.getters["Modal/obj"]?.data
    },
    components: {
        Input, Button,
    },
    name: "FinishedForm",
}
</script>