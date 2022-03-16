<template>
	<div>
		<Navbar />
		<component :is="activeNav"></component>
		<Modal :judul="more.judul" :form="more.form"/>
	</div>
</template>

<script>
	import Navbar from "../parts/Navbar.vue";
	import Name from "./Name.vue"
	import Impor from "./Impor.vue"
	import Collect from "./Collect.vue"
	import Report from "./Report.vue"
	import Modal from "../parts/Modal.vue"
	
	export default {
		name: "Main",
		components: { 
			Navbar,
			Name,
			Impor,
			Collect,
			Report,
			Modal,
		},
		computed: {
			activeNav() {
				return this.$store.state.Navbar.active
			},
			more() {
				return this.$store.state.Modal.more
			},
		},
		mounted() {
			this.$store.dispatch("getStart");
		}
	}
</script>

<style>
</style>
