<template>
<div class="">
    <div class="w3-border w3-padding w3-container">
        <label>Set record to show : </label>
        <Button primary value="Set" type="button" @trig="approvalForm" />
        <Button primary class="w3-right" :value="grouped.length ? 'Unmark all' :'Mark all'" type="button" @trig="markAll"/>
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
                    <Dropdown
                        :value="prop?.shared ? 
                                `${$store.getters['dateFormat']({format: 'dateMonth', time: prop.shared})} Shared` 
                                :'Options'"  
                        :lists="dropDownOptions(prop)"
                        listsKey="id"
                        listsValue="isi"
                        @trig="handleAction({action: $event, rec: prop?.id})"
                        class="w3-small"
                        :danger="!!prop?.shared"
                        :primary="!!!prop?.shared"
                    />
                </template>
                <template #th>
                    <th>Export group</th>
                </template>
                <template #td="{ obj }">
                    <span v-if="obj.isfinished">
                        <input :id="obj.id" v-model="grouped" :value="obj.id" @input="push(obj.id, obj)" type="checkbox" />
                        <label :for="obj.id"> Group</label>
                    </span>
                    <p v-else>Unfinished</p>
                </template>
            </Datatable>
			<!-- </table> -->
			
        </div>
</template>

<script>
import exportDailyReport from "../../excelReport/DailyReport"
import exportDailyReportGroup from "../../excelReport/DailyReportGroup"
import Button from "../../components/elements/Button.vue"
import Dropdown from "../../components/elements/Dropdown.vue"
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
        Dropdown,
    },
    methods: {
        markAll() {
            if(this.grouped.length) {
                this.grouped = []
                this.groupedObject = []
                return
            }
            this.lists.forEach((val) => {
                    this.grouped.push(val.id)
                    this.groupedObject.push(val)
            })
        },
        dropDownOptions(prop) {
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
        },
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
               if(!val?.shared) {
                   this.handleAction({ action: 'share', rec: val?.id })
               }
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
        async exportReport(ev) {
            // Open loader
            this.$store.commit("Modal/active", {judul: "", form: "Loader"});
            let record = JSON.parse(JSON.stringify(this.lists)).find((val) => val?.id == ev)
            // wating for process
            await exportDailyReport(record)
            // set document as shared
            if(!record?.shared) {
                this.handleAction({ action: 'share', rec: ev })
            }
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
            if(ev?.action === 'exportReport') {
                this.exportReport(ev?.rec)
                return
            }
            // EV =  {action: 'approve', rec: doc22050003}
            this.$store.dispatch("Document/handleDocument", ev)
        },
        renewLists() {
            this.grouped = []
            this.groupedObject = []
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