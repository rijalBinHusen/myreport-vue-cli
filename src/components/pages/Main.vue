<template>
	<div>
		<div v-if="isSignIn">
			<Navbar />
			<component :is="activeNav"></component>
			<Modal :judul="more.judul" :form="more.form"/>
		</div>
		<Login v-else />
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
	import Importbase from "../../pages/Importbase.vue"
	import Base from "../../modular/Base/Base.vue"
	import Warehouses from "@/pages/Warehouses.vue"
	import AGGrid from "../parts/AGGrid.vue"
	import Headspv from "../../modular/Headspv/Headspv.vue"
	import BaseItem from "../../modular/BaseItem/BaseItem.vue"
	import ProblemReport from "../../modular/ProblemReport/ProblemReport.vue"
	import Finished from "../../modular/Finished/Finished.vue"
	import EditDocument from "../../pages/EditDocument.vue"
	import Cases from "../../modular/CasesReport/Cases.vue"
	import Complains from "../../modular/ComplainReport/Complains.vue"
	import FollowUp from "../../modular/FollowUp/FollowUp.vue"
	import Login from "./Login.vue"
	import { computed, onBeforeMount, ref } from '@vue/runtime-core';
	import { useStore } from 'vuex';
	import userSignOut from "../../composable/UserSignOut"
	import FieldProblemVue from '@/pages/FieldProblem.vue';
	import { getWarehouses } from "@/composable/components/Warehouses";
	import { getSupervisors } from "@/composable/components/Supervisors";
	

	export default {
		setup() {
			const store = useStore()
			const isSignIn = ref(null)

			const activeNav = computed(() => {
				return store.state.Navbar.active
			})

			const more = computed(() => {
				return store.state.Modal.more
			})
			
			onBeforeMount(() => {
				getWarehouses()
				getSupervisors()
				store.dispatch("getStart");
				isSignIn.value = localStorage.getItem('loginya')
				store.subscribe(() => {
					// get time last activity that stored
					const lastActivity = +localStorage.getItem('lastActivity')
					// compare to the time now
					const nowTime = new Date().getTime() 
					// if now > last activity return false
					if( isSignIn.value && nowTime > lastActivity) {
						userSignOut()
					}
				})
			})
			
			return { activeNav, more, isSignIn }
		},
		name: "Main",
		components: {
			Login,
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
			FieldProblemVue
		},
	}
</script>
