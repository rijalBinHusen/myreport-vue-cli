<template>
    <div>
        <label class="w3-margin-top">Nama gudang</label>
        <input type="text" class="w3-input w3-margin-top w3-margin-bottom" :value="base.title + ' / Shift ' + shift" disabled />
        <!-- Supervisors -->
        <label>Pilih nama supervisors</label>
        <Select 
        :options="names" 
        value="id"
        text="name"
        @selected="name = $event"
        />
        <!-- Head spv -->
        <label>Pilih nama kabag</label>
        <Select 
            :options="headspv" 
            value="id"
            text="name"
            @selected="headSpv = $event"
        />
        <label class="w3-margin-top">Nama collected report</label>
        <input type="text" class="w3-input w3-margin-top w3-margin-bottom" :value="nameReport" disabled />
        <div class="w3-row">
            <div class="w3-col s2 w3-padding-top w3-margin-right">
                <label class="w3-margin-top">Total do</label>
                <input type="text" class="w3-input w3-margin-top w3-margin-bottom" :value="totalDo" />
            </div>
            <div class="w3-col s2 w3-padding-top w3-margin-right">
                <label class="w3-margin-top">Total kendaraan</label>
                <input type="text" class="w3-input w3-margin-top w3-margin-bottom" :value="totalKendaraan" />
            </div>
            <div class="w3-col s2 w3-padding-top w3-margin-right">
                <label class="w3-margin-top">Total waktu</label>
                <input type="text" class="w3-input w3-margin-top w3-margin-bottom" :value="totalWaktu" />
            </div>
            <div class="w3-col s2 w3-padding-top w3-margin-right">
                <label class="w3-margin-top">Standart waktu</label>
                <input type="text" class="w3-input w3-margin-top w3-margin-bottom" :value="standartWaktu / 10" disabled />
            </div>
        </div>
        <Button 
            value="Exit" 
            class="w3-right"
            type="button" 
            danger 
            small
            @trig="this.$emit('exit')" 
        />
        <Button 
            v-if="name && nameReport && headSpv"
            value="Save" 
            class="w3-right"
            type="button" 
            primary
            small
            @trig="save" 
        />
    </div>
</template>

<script>
import Select from "../../components/elements/Select.vue"
import Button from "../../components/elements/Button.vue"
import myfunction from "../../myfunction"
import { uid } from "uid"

export default {
    components: {
        Select,
        Button,
    },
    data() {
        return {
            name: null,
            nameReport: null,
            headSpv: null,
            collected: null,
        }
    },
    methods: {},
    emits: ["exit", "finished"],
    props: {
        base: {
            type: Object,
            required: true,
        },
        shift: {
            type: String,
            required: true,
        },
        totalDo: {
            type: Number,
            required: true,
        },
        totalKendaraan: {
            type: Number,
            required: true,
        },
        totalWaktu: {
            type: Number,
            required: true,
        },
        standartWaktu: {
            type: Number,
            required: true,
        }
    },
    methods: {
        save() {
            this.$emit("finished", {
                id: uid(4),
                collectedReport: this.collected.id,
                baseReportFile: this.base.id,
                shift: this.shift,
                headSpv: this.headSpv,
                totalDO: this.totalDo,
                totalKendaraan: this.totalKendaraan,
                totalWaktu: this.totalWaktu,
                standartWaktu: this.standartWaktu
            })
        },
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
        headspv() {
            // ambil semua nama dari state
            let options = this.$store.getters["Headspv/enabled"]
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
                this.collected = result[0]
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