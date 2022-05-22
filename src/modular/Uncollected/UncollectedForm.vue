<template>
<form @submit.prevent="send">
    <div class="w3-col s2 w3-round-large w3-topbar w3-bottombar w3-padding-small w3-margin-right">
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
        />
    </div>
    <div v-for="(names2, index) in names" :key="index" class="w3-col s2 w3-round-large w3-topbar w3-bottombar w3-padding-small w3-margin-right">
        <h3>Supervisor</h3>
        <Input 
            v-for="name in names2" :key="name.id" 
            :label="name.name.split(' ')[0]" placeholder="Shift" class="w3-row w3-padding" type="number"
        />
    </div>

    <Button
    primary 
    v-if="collect.name && collect.periode"
    class="w3-margin-top" 
    value="Tambah" 
    type="button"
   />

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
                name: "",
                periode: new Date(),
            }
        }
    },
    methods: {
        async send(){
            if(this.collect.name) {
                // bring up the loader
                this.$store.commit("Modal/active", {judul: "", form: "Loader"});
                
                let periodeTime = this.GET_DATEFORMAT({format: "ymdTime", time: this.collect.periode})
                let warehouseInputed = []
                if(this.collect.name === "semua") {
                    // uncollected record, ambil semua nama
                    let allName = this.GET_SPVENABLE
                    // console.log(allName)
                    //// iterate semua nama satu satu
                    for(let i=0; i < allName.length; i++) {
                        let uidN = uid(5)
                        // uncollected record, tunggu sampai append selesai
                        await this.$store.dispatch("append", {
                            store: "Uncollected",
                            obj: {
                                id: uidN, 
                                name: allName[i].id, 
                                periode: periodeTime
                            },
                            period: periodeTime
                        })
                        // baseReportFile record, tunggu sampai selesai
                        if(!warehouseInputed.includes(allName[i].warehouse)) {
                            warehouseInputed.push(allName[i].warehouse)
                            await this.$store.dispatch("append", {
                                store: "BaseReportFile",
                            obj: {
                                id: uidN, 
                                periode: periodeTime,
                                warehouse: allName[i].warehouse,
                                fileName: false,
                                stock: false,
                                clock: false,
                            },
                            period: periodeTime
                            })
                        }
                    }
                    
                } else {
                    this.$store.dispatch("append", {
                            store: "Uncollected",
                            id: uid(5),
                            obj: {
                                name: this.collect.name,
                                periode: periodeTime,
                                },
                        })
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
            _UNCOLLECTED: state => JSON.parse(JSON.stringify(state.Uncollected.lists)),
            _WAREHOUSES: state => JSON.parse(JSON.stringify(state.Warehouses.lists)),
        }),
        ...mapGetters({
            GET_HEADENABLE: "Headspv/enabled",
            GET_SPVENABLE: "Supervisors/enabled",
            GET_LASTDATE: "Uncollected/lastDate",
            GET_DATEFORMAT: "dateFormat",
        }),
        names() {
            let result = []
            let groupLength = Math.ceil(this.GET_SPVENABLE.length / 3) * 3
            console.log(groupLength)
            for (let i = 0; i < groupLength; i += 3) {
                result.push(this.GET_SPVENABLE.slice(i, i+3))
            }
            return result
        },
    },
}
</script>