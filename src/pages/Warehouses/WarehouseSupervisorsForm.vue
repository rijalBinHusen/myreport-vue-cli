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
import Input from "@/components/elements/Input.vue"
import Button from "@/components/elements/Button.vue"
import { getWarehouseById, updateWarehouse } from '@/pages/Warehouses/Warehouses'
import { lists } from '@/pages/Supervisors/Supervisors'
import { ref, onBeforeMount } from "vue"
import { useStore } from "vuex"

export default {
	setup() {
		const info = ref('')
		const listsSupervisors = ref([])
		const pickedSupervisors = ref([])
		const store = useStore()
		
		const update = async () => {
			// console.log(info.value.id, pickedSupervisors.value)
			// await updateSupervisors(info.value.id, [ ...pickedSupervisors.value])
			await updateWarehouse(info.value.id, { supervisors: pickedSupervisors });
			store.commit('Modal/tunnelMessage', true)
			store.commit("Modal/active");
		}

		onBeforeMount(() => {
			info.value = getWarehouseById(store.getters['Modal/obj']?.obj?.id)
			listsSupervisors.value = lists
			pickedSupervisors.value = info.value.supervisors
		})

		return {
			info,
			listsSupervisors,
			pickedSupervisors,
			update,
		}

	},
	components: { Input, Button },
}
</script>@/pages/Warehouses/Warehouses