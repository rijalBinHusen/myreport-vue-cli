<template>
<div class="">
    <div class="w3-border w3-margin-top w3-row w3-padding w3-container">
        <label style="font-weight:bold;" class="w3-col s2 w3-margin-top">Set from date : </label>
        <Datepicker class="w3-col w3-input s2" v-model="periode1" />
        <label style="font-weight:bold;" class="w3-margin-left w3-col s1 w3-margin-top">To date : </label>
        <Datepicker class="w3-col w3-input s2" v-model="periode2" />
        <Button primary class="w3-margin-left" value="Show" type="button" @trig="show" />
    </div>

            <Datatable
            :datanya="lists"
            :heads="['Periode', 'Gudang', 'Nama file']"
            :keys="['periode', 'warehouse', 'fileName']"
            option
            id="tableImportBase"
            >

            <!-- <div v-if="!slotProp.prop.shared">
            v-slot:default="slotProp"
				<Button value="Batal" type="button" danger small @trig="unCollect(slotProp.prop.id)" />
                <Button value="Edit" type="button" secondary small @trig="edit(slotProp.prop.id)" />
                <Button value="Share" primary type="button" small @trig="share(slotProp.prop.id)" />
            </div>
            <div v-else>
                Shared at {{ this.$store.getters["dateFormat"]({format: "dateMonth", time: slotProp.prop.shared }) }}
            </div> -->
            </Datatable>
			
        </div>
</template>

<script>
import Input from "../elements/Input.vue"
import Button from "../elements/Button.vue"
import Datatable from "../parts/Datatable.vue"
import Datepicker from "vue3-datepicker"

export default {
    name: "Collect",
    data() {
        return {
            periode1: new Date(),
            periode2: new Date(),
        };
    },
    components: {
        Input,
        Button,
        Datatable,
        Datepicker,
    },
    methods: {
        async show() {
            // bring up the loader
            this.$store.commit("Modal/active", {judul: "", form: "Loader"});
            // jika yang diminta total qty
            let dateCheck = this.periode1 === this.periode2 
                                ? [this.periode1.getTime()] 
                                : this.$store.getters["getDaysArray"](this.periode1, this.periode2)
            let objToSend = {
                    store: "BaseReportFile", 
                    date: dateCheck
                }
            await this.$store.dispatch("findDataByDateArrays", objToSend)
            this.$store.commit("Modal/active")
        }
    },
    computed: {
        lists() {
			let record = JSON.parse(JSON.stringify(this.$store.state.BaseReportFile.lists))
            return record.length > 0 ? record : []
			// let result = []
			// collect.forEach((val) => {
            //     if(val) {
            //     let spvInfo = this.$store.getters["Supervisors/spvId"](val.name)
            //         val.spvName = spvInfo.name
            //         val.spvWarehouse = spvInfo.warehouseName
            //         val.periode2 = this.$store.getters["dateFormat"]({ format: "dateMonth", time: val.periode })
            //         val.collected2 = !isNaN(val.collected) ? this.$store.getters["dateFormat"]({ format: "dateMonth", time: val.collected }) : val.collected
            //         result.push(val)
            //     }
			// })
            // return result
        },
    },
}
</script>