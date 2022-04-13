<template>
<div class="">
    <div class="w3-border w3-padding w3-container">
        <label>Set record to show : </label>
        <Button primary value="Set" type="button" @trig="collectedForm" />
    </div>

            <!-- <Datatable
            :datanya="collected"
            :heads="['Nama', 'Gudang', 'Periode', 'Collected']"
            :keys="['spvName', 'spvWarehouse', 'periode2', 'collected2']"
            option
            id="tableCollected"
            v-slot:default="slotProp"
            >

            <div v-if="!slotProp.prop.shared">
				<Button value="Batal" type="button" danger small @trig="unCollect(slotProp.prop.id)" />
                <Button value="Edit" type="button" secondary small @trig="edit(slotProp.prop.id)" />
                <Button value="Share" primary type="button" small @trig="share(slotProp.prop.id)" />
            </div>
            <div v-else>
                Shared at {{ this.$store.getters["dateFormat"]({format: "dateMonth", time: slotProp.prop.shared }) }}
            </div>
            </Datatable>
			</table> -->
			
        </div>
</template>

<script>
import Input from "../elements/Input.vue"
import Button from "../elements/Button.vue"
import Datatable from "../parts/Datatable.vue"
import datepicker from "vue3-datepicker"
import { mapGetters } from "vuex"

export default {
    name: "Collect",
    data() {
        return {};
    },
    components: {
        Input,
        Button,
        Datatable,
        datepicker,
    },
    methods: {},
    computed: {},
}
</script>