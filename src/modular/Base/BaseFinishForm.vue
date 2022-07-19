<template>
    <div>
        <label class="w3-margin-top">Nama gudang</label>
        <input type="text" class="w3-input w3-margin-top w3-margin-bottom" :value="$store.getters['dateFormat']({ format: 'dateMonth', time: base?.periode }) + ' ' + warehouseName + ' / Shift ' + shift" disabled />
        <!-- Supervisors -->
        <label>Nama supervisors</label>
        <input type="text" class="w3-input w3-margin-top w3-margin-bottom" :value="$store.getters['Supervisors/spvId'](name)?.name" disabled />
        <!-- Head spv -->
        <label>Nama kabag</label>
        <input type="text" class="w3-input w3-margin-top w3-margin-bottom" :value="$store.getters['Headspv/headId'](headSpv)?.name" disabled />
        <div class="w3-row">
            <div v-for="inp in inputs" :key="inp.label" class="w3-col s2 w3-padding-small">
                <label class="w3-margin-top">{{ inp.label }}</label>
                <input v-if="inp.editable" type="number" class="w3-input w3-margin-top w3-margin-bottom" v-model="details[inp.valueFrom]"/>
                <input v-else type="number" class="w3-input w3-margin-top w3-margin-bottom" :value="details[inp.valueFrom]" disabled/>

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
            v-if="documentRecord?.collected && !documentRecord.isfinished"
            value="Save" 
            class="w3-right"
            type="button" 
            primary
            small
            @trig="save" 
        />
        <div v-if="documentRecord?.collected && !documentRecord.isfinished" class="w3-right w3-large w3-margin-right">
            <label for="generate">Generate report </label>
            <input type="checkbox" id="generate" v-model="generateReport" />
        </div>
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
            details: "",
            generateReport: false,
        }
    },
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
        detailsClock: {
            type: Object,
            required: true,
        },
        detailsStock: {
            type: Object,
            required: true,
        }
    },
    methods: {
        save() {
            // console.log(this.document)
            this.$emit("finished", Object.assign({
                parentDocument: this.documentRecord?.id,
                generateReport: this.generateReport,
            }, this.details))
            this.$emit('exit')
        },
    },
    computed: {
        inputs() {
            return [
                { label: "Total produk keluar", valueFrom: "totalQTYOut", editable: false },
                { label: "Total item bergerak", valueFrom: "totalItemMoving", editable: false },
                { label: "Total produk masuk", valueFrom: "totalQTYIn", editable: false },
                { label: "Coret DO", valueFrom: "planOut", editable: false },
                { label: "Jumlah item keluar", valueFrom: "totalItemKeluar", editable: false },
                { label: "Total DO", valueFrom: "totalDo", editable: true },
                { label: "Total waktu", valueFrom: "totalWaktu", editable: true },
                { label: "Total kendaraan", valueFrom: "totalKendaraan", editable: true },
                { label: "Produk tidak FIFO",  valueFrom: "totalProductNotFIFO", editable: true},
                { label: "Produk variance", valueFrom: "itemVariance", editable: true },
            ]
        }
    },
    mounted() {
        this.documentRecord = this.$store.getters["Document/documentByPeriodeAndWarehouseAndShift"](this.base?.periode, this.base?.warehouse, this.shift)
        this.name = this.documentRecord?.name
        this.headSpv = this.documentRecord?.head
        this.warehouseName = this.$store.getters["Warehouses/warehouseId"](this.base?.warehouse)?.name
        this.itemVariance = this.$store.getters["Problem/problemActiveBySpvAndPeriode"](this.name, this.base.periode).length
        this.details = Object.assign(this.detailsClock, this.detailsStock, { itemVariance: 0})
        console.log(this.documentRecord,this.base?.periode, this.base?.warehouse, this.shift)
        if(!this.documentRecord?.collected) {
            alert("The document record status not collected yet")
        }
    },
}
</script>