<template>
<div class="">
        <Button 
            class="w3-right w3-margin-top" 
            primary 
            :value="viewByPeriode ? 'View By Supervisors' : 'View by periode'" 
            type="button" 
            @trig="viewByPeriode = !viewByPeriode" 
        />
        <Datatable
            :datanya="lists"
            :heads="heads"
            :keys="keys"
            :option="viewByPeriode"
            :id="viewByPeriode ? 'tableCollected' : 'collectedBySpv'"
        >
            <template  v-if="viewByPeriode" #default="{ prop }">
                <Button 
                    value="Batal" 
                    type="button" 
                    danger small 
                    @trig="handleAction({action: 'uncollect', rec: prop.id})" 
                />
                <Button value="Details" type="button" secondary small @trig="details(prop.id)" />
                <Dropdown
                    value="Approval"  
                    :lists="[
                        { id: -1, isi: '-1 Hari'},
                        { id: -2, isi: '-2 Hari'},
                        { id: -3, isi: '-3 Hari'},
                        { id: 0, isi: '0 Hari' }
                    ]"
                    class="w3-small"
                    listsKey="id"
                    listsValue="isi"
                    @trig="handleAction({action: 'approve', val: $event, rec: prop?.id, obj: prop })"
                    primary
                />
            </template>

            <template #th v-if="!viewByPeriode">
                <th>Daftar periode</th>
            </template>

            <template #td="{ obj }" v-if="!viewByPeriode">
                <td>
                    <Dropdown
                        v-for="doc in obj.documents" :key="doc.periode2"
                        :value="doc?.periode2+' | '+doc?.warehouseName.replace('Gudang jadi ', '')"  
                        :lists="[
                            { id: -1, isi: '-1 Hari'},
                            { id: -2, isi: '-2 Hari'},
                            { id: -3, isi: '-3 Hari'},
                            { id: 0, isi: '0 Hari' }
                        ]"
                        listsKey="id"
                        listsValue="isi"
                        @trig="handleAction({action: 'approve', val: $event, rec: doc?.id, obj: doc })"
                        class="w3-small"
                        primary
                    />
                </td>
            </template>
        </Datatable>
        <!-- </table> -->
        
    </div>
</template>

<script>
import Button from "../../components/elements/Button.vue"
import Datatable from "../../components/parts/Datatable.vue"
import Dropdown from "../../components/elements/Dropdown.vue"
import { mapGetters } from "vuex"

export default {
    name: "Collect",
    data() {
        return {
            viewByPeriode: true,
            lists: [],
            unsubscribe: "",
        };
    },
    components: {
        Dropdown,
        Button,
        Datatable,
    },
    methods: {
        details(ev) {
            this.$store.commit("Modal/active", {
                judul: "Edit record", 
                form: "UncollectedEditForm",
                id: ev,
                mode: "view",
            });
        },
        handleAction(ev) {
            // EV =  {action: 'approve', val: -1, rec: doc22050003}
            // konfirm dulu, kalau ada selisih stock biar diforo dulu
            let promise = new Promise(resolve => {
                console.log(ev?.obj)
                if(ev?.obj?.itemVariance) {
                    let confirm = window.confirm("Terdapat selisih stock, silahkan difoto dulu")
                    if(confirm) {
                        resolve(true)
                    }
                    resolve(false)
                }
                if(!ev?.obj?.isfinished) {
                    window.alert("Laporan masih belum selesai!")
                    resolve(false)
                }
                resolve(true)
            }) 
            
            const { obj, ...record } = ev
            // console.log(record, confirm)
            promise.then((val) => {
                // if(val) {
                //     this.$store.dispatch("Document/handleDocument",  record)
                    console.log(val)
                // }
            })
            // console.log(confirm)
        },
        renewLists() {
            this.viewByPeriode
                ? this.lists = this.$store.getters["Document/documentByStatus"](1)
                : this.lists = this.$store.getters["Document/documentBySpv"](1)
        },
    },
    computed: {
        ...mapGetters({
            GET_SUPERVISORS: "Supervisors/lists",
            DOCBYSPV: "Document/docBySpv",
        }),
        heads() {
            return this.viewByPeriode 
                    ? ['Nama', 'Gudang', 'Periode', 'Collected', 'Kabag'] 
                    : ['Nama', 'Gudang']
        },
        keys() {
            return this.viewByPeriode 
                    ? ['spvName', 'warehouseName', 'periode2', 'collected2', 'headName'] 
                    : ['name', 'warehouseName']
        },
    },
    watch: {
        viewByPeriode(newVal, oldVal) {
            this.renewLists()
        }
    },
    async mounted() {
        await this.$store.dispatch("Document/getDocumentByStatusFromDB", "collected")
        this.renewLists()

        // subscribe the mutation,, and renew lists when data updated
        this.unsubscribe = this.$store.subscribe((mutation) => {
            // jika document ada yang di update
            if (mutation.type === 'Document/update') {
                this.renewLists()
            }
        });
    },
    beforeUnmount() {
        this.unsubscribe();
    },
}
</script>