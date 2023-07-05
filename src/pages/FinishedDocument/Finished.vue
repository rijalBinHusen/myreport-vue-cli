<template>
<div class="">

    <div class="w3-border w3-padding w3-container">
        
        <Button
            class="w3-col s2 w3-right" 
            primary 
            value="Set periode" 
            type="button" 
            @trig="pickPeriode" 
        />

        <div v-if="renderTable && lists" >
        
            <Button primary class="w3-right"  :value=" unfinished ? 'Finished' : 'Unfinished'" type="button" @trig="unfinished = !unfinished"/>

            <!-- <Button primary class="w3-right"  value="Broadcast message" type="button" @trig="broadcastDocument"/> -->
            
            <Dropdown
            value="Report"
            :lists="[
                { id: 'name', isi: 'SPV Weekly'},
                { id: 'head', isi: 'Kabag Weekly'},
                { id: 'warehouse', isi: 'Warehouses Weekly'},
            ]"
            listsKey="id"
            listsValue="isi"
            class="w3-right"
            @trig="exportReport"
            primary
            />

            <Button primary class="w3-right" :value="grouped.length ? 'Unmark all' :'Mark all'" type="button" @trig="markAll"/>
            
        </div>
    </div>

    <Datatable
        v-if="renderTable && lists"
        :datanya="lists"
        :heads="['Periode', 'Nama', 'Gudang', 'Kabag', 'Shift']"
        :keys="['periode2', 'spvName', 'warehouseName', 'headName', 'shift']"
        option
        :id="unfinished ? 'unfinishedTable' : 'tableFinished'"
    >
        <template #default="{ prop }">
            <!-- lihat info detail -->
            <Button value="Details" type="button" secondary small @trig="details(prop)"/>
            <!-- share detail -->
            <!-- <Button v-if="prop?.isfinished" @trig="share(prop)" value="Share" type="button" primary small/> -->
        </template>
        <!-- checkbox -->
        <template #th>
            <th>Mark</th>
        </template>
        <template #td="{ obj }">
            <span  v-if="obj?.isfinished">
                <input :id="obj.id" v-model="grouped" :value="obj.id" @input="push(obj.id, obj)" type="checkbox" />
                <label :for="obj.id"> Mark</label>
            </span>
            <p v-else>Unfinish</p>
        </template>
        <!-- chekcbox -->
        
        
    </Datatable>
    <!-- </table> -->
			
</div>
</template>

<script>
import Button from "@/components/elements/Button.vue"
import Datatable from "@/components/parts/Datatable.vue"
import exportWeeklyReportToExcel from "@/excelReport/WeeklyReport"
import exportWeeklyKabag from "@/excelReport/WeeklyKabag"
import WeeklyWarehouses from "@/excelReport/WeeklyReportWarehouses"
import Dropdown from "@/components/elements/Dropdown.vue"
import { finishedDocument, getDocuments, unFinishedDocument } from '@/composable/components/DocumentsPeriod'
import { getSupervisorId } from '@/composable/components/Supervisors'
import { subscribeMutation } from "@/composable/piece/subscribeMutation"
import { ref, onMounted, watch } from "vue"
import { useStore } from "vuex"
import { warehouseId } from "@/composable/components/Warehouses"

export default {
    components: {
        Button,
        Datatable,
        Dropdown,
    },
    setup() {
        const store = useStore()
        const grouped = ref([])
        const groupedObject = ref([])
        const unfinished = ref(false)
        const lists = ref([])
        const renderTable = ref(true)

        const markAll = () => {
            if(grouped.value.length) {
                grouped.value = []
                groupedObject.value = []
                return
            }
            lists.value.forEach((val) => {
                if(val.isfinished) {
                    grouped.value.push(val.id)
                    groupedObject.value.push(val)
                }
            })
        }
        
        const push = (id, obj) => {
            // if the id is exists,
            if(grouped.value.includes(id)) {
                groupedObject.value = groupedObject.value.filter(val => val.id != id)
                return
            } 
            // else
            groupedObject.value.push({ ...obj })
        }

        const pickPeriode = async () => {
            let periode = await subscribeMutation("Set periode to show", "PeriodePicker",  false, 'Modal/tunnelMessage')
            
            if(periode) {
                //open the loader
                store.commit("Modal/active", {judul: "", form: "Loader"})
                // wait the process
                await getDocuments(periode?.periode1, periode?.periode2)
                //close the loader
                store.commit("Modal/active")
                renewLists()
            }
        }
        
        const renewLists = async () => {
            if(unfinished.value) {
                lists.value = await unFinishedDocument() 
            } else {
                lists.value = await finishedDocument()
            }
            groupedObject.value.length = 0
            grouped.value.length =  0
        }

        const details = async (ev) => {
            let res = await subscribeMutation(
                "Details document", "FinishedForm", ev, 'Modal/tunnelMessage'
            )
            if(res) {
                renewLists()
            }
		}

        watch([unfinished], () => {
            renderTable.value = false
            setTimeout(() => {
                renderTable.value = true
            }, 600)
            renewLists()
        })

        onMounted(() => {
            renewLists()
        })

        const groupingDocument = async (ev) => {
            if(!groupedObject.value.length) {
                await subscribeMutation('Peringatan', 'Confirm', { pesan: 'Tidak ada document yang akan dibroadcast!', isAlert: true }, 'Modal/tunnelMessage')
                return
            }
            // group dulu yang spv dan periode yang sama
            /* expected object = [
                [{ baseReport }, { baseReport }],
                [{ baseReport }, { baseReport }],
                [{ baseReport }, { baseReport }],
            ]
            */
           let group = []
            //   grouped { spv: index } //seperate by name
           let grouped = {}
           groupedObject.value.forEach((val) => {
            //    if the object was grouped, and else
                if(grouped.hasOwnProperty(val[ev])) {
                    group[grouped[val[ev]]].push({ ...val })
                } else {
                    let warehouse = warehouseId(val.warehouse)
                    if(warehouse?.group) {
                    // if('namaGudang' && (val?.namaGudang.includes("jabon") || val?.namaGudang.includes("biscuit"))) {
                        grouped[val.warehouse] = group.length
                        grouped[warehouse?.group] = group.length
                    } 
                    else {
                        grouped[val.warehouse] = group.length
                    }
                    grouped[val[ev]] = group.length
                    group.push([{ ...val }])
                }
           })
           return group
        }

        const exportReport = async (ev) => {
            // Open loader
            store.commit("Modal/active", {judul: "", form: "Loader"});

            let group = await groupingDocument(ev)
                
            // export report weekly by spv
            if(ev == 'name') {
                await exportWeeklyReportToExcel(group)
            }
            // export report weekly by head
            else if(ev == 'head') {
                await exportWeeklyKabag(group)
            }
            // export report weekly by warehouse
            else {
                await WeeklyWarehouses(group)
            }

            store.commit("Modal/active");
        }

        // const mappingResult = (arrayOfDocument) => {
        //     // expected result
        //     // 12 Oktober:
        //     // Total produk masuk
        //     return arrayOfDocument.map((doc) => ([
        //         `Periode ${doc.periode2} ${doc.warehouseName}:%0a%0a`,
        //         // Point 1
        //         // Total produk masuk gudang
        //         `Total produk masuk gudang: ${doc.totalQTYIn} Karton%0a`,
        //         // Total item yang moving
        //         `Total item yang bergerak: ${doc.totalItemMoving} item%0a`,
        //         // jumlah item yang terdapat variance
        //         `Total item yang terdapat variance: ${doc.itemVariance} item%0a`,
        //         // Pencapaian = (item moving - item variance) / item moving
        //         `Pencapaian: *${((doc.totalItemMoving - doc.itemVariance) / doc.totalItemMoving) * 100}%*%0a%0a`,
        //         // End of Point 1
        
        //         // Point 2
        //         // Total item yang keluar
        //         `Total item yang keluar: ${doc.totalItemKeluar} Karton%0a`,
        //         // Total item yang tidak FIFO
        //         `Total item yang tidak FIFO: ${doc.totalProductNotFIFO} item%0a`,
        //         // Pencapaian = ( item keluar - item tidak fifo) / item keluar
        //         `Pencapaian: *${((doc.totalItemKeluar - doc.totalProductNotFIFO) / doc.totalItemKeluar) * 100}%*%0a%0a`,
        //         // End of point 2
                
        //         // Point 3
        //         // Total DO
        //         `Total DO: ${doc.totalDo} DO%0a`,
        //         // Total Produk keluar pada DO
        //         `Total produk keluar pada DO: ${doc.totalQTYOut} Karton%0a`,
        //         // Total produk yang termuat
        //         `Total produk yang termuat: ${doc.totalQTYOut - doc.planOut} Karton%0a`,
        //         // Pencapaian Total DO yang termuat = 100%
        //         `Pencapaian total DO yang termuat: *100%*`,
        //         // Pencapaian jumlah produk termuat = produk termuat / total produk diDO
        //         `Pencapaian total kuantity produk yang termuat: ${((doc.totalQTYOut - doc.planOut) / doc.totalQTYOut) * 100}%%0a%0a`,
        //         // End of point 3
        
        //         // point 4
        //         // Standart waktu muat
        //         `Standart waktu muat: ${(doc.totalQTYOut - doc.planOut) / 10} Menit%0a`,
        //         // Realisasi waktu muat
        //         `Realisasi waktu muat: ${ doc.totalWaktu } Menit%0a`,
        //         // Pencapaian = Realisasi waktu muat < (produk termuat / 10) ? ok : not ok
        //         `Pencapaian: ${ doc.totalWaktu < ((doc.totalQTYOut - doc.planOut) / 10 ) ? 'Oke' : 'Not oke'}`
        //         // End of point 4
        
        //         // Total komplain customer
        //     ])).join('%0a%0a')

        // }

        // const broadcastDocument = async () => {
        //     // grouping document
        //     let group = await groupingDocument('name')
        //     // map the group then map the document
        //     if(!group) { return }
        //     for(let docs of group) {
        //         let res = mappingResult(docs)
        //         let confirm = await subscribeMutation('Peringatan', 'Confirm', { pesan: `Anda akan mengirim pesan kepada ${docs[0]?.spvName}` }, 'Modal/tunnelMessage')
        //         if(confirm) {
        //             // get supervisor info
        //             let supervisor = await getSupervisorId(docs[0]?.name)
        //             // send message
        //             window.open(`https://wa.me/${supervisor.phone}?text=${res}`)
        //             // console.log(supervisor)
        //         }

        //     }
        //     console.log(group)
        // }

        return { 
            unfinished, lists, renderTable, 
            markAll, push, pickPeriode, details, 
            exportReport, grouped, 
            // broadcastDocument
        }
		
    },
}
</script>@/pages/Documents/DocumentsPeriod