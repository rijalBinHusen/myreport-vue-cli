<template>
<div class="w3-container">
        <br /> <br />
            <SelectWarehouseVue @selectedWarehouse="warehouse = $event" />
            <label for="item" class="w3-margin-top">Item</label>
            <InputItemVue id="item" class="w3-select w3-round-large" @chose="item = $event" />
            <Button primary @trig="send" value="Selanjutnya" class="w3-margin-top" type="button" />
    </div>
</template>

<script>
import SelectWarehouseVue from "./SelectWarehouse.vue"
import InputItemVue from "@/pages/Base/InputItem.vue"
import Button from "../elements/Button.vue"

export default {
    components: {
        SelectWarehouseVue,
        InputItemVue,
        Button
    },
    data() {
        return {
            warehouse: '',
            item: '',
        }
    },
    methods: {
        async send() {
            // if we only need the date
            if(this.warehouse && this.item) {
                this.$store.commit('Modal/tunnelMessage', { item: this.item, warehouse: this.warehouse})
                this.$store.commit("Modal/active")
            }
        },
    },
}
</script>