<template>
<div class="">
    <h1>Report Collected</h1>
    <div class="w3-border w3-padding w3-container">
        <label>Set record to show : </label>
        <Button primary value="Set" type="button" @trig="collectedForm" />
    </div>
			<Table v-if="collected.length > 0"
			:headers="['Nama', 'Gudang', 'Periode', 'Collected']" 
			:lists="collected" 
			:keys="['nameSPV', 'warehouse', 'periode', 'date']"
			v-slot:default="slotProp"
			small
			options
			>
				<Button href="#" value="Batal" type="link" @trig="unCollect(slotProp.prop)" />
                /
                <Button href="#" value="Edit" type="link" @trig="edit(slotProp.prop)" />
			</table>
			
        </div>
</template>

<script>
import Input from "../elements/Input.vue"
import Button from "../elements/Button.vue"
import Table from "../elements/Table.vue"
import datepicker from "vue3-datepicker"

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
        Table,
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

            let rec = this.$store.getters["Collected/listsId"](ev.id)
            rec.collected = window.prompt()
            if(rec.collected) {
                this.$store.dispatch("update", {store: "Collected", obj: rec})
            }
        },
    },
    computed: {
        // lists() {
        //     let uncollected = this.$store.getters["Uncollected/uncollected"]
        //     let name = JSON.parse(JSON.stringify(this.$store.state.Name.lists))
        //     let result = []

        //     name.forEach((val) => {
        //         result.push(Object.assign(val, {uncollected: uncollected[val.id] }))
        //     })

        //     return result
        //     // return this.$store.state.Name.lists
        // },
        collected() {
			let collect = JSON.parse(JSON.stringify(this.$store.state.Collected.lists))
			let result = []
			collect.forEach((val) => {
				val.nameSPV = this.$store.getters["Name/nameId"](val.name)["name"]
				val.warehouse = this.$store.getters["Name/nameId"](val.name)["warehouse"]
                val.periode = this.$store.getters["dateFormat"]({ format: "dateMonth", time: val.periode })
                val.date = !isNaN(val.collected) ? this.$store.getters["dateFormat"]({ format: "dateMonth", time: val.collected }) : val.collected
				result.push(val)
			})
            return result
        },
        // uncollected() {
        //     return this.$store.getters["Uncollected/uncollected"]
        // }
    },
}
</script>