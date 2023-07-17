<template>
	<div>
		<Input type="text" label="Gudang" placeholder="Kosong" :value="info?.name" disabled/>
		<div class="w3-col s4 w3-large w3-margin-top" v-for="list in listsHeadSpv" :key="list.id">
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

<script>
import Input from "@/components/elements/Input.vue"
import Button from "@/components/elements/Button.vue"
import { updateHeadspv, warehouseId } from '@/pages/Warehouses/Warehouses'
import { lists } from '@/pages/Headspv/Headspv'
import { ref, onBeforeMount } from "vue"
import { useStore } from "vuex"

export default {
	setup() {
		const info = ref('')
		const listsHeadSpv = ref([])
		const pickedHead = ref("")
		const store = useStore()
		
		const update = async () => {
			// console.log(info.value.id, pickedHead.value)
			await updateHeadspv(info.value.id, pickedHead.value)
			store.commit('Modal/tunnelMessage', true)
			store.commit("Modal/active");
		}

		onBeforeMount(() => {
			info.value = warehouseId(store.getters['Modal/obj']?.obj?.id)
			listsHeadSpv.value = lists
			pickedHead.value = info.value?.head
		})

		return {
			info,
			listsHeadSpv,
			pickedHead,
			update,
		}

	},
	components: { Input, Button },
}
</script>@/pages/Warehouses/Warehouses