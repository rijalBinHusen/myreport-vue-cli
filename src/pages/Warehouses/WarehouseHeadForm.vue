<template>
	<div>
		<Input type="text" label="Gudang" placeholder="Kosong" :value="warehouseName" disabled/>
		<div class="w3-col s4 w3-large w3-margin-top" v-for="list in lists" :key="list.id">
			<input 
				type="checkbox" 
				v-model="pickedHead"
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

<script setup lang="ts">
	import Input from "@/components/elements/Input.vue"
	import Button from "@/components/elements/Button.vue"
	import { getWarehouseById, updateWarehouse } from '@/pages/Warehouses/Warehouses'
	import { lists } from '@/pages/Headspv/Headspv'
	import { ref, onBeforeMount } from "vue"
	import { useStore } from "vuex"

	const warehouseId = ref('')
	const pickedHead = ref("")
	const warehouseName = ref("")
	const store = useStore()
	
	const update = async () => {
		// console.log(warehouseId.value.id, pickedHead.value)
		// await updateHeadspv(warehouseId.value.id, pickedHead.value)
		// await updateWarehouse(warehouseId.value.id, {  })
		store.commit('Modal/tunnelMessage', true)
		store.commit("Modal/active");
	}

	onBeforeMount(async () => {
		const warehouseDetails = await getWarehouseById(store.getters['Modal/obj']?.obj?.id)
		warehouseId.value = warehouseDetails.id
		warehouseName.value = warehouseDetails.name
		// pickedHead.value = warehouseDetails.
	})
</script>