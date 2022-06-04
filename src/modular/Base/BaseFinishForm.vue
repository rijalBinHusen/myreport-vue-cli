<template>
    <div>
        <label class="w3-margin-top">Nama gudang</label>
        <input type="text" class="w3-input w3-margin-top w3-margin-bottom" :value="base.warehouseName + ' / Shift ' + shift" disabled />
        <!-- Supervisors -->
        <label>Pilih nama supervisors</label>
        <Select
        judul="supervisor" 
        :options="names" 
        value="id"
        text="name"
        @selected="name = $event"
        />
        <!-- Head spv -->
        <label>Pilih nama kabag</label>
        <Select 
            :options="headspv" 
            judul="kabag"
            value="id"
            text="name"
            @selected="headSpv = $event"
            :inselect="headSpv"
        />
        <label class="w3-margin-top">Nama document report</label>
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
            v-if="nameReport && nameReport !== 'Not found'"
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
            document: null,
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
            this.$emit("finished",
                Object.assign(this.document,
                {
                    isfinished: true,
                    finished: new Date().getTime(),
                    baseReportFile: this.base.id,
                    totalDO: this.totalDo,
                    totalKendaraan: this.totalKendaraan,
                    totalWaktu: this.totalWaktu,
                    standartWaktu: this.standartWaktu
                })
            )
        },
    },
    computed: {
        names() {
            return this.$store.getters["Supervisors/enabled"].filter((val) => val.warehouse === this.base.warehouse)
        },        
        headspv() {
            return this.$store.getters["Headspv/enabled"]
        },
    },
    watch: {
        name(newVal, oldVal) {
            if(newVal === oldVal) {
                return
            }
            myfunction.findData({
                store: "Document",
                criteria: { 
                    periode: this.base.periode,
                    name: newVal,
                    shift: this.shift,
                }
            }).then((result) => {
                if(!result) {
                    this.nameReport = "Not found"
                    return
                }
                this.document = result[0]
                // periode
                this.nameReport = this.$store.getters["dateFormat"]({format: 'dateMonth', time: result[0].periode})
                //dapatkan info supervisors
                let info = this.$store.getters["Supervisors/spvId"](result[0].name)
                // nama gudang
                this.nameReport += " / "+info.warehouseName
                // nama karu
                this.nameReport += " / Supervisors "+info.name
                // shift
                this.nameReport += " / Shift "+info.shift
                // head spv
                this.headSpv = this.document.head

            })
        }
    },
}
</script>