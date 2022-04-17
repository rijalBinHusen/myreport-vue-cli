<template>
	<div>
		<Navbar />
		<component :is="activeNav"></component>
		<Modal :judul="more.judul" :form="more.form"/>
	</div>
</template>

<script>
	import Navbar from "../parts/Navbar.vue";
	import Uncollected from "../../modular/Uncollected/Uncollected.vue"
	import ImportData from "../../modular/ImportData/ImportData.vue"
	import Collected from "../../modular/Collected/Collected.vue"
	import Report from "./Report.vue"
	import Modal from "../parts/Modal.vue"
	import Supervisors from "../../modular/Supervisors/Supervisors.vue"
	import Backup from "../../modular/Backup/Backup.vue"
	import Importbase from "../../modular/BaseImport/Importbase.vue"
	import Base from "../../modular/Base/Base.vue"
	import Warehouses from "../../modular/Warehouses/Warehouses.vue"
	
	export default {
		name: "Main",
		components: { 
			Navbar,
			Uncollected,
			ImportData,
			Collected,
			Report,
			Modal,
			Warehouses,
			Supervisors,
			Backup,
			Importbase,
			Base,
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
