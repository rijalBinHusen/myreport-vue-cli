<template>
<div class="w3-container w3-margin-top">
        <!-- Mode uncollected, collected or approval -->
        <Dropdown
            :value="mode + ' Documents'"
            :lists="[
                { id: 'Uncollected' },
                { id: 'Collected' },
                { id: 'Approval' }
            ]"
            listsKey="id"
            listsValue="id"
            @trig="mode = $event"
            class="w3-right"
            primary
        />
        <!-- Button to switch between view by supervisor or by periode -->
        <Button 
            v-if="isModeCollected || isModeUncollected"
            class="w3-right" 
            primary 
            :value="viewByPeriode ? 'View By Supervisors' : 'View by periode'" 
            type="button" 
            @trig="viewByPeriode = !viewByPeriode" 
        />
        <!-- Button to add new document -->
        <Button 
        v-if="isModeUncollected"
            class="w3-right" 
            primary 
            value="+ Periode" 
            type="button" 
            @trig="addPeriod"
        />
        <!-- Button to message to all spv and head -->
        <Dropdown
            v-if="isModeUncollected"
            value="Message to all"  
            :lists="headSPVLists"
            listsKey="phone"
            listsValue="name"
            @trig="oneClickMessageToAll($event)"
            class="w3-right"
            secondary
        />
        <!-- Button to send message a document that un approved -->
        <Dropdown
            v-if="isModeCollected"
            value="Belum approval"  
            :lists="headSPVLists"
            listsKey="phone"
            listsValue="name"
            @trig="notApproval($event)"
            class="w3-right"
            secondary
        />
        <!-- Approval mode only Button to show document by periode, in approved documents mode only -->
        <Button class="w3-right" v-if="isModeApproval" primary value="Pick periode" type="button" @trig="pickPeriode" />
        <Button class="w3-right" v-if="isModeApproval" primary :value="grouped.length ? 'Unmark all' :'Mark all'" type="button" @trig="markAll"/>
        <Button class="w3-right" v-if="isModeApproval && grouped.length" primary value="Export all" type="button" @trig="exportReportAll" />

		<Datatable
           v-if="renderTable"
          :datanya="lists"
          :heads="headsTable"
          :keys="keysTable"
          :option="isModeUncollected || isModeApproval || viewByPeriode"
          :id="viewByPeriode ? mode+'ByPeriode' : mode+'BySpv'"
        >
            <!-- If view by periode -->
                <template #th v-if="!viewByPeriode || isModeApproval">
                    <th v-if="isModeApproval">Export group</th>
                    <th v-else>Daftar periode</th>
                </template>

                <template #td="{ obj }" v-if="!viewByPeriode || isModeApproval">
                    <span v-if="isModeApproval">
                        <span v-if="obj.isfinished">
                            <input :id="obj.id" v-model="grouped" :value="obj.id" @input="push(obj.id, obj)" type="checkbox" />
                            <label :for="obj.id"> Group</label>
                        </span>
                        <p v-else>Unfinished</p>
                    </span>

                    <DocumentOptions
                        v-else
                        v-for="doc in obj.documents" :key="doc?.spvId"
                        class="w3-small"
                        isPrimary
                        @clicked="check({ day: $event, rec: doc.id })"
                        :isFull="isModeUncollected"
                        :value="doc.periode2 + ' ' +doc.warehouseName"
                    />
                </template>
            <!-- end of if view by periode -->

				<template #default="{ prop }">
					<Button
                        small
                        v-if="!viewByPeriode && isModeUncollected"
                        secondary
                        value="Pesan" 
                        datanya="tes" 
                        type="button" 
                        @trig="pesan(prop)" 
					/>
                    
                    <DocumentOptions 
                        v-if="viewByPeriode && ( isModeCollected || isModeUncollected)"
                        class="w3-small"
                        isPrimary
                        @clicked="collect({ day: $event, rec: prop.id })"
                        :isFull="isModeUncollected"
                        :value="isModeUncollected ? 'Collect' : 'Approve'"
                    />

                    <Button
                        v-if="viewByPeriode && isModeUncollected"
                        small
                        secondary
                        value="Edit" 
                        datanya="tes" 
                        type="button" 
                        @trig="edit(prop.id)" 
					/>

                    
                    <Button
                        v-if="viewByPeriode && isModeCollected"
                        small
                        secondary
                        value="Batal"
                        type="button" 
                        :datanya="prop.id"
                        @trig="cancel($event)" 
					/>
                    <!-- Approval document button -->
                    
                    <Dropdown
                        v-if="isModeApproval"
                        :value="prop?.shared ? 
                                `${dateMonth(prop.shared)} Shared` 
                                :'Options'"  
                        :lists="dropDownApprovalOptions(prop)"
                        listsKey="id"
                        listsValue="isi"
                        @trig="handleAction($event, prop)"
                        class="w3-small"
                        :danger="!!prop?.shared"
                        :primary="!!!prop?.shared"
                    />
                </template>
        
        </Datatable>
</div>
</template>

<script>

import Button from "@/components/elements/Button.vue"
import Datatable from "@/components/parts/Datatable.vue"
import Dropdown from "@/components/elements/Dropdown.vue"
import { ref, onBeforeMount, watch, computed } from "vue"
import { useStore } from "vuex"
import { lists as listsHeadSPV } from '@/pages//Headspv/Headspv'
import { subscribeMutation } from "@/composable/piece/subscribeMutation"
import { lists as listsOfDocuments, Documents } from "./DocumentsPeriod"

import { lists as listsSupervisor } from '@/pages/Supervisors/Supervisors'
import DocumentOptions from "./DocumentOptions.vue"
import { dateMonth, dayPlusOrMinus, full } from "@/composable/piece/dateFormat"
import DailyReport from "@/excelReport/DailyReport"
import DailyReportGroup from "@/excelReport/DailyReportGroup"

export default {
    components: {
    Button,
    Datatable,
    Dropdown,
    DocumentOptions,
},
    setup() {
        const store = useStore()
        const viewByPeriode = ref(true)
        const lists = ref([])
        const headSPVLists = ref([])
        const mode = ref('Uncollected')
        const renderTable = ref(true)
        const isModeUncollected = computed(() =>  mode.value == 'Uncollected' )
        const isModeCollected = computed(() =>  mode.value == 'Collected' )
        const isModeApproval = computed(() => mode.value == 'Approval')
        const { getUncollectedDocuments, 
                documentsBySupervisor, 
                documentMore2DaysBySpv, 
                allDocumentMore2Days,
                collectDocument,
                ijinDocument,
                kosongDocument,
                getCollectedDocuments,
                approveDocument,
                unApproveDocument,
                unCollectDocument,
                getApprovedDocuments,
                getDocuments,
                shareDocument,
                findDocument 
            } = Documents();

        const headsTable = computed(() => {
            if(viewByPeriode.value) {
                if(isModeUncollected.value) {
                    return ['Gudang', 'Nama', 'Periode', 'Shift', 'Kabag']
                } else if(isModeCollected.value) {
                    return ['Gudang', 'Nama', 'Periode', 'Shift', 'Collected']
                } else {
                    return ['Gudang', 'Nama', 'Periode', 'Shift', 'Approved']
                }
            } else {
                return ['Gudang', 'Nama']
            }
        })
        const keysTable = computed(() => {
            if(viewByPeriode.value) {
                if(isModeUncollected.value) {
                    return ['warehouseName', 'spvName', 'periode2', 'shift', 'headName'] 
                } else if(isModeCollected.value) {
                    return ['warehouseName', 'spvName', 'periode2', 'shift', 'collected2'] 
                } else {
                    return ['warehouseName', 'spvName', 'periode2', 'shift', 'approval2'] 
                }
            } else {
                return ['warehouseName', 'spvName']
            }
        })
        // Approval documents
        const grouped = ref([])
        const groupedObject = ref([])

        const  dropDownApprovalOptions = (prop) => {
            // v-if="prop.shared == 'false' || !prop.shared "
            // !isNaN(prop.isfinished) && !isNaN(prop.collected) && prop?.baseReportFile
            let options = []
            if(!isNaN(prop.isfinished) &&  prop?.baseReportFile) {
                options.push({ id: 'exportReport', isi: 'Export' })
            }
            if(!prop?.shared) {
                // action: 'unapprove', rec: prop.id }
                // { action: 'share', rec: prop.id }
                options.push(
                    { id: 'unapprove', isi: 'Batal' },
                    { id: 'share', isi: 'Share' }
                )
            }
            return options
        }

        const markAll = () => {
            if(grouped.value.length) {
                grouped.value = []
                groupedObject.value = []
                return
            }
            lists.value.forEach((rec) => {
                if(!isNaN(rec?.collected)) {
                    grouped.value.push(rec.id)
                    groupedObject.value.push(rec)
                }
            })
        }

        const exportReportAll = async () => {
            if(!groupedObject.value.length) {
                return
            }
            // Open loader
            store.commit("Modal/active", { judul: "", form: "Loader" });
            // group dulu yang spv dan periode yang sama
            /* expected object = [
                [{ baseReport }, { baseReport }],
                [{ baseReport }, { baseReport }],
                [{ baseReport }, { baseReport }],
            ]
            */
           let groups = []
        //   grouped { spvperiode: index }
           let groupedAsObject = {}
           groupedObject.value.forEach((val) => {
                //    if the object was groupedAsObject, and else
               if(groupedAsObject.hasOwnProperty(val?.name+val?.periode)) {
                // //    console.log("ada sama")
                //    console.log(val.name+val.periode)
                //    console.log(groupedAsObject[val?.name+val?.periode])
                   groups[groupedAsObject[val.name+val.periode]].push({ ...val })
               } else {
                   groupedAsObject[val.name+val.periode] = groups.length
                   groups.push([{ ...val }])
                // console.log(groupedAsObject)
                // console.log("tidak sama")
               }
           })
        //    console.log(groups)
            // // iterate semua yang sudah digroup
            for (let group of groups) {
                // console.log(group[i])
                if(group.length > 1) {
                    await DailyReportGroup(group)
                }   else {
                    await DailyReport(group[0])
                }
            }
            // mark all record as shared
            for (let rec of groupedObject.value) {
                if(!rec?.shared) {
                    await collect({ rec: rec.id, day: 0})
                }
            }
            // empty the groupedAsObject
            groupedObject.value = []
            grouped.value = []
            // Close loader
            store.commit("Modal/active");
        }

        const pickPeriode = async () => {
            let period = await subscribeMutation("Set periode to show", "PeriodePicker",  false, 'Modal/tunnelMessage')
            if(period) {
                //open the loader
                store.commit("Modal/active", {judul: "", form: "Loader"})
                // wait the process
                await getDocuments(period?.periode1, period?.periode2)
                //close the loader
                store.commit("Modal/active")
                renewLists()
            }
        }

        const push = (id, obj) => {
            // if the id is exists,
            if(grouped.value.includes(id)) {
                groupedObject.value = groupedObject.value.filter(rec => rec.id != id)
                return
            } 
            // else
            groupedObject.value.push({ ...obj })
        }

        const handleAction = async (action, docs) => {
            if(action === 'exportReport') {
                //open the loader
                store.commit("Modal/active", {judul: "", form: "Loader"})
                // waiting the process
                await DailyReport(docs)
                //close the loader
                store.commit("Modal/active")
                return
            } else if(action === 'unapprove') {
                cancel(docs.id)
            } else if(action === 'share') {
                collect({ rec: docs.id, day: 0 })
            }
            // EV =  {action: 'approve', rec: doc22050003}
            // this.$store.dispatch("Document/handleDocument", ev)
        }
        // End of approval documents

        const oneClickMessageToAll = async (ev) => {
            // ambil dulu semua karu
            let supervisors = listsSupervisor
            // iterate semua karu untuk kirim pesan
            for (let supervisor of supervisors) {
                // dapatkan dokumen yang lebih dari 2 hari
                let listLaporan = await documentMore2DaysBySpv(supervisor?.id)
                // jika ada dokumen yang lebih dari 2 hari
                if(listLaporan && supervisor?.phone) {
                    // promise 
                    const prom = await subscribeMutation(
                                    "", 
                                    "Confirm",
                                    { pesan: `Kamu akan mengirim pesan kepada ${supervisor?.name} `},
                                    'Modal/tunnelMessage'
                                    )
                    if(prom) {
                        // call the pesan function
                        pesan(supervisor, listLaporan)
                    }
                    store.commit("Modal/active")
                }
            }
            // ke pesan selanjutnya
            pesanSemua(ev)
        }
        

        const pesan = async (ev, listsLaporan) => {
            if(!listsLaporan) {
                listsLaporan = await documentMore2DaysBySpv(ev?.spvId)
            }
            let pesan = `*Tidak perlu dibalas*%0a%0aMohon maaf mengganggu bapak ${ev?.name || ev?.spvName},%0aberikut kami informasikan daftar laporan yang belum dikumpulkan yaitu:%0a%0a${listsLaporan}%0amohon untuk dikumpulkan tidak lebih dari H%2b2.%0aTerimakasih atas perhatianya.`
            
            window.open(`https://wa.me/${ev.phone}?text=${pesan}`)
        }

        const pesanSemua = async (ev) => {
            // let nophone = window.prompt()
            if(!ev) { return }
            const prom = await subscribeMutation(
                                    "", 
                                    "Confirm",
                                    { pesan: `Kamu akan mengirim pesan kepada ${ev} `},
                                    'Modal/tunnelMessage'
                                    )
            let result = `*Tidak perlu dibalas*%0a%0aBerikut kami kirimkan daftar laporan yang belum dikumpulkan pada ${full()}:%0a%0a`
            let messageText = await allDocumentMore2Days()
            if(prom) {
                window.open(`https://wa.me/${ev}?text=${result+messageText}`)
            }
        }

        const edit = async (ev) => {
            let res = await subscribeMutation(
                        `Edit document`,
                        "DocumentCheckForm",
                        { id: ev,  mode: 'edit' },
                        'Modal/tunnelMessage'
                    )
                if(res) {
                    renewLists()
                }
        }

        const check = async (ev) => {
            if(!isNaN(ev.day) && isModeUncollected.value) {
                let time = dayPlusOrMinus('', Number(ev.day))
                let res = await subscribeMutation(
                    `Report collected at ${dateMonth(time)}`,
                    "DocumentCheckForm",
                    { id: ev.rec, time: ev.day, mode: 'edit' },
                    'Modal/tunnelMessage'
                    )
                    if(res) {
                        renewLists()
                    }
            } else {
                collect(ev)
            }
        }

        const addPeriod = async () => {
            let res = await subscribeMutation(
                "Masukkan periode",
                "DocumentsGroupForm",
                {},
                'Modal/tunnelMessage'
            )
            if(res) {
                renewLists()
            }
        }

        onBeforeMount( async () => {
            headSPVLists.value = listsHeadSPV
            renewLists(true)
        })

        watch([mode, viewByPeriode], (newVal, oldVal) => {
            renewLists(newVal[0] !== oldVal[0])
        })
        
        const collect = async (ev) => {
            if(Number(ev.day) < 1) {
                if(isModeUncollected.value) {
                    await collectDocument(ev.rec, Number(ev.day))
                } else if(isModeCollected.value) {
                    let rec = findDocument(ev.rec)
                    // is the document unfinished
                    if(!rec?.isfinished) {
                        let res = await subscribeMutation(
                            'Peringatan',
                            'Confirm',
                            { pesan: 'Document masih belum selesai dikerjakan', isAlert: true },
                            'Modal/tunnelMessage'
                        )
                        if(!res) { return }
                    }
                    // is the document contain item variance
                    if(rec?.itemVariance) {
                        let res = await subscribeMutation(
                            '',
                            'Confirm',
                            { pesan: 'Document memiliki selisih stock, silahkan difoto dulu' },
                            'Modal/tunnelMessage'
                        )
                        if(!res) { return }
                    }
                    await approveDocument(ev.rec, Number(ev.day))
                } else if(isModeApproval.value) {
                    await shareDocument(ev.rec)
                }
            } else {
                if(ev.day == 'ijin') {
                    await ijinDocument(ev.rec)
                }
                else if(ev.day == 'kosong') {
                    await kosongDocument(ev.rec)
                }
            }
            renewLists()
        }

        const cancel = async (idDocument) => {
            if(isModeApproval.value) {
                await unApproveDocument(idDocument)
            } else if(isModeCollected.value) {
                await unCollectDocument(idDocument)
            }
            renewLists()
        }

        const notApproval = (ev) => {
                // dockumen yang belum tanda tangan kabag
                let result = "Dokumen belum *approval* kapala bagian:%0a%0a"
                let notApproval = this.$store.getters["Document/documentNotApproval"]
                Object.keys(notApproval).forEach((val) => {
                    result += `*${notApproval[val]?.headName} (${notApproval[val]?.lists.length}) Dokumen* :%0a`
                    result += notApproval[val]?.lists.join("%0a")
                    result += "%0a%0a"
                })
                // console.log(result)
                window.open(`https://wa.me/${ev}?text=${result}`)
                // shell.openExternal(`https://wa.me/${ev}?text=${result}`)
            }
        
        const renewLists = async (isGetNewDocument) => {
            renderTable.value = false
                if(isGetNewDocument) {
                    if(isModeUncollected.value) {
                        await getUncollectedDocuments()
                    } else if(isModeCollected.value) {
                        await getCollectedDocuments()
                    } else {
                        await getApprovedDocuments()
                        viewByPeriode.value = true
                    }
                }
                // if view by periode
                if(viewByPeriode.value) {
                    lists.value = await listsOfDocuments()
                } 
                // if view by supervisor
                else {
                    lists.value = await documentsBySupervisor()
                }
            renderTable.value = true
        }

        return { 
            oneClickMessageToAll, pesan, pesanSemua, 
            viewByPeriode, lists, edit, check, addPeriod,
            headSPVLists, notApproval, collect, mode, renderTable,
            isModeCollected, isModeUncollected, isModeApproval, cancel,
            headsTable, keysTable, dropDownApprovalOptions, handleAction,
            pickPeriode, dateMonth, grouped, push, markAll, exportReportAll
        }
    },
}
</script>