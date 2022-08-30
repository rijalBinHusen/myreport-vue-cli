<template>
<div class="">

    <div class="w3-border w3-padding w3-container">
        <Button 
            id="periode"
            class="w3-col s2 w3-right" 
            primary 
            value="Set periode" 
            type="button" 
            @trig="pickPeriode" 
        />
        <Button primary class="w3-right" :value=" unfinished ? 'Finished' : 'Unfinished'" type="button" @trig="unfinished = !unfinished"/>
        <Button primary class="w3-right" :value="grouped.length ? 'Unmark all' :'Mark all'" type="button" @trig="markAll"/>
        
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
    </div>

    <Datatable
        :datanya="lists"
        :heads="['Periode', 'Nama', 'Kabag', 'Shift']"
        :keys="['periode2', 'spvName', 'headName', 'shift']"
        option
        id="tableFinished"
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
import Button from "../../components/elements/Button.vue"
import Datatable from "../../components/parts/Datatable.vue"
import exportWeeklyReportToExcel from "../../excelReport/WeeklyReport"
import exportWeeklyKabag from "../../excelReport/WeeklyKabag"
import WeeklyWarehouses from "../../excelReport/WeeklyReportWarehouses"
import Dropdown from "../../components/elements/Dropdown.vue"
import { getDocuments } from '../../composable/components/DocumentsPeriod'
import { listsOfDocuments } from '../../composable/components/DocumentsPeriod'

export default {
    name: "Finished",
    data() {
        return {
            grouped: [],
            groupedObject: [],
            unfinished: false,
            lists: [],
        };
    },
    components: {
        Button,
        Datatable,
        Dropdown,
    },
    methods: {
        async exportReport(ev) {
            // Open loader
            this.$store.commit("Modal/active", {judul: "", form: "Loader"});
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
           this.groupedObject.forEach((val) => {
            //    if the object was grouped, and else
               if(grouped.hasOwnProperty(val[ev])) {
                   group[grouped[val[ev]]].push({ ...val })
               } else {
                    if('warehouse' && ["jabon", "biscuit"].includes(val?.warehouseName)) {
                    // if('warehouse' && (val?.warehouseName.includes("jabon") || val?.warehouseName.includes("biscuit"))) {
                        grouped["WHS22050004"] = group.length
                        grouped["WHS22050005"] = group.length
                    } 
                    else if('warehouse' && (val?.warehouseName.includes("chip") || val?.warehouseName.includes("Hall"))) {
                        grouped["war22060000"] = group.length
                        grouped["WHS22050001"] = group.length
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
        this.$store.commit("Modal/active");
        
        },
        markAll() {
            if(this.grouped.length) {
                this.grouped = []
                this.groupedObject = []
                return
            }
            this.$store.getters["Document/finished"].forEach((val) => {
                if(val.isfinished) {
                    this.grouped.push(val.id)
                    this.groupedObject.push(val)
                }
            })
        },
        push(id, obj) {
            // if the id is exists,
            if(this.grouped.includes(id)) {
                this.groupedObject = this.groupedObject.filter(val => val.id != id)
                return
            } 
            // else
            this.groupedObject.push({ ...obj })
        },
        pickPeriode() {
            let unsubscribe;
            this.$store.commit("Modal/active", { 
                judul: "Set periode to show", 
                form: "PeriodePicker", 
                store: false, 
                btnValue: "Show",
                tunnelMessage: true,
            });

            const promise = new Promise (resolve => {
                unsubscribe = this.$store.subscribe(mutation => {
                    if (mutation.type === 'Modal/tunnelMessage') {
                        //get the payload that send to tunnel message
                    resolve(mutation?.payload)
                    }
                })
            })
            
            promise.then(async val => {
                //open the loader
                this.$store.commit("Modal/active", {judul: "", form: "Loader"})
                // wait the process
                await getDocuments(val?.periode1, val?.periode2)
                //unsubscribe the mutation
                unsubscribe()
                //close the loader
                this.$store.commit("Modal/active")
                this.renewLists()
            })
        },
        async renewLists() {
            this.lists = await listsOfDocuments()
        },
		details(ev) {
            this.$store.commit("Modal/active", { judul: "Set record to show", form: "FinishedForm", data: ev});
		},
    },
}
</script>