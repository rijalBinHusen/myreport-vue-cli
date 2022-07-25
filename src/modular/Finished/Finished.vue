<template>
<div class="">

    <div class="w3-border w3-padding w3-container">
        <input
            class="w3-hide"
            @change.prevent="readExcel($event)"
            type="file"
            ref="importerBase"
            accept=".xls, .ods"
        />
        <label for="periode">Set record to show : </label>
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
        <Button primary v-if="grouped.length" class="w3-right" value="Export Weekly report" type="button" @trig="exportReportWeekly" />
    </div>

    <Datatable
        :datanya="lists"
        :heads="['Periode', 'Nama', 'Gudang', 'Shift', 'Finished']"
        :keys="['periode2', 'spvName', 'warehouseName', 'shift', 'finished2']"
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

export default {
    name: "Finished",
    data() {
        return {
            grouped: [],
            groupedObject: [],
            unfinished: false,
        };
    },
    components: {
        Button,
        Datatable,
    },
    methods: {
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
        async exportReportWeekly() {
            // Open loader
            this.$store.commit("Modal/active", {judul: "", form: "Loader"});
            // group dulu yang spv dan periode yang sama
            /* expected object = [
                [{ baseReport }, { baseReport }],
                [{ baseReport }, { baseReport }],
                [{ baseReport }, { baseReport }],
            ]
            */
           if(!this.groupedObject.length) {
               return
           }
           let group = []
        //   grouped { spv: index } //seperate by name
           let grouped = {}
           this.groupedObject.forEach((val) => {
            //    if the object was grouped, and else
               if(grouped.hasOwnProperty(val?.name)) {
                // //    console.log("ada sama")
                //    console.log(val.name+val.periode)
                //    console.log(grouped[val?.name+val?.periode])
                   group[grouped[val.name]].push({ ...val })
               } else {
                   grouped[val.name] = group.length
                   group.push([{ ...val }])
                // console.log(grouped)
                // console.log("tidak sama")
               }
           })
        //    console.log(group)
        await exportWeeklyReportToExcel(group)
        this.$store.commit("Modal/active");
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
            this.$store.commit("Modal/active", { judul: "Set record to show", form: "PeriodePicker", store: "Document", btnValue: "Show"});
        },
		details(ev) {
            this.$store.commit("Modal/active", { judul: "Set record to show", form: "FinishedForm", data: ev});
		},
        share(ev){
            // exportDailyReport()
            // this.$refs.importerBase.click();
            // // console.log(ev)
            // let record = this.$store.getters["Document/getId"](ev)
            // //set shared to true with date
            // record.shared = this.$store.getters["dateFormat"]({format: "time"})
            // // value = {store: 'nameOfStore', obj: {id: idOfDocument, object: 'to append to indexeddb'} }
            // this.$store.dispatch("update", {
            //                 store: "Document",
            //                 obj: record,
            //                 criteria: { id: ev }
            //             })
            console.log(ev)
        },
        readExcel(e) {
			// const file = e.target.files[0]
        }
    },
    computed: {
        lists() {
            return this.unfinished ? this.$store.getters["Document/unfinished"] : this.$store.getters["Document/finished"]
        }
    },
    mounted() {
        this.$store.dispatch("Document/getDocumentByStatusFromDB");
    }
}
</script>