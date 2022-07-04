<template>
    <div>
        <label class="w3-margin-top">Nama file</label>
        <input type="text" class="w3-input w3-margin-top w3-margin-bottom" :value="importTemp?.fileName" disabled />
        <p>Select sheet to import</p>
        <div class="w3-col s3" v-for="sheet in importTemp.sheets" :key="sheet">
            <input type="checkbox" class="w3-margin-right" :id="sheet" v-model="sheetsSelected" :value="sheet" />
             <label :for="sheet">{{ sheet }}</label>
        </div>
    </div>
</template>

<script>
import Select from "../../components/elements/Select.vue"
import Button from "../../components/elements/Button.vue"

export default {
    components: {
        Select,
        Button,
    },
    data() {
        return {
            sheetsSelected: [],
            importTemp: "",
        }
    },
    methods: {},
    computed: {},
    created() {
        this.importTemp = this.$store.getters["Modal/obj"]?.obj
        console.log(this.importTemp)
    }
}
</script>