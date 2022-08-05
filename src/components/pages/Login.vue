<script>
	import { ref } from "@vue/reactivity"
	import { onMounted } from '@vue/runtime-core';
	import userSignIn from "../../composable/userSignIn"
	import userCreate from "../../composable/userCreate"

	export default {
		setup() {

		const username = ref('');
		const password = ref('');

		const { error, signIn } = userSignIn()
		const { createUser } = userCreate()

		onMounted(() => {
			localStorage.removeItem('loginya')
			localStorage.removeItem('loginActivity')
		})
		const handleSignIn = async () => {
			let process = await signIn(username.value, password.value)
			if(process) {
				location.reload()
			}
			// await func.append({ store: "login", obj: 
			// 	{ totalActivity: 0, id: new Date().getTime()+'' }
			// }).then((val) => {
			// 	localStorage.setItem('loginya', val?.data?.id)
			// })
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

		return { createNewUser, username, password, handleSignIn, error }
		}
	}
</script>
<template>

<div class="w3-display-middle">
	
	<div id="app" class="w3-row w3-col s3" style="min-width: 350px;margin-left: auto;margin-right: auto;">
		<form @submit.prevent="handleSignIn" class="w3-container" action="#">
			<div class="w3-section w3-border w3-padding w3-round-large w3-padding-64">
				<label class="w3-margin-bottom"><b>Username</b></label>
				<input class="w3-input w3-border w3-margin-bottom w3-round-large w3-border-teal" type="text" placeholder="Username" name="username" required v-model="username">

				<label @dblclick="createNewUser" class="w3-margin-bottom"><b>Password</b></label>
				<input class="w3-input w3-border w3-round-large w3-border-teal" type="password" placeholder="Enter Password" name="psw" required="" v-model="password">
				<p style="color:red;"> {{error}} </p>
				<button class="w3-button w3-block w3-section w3-padding w3-teal w3-round-large" type="submit">Login</button>
			</div>
		</form>
	</div>
</div>

</template>