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
            <div class="w3-col s2 w3-padding-top w3-margin-right">
                <label class="w3-margin-top">Total do</label>
                <input type="number" class="w3-input w3-margin-top w3-margin-bottom" v-model="detailsClock.totalDo" />
            </div>
            <div class="w3-col s2 w3-padding-top w3-margin-right">
                <label class="w3-margin-top">Total kendaraan</label>
                <input type="number" class="w3-input w3-margin-top w3-margin-bottom" v-model="detailsClock.totalKendaraan" />
            </div>
            <div class="w3-col s2 w3-padding-top w3-margin-right">
                <label class="w3-margin-top">Total waktu</label>
                <input type="number" class="w3-input w3-margin-top w3-margin-bottom" v-model="detailsClock.totalWaktu" />
            </div>
            <div class="w3-col s2 w3-padding-top w3-margin-right">
                <label class="w3-margin-top">Standart waktu</label>
                <input type="number" class="w3-input w3-margin-top w3-margin-bottom" :value="detailsStock.totalQTYOut / 10" disabled />
            </div>
            <div class="w3-col s2 w3-padding-top w3-margin-right">
                <label class="w3-margin-top">Total item bergerak</label>
                <input type="number" class="w3-input w3-margin-top w3-margin-bottom" :value="detailsStock.totalItemMoving" disabled />
            </div>
            <div class="w3-col s2 w3-padding-top w3-margin-right">
                <label class="w3-margin-top">Total produk masuk</label>
                <input type="number" class="w3-input w3-margin-top w3-margin-bottom" :value="detailsStock.totalQTYIn" disabled />
            </div>
            <div class="w3-col s2 w3-padding-top w3-margin-right">
                <label class="w3-margin-top">Produk tidak FIFO</label>
                <input type="number" class="w3-input w3-margin-top w3-margin-bottom" v-model="detailsStock.totalProductNotFIFO"/>
            </div>
            <div class="w3-col s2 w3-padding-top w3-margin-right">
                <label class="w3-margin-top">Produk variance</label>
                <input type="number" class="w3-input w3-margin-top w3-margin-bottom" v-model="itemVariance"/>
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
            itemVariance: 0,
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
                itemVariance: this.itemVariance,
            }, this.detailsClock, this.detailsStock))
            this.$emit('exit')
        },
    },
    mounted() {
        this.documentRecord = this.$store.getters["Document/documentByPeriodeAndWarehouseAndShift"](this.base?.periode, this.base?.warehouse, this.shift)
        this.name = this.documentRecord?.name
        this.headSpv = this.documentRecord?.head
        this.warehouseName = this.$store.getters["Warehouses/warehouseId"](this.base?.warehouse)?.name
        this.itemVariance = this.$store.getters["Problem/problemActiveBySpvAndPeriode"](this.name, this.base.periode).length
        if(!this.documentRecord?.collected) {
            alert("The document record status not collected yet")
        }
    },
}
</script>