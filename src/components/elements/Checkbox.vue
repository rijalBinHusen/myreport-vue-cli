<template>
    <input :id="label" class="w3-check" type="checkbox" @click="check()">
    <label :for="label" class="w3-margin-left"> {{ label }}</label>
    <p></p>
</template>

<script>
export default {
    name: "checkbox",
    props: {
        label: {
            type: String,
            required: true,
        }
    },
    emits: ["check"],
    methods: {
        check() {
            this.$emit("check", this.label)
        }
    }
}
</script>