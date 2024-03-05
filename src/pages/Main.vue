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
	import Navbar from "@/components/parts/Navbar.vue";
	import Modal from "@/components/parts/Modal.vue"
	import Documents from "./Documents/Documents.vue";
	import ImportData from "@/pages/Import/ImportData.vue"
	import ReportExport from "@/pages/ReportExport.vue"
	import Supervisors from "./Supervisors/Supervisors.vue"
	import Backup from "@/pages/Backup/Backup.vue"
	import BaseReportFile from "./BaseReport/BaseReportFile.vue"
	import Base from "@/pages/Base/Base.vue"
	import Warehouses from "@/pages/Warehouses/Warehouses.vue"
	import AGGrid from "./Base/AGGrid.vue"
	import Headspv from "@/pages/Headspv/Headspv.vue"
	import BaseItem from "@/pages/BaseItem/BaseItem.vue"
	import ProblemReport from "./Problems/ProblemReport.vue"
	import Finished from "./FinishedDocument/Finished.vue"
	import EditDocument from "./EditDocument.vue"
	import Cases from "./Cases/Cases.vue"
	import Complains from "./Complains/Complains.vue"
	import FollowUp from "./Followup/FollowUp.vue"
	import Login from "./Login/Login.vue"
	import Listsbackup from './Backup/Listsbackup.vue'
	import { computed, onBeforeMount, ref } from '@vue/runtime-core';
	import { useStore } from 'vuex';
	import { signOut } from "./Login/users"
	import FieldProblemVue from '@/pages/FieldProblems/FieldProblem.vue';
	import ImportActivityUser from './Import/ImportActivity.vue'
	import DateExpired from "./DateExpired/DateExpired.vue";
	

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
				isSignIn.value = localStorage.getItem('loginya')
				store.subscribe(() => {
					// get time last activity that stored
					const lastActivity = +localStorage.getItem('lastActivity')
					// compare to the time now
					const nowTime = new Date().getTime() 
					// if now > last activity return false
					if( isSignIn.value && nowTime > lastActivity) {
						signOut()
					}
				})
			})
			
			return { activeNav, more, isSignIn }
		},
		name: "Main",
		components: {
			Listsbackup,
			Documents,
			Login,
			FollowUp,
			Complains,
			Cases,
			EditDocument,
			Finished,
			ProblemReport,
			Headspv,
			BaseItem,
			AGGrid, 
			Navbar,
			ImportData,
			ReportExport,
			Modal,
			Warehouses,
			Supervisors,
			Backup,
			BaseReportFile,
			Base,
			FieldProblemVue,
			ImportActivityUser,
			DateExpired
		},
	}
</script>
./BaseReport/BaseReportFile.vue@/pages/Warehouses/Warehouses@/pages/Headspv/Headspv@/pages/Supervisors/Supervisors