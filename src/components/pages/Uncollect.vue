<template>
<div class="w3-container">
    <h1>Report uncollected</h1>
			<Button class="w3-right" primary value="+ Periode" type="button" @trig="addPeriod" />
            
            <Table v-if="lists.length > 0"
            :headers="['Nama', 'Gudang']" 
            :lists="lists" 
            :keys="['name', 'warehouse']"
			v-slot:default="slotProp"
			options
            >
				
				<span v-if="uncollected[slotProp.prop.id] && uncollected[slotProp.prop.id].length > 2">					
					<Button
					secondary
					value="Pesan" 
					datanya="tes" 
					type="button" 
					@trig="pesan(slotProp.prop)" 
					/>
				</span>

                <span>
                    <Button
                    v-for="uncl in uncollected[slotProp.prop.id]" :key="uncl.id"
					primary
					:value="uncl.periode" 
					:datanya="uncl.id" 
					type="button" 
					@trig="collect($event)" 
					/>
                </span>

			</Table>
</div>
</template>

<script>

import Button from "../elements/Button.vue"
import Table from "../elements/Table.vue"

export default {
    name: "Uncollected",
    components: {
        Button,
        Table,
    },
    methods: {
		addPeriod() {
            // bring up the form and the modal
            this.$store.commit("Modal/active", {judul: "Masukkan periode", form: "CollectForm"});
		},
        collect(ev) {
            console.log(ev)
            // // add date collect
            // ev.collected = new Date().getTime()
            // // append to collected
            // this.$store.dispatch("append", {
            //     store: "Collect",
            //     obj: ev,
            //     split: ev.collected
            // })
            // // delete from uncollected
            // this.$store.dispatch("delete", { store: "Uncollected", doc: { id: ev.id }})
        }
    },
    computed: {
        lists() {
            let uncollected = this.$store.getters["Uncollected/uncollected"]
            let name = JSON.parse(JSON.stringify(this.$store.state.Name.lists))
            let result = []

            name.forEach((val) => {
                result.push(Object.assign(val, {uncollected: uncollected[val.id] }))
            })

            return result
            // return this.$store.state.Name.lists
        },
        uncollected() {
            return this.$store.getters["Uncollected/uncollected"]
        }
    }
}
</script>