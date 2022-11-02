<template>
<!-- Input text -->
<input v-if="render" type="text" :value="value" :placeholder="placeholder" @change="chose($event.target.value)" :class="className" list="item" />

<datalist id="item">
    <option v-for="list in dataListsItem" :key="list.id" :value="list" />
</datalist>

</template>

<script>
import { getAllItems, lists as stateItems } from '@/composable/components/Baseitem'
import { dateMonth } from '@/composable/piece/dateFormat'

export default {
    methods: {
        chose(ev) {
            if(ev.includes("*")) {
                this.$emit("chose", ev.split(" * ")[0])
            }
        }
    },
    data () {
        return {
            item: "",
            lists: stateItems,
            render: false
        }
    },
    computed: {
        className() {
            return this.class
        },
        dataListsItem() {
            return stateItems.map((item) => `${item.kode} * ${item.name} ${ item?.lastUsed ? 'Dipakai '+ dateMonth(item?.lastUsed) : 'Tidak dipakai'}`)
        }
    },
    emits: ["chose"],
    props: {
        class: String,
        placeholder: String,
        value: String,
        id: String,
    },
    name: "InputItem",
    async mounted() {
        await getAllItems()
        this.render = true
    },
}
</script>