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
					v-if="currentEditId"
					small
					secondary
					value="Update" 
					datanya="tes" 
					type="button"
					class="w3-col s2"
					@trig="handleUpdate"
				/>
			</form>
		</div>
		<!-- end of form -->
		<div>
			<Table
				:headers="['id', 'Keterangan']" 
				:lists="databases" 
				:keys="['id', 'name']"
				options
				class="w3-margin-top"
			>
				<template #default="{ prop }">
					<div>
						<Button
							small
							secondary
							:value="prop?.isUsed ? 'Current' : 'Set'" 
							:datanya="prop.id"
							type="button"
							@trig="setCurrentDatabaseUsed($event)"
						/>
						<span v-if="prop?.isAllowToDuplicate">
							<Button
								small
								secondary
								value="Edit" 
								:datanya="prop.id"
								type="button"
								@trig="handleBtnTable('edit', $event)"
							/>
							<Button
								small
								secondary
								value="Create new this" 
								:datanya="prop.id" 
								type="button"
								@trig="handleBtnTable('duplicate', $event)"
							/>
						</span>
					</div>
				</template>
			</Table>
			<button @click="emit('exit')" class="w3-center w3-button w3-block w3-section w3-padding w3-teal w3-round-large" type="button">Login page</button>
		</div>
		{{ messageToShow }}
    </div>
</template>

<script setup>
import Table from "@/components/elements/Table.vue";
import Button from "@/components/elements/Button.vue";
import { onMounted, ref, defineEmits } from "vue";
import { databases, getAllDatabase, getDatabaseById, updateDatabaseById, duplicateDatabase, messageToShow, setCurrentDatabaseUsed } from "../composable/components/DatabasePick"

const name = ref(null)

const emit = defineEmits(['exit'])
// current edit id
const currentEditId = ref(null)

onMounted( async () => {
	// get database
	await getAllDatabase()
})

const handleBtnTable = async (operation, e) => {
	if(operation == 'edit') {
		// get the record
		const record = await getDatabaseById(e)
		// put name in to v-model
		name.value = record.name
		// put the id
		currentEditId.value = e
	} else {
		// duplicate database from id database (e)
		await duplicateDatabase(e)
	}
}

const handleUpdate = async () => {
	// update database
	await updateDatabaseById(currentEditId.value, name.value)
	// reset name
	name.value = null
	// reset current id
	currentEditId.value = null
}
</script>