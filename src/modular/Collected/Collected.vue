<template>
<div class="">

            <Datatable
            :datanya="collected"
            :heads="['Nama', 'Gudang', 'Periode', 'Collected']"
            :keys="['spvName', 'spvWarehouse', 'periode2', 'collected2']"
            option
            id="tableCollected"
            v-slot:default="{ prop }"
            >

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
            </Datatable>
			<!-- </table> -->
			
        </div>
</template>

<script>
import Button from "../../components/elements/Button.vue"
import Datatable from "../../components/parts/Datatable.vue"
import Dropdown from "../../components/elements/Dropdown.vue"

export default {
    name: "Collect",
    data() {
        return {
            periode: new Date()
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
    },
    computed: {
        collected() {
			let collect = this.$store.getters["Document/collected"]
			let result = []
			collect.forEach((val) => {
                if(val) {
                let spvInfo = this.$store.getters["Supervisors/spvId"](val.name)
                    val.spvName = spvInfo.name
                    val.spvWarehouse = spvInfo.warehouseName
                    val.periode2 = this.$store.getters["dateFormat"]({ format: "dateMonth", time: val.periode })
                    val.collected2 = !isNaN(val.collected) ? this.$store.getters["dateFormat"]({ format: "dateMonth", time: val.collected }) : val.collected
                    result.push(val)
                }
			})
            return result
        },
    },
    mounted() {
        this.$store.dispatch("getDataByCriteria", {store: "Document", criteria: { status: 1 }})
    }
}
</script>