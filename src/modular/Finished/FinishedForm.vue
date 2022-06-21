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
        <!-- End of periode laporan -->

        <!-- Nama supervisor -->
        <!-- <div class="w3-col s3 w3-padding">
            <Input label="Supervisor name:" 
                placeholder="Periode" 
                class="w3-margin-bottom" 
                :value="more?.spvName" 
                disabled 
                type="text"
            />
        </div> -->
        <!-- End of nama supervisor -->
        <!-- Date collected -->
        <!-- <div class="w3-col s3 w3-padding">
            <Input label="Collected:" 
                placeholder="Periode" 
                class="w3-margin-bottom" 
                :value="$store.getters['dateFormat']({format: 'dateMonth', time: more?.collected})"
                disabled 
                type="text"
            />
        </div> -->
        <!-- End of date collected -->
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
                { title: "Standart waktu", valueFrom: "standartWaktu"},
            ],
        }
    },
    mounted() {
        this.more = this.$store.getters["Modal/obj"]?.data
        console.log(this.more)

    },
    components: {
        Input,
    },
    name: "FinishedForm",
}
</script>