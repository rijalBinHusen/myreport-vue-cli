<template>
    <div>
        <label class="w3-margin-top">Nama gudang</label>
        <input type="text" class="w3-input w3-margin-top w3-margin-bottom" :value="base.title + ' / Shift ' + shift" disabled />
        <label>Pilih nama supervisors</label>
        <Select 
        :options="names" 
        value="id"
        text="name"
        @selected="name = $event"
        />
        <label class="w3-margin-top">Nama report</label>
        <input type="text" class="w3-input w3-margin-top w3-margin-bottom" :value="nameReport" disabled />
    </div>
</template>

<script>
import Select from "../../components/elements/Select.vue"
import Button from "../../components/elements/Button.vue"
import myfunction from "../../myfunction"

export default {
    components: {
        Select,
        Button,
    },
    data() {
        return {
            name: null,
            nameReport: null
        }
    },
    methods: {},
    props: {
        base: {
            type: Object,
            required: true,
        },
        shift: {
            type: String,
            required: true,
        }
    },
    computed: {
        names() {
            // ambil semua nama dari state
            let options = this.$store.getters["Supervisors/enabled"].filter((val) => val.warehouse === this.base.warehouse)
            // tambahkan option lain
            options.unshift({id: "", name: "Pilih nama" })
            // kembalikan agar tidak reactive
            return options
        },
    },
    watch: {
        name(newVal, oldVal) {
            if(newVal === oldVal) {
                return
            }
            myfunction.findData({
                store: "Collected",
                split: "bulan",
                period: this.base.periode,
                obj: { 
                    periode: this.base.periode,
                    name: newVal
                }
            }).then((result) => {
                if(!result) {
                    this.nameReport = "Not found"
                    return
                }
                // periode
                this.nameReport = this.$store.getters["dateFormat"]({format: 'dateMonth', time: result[0].periode})
                //dapatkan info supervisors
                let info = this.$store.getters["Supervisors/spvId"](result[0].name)
                // nama gudang
                this.nameReport += " / "+info.warehouseName
                // nama karu
                this.nameReport += " / Supervisors "+info.name

            })
        }
    },
}
</script>