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
        <Button primary class="w3-right" :value=" unfinished ? 'Finished' : 'Unfinished'" type="button" @trig="unfinished = !unfinished"/>
        
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

    <Datatable
        v-if="renderTable && lists"
        :datanya="lists"
        :heads="['Periode', 'Nama', 'Kabag', 'Shift']"
        :keys="['periode2', 'spvName', 'headName', 'shift']"
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

        const exportReport = async (ev) => {
            // Open loader
            store.commit("Modal/active", {judul: "", form: "Loader"});
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
        // console.log(group)

        store.commit("Modal/active");
        
        }

        return { 
            unfinished, lists, renderTable, 
            markAll, push, pickPeriode, details, 
            exportReport, grouped
        }
		
    },
}
</script>