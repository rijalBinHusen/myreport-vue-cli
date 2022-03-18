<template>
    <div>
        <Input type="text" label="Search by name" placeholder="Input name" />
        <label class="w3-margin-top">Set periode</label>
        <datepicker class="w3-margin-top w3-border w3-input" v-model="periode"></datepicker>
    </div>
</template>

<script>

import Input from "../elements/Input.vue"
import datepicker from "vue3-datepicker"

export default {
    name: "CollectedForm",
    data() {
        return {
            periode: new Date()
        }
    },
    components: {
        Input,
        datepicker,
    }
}
</script>