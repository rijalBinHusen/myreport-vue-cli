<template>
    <h1 class="w3-center">Export / Import data</h1>
    <!-- <Button primary value="Export" type="button" @trig="expor" /> -->
    <p></p>
    <Importer />
    <p></p>
    <Button primary value="Import base totalan" type="button" @trig="imporModal" />
</template>

<script>
import Importer from "../parts/Importer.vue"
import Button from "../elements/Button.vue"
// import ImporReport1 from "../parts/ImporReport1"

export default {
    name: "Impor",
    components: {
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