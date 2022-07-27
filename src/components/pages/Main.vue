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
	import Approval from "../../modular/Approval/Approval.vue"
	import Report from "./Report.vue"
	import Modal from "../parts/Modal.vue"
	import Supervisors from "../../modular/Supervisors/Supervisors.vue"
	import Backup from "../../modular/Backup/Backup.vue"
	import Importbase from "../../modular/BaseImport/Importbase.vue"
	import Base from "../../modular/Base/Base.vue"
	import Warehouses from "../../modular/Warehouses/Warehouses.vue"
	import AGGrid from "../parts/AGGrid.vue"
	import Headspv from "../../modular/Headspv/Headspv.vue"
	import BaseItem from "../../modular/BaseItem/BaseItem.vue"
	import ProblemReport from "../../modular/ProblemReport/ProblemReport.vue"
	import Finished from "../../modular/Finished/Finished.vue"
	import EditDocument from "../../modular/EditDocument/EditDocument.vue"
	import Cases from "../../modular/CasesReport/Cases.vue"
	import Complains from "../../modular/ComplainReport/Complains.vue"
	import FollowUp from "../../modular/FollowUp/FollowUp.vue"
	import SyncToFirebase from "./SyncToFirebase.vue"
	import { computed, onMounted } from '@vue/runtime-core';
	import { useStore } from 'vuex';
	import createLogsFromScratch from "../../composable/createLogsFromScratch"

	export default {
		setup() {
			const store = useStore()
			const activeNav = computed(() =>  store.state.Navbar.active )
			const more = computed(() =>  store.state.Modal.more)

			onMounted(() => {
				store.dispatch("getStart");
				createLogsFromScratch()
			})

			return { activeNav, more }
		},
		name: "Main",
		components: {
			SyncToFirebase,
			FollowUp,
			Complains,
			Cases,
			EditDocument,
			Finished,
			Approval,
			ProblemReport,
			Headspv,
			BaseItem,
			AGGrid, 
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
	}
</script>

<style>
</style>
