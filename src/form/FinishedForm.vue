<template>
    <div class="w3-row">
        <!-- Periode laporan -->
        <div class="w3-col s3 w3-padding-small" v-for="dat in dataToShow" :key="dat.title">
            <Input :label="dat.title+':'" 
                :placeholder="dat.title" 
                class="w3-margin-bottom" 
                :value="more?.[dat.valueFrom]"
                @change="changeValue(dat.valueFrom, $event.target.value)"
                :disabled="!edit || !dat?.editable"
                :type="dat.type"
            />
        </div>
        <Button primary :value="edit ?  'Update' : 'Edit'" class="w3-right" type="button" @trig="editButtonHandle"/>
    </div>
</template>

<script>

import Input from "@/components/elements/Input.vue"
import Button from "@/components/elements/Button.vue"
import { updateDocument } from '@/composable/components/DocumentsPeriod'

export default {
    methods: {
        editButtonHandle() {
            if(!this.edit) {
                this.edit = true
                return
            }
            updateDocument(this.more.id, this.changed)
            this.$store.commit("Modal/active");
        },
        changeValue(key, value) {
            this.changed[key] = value
        },
    },
    data() {
        return {
            more: "",
            edit: false,
            dataToShow: [
                { title: "Periode", valueFrom: "periode2", editable: false, type: 'text' },
                { title: "Supervisor Name", valueFrom: "spvName", editable: false, type: 'text'  },
                { title: "Gudang", valueFrom: "warehouseName", editable: false, type: 'text'  },
                { title: "Shift", valueFrom: "shift", editable: false, type: 'text'   },
                { title: "Total DO", valueFrom: "totalDo", editable: true, type: 'number'},
                { title: "Total Kendaraan", valueFrom: "totalKendaraan", editable: true, type: 'number'},
                { title: "Total Waktu", valueFrom: "totalWaktu", editable: true, type: 'number'},
                { title: "Total item moving", valueFrom: "totalItemMoving", editable: true, type: 'number'},
                { title: "Total product in", valueFrom: "totalQTYIn", editable: true, type: 'number'},
                { title: "Total output", valueFrom: "totalQTYOut", editable: true, type: 'number'},
                { title: "Coret DO", valueFrom: "planOut", editable: true, type: 'number'},
                { title: "Total Not FIFO", valueFrom: "totalProductNotFIFO", editable: true, type: 'number'},
                { title: "Total item variance", valueFrom: "itemVariance", editable: true, type: 'number'}
            ],
            changed: {},
        }
    },
    mounted() {
        this.more = this.$store.getters["Modal/obj"]?.data
    },
    components: {
        Input, Button,
    },
    name: "FinishedForm",
}
</script>