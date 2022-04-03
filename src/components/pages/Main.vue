<template>
	<div>
		<Navbar />
		<component :is="activeNav"></component>
		<Modal :judul="more.judul" :form="more.form"/>
	</div>
</template>

<script>
	import Navbar from "../parts/Navbar.vue";
	import Uncollected from "./Uncollected.vue"
	import Impor from "./Impor.vue"
	import Collected from "./Collected.vue"
	import Report from "./Report.vue"
	import Modal from "../parts/Modal.vue"
	import Warehouses from "./Warehouses.vue"
	import Supervisors from "./Supervisors.vue"
	
	export default {
		name: "Main",
		components: { 
			Navbar,
			Uncollected,
			Impor,
			Collected,
			Report,
			Modal,
			Warehouses,
			Supervisors,
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
