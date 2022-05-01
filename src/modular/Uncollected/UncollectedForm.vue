<template>
<form @submit.prevent="send">
    <label>Masukkan nama</label>
    <Select 
    :options="names" 
    value="id"
    text="name"
    @selected="collect.name = $event"
    />
    <label class="w3-margin-top w3-margin-bottom">Periode</label>
    <Datepicker 
        class="w3-input" 
        v-model="collect.periode" 
        :lowerLimit="this.GET_LASTDATE"
        DateFormat="yyyy-MM-dd"
    />

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
import { uid } from "uid"

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
        Datepicker,
    },
    computed: {
        ...mapState({
            _SPV: state => JSON.parse(JSON.stringify(state.Supervisors.lists)),
            _UNCOLLECTED: state => JSON.parse(JSON.stringify(state.Uncollected.lists)),
            _WAREHOUSES: state => JSON.parse(JSON.stringify(state.Warehouses.lists)),
        }),
        ...mapGetters({
            GET_SPVENABLE: "Supervisors/enabled",
            GET_LASTDATE: "Uncollected/lastDate",
            GET_DATEFORMAT: "dateFormat",
        }),
        names() {
            // ambil semua nama dari state
            let options = Array.from(this.GET_SPVENABLE)
            // tambahkan option lain
            options.unshift({id: "semua", name: "Semua SPV" })
            options.unshift({id: "", name: "Pilih nama" })
            // kembalikan agar tidak reactive
            return options
        }
    },
}
</script>