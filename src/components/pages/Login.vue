<script>
	import { ref } from "@vue/reactivity"
	import userSignin from "../../composable/userSignIn"
	import { useRouter } from 'vue-router'
	import func from '../../myfunction'
	import { onMounted } from '@vue/runtime-core'

	export default {
		setup() {
		const { error, signin } = userSignin()
		const router = useRouter();

		const email = ref('');
		const password = ref('');

		onMounted(() => {
			localStorage.setItem('loginya', '')
		})
		const handleSignIn = async () => {
			await signin(email.value, password.value)
			await func.append({ store: "login", obj: 
				{ totalActivity: 0, id: new Date().getTime()+'' }
			}).then((val) => {
				localStorage.setItem('loginya', val?.data?.id)
			})
			router.push({ name: "Main"})
		};

		return { email, password, handleSignIn, error }
		}
	}
</script>
<template>

<div class="w3-display-middle">
	
	<div id="app" class="w3-row w3-col s3" style="min-width: 350px;margin-left: auto;margin-right: auto;">
		<form @submit.prevent="handleSignIn" class="w3-container" action="#">
			<div class="w3-section w3-border w3-padding w3-round-large w3-padding-64">
				<label class="w3-margin-bottom"><b>Email</b></label>
				<input class="w3-input w3-border w3-margin-bottom w3-round-large w3-border-teal" type="email" placeholder="Email" name="usrname" required v-model="email">

				<label class="w3-margin-bottom"><b>Password</b></label>
				<input class="w3-input w3-border w3-round-large w3-border-teal" type="password" placeholder="Enter Password" name="psw" required="" v-model="password">
				<p style="color:red;"> {{error}} </p>
				<button class="w3-button w3-block w3-section w3-padding w3-teal w3-round-large" type="submit">Login</button>
			</div>
		</form>
	</div>
</div>

</template>