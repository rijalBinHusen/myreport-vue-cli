<template>
<div class="">
    <div class="w3-border w3-padding w3-container">
        <label>Set record to show : </label>
        <Button primary value="Set" type="button" @trig="approvalForm" />
        <Button primary class="w3-right" value="Export all" type="button" @trig="exportReportAll" />
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
                    v-if="!isNaN(prop.isfinished)"
                    value="Export" 
                    type="button" 
                    secondary small 
                    @trig="exportReport(prop)" 
                />
                </template>
                <template #th>
                    <th>Group option</th>
                </template>
                <template #td="{ obj }">
                    <input :id="obj.id" v-model="grouped" :value="obj.id" @input="push('grouped', obj.id, obj)" type="checkbox" />
                    <label :for="obj.id"> Group</label>
                    <br />
                    <input :id="obj.id+1" v-model="noGroup" :value="obj.id" @input="push('noGroup', obj.id, obj)" type="checkbox" />
                    <label :for="obj.id+1"> No group</label>
                </template>
            </Datatable>
			<!-- </table> -->
			
        </div>
</template>

<script>
import exportDailyReport from "../../excelReport/DailyReport"
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
            noGroup: [],
            noGroupObject: [],
        };
    },
    components: {
        Button,
        Datatable,
        Input,
    },
    methods: {
        exportReportAll() {
            // group dulu yang spv dan periode yang sama
            /* expected object = [
                [{ baseReport }, { baseReport }],
                [{ baseReport }, { baseReport }],
                [{ baseReport }, { baseReport }],
            ]
            */
           if(!this.groupedObject.length || !this.noGroupObject.length) {
               return
           }
           let group = []
        //   grouped { spvperiode: index }
           let grouped = {}
           this.groupedObject.forEach((val, index) => {
            //    if the object was grouped, and else
               if(grouped[val?.spv+val?.grouped]) {
                //    group[index].push(val)
                   group[grouped[val.spv+val.grouped]].push({ ...val })
               } else {
                   grouped[val.spv+val.grouped] = index
                   group[grouped[val.spv+val.grouped]] = [{ ...val }]
               }
           })
            // iterate semua yang sudah digroup
            console.log(group)
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
        push(type, id, obj) {
            // if the id is exists,
            if(this[type].includes(id)) {
                this[type] = this[type].filter(val => val !== id)
                this[type+'Object'] = this[type+'Object'].filter(val => val.id != id)
                return
            } 
            // else
            this[type+'Object'].push({ ...obj })
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