<template>
    <div>
        <label class="w3-margin-top">Nama gudang</label>
        <input type="text" class="w3-input w3-margin-top w3-margin-bottom" :value="$store.getters['dateFormat']({ format: 'dateMonth', time: base?.periode }) + ' ' + warehouseName + ' / Shift ' + shift" disabled />
        <!-- Supervisors -->
        <label>Nama supervisors</label>
        <Select
            judul="supervisor" 
            :options="names" 
            value="id"
            text="name"
            @selected="name = $event"
            :inselect="name"
            disabled
        />
        <!-- Head spv -->
        <label>Nama kabag</label>
        <Select 
            :options="headspv" 
            judul="kabag"
            value="id"
            text="name"
            @selected="headSpv = $event"
            :inselect="headSpv"
            disabled
        />
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
            v-if="documentRecord?.collected"
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

export default {
    components: {
        Select,
        Button,
    },
    data() {
        return {
            name: null,
            headSpv: null,
            documentRecord: null,
            warehouseName: "",
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
            this.$store.dispatch("Document/handleDocument",
                {
                    action: "finished",
                    val: {
                        isfinished: true,
                        finished: new Date().getTime(),
                        baseReportFile: this.base.id,
                        totalDO: this.totalDo,
                        totalKendaraan: this.totalKendaraan,
                        totalWaktu: this.totalWaktu,
                        standartWaktu: this.standartWaktu
                    },
                    rec: this.documentRecord?.id
                }
            )
            // console.log(this.document)
            this.$emit("finished", this.documentRecord?.id)
            this.$emit('exit')
        },
    },
    computed: {
        names() {
            return this.$store.state.Supervisors.lists
        },        
        headspv() {
            return this.$store.state.Headspv.lists
        },
    },
    mounted() {
        this.documentRecord = this.$store.getters["Document/documentByPeriodeAndWarehouseAndShift"](this.base?.periode, this.base?.warehouse, this.shift)
        this.name = this.documentRecord?.name
        this.headSpv = this.documentRecord?.head
        this.warehouseName = this.$store.getters["Warehouses/warehouseId"](this.base?.warehouse)?.name
        if(this.documentRecord?.collected === "false") {
            alert("The document record status not collected yet")
        }
    },
}
</script>