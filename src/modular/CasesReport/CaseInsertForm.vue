<template>
    <div class="w3-row">
        <div class="w3-col s6" v-html="baseData" style="overflow: auto; height: 400px;">
        
        </div>
    </div>
</template>

<script>
export default {
    // Tanggal, Masalah, Sumber Masalah, Solusi dan Tindakan, PIC, D/L, Status
    name: "CaseInsertForm",
    data() {
        return {
            baseData: "",
        }
    },
    methods: {},
    mounted() {
        let obj = this.$store.getters["Modal/obj"].obj
        this.baseData = Object.keys(obj).map((val) => `${val}:<br> ${obj[val]}`).join(`<hr/>`)
        console.log(this.baseData)
    },
}
</script>