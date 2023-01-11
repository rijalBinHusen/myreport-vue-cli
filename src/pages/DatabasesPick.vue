<template>
    <div>
		<div style="margin-bottom">
			<form @submit.prevent="" action="#" >
				<input 
					v-model="name" 
					class="w3-col s9 w3-input w3-large w3-margin-right" 
					type="text" 
					placeholder="Item id" 
					style="witdth: 300px"
				/>
				<Button
					small
					secondary
					value="Update" 
					datanya="tes" 
					type="button"
					class="w3-col s2"
				/>
			</form>
		</div>
		<!-- end of form -->
		<div>
			<Table
				style="width: 600px;"
				:headers="['id', 'Keterangan']" 
				:lists="databases" 
				:keys="['id', 'name']"
				options
				class="w3-margin-top"
			>
				<template #default="{ prop }">
					<Button
						small
						secondary
						value="Create new database from this" 
						datanya="tes" 
						type="button"
					/>
					<Button
						small
						secondary
						value="Edit" 
						datanya="tes" 
						type="button"
					/>
				</template>
			</Table>
			<button @click="emit('exit')" class="w3-center w3-button w3-block w3-section w3-padding w3-teal w3-round-large" type="button">Login page</button>
		</div>
    </div>
</template>

<script setup>
import Table from "@/components/elements/Table.vue";
import { useLocalbase } from "../utils/localbase"
import Button from "@/components/elements/Button.vue";
import { onMounted, ref, defineEmits } from "vue";

const name = ref(null)

const emit = defineEmits(['exit'])
// database
const db = useLocalbase('database_lists')
// store
const store = 'databases'
// database lists
const databases = ref([])

onMounted( async () => {
// // if user enter to database page
    // get our original database (myreport)
    const isOriginalDBExists = db.getDataById(store, 'myreport')
    // if doesn exists  create new one
    if(!isOriginalDBExists) {
        // create origin database record
        db.write(store, 'myreport', { id: 'myreport', name: '21 Juli 2022'})
    }
    // get all databases lists
    const databaseLists = await db.getData(store)
    // push to state
    databases.value.push(databaseLists)
})
</script>