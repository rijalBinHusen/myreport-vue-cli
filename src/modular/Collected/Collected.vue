<template>
<div class="">
    <div class="w3-border w3-padding w3-container">
        <label>Set record to show : </label>
        <Button primary value="Set" type="button" @trig="collectedForm" />
    </div>

            <Datatable
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
			<!-- </table> -->
			
        </div>
</template>

<script>
import Input from "../../components/elements/Input.vue"
import Button from "../../components/elements/Button.vue"
import Datatable from "../../components/parts/Datatable.vue"
import datepicker from "vue3-datepicker"
import { mapGetters } from "vuex"

export default {
    name: "Collect",
    data() {
        return {
            periode: new Date()
        };
    },
    components: {
        Input,
        Button,
        Datatable,
        datepicker,
    },
    methods: {
        collectedForm() {
            this.$store.commit("Modal/active", { judul: "Set record to show", form: "CollectedForm"});
        },
        edit(ev) {
            // value = {store: 'nameOfStore', obj: {id: idOfDocument, object: 'to append to indexeddb'} }
            //this.$store.dispatch("update", objToSend)
            // ev.collected = window.prompt()
            
            let rec = this.$store.getters["Collected/listsId"](ev)
            rec.collected = window.prompt()
            if(rec.collected) {
                this.$store.dispatch("update", {store: "Collected", obj: rec})
            }
        },
		unCollect(ev) {
            let record = this.$store.getters["Collected/listsId"](ev)
			// remove date collect
			delete record.collected
			// append to uncollected
			this.$store.dispatch("append", {
			    store: "Uncollected",
			    obj: record
			})
			// delete from collected
			this.$store.dispatch("delete", { store: "Collected", id: ev })
		},
        share(ev){
            // console.log(ev)
            let record = this.$store.getters["Collected/listsId"](ev)
            //set shared to true with date
            record.shared = this.$store.getters["dateFormat"]({format: "time"})
            // value = {store: 'nameOfStore', obj: {id: idOfDocument, object: 'to append to indexeddb'} }
            this.$store.dispatch("update", { store: "Collected", obj: record, period: record.periode })
        }
    },
    computed: {
        collected() {
			let collect = JSON.parse(JSON.stringify(this.$store.state.Collected.lists))
			let result = []
			collect.forEach((val) => {
                if(val) {
                let spvInfo = this.$store.getters["Supervisors/spvId"](val.name)
                    val.spvName = spvInfo.name
                    val.spvWarehouse = spvInfo.warehouseName
                    val.periode2 = this.$store.getters["dateFormat"]({ format: "dateMonth", time: val.periode })
                    val.collected2 = !isNaN(val.collected) ? this.$store.getters["dateFormat"]({ format: "dateMonth", time: val.collected }) : val.collected
                    result.push(val)
                }
			})
            return result
        },
    },
}
</script>