<template>
	<div v-if="active.id !== 'AGGrid'" class="w3-bar w3-teal w3-center w3-border w3-padding">
		<Button primary style="left:13px;" class="w3-left" value="&#9776;" @trig="sideBarActive = !sideBarActive" type="button" />
		<span class="w3-center w3-xlarge">{{ active.title }}</span>
		<div v-if="sideBarActive" class="w3-sidebar w3-border-teal w3-rightbar w3-bar-block w3-card w3-animate-left w3-right" style="left:0; position:fixed; top:0;"  id="leftMenu">
				<button class=" w3-text-black w3-bar-item w3-button w3-large w3-right-align" @click="sideBarActive = !sideBarActive">&times;</button>
				
				<h3 class="w3-text-black w3-left w3-padding-left">Reports</h3>
				<Button 
					v-for="nav in reports"
					:key="nav.id"
					noborder 
					:class="['w3-bar-item w3-text-black', active.id === nav.id ? 'w3-teal' : '']" 
					:value="nav.title" 
					type="button" 
					:datanya="nav.id" 
					@trig="toNav($event)" 
				/>
				
				<h3 class="w3-text-black w3-left w3-padding-left">Settings</h3>
				<Button 
					v-for="nav in setting"
					:key="nav.id"
					noborder 
					:class="['w3-bar-item w3-text-black', active.id === nav.id ? 'w3-teal' : '']" 
					:value="nav.title" 
					type="button" 
					:datanya="nav.id" 
					@trig="toNav($event)" 
				/>
				<Button 
					noborder 
					danger
					class="w3-bar-item"
					value="Logout" 
					type="button" 
					@trig="handleLogout" 
				/>
		</div>
	</div>
</template>

<script>
import Button from "../elements/Button.vue";
import { mapGetters } from "vuex"
import userLogout from "../../composable/userLogout"
import { useRouter } from 'vue-router';
	
	export default {
		name: "Navbar",
		setup() {
			const router = useRouter()
			const { logout, error } = userLogout()
			const handleLogout = async () => {
				await logout()
				if(!error.value) {
					router.push("/login")
				}
			}

			return { handleLogout }
		},
		data() {
			return {
				sideBarActive: true,
			}
		},
		components: {
			Button,
		},
		methods: {
			toNav(nav) {
				this.$store.commit("Navbar/toNav", nav)
				this.sideBarActive = false
			}
		},
		computed: {
			...mapGetters({
				setting: "Navbar/navbarSettings",
				reports: "Navbar/navbarReports",
				active: "Navbar/active"
			})

		},
	}
</script>

<style>
</style>
