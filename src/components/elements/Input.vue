<template>
    <div :class="className">
        <label>{{ label }}</label>
        <input 
        @change="inp($event.target.value)" 
        @keyup="inp($event.target.value)"
        class="w3-input w3-border w3-margin-top" 
        :type="type" 
        :value="value"
        :placeholder="placeholder">
  </div>
</template>

<script>
// <Input label="Masukkan nama" placeholder="nama baru" class="w3-col s3" />

export default {
    name: "Input",
    props: {
        label: {
            type: String,
            required: true,
            },
        placeholder: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
        },
        value: String,
        class: String,
    },
    emits: ["inp"],
    methods: {
        inp(ev) {
            this.$emit("inp", ev)
        }
    },
    computed: {
        className() {
            return this.class
        }
    },
}
</script>