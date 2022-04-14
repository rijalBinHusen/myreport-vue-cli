<template>
    <div>
        <label class="w3-margin-top">Nama file</label>
        <input type="text" class="w3-input w3-margin-top w3-margin-bottom" :value="datanya.fileName" disabled />
        <label class="w3-margin-top">Clock Sheet</label>
        <Select 
            :options="datanya.sheetNames" 
            value="id"
            text="title"
        />
        <label class="w3-margin-top">Stock Sheet</label>
        <Select 
            :options="datanya.sheetNames" 
            value="id"
            text="title"
        />
    </div>
</template>

<script>
import Select from "../elements/Select.vue"

export default {
    components: {
        Select,
    },
    methods: {},
    computed: {
        datanya() {
            return  JSON.parse(JSON.stringify(this.$store.state.BaseReportFile.importTemp))
        }
    },
}
</script>