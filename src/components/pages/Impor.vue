<template>
    <h1 class="w3-center">Export / Import data</h1>
    <!-- <Button primary value="Export" type="button" @trig="expor" /> -->
    <Exporter />
    <p></p>
    <Importer />
    <p></p>
    <ImporReport1 />
</template>

<script>
import Exporter from "../parts/Exporter.vue"
import Importer from "../parts/Importer.vue"
import ImporReport1 from "../parts/ImporReport1"

export default {
    name: "Impor",
    components: {
        Exporter,
        Importer,
        ImporReport1
    },
    methods: {}
}
</script>