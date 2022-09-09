<template>
<div>
    <div class="w3-row">
        <div class="w3-col s3 w3-padding-small" v-for="dat in dataToShow" :key="dat.title">
            <Input :label="dat.title+':'" 
                :placeholder="dat.title" 
                class="w3-margin-bottom" 
                :value="more?.[dat.valueFrom]"
                @change="more[dat.valueFrom] = $event.target.value"
                disabled
                type="text"
            />
        </div>
        <div class="w3-row">
            <SelectHeadVue 
                class="w3-col s3 w3-margin-right" 
                :inSelectHead="more?.head" 
                @selectedHead="recordChanged('head', $event)" 
                :disabled="!edit"
            />
            <div class=" w3-col s3 w3-margin-right">
                <label class="w3-margin-top">Collected</label>
                <datepicker 
                    class="w3-margin-top w3-border w3-input w3-round-large" 
                    v-model="collected"
                    :disabled="!edit"
                    >
                </datepicker>
            </div>
            <div class=" w3-col s3">
                <label class="w3-margin-top">Approval</label>
                <datepicker 
                    class="w3-margin-top w3-border w3-input w3-round-large" 
                    v-model="approval"
                    :disabled="!edit"
                    >
                </datepicker>
            </div>
        </div>
    </div>
    <Button primary :value="edit ?  'Update' : 'Edit'" class="w3-right" type="button" @trig="editButtonHandle"/>
</div>
</template>

<script>

import Select from "../../components/elements/Select.vue"
import Input from "../../components/elements/Input.vue"
import datepicker from "vue3-datepicker"
import Button from "../../components/elements/Button.vue"
import SelectHeadVue from "@/components/parts/SelectHead.vue"
import { updateDocument } from '../../composable/components/DocumentsPeriod'

export default {
    name: "CollectedForm",
    data() {
        return {
            edit: false,
            collected: new Date(),
            approval: new Date(),
            more: "",
            changed: {},
            dataToShow: [
                { title: "Periode", valueFrom: "periode2"},
                { title: "Supervisor Name", valueFrom: "spvName"},
                { title: "Gudang", valueFrom: "warehouseName"},
                { title: "Shift", valueFrom: "shift"},
            ],
        }
    },
    methods: {
        recordChanged(key, ev) {
            this.changed[key] = ev
        },
        async editButtonHandle() {
            if(!this.edit) {
                this.edit = true
                return
            }
            await updateDocument(this.more.id, this.changed)
            this.$store.commit("Modal/tunnelMessage", true);
            this.$store.commit("Modal/active");
        }
    },
    components: {
        Input,
        datepicker,
        Select,
        Button,
        SelectHeadVue
    },
    watch: {
        collected(newVal, oldVal) {
            this.recordChanged('collected', newVal.getTime())
            this.recordChanged('status',  2)
        },
        approval(newVal, oldVal) {
            this.recordChanged('approval', newVal.getTime())
            this.recordChanged('status',  2)
        },
    },
    mounted() {
        this.more = this.$store.getters["Modal/obj"].obj
        this.collected = new Date(this.more.collected)
        this.approval = new Date(this.more.approval)
    },
}
</script>