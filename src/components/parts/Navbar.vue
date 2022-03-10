<template>
	<div class="w3-bar w3-teal w3-center w3-border w3-padding">
		<Button primary value="Collect" type="button" datanya="Collect" @trig="toNav($event)" />
		<Button primary value="Import" type="button" datanya="Impor" @trig="toNav($event)" />
		<Button primary value="Report" type="button" datanya="Report" @trig="toNav($event)" />
	</div>
</template>

<script>
	import Button from "../elements/Button.vue";
	
	export default {
		name: "Navbar",
		components: {
			Button,
		},
		methods: {
			toNav(nav) {
				this.$store.commit("Navbar/toNav", nav)
			}
		}
	}
</script>

<style>
</style>
