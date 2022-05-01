<template>
    <div 
        style="width:250px; height:100%;" 
        class="w3-border w3-margin-top w3-padding"
    >
    <div class="w3-row">
        <h3 class="w3-left">Set periode</h3>
        <Button class="w3-right" :nomargin="true" value="&times;" type="button" @trig="$emit('exit')"/>
    </div>
        <br />
        <label style="font-weight:bold;" class="w3-margin-top">Start from date : </label>
        <Datepicker class="w3-input w3-margin-bottom" v-model="periode1" />
        <br />
        <br />
        <label style="font-weight:bold;" class="w3-margin-top">To date : </label>
        <Datepicker typeable class="w3-margin-bottom w3-input" v-model="periode2" />
        <br />
        <br />
        <Button primary class="w3-margin-top w3-input" value="Show" type="button" @trig="show" />
    </div>
</template>

<script>
import Datepicker from "vue3-datepicker"
import Button from "../elements/Button.vue"

export default {
    components: {
        Datepicker,
        Button
    },
    data() {
        return {
            periode1: new Date(),
            periode2: new Date(),
        }
    },
    emits: ["show", "exit"],
    methods: {
        show() {
            this.$emit("show", [this.periode1, this.periode2])
        },
    }
}
</script>