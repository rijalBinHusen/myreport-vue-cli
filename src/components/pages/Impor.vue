<template>
    <h1 class="w3-center">Export / Import data</h1>
    <!-- <Button primary value="Export" type="button" @trig="expor" /> -->
    <Exporter />
    <Importer />
</template>

<script>
import Exporter from "../parts/Exporter.vue"
import Importer from "../parts/Importer.vue"

export default {
    name: "Impor",
    components: {
        Exporter,
        Importer,
    },
    methods: {}
}
</script>