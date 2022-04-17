<template>
    <div class="w3-margin-top w3-container">
    <Button 
        v-if="!periode"
        class="w3-left" 
        primary 
        value="Set periode" 
        type="button" 
        @trig="periode = true" 
    />
    <PeriodePicker v-else @show="showData($event)" />
    </div>
</template>

<script>
import Button from "../../components/elements/Button.vue"
import Datatable from "../../components/parts/Datatable.vue"
import PeriodePicker from "../../components/parts/PeriodePicker.vue"
import Datepicker from "vue3-datepicker"
import { mapState } from "vuex"

export default {
    components: {
        Button,
        Datatable,
        Datepicker,
        PeriodePicker,
    },
    data() {
        return {
            periode: false, 
        }
    },
    methods: {
        showData(ev) {
            this.periode = false
            console.log(ev)
        },
    },
    computed: {
        ...mapState({

        }),
    },
    name: "Base"
}
</script>