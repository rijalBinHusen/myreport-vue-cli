<template>
	<div>
		<Input type="text" label="Nama item" placeholder="Kosong" :value="info.itemName" :disabled="true" />
		<div class="w3-row w3-large w3-margin-top" v-for="list in listsProblem" :key="list.id">
			<input 
				type="checkbox" 
				v-model="pickedProblem"
				:value="list.id" 
				:id="list.id" 
			/>
	        <label :for="list.id">  {{ list.masalah }}</label>
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
				listsProblem: [],
				pickedProblem: [],
			}
		},
		methods:{
			update() {
				this.$store.dispatch("BaseReportStock/updateProblem", { 
						id: this.info.id, 
						problem: [ ...this.pickedProblem ]
					})
				this.$store.commit("Modal/active");
				// console.log([ ...this.pickedProblem ])
			},
		},
		components: {
			Input, Button,
		},
		created() {
			this.info = this.$store.getters["Modal/obj"].obj
			// (periode, warehouse, item)
			// get all problem by warehouse and item
			this.listsProblem = this.$store.getters["Problem/problemByItem"](this.info?.warehouse, this.info?.item)
			// 
			this.pickedProblem = this.info.problem
		},
		name: "BaseProblemForm"
	}
</script>