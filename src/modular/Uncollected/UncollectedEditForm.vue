<template>
    <div>
        <div>
            <Input label="Periode:" 
                placeholder="Periode" 
                class="w3-margin-bottom" 
                :value="$store.getters['dateFormat']({format:'dateMonth', time: record.periode})" 
                disabled 
                type="text"
            />

            <div v-if="more?.mode === 'edit' && more?.next" >
                <label for="next">Langkah selanjutnya:</label>
                <Select 
                    id="next"
                    judul="langkah selanjutnya"
                    :options="[
                        { id: 'collect', title: 'Koleksi'},
                        { id: 'ijin', title: 'Tidak masuk'},
                    ]" 
                    value="id"
                    text="title"
                    @selected="more.next = $event"
                    :inselect="more?.next"
                />
            </div>
            <div class="w3-row">
                
                <div class="w3-col s3">
                    <label v-if="more?.mode === 'edit'" for="name">Edit nama:</label>
                    <Select 
                        id="name"
                        :options="names" 
                        judul="Supervisor"
                        value="id"
                        text="name"
                        @selected="record.name = $event"
                        :inselect="record.name"
                        :disabled="more?.mode === 'view' "
                    />
                </div>
                
                <div class="w3-col s3" style="padding: 0 16px 0 16px;">
                    <label v-if="more?.mode === 'edit'" for="head">Edit kabag:</label>
                    <Select 
                        id="head"
                        :options="heads" 
                        value="id"
                        text="name"
                        @selected="record.head = $event"
                        :inselect="record.head"
                        :disabled="more?.mode === 'view' "
                    />
                </div>

                <div class="w3-col s3" style="padding: 0 16px 0 16px;">
                    <label v-if="more?.mode === 'edit'" for="shift">Edit shift:</label>
                    <Select 
                        id="shift"
                        judul="shift"
                        :options="[
                            { id:1, title: 'Shift 1'},
                            { id:2, title: 'Shift 2'},
                            { id:3, title: 'Shift 3'},
                        ]" 
                        value="id"
                        text="title"
                        @selected="record.shift = $event"
                        :inselect="record.shift"
                        :disabled="more?.mode === 'view' "
                    />
                </div>

                <div class="w3-col s3">
                    <label v-if="more?.mode === 'edit'" for="warehouse">Edit gudang:</label>
                    <Select 
                        id="warehouse"
                        judul="gudang"
                        :options="$store.state.Warehouses.lists" 
                        value="id"
                        text="name"
                        @selected="record.warehouse = $event"
                        :inselect="record?.warehouse"
                        :disabled="more?.mode === 'view' "
                    />
                </div>

            </div>
        </div>
        <Button primary value="Save" v-if="more?.mode === 'edit'"  class="w3-margin-top" type="button" @trig="save" />
    </div>
</template>

<script>

import Select from "../../components/elements/Select.vue"
import Input from "../../components/elements/Input.vue"
import Button from "../../components/elements/Button.vue"
import myfunction from "../../myfunction"

export default {
    methods: {
        save() {
            //close the modal
            this.$store.commit("Modal/active")
            if(this.more?.next === "collect") {
                this.$store.dispatch("update", {
                    store: "Document", 
                    obj: { 
                        ...this.record, 
                        collected: this.$store.getters["dateFormat"]({format: this.more?.time}),
                        status: 1
                    }, 
                    criteria: {id: this.record.id} 
                })
                return
            }

            else if(this.more?.next === "ijin") {
                this.$store.dispatch("Document/handleDocument", { 
                    action: 'ijin', 
                    rec: this. more?.id
                })
                return
            }
            this.$store.dispatch("update", {
                store: "Document", 
                obj: this.record, 
                criteria: {id: this.record.id} 
            })
        },
    },
    data() {
        return {
            record: {},
            more: "",
        }
    },
    computed: {
        names() {
            return this.$store.state.Supervisors.lists
        },
        heads() {
            return JSON.parse(JSON.stringify(this.$store.state.Headspv.lists))
        },
    },
    mounted() {
        this.record = this.$store.getters["Document/getId"](this.$store.getters["Modal/obj"].id)
        this.more = this.$store.getters["Modal/obj"]

    },
    components: {
        Input,
        Select,
        Button,
    },
    name: "UncollectedEditForm",
}
</script>