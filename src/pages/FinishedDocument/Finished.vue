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

        <div v-if="renderTable && lists.length" >
        
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

            
            <Dropdown
                value="Annaunce"  
                :lists="headSPVLists"
                listsKey="phone"
                listsValue="name"
                @trig="annunceMessage($event)"
                class="w3-right"
                secondary
            />

            <Button primary class="w3-right" :value="grouped.length ? 'Unmark all' :'Mark all'" type="button" @trig="markAll"/>
            
        </div>
    </div>

    <Datatable
        v-if="renderTable && lists.length"
        :datanya="unfinished ? unFinishedDocument : FinishedDocument"
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
import { Documents, lists, announceReport } from '@/pages/Documents/DocumentsPeriod'
import { subscribeMutation } from "@/composable/piece/subscribeMutation"
import { ref, onMounted, watch, computed } from "vue"
import { useStore } from "vuex"
import { getWarehouseById } from "@/pages/Warehouses/Warehouses"
import { headspvEnabled } from "../Headspv/Headspv"

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
        const renderTable = ref(true)

        const { getDocuments,  } = Documents();

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

        const unFinishedDocument = computed(() => lists.value.filter((rec) => !rec?.isfinished));
        const FinishedDocument = computed(() => lists.value.filter((rec) => rec?.isfinished));
        
        const renewLists = async () => {
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
                    let warehouse = getWarehouseById(val.warehouse)
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

        const headSPVLists = computed(() => headspvEnabled());

        async function annunceMessage (phone) {
            const message = announceReport();

            if(typeof message.length === 0) return;

            for (let msg of message) {

                const prom = await subscribeMutation(
                                        "", 
                                        "Confirm",
                                        { pesan: `Kamu akan mengirim pesan kepada ${msg.phone}`},
                                        'Modal/tunnelMessage'
                                        )
    
                if(prom) {
    
                    if(typeof msg.phone === 'string' && msg.phone.length > 10) {

                        window.open(`https://wa.me/${msg.phone}?text=${msg.message}`);
                    } else {
                        
                        window.open(`https://wa.me/${phone}?text=${msg.message}`);
                    }
                }
            }
        }

        return { 
            unfinished, lists, renderTable, 
            markAll, push, pickPeriode, details, 
            exportReport, grouped, FinishedDocument, unFinishedDocument, headSPVLists, annunceMessage
        }
		
    },
}
</script>@/pages/Documents/DocumentsPeriod