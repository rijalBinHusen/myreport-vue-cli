<template>
<!-- Input text -->
<input type="text" :value="value" :placeholder="placeholder" @change="chose($event.target.value)" :class="className" list="item" />

<datalist id="item">
    <option v-for="list in lists" :key="list.kode" :value="list.kode + ' * ' + list.name" />
</datalist>

</template>

<script>
import { getAllItems, lists as stateItems } from '@/composable/components/Baseitem'

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
            lists: stateItems
        }
    },
    computed: {
        className() {
            return this.class
        }
    },
    emits: ["chose"],
    props: {
        class: String,
        placeholder: String,
        value: String,
    },
    name: "InputItem",
    async mounted() {
        await getAllItems()
    },
}
</script>