<script setup>
	import { ref, computed } from "@vue/reactivity"
	import { onMounted } from '@vue/runtime-core';
	import userSignIn from "@/composable/userSignIn"
	import userCreate from "@/composable/userCreate";
	import Button from "@/components/elements/Button.vue";
	import DatabasesPick from "./DatabasesPick.vue";

	const username = ref('');
	const password = ref('');
	const enableForm = ref(true)

	const { error, signIn } = userSignIn()
	const { createUser } = userCreate()

	onMounted(() => {
		localStorage.removeItem('loginya')
		localStorage.removeItem('loginActivity')
	})
	const handleSignIn = async () => {
		enableForm.value = false
		let process = await signIn(username.value, password.value)
		if(process) {
			location.reload()
		}
		enableForm.value = true
	};

	//create new user
	const createNewUser = async () => {
		// else, create username and password
		const create = await createUser(username.value, password.value)
		if(create) {
			username.value = ''
			password.value = ''
		}
	}

	const mode = ref('Login')

	const isModeLogin = computed(() => mode.value === 'Login')

	// to move to database page
	const handlePage = async () => {
			// toggle mode
			mode.value == 'Database'
				? mode.value = 'Login'
				: mode.value = 'Database'
        }
</script>
<template>

<div class="w3-display-middle">
	<div v-if="isModeLogin" id="app" class="w3-row w3-col s3" style="min-width: 350px;margin-left: auto;margin-right: auto;">
		<div class="w3-section w3-border w3-padding w3-round-large w3-padding-64">
			<form @submit.prevent="handleSignIn" :class="['w3-container', enableForm ? '' : 'w3-disabled']"  action="#">
				<label class="w3-margin-bottom"><b>Username</b></label>
				<input class="w3-input w3-border w3-margin-bottom w3-round-large w3-border-teal" type="text" placeholder="Username" name="username" required v-model="username">

				<label @dblclick="createNewUser"  class="w3-margin-bottom"><b>Password</b></label>
				<input class="w3-input w3-border w3-round-large w3-border-teal" type="password" placeholder="Enter Password" name="psw" required="" v-model="password">
				<p style="color:red;"> {{error}} </p>
				<button class="w3-button w3-block w3-section w3-padding w3-teal w3-round-large" type="submit">Login</button>
				<button @click="handlePage" class="w3-button w3-block w3-section w3-padding w3-teal w3-round-large" type="button">Database</button>
			</form>
		</div>
	</div>
	<DatabasesPick @exit="handlePage" v-else />
</div>

</template>