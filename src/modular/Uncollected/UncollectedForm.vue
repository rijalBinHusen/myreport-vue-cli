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

export default {
    name: "UncollectedForm",
    data() {
        return {
            collect: {
                periode: this.GET_LASTDATE,
            }
        }
    },
    methods: {
        changeShift(store, id, shift) {
            let record = store == 'Supervisors' ? this.GET_SUPERVISORID(id) : this.GET_HEADID(id)
            record.shift = shift
            this.$store.dispatch("update", { store: store, obj: record, criteria: { id: id } })
        },
        async send(){
            if(this.collect.periode) {
                // bring up the loader
                this.$store.commit("Modal/active", {judul: "", form: "Loader"});
                
                let periodeTime = this.GET_DATEFORMAT({format: "ymdTime", time: this.collect.periode})
                let warehouseInputed = []
                // uncollected record, ambil semua nama
                let allName = this.GET_SPVENABLE
                // console.log(allName)
                //// iterate semua nama satu satu
                for(let i=0; i < allName.length; i++) {
                    //unique id
                    let idN = this.$store.state.Document.lists.length > 0 ?  this.$store.state.Document.lists.slice(-1)[0].id : "UNC22050000"
                    // uncollected record, tunggu sampai append selesai
                    await this.$store.dispatch("append", {
                        store: "Document",
                        obj: {
                            id: idN, 
                            name: allName[i].id, 
                            periode: periodeTime,
                            shift: allName[i].shift,
                            head: allName[i].shift == 3 ? this.GET_HEADSHIFT(2).id : this.GET_HEADSHIFT(allName[i].shift).id,
                            collected: "false",
                            approval: "false",
                            status: 0,
                            warehouse: allName[i]?.warehouse
                            shared: "false", 
                            finished: "false", 
                            totaldo: "false", 
                            totalkendaraan: "false", 
                            totalwaktu: "false", 
                            standartwaktu: "false", 
                            basereportfile: "false", 
                            isfinished: "false",
                        },
                    })
                    // baseReportFile record, tunggu sampai selesai
                    if(!warehouseInputed.includes(allName[i].warehouse)) {
                        warehouseInputed.push(allName[i].warehouse)
                        await this.$store.dispatch("append", {
                            store: "BaseReportFile",
                            obj: {
                                id: idN, 
                                periode: periodeTime,
                                warehouse: allName[i].warehouse,
                                fileName: false,
                                stock: false,
                                clock: false,
                            },
                        })
                    }
                }
                //close the modeal
                this.$store.commit("Modal/active")
            }
        }
    },
    components: {
        Select,
        Button,
        Input,
        Datepicker,
    },
    computed: {
        ...mapState({
            _SPV: state => JSON.parse(JSON.stringify(state.Supervisors.lists)),
            _WAREHOUSES: state => JSON.parse(JSON.stringify(state.Warehouses.lists)),
        }),
        ...mapGetters({
            GET_UNCOLLECTED: "Document/uncollected",
            GET_HEADENABLE: "Headspv/enabled",
            GET_SPVENABLE: "Supervisors/enabled",
            GET_LASTDATE: "Document/lastDate",
            GET_LASTID: "Document/lastId",
            GET_DATEFORMAT: "dateFormat",
            GET_SUPERVISORID: "Supervisors/spvId",
            GET_HEADID: "Headspv/headId",
            GET_HEADSHIFT: "Headspv/shift",
        }),
        names() {
            let result = []
            let sortByWH = this.GET_SPVENABLE.sort((a, b) => a.warehouse > b.warehouse )
            let groupLength = Math.ceil(this.GET_SPVENABLE.length / 3) * 3
            for (let i = 0; i < groupLength; i += 3) {
                result.push(sortByWH.slice(i, i+3))
            }
            return result
        },
    },
}
</script>