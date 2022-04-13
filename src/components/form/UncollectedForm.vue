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
        inputFormat="yyyy-MM-dd"
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
import Select from "../elements/Select.vue"
import Button from "../elements/Button.vue"
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
                
                if(this.collect.name === "semua") {
                    // baseReportFile record
                    this._WAREHOUSES.forEach((val) => {
                        this.$store.dispatch("append", {
                            store: "BaseReportFile",
                            obj: {
                                id: uid(3), 
                                periode: this.GET_DATEFORMAT({format: "time", time: this.collect.periode}),
                                warehouse: val.id,
                                fileName: false,
                                stock: false,
                                clock: false,
                            }
                        })
                    })

                    // uncollected record, ambil semua nama
                    let allName = this.GET_SPVENABLE
                    // iterate semua nama satu satu
                    for(let i=0; i < allName.length; i++) {
                        // tunggu sampai append selesai
                        await this.$store.dispatch("append", {
                            store: "Uncollected",
                            obj: {
                                id: uid(3), 
                                name: allName[i].id, 
                                periode: this.GET_DATEFORMAT({format: "time", time: this.collect.periode})
                            },
                        })
                    }
                    
                } else {
                    this.$store.dispatch("append", {
                            store: "Uncollected",
                            id: uid(3),
                            obj: {
                                name: this.collect.name,
                                periode: this.GET_DATEFORMAT({format: "time", time: this.collect.periode})
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
            let options = this._SPV
            // tambahkan option lain
            options.unshift({id: "semua", name: "Semua SPV" })
            options.unshift({id: "", name: "Pilih nama" })
            // kembalikan agar tidak reactive
            return options
        }
    },
}
</script>