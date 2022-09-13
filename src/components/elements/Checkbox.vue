<template>
    <input 
        :name="checkboxName" 
        :id="label" 
        class="w3-check" 
        type="checkbox" @click="check()"
        :checked="isChecked"
    >
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
        },
        value: {
            required: true,
        },
        checkboxName: {
            required: false
        },
        isChecked: Boolean
    },
    emits: ["check"],
    methods: {
        check() {
            this.$emit("check", this.value)
        }
    },
}
</script>