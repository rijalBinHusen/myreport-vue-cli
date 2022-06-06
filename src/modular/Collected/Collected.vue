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
                <Button value="Batal" type="button" danger small @trig="unCollect(prop.id)" />
                <Button value="Edit" type="button" secondary small @trig="edit(prop.id)" />
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
                    @trig="approval({val: $event, rec: prop.id})"
                />
            </template>

            <template #th v-if="!viewByPeriode">
                <th>Daftar periode</th>
            </template>

            <template #td="{ obj }" v-if="!viewByPeriode">
                <td>
                    <Dropdown
                        v-for="unc in obj.uncollected" :key="unc.id"
                        :value="unc.periode2"  
                        :lists="[
                            { id: -1, isi: '-1 Hari'},
                            { id: -2, isi: '-2 Hari'},
                            { id: -3, isi: '-3 Hari'},
                            { id: 0, isi: '0 Hari' }
                        ]"
                        listsKey="id"
                        listsValue="isi"
                        @trig="approval({val: $event, rec: unc.id})"
                        class="w3-small"
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
        };
    },
    components: {
        Dropdown,
        Button,
        Datatable,
    },
    methods: {
        edit(ev) {
            // value = {store: 'nameOfStore', obj: {id: idOfDocument, object: 'to append to indexeddb'} }
            //this.$store.dispatch("update", objToSend)
            // ev.collected = window.prompt()
            
            // let rec = this.$store.getters["Collected/listsId"](ev)
            let info = this.$store.getters["Document/getId"](ev)
            info.collected = window.prompt()
            if(info.collected) {
                this.$store.dispatch("update", {
                            store: "Document",
                            obj: info,
                            criteria: {id: ev }
                        })
            }
            
        },
        approval(ev) {
            // get record from uncollected the state
            let info = this.$store.getters["Document/getId"](ev.rec)
            info.approval = this.$store.getters["dateFormat"]({format: ev.val})
            info.status = 2
            // console.log(info)
            this.$store.dispatch("update", {
                            store: "Document",
                            obj: info,
                            criteria: {id: ev.rec }
                        })

        },
		unCollect(ev) {

            // get record from uncollected the state
            let info = this.$store.getters["Document/getId"](ev)
            info.collected = false
            info.status = 0
            // console.log(info)
            this.$store.dispatch("update", {
                            store: "Document",
                            obj: info,
                            criteria: { id: ev }
                        })
		},
        renewLists() {
            this.viewByPeriode
                ? this.lists = this.$store.getters["Document/documentByStatus"](1)
                : ""
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
                    ? ['spvName', 'spvWarehouse', 'periode2', 'collected2', 'headName'] 
                    : ['name', 'warehouseName']
        },
        listsByWarehouse() {
            let result = []
            this.GET_SUPERVISORS.forEach((val) => {
                if(this.DOCBYSPV("collected")[val.id]) {
                    result.push(Object.assign(val, { 
                        uncollected: this.DOCBYSPV("collected")[val.id]
                        // .join(", "), total: this.GET_UNCOLLECTEDBYSPV[val.id].length
                    }))
                }
            })
            return result
        },
    },
    async mounted() {
        await this.$store.dispatch("getDataByCriteria", {store: "Document", criteria: { status: 1 }})
        this.renewLists()
    }
}
</script>