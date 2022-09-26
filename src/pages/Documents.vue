<template>
<div class="w3-container w3-margin-top">

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

        <Button class="w3-right" primary value="+ Periode" type="button" @trig="addPeriod" />

        <Dropdown
            value="Message to all"  
            :lists="headSPVLists"
            listsKey="phone"
            listsValue="name"
            @trig="oneClickMessageToAll($event)"
            class="w3-right"
            secondary
        />

        <Dropdown
            value="Belum approval"  
            :lists="headSPVLists"
            listsKey="phone"
            listsValue="name"
            @trig="notApproval($event)"
            class="w3-right"
            secondary
        />

        <Button 
            class="w3-right" 
            primary 
            :value="viewByPeriode ? 'View By Supervisors' : 'View by periode'" 
            type="button" 
            @trig="viewByPeriode = !viewByPeriode" 
        />

		<Datatable
          :datanya="lists"
          :heads="viewByPeriode ? ['Gudang', 'Nama', 'Periode', 'Shift', 'Kabag'] : ['Gudang', 'Nama']"
          :keys="viewByPeriode ? ['warehouseName', 'spvName', 'periode2', 'shift', 'headName'] : ['warehouseName', 'name']"
          option
          :id="viewByPeriode ? 'uncollectedByPeriode' : 'uncollectedBySpv'"
        >

                <template #th v-if="!viewByPeriode">
                    <th>Daftar periode</th>
                </template>

                <template #td="{ obj }" v-if="!viewByPeriode">
                    <td>
                        <Dropdown
                            v-for="doc in obj.documents" :key="doc?.id"
                            :value="doc?.periode2+' | '+doc?.warehouseName.replace('Gudang jadi ', '')"  
                            :lists="[
                                { id: -1, isi: '-1 Hari'},
                                { id: -2, isi: '-2 Hari'},
                                { id: -3, isi: '-3 Hari'},
                                { id: 0, isi: '0 Hari' }
                            ]"
                            listsKey="id"
                            listsValue="isi"
                            @trig="check({val: $event, id: doc?.id})"
                            class="w3-small"
                            primary
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
                    
                    <Dropdown
                        v-if="viewByPeriode"
                        value="Collect"  
                        :lists="[
                            { id: -1, isi: '-1 Hari'},
                            { id: -2, isi: '-2 Hari'},
                            { id: -3, isi: '-3 Hari'},
                            { id: 0, isi: '0 Hari' },
                            { id: 'ijin', isi: 'Tidak masuk'},
                            { id: 'kosong', isi: 'Laporan tidak ada'},
                        ]"
                        listsKey="id"
                        listsValue="isi"
                        @trig="collect({ action: 'collect', val: $event, rec: prop.id })"
                        class="w3-small"
                        primary
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
import { getUncollectedDocuments, listsOfDocuments } from "@/composable/components/DocumentsPeriod"

export default {
    setup() {
        const store = useStore()
        const viewByPeriode = ref(true)
        const lists = ref([])
        const headSPVLists = ref([])
        const mode = ref('Uncollected')

        const oneClickMessageToAll = async (ev) => {
            // ambil dulu semua karu
            let allKaru = store.state.Supervisors.lists
            // iterate semua karu untuk kirim pesan
            for (let ind in allKaru) {
                // dapatkan dokumen yang lebih dari 2 hari
                let listLaporan = store.getters["Document/documentMore2DaysBySpv"](allKaru[ind]?.id)
                // jika ada dokumen yang lebih dari 2 hari
                if(Object.keys(listLaporan).length && allKaru[ind]?.phone) {
                    // variable untuk menampung subscribe
                    let unsubscribe;
                    // promise 
                    const prom = new Promise(resolve => {
                        // luncurkan dialog
                        store.commit("Modal/active", {
                            judul: "", 
                            form: "Confirm",
                            pesan: `Kamu akan mengirim pesan kepada ${allKaru[ind]?.name}`
                        })
                        // subscribe untuk tanggkap confirm dialog apakah yes atau tidak
                        unsubscribe = store.subscribe(mutation => {
                            // if the confirmation button clicked whatever yes or no
                            if(mutation?.type == 'Modal/tunnelMessage') {
                                // resolve the messaage, true or false
                                resolve(mutation?.payload)
                            }
                        })
                    })
                    // jika oke kirim pesan
                    await prom.then(confirm => {
                        unsubscribe()
                        if(confirm) {
                            // call the pesan function
                            pesan(allKaru[ind], listLaporan)
                        }
                        store.commit("Modal/active")
                    })
                }
                // ke pesan selanjutnya
            }
            pesanSemua(ev)
        }

        const pesan = (ev, listsLaporan) => {
            if(!listsLaporan) {
                listsLaporan = store.getters["Document/documentMore2DaysBySpv"](ev?.id)
            }
            let listLaporanText = ""
            Object.keys(listsLaporan).forEach((val) => {
                listLaporanText += `${listsLaporan[val].join(", ")}`
                listLaporanText += ` | ${store.getters["Warehouses/warehouseId"](val)?.name}%0a`
            })
            // jika ada laporan yang H+2 lapor kirim, buka link jika tidak ada tampilkan alert
            let pesan = `*Tidak perlu dibalas*%0a%0aMohon maaf mengganggu bapak ${ev.name},%0aberikut kami informasikan daftar laporan yang belum dikumpulkan yaitu:%0a%0a${listLaporanText}%0amohon untuk dikumpulkan tidak lebih dari H%2b2.%0aTerimakasih atas perhatianya.`

                window.open(`https://wa.me/${ev.phone}?text=${pesan}`)
                // shell.openExternal(`https://wa.me/${ev.phone}?text=${pesan}`)
                //  console.log(pesan)
        }

        const pesanSemua = (ev) => {
            // let nophone = window.prompt()
            if(!ev){ return }
            let result = `*Tidak perlu dibalas*%0a%0aBerikut kami kirimkan daftar laporan yang belum dikumpulkan pada ${store.getters["dateFormat"]({format: "full"})}:%0a%0a`
            // get document by spv and iterate, document by spv yang >= H+2
            store.getters["Document/documentBySpv"](0).forEach((val) => {
                if(val.documents) {
                // daftar laporan yang melebihi H+2 dari sekarang
                let sekarang = new Date().getTime()
                let listLaporan = []
                val.documents.forEach((val) => {
                    if(sekarang - val.periode >= 172800000 ) {
                        listLaporan.push(`${val.periode2} | ${val?.warehouseName}%0a`)
                    }
                })
                if(listLaporan.length > 0)
                    result += `*${val.name} (${listLaporan.length} Dokumen)* :%0a${ listLaporan.join("") }%0a`
                }
            })

            window.open(`https://wa.me/${ev}?text=${result}`)
            // console.log(result)
        }

        const edit = (ev) => {
            console.log(ev)
         //   this.$store.commit("Modal/active", {
        //         judul: "Edit record", 
        //         form: "UncollectedEditForm",
        //         id: ev,
        //         mode: "edit"
        }

        const check = (ev) => {
            console.log('check')
                    //     this.$store.commit("Modal/active", {
        //         judul: `Report collected at ${
        //             this.GET_DATEFORMAT({format: "dateMonth", time: this.GET_DATEFORMAT({format: ev.val})})
        //         }`, 
        //         form: "UncollectedEditForm",
        //         id: ev.id,
        //         mode: "edit",
        //         time: ev.val,
        //         next: "collect"
        //     });
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
            renewLists()
        })

        watch([mode], (newVal) => {
            mode.value = newVal[0]
        })
        
        const collect = (ev) => {
            // EV =  {action: 'approve', val: -1, rec: doc22050003}
            // if(isNaN(ev.val)) {
            //     this.$store.dispatch("Document/handleDocument", { action: ev.val, rec: ev.rec })
            //     return
            // }
            //     this.$store.dispatch("Document/handleDocument", ev)
            console.log(ev)
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
        
        const renewLists = async () => {
                mode.value == 'Uncollected'
                    ? await getUncollectedDocuments()
                    : false
                
                lists.value = await listsOfDocuments()
            }
        return { 
            oneClickMessageToAll, pesan, pesanSemua, 
            viewByPeriode, lists, edit, check, addPeriod,
            headSPVLists, notApproval, collect, mode
        }
    },
    components: {
        Button,
        Datatable,
        Dropdown
    },
}
</script>