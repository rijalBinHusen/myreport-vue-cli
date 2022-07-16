<template>
<div class="">
    <div class="w3-border w3-padding w3-container">
        <label>Set record to show : </label>
        <Button primary value="Set" type="button" @trig="approvalForm" />
        <Button primary class="w3-right" v-if="grouped.length" value="Export all" type="button" @trig="exportReportAll" />
    </div>

            <Datatable
                :datanya="lists"
                :heads="['Nama', 'Gudang', 'Periode', 'Collected', 'Kabag', 'Approve']"
                :keys="['spvName', 'warehouseName', 'periode2', 'collected2', 'headName', 'approval2']"
                option
                id="tableApproval"
            >
                <template #default="{ prop }">
				<span v-if="prop.shared == 'false' || !prop.shared ">
                    <Button 
                        value="Batal" 
                        type="button" 
                        danger small 
                        @trig="handleAction({ action: 'unapprove', rec: prop.id })" 
                    />
                    
                    <Button 
                        value="Share" 
                        type="button" 
                        primary small 
                        @trig="handleAction({ action: 'share', rec: prop.id })" 
                    />

                </span>
                <span v-else>
                    {{
                    !isNaN(prop.shared)
                     ? "Shared at "+ this.$store.getters["dateFormat"](
                         { 
                            format: "dateMonth", 
                            time: prop.shared 
                         }) 
                    : prop.shared
                 }}
                </span>
                <Button 
                    v-if="!isNaN(prop.isfinished) && !isNaN(prop.collected) && prop?.baseReportFile"
                    value="Export" 
                    type="button" 
                    secondary small 
                    @trig="exportReport(prop)" 
                />
                </template>
                <template #th>
                    <th>Export group</th>
                </template>
                <template #td="{ obj }">
                    <input :id="obj.id" v-model="grouped" :value="obj.id" @input="push(obj.id, obj)" type="checkbox" />
                    <label :for="obj.id"> Group</label>
                    <br />
                </template>
            </Datatable>
			<!-- </table> -->
			
        </div>
</template>

<script>
import exportDailyReport from "../../excelReport/DailyReport"
import exportDailyReportGroup from "../../excelReport/DailyReportGroup"
import Button from "../../components/elements/Button.vue"
import Datatable from "../../components/parts/Datatable.vue"
import Input from '@/components/elements/Input.vue'

export default {
    name: "Collect",
    data() {
        return {
            lists: [],
            unsubscribe: "",
            timeOut: "",
            grouped: [],
            groupedObject: [],
        };
    },
    components: {
        Button,
        Datatable,
        Input,
    },
    methods: {
        async exportReportAll() {
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
        //   grouped { spvperiode: index }
           let grouped = {}
           this.groupedObject.forEach((val) => {
            //    if(!val?.shared) {
            //        this.handleAction({ action: 'share', rec: val?.id })
            //    }
            //    if the object was grouped, and else
               if(grouped.hasOwnProperty(val?.name+val?.periode)) {
                // //    console.log("ada sama")
                //    console.log(val.name+val.periode)
                //    console.log(grouped[val?.name+val?.periode])
                   group[grouped[val.name+val.periode]].push({ ...val })
               } else {
                   grouped[val.name+val.periode] = group.length
                   group.push([{ ...val }])
                // console.log(grouped)
                // console.log("tidak sama")
               }
           })
        //    console.log(group)
            // // iterate semua yang sudah digroup
            for (let i =0; i < group.length; i++ ) {
                // console.log(group[i])
                if(group[i].length > 1) {
                    await exportDailyReportGroup(group[i])
                }   else {
                    await exportDailyReport(group[i][0])
                }
            }
            // empty the grouped
            this.groupedObject = []
            this.grouped = []
            // Close loader
            this.$store.commit("Modal/active");
        },
        async exportReport(obj) {
            // Open loader
            this.$store.commit("Modal/active", {judul: "", form: "Loader"});
            // wating for process
            await exportDailyReport({ ...obj })
            // close loader
            this.$store.commit("Modal/active");
        },
        approvalForm() {
            this.$store.commit("Modal/active", { 
                judul: "Set record to show", 
                form: "ApprovalForm"
            });
        },
        handleAction(ev) {
            // EV =  {action: 'approve', val: -1, rec: doc22050003}
            this.$store.dispatch("Document/handleDocument", ev)
        },
        renewLists() {
                this.lists = this.$store.getters["Document/documentByStatus"](2)
        },
        push(id, obj) {
            // if the id is exists,
            if(this.grouped.includes(id)) {
                this.groupedObject = this.groupedObject.filter(val => val.id != id)
                return
            } 
            // else
            this.groupedObject.push({ ...obj })
        }
    },
    async mounted() {
        await await this.$store.dispatch("Document/getDocumentByStatusFromDB", "approval")
        this.$store.dispatch("Baseitem/getAllItem");
        this.renewLists()
    // subscribe the mutation,, and renew lists when data updated
        this.unsubscribe = this.$store.subscribe((mutation) => {
            // jika document ada yang di update
            if (mutation.type === 'Document/append') {
                clearTimeout(this.timeOut)
                this.timeOut = setTimeout( () => {
                    this.renewLists()
                } , 1500 )
            }
            else if (mutation.type === 'Document/update') {
                this.renewLists()
            }
        });
    },
    beforeUnmount() {
        this.unsubscribe();
    },
}
</script>