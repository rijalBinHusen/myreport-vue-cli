<template>
    <div class="w3-row">
        <!-- Periode laporan -->
        <div class="w3-col s3 w3-padding-small" v-for="dat in dataToShow" :key="dat.title">
            <Input :label="dat.title+':'" 
                :placeholder="dat.title" 
                class="w3-margin-bottom" 
                :value="more[dat.valueFrom]" 
                disabled 
                type="text"
            />
        </div>
    </div>
</template>

<script>

import Input from "../../components/elements/Input.vue"

export default {
    methods: {
    },
    data() {
        return {
            more: "",
            dataToShow: [
                { title: "Periode", valueFrom: "periode2" },
                { title: "Supervisor Name", valueFrom: "spvName"},
                { title: "Gudang", valueFrom: "warehouseName"},
                { title: "Shift", valueFrom: "shift" },
                { title: "Total DO", valueFrom: "totalDO"},
                { title: "Total Kendaraan", valueFrom: "totalKendaraan"},
                { title: "Total Waktu", valueFrom: "totalWaktu"},
                { title: "Total output", valueFrom: "standartWaktu"},
            ],
        }
    },
    mounted() {
        this.more = this.$store.getters["Modal/obj"]?.data
    },
    components: {
        Input,
    },
    name: "FinishedForm",
}
</script>