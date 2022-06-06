<template>
    <div>
        <div>
            <!-- 
                name: allName[i].id, 
                periode: periodeTime,
                shift: allName[i].shift,
                head: all
            -->
            <Input label="Periode:" 
                placeholder="Periode" 
                class="w3-margin-bottom" 
                :value="$store.getters['dateFormat']({format:'dateMonth', time: record.periode})" 
                disabled 
                type="text"
            />

            <label for="shift">Edit shift:</label>
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
            />
            <label for="name">Edit nama:</label>
            <Select 
                id="name"
                :options="names" 
                judul="Supervisor"
                value="id"
                text="name"
                @selected="record.name = $event"
                :inselect="record.name"
            />
            <label for="head">Edit kabag:</label>
            <Select 
                id="head"
                :options="heads" 
                value="id"
                text="name"
                @selected="record.head = $event"
                :inselect="record.head"
            />
        </div>
        <Button primary value="Save"  class="w3-margin-top" type="button" @trig="save" />
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
            //close the modeal
            this.$store.commit("Modal/active")
            if(this.more.mode === "collected") {
                // get record from uncollected the state
                this.record.collected = this.$store.getters["dateFormat"]({format: this.more.time})
                this.record.shared = false
                this.record.status = 1
                    // console.log(info)
                this.$store.dispatch("update", {
                                store: "Document",
                                obj: this.record,
                                criteria: {id: this.record.id }
                            })
                return
            }
            this.$store.dispatch("update", {store: "Document", obj: this.record, criteria: {id: this.record.id} })
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
    updated() {
        console.log(this.record)
    },
    components: {
        Input,
        Select,
        Button,
    },
    name: "UncollectedEditForm",
}
</script>