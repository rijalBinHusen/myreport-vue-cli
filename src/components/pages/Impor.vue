<template>
    <h1 class="w3-center">Export / Import data</h1>
    <!-- <Button primary value="Export" type="button" @trig="expor" /> -->
    <Exporter />
    <p></p>
    <Importer />
    <p></p>
    <Button primary value="Import base totalan" type="button" @trig="imporModal" />
</template>

<script>
import Exporter from "../parts/Exporter.vue"
import Importer from "../parts/Importer.vue"
import Button from "../elements/Button.vue"
// import ImporReport1 from "../parts/ImporReport1"

export default {
    name: "Impor",
    components: {
        Exporter,
        Importer,
        Button,
    },
    methods: {
        imporModal() {
            this.$store.commit("Modal/active", {judul: "Setup import data", form: "ImporReport1Form"});
        }
    }
}
</script>