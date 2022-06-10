<template>
	<div>
		<Input type="text" label="Gudang" placeholder="Kosong" :value="info?.name" disabled/>
		<div class="w3-col s4 w3-large w3-margin-top" v-for="list in listsSupervisors" :key="list.id">
			<input 
				type="checkbox" 
				v-model="pickedSupervisors"
				:value="list.id" 
				:id="list.id" 
				class="w3-margin-right"
			/>
	        <label :for="list.id">  {{ list?.name }}</label>
		</div>
		<Button 
                value="Update" 
                class="w3-right"
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
				listsSupervisors: [],
				pickedSupervisors: [],
			}
		},
		methods:{
			update() {
				this.$store.dispatch("Warehouses/updateSupervisors", {
					id: this.info?.id,
					supervisors: [ ...this.pickedSupervisors ]
				})
				this.$store.commit("Modal/active");
			},
		},
		components: {
			Input, Button,
		},
		created() {
			// warehouse details
			this.info = this.$store.getters["Warehouses/warehouseId"](
				this.$store.getters["Modal/obj"].obj?.id
				)
			// get spv lists of warehouse
			if(Array.isArray(this.info?.supervisors) && this.info?.supervisors?.length) {
					this.info?.supervisors.forEach((val) => {
						this.pickedSupervisors.push(
							val
						)
				})
			}
			this.listsSupervisors = this.$store.getters["Supervisors/enabled"]
		// console.log(this.info)
		},
		name: "WarehouseSupervisorsForm"
	}
</script>