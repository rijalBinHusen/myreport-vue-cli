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
        <!-- Button to add new document -->
        <Button class="w3-right" primary value="+ Periode" type="button" @trig="addPeriod" />
        <!-- Button to message to all spv and head -->
        <Dropdown
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
            v-if="mode == 'Collected'"
            value="Belum approval"  
            :lists="headSPVLists"
            listsKey="phone"
            listsValue="name"
            @trig="notApproval($event)"
            class="w3-right"
            secondary
        />
        <!-- Button to switch between view by supervisor or by periode -->
        <Button 
            class="w3-right" 
            primary 
            :value="viewByPeriode ? 'View By Supervisors' : 'View by periode'" 
            type="button" 
            @trig="viewByPeriode = !viewByPeriode" 
        />

		<Datatable
           v-if="renderTable"
          :datanya="lists"
          :heads="viewByPeriode ? ['Gudang', 'Nama', 'Periode', 'Shift', 'Kabag'] : ['Gudang', 'Nama']"
          :keys="viewByPeriode ? ['warehouseName', 'spvName', 'periode2', 'shift', 'headName'] : ['warehouseName', 'spvName']"
          option
          :id="viewByPeriode ? 'uncollectedByPeriode' : 'uncollectedBySpv'"
        >

                <template #th v-if="!viewByPeriode">
                    <th>Daftar periode</th>
                </template>

                <template #td="{ obj }" v-if="!viewByPeriode">
                    <td>
                        <DocumentOptions 
                            v-for="doc in obj.documents" :key="doc?.spvId"
                            class="w3-small"
                            isPrimary
                            @clicked="check({ day: $event, rec: doc.id })"
                            :isFull="true"
                            :value="doc.periode2 + ' ' +doc.warehouseName"
                        />
                    </td>
                </template>

				<template #default="{ prop }">
					<Button
                        small
                        v-if="!viewByPeriode"
                        secondary
                        value="Pesan" 
                        datanya="tes" 
                        type="button" 
                        @trig="pesan(prop)" 
					/>
                    
                    <DocumentOptions 
                        v-if="viewByPeriode"
                        class="w3-small"
                        isPrimary
                        @clicked="collect({ day: $event, rec: prop.id })"
                        :isFull="true"
                        value="Collected"
                    />

                    <Button
                         v-if="viewByPeriode"
                        small
                        secondary
                        value="Edit" 
                        datanya="tes" 
                        type="button" 
                        @trig="edit(prop.id)" 
					/>
                </template>
        
        </Datatable>
</div>
</template>

<script>

import Button from "@/components/elements/Button.vue"
import Datatable from "@/components/parts/Datatable.vue"
import Dropdown from "@/components/elements/Dropdown.vue"
import { ref, onBeforeMount, watch } from "vue"
import { useStore } from "vuex"
import { lists as listsHeadSPV } from '@/composable/components/Headspv'
import { subscribeMutation } from "@/composable/piece/subscribeMutation"
import { 
    getUncollectedDocuments, 
    listsOfDocuments, 
    documentsBySupervisor,
    documentMore2DaysBySpv,
    allDocumentMore2Days,
    collectDocument,
    ijinDocument,
    kosongDocument,
} from "@/composable/components/DocumentsPeriod"
import { lists as listsSupervisor } from '@/composable/components/Supervisors'
import DocumentOptions from "@/components/parts/DocumentOptions.vue"
import { dateMonth, dayPlusOrMinus } from "@/composable/piece/dateFormat"

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
            let messageText = await allDocumentMore2Days()

            window.open(`https://wa.me/${ev}?text=${messageText}`)
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
            if(!isNaN(ev.day)) {
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

        watch([mode, viewByPeriode], () => {
            renewLists()
        })
        
        const collect = async (ev) => {
            if(Number(ev.day) < 1) {
                await collectDocument(ev.rec, Number(ev.day))
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
                    if(mode.value == 'Uncollected') {
                        await getUncollectedDocuments()
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
            headSPVLists, notApproval, collect, mode, renderTable
        }
    },
}
</script>