<template>
	<div>
		<Input type="text" label="Supervisor" placeholder="Kosong" :value="info?.name" disabled/>
		<div class="w3-col s4 w3-large w3-margin-top" v-for="list in listsWarehouses" :key="list.id">
			<input 
				type="checkbox" 
				v-model="pickedWarehouses"
				:value="list.id" 
				:id="list.id" 
				class="w3-margin-right"
			/>
	        <label :for="list.id">  {{ list?.name }}</label>
		</div>
		<Button 
                value="Update" 
                class="w3-right w3-margin-top"
                type="button" 
                primary
                :nomargin="true"
                @trig="update"
            />
	</div>
</template>

<script>
import Input from "../../components/elements/Input.vue"
import Button from "../../components/elements/Button.vue"

	export default {
		data() {
			return {
				info: "",
				listsWarehouses: [],
				pickedWarehouses: [],
			}
		},
		methods:{
			update() {
				// console.log(this.listsWarehouses, this.pickedWarehouses)
				this.$store.dispatch("Supervisors/updateWarehouses", {
					id: this.info?.id,
					warehouses: [ ...this.pickedWarehouses ]
				})
				this.$store.commit("Modal/active");
			},
		},
		components: {
			Input, Button,
		},
		created() {
			// warehouse details
			this.info = this.$store.getters["Supervisors/spvId"](
				this.$store.getters["Modal/obj"].obj?.id
				)
			// get spv lists of warehouse
			if(Array.isArray(this.info?.warehouses) && this.info?.warehouses?.length) {
				this.pickedWarehouses = this.info?.warehouses
			}
			this.listsWarehouses = this.$store.state.Warehouses.lists
		// console.log(this.info)
		},
		name: "SupervisorWarehousesForm"
	}
</script>