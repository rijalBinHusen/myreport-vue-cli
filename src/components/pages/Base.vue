<template>
    <div class="w3-margin-top w3-container">
        <Button 
                class="w3-right" 
                primary 
                :value="status ? 'Clock' : 'Stock'" 
                type="button" 
                @trig="status = !status" 
            />
        <Datatable
          :datanya="status ? clock : stock"
          :heads="status ? ['Shift', 'Nomor DO', 'Register', 'Start', 'Finish'] : ['Shift', 'Item', 'Awal', 'In', 'Out']"
          :keys="status ? ['shift', 'noDo', 'reg', 'start', 'finish'] : ['shift', 'item', 'awal', 'in', 'out']"
          id="tableBaseReport"
        />
    </div>
</template>

<script>
import Button from "../elements/Button.vue"
import Datatable from "../parts/Datatable.vue"
import { mapState } from "vuex"
export default {
    components: {
        Button,
        Datatable,
    },
    data() {
        return {
            status: true
        }
    },
    methods: {},
    computed: {
        ...mapState({
            clock: state => JSON.parse(JSON.stringify(state.BaseReportClock.lists)),
            stock: state => JSON.parse(JSON.stringify(state.BaseReportStock.lists)),
        }),
    },
    created() {
        console.log(this.clock, this.stock)
    },
    name: "Base"
}
</script>