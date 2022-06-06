<template>
<!-- Input text -->
<input type="text" :placeholder="placeholder" @change="chose($event.target.value)" :class="className" list="item" />

<datalist id="item">
    <option v-for="list in lists" :key="list.kode" :value="list.kode + ' * ' + list.name" />
</datalist>

</template>

<script>
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
            lists: this.$store.state.Baseitem.lists,
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
}
</script>