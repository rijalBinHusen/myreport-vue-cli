<template>
<form @submit.prevent="send">
    <div class="w3-col s2 w3-round-large w3-topbar w3-bottombar w3-padding-small w3-small">
        <h3 class="w3-margin-bottom">Periode</h3>
        <Datepicker 
            class="w3-input w3-row" 
            v-model="collect.periode" 
            :lowerLimit="this.GET_LASTDATE"
            DateFormat="yyyy-MM-dd"
        />
        <h3>Kabag</h3>
        <Input 
            v-for="name in GET_HEADENABLE" :key="name.id" 
            :label="name.name.split(' ')[0]" placeholder="Shift" class="w3-row w3-padding" type="number"
            :value="name.shift+''" @inp="changeShift('Headspv', name.id, $event)"
        />
    </div>
    <div v-for="(names2, index) in names" :key="index" class="w3-col s2 w3-round-large w3-topbar w3-bottombar w3-padding-small w3-small">
        <h3>Supervisor</h3>
        <Input 
            v-for="name in names2" :key="name.id" 
            :label="name.name.split(' ')[0]" placeholder="Shift" class="w3-row w3-padding" type="number"
            :value="name.shift+''" @inp="changeShift('Supervisors', name.id, $event)"
        />
    </div>

    <div class="w3-row">
        <Button
            primary 
            v-if="collect.periode"
            class="w3-margin-top w3-right" 
            value="Tambah" 
            type="button"
        />
    </div>
</form>

</template>

<script>
import Select from "../../components/elements/Select.vue"
import Button from "../../components/elements/Button.vue"
import Datepicker from "vue3-datepicker"
import { mapState, mapGetters } from "vuex"
import Input from "../../components/elements/Input.vue"
import { ref } from "vue"
import { updateSupervisor } from "@/composable/components/Supervisors"
import { updateHeadspv } from "@/composable/components/Headspv"

export default {
    components: {
        Select, Button,
        Input, Datepicker,
    },
    setup() {
        let timeout = ref('')
        let id = ref('')

        const changeShift = (store, idFL, shift) => {
            if(id.value == idFL) {
                clearTimeout(timeout.value)
              }
              id.value = idFL
              timeout.value = setTimeout(() => {
                    store == 'Supervisors'
                        ? updateSupervisor(idFL, { shift })
                        : updateHeadspv(idFL, { shift })
              }, 1000)
        }
    },
    methods: {
        async send(){
            if(this.collect.periode) {
                // bring up the loader
                this.$store.commit("Modal/active", {judul: "", form: "Loader"});
                // jadikkan this.periode sebagai new Date().getTime()
                let periodeTime = this.GET_DATEFORMAT({format: "ymdTime", time: this.collect.periode})
                // console.log(allName)
                //// iterate gudang, kemudian iterate nama spv yang ada didalam gudang
                for(let i=0; i < this._WAREHOUSES.length; i++) {

                    // baseReportFile record, masukkan berdasar iteraatenya gudang
                    await this.$store.dispatch("BaseReportFile/append", { 
                            periode: periodeTime,
                            warehouse: this._WAREHOUSES[i]?.id,
                    })

                    // Document record, iterate spv yang ada digudang
                    for(let j = 0; j < this._WAREHOUSES[i]?.supervisors.length; j ++) {
                        // get the supervisor information
                        let spv = this.GET_SUPERVISORID(this._WAREHOUSES[i]?.supervisors[j])
                        if(!spv?.disabled) {
                            await this.$store.dispatch("Document/append", {
                                name: spv?.id, 
                                periode: periodeTime,
                                shift: spv?.shift,
                                head: spv?.shift == 3 
                                        ? this.GET_HEADSHIFT(2)?.id 
                                        : this.GET_HEADSHIFT(spv?.shift)?.id,
                                warehouse: this._WAREHOUSES[i]?.id,
                            })
                        }
                    }
                }
                //close the modeal
                this.$store.commit("Modal/active")
            }
        }
    },
    computed: {
        ...mapState({
            _SPV: state => JSON.parse(JSON.stringify(state.Supervisors.lists)),
            _WAREHOUSES: state => JSON.parse(JSON.stringify(state.Warehouses.lists)),
        }),
        ...mapGetters({
            GET_HEADENABLE: "Headspv/enabled",
            GET_SPVENABLE: "Supervisors/enabled",
            GET_LASTDATE: "Document/lastDate",
            GET_DATEFORMAT: "dateFormat",
            GET_SUPERVISORID: "Supervisors/spvId",
            GET_HEADID: "Headspv/headId",
            GET_HEADSHIFT: "Headspv/shift",
            GET_SPV_WAREHOUSE: "Warehouses/warehouseNameBySpv"
        }),
        names() {
            // warehouse: 123123123, spv [ 1, 2, 3 ], warehousename
            let result = []
            let groupLength = Math.ceil(this.GET_SPVENABLE.length / 3) * 3
            for (let i = 0; i < groupLength; i += 3) {
                result.push(this.GET_SPVENABLE.slice(i, i+3))
            }
            return result
        },
    },
}
</script>